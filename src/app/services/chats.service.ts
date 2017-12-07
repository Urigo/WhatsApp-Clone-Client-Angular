import {map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {
  GetChatsGQL,
  GetChatGQL,
  AddMessageGQL,
  AddMessage,
  GetChats,
  GetChat
} from '../../graphql';

@Injectable()
export class ChatsService {
  messagesAmount = 10;

  constructor(
    private getChatsGQL: GetChatsGQL,
    private getChatGQL: GetChatGQL,
    private addMessageGQL: AddMessageGQL
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

  addMessage(chatId: string, content: string) {
    return this.addMessageGQL.mutate({
      chatId,
      content,
    }, {
      update: (store, { data: { addMessage } }: {data: AddMessage.Mutation}) => {
        // Update the messages cache
        {
          // Read the data from our cache for this query.
          const {chat} = store.readQuery<GetChat.Query, GetChat.Variables>({
            query: this.getChatGQL.document,
            variables: {
              chatId,
            }
          });
          if (!chat.messages.some(message => message.id === addMessage.id)) {
            // Add our message from the mutation to the end.
            chat.messages.push(addMessage);
            // Write our data back to the cache.
            store.writeQuery({
              query: this.getChatGQL.document,
              data: {
                chat
              }
            });
          }
        }
        // Update last message cache
        {
          // Read the data from our cache for this query.
          const {chats} = store.readQuery<GetChats.Query, GetChats.Variables>({
            query: this.getChatsGQL.document,
            variables: {
              amount: this.messagesAmount,
            },
          });
          const chat = chats.find(chat => chat.id === chatId);
          // Add our comment from the mutation to the end.
          if (!chat.messages.some(message => message.id === addMessage.id)) {
            // Move chat to the top of the list
            const index = chats.findIndex(candi => candi.id === chat.id)
            chats.splice(index, 1)
            chats.unshift(chat)
            // Write our data back to the cache.
            store.writeQuery<GetChats.Query, GetChats.Variables>({
              query: this.getChatsGQL.document,
              variables: {
                amount: this.messagesAmount,
              },
              data: {
                chats,
              },
            });
          }
        }
      }
    });
  }
}
