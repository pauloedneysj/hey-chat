import { Box, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useState } from "react";
import ConversationModal from "./Modal/Modal";

interface IConversationList {
  session: Session;
}

export default function ConversationList({ session }: IConversationList) {
  const [isOpen, setIsOpen] = useState(false);

  function onOpen() {
    setIsOpen(true);
  }
  function onClose() {
    setIsOpen(false);
  }

  return (
    <Box width="100%">
      <Box
        py={2}
        px={4}
        mb={4}
        borderRadius={10}
        bg="blackAlpha.300"
        cursor="pointer"
        onClick={onOpen}
      >
        <Text align="center" color="whiteAlpha.800" fontWeight={500}>
          Find or start a conversation
        </Text>
        <ConversationModal
          session={session}
          isOpen={isOpen}
          onClose={onClose}
        />
      </Box>
    </Box>
  );
}
