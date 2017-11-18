import {Injectable} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {getChatsQuery} from '../../graphql/getChats.query';
import {AddChat, AddMessage, GetChat, GetChats, GetUsers} from '../../types';
import {getUsersQuery} from '../../graphql/getUsers.query';
import {ApolloQueryResult} from 'apollo-client';
import {map} from 'rxjs/operators';
import {getChatQuery} from '../../graphql/getChat.query';
import {addChatMutation} from '../../graphql/addChat.mutation';
import {addMessageMutation} from '../../graphql/addMessage.mutation';
import * as moment from 'moment';

const currentUserId = '1';
const currentUserName = 'Ethan Gonzalez';

function getRandomId() {
  return String(Math.round(Math.random() * 1000000000000));
}

@Injectable()
export class ChatsService {
  constructor(private apollo: Apollo) {}

  getChats() {
    const query = this.apollo.watchQuery<GetChats.Query>({
      query: getChatsQuery
    });

    const chats$ = query.valueChanges.pipe(
      map((result: ApolloQueryResult<GetChats.Query>) => result.data.chats)
    );

    return {query, chats$};
  }

  getChat(chatId: string) {
    const query = this.apollo.watchQuery<GetChat.Query>({
      query: getChatQuery,
      variables: {
        chatId,
      }
    });

    const chat$ = query.valueChanges.pipe(
      map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
    );

    const messages$ = chat$.pipe(
      map((result: GetChat.Chat) => result.messages)
    );

    const title$ = chat$.pipe(
      map((result: GetChat.Chat) => result.name)
    );

    const isGroup$ = chat$.pipe(
      map((result: GetChat.Chat) => result.isGroup)
    );

    return {query, chat$, messages$, title$, isGroup$};
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

  addChat(recipientId: string) {
    return this.apollo.mutate({
      mutation: addChatMutation,
      variables: <AddChat.Variables>{
        recipientId,
      },
      /*optimisticResponse: {
        __typename: 'Mutation',
        addChat: {
          __typename: 'Chat',
          id: getRandomId(),
          name: this.users.find(user => user.id === recipientIds[0]).name,
          picture: this.users.find(user => user.id === recipientIds[0]).picture,
          unreadMessages: 0,
          lastMessage: null,
          isGroup: false,
        },
      },*/
      update: (store, { data: { addChat } }) => {
        // Read the data from our cache for this query.
        const data: GetChats.Query = store.readQuery({ query: getChatsQuery });
        // Add our comment from the mutation to the end.
        data.chats.push(addChat);
        // Write our data back to the cache.
        store.writeQuery({ query: getChatsQuery, data });
      },
    });
  }

  // Checks if the chat is listed for the current user and returns the id
  getChatId(recipientId: string, chats: GetChats.Chats[]) {
    const _chat = chats.find(chat => {
      return !chat.isGroup && chat.userIds.includes(currentUserId) && chat.userIds.includes(recipientId);
    });
    return _chat ? _chat.id : false;
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
          id: getRandomId(),
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
          // Add our comment from the mutation to the end.
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
}
