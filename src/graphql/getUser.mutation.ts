import gql from 'graphql-tag';

export const getUserQuery = gql`
  query getUser {
    getUser {
      id
      username
      name
      picture
      phone
    }
  }
`;
