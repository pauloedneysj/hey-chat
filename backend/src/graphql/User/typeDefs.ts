import gql from "graphql-tag";

const typeDefs = gql`
  type SearchedUser {
    id: String
    username: String
  }

  type LoginResponse {
    accessToken: String
    refreshToken: String
  }

  type CreateUsernameResponse {
    success: Boolean
  }

  type RefreshTokenResponse {
    accessToken: String
    refreshToken: String
  }

  type Query {
    searchUsers(username: String): [SearchedUser]
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
