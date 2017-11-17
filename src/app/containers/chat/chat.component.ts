import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApolloQueryResult} from 'apollo-client';
import {Apollo} from 'apollo-angular';
import {AddMessage, GetChat, GetChats} from '../../../types';
import {map} from 'rxjs/operators';
import {getChatQuery} from '../../../graphql/getChat.query';
import {Observable} from 'rxjs/Observable';
import {addMessageMutation} from '../../../graphql/addMessage.mutation';
import {getChatsQuery} from '../../../graphql/getChats.query';
import * as moment from 'moment';
import {ChatsService} from '../../services/chats.service';

@Component({
  template: `
    <app-toolbar>
      <button class="navigation" mat-button (click)="goToChats()">
        <mat-icon aria-label="Icon-button with an arrow back icon">arrow_back</mat-icon>
      </button>
      <div class="title">{{ title$ | async }}</div>
    </app-toolbar>
    <div class="container">
      <app-messages-list [messages$]="messages$" [isGroup]="isGroup$ | async"></app-messages-list>
    <app-new-message (newMessage)="addMessage($event)"></app-new-message>
    </div>
  `,
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  chatId: string;
  messages$: Observable<GetChat.Messages[]>;
  title$: Observable<string>;
  isGroup$: Observable<boolean>;

  constructor(private apollo: Apollo,
              private route: ActivatedRoute,
              private router: Router,
              private chatsService: ChatsService) {}

  ngOnInit() {
    this.route.params.subscribe(({id: chatId}: {id: string}) => {
      this.chatId = chatId;
      this.messages$ = this.chatsService.getChat(chatId).messages$;
      this.title$ = this.chatsService.getChat(chatId).title$;
      this.isGroup$ = this.chatsService.getChat(chatId).isGroup$;
    });
  }

  goToChats() {
    this.router.navigate(['/chats']);
  }

  addMessage(content: string) {
    this.apollo.mutate({
      mutation: addMessageMutation,
      variables: <AddMessage.Variables>{
        chatId: this.chatId,
        content,
      },
      /*optimisticResponse: {
        __typename: 'Mutation',
        addMessage: {
          __typename: 'Message',
          senderId: 0,
          content: 'Placeholder',
          createdAt: moment().unix(),
          type: 0,
          recipients: [0],
          holderIds: [0],
        },
      },*/
      update: (store, { data: { addMessage } }: {data: AddMessage.Mutation}) => {
        // Update the messages cache
        {
          // Read the data from our cache for this query.
          const {chat}: GetChat.Query = store.readQuery({
            query: getChatQuery, variables: {
              chatId: this.chatId,
            }
          });
          // Add our comment from the mutation to the end.
          chat.messages.push(addMessage);
          // Write our data back to the cache.
          store.writeQuery({ query: getChatQuery, data: {chat} });
        }
        // Update last message
        {
          // Read the data from our cache for this query.
          const {chats}: GetChats.Query = store.readQuery({ query: getChatsQuery });
          // Add our comment from the mutation to the end.
          chats.find(chat => chat.id === this.chatId).lastMessage = addMessage;
          // Write our data back to the cache.
          store.writeQuery({ query: getChatsQuery, data: {chats} });
        }
      },
    }).subscribe();
  }
}
