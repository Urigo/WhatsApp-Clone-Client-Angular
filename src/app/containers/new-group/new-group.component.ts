import {Component} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {Location} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  template: `
    <app-toolbar>
      <button class="navigation" mat-button (click)="goBack()">
        <mat-icon aria-label="Icon-button with an arrow back icon">arrow_back</mat-icon>
      </button>
      <div class="title">New group</div>
    </app-toolbar>
  `,
  styleUrls: ['new-group.component.scss'],
})
export class NewGroupComponent {
  constructor(private apollo: Apollo,
              private router: Router,
              private location: Location) {}

  goBack() {
    this.location.back();
  }
}
