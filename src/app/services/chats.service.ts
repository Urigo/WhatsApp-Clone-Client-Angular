import {ApolloQueryResult, WatchQueryOptions} from 'apollo-client';
import {map} from 'rxjs/operators';
import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {getChatsQuery} from '../../graphql/getChats.query';
import {GetChat, GetChats} from '../../types';
import {getChatQuery} from '../../graphql/getChat.query';

@Injectable()
export class ChatsService {
  messagesAmount = 3;

  constructor(private apollo: Apollo) {}

  getChats() {
    const query = this.apollo.watchQuery<GetChats.Query>(<WatchQueryOptions>{
      query: getChatsQuery,
      variables: {
        amount: this.messagesAmount,
      },
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
        chatId: chatId,
      }
    });

    const chat$ = query.valueChanges.pipe(
      map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat)
    );

    return {query, chat$};
  }
}
