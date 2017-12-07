import {Component, EventEmitter, Input, Output} from '@angular/core';
import * as moment from 'moment';
import {GetChats} from '../../../../graphql';

@Component({
  selector: 'app-chat-item',
  template: `
    <div class="chat-row" (click)="selectChat()">
      <img class="chat-pic" [src]="chat.picture || 'assets/default-profile-pic.jpg'">
      <div class="chat-info">
        <div class="chat-name">{{ chat.name }}</div>
        <div class="chat-last-message">{{ chat.messages[chat.messages.length - 1]?.content }}</div>
        <div class="chat-timestamp">{{ updatedAt }}</div>
      </div>
    </div>
  `,
  styleUrls: ['chat-item.component.scss'],
})
export class ChatItemComponent {
  // tslint:disable-next-line:no-input-rename
  @Input('item')
  chat: GetChats.Chats;

  @Output()
  select = new EventEmitter<string>();

  updatedAt: string;

  ngOnInit() {
    this.updatedAt = this.chat.updatedAt
      ? moment(this.chat.updatedAt).format('HH:mm') : '';
  }

  selectChat() {
    this.select.emit(this.chat.id);
  }
}
