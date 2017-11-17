import {Component, EventEmitter, Input, Output} from '@angular/core';
import {GetChats} from '../../../types';

@Component({
  selector: 'app-chat-item',
  template: `
    <button mat-menu-item class="chat-row" (click)="goToChat()">
        <div class="chat-recipient">
          <img [src]="chat.picture" width="48" height="48">
          <div>{{ chat.name }} [id: {{ chat.id }}]</div>
        </div>
        <div class="chat-content">{{ chat.lastMessage?.content }}</div>
    </button>
  `,
  styleUrls: ['chat-item.component.scss'],
})
export class ChatItemComponent {
  @Input()
  chat: GetChats.Chats;

  @Output()
  view = new EventEmitter<string>();

  goToChat() {
    this.view.emit(this.chat.id);
  }
}
