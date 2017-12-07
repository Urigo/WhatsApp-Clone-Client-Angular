import {Component, Input} from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-message-item',
  template: `
    <div class="message"
         [ngClass]="message.ownership ? 'message-mine' : 'message-other'">
      <div *ngIf="isGroup && !message.ownership" class="message-sender">{{ message.sender.name }}</div>
      <div class="message-content">{{ message.content }}</div>
      <span class="message-timestamp">{{ createdAt }}</span>
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

  createdAt: string;

  ngOnInit() {
    this.createdAt = moment(this.message.createdAt).format('HH:mm');
  }
}
