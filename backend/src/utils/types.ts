import { Prisma, PrismaClient } from "@prisma/client";
import {
  conversationPopulated,
  participantPopulated,
} from "../graphql/Conversation/resolvers";
import { Context } from "graphql-ws/lib/server";
import { PubSub } from "graphql-subscriptions";
import { messagePopulated } from "../graphql/Message/resolvers";

/**
 * Contexts
 */
export interface GraphQLContext {
  prisma: PrismaClient;
  userId: string | null;
  pubsub: PubSub;
}

export interface SubscriptionContext extends Context {
  connectionParams: {
    token: string | null;
  };
}

/**
 * Authentications
 */
export interface JwtPayload {
  userId: string;
}

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
}

export interface RefreshTokenResponse {
  accessToken?: string;
  refreshToken?: string;
}

export interface CreateUsernameResponse {
  success?: boolean;
}

/**
 * Conversations
 */
export type ConversationPopulated = Prisma.ConversationGetPayload<{
  include: typeof conversationPopulated;
}>;

export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{
  include: typeof participantPopulated;
}>;

export interface ConversationCreatedSubscriptionPayload {
  conversationCreated: ConversationPopulated;
}

/**
 * Messages
 */
export interface SendMessageArgs {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
}

export interface MessageSentSubscriptionPayload {
  messageSent: MessagePopulated;
}

export type MessagePopulated = Prisma.MessageGetPayload<{
  include: typeof messagePopulated;
}>;
