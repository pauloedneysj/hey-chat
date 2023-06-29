import gql from "graphql-tag";

const typeDefs = gql`
  scalar Date

  type Message {
    id: String
    sender: User
    body: String
    createdAt: Date
  }
`;

export default typeDefs;
