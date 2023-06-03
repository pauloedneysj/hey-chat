import { createToken } from "../../middleware/auth";
import {
  CreateUsernameResponse,
  GraphQLContext,
  LoginResponse,
  RefreshTokenResponse,
} from "../../util/types";
import dayjs from "dayjs";
import { ObjectId } from "bson";

const resolvers = {
  Query: {
    searchUsers: async (
      _: any,
      args: { username: string },
      context: GraphQLContext
    ) => {
      const { username } = args;
      const { prisma, userId } = context;

      if (!userId) {
        throw new Error("Not authenticated");
      }

      const users = await prisma.user.findMany({
        where: { username },
        select: {
          username: true,
          id: true,
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

      if (!user) return { error: "User not found" };

      const newObjectId = new ObjectId();
      const expiresIn = dayjs().add(15, "second").unix();

      try {
        const accessToken = createToken(user.id);
        const refreshToken = await prisma.refreshToken.create({
          data: {
            id: newObjectId.toString(),
            userId: user.id,
            expiresIn,
          },
        });

        return { accessToken, refreshToken: refreshToken.id };
      } catch (error: any) {
        console.error("login Error =>", error);

        return { error: error?.message };
      }
    },
    refreshToken: async (
      _: any,
      args: { refreshTokenId: string },
      context: GraphQLContext
    ): Promise<RefreshTokenResponse> => {
      const { refreshTokenId } = args;
      const { prisma } = context;

      const refreshToken = await prisma.refreshToken.findFirst({
        where: { id: refreshTokenId },
      });

      if (!refreshToken) return { error: "Refresh token invalid" };

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
    },
    createUsername: async (
      _: any,
      args: { username: string },
      context: GraphQLContext
    ): Promise<CreateUsernameResponse> => {
      const { username } = args;
      const { prisma, userId } = context;

      if (!userId) {
        return {
          error: "Not authorized",
        };
      }

      try {
        const existingUser = await prisma.user.findUnique({
          where: { username },
        });

        if (existingUser) {
          return {
            error: "Username already in use. Try another",
          };
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            username,
          },
        });

        return { success: true };
      } catch (error: any) {
        console.log("createUsername Error =>", error);

        return { error: error?.message };
      }
    },
  },
  // TODO: Subscription: {},
};

export default resolvers;
