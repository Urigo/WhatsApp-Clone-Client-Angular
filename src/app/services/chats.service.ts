import {map} from 'rxjs/operators';
import {Apollo} from 'apollo-angular';
import {Injectable} from '@angular/core';
import {getChatsQuery} from '../../graphql/getChats.query';
import {GetChats} from '../../graphql';

@Injectable()
export class ChatsService {
  messagesAmount = 3;

  constructor(private apollo: Apollo) {}

  getChats() {
    const query = this.apollo.watchQuery<GetChats.Query>({
      query: getChatsQuery,
      variables: {
        amount: this.messagesAmount,
      },
    });
    const chats$ = query.valueChanges.pipe(
      map((result) => result.data.chats)
    );

    return {query, chats$};
  }
}
