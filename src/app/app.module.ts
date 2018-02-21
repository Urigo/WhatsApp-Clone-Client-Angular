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
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    apollo: Apollo,
    httpLink: HttpLink,
  ) {
    apollo.create({
      link: httpLink.create(<Options>{uri: 'http://localhost:3000/graphql'}),
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
