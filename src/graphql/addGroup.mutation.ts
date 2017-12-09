import gql from 'graphql-tag';
import {fragments} from './fragment';

// We use the gql tag to parse our query string into a query document
export const addGroupMutation = gql`
  mutation AddGroup($userIds: [ID!]!, $groupName: String!) {
    addGroup(userIds: $userIds, groupName: $groupName) {
      ...ChatWithoutMessages
      messages {
        ...Message
      }
    }
  }

  ${fragments['chatWithoutMessages']}
  ${fragments['message']}
`;
