import {concat, map, share, switchMap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {Observable, AsyncSubject, of} from 'rxjs';
import {Apollo, QueryRef} from 'apollo-angular';
import * as moment from 'moment';
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

const currentUserId = '1';
const currentUserName = 'Ethan Gonzalez';

@Injectable()
export class ChatsService {
  messagesAmount = 3;
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
    private apollo: Apollo,
    private loginService: LoginService
  ) {
    this.getChatsWq = this.getChatsGQL.watch({
      amount: this.messagesAmount,
    });

    this.getChatsWq.subscribeToMore({
      document: this.chatAddedGQL.document,
      updateQuery: (prev: GetChats.Query, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const newChat: GetChats.Chats = (<any>subscriptionData).data.chatAdded;

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

        const newMessage: MessageAdded.MessageAdded = (<any>subscriptionData).data.messageAdded;

        // We need to update the cache for both Chat and Chats. The following updates the cache for Chat.
        try {
          // Read the data from our cache for this query.
          const {chat}: GetChat.Query = this.apollo.getClient().readQuery({
            query: this.getChatGQL.document,
            variables: {
              chatId: newMessage.chat.id,
            }
          });

          // Add our message from the mutation to the end.
          chat.messages.push(newMessage);
          // Write our data back to the cache.
          this.apollo.getClient().writeQuery({
            query: this.getChatGQL.document,
            data: {
              chat
            }
          });
        } catch {
          console.error('The chat we received an update for does not exist in the store');
        }

        return Object.assign({}, prev, {
          chats: [...prev.chats.map(_chat =>
            _chat.id === newMessage.chat.id ? {..._chat, messages: [..._chat.messages, newMessage]} : _chat)]
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

  getChat(chatId: string, oui?: boolean) {
    const _chat = this.chats && this.chats.find(chat => chat.id === chatId) || {
      id: chatId,
      name: '',
      picture: null,
      allTimeMembers: [],
      unreadMessages: 0,
      isGroup: false,
      messages: [],
    };
    const chat$FromCache = of<GetChat.Chat>(_chat);

    const getApolloWatchQuery = (id: string) => {
      return this.getChatGQL.watch({
        chatId: id,
      });
    };

    let chat$: Observable<GetChat.Chat>;
    this.getChatWqSubject = new AsyncSubject();

    if (oui) {
      chat$ = chat$FromCache.pipe(
        concat(this.addChat$.pipe(
          switchMap(({ data }) => {
            const id = (<AddChat.Mutation>data).addChat ? (<AddChat.Mutation>data).addChat.id : (<AddGroup.Mutation>data).addGroup.id;
            const query = getApolloWatchQuery(id);

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

  addMessage(chatId: string, content: string) {
    return this.addMessageGQL.mutate({
      chatId,
      content,
    }, {
      optimisticResponse: {
        __typename: 'Mutation',
        addMessage: {
          __typename: 'Message',
          id: ChatsService.getRandomId(),
          chat: {
            __typename: 'Chat',
            id: chatId,
          },
          sender: {
            __typename: 'User',
            id: this.loginService.getUser().id,
            name: this.loginService.getUser().name,
          },
          content,
          createdAt: moment().unix(),
          type: 1,
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
            }
          });
          // Add our message from the mutation to the end.
          chat.messages.push(addMessage);
          // Write our data back to the cache.
          store.writeQuery({
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
              amount: this.messagesAmount,
            },
          });
          // Add our comment from the mutation to the end.
          chats.find(chat => chat.id === chatId).messages.push(addMessage);
          // Write our data back to the cache.
          store.writeQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
              amount: this.messagesAmount,
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
              amount: this.messagesAmount,
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
              amount: this.messagesAmount,
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
              amount: this.messagesAmount,
            },
          });
          // Fix last message
          chats.find(chat => chat.id === chatId).messages = messages
            .filter(message => !ids.includes(message.id));
          // Write our data back to the cache.
          store.writeQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
              amount: this.messagesAmount,
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
  getChatId(userId: string) {
    const _chat = this.chats.find(chat => {
      return !chat.isGroup && !!chat.allTimeMembers.find(user => user.id === this.loginService.getUser().id) &&
        !!chat.allTimeMembers.find(user => user.id === userId);
    });
    return _chat ? _chat.id : false;
  }

  addChat(userId: string, users: GetUsers.Users[], ouiId: string) {
    this.addChat$ = this.addChatGQL.mutate(
      {
        userId,
      }, {
        optimisticResponse: {
          __typename: 'Mutation',
          addChat: {
            __typename: 'Chat',
            id: ouiId,
            name: users.find(user => user.id === userId).name,
            picture: users.find(user => user.id === userId).picture,
            allTimeMembers: [
              {
                id: this.loginService.getUser().id,
                __typename: 'User',
              },
              {
                id: userId,
                __typename: 'User',
              }
            ],
            unreadMessages: 0,
            messages: [],
            isGroup: false,
          },
        },
        update: (store, { data: { addChat } }) => {
          // Read the data from our cache for this query.
          const {chats} = store.readQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
              amount: this.messagesAmount,
            },
          });
          // Add our comment from the mutation to the end.
          chats.push(addChat);
          // Write our data back to the cache.
          store.writeQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
              amount: this.messagesAmount,
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

  addGroup(userIds: string[], groupName: string, ouiId: string) {
    this.addChat$ = this.addGroupGQL.mutate(
      {
        userIds,
        groupName,
      }, {
        optimisticResponse: {
          __typename: 'Mutation',
          addGroup: {
            __typename: 'Chat',
            id: ouiId,
            name: groupName,
            picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
            userIds: [this.loginService.getUser().id, userIds],
            allTimeMembers: [
              {
                id: this.loginService.getUser().id,
                __typename: 'User',
              },
              ...userIds.map(id => ({id, __typename: 'User'})),
            ],
            unreadMessages: 0,
            messages: [],
            isGroup: true,
          },
        },
        update: (store, { data: { addGroup } }) => {
          // Read the data from our cache for this query.
          const {chats} = store.readQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
              amount: this.messagesAmount,
            },
          });
          // Add our comment from the mutation to the end.
          chats.push(addGroup);
          // Write our data back to the cache.
          store.writeQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
              amount: this.messagesAmount,
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
