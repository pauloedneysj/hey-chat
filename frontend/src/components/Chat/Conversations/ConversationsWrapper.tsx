import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";

interface IConversationsWrapper {
  session: Session;
}

export default function ConversationsWrapper({
  session,
}: IConversationsWrapper) {
  return (
    <Box width={{ base: "100%", md: "400px" }} bg="whiteAlpha.50" py={6} px={3}>
      <ConversationList session={session} />
    </Box>
  );
}
