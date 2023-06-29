import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import { json } from "body-parser";
import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLContext, SubscriptionContext } from "./utils/types";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { getUserId, getUserIdByToken } from "./middleware/auth";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { PubSub } from "graphql-subscriptions";

const main = async () => {
  dotenv.config();

  const prisma = new PrismaClient();
  const pubsub = new PubSub();

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql/subscriptions",
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx: SubscriptionContext): Promise<GraphQLContext> => {
        if (ctx.connectionParams && ctx.connectionParams.token) {
          const { token } = ctx.connectionParams;
          const userId = getUserIdByToken(token);

          return { prisma, userId, pubsub };
        }

        return { prisma, userId: null, pubsub };
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  const corsOptions = {
    methods: ["GET", "POST", "OPTIONS"],
    origin: process.env.BASE_URL,
    credentials: true,
  };

  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>(corsOptions),
    json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<GraphQLContext> => {
        const authHeader = req.headers.authorization;
        const userId = authHeader ? getUserId(authHeader) : null;

        return { prisma, userId, pubsub };
      },
    })
  );

  const PORT = 4000;

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
};

main().catch((error) => console.log(error));
