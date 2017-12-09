import {Component, Input} from '@angular/core';
import {GetUsers} from '../../../../types';

@Component({
  selector: 'app-user-item',
  template: `
    <button mat-menu-item>
      <div>
        <img [src]="user.picture" *ngIf="user.picture">
      </div>
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
