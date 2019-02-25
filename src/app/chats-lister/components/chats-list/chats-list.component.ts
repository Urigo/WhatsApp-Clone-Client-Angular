import {Component, Input} from '@angular/core';
import {GetChats} from '../../../../types';
import {SelectableListDirective} from 'ngx-selectable-list';

@Component({
  selector: 'app-chats-list',
  template: `
    <mat-list>
      <mat-list-item *ngFor="let chat of chats">
        <app-chat-item [item]="chat"
                       libSelectableItem></app-chat-item>
      </mat-list-item>
    </mat-list>
    <ng-content *ngIf="selectableListDirective.selecting"></ng-content>
  `,
  styleUrls: ['chats-list.component.scss'],
})
export class ChatsListComponent {
  // tslint:disable-next-line:no-input-rename
  @Input('items')
  chats: GetChats.Chats[];

  constructor(public selectableListDirective: SelectableListDirective) {}
}
