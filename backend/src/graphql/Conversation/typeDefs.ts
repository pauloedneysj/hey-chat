import gql from "graphql-tag";

const typeDefs = gql`
  scalar Date

  type Conversation {
    id: String
    latestMessage: Message
    name: String
    participants: [Participant]
    createdAt: Date
    updatedAt: Date
  }

  type Participant {
    id: String
    user: User
    hasSeenLatestMessage: Boolean
    lastSeen: Date
  }

  type ConversationUpdatedSubscriptionPayload {
    conversation: Conversation
    addedUserIds: [String]
    removedUserIds: [String]
  }

  type ConversationDeletedSubscriptionPayload {
    id: String
  }

  type LastSeenUpdatedSubscriptionPayload {
    lastSeenUpdated: [Participant]
  }

  type UpdateLastSeenResponse {
    success: Boolean
  }

  type CreateConversationResponse {
    conversationId: String
  }

  type Query {
    conversations: [Conversation]
  }

  type Mutation {
    createConversation(
      participantIds: [String]
      conversationName: String
    ): CreateConversationResponse
  }

  type Mutation {
    markConversationAsRead(userId: String!, conversationId: String!): Boolean
  }

  type Mutation {
    updateLastSeen(lastSeen: Date!): UpdateLastSeenResponse
  }

  type Subscription {
    conversationCreated: Conversation
  }

  type Subscription {
    conversationUpdated: ConversationUpdatedSubscriptionPayload
  }

  type Subscription {
    conversationDeleted: ConversationDeletedSubscriptionPayload
  }

  type Subscription {
    lastSeenUpdated: LastSeenUpdatedSubscriptionPayload
  }
`;

export default typeDefs;
