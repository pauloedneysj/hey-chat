import jwt from "jsonwebtoken";
import { JwtPayload } from "../utils/types";
import { GraphQLError } from "graphql";

export const APP_SECRET = "secret";

export const createToken = (id: string) => {
  return jwt.sign({ userId: id }, APP_SECRET, {
    expiresIn: "1h",
  });
};

function getTokenPayload(token: string) {
  return jwt.verify(token, APP_SECRET) as JwtPayload;
}

export function getUserId(authHeader: string) {
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      throw new Error("No token found");
    }

    const { userId } = getTokenPayload(token);

    return userId;
  }

  throw new Error("Not authenticated");
}

export function getUserIdByToken(token: string | null) {
  if (!token) {
    throw new GraphQLError("No token found");
  }

  const { userId } = getTokenPayload(token);

  return userId;
}
