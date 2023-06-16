import { GraphQLError } from "graphql";
import { GraphQLContext } from "../../util/types";
import { Prisma } from "@prisma/client";
import { ObjectId } from "bson";

const resolvers = {
  Query: {
    conversations: async (_: any, __: any, context: GraphQLContext) => {
      console.log("WORKS FINE");
    },
  },
  Mutation: {
    createConversation: async (
      _: any,
      args: { participantIds: string[] },
      context: GraphQLContext
    ): Promise<{ conversationId: string }> => {
      const { prisma, userId } = context;
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

        return { conversationId: conversation.id };
      } catch (error: any) {
        throw new GraphQLError(error?.message);
      }
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
