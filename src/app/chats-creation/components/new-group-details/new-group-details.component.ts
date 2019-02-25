import {Component, EventEmitter, Input, Output} from '@angular/core';
import {GetUsers} from '../../../../graphql';

@Component({
  selector: 'app-new-group-details',
  template: `
    <div>
      <mat-form-field color="default">
        <input matInput placeholder="Group name" [(ngModel)]="groupName">
      </mat-form-field>
    </div>
    <button *ngIf="groupName" class="new-group" mat-fab color="secondary" (click)="emitGroupDetails()">
      <mat-icon aria-label="Icon-button with a + icon">arrow_forward</mat-icon>
    </button>
    <div>Participants: {{ users.length }}</div>
    <span class="users">
      <div class="user" *ngFor="let user of users">
        <img class="user-profile-pic" [src]="user.picture || 'assets/default-profile-pic.jpg'"/>
        <span class="user-name">{{ user.name }}</span>
      </div>
    </span>
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