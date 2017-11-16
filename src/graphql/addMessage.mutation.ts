import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const addMessageMutation = gql`
  mutation AddMessage($chatId: ID!, $content: String!) {
    addMessage(chatId: $chatId, content: $content) {
        id,
        senderId,
        sender {
          id,
          name,
        },
        content,
        createdAt,
        type,
        recipients {
          id,
          receivedAt,
          readAt,
        },
        ownership,
    }
  }
`;
