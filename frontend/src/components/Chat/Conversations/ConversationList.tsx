import { Box, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useState } from "react";
import ConversationModal from "./Modal/Modal";
import { ConversationPopulated } from "../../../../../backend/src/utils/types";
import ConversationItem from "./ConversationItem";
import { useRouter } from "next/router";

interface IConversationList {
  session: Session;
  conversations: ConversationPopulated[];
  onViewConversation: (conversationId: string) => void;
}

export default function ConversationList({
  session,
  conversations,
  onViewConversation,
}: IConversationList) {
  const router = useRouter();
  const {
    user: { id: userId },
  } = session;

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
        _hover={{ bg: "whiteAlpha.200" }}
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
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          onClick={() => onViewConversation(conversation.id)}
          isSelected={conversation.id === router.query.conversationId}
          userId={userId}
        />
      ))}
    </Box>
  );
}
