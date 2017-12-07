import {Component, Input} from '@angular/core';
import {GetChats} from '../../../../graphql';

@Component({
  selector: 'app-chats-list',
  template: `
    <mat-list>
      <mat-list-item *ngFor="let chat of chats">
        <app-chat-item [item]="chat"></app-chat-item>
      </mat-list-item>
    </mat-list>
  `,
  styleUrls: ['chats-list.component.scss'],
})
export class ChatsListComponent {
  // tslint:disable-next-line:no-input-rename
  @Input('items')
  chats: GetChats.Chats[];

  constructor() {}
}
