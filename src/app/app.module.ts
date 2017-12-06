import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {HttpLink, HttpLinkModule, Options} from 'apollo-angular-link-http';
import {Apollo, ApolloModule} from 'apollo-angular';
import {InMemoryCache} from 'apollo-cache-inmemory';


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
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    apollo: Apollo,
    httpLink: HttpLink,
  ) {
    apollo.create({
      link: httpLink.create(<Options>{uri: 'http://localhost:3000/graphql'}),
      cache: new InMemoryCache(),
    });
  }
}
