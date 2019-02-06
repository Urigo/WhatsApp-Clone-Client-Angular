import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory';
import {getMainDefinition} from 'apollo-utilities';
import {OperationDefinitionNode} from 'graphql';
import {split} from 'apollo-link';
import {WebSocketLink} from 'apollo-link-ws';

const uri = 'http://localhost:4000/graphql';

export const dataIdFromObject = (object: any) => {
  switch (object.__typename) {
    case 'Message':
      return `${object.chat.id}:${object.id}`; // use `chatId` prefix and `messageId` as the primary key
    default:
      return defaultDataIdFromObject(object); // fall back to default handling
  }
};

export function createApollo(httpLink: HttpLink) {
  const subscriptionLink = new WebSocketLink({
    uri: uri.replace('http', 'ws'),
    options: {
      reconnect: true,
      connectionParams: () => ({
        'accounts-access-token': localStorage.getItem('accounts:accessToken') || null
      })
    }
  });

  const link = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query) as OperationDefinitionNode;
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    subscriptionLink,
    httpLink.create({uri})
  );

  return {
    link,
    cache: new InMemoryCache({
      dataIdFromObject,
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
