import {Injectable} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {getChatsQuery} from '../../graphql/getChats.query';
import {AddChat, GetChat, GetChats, GetUsers} from '../../types';
import {getUsersQuery} from '../../graphql/getUsers.query';
import {ApolloQueryResult} from 'apollo-client';
import {map} from 'rxjs/operators';
import {getChatQuery} from '../../graphql/getChat.query';
import {addChatMutation} from '../../graphql/addChat.mutation';

const currentUser = '1';

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

    const messages$ = query.valueChanges.pipe(
      map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat.messages)
    );

    const title$ = query.valueChanges.pipe(
      map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat.name)
    );

    const isGroup$ = query.valueChanges.pipe(
      map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat.isGroup)
    );

    return {query, messages$, title$, isGroup$};
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
      // To be removed
      /*optimisticResponse: {
        __typename: 'Mutation',
        addChat: {
          __typename: 'Chat',
          id: String(Math.round(Math.random() * 1000000000000)),
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
      return !chat.isGroup && chat.userIds.includes(currentUser) && chat.userIds.includes(recipientId);
    });
    return _chat ? _chat.id : false;
  }
}
