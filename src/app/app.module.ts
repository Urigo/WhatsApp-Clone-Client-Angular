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

const routes: Routes = [
  {path: '', redirectTo: 'chats', pathMatch: 'full'},
  {path: 'chats', component: ChatsComponent},
  {path: 'chat', children: [
      {path: ':id', component: ChatComponent},
    ],
  },
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
