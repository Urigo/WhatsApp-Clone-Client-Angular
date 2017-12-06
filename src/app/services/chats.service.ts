import {ApolloQueryResult} from 'apollo-client';
import {map} from 'rxjs/operators';
import {Apollo, QueryRef} from 'apollo-angular';
import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';
import {getChatsQuery} from '../../graphql/getChats.query';

@Injectable()
export class ChatsService {
  getChatsWQ: QueryRef<any>;
  chats$: Observable<any[]>;
  chats: any[];

  constructor(private apollo: Apollo) {
    this.getChatsWQ = this.apollo.watchQuery<any>({
      query: getChatsQuery
    });
    this.chats$ = this.getChatsWQ.valueChanges.pipe(
      map((result: ApolloQueryResult<any>) => result.data.chats)
    );
    this.chats$.subscribe(chats => this.chats = chats);
  }

  getChats() {
    return {query: this.getChatsWQ, chats$: this.chats$, chats: this.chats};
  }
}
