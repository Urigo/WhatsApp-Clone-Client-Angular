import {ApolloQueryResult} from 'apollo-client';
import {map} from 'rxjs/operators';
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

const currentUserId = '1';

@Injectable()
export class ChatsService {
  getChatsWq: QueryRef<GetChats.Query>;
  chats$: Observable<GetChats.Chats[]>;
  chats: GetChats.Chats[];

  constructor(private apollo: Apollo) {
    this.getChatsWq = this.apollo.watchQuery<GetChats.Query>({
      query: getChatsQuery
    });
    this.chats$ = this.getChatsWq.valueChanges.pipe(
      map((result: ApolloQueryResult<GetChats.Query>) => result.data.chats)
    );
    this.chats$.subscribe(chats => this.chats = chats);
  }

  getChats() {
    return {query: this.getChatsWq, chats$: this.chats$};
  }

  getChat(chatId: string) {
    const query = this.apollo.watchQuery<GetChat.Query>({
      query: getChatQuery,
      variables: {
        chatId: chatId,
      }
    });

    const chat$ = query.valueChanges.pipe(
      map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
    );

    return {query, chat$};
  }

  addMessage(chatId: string, content: string) {
    return this.apollo.mutate({
      mutation: addMessageMutation,
      variables: <AddMessage.Variables>{
        chatId,
        content,
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

  addChat(recipientId: string) {
    return this.apollo.mutate({
      mutation: addChatMutation,
      variables: <AddChat.Variables>{
        recipientId,
      },
      update: (store, { data: { addChat } }) => {
        // Read the data from our cache for this query.
        const {chats}: GetChats.Query = store.readQuery({ query: getChatsQuery });
        // Add our comment from the mutation to the end.
        chats.push(addChat);
        // Write our data back to the cache.
        store.writeQuery({ query: getChatsQuery, data: {chats} });
      },
    });
  }

  addGroup(recipientIds: string[], groupName: string) {
    return this.apollo.mutate({
      mutation: addGroupMutation,
      variables: <AddGroup.Variables>{
        recipientIds,
        groupName,
      },
      update: (store, { data: { addGroup } }) => {
        // Read the data from our cache for this query.
        const {chats}: GetChats.Query = store.readQuery({ query: getChatsQuery });
        // Add our comment from the mutation to the end.
        chats.push(addGroup);
        // Write our data back to the cache.
        store.writeQuery({ query: getChatsQuery, data: {chats} });
      },
    });
  }
}
