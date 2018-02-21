import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatGridListModule, MatIconModule, MatListModule, MatMenuModule, MatToolbarModule} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ChatsService} from '../services/chats.service';
import {ChatComponent} from './containers/chat/chat.component';
import {MessagesListComponent} from './components/messages-list/messages-list.component';
import {MessageItemComponent} from './components/message-item/message-item.component';
import {NewMessageComponent} from './components/new-message/new-message.component';
import {SharedModule} from '../shared/shared.module';
import {SelectableListModule} from 'ngx-selectable-list';
import {AuthGuard} from '../login/services/auth.guard';

const routes: Routes = [
  {
    path: 'chat', children: [
      {path: ':id', canActivate: [AuthGuard], component: ChatComponent},
    ],
  },
];

@NgModule({
  declarations: [
    ChatComponent,
    MessagesListComponent,
    MessageItemComponent,
    NewMessageComponent,
  ],
  imports: [
    BrowserModule,
    // Material
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatGridListModule,
    // Animations
    BrowserAnimationsModule,
    // Routing
    RouterModule.forChild(routes),
    // Forms
    FormsModule,
    // Feature modules
    SharedModule,
    SelectableListModule,
  ],
  providers: [
    ChatsService,
  ],
})
export class ChatViewerModule {
}
