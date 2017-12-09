import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const addChatMutation = gql`
  mutation AddChat($recipientId: ID!) {
    addChat(recipientId: $recipientId) {
      id,
      __typename,
      name,
      picture,
      userIds,
      unreadMessages,
      lastMessage {
        id,
        __typename,
        content,
      },
      isGroup,
    }
  }
`;
