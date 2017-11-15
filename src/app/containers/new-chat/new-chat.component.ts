import {Component, OnInit} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {AddChat, GetUsers} from '../../../types';
import {map} from 'rxjs/operators';
import {ApolloQueryResult} from 'apollo-client';
import {getUsersQuery} from '../../../graphql/getUsers.query';
import {Observable} from 'rxjs/Observable';
import {addChatMutation} from '../../../graphql/addChat.mutation';

@Component({
  template: `
    <app-toolbar>
      <button class="navigation" mat-button (click)="goBack()">
        <mat-icon aria-label="Icon-button with an arrow back icon">arrow_back</mat-icon>
      </button>
      <div class="title">New chat</div>
    </app-toolbar>

    <div class="new-group" (click)="goToNewGroup()">
      <div>
        <mat-icon aria-label="Icon-button with a group add icon">group_add</mat-icon>
      </div>
      <div>New group</div>
    </div>

    <app-users-list [users$]="users$" (newChat)="addChat($event)"></app-users-list>
  `,
  styleUrls: ['new-chat.component.scss'],
})
export class NewChatComponent implements OnInit {
  users$: Observable<GetUsers.Users[]>;

  constructor(private apollo: Apollo,
              private router: Router,
              private location: Location) {}

  ngOnInit () {
    const query = this.apollo.watchQuery<GetUsers.Query>({
      query: getUsersQuery,
    });

    this.users$ = query.valueChanges.pipe(
      map((result: ApolloQueryResult<GetUsers.Query>) => result.data.users)
    );
  }

  goBack() {
    this.location.back();
  }

  goToNewGroup() {
    this.router.navigate(['/new-group']);
  }

  addChat(recipientIds: number[]) {
    console.log(recipientIds);
    this.apollo.mutate({
      mutation: addChatMutation,
      variables: <AddChat.Variables>{
        recipientIds,
      }
    }).subscribe(res => console.log(res));
    this.router.navigate(['/chats']);
  }
}
