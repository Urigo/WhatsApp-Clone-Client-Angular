import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {GetChats} from '../../../types';

@Component({
  selector: 'app-chats-list',
  template: `
    <mat-list>
      <mat-list-item *ngFor="let chat of chats$ | async">
        <app-chat-item [chat]="chat" (view)="goToChat($event)"></app-chat-item>
      </mat-list-item>
    </mat-list>
  `,
  styleUrls: ['chats-list.component.scss'],
})
export class ChatsListComponent {
  @Input()
  chats$: Observable<GetChats.Chats[]>;
  chats: GetChats.Chats[];

  @Output()
  view = new EventEmitter<string>();

  goToChat(chatId: string) {
    this.view.emit(chatId);
  }
}
