import { gql } from "@apollo/client";
import { MessageFields } from "./message";

const ConversationFields = `
    id
    updatedAt
    participants {
      user {
        id
        username
      }
      hasSeenLatestMessage
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
      mutation CreateConversation($participantIds: [String]) {
        createConversation(participantIds: $participantIds) {
          conversationId
        }
      }
    `,
  },
  Subscription: {
    conversationCreated: gql`
      subscription ConversationCreated {
        conversationCreated {
          ${ConversationFields}
        }
      }
    `,
  },
};

export default ConversationOperations;
