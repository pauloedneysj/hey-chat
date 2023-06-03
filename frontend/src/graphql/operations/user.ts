import { gql } from "@apollo/client";

const UserOperations = {
  Queries: {},
  Mutations: {
    login: gql`
      mutation Login($userId: ID!) {
        login(userId: $userId) {
          token
          success
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
  Subscription: {},
};

export default UserOperations;
