import { NgModule, Injector } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory';
import {getMainDefinition} from 'apollo-utilities';
import {OperationDefinitionNode} from 'graphql';
import {split} from 'apollo-link';
import {WebSocketLink} from 'apollo-link-ws';
import { accountsLink } from '@accounts/apollo-link';
import { AccountsClient } from '@accounts/client';

const uri = 'http://localhost:4000/graphql';

export const dataIdFromObject = (object: any) => {
  switch (object.__typename) {
    case 'Message':
      return `${object.chat.id}:${object.id}`; // use `chatId` prefix and `messageId` as the primary key
    default:
      return defaultDataIdFromObject(object); // fall back to default handling
  }
};

export function createApollo(httpLink: HttpLink, injector: Injector) {
  const subscriptionLink = new WebSocketLink({
    uri: uri.replace('http', 'ws'),
    options: {
      reconnect: true,
      connectionParams: async () => {
        const accountsClient = injector.get(AccountsClient);
        const tokens = await accountsClient.getTokens();
        if (tokens) {
          return {
            Authorization: 'Bearer ' + tokens.accessToken
          };
        } else {
          return {};
        }
      }
    }
  });

  const authLink = accountsLink(() => injector.get(AccountsClient));

  const link = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query) as OperationDefinitionNode;
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    subscriptionLink,
    authLink.concat(httpLink.create({uri}))
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
      deps: [HttpLink, Injector],
    },
  ],
})
export class GraphQLModule {}
