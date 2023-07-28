import userResolvers from "./User/resolvers";
import conversationResolvers from "./Conversation/resolvers";
import messageResolvers from "./Message/resolvers";
import merge from "lodash.merge";

const resolvers = merge(
  {},
  userResolvers,
  conversationResolvers,
  messageResolvers
);

export default resolvers;
