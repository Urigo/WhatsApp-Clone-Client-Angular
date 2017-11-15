import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApolloQueryResult} from 'apollo-client';
import {Apollo} from 'apollo-angular';
import {GetChat} from '../../../types';
import {map} from 'rxjs/operators';
import {getChatQuery} from '../../../graphql/getChat.query';
import {Observable} from 'rxjs/Observable';
import {Location} from '@angular/common';

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
    <div class="new-message">New message</div>
    </div>
  `,
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages$: Observable<GetChat.Messages[]>;
  title$: Observable<string>;
  isGroup$: Observable<boolean>;

  constructor(private apollo: Apollo,
              private route: ActivatedRoute,
              private location: Location) {}

  ngOnInit() {
    this.route.params.pipe(map(data => data.id)).subscribe(chatId => {
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
}
