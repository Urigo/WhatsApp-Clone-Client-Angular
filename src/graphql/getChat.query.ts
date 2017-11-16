import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const getChatQuery = gql`
  query GetChat($chatId: ID!) {
    chat(chatId: $chatId) {
      id,
      name,
      picture,
      isGroup,
      messages {
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
      },
    }
  }
`;
