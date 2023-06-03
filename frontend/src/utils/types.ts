export interface CreateUserData {
  createUsername: {
    success: boolean;
    error: string;
  };
}

export interface CreateUserVariables {
  username: string;
}

export interface LoginData {
  login: {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
  };
}

export interface LoginVariables {
  userId: string;
}
