import { Flex } from "@chakra-ui/react";
import ConversationsWrapper from "./Conversations/ConversationsWrapper";
import FeedWrapper from "./Feed/FeedWrapper";
import { Session } from "next-auth";

interface IChat {
  session: Session;
}

export default function Chat({ session }: IChat) {
  // function handleSignOut() {
  //   localStorage.removeItem("graphql-token");
  //   signOut();
  // }

  return (
    <Flex height="100vh">
      <ConversationsWrapper session={session} />
      <FeedWrapper session={session} />
    </Flex>
  );
}
