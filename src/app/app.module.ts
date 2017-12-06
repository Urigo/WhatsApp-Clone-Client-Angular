import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { GraphQLModule } from './graphql.module';
import {ChatsListerModule} from './chats-lister/chats-lister.module';
import {RouterModule, Routes} from '@angular/router';
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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
