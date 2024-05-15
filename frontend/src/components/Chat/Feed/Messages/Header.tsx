import { useQuery } from "@apollo/client";
import { Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import ConversationOperations from "../../../../graphql/operations/conversation";
import { formatUsernames } from "../../../../utils/functions";
import { ConversationsData } from "../../../../utils/types";
import SkeletonLoader from "../../../common/SkeletonLoader";
import { IoClose } from "react-icons/io5";
import { useConversation } from "@/src/context/conversation.context";

interface IMessagesHeader {
  userId: string;
  conversationId: string;
}

export default function MessagesHeader({
  userId,
  conversationId,
}: IMessagesHeader) {
  const { setConversationId } = useConversation();
  const { data, loading } = useQuery<ConversationsData>(
    ConversationOperations.Queries.conversations
  );

  const conversation = data?.conversations.find(
    (conversation) => conversation.id === conversationId
  );

  if (data?.conversations && !loading && !conversation) {
    setConversationId(undefined);
  }

  return (
    <Stack
      justify="space-between"
      direction="row"
      align="center"
      spacing={6}
      py={5}
      px={{ base: 4, md: 4 }}
      borderBottom="1px solid"
      borderColor="whiteAlpha.200"
    >
      {loading && <SkeletonLoader count={1} height="30px" width="320px" />}
      {!conversation && !loading && <Text>Conversation Not Found</Text>}
      {conversation && (
        <Stack direction="row">
          <Text color="whiteAlpha.600">To: </Text>
          <Text fontWeight={600}>
            {formatUsernames(conversation.participants, userId)}
          </Text>
        </Stack>
      )}
      <Button
        display={{ md: "none" }}
        onClick={() => setConversationId(undefined)}
      >
        Back
      </Button>
      <Flex display={{ base: "none", md: "flex" }}>
        <IoClose
          size={24}
          cursor="pointer"
          onClick={() => setConversationId(undefined)}
        />
      </Flex>
    </Stack>
  );
}
