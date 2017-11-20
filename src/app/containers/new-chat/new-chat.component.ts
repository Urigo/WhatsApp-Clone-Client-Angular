import {Component, OnInit} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {GetUsers} from '../../../types';
import {Observable} from 'rxjs/Observable';
import {ChatsService} from '../../services/chats.service';

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
  users: GetUsers.Users[];

  constructor(private apollo: Apollo,
              private router: Router,
              private location: Location,
              private chatsService: ChatsService) {}

  ngOnInit () {
    this.users$ = this.chatsService.getUsers().users$;
    this.users$.subscribe(users => this.users = users);
  }

  goBack() {
    this.location.back();
  }

  goToNewGroup() {
    this.router.navigate(['/new-group']);
  }

  addChat([recipientId]: string[]) {
    const chatId = this.chatsService.getChatId(recipientId);
    if (chatId) {
      // Chat is already listed for the current user
      this.router.navigate(['/chat', chatId]);
    } else {
      // Generate id for Optimistic UI
      const ouiId = ChatsService.getRandomId();
      this.chatsService.addChat(recipientId, ouiId, this.users).subscribe();
      this.router.navigate(['/chat/oui', ouiId]);
    }
  }
}
