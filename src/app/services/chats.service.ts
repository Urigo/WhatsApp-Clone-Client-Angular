import {ApolloQueryResult} from 'apollo-client';
import {concat, map, share, switchMap} from 'rxjs/operators';
import {Apollo, QueryRef} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {getChatsQuery} from '../../graphql/getChats.query';
import {AddChat, AddGroup, AddMessage, GetChat, GetChats, GetUsers, RemoveAllMessages, RemoveChat, RemoveMessages} from '../../types';
import {getChatQuery} from '../../graphql/getChat.query';
import {addMessageMutation} from '../../graphql/addMessage.mutation';
import {removeChatMutation} from '../../graphql/removeChat.mutation';
import {DocumentNode} from 'graphql';
import {removeAllMessagesMutation} from '../../graphql/removeAllMessages.mutation';
import {removeMessagesMutation} from '../../graphql/removeMessages.mutation';
import {getUsersQuery} from '../../graphql/getUsers.query';
import {Observable} from 'rxjs/Observable';
import {addChatMutation} from '../../graphql/addChat.mutation';
import {addGroupMutation} from '../../graphql/addGroup.mutation';
import * as moment from 'moment';
import {AsyncSubject} from 'rxjs/AsyncSubject';
import {of} from 'rxjs/observable/of';
import {FetchResult} from 'apollo-link';

const currentUserId = '1';
const currentUserName = 'Ethan Gonzalez';

@Injectable()
export class ChatsService {
  getChatsWq: QueryRef<GetChats.Query>;
  chats$: Observable<GetChats.Chats[]>;
  chats: GetChats.Chats[];
  getChatWqSubject: AsyncSubject<QueryRef<GetChat.Query>>;
  addChat$: Observable<FetchResult<AddChat.Mutation | AddGroup.Mutation>>;

  constructor(private apollo: Apollo) {
    this.getChatsWq = this.apollo.watchQuery<GetChats.Query>({
      query: getChatsQuery
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

  getChat(chatId: string, oui?: boolean) {
    const _chat = this.chats && this.chats.find(chat => chat.id === chatId) || null;
    const chat$FromCache = of<GetChat.Chat>({
      id: chatId,
      name: this.chats ? _chat.name : '',
      picture: this.chats ? _chat.picture : '',
      isGroup: this.chats ? _chat.isGroup : false,
      messages: this.chats && _chat.lastMessage ? [_chat.lastMessage] : [],
    });

    const getApolloWatchQuery = (id: string) => {
      return this.apollo.watchQuery<GetChat.Query>({
        query: getChatQuery,
        variables: {
          chatId: id,
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

  addMessage(chatId: string, content: string) {
    return this.apollo.mutate({
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
          senderId: currentUserId,
          sender: {
            id: currentUserId,
            __typename: 'User',
            name: currentUserName,
          },
          content,
          createdAt: moment().unix(),
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
            }
          });
          // Add our message from the mutation to the end.
          chat.messages.push(addMessage);
          // Write our data back to the cache.
          store.writeQuery({ query: getChatQuery, data: {chat} });
        }
        // Update last message cache
        {
          // Read the data from our cache for this query.
          const {chats}: GetChats.Query = store.readQuery({ query: getChatsQuery });
          // Add our comment from the mutation to the end.
          chats.find(chat => chat.id === chatId).lastMessage = addMessage;
          // Write our data back to the cache.
          store.writeQuery({ query: getChatsQuery, data: {chats} });
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
        const {chats}: GetChats.Query = store.readQuery({ query: getChatsQuery });
        // Remove the chat (mutable)
        for (const index of chats.keys()) {
          if (chats[index].id === removeChat) {
            chats.splice(index, 1);
          }
        }
        // Write our data back to the cache.
        store.writeQuery({ query: getChatsQuery, data: {chats} });
      },
    });
  }

  removeMessages(chatId: string, messages: GetChat.Messages[], messageIdsOrAll: string[] | boolean) {
    let variables: RemoveMessages.Variables | RemoveAllMessages.Variables;
    let ids: string[];
    let mutation: DocumentNode;

    if (typeof messageIdsOrAll === 'boolean') {
      variables = {chatId, all: messageIdsOrAll};
      ids = messages.map(message => message.id);
      mutation = removeAllMessagesMutation;
    } else {
      variables = {chatId, messageIds: messageIdsOrAll};
      ids = messageIdsOrAll;
      mutation = removeMessagesMutation;
    }

    return this.apollo.mutate({
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
            }
          });
          // Remove the messages (mutable)
          removeMessages.forEach(messageId => {
            for (const index of chat.messages.keys()) {
              if (chat.messages[index].id === messageId) {
                chat.messages.splice(index, 1);
              }
            }
          });
          // Write our data back to the cache.
          store.writeQuery({ query: getChatQuery, data: {chat} });
        }
        // Update last message cache
        {
          // Read the data from our cache for this query.
          const {chats}: GetChats.Query = store.readQuery({ query: getChatsQuery });
          // Fix last comment
          chats.find(chat => chat.id === chatId).lastMessage = messages
            .filter(message => !ids.includes(message.id))
            .sort((a, b) => b.createdAt - a.createdAt)[0] || null;
          // Write our data back to the cache.
          store.writeQuery({ query: getChatsQuery, data: {chats} });
        }
      },
    });
  }

  getUsers() {
    const query = this.apollo.watchQuery<GetUsers.Query>({
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
      return !chat.isGroup && chat.userIds.includes(currentUserId) && chat.userIds.includes(recipientId);
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
          userIds: [currentUserId, recipientId],
          unreadMessages: 0,
          lastMessage: null,
          isGroup: false,
        },
      },
      update: (store, { data: { addChat } }) => {
        // Read the data from our cache for this query.
        const {chats}: GetChats.Query = store.readQuery({ query: getChatsQuery });
        // Add our comment from the mutation to the end.
        chats.push(addChat);
        // Write our data back to the cache.
        store.writeQuery({ query: getChatsQuery, data: {chats} });
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
          userIds: [currentUserId, recipientIds],
          unreadMessages: 0,
          lastMessage: null,
          isGroup: true,
        },
      },
      update: (store, { data: { addGroup } }) => {
        // Read the data from our cache for this query.
        const {chats}: GetChats.Query = store.readQuery({ query: getChatsQuery });
        // Add our comment from the mutation to the end.
        chats.push(addGroup);
        // Write our data back to the cache.
        store.writeQuery({ query: getChatsQuery, data: {chats} });
      },
    }).pipe(share());
    return this.addChat$;
  }
}
