import {Component, EventEmitter, Input, Output} from '@angular/core';
import {GetChats} from '../../../../graphql';

@Component({
  selector: 'app-chat-item',
  template: `
    <div class="chat-row" (click)="selectChat()">
      <img class="chat-pic" [src]="chat.picture || 'assets/default-profile-pic.jpg'">
      <div class="chat-info">
        <div class="chat-name">{{ chat.name }}</div>
        <div class="chat-last-message">{{ chat.messages[chat.messages.length - 1]?.content }}</div>
        <div class="chat-timestamp">00:00</div>
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

  selectChat() {
    this.select.emit(this.chat.id);
  }
}
