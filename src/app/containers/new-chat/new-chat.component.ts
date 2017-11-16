import {Component, OnInit} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {AddChat, GetChats, GetUsers} from '../../../types';
import {map} from 'rxjs/operators';
import {ApolloQueryResult} from 'apollo-client';
import {getUsersQuery} from '../../../graphql/getUsers.query';
import {Observable} from 'rxjs/Observable';
import {addChatMutation} from '../../../graphql/addChat.mutation';
import {getChatsQuery} from '../../../graphql/getChats.query';

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

  addChat(recipientIds: string[]) {
    this.apollo.mutate({
      mutation: addChatMutation,
      variables: <AddChat.Variables>{
        recipientIds,
      },
      update: (store, { data: { addChat } }) => {
        // Read the data from our cache for this query.
        const data: GetChats.Query = store.readQuery({ query: getChatsQuery });
        // Add our comment from the mutation to the end.
        console.log(addChat);
        data.chats.push(addChat);
        // Write our data back to the cache.
        store.writeQuery({ query: getChatsQuery, data });
      },
    }).subscribe(res => {
      this.router.navigate(['/chats']);
    });
  }
}
