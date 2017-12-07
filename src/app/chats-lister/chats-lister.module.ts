import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatIconModule, MatListModule, MatMenuModule} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ChatsService} from '../services/chats.service';
import {ChatItemComponent} from './components/chat-item/chat-item.component';
import {ChatsComponent} from './containers/chats/chats.component';
import {ChatsListComponent} from './components/chats-list/chats-list.component';
import {TruncateModule} from 'ng2-truncate';
import {SharedModule} from '../shared/shared.module';
import {SelectableListModule} from 'ngx-selectable-list';

const routes: Routes = [
  {path: 'chats', component: ChatsComponent},
];

@NgModule({
  declarations: [
    ChatsComponent,
    ChatsListComponent,
    ChatItemComponent,
  ],
  imports: [
    BrowserModule,
    // Material
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    // Animations
    BrowserAnimationsModule,
    // Routing
    RouterModule.forChild(routes),
    // Forms
    FormsModule,
    // Truncate Pipe
    TruncateModule,
    // Feature modules
    SharedModule,
    SelectableListModule,
  ],
  providers: [
    ChatsService,
  ],
})
export class ChatsListerModule {
}
