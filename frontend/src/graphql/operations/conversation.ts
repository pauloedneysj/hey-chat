import { gql } from "@apollo/client";

const ConversationOperations = {
  // TODO: Queries: {},
  Mutations: {
    createConversation: gql`
      mutation CreateConversation($participantIds: [String]) {
        createConversation(participantIds: $participantIds) {
          conversationId
        }
      }
    `,
  },
  // TODO: Subscription: {},
};

export default ConversationOperations;
