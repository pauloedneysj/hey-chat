import { GraphQLError } from "graphql";
import {
  ConversationCreatedSubscriptionPayload,
  ConversationDeletedSubscriptionPayload,
  ConversationUpdatedSubscriptionPayload,
  GraphQLContext,
  LastSeenUpdatedSubscriptionPayload,
  UpdateLastSeenResponse,
} from "../../utils/types";
import { Prisma } from "@prisma/client";
import { ObjectId } from "bson";
import { withFilter } from "graphql-subscriptions";
import {
  isParticipantInConversation,
  userIsConversationParticipant,
} from "../../utils/functions";

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
      args: { participantIds: string[]; conversationName?: string },
      context: GraphQLContext
    ): Promise<{ conversationId: string }> => {
      const { prisma, userId, pubsub } = context;
      const { participantIds, conversationName } = args;

      if (!userId) {
        throw new GraphQLError("Not authenticated");
      }

      if (!participantIds) {
        throw new GraphQLError("Please provide participant ids");
      }

      try {
        const participantIdsWithoutMe = participantIds.find(
          (id) => id !== userId
        );

        const existingConversations = await prisma.conversation.findMany({
          where: {
            participants: {
              some: {
                userId: participantIdsWithoutMe,
              },
            },
          },
          include: conversationPopulated,
        });

        const doesConversationExist = existingConversations.some(
          (conversation) => {
            if (participantIds.length > 2) return false;

            const isTwoParticipantConversation =
              conversation.participants.length === 2;

            if (isTwoParticipantConversation && participantIdsWithoutMe) {
              return isParticipantInConversation(
                conversation.participants,
                userId,
                participantIdsWithoutMe
              );
            }
          }
        );

        if (doesConversationExist) {
          throw new GraphQLError("Conversation already exists");
        }

        const conversation = await prisma.conversation.create({
          data: {
            id: new ObjectId().toString(),
            latestMessageId: new ObjectId().toString(),
            name: conversationName,
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
    markConversationAsRead: async (
      _: any,
      args: { userId: string; conversationId: string },
      context: GraphQLContext
    ): Promise<boolean> => {
      const { prisma, userId } = context;
      const { userId: participantId, conversationId } = args;

      if (!userId) {
        throw new GraphQLError("Not authenticated");
      }

      try {
        await prisma.conversationParticipant.updateMany({
          where: {
            userId: participantId,
            conversationId,
          },
          data: {
            hasSeenLatestMessage: true,
          },
        });

        return true;
      } catch (error: any) {
        console.log("markConversationAsRead error", error);
        throw new GraphQLError(error.message);
      }
    },
    updateLastSeen: async (
      _: any,
      args: { lastSeen: Date },
      context: GraphQLContext
    ): Promise<UpdateLastSeenResponse> => {
      const { prisma, pubsub, userId } = context;
      const { lastSeen } = args;

      if (!userId) {
        throw new GraphQLError("Not authorized");
      }

      if (!lastSeen) {
        throw new GraphQLError("Invalid date");
      }

      try {
        await prisma.conversationParticipant.updateMany({
          where: { userId },
          data: {
            lastSeen,
          },
        });

        const participants = await prisma.conversationParticipant.findMany({
          where: { userId },
          include: participantPopulated,
        });

        pubsub.publish("LAST_SEEN_UPDATED", {
          lastSeenUpdated: participants,
        });

        return { success: true };
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
    conversationUpdated: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;

          return pubsub.asyncIterator(["CONVERSATION_UPDATED"]);
        },
        (
          payload: ConversationUpdatedSubscriptionPayload,
          _: any,
          context: GraphQLContext
        ) => {
          const { userId } = context;

          if (!userId) {
            throw new GraphQLError("Not authorized");
          }

          const {
            conversationUpdated: {
              conversation: { participants },
              addedUserIds,
              removedUserIds,
            },
          } = payload;

          const userIsParticipant = userIsConversationParticipant(
            participants,
            userId
          );

          const userSentLatestMessage =
            payload.conversationUpdated.conversation.latestMessage?.senderId ===
            userId;

          const userIsBeingRemoved =
            removedUserIds &&
            Boolean(removedUserIds.find((id) => id === userId));

          return (
            (userIsParticipant && !userSentLatestMessage) ||
            userSentLatestMessage ||
            userIsBeingRemoved
          );
        }
      ),
    },
    conversationDeleted: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;

          return pubsub.asyncIterator(["CONVERSATION_DELETED"]);
        },
        (
          payload: ConversationDeletedSubscriptionPayload,
          _: any,
          context: GraphQLContext
        ) => {
          const { userId } = context;

          if (!userId) {
            throw new GraphQLError("Not authorized");
          }

          const {
            conversationDeleted: { participants },
          } = payload;

          return userIsConversationParticipant(participants, userId);
        }
      ),
    },
    lastSeenUpdated: {
      subscribe: withFilter(
        (_: any, __: any, context: GraphQLContext) => {
          const { pubsub } = context;

          return pubsub.asyncIterator(["LAST_SEEN_UPDATED"]);
        },
        (
          payload: LastSeenUpdatedSubscriptionPayload,
          _: any,
          context: GraphQLContext
        ) => {
          console.log("payload: ", payload);
          const { userId } = context;

          if (!userId) {
            throw new GraphQLError("Not authorized");
          }

          const { lastSeenUpdated: participants } = payload;

          return userIsConversationParticipant(participants, userId);
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
