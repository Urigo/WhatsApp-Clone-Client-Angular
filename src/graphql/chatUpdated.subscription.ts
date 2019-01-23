import gql from 'graphql-tag';
import {fragments} from './fragment';

// We use the gql tag to parse our query string into a query document
export const chatAddedSubscription = gql`
  subscription chatUpdated {
    chatUpdated {
      ...ChatWithoutMessages
      messages {
        ...Message
      }
    }
  }

  ${fragments['chatWithoutMessages']}
  ${fragments['message']}
`;
