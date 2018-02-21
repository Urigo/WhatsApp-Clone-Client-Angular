import gql from 'graphql-tag';
import {fragments} from './fragment';

// We use the gql tag to parse our query string into a query document
export const chatAddedSubscription = gql`
  subscription chatAdded {
    chatAdded {
      ...ChatWithoutMessages
      messages {
        ...Message
      }
    }
  }

  ${fragments['chatWithoutMessages']}
  ${fragments['message']}
`;
