import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const getChatsQuery = gql`
  query GetChats {
    chats {
      id,
      name,
      picture,
      unreadMessages,
      lastMessage {
        id,
        content,
      },
    }
  }
`;
