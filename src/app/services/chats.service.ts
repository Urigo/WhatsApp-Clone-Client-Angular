import {concat, map, share, switchMap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {Observable, AsyncSubject, of} from 'rxjs';
import {Apollo, QueryRef} from 'apollo-angular';
import {
  GetChatsGQL,
  GetChatGQL,
  AddMessageGQL,
  RemoveChatGQL,
  RemoveMessagesGQL,
  RemoveAllMessagesGQL,
  GetUsersGQL,
  AddChatGQL,
  AddGroupGQL,
  ChatAddedGQL,
  MessageAddedGQL,
  MoreMessagesGQL,
  AddMessage,
  GetChats,
  GetChat,
  RemoveMessages,
  RemoveAllMessages,
  GetUsers,
  AddChat,
  AddGroup,
  MessageAdded,
} from '../../graphql';
import { DataProxy } from 'apollo-cache';
import { FetchResult } from 'apollo-link';
import {LoginService} from '../login/services/login.service';

@Injectable()
export class ChatsService {
  chatsMessagesAmount = 2;
  chatMessagesAmount = 5;
  getChatsWq: QueryRef<GetChats.Query, GetChats.Variables>;
  chats$: Observable<GetChats.Chats[]>;
  chats: GetChats.Chats[];
  getChatWqSubject: AsyncSubject<QueryRef<GetChat.Query>>;
  addChat$: Observable<FetchResult<AddChat.Mutation | AddGroup.Mutation>>;

  constructor(
    private getChatsGQL: GetChatsGQL,
    private getChatGQL: GetChatGQL,
    private addMessageGQL: AddMessageGQL,
    private removeChatGQL: RemoveChatGQL,
    private removeMessagesGQL: RemoveMessagesGQL,
    private removeAllMessagesGQL: RemoveAllMessagesGQL,
    private getUsersGQL: GetUsersGQL,
    private addChatGQL: AddChatGQL,
    private addGroupGQL: AddGroupGQL,
    private chatAddedGQL: ChatAddedGQL,
    private messageAddedGQL: MessageAddedGQL,
    private moreMessagesGQL: MoreMessagesGQL,
    private apollo: Apollo,
    private loginService: LoginService
  ) {
    this.getChatsWq = this.getChatsGQL.watch({
      amount: this.chatsMessagesAmount,
    });

    this.getChatsWq.subscribeToMore({
      document: this.chatAddedGQL.document,
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
      document: this.messageAddedGQL.document,
      updateQuery: (prev: GetChats.Query, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const newMessage: MessageAdded.MessageAdded = subscriptionData.data.messageAdded;

        // We need to update the cache for both Chat and Chats. The following updates the cache for Chat.
        try {
          // Read the data from our cache for this query.
          const {chat}: GetChat.Query = this.apollo.getClient().readQuery({
            query: this.getChatGQL.document,
            variables: {
              chatId: newMessage.chat.id,
              amount: this.chatMessagesAmount,
            }
          });

          // Add our message from the mutation to the end.
          chat.messageFeed.messages.push(newMessage);
          // Write our data back to the cache.
          this.apollo.getClient().writeQuery({
            query: this.getChatGQL.document,
            variables: {
              chatId: newMessage.chat.id,
              amount: this.chatMessagesAmount
            },
            data: {
              chat
            }
          });
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
      map((result) => result.data.chats)
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
      return this.getChatGQL.watch({
        chatId: id,
        amount: this.chatMessagesAmount,
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
              map((result) => result.data.chat)
            );
          }))
        ));
    } else {
      const query = getApolloWatchQuery(chatId);

      this.getChatWqSubject.next(query);
      this.getChatWqSubject.complete();

      chat$ = chat$FromCache.pipe(
        concat(
          query.valueChanges.pipe(
            map((result) => result.data.chat)
          )
        )
      );
    }

    return {query$: this.getChatWqSubject.asObservable(), chat$};
  }

  moreMessages(query: QueryRef<GetChat.Query>, chatId: string) {
    const {data: {chat: {messageFeed}}} = query.getLastResult();
    if (messageFeed.hasNextPage) {
      query.fetchMore({
        query: this.moreMessagesGQL.document,
        variables: {
          chatId,
          amount: this.chatMessagesAmount,
          before: messageFeed.cursor,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
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
    return this.addMessageGQL.mutate({
      chatId,
      content,
    }, {
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
          const {chat} = store.readQuery<GetChat.Query, GetChat.Variables>({
            query: this.getChatGQL.document,
            variables: {
              chatId,
              amount: this.chatMessagesAmount,
            }
          });
          // Add our message from the mutation to the end.
          chat.messageFeed.messages.push(addMessage);
          // Write our data back to the cache.
          store.writeQuery({
            query: this.getChatGQL.document,
            variables: {
              chatId,
              amount: this.chatMessagesAmount
            },
            data: {
              chat
            }
          });
        }
        // Update last message cache
        {
          // Read the data from our cache for this query.
          const {chats} = store.readQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
              amount: this.chatsMessagesAmount,
            },
          });
          // Add our comment from the mutation to the end.
          chats.find(chat => chat.id === chatId).messageFeed.messages.push(addMessage);
          // Write our data back to the cache.
          store.writeQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
              amount: this.chatsMessagesAmount,
            },
            data: {
              chats,
            },
          });
        }
      }
    });
  }

  removeChat(chatId: string) {
    return this.removeChatGQL.mutate(
      {
        chatId,
      }, {
        optimisticResponse: {
          __typename: 'Mutation',
          removeChat: chatId,
        },
        update: (store, { data: { removeChat } }) => {
          // Read the data from our cache for this query.
          const {chats} = store.readQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
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
          store.writeQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
              amount: this.chatsMessagesAmount,
            },
            data: {
              chats,
            },
          });
        },
      }
    );
  }

  removeMessages(chatId: string, messages: GetChat.Messages[], messageIdsOrAll: string[] | boolean) {
    let ids: string[] = [];

    const options = {
      optimisticResponse: () => ({
        __typename: 'Mutation',
        removeMessages: ids,
      }),
      update: (store: DataProxy, { data: { removeMessages } }: {data: RemoveMessages.Mutation | RemoveAllMessages.Mutation}) => {
        // Update the messages cache
        {
          // Read the data from our cache for this query.
          const {chat} = store.readQuery<GetChat.Query, GetChat.Variables>({
            query: this.getChatGQL.document,
            variables: {
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
          store.writeQuery<GetChat.Query, GetChat.Variables>({
            query: this.getChatGQL.document,
            data: {
              chat
            }
          });
        }
        // Update last message cache
        {
          // Read the data from our cache for this query.
          const {chats} = store.readQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
              amount: this.chatsMessagesAmount,
            },
          });
          // Fix last message
          chats.find(chat => chat.id === chatId).messageFeed.messages = messages
            .filter(message => !ids.includes(message.id))
            .sort((a, b) => Number(b.createdAt) - Number(a.createdAt)) || [];
          // Write our data back to the cache.
          store.writeQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
              amount: this.chatsMessagesAmount,
            },
            data: {
              chats,
            },
          });
        }
      }
    };

    if (typeof messageIdsOrAll === 'boolean') {
      ids = messages.map(message => message.id);

      return this.removeAllMessagesGQL.mutate({
        chatId,
        all: messageIdsOrAll
      }, options);
    } else {
      ids = messageIdsOrAll;

      return this.removeMessagesGQL.mutate({
        chatId,
        messageIds: messageIdsOrAll,
      }, options);
    }
  }

  getUsers() {
    const query = this.getUsersGQL.watch();
    const users$ = query.valueChanges.pipe(
      map((result) => result.data.users)
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
    this.addChat$ = this.addChatGQL.mutate(
      {
        recipientId,
      }, {
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
          const {chats} = store.readQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
              amount: this.chatsMessagesAmount,
            },
          });
          // Add our comment from the mutation to the end.
          chats.push(addChat);
          // Write our data back to the cache.
          store.writeQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
              amount: this.chatsMessagesAmount,
            },
            data: {
              chats,
            },
          });
        },
      }
    ).pipe(share());
    return this.addChat$;
  }

  addGroup(recipientIds: string[], groupName: string, ouiId: string) {
    this.addChat$ = this.addGroupGQL.mutate(
      {
        recipientIds,
        groupName,
      }, {
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
          const {chats} = store.readQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
              amount: this.chatsMessagesAmount,
            },
          });
          // Add our comment from the mutation to the end.
          chats.push(addGroup);
          // Write our data back to the cache.
          store.writeQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
              amount: this.chatsMessagesAmount,
            },
            data: {
              chats,
            },
          });
        },
      }
    ).pipe(share());
    return this.addChat$;
  }
}
