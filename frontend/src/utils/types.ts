import { Prisma } from "@prisma/client";

const participantPopulated =
  Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
      select: {
        id: true,
        username: true,
      },
    },
  });

const conversationPopulated = Prisma.validator<Prisma.ConversationInclude>()({
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

const messagePopulated = Prisma.validator<Prisma.MessageInclude>()({
  sender: {
    select: {
      id: true,
      username: true,
    },
  },
});

/**
 * User
 */
export interface CreateUserData {
  createUsername: {
    success: boolean;
  };
}

export interface CreateUserVariables {
  username: string;
}

export interface LoginData {
  login: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginVariables {
  userId: string;
}

export interface SearchedUser {
  id: string;
  username: string;
}

export interface SearchUsersData {
  searchUsers: SearchedUser[];
}

export interface SearchUsersInput {
  username: string;
}

/**
 * Conversation
 */
export interface CreateConversationData {
  createConversation: {
    conversationId: string;
  };
}

export interface CreateConversationInput {
  participantIds: string[];
  conversationName?: string;
}

export interface ConversationsData {
  conversations: ConversationPopulated[];
}

export interface ConversationUpdatedData {
  conversationUpdated: {
    conversation: Omit<ConversationPopulated, "latestMessage"> & {
      latestMessage: MessagePopulated;
    };
    addedUserIds: Array<string> | null;
    removedUserIds: Array<string> | null;
  };
}

export interface ConversationDeletedData {
  conversationDeleted: {
    id: string;
  };
}

export type ConversationPopulated = Prisma.ConversationGetPayload<{
  include: typeof conversationPopulated;
}>;

export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{
  include: typeof participantPopulated;
}>;

export interface lastSeenUpdatedData {
  lastSeenUpdated: {
    participants: ParticipantPopulated[];
  };
}

export interface UpdateLastSeenResponse {
  updateLastSeen: {
    success?: boolean;
  };
}

export interface UpdateLastSeenArgs {
  lastSeen: Date;
}

/**
 * Message
 */
export interface MessageData {
  messages: MessagePopulated[];
}

export interface MessageVariables {
  conversationId: string;
}

export interface MessageSubscriptionData {
  subscriptionData: {
    data: {
      messageSent: MessagePopulated;
    };
  };
}

export type MessagePopulated = Prisma.MessageGetPayload<{
  include: typeof messagePopulated;
}>;

export interface SendMessageArgs {
  conversationId: string;
  senderId: string;
  body: string;
}
