import gql from "graphql-tag";

const typeDefs = gql`
  scalar Date

  type Message {
    id: String
    sender: User
    body: String
    createdAt: Date
  }

  type Query {
    messages(conversationId: String): [Message]
  }

  type Mutation {
    sendMessage(conversationId: String, senderId: String, body: String): Boolean
  }

  type Subscription {
    messageSent(conversationId: String): Message
  }
`;

export default typeDefs;
