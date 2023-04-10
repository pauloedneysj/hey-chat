import gql from "graphql-tag";

const typeDefs = gql`
  type User {
    id: String
    username: String
  }

  type LoginResponse {
    accessToken: String
    refreshToken: String
    error: String
  }

  type CreateUsernameResponse {
    success: Boolean
    error: String
  }

  type RefreshTokenResponse {
    accessToken: String
    refreshToken: String
    error: String
  }

  type Query {
    searchUsers(username: String): [User]
  }

  type Mutation {
    login(userId: ID): LoginResponse
  }

  type Mutation {
    createUsername(username: String): CreateUsernameResponse
  }

  type Mutation {
    refreshToken(refreshTokenId: ID): RefreshTokenResponse
  }
`;

export default typeDefs;
