import {Component, Input} from '@angular/core';
import {GetChat} from '../../../types';

@Component({
  selector: 'app-message-item',
  template: `
    <div class="container">
      <div class="message-row" [ngClass]="{'mine': message.ownership}">
        <div *ngIf="this.isGroup && !this.message.ownership" class="message-sender">{{ this.message.sender.name }}</div>
        <div class="message-content">{{ message.content }}</div>
      </div>
    </div>
  `,
  styleUrls: ['message-item.component.scss'],
})
export class MessageItemComponent {
  @Input()
  message: GetChat.Messages;

  @Input()
  isGroup: boolean;
}
