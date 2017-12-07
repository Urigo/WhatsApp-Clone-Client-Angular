import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-confirm-selection',
  template: `
    <button mat-fab color="primary" (click)="handleClick()">
      <mat-icon aria-label="Icon-button">{{ icon }}</mat-icon>
    </button>
  `,
  styleUrls: ['./confirm-selection.component.scss'],
})
export class ConfirmSelectionComponent {
  @Input()
  icon = 'delete';
  @Output()
  emitClick = new EventEmitter<null>();

  handleClick() {
    this.emitClick.emit();
  }
}
