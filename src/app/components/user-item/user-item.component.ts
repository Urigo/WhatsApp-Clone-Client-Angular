import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SelectableUser} from '../users-list/users-list.component';

@Component({
  selector: 'app-user-item',
  template: `
    <button mat-menu-item (click)="emitSelected()" [ngClass]="{selected: user.selected}">
      <div>
        <img [src]="user.picture" *ngIf="user.picture">
      </div>
      <div>{{ user.name }}</div>
    </button>
  `,
  styleUrls: ['user-item.component.scss']
})
export class UserItemComponent {
  @Input()
  user: SelectableUser;
  @Input()
  selected: false;

  @Output()
  select = new EventEmitter<SelectableUser>();

  emitSelected() {
    this.select.emit(this.user);
  }
}
