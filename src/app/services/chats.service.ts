import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {GetChatsGQL, GetChatGQL} from '../../graphql';

@Injectable()
export class ChatsService {
  messagesAmount = 3;

  constructor(
    private getChatsGQL: GetChatsGQL,
    private getChatGQL: GetChatGQL
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

  getChat(chatId: string) {
    const query = this.getChatGQL.watch({
      chatId: chatId,
    });

    const chat$ = query.valueChanges.pipe(
      map((result) => result.data.chat)
    );

    return {query, chat$};
  }
}
