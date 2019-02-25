import {Component} from '@angular/core';

@Component({
  selector: 'app-toolbar',
  template: `
    <mat-toolbar>
      <div class="left-block">
        <ng-content select=".navigation"></ng-content>
        <ng-content select=".title"></ng-content>
      </div>
      <ng-content select=".menu"></ng-content>
    </mat-toolbar>
  `,
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

}
