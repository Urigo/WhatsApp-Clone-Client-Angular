import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {HttpLink, HttpLinkModule, Options} from 'apollo-angular-link-http';
import {Apollo, ApolloModule} from 'apollo-angular';
import {defaultDataIdFromObject, InMemoryCache} from 'apollo-cache-inmemory';
import {ChatsListerModule} from './chats-lister/chats-lister.module';
import {RouterModule, Routes} from '@angular/router';
import {ChatViewerModule} from './chat-viewer/chat-viewer.module';
import {ChatsCreationModule} from './chats-creation/chats-creation.module';
import {LoginModule} from './login/login.module';
import {AuthInterceptor} from './login/services/auth.interceptor';
import {getMainDefinition} from 'apollo-utilities';
import {OperationDefinitionNode} from 'graphql';
import {split} from 'apollo-link';
import {WebSocketLink} from 'apollo-link-ws';
import {LoginService} from './login/services/login.service';
const routes: Routes = [];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    // Apollo
    ApolloModule,
    HttpLinkModule,
    HttpClientModule,
    // Routing
    RouterModule.forRoot(routes),
    // Feature modules
    ChatsListerModule,
    ChatViewerModule,
    ChatsCreationModule,
    LoginModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    apollo: Apollo,
    httpLink: HttpLink,
    loginService: LoginService,
  ) {
    const subscriptionLink = new WebSocketLink({
      uri:
        'ws://localhost:3000/subscriptions',
      options: {
        reconnect: true,
        connectionParams: () => ({
          authToken: loginService.getAuthHeader() || null
        })
      }
    });

    const link = split(
      ({ query }) => {
        const { kind, operation } = <OperationDefinitionNode>getMainDefinition(<any>query);
        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      subscriptionLink,
      httpLink.create(<Options>{uri: 'http://localhost:3000/graphql'})
    );

    apollo.create({
      link,
      cache: new InMemoryCache({
        dataIdFromObject: (object: any) => {
          switch (object.__typename) {
            case 'Message': return `${object.chat.id}:${object.id}`; // use `chatId` prefix and `messageId` as the primary key
            default: return defaultDataIdFromObject(object); // fall back to default handling
          }
        }
      }),
    });
  }
}
