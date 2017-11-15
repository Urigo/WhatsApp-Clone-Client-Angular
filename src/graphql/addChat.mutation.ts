import gql from 'graphql-tag';

// We use the gql tag to parse our query string into a query document
export const addChatMutation = gql`
  mutation AddChat($recipientIds: [Int!]!, $groupName: String) {
    addChat(recipientIds: $recipientIds, groupName: $groupName) {
      id,
    }
  }
`;
