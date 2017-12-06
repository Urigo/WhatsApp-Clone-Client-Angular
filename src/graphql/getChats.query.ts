import gql from 'graphql-tag';
import {fragments} from './fragment';

// We use the gql tag to parse our query string into a query document
export const getChatsQuery = gql`
  query GetChats($amount: Int) {
    chats {
      ...ChatWithoutMessages
      messages(amount: $amount) {
        ...Message
      }
    }
  }

  ${fragments['chatWithoutMessages']}
  ${fragments['message']}
`;
