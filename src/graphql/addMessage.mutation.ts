import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const addMessageMutation = gql`
  mutation AddMessage($chatId: Int!, $content: String!) {
    addMessage(chatId: $chatId, content: $content) {
      id,
    }
  }
`;
