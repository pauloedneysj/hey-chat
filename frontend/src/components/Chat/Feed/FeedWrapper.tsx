import { Button, Flex } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import MessagesHeader from "./Messages/Header";

interface IFeedWrapper {
  session: Session;
}

export default function FeedWrapper({ session }: IFeedWrapper) {
  const router = useRouter();
  const { conversationId } = router.query;
  const {
    user: { id: userId },
  } = session;

  return (
    <Flex
      display={{ base: conversationId ? "flex" : "none", md: "flex" }}
      width="100%"
      direction="column"
    >
      {conversationId && typeof conversationId === "string" ? (
        <Flex
          direction="column"
          justify="space-between"
          overflow="hidden"
          flexGrow={1}
        >
          <MessagesHeader conversationId={conversationId} userId={userId} />
          {/* {conversationId} */}
        </Flex>
      ) : (
        <Flex>No Conversation Selected</Flex>
      )}
    </Flex>
  );
}
