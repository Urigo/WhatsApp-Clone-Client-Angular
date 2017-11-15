import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApolloQueryResult} from 'apollo-client';
import {Apollo} from 'apollo-angular';
import {AddMessage, GetChat} from '../../../types';
import {map} from 'rxjs/operators';
import {getChatQuery} from '../../../graphql/getChat.query';
import {Observable} from 'rxjs/Observable';
import {Location} from '@angular/common';
import {addMessageMutation} from '../../../graphql/addMessage.mutation';

@Component({
  template: `
    <app-toolbar>
      <button class="navigation" mat-button (click)="goBack()">
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
  chatId: number;
  messages$: Observable<GetChat.Messages[]>;
  title$: Observable<string>;
  isGroup$: Observable<boolean>;

  constructor(private apollo: Apollo,
              private route: ActivatedRoute,
              private location: Location) {}

  ngOnInit() {
    this.route.params.subscribe(({id: chatId}: {id: number}) => {
      this.chatId = chatId;

      const query = this.apollo.watchQuery<GetChat.Query>({
        query: getChatQuery,
        variables: {
          chatId,
        }
      });

      this.messages$ = query.valueChanges.pipe(
        map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat.messages)
      );

      this.title$ = query.valueChanges.pipe(
        map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat.name)
      );

      this.isGroup$ = query.valueChanges.pipe(
        map((result: ApolloQueryResult<GetChat.Query>) => result.data.chat.isGroup)
      );
    });
  }

  goBack() {
    this.location.back();
  }

  addMessage(content: string) {
    this.apollo.mutate({
      mutation: addMessageMutation,
      variables: <AddMessage.Variables>{
        chatId: this.chatId,
        content,
      }
    }).subscribe(res => console.log(res));
  }
}
