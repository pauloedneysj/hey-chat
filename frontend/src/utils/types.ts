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
    token?: string;
    success?: boolean;
    error?: string;
  };
}

export interface LoginVariables {
  userId: string;
}
