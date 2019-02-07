
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphQLModule } from './graphql.module';
import { AccountsGraphQLClient } from '@accounts/graphql-client';
import { Apollo } from 'apollo-angular';
import { AccountsClient } from '@accounts/client';
import { AccountsClientPassword } from '@accounts/client-password';
import gql from 'graphql-tag';

function createGraphQLClient(apollo: Apollo) {
  return new AccountsGraphQLClient({
    graphQLClient: apollo.getClient(),
    userFieldsFragment: gql`
      fragment userFields on User {
        id
        name
        username
        picture
        phone
      }
    `
  });
}

function createAccountsClient(accountsGraphQL: AccountsGraphQLClient) {
  return new AccountsClient({}, accountsGraphQL);
}

function createAccountsPassword(accountsClient: AccountsClient) {
  return new AccountsClientPassword(accountsClient);
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GraphQLModule
  ],
  providers: [
    {
      provide: AccountsGraphQLClient,
      useFactory: createGraphQLClient,
      deps: [Apollo]
    },
    {
      provide: AccountsClient,
      useFactory: createAccountsClient,
      deps: [AccountsGraphQLClient]
    },
    {
      provide: AccountsClientPassword,
      useFactory: createAccountsPassword,
      deps: [AccountsClient]
    },
  ]
})
export class AccountsModule { }
