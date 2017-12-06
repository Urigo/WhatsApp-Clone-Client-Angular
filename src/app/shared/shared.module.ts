import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {MatToolbarModule} from '@angular/material';
import {ToolbarComponent} from './components/toolbar/toolbar.component';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    ToolbarComponent,
  ],
  imports: [
    BrowserModule,
    // Material
    MatToolbarModule,
    // Animations
    BrowserAnimationsModule,
    // Forms
    FormsModule,
  ],
  providers: [],
  exports: [
    ToolbarComponent,
  ],
})
export class SharedModule {
}
