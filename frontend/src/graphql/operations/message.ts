import { gql } from "@apollo/client";

export const MessageFields = `
    id
    sender {
      id
      username
    }
    body
    createdAt
`;

const MessageOperations = {
  Queries: {
    messages: gql`
      query Messages($conversationId: String!){
        messages(conversationId: $conversationId){
          ${MessageFields}
        }
      }
    `,
  },
  Mutations: {
    sendMessage: gql`
      mutation SendMessage(
        $conversationId: String!
        $senderId: String!
        $body: String!
      ) {
        sendMessage(
          conversationId: $conversationId
          senderId: $senderId
          body: $body
        )
      }
    `,
  },
  Subscriptions: {
    messageSent: gql`
      subscription MessageSent($conversationId: String!) {
        messageSent(conversationId: $conversationId) {
          ${MessageFields}
        }
      }
    `,
  },
};

export default MessageOperations;
