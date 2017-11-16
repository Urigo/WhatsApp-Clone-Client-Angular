import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AddChat, GetUsers} from '../../../types';
import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operators';

export interface SelectableUser extends GetUsers.Users {
  selected: boolean;
}

@Component({
  selector: 'app-users-list',
  template: `
    <mat-list>
      <mat-list-item *ngFor="let user of users">
        <app-user-item [user]="user" [selected]="user.selected" (select)="selectUsers($event)"></app-user-item>
      </mat-list-item>
    </mat-list>
  `,
  styleUrls: ['users-list.component.scss'],
})
export class UsersListComponent implements OnInit {
  @Input()
  users$: Observable<SelectableUser[]>;
  users: SelectableUser[];
  @Input()
  multipleSelection = false;

  selectedUserIds: string[] = [];

  @Output()
  newChat = new EventEmitter<string[]>();

  ngOnInit() {
    this.users$.pipe(map((users: SelectableUser[]) => users.map(user => {
        if (this.selectedUserIds.includes(user.id)) {
          // User is selected
          return {...user, selected: true};
        } else {
          return {...user, selected: false};
        }
      })))
      .subscribe((users: SelectableUser[]) => {
        this.users = users;
      });
  }

  selectUsers(selectedUser: SelectableUser) {
    if (selectedUser.selected) {
      this.selectedUserIds = this.selectedUserIds.filter(selectedUserId => selectedUserId !== selectedUser.id);
    } else {
      this.selectedUserIds = this.selectedUserIds.concat(selectedUser.id);
    }
    this.users = this.users.map(user => {
      if (user.id === selectedUser.id) {
        user = {...user, selected: !user.selected};
      }
      return user;
    });

    if (!this.multipleSelection) {
      this.newChat.emit(this.selectedUserIds);
    }
  }
}
