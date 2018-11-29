import { NgModule} from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory';

const uri = 'http://localhost:3000/graphql';

export function createApollo(httpLink: HttpLink) {
  return {
    link: httpLink.create({uri}),
    cache: new InMemoryCache({
      dataIdFromObject: (object: any) => {
        switch (object.__typename) {
          case 'Message': return `${object.chat.id}:${object.id}`; // use `chatId` prefix and `messageId` as the primary key
          default: return defaultDataIdFromObject(object); // fall back to default handling
        }
      }
    }),
  };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}
