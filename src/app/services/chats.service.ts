import {ApolloQueryResult} from 'apollo-client';
import {map} from 'rxjs/operators';
import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {getChatsQuery} from '../../graphql/getChats.query';

@Injectable()
export class ChatsService {

  constructor(private apollo: Apollo) {}

  getChats() {
    const query = this.apollo.watchQuery<any>({
      query: getChatsQuery
    });
    const chats$ = query.valueChanges.pipe(
      map((result: ApolloQueryResult<any>) => result.data.chats)
    );

    return {query, chats$};
  }
}
