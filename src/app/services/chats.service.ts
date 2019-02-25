import {ApolloQueryResult, FetchMoreOptions, FetchMoreQueryOptions, MutationOptions, WatchQueryOptions} from 'apollo-client';
import {concat, map, share, switchMap} from 'rxjs/operators';
import {Apollo, QueryRef} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {getChatsQuery} from '../../graphql/getChats.query';
import {
  AddChat, AddGroup, AddMessage, GetChat, GetChats, GetUsers, MessageAdded, MoreMessages, RemoveAllMessages, RemoveChat,
  RemoveMessages
} from '../../types';
import {getChatQuery} from '../../graphql/getChat.query';
import {addMessageMutation} from '../../graphql/addMessage.mutation';
import {removeChatMutation} from '../../graphql/removeChat.mutation';
import {DocumentNode} from 'graphql';
import {removeAllMessagesMutation} from '../../graphql/removeAllMessages.mutation';
import {removeMessagesMutation} from '../../graphql/removeMessages.mutation';
import {getUsersQuery} from '../../graphql/getUsers.query';
import {Observable, AsyncSubject, of} from 'rxjs';
import {addChatMutation} from '../../graphql/addChat.mutation';
import {addGroupMutation} from '../../graphql/addGroup.mutation';
import * as moment from 'moment';
import {FetchResult} from 'apollo-link';
import {LoginService} from '../login/services/login.service';
import {chatAddedSubscription} from '../../graphql/chatAdded.subscription';
import {messageAddedSubscription} from '../../graphql/messageAdded.subscription';
import {moreMessagesQuery} from '../../graphql/moreMessages.query';

@Injectable()
export class ChatsService {
  chatsMessagesAmount = 2;
  chatMessagesAmount = 5;
  getChatsWq: QueryRef<GetChats.Query>;
  chats$: Observable<GetChats.Chats[]>;
  chats: GetChats.Chats[];
  getChatWqSubject: AsyncSubject<QueryRef<GetChat.Query>>;
  addChat$: Observable<FetchResult<AddChat.Mutation | AddGroup.Mutation>>;

  constructor(private apollo: Apollo,
              private loginService: LoginService) {
    this.getChatsWq = this.apollo.watchQuery<GetChats.Query>(<WatchQueryOptions>{
      query: getChatsQuery,
      variables: {
        amount: this.chatsMessagesAmount,
      },
    });

    this.getChatsWq.subscribeToMore({
      document: chatAddedSubscription,
      variables: {
        amount: this.chatsMessagesAmount,
      },
      updateQuery: (prev: GetChats.Query, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const newChat: GetChats.Chats = subscriptionData.data.chatAdded;

        return Object.assign({}, prev, {
          chats: [...prev.chats, newChat]
        });
      }
    });

    this.getChatsWq.subscribeToMore({
      document: messageAddedSubscription,
      updateQuery: (prev: GetChats.Query, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const newMessage: MessageAdded.MessageAdded = subscriptionData.data.messageAdded;

        // We need to update the cache for both Chat and Chats. The following updates the cache for Chat.
        try {
          // Read the data from our cache for this query.
          const {chat}: GetChat.Query = this.apollo.getClient().readQuery({
            query: getChatQuery, variables: {
              chatId: newMessage.chat.id,
              amount: this.chatMessagesAmount,
            }
          });

          // Add our message from the mutation to the end.
          chat.messageFeed.messages.push(newMessage);
          // Write our data back to the cache.
          this.apollo.getClient().writeQuery({
            query: getChatQuery,
            variables: {chatId: newMessage.chat.id, amount: this.chatMessagesAmount},
            data: {chat} });
        } catch {
          console.error('The chat we received an update for does not exist in the store');
        }

        return Object.assign({}, prev, {
          chats: [...prev.chats.map(chat => chat.id === newMessage.chat.id ? {
            ...chat, messageFeed: {...chat.messageFeed, messages: [...chat.messageFeed.messages, newMessage]}
          } : chat)]
        });
      }
    });

    this.chats$ = this.getChatsWq.valueChanges.pipe(
      map((result: ApolloQueryResult<GetChats.Query>) => result.data.chats)
    );
    this.chats$.subscribe(chats => this.chats = chats);
  }

  static getRandomId() {
    return String(Math.round(Math.random() * 1000000000000));
  }

  getChats() {
    return {query: this.getChatsWq, chats$: this.chats$};
  }

  getChat(chatId: string, oui?: boolean, amount?: number) {
    const _chat = this.chats && this.chats.find(chat => chat.id === chatId) || {
      id: chatId,
      name: '',
      picture: null,
      allTimeMembers: [],
      unreadMessages: 0,
      isGroup: false,
      messageFeed: {
        hasNextPage: false,
        cursor: null,
        messages: [],
      },
    };
    const chat$FromCache = of<GetChat.Chat>(_chat);

    const getApolloWatchQuery = (id: string) => {
      return this.apollo.watchQuery<GetChat.Query>({
        query: getChatQuery,
        variables: {
          chatId: id,
          amount: this.chatMessagesAmount,
        }
      });
    };

    let chat$: Observable<GetChat.Chat>;
    this.getChatWqSubject = new AsyncSubject();

    if (oui) {
      chat$ = chat$FromCache.pipe(
        concat(this.addChat$.pipe(
          switchMap(({ data: { addChat, addGroup } }) => {
            const query = getApolloWatchQuery(addChat ? addChat.id : addGroup.id);
            this.getChatWqSubject.next(query);
            this.getChatWqSubject.complete();
            return query.valueChanges.pipe(
              map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
            );
          }))
        ));
    } else {
      const query = getApolloWatchQuery(chatId);
      this.getChatWqSubject.next(query);
      this.getChatWqSubject.complete();
      chat$ = chat$FromCache.pipe(
        concat(query.valueChanges.pipe(
          map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
        )));
    }

    return {query$: this.getChatWqSubject.asObservable(), chat$};
  }

  moreMessages(query: QueryRef<GetChat.Query>, chatId: string) {
    const {data: {chat: {messageFeed}}} = query.getLastResult();
    if (messageFeed.hasNextPage) {
      query.fetchMore({
        query: moreMessagesQuery,
        variables: {
          chatId,
          amount: this.chatMessagesAmount,
          before: messageFeed.cursor,
        },
        updateQuery: (previousResult: GetChat.Query, { fetchMoreResult }) => {
          return {
            chat: {
              ...previousResult.chat,
              messageFeed: {
                ...fetchMoreResult.chat.messageFeed,
                messages: [
                  ...fetchMoreResult.chat.messageFeed.messages,
                  ...previousResult.chat.messageFeed.messages,
                ],
              },
            },
          };
        },
      });
    }
  }

  addMessage(chatId: string, content: string) {
    return this.apollo.mutate(<MutationOptions>{
      mutation: addMessageMutation,
      variables: <AddMessage.Variables>{
        chatId,
        content,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        addMessage: {
          id: ChatsService.getRandomId(),
          __typename: 'Message',
          chat: {
            id: chatId,
            __typename: 'Chat',
          },
          sender: {
            id: this.loginService.getUser().id,
            __typename: 'User',
            name: this.loginService.getUser().name,
          },
          content,
          createdAt: new Date(),
          type: 0,
          recipients: [],
          ownership: true,
        },
      },
      update: (store, { data: { addMessage } }: {data: AddMessage.Mutation}) => {
        // Update the messages cache
        {
          // Read the data from our cache for this query.
          const {chat}: GetChat.Query = store.readQuery({
            query: getChatQuery, variables: {
              chatId,
              amount: this.chatMessagesAmount,
            }
          });
          // Add our message from the mutation to the end.
          chat.messageFeed.messages.push(addMessage);
          // Write our data back to the cache.
          store.writeQuery({ query: getChatQuery, variables: {chatId, amount: this.chatMessagesAmount}, data: {chat} });
        }
        // Update last message cache
        {
          // Read the data from our cache for this query.
          const {chats}: GetChats.Query = store.readQuery({
            query: getChatsQuery,
            variables: <GetChats.Variables>{
              amount: this.chatsMessagesAmount,
            },
          });
          // Add our comment from the mutation to the end.
          chats.find(chat => chat.id === chatId).messageFeed.messages.push(addMessage);
          // Write our data back to the cache.
          store.writeQuery({
            query: getChatsQuery,
            variables: <GetChats.Variables>{
              amount: this.chatsMessagesAmount,
            },
            data: {
              chats,
            },
          });
        }
      },
    });
  }

  removeChat(chatId: string) {
    return this.apollo.mutate({
      mutation: removeChatMutation,
      variables: <RemoveChat.Variables>{
        chatId,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        removeChat: chatId,
      },
      update: (store, { data: { removeChat } }) => {
        // Read the data from our cache for this query.
        const {chats}: GetChats.Query = store.readQuery({
          query: getChatsQuery,
          variables: <GetChats.Variables>{
            amount: this.chatsMessagesAmount,
          },
        });
        // Remove the chat (mutable)
        for (const index of chats.keys()) {
          if (chats[index].id === removeChat) {
            chats.splice(index, 1);
          }
        }
        // Write our data back to the cache.
        store.writeQuery({
          query: getChatsQuery,
          variables: <GetChats.Variables>{
            amount: this.chatsMessagesAmount,
          },
          data: {
            chats,
          },
        });
      },
    });
  }

  removeMessages(chatId: string, messages: GetChat.Messages[], messageIdsOrAll: string[] | boolean) {
    let variables: RemoveMessages.Variables | RemoveAllMessages.Variables;
    let ids: string[] = [];
    let mutation: DocumentNode;

    if (typeof messageIdsOrAll === 'boolean') {
      variables = {chatId, all: messageIdsOrAll} as RemoveAllMessages.Variables;
      ids = messages.map(message => message.id);
      mutation = removeAllMessagesMutation;
    } else {
      variables = {chatId, messageIds: messageIdsOrAll} as RemoveMessages.Variables;
      ids = messageIdsOrAll;
      mutation = removeMessagesMutation;
    }

    return this.apollo.mutate(<MutationOptions>{
      mutation,
      variables,
      optimisticResponse: {
        __typename: 'Mutation',
        removeMessages: ids,
      },
      update: (store, { data: { removeMessages } }: {data: RemoveMessages.Mutation | RemoveAllMessages.Mutation}) => {
        // Update the messages cache
        {
          // Read the data from our cache for this query.
          const {chat}: GetChat.Query = store.readQuery({
            query: getChatQuery, variables: {
              chatId,
              amount: this.chatMessagesAmount,
            }
          });
          // Remove the messages (mutable)
          removeMessages.forEach(messageId => {
            for (const index of chat.messageFeed.messages.keys()) {
              if (chat.messageFeed.messages[index].id === messageId) {
                chat.messageFeed.messages.splice(index, 1);
              }
            }
          });
          // Write our data back to the cache.
          store.writeQuery({ query: getChatQuery, variables: {chatId, amount: this.chatMessagesAmount}, data: {chat} });
        }
        // Update last message cache
        {
          // Read the data from our cache for this query.
          const {chats}: GetChats.Query = store.readQuery({
            query: getChatsQuery,
            variables: <GetChats.Variables>{
              amount: this.chatsMessagesAmount,
            },
          });
          // Fix last message
          chats.find(chat => chat.id === chatId).messageFeed.messages = messages
            .filter(message => !ids.includes(message.id))
            .sort((a, b) => Number(b.createdAt) - Number(a.createdAt)) || [];
          // Write our data back to the cache.
          store.writeQuery({
            query: getChatsQuery,
            variables: <GetChats.Variables>{
              amount: this.chatsMessagesAmount,
            },
            data: {
              chats,
            },
          });
        }
      },
    });
  }

  getUsers() {
    const query = this.apollo.watchQuery<GetUsers.Query>(<WatchQueryOptions>{
      query: getUsersQuery,
    });
    const users$ = query.valueChanges.pipe(
      map((result: ApolloQueryResult<GetUsers.Query>) => result.data.users)
    );

    return {query, users$};
  }

  // Checks if the chat is listed for the current user and returns the id
  getChatId(recipientId: string) {
    const _chat = this.chats.find(chat => {
      return !chat.isGroup && !!chat.allTimeMembers.find(user => user.id === this.loginService.getUser().id) &&
        !!chat.allTimeMembers.find(user => user.id === recipientId);
    });
    return _chat ? _chat.id : false;
  }

  addChat(recipientId: string, users: GetUsers.Users[], ouiId: string) {
    this.addChat$ = this.apollo.mutate({
      mutation: addChatMutation,
      variables: <AddChat.Variables>{
        recipientId,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        addChat: {
          id: ouiId,
          __typename: 'Chat',
          name: users.find(user => user.id === recipientId).name,
          picture: users.find(user => user.id === recipientId).picture,
          allTimeMembers: [
            {
              id: this.loginService.getUser().id,
              __typename: 'User',
            },
            {
              id: recipientId,
              __typename: 'User',
            }
          ],
          unreadMessages: 0,
          messageFeed: {
            __typename: 'MessageFeed',
            hasNextPage: false,
            cursor: null,
            messages: [],
          },
          isGroup: false,
        },
      },
      update: (store, { data: { addChat } }) => {
        // Read the data from our cache for this query.
        const {chats}: GetChats.Query = store.readQuery({
          query: getChatsQuery,
          variables: <GetChats.Variables>{
            amount: this.chatsMessagesAmount,
          },
        });
        // Add our comment from the mutation to the end.
        chats.push(addChat);
        // Write our data back to the cache.
        store.writeQuery({
          query: getChatsQuery,
          variables: <GetChats.Variables>{
            amount: this.chatsMessagesAmount,
          },
          data: {
            chats,
          },
        });
      },
    }).pipe(share());
    return this.addChat$;
  }

  addGroup(recipientIds: string[], groupName: string, ouiId: string) {
    this.addChat$ = this.apollo.mutate({
      mutation: addGroupMutation,
      variables: <AddGroup.Variables>{
        recipientIds,
        groupName,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        addGroup: {
          id: ouiId,
          __typename: 'Chat',
          name: groupName,
          picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
          userIds: [this.loginService.getUser().id, recipientIds],
          allTimeMembers: [
            {
              id: this.loginService.getUser().id,
              __typename: 'User',
            },
            ...recipientIds.map(id => ({id, __typename: 'User'})),
          ],
          unreadMessages: 0,
          messageFeed: {
            __typename: 'MessageFeed',
            hasNextPage: false,
            cursor: null,
            messages: [],
          },
          isGroup: true,
        },
      },
      update: (store, { data: { addGroup } }) => {
        // Read the data from our cache for this query.
        const {chats}: GetChats.Query = store.readQuery({
          query: getChatsQuery,
          variables: <GetChats.Variables>{
            amount: this.chatsMessagesAmount,
          },
        });
        // Add our comment from the mutation to the end.
        chats.push(addGroup);
        // Write our data back to the cache.
        store.writeQuery({
          query: getChatsQuery,
          variables: <GetChats.Variables>{
            amount: this.chatsMessagesAmount,
          },
          data: {
            chats,
          },
        });
      },
    }).pipe(share());
    return this.addChat$;
  }
}
