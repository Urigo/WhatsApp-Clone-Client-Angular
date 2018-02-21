import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { GraphQLModule } from './graphql.module';
import {ChatsListerModule} from './chats-lister/chats-lister.module';
import {RouterModule, Routes} from '@angular/router';
import {ChatViewerModule} from './chat-viewer/chat-viewer.module';
import {ChatsCreationModule} from './chats-creation/chats-creation.module';
import {LoginModule} from './login/login.module';
import {AuthInterceptor} from './login/services/auth.interceptor';
import { ErrorInterceptor } from './login/services/error.interceptor';
const routes: Routes = [];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    GraphQLModule,
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
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
