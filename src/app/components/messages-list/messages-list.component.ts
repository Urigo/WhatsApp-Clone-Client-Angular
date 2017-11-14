import {Component, Input} from '@angular/core';
import {GetChat} from '../../../types';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-messages-list',
  template: `
    <mat-list>
      <mat-list-item *ngFor="let message of messages$ | async">
        <app-message-item [message]="message" [isGroup]="isGroup"></app-message-item>
      </mat-list-item>
    </mat-list>
  `,
  styleUrls: ['messages-list.component.scss'],
})
export class MessagesListComponent {
  @Input()
  messages$: Observable<GetChat.Messages[]>;

  @Input()
  isGroup: boolean;
}
