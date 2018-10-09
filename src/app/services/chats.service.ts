import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {GetChatsGQL} from '../../graphql';

@Injectable()
export class ChatsService {
  messagesAmount = 3;

  constructor(
    private getChatsGQL: GetChatsGQL
  ) {}

  getChats() {
    const query = this.getChatsGQL.watch({
      amount: this.messagesAmount,
    });
    const chats$ = query.valueChanges.pipe(
      map((result) => result.data.chats)
    );

    return {query, chats$};
  }
}
