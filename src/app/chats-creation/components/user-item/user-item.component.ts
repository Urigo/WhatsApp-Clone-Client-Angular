import {Component, Input} from '@angular/core';
import {GetUsers} from '../../../../graphql';

@Component({
  selector: 'app-user-item',
  template: `
    <button mat-menu-item>
      <img [src]="user.picture || 'assets/default-profile-pic.jpg'">
      <div>{{ user.name }}</div>
    </button>
  `,
  styleUrls: ['user-item.component.scss']
})
export class UserItemComponent {
  // tslint:disable-next-line:no-input-rename
  @Input('item')
  user: GetUsers.Users;
}
