import {
  ConversationPopulated,
  MessagePopulated,
} from "../../../backend/src/utils/types";

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
}

export interface ConversationsData {
  conversations: ConversationPopulated[];
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
