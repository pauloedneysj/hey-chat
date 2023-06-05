import { PrismaClient } from "@prisma/client";

export interface GraphQLContext {
  prisma: PrismaClient;
  userId: string | null;
}

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
