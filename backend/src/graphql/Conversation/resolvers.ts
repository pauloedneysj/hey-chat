import { GraphQLError } from "graphql";
import {
  ConversationCreatedSubscriptionPayload,
  GraphQLContext,
} from "../../utils/types";
import { Prisma } from "@prisma/client";
import { ObjectId } from "bson";
import { withFilter } from "graphql-subscriptions";

const resolvers = {
  Query: {
    conversations: async (_: any, __: any, context: GraphQLContext) => {
      const { prisma, userId } = context;

      if (!userId) {
        throw new GraphQLError("Not authenticated");
      }

      try {
        const conversations = await prisma.conversation.findMany({
          where: {
            participants: {
              some: {
                userId: {
                  equals: userId,
                },
              },
            },
          },
          include: conversationPopulated,
        });

        return conversations;
      } catch (error: any) {
        throw new GraphQLError(error?.message);
      }
    },
  },
  Mutation: {
    createConversation: async (
      _: any,
      args: { participantIds: string[] },
      context: GraphQLContext
    ): Promise<{ conversationId: string }> => {
      const { prisma, userId, pubsub } = context;
      const { participantIds } = args;

      if (!userId) {
        throw new GraphQLError("Not authenticated");
      }

      try {
        const conversation = await prisma.conversation.create({
          data: {
            id: new ObjectId().toString(),
            latestMessageId: new ObjectId().toString(),
            participants: {
              createMany: {
                data: participantIds.map((id) => ({
                  id: new ObjectId().toString(),
                  userId: id,
                  hasSeenLatestMessage: id === userId,
                })),
              },
            },
          },
          include: conversationPopulated,
        });

        pubsub.publish("CONVERSATION_CREATED", {
          conversationCreated: conversation,
        });

        return { conversationId: conversation.id };
      } catch (error: any) {
        throw new GraphQLError(error?.message);
      }
    },
  },
  Subscription: {
    conversationCreated: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;

          return pubsub.asyncIterator(["CONVERSATION_CREATED"]);
        },
        (
          payload: ConversationCreatedSubscriptionPayload,
          _: any,
          context: GraphQLContext
        ) => {
          const { userId } = context;
          const {
            conversationCreated: { participants },
          } = payload;

          const userIsParticipant = !!participants.find(
            (participant) => participant.userId === userId
          );

          return userIsParticipant;
        }
      ),
    },
  },
};

export const participantPopulated =
  Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
      select: {
        id: true,
        username: true,
      },
    },
  });

export const conversationPopulated =
  Prisma.validator<Prisma.ConversationInclude>()({
    participants: {
      include: participantPopulated,
    },
    latestMessage: {
      include: {
        sender: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    },
  });

export default resolvers;
