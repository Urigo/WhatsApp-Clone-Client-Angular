import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-message-item',
  template: `
    <div class="message"
         [ngClass]="message.ownership ? 'message-mine' : 'message-other'">
      <div *ngIf="isGroup && !message.ownership" class="message-sender">{{ message.sender.name }}</div>
      <div class="message-content">{{ message.content }}</div>
      <span class="message-timestamp">00:00</span>
    </div>
  `,
  styleUrls: ['message-item.component.scss'],
})
export class MessageItemComponent {
  // tslint:disable-next-line:no-input-rename
  @Input('item')
  message: any;

  @Input()
  isGroup: boolean;
}
