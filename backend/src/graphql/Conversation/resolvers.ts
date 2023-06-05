import { GraphQLContext } from "../../util/types";

const resolvers = {
  Mutation: {
    createConversation: async (
      _: any,
      args: { participantIds: String[] },
      context: GraphQLContext
    ) => {
      console.log(args.participantIds);
    },
  },
};

export default resolvers;
