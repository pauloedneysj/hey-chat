import { Box, Flex, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useState } from "react";
import ConversationModal from "./Modal/Modal";
import { ConversationPopulated } from "../../../../../backend/src/utils/types";
import ConversationItem from "./ConversationItem";
import { useRouter } from "next/router";
import SkeletonLoader from "../../common/SkeletonLoader";

interface IConversationList {
  session: Session;
  conversations: ConversationPopulated[];
  onViewConversation: (conversationId: string) => void;
  loading: boolean;
}

export default function ConversationList({
  session,
  conversations,
  onViewConversation,
  loading,
}: IConversationList) {
  const router = useRouter();

  const { id: userId } = session.user;

  const [isOpen, setIsOpen] = useState(false);

  function onOpen() {
    setIsOpen(true);
  }

  function onClose() {
    setIsOpen(false);
  }

  return (
    <Box display="flex" flexFlow="column" width="100%" height="100%">
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
      {loading && (
        <Flex direction="column" gap={2} height="100%">
          <SkeletonLoader count={8} height="20%" />
        </Flex>
      )}
      <Flex
        direction="column"
        scrollBehavior="smooth"
        scrollMarginY="100px"
        overflowY="scroll"
      >
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            onClick={() => onViewConversation(conversation.id)}
            isSelected={conversation.id === router.query.conversationId}
            userId={userId}
          />
        ))}
      </Flex>
    </Box>
  );
}
