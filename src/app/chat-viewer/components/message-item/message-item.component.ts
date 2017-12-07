import {Component, Input} from '@angular/core';
import {GetChat} from '../../../../graphql';

@Component({
  selector: 'app-message-item',
  template: `
    <div class="message"
         [ngClass]="{'mine': message.ownership}">
      <div *ngIf="isGroup && !message.ownership" class="message-sender">{{ message.sender.name }}</div>
      <div>{{ message.content }}</div>
    </div>
  `,
  styleUrls: ['message-item.component.scss'],
})
export class MessageItemComponent {
  // tslint:disable-next-line:no-input-rename
  @Input('item')
  message: GetChat.Messages;

  @Input()
  isGroup: boolean;
}
