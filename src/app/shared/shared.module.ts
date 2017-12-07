import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {MatButtonModule, MatIconModule, MatToolbarModule} from '@angular/material';
import {ToolbarComponent} from './components/toolbar/toolbar.component';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ConfirmSelectionComponent} from './components/confirm-selection/confirm-selection.component';

@NgModule({
  declarations: [
    ToolbarComponent,
    ConfirmSelectionComponent,
  ],
  imports: [
    BrowserModule,
    // Material
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    // Animations
    BrowserAnimationsModule,
    // Forms
    FormsModule,
  ],
  providers: [],
  exports: [
    ToolbarComponent,
    ConfirmSelectionComponent,
  ],
})
export class SharedModule {
}
