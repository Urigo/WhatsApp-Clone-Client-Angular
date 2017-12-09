import {Component, OnInit} from '@angular/core';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {AddGroup, GetUsers} from '../../../../types';
import {ChatsService} from '../../../services/chats.service';

@Component({
  template: `
    <app-toolbar>
      <button class="navigation" mat-button (click)="goBack()">
        <mat-icon aria-label="Icon-button with an arrow back icon">arrow_back</mat-icon>
      </button>
      <div class="title">New group</div>
    </app-toolbar>

    <app-users-list *ngIf="!recipientIds.length" [items]="users"
                    appSelectableList="multiple_tap" (multiple)="selectUsers($event)">
      <app-confirm-selection #confirmSelection icon="arrow_forward"></app-confirm-selection>
    </app-users-list>
    <app-new-group-details *ngIf="recipientIds.length" [users]="getSelectedUsers()"
                           (groupDetails)="addGroup($event)"></app-new-group-details>
  `,
  styleUrls: ['new-group.component.scss'],
})
export class NewGroupComponent implements OnInit {
  users: GetUsers.Users[];
  recipientIds: string[] = [];

  constructor(private router: Router,
              private location: Location,
              private chatsService: ChatsService) {}

  ngOnInit () {
    this.chatsService.getUsers().users$.subscribe(users => this.users = users);
  }

  goBack() {
    if (this.recipientIds.length) {
      this.recipientIds = [];
    } else {
      this.location.back();
    }
  }

  selectUsers(recipientIds: string[]) {
    this.recipientIds = recipientIds;
  }

  getSelectedUsers() {
    return this.users.filter(user => this.recipientIds.includes(user.id));
  }

  addGroup(groupName: string) {
    if (groupName && this.recipientIds.length) {
      this.chatsService.addGroup(this.recipientIds, groupName).subscribe(({data: {addGroup: {id}}}: { data: AddGroup.Mutation }) => {
        this.router.navigate(['/chat', id]);
      });
    }
  }
}
