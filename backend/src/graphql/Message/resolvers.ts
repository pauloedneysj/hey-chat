import { GraphQLError } from "graphql";
import {
  GraphQLContext,
  MessagePopulated,
  MessageSentSubscriptionPayload,
  SendMessageArgs,
} from "../../utils/types";
import { Prisma } from "@prisma/client";
import { withFilter } from "graphql-subscriptions";
import { userIsConversationParticipant } from "../../utils/functions";
import { conversationPopulated } from "../Conversation/resolvers";

const resolvers = {
  Query: {
    messages: async (
      _: any,
      args: { conversationId: string },
      context: GraphQLContext
    ): Promise<MessagePopulated[]> => {
      const { prisma, userId } = context;
      const { conversationId } = args;

      if (!userId) {
        throw new GraphQLError("Not authenticated");
      }

      const conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: conversationPopulated,
      });

      if (!conversation) {
        throw new GraphQLError("Conversation not found");
      }

      const allowedToView = userIsConversationParticipant(
        conversation.participants,
        userId
      );

      if (!allowedToView) {
        throw new GraphQLError("User is not allowed to view");
      }

      try {
        const messages = await prisma.message.findMany({
          where: {
            conversationId,
          },
          include: messagePopulated,
          orderBy: {
            createdAt: "desc",
          },
        });

        return [{ body: "Hello, Guga!" } as MessagePopulated];
        // return messages;
      } catch (error: any) {
        throw new GraphQLError(error?.message);
      }
    },
  },
  Mutation: {
    sendMessage: async (
      _: any,
      args: SendMessageArgs,
      context: GraphQLContext
    ): Promise<boolean> => {
      const { prisma, pubsub, userId } = context;
      const { id: messageId, conversationId, senderId, body } = args;

      if (!userId || userId !== senderId) {
        throw new GraphQLError("Not authenticated");
      }

      try {
        const newMessage = await prisma.message.create({
          data: {
            id: messageId,
            senderId,
            conversationId,
            body,
          },
          include: messagePopulated,
        });

        const conversation = await prisma.conversation.update({
          where: {
            id: conversationId,
          },
          data: {
            latestMessageId: newMessage.id,
            participants: {
              update: {
                where: {
                  id: senderId,
                },
                data: {
                  hasSeenLatestMessage: true,
                },
              },
              updateMany: {
                where: {
                  NOT: {
                    userId: senderId,
                  },
                },
                data: {
                  hasSeenLatestMessage: false,
                },
              },
            },
          },
        });

        pubsub.publish("MESSAGE_SENT", { messageSent: newMessage });
        pubsub.publish("CONVERSATION_UPDATE", {
          conversationUpdated: { conversation },
        });
      } catch (error: any) {
        throw new GraphQLError(error?.message);
      }

      return true;
    },
  },
  Subscription: {
    messageSent: withFilter(
      (_: any, __: any, context: GraphQLContext) => {
        const { pubsub } = context;

        return pubsub.asyncIterator(["MESSAGE_SENT"]);
      },
      (
        payload: MessageSentSubscriptionPayload,
        args: { conversationId: string },
        _: any
      ) => {
        return payload.messageSent.conversationId === args.conversationId;
      }
    ),
  },
};

export const messagePopulated = Prisma.validator<Prisma.MessageInclude>()({
  sender: {
    select: {
      id: true,
      username: true,
    },
  },
});

export default resolvers;
