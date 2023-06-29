import { createToken } from "../../middleware/auth";
import {
  CreateUsernameResponse,
  GraphQLContext,
  LoginResponse,
  RefreshTokenResponse,
} from "../../utils/types";
import dayjs from "dayjs";
import { ObjectId } from "bson";
import { GraphQLError } from "graphql";
import { User } from "@prisma/client";

const resolvers = {
  Query: {
    searchUsers: async (
      _: any,
      args: { username: string },
      context: GraphQLContext
    ): Promise<User[]> => {
      const { username: searchedUsername } = args;
      const { prisma, userId } = context;

      if (!userId) {
        throw new GraphQLError("Not authenticated");
      }

      const myUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
        },
      });

      const users = await prisma.user.findMany({
        where: {
          username: {
            contains: searchedUsername,
            not: myUser?.username,
            mode: "insensitive",
          },
        },
      });

      return users;
    },
  },
  Mutation: {
    login: async (
      _: any,
      args: { userId: string },
      context: GraphQLContext
    ): Promise<LoginResponse> => {
      const { prisma } = context;
      const { userId } = args;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new GraphQLError("User not found");
      }

      try {
        await prisma.refreshToken.deleteMany({
          where: { userId: user.id },
        });

        const accessToken = createToken(user.id);
        const newObjectId = new ObjectId();
        const expiresIn = dayjs().add(15, "second").unix();

        const refreshToken = await prisma.refreshToken.create({
          data: {
            id: newObjectId.toString(),
            userId: user.id,
            expiresIn,
          },
        });

        return { accessToken, refreshToken: refreshToken.id };
      } catch (error: any) {
        throw new GraphQLError(error?.message);
      }
    },
    refreshToken: async (
      _: any,
      args: { refreshTokenId: string },
      context: GraphQLContext
    ): Promise<RefreshTokenResponse> => {
      const { refreshTokenId } = args;
      const { prisma, userId } = context;

      if (!userId) {
        throw new GraphQLError("Not authenticated");
      }

      const refreshToken = await prisma.refreshToken.findFirst({
        where: { id: refreshTokenId },
      });

      if (!refreshToken) {
        throw new GraphQLError("Refresh token invalid");
      }

      try {
        const refreshTokenExpired = dayjs().isAfter(
          dayjs.unix(refreshToken.expiresIn)
        );

        const accessToken = createToken(refreshToken.userId);

        if (refreshTokenExpired) {
          await prisma.refreshToken.deleteMany({
            where: { userId: refreshToken.userId },
          });

          const expiresIn = dayjs().add(15, "second").unix();

          const newRefreshToken = await prisma.refreshToken.create({
            data: {
              userId: refreshToken.userId,
              expiresIn,
            },
          });

          return { accessToken, refreshToken: newRefreshToken.id };
        }

        return { accessToken };
      } catch (error: any) {
        throw new GraphQLError(error?.message);
      }
    },
    createUsername: async (
      _: any,
      args: { username: string },
      context: GraphQLContext
    ): Promise<CreateUsernameResponse> => {
      const { username } = args;
      const { prisma, userId } = context;

      if (!userId) {
        throw new GraphQLError("Not authorized");
      }

      try {
        const existingUser = await prisma.user.findUnique({
          where: { username },
        });

        if (existingUser) {
          throw new GraphQLError("Username already in use. Try another");
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            username,
          },
        });

        return { success: true };
      } catch (error: any) {
        throw new GraphQLError(error?.message);
      }
    },
  },
  // TODO: Subscription: {},
};

export default resolvers;
