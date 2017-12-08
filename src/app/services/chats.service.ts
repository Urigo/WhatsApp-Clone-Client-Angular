import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {QueryRef} from 'apollo-angular';
import * as moment from 'moment';
import {
  GetChatsGQL,
  GetChatGQL,
  AddMessageGQL,
  RemoveChatGQL,
  RemoveMessagesGQL,
  RemoveAllMessagesGQL,
  GetUsersGQL,
  UserAddedGQL,
  AddChatGQL,
  AddGroupGQL,
  AddMessage,
  GetChats,
  GetChat,
  RemoveMessages,
  RemoveAllMessages,
  GetUsers,
} from '../../graphql';
import { DataProxy } from 'apollo-cache';

const currentUserId = '1';
const currentUserName = 'Ethan Gonzalez';

@Injectable()
export class ChatsService {
  messagesAmount = 10;
  getChatsWq: QueryRef<GetChats.Query, GetChats.Variables>;
  getUsersWq: QueryRef<GetUsers.Query, GetUsers.Variables>;
  chats$: Observable<GetChats.Chats[]>;
  chats: GetChats.Chats[];
  users$: Observable<GetUsers.Users[]>;
  users: GetUsers.Users[];

  constructor(
    private getChatsGQL: GetChatsGQL,
    private getChatGQL: GetChatGQL,
    private addMessageGQL: AddMessageGQL,
    private removeChatGQL: RemoveChatGQL,
    private removeMessagesGQL: RemoveMessagesGQL,
    private removeAllMessagesGQL: RemoveAllMessagesGQL,
    private getUsersGQL: GetUsersGQL,
    private userAddedGQL: UserAddedGQL,
    private addChatGQL: AddChatGQL,
    private addGroupGQL: AddGroupGQL
  ) {
    this.getChatsWq = this.getChatsGQL.watch({
      amount: this.messagesAmount,
    });
    this.chats$ = this.getChatsWq.valueChanges.pipe(
      map((result) => result.data.chats)
    );
    this.chats$.subscribe(chats => this.chats = chats);

    this.getUsersWq = this.getUsersGQL.watch();

    this.getUsersWq.subscribeToMore({
      document: this.userAddedGQL.document,
      updateQuery: (prev: GetUsers.Query, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const newUser: GetUsers.Users = (<any>subscriptionData).data.userAdded;

        if (!prev.users.some(user => user.id === newUser.id)) {
          return Object.assign({}, prev, {
            users: [...prev.users, newUser]
          });
        }
      }
    });

    this.users$ = this.getUsersWq.valueChanges.pipe(
      map((result) => result.data.users)
    );
    this.users$.subscribe(users => this.users = users);
  }

  static getRandomId() {
    return String(Math.round(Math.random() * 1000000000000));
  }

  getChats() {
    return {query: this.getChatsWq, chats$: this.chats$};
  }

  getChat(chatId: string) {
    const query = this.getChatGQL.watch({
      chatId: chatId,
    });

    const chat$ = query.valueChanges.pipe(
      map((result) => result.data.chat)
    );

    return {query, chat$};
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
            id: currentUserId,
            name: currentUserName,
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
          if (!chat.messages.some(message => message.id === addMessage.id)) {
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
          const chat = chats.find(chat => chat.id === chatId);
          // Add our comment from the mutation to the end.
          if (!chat.messages.some(message => message.id === addMessage.id)) {
            // Move chat to the top of the list
            const index = chats.findIndex(candi => candi.id === chat.id)
            chats.splice(index, 1)
            chats.unshift(chat)
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

  removeMessages(chatId: string, messages: GetChat.Messages[], messagesIdsOrAll: string[] | boolean) {
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

    if (typeof messagesIdsOrAll === 'boolean') {
      ids = messages.map(message => message.id);

      return this.removeAllMessagesGQL.mutate({
        chatId,
        all: messagesIdsOrAll
      }, options);
    } else {
      ids = messagesIdsOrAll;

      return this.removeMessagesGQL.mutate({
        chatId,
        messagesIds: messagesIdsOrAll,
      }, options);
    }
  }

  getUsers() {
    return {query: this.getUsersWq, users$: this.users$};
  }

  // Checks if the chat is listed for the current user and returns the id
  getChatId(recipientId: string) {
    const _chat = this.chats.find(chat => {
      return !chat.isGroup && !!chat.allTimeMembers.find(user => user.id === currentUserId) &&
        !!chat.allTimeMembers.find(user => user.id === recipientId);
    });
    return _chat ? _chat.id : false;
  }

  addChat(recipientId: string, users: GetUsers.Users[]) {
    return this.addChatGQL.mutate(
      {
        recipientId,
      }, {
        optimisticResponse: {
          __typename: 'Mutation',
          addChat: {
            __typename: 'Chat',
            id: ChatsService.getRandomId(),
            name: users.find(user => user.id === recipientId).name,
            picture: users.find(user => user.id === recipientId).picture,
            allTimeMembers: [
              {
                id: currentUserId,
                __typename: 'User',
              },
              {
                id: recipientId,
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
          if (!chats.some(chat => chat.id === addChat.id)) {
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
          }
        },
      }
    );
  }

  addGroup(recipientIds: string[], groupName: string) {
    return this.addGroupGQL.mutate(
      {
        recipientIds,
        groupName,
      }, {
        optimisticResponse: {
          __typename: 'Mutation',
          addGroup: {
            __typename: 'Chat',
            id: ChatsService.getRandomId(),
            name: groupName,
            picture: 'https://randomuser.me/api/portraits/thumb/lego/1.jpg',
            userIds: [currentUserId, recipientIds],
            allTimeMembers: [
              {
                id: currentUserId,
                __typename: 'User',
              },
              ...recipientIds.map(id => ({id, __typename: 'User'})),
            ],
            unreadMessages: 0,
            messages: [],
            updatedAt: moment().unix(),
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
          if (!chats.some(chat => chat.id === addGroup.id)) {
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
          }
        },
      }
    );
  }
}
