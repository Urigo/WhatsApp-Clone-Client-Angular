import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { GraphQLModule } from './graphql.module';
import {ChatsListerModule} from './chats-lister/chats-lister.module';
import {RouterModule, Routes} from '@angular/router';
import {ChatViewerModule} from './chat-viewer/chat-viewer.module';
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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
