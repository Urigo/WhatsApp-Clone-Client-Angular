import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
// Issue 195: https://github.com/apollographql/apollo-codegen/issues/195
export const removeAllMessagesMutation = gql`
  mutation RemoveAllMessages($chatId: ID!, $all: Boolean) {
    removeMessages(chatId: $chatId, all: $all)
  }
`;
