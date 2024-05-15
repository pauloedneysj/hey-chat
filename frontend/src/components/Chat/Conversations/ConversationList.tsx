import { Avatar, Box, Flex, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { ConversationPopulated } from "../../../../../backend/src/utils/types";
import SkeletonLoader from "../../common/SkeletonLoader";
import ConversationItem from "./ConversationItem";
import ConversationModal from "./Modal/Modal";
import { useConversation } from "@/src/context/conversation.context";
import { signOut } from "next-auth/react";
import { CiSearch } from "react-icons/ci";
import { LuLogOut } from "react-icons/lu";
import { compareDesc } from "date-fns";
import { title } from "process";

interface IConversationList {
  session: Session;
  conversations: ConversationPopulated[];
  onViewConversation: (
    conversationId: string,
    hasSeenLatestMessage: boolean | undefined
  ) => void;
  loading: boolean;
}

export default function ConversationList({
  session,
  conversations,
  onViewConversation,
  loading,
}: IConversationList) {
  const { conversationId } = useConversation();

  const { id: userId } = session.user;

  const [isOpen, setIsOpen] = useState(false);

  function onOpen() {
    setIsOpen(true);
  }

  function onClose() {
    setIsOpen(false);
  }

  useEffect(() => {
    /**
     * If conversation is selected
     * check if the user has seen
     * the latest message
     */
    if (conversationId) {
      sortedConvesations.map((conversation) => {
        if (conversation.id === conversationId) {
          const participant = conversation.participants.find(
            (p) => p.user.id === userId
          );

          if (participant) {
            onViewConversation(
              conversation.id,
              participant?.hasSeenLatestMessage
            );
          }
        }
      });
    }
  }, [conversations]);

  const sortedConvesations = [...conversations].sort((a, b) =>
    compareDesc(a.updatedAt, b.updatedAt)
  );

  return (
    <Box
      display="flex"
      flexFlow="column"
      width="100%"
      height="100%"
      overflowY="auto"
      sx={{
        "::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <Flex
        width="100%"
        justify="space-between"
        align="center"
        py={2}
        px={2}
        mb={2}
      >
        <Flex align="center" gap={2}>
          <Avatar size={"sm"} src={session.user.image as string} />
          <Text
            align="left"
            color="whiteAlpha.800"
            fontWeight="bold"
            fontSize={18}
          >
            {session.user.username}
          </Text>
        </Flex>
        <LuLogOut
          size={18}
          cursor="pointer"
          onClick={() => signOut()}
          title="Sign out"
        />
      </Flex>
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
        <Flex align="center" justify="center" gap={2}>
          <Text align="center" color="whiteAlpha.800" fontWeight={500}>
            Find or start a conversation
          </Text>
          <CiSearch size={16} onClick={onOpen} cursor="pointer" />
        </Flex>
        <ConversationModal
          session={session}
          isOpen={isOpen}
          onClose={onClose}
        />
      </Box>
      {loading ? (
        <Flex direction="column" gap={2} height="100%">
          <SkeletonLoader count={6} height="20%" />
        </Flex>
      ) : (
        <Flex direction="column">
          {sortedConvesations.map((conversation) => {
            const participant = conversation.participants.find(
              (p) => p.user.id === userId
            );

            return (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                onClick={() => {
                  onViewConversation(
                    conversation.id,
                    participant?.hasSeenLatestMessage
                  );
                }}
                isSelected={conversation.id === conversationId}
                hasSeenLatestMessage={participant?.hasSeenLatestMessage}
                userId={userId}
              />
            );
          })}
        </Flex>
      )}
    </Box>
  );
}
