import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { PrismaClient } from "@prisma/client";
import { json } from "body-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { PubSub } from "graphql-subscriptions";
import { useServer } from "graphql-ws/lib/use/ws";
import http from "http";
import { WebSocketServer } from "ws";
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/typeDefs";
import { getUserId, getUserIdByToken } from "./middleware/auth";
import { GraphQLContext, SubscriptionContext } from "./utils/types";

const main = async () => {
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
        if (ctx.connectionParams.token) {
          const { token } = ctx.connectionParams;
          const userId = getUserIdByToken(token);

          return { prisma, userId, pubsub };
        } else {
          throw new Error("Unauthorized");
        }
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
