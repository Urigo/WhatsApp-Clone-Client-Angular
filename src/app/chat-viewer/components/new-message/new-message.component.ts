import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-new-message',
  template: `
    <input type="text" placeholder="Type a message" [(ngModel)]="message" (keyup)="onInputKeyup($event)"/>
    <button mat-button (click)="emitMessage()" [disabled]="disabled">
      <mat-icon aria-label="Icon-button with a send icon">send</mat-icon>
    </button>
  `,
  styleUrls: ['new-message.component.scss'],
})
export class NewMessageComponent {
  @Input()
  disabled: boolean;

  @Output()
  newMessage = new EventEmitter<string>();

  message = '';

  onInputKeyup({ keyCode }: KeyboardEvent) {
    if (keyCode === 13) {
      this.emitMessage();
    }
  }

  emitMessage() {
    if (this.message && !this.disabled) {
      this.newMessage.emit(this.message);
      this.message = '';
    }
  }
}
