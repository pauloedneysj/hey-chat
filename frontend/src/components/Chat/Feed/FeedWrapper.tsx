import { Flex } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";

interface IFeedWrapper {
  session: Session;
}

export default function FeedWrapper({ session }: IFeedWrapper) {
  const router = useRouter();
  const { conversationId } = router.query;

  return (
    <Flex
      display={{ base: conversationId ? "flex" : "none", md: "flex" }}
      width="100%"
      direction="column"
    >
      {conversationId ? (
        <Flex>{conversationId}</Flex>
      ) : (
        <Flex>No Conversation Selected</Flex>
      )}
    </Flex>
  );
}
