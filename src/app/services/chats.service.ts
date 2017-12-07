import {ApolloQueryResult} from 'apollo-client';
import {map} from 'rxjs/operators';
import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {getChatsQuery} from '../../graphql/getChats.query';
import {GetChats} from '../../types';
import {getChatQuery} from '../../graphql/getChat.query';

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
    const query = this.apollo.watchQuery<any>({
      query: getChatQuery,
      variables: {
        chatId: chatId,
      }
    });

    const chat$ = query.valueChanges.pipe(
      map((result: ApolloQueryResult<any>) => result.data.chat)
    );

    return {query, chat$};
  }
}
