import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
import {Apollo, ApolloModule} from 'apollo-angular';
import {HttpClientModule} from '@angular/common/http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ChatsListComponent} from './components/chats-list/chats-list.component';
import {MatButtonModule, MatGridListModule, MatIconModule, MatListModule, MatMenuModule, MatToolbarModule} from '@angular/material';
import {RouterModule, Routes} from '@angular/router';
import {ChatItemComponent} from './components/chat-item/chat-item.component';
import {ChatsComponent} from './containers/chats/chats.component';
import {ChatComponent} from './containers/chat/chat.component';
import {ToolbarComponent} from './components/toolbar/toolbar.component';
import {MessagesListComponent} from './components/messages-list/messages-list.component';
import {MessageItemComponent} from './components/message-item/message-item.component';
import {NewMessageComponent} from './components/new-message/new-message.component';
import {FormsModule} from '@angular/forms';
import {NewChatComponent} from './containers/new-chat/new-chat.component';
import {UsersListComponent} from './components/users-list/users-list.component';
import {NewGroupComponent} from './containers/new-group/new-group.component';
import {UserItemComponent} from './components/user-item/user-item.component';

const routes: Routes = [
  {path: '', redirectTo: 'chats', pathMatch: 'full'},
  {path: 'chats', component: ChatsComponent},
  {path: 'chat', children: [
      {path: ':id', component: ChatComponent},
    ],
  },
  {path: 'new-chat', component: NewChatComponent},
  {path: 'new-group', component: NewGroupComponent},
];

@NgModule({
  declarations: [
    AppComponent,
    ChatsComponent,
    ChatsListComponent,
    ChatItemComponent,
    ChatComponent,
    ToolbarComponent,
    MessagesListComponent,
    MessageItemComponent,
    NewMessageComponent,
    NewChatComponent,
    UsersListComponent,
    NewGroupComponent,
    UserItemComponent,
  ],
  imports: [
    BrowserModule,
    // Apollo
    ApolloModule,
    HttpLinkModule,
    HttpClientModule,
    // Animations (for Material)
    BrowserAnimationsModule,
    // Material
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatGridListModule,
    // Routing
    RouterModule.forRoot(routes),
    // Forms
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    apollo: Apollo,
    httpLink: HttpLink,
  ) {
    /*const GRAPHQL_ENDPOINT = 'ws://localhost/graphql_live';
    const client = new SubscriptionClient(GRAPHQL_ENDPOINT, {
      reconnect: true,
    });*/

    apollo.create({
      link: httpLink.create({uri: 'http://localhost/graphql'}),
      // link: new WebSocketLink(client),
      cache: new InMemoryCache()
    });
  }
}
