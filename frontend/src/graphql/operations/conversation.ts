import { gql } from "@apollo/client";
import { MessageFields } from "./message";

const ConversationFields = `
    id
    updatedAt
    name
    participants {
      user {
        id
        username
      }
      hasSeenLatestMessage
      lastSeen
    }
    latestMessage {
      ${MessageFields}
    }
`;

const ConversationOperations = {
  Queries: {
    conversations: gql`
      query Conversations {
        conversations {
          ${ConversationFields}
        }
      }
    `,
  },
  Mutations: {
    createConversation: gql`
      mutation CreateConversation(
        $participantIds: [String]
        $conversationName: String
      ) {
        createConversation(
          participantIds: $participantIds
          conversationName: $conversationName
        ) {
          conversationId
        }
      }
    `,
    markConversationAsRead: gql`
      mutation MarkConversationAsRead(
        $userId: String!
        $conversationId: String!
      ) {
        markConversationAsRead(userId: $userId, conversationId: $conversationId)
      }
    `,
    updateLastSeen: gql`
      mutation UpdateLastSeen($lastSeen: Date!) {
        updateLastSeen(lastSeen: $lastSeen) {
          success
        }
      }
    `,
  },
  Subscriptions: {
    conversationCreated: gql`
      subscription ConversationCreated {
        conversationCreated {
          ${ConversationFields}
        }
      }
    `,
    conversationUpdated: gql`
    subscription ConversationUpdated {
      conversationUpdated {
        conversation {
          ${ConversationFields}
        }
      }
    }
  `,
    conversationDeleted: gql`
      subscription ConversationDeleted {
        conversationDeleted {
          id
        }
      }
    `,
    lastSeenUpdated: gql`
      subscription LastSeenUpdated {
        lastSeenUpdated {
          participants {
            user {
              id
              username
            }
            lastSeen
          }
        }
      }
    `,
  },
};

export default ConversationOperations;
