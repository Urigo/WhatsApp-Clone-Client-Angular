import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const getChatQuery = gql`
  query GetChat($chatId: ID!) {
    chat(chatId: $chatId) {
      id,
      __typename,
      name,
      picture,
      isGroup,
      messages {
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
      },
    }
  }
`;
