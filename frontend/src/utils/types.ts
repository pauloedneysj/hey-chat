/*
 * User types
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

/*
 * Conversation types
 */
export interface CreateConversationData {
  createConversation: {
    conversationId: string;
  };
}

export interface CreateConversationInput {
  participantIds: String[];
}
