import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationList from "./ConversationList";
import { useQuery } from "@apollo/client";
import ConversationOperations from "@/src/graphql/operations/conversation";
import { ConversationsData } from "@/src/utils/types";
import { ConversationPopulated } from "../../../../../backend/src/utils/types";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";

interface IConversationsWrapper {
  session: Session;
}

export default function ConversationsWrapper({
  session,
}: IConversationsWrapper) {
  const router = useRouter();
  const {
    query: { conversationId },
  } = router;

  const {
    data: conversationsData,
    error: conversationsError,
    loading: conversationsLoading,
    subscribeToMore,
  } = useQuery<ConversationsData>(ConversationOperations.Queries.conversations);

  const conversations = useMemo(() => {
    return conversationsData?.conversations ?? [];
  }, [conversationsData?.conversations]);

  async function onViewConversation(conversationId: string) {
    router.push({ query: { conversationId } });
  }

  function subscribeToNewConversations() {
    subscribeToMore({
      document: ConversationOperations.Subscription.conversationCreated,
      updateQuery: (
        previousResult,
        {
          subscriptionData,
        }: {
          subscriptionData: {
            data: { conversationCreated: ConversationPopulated };
          };
        }
      ) => {
        if (!subscriptionData.data) {
          return previousResult;
        }

        return Object.assign({}, previousResult, {
          conversations: [
            ...previousResult.conversations,
            subscriptionData.data.conversationCreated,
          ],
        });
      },
    });
  }

  useEffect(() => {
    subscribeToNewConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      display={{ base: conversationId ? "none" : "flex", md: "flex" }}
      width={{ base: "100%", md: "400px" }}
      bg="whiteAlpha.50"
      py={6}
      px={3}
    >
      <ConversationList
        session={session}
        conversations={conversations}
        onViewConversation={onViewConversation}
      />
    </Box>
  );
}
