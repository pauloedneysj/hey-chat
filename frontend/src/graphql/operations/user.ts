import { gql } from "@apollo/client";

const UserOperations = {
  Queries: {
    searchUsers: gql`
      query SearchUsers($username: String) {
        searchUsers(username: $username) {
          id
          username
        }
      }
    `,
  },
  Mutations: {
    login: gql`
      mutation Login($userId: ID!) {
        login(userId: $userId) {
          accessToken
          refreshToken
        }
      }
    `,
    createUsername: gql`
      mutation CreateUsername($username: String!) {
        createUsername(username: $username) {
          success
        }
      }
    `,
  },
  // TODO: Subscription: {},
};

export default UserOperations;
