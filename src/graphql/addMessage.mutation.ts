import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const addMessageMutation = gql`
  mutation AddMessage($chatId: ID!, $content: String!) {
    addMessage(chatId: $chatId, content: $content) {
        id,
        __typename,
        senderId,
        sender {
          id,
          __typename,
          name,
        },
        content,
        createdAt,
        type,
        recipients {
          id,
          __typename,
          receivedAt,
          readAt,
        },
        ownership,
    }
  }
`;
