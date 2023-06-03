import { gql } from "@apollo/client";

const UserOperations = {
  Queries: {},
  Mutations: {
    login: gql`
      mutation Login($userId: ID!) {
        login(userId: $userId) {
          accessToken
          refreshToken
          error
        }
      }
    `,
    createUsername: gql`
      mutation CreateUsername($username: String!) {
        createUsername(username: $username) {
          success
          error
        }
      }
    `,
  },
  // TODO: Subscription: {},
};

export default UserOperations;
