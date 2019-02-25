import {Component, EventEmitter, Input, Output} from '@angular/core';
import {GetUsers} from '../../../../graphql';

@Component({
  selector: 'app-new-group-details',
  template: `
    <div>
      <mat-form-field>
        <input matInput placeholder="Group name" [(ngModel)]="groupName">
      </mat-form-field>
    </div>
    <button [disabled]="!groupName" class="new-group" mat-fab color="primary" (click)="emitGroupDetails()">
      <mat-icon aria-label="Icon-button with a + icon">arrow_forward</mat-icon>
    </button>
    <div>Members</div>
    <div class="users">
      <img *ngFor="let user of users;" [src]="user.picture"/>
    </div>
  `,
  styleUrls: ['new-group-details.component.scss'],
})
export class NewGroupDetailsComponent {
  groupName: string;
  @Input()
  users: GetUsers.Users[];
  @Output()
  groupDetails = new EventEmitter<string>();

  emitGroupDetails() {
    if (this.groupDetails) {
      this.groupDetails.emit(this.groupName);
    }
  }
}
