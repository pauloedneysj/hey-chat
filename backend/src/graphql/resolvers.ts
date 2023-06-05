import userResolvers from "./User/resolvers";
import conversationResolvers from "./Conversation/resolvers";
import merge from "lodash.merge";

const resolvers = merge({}, userResolvers, conversationResolvers);

export default resolvers;
