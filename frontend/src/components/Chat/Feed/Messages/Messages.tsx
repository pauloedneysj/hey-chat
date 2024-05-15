import Loading from "@/src/components/UI/Loading/Loading";
import MessageOperations from "@/src/graphql/operations/message";
import {
  MessageData,
  MessageSubscriptionData,
  MessageVariables,
} from "@/src/utils/types";
import { useQuery } from "@apollo/client";
import { Flex } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import MessageItem from "./MessageItem";

interface IMessages {
  userId: string;
  conversationId: string;
}

export default function Messages({ userId, conversationId }: IMessages) {
  const { data, loading, subscribeToMore } = useQuery<
    MessageData,
    MessageVariables
  >(MessageOperations.Queries.messages, {
    variables: {
      conversationId,
    },
    onError: ({ message }) => toast.error(message),
  });

  const messages = useMemo(() => {
    return data?.messages ?? [];
  }, [data?.messages]);

  // Subscribe to new messages
  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: MessageOperations.Subscriptions.messageSent,
      variables: { conversationId },
      updateQuery: (prev, { subscriptionData }: MessageSubscriptionData) => {
        if (!subscriptionData) return prev;

        const newMessage = subscriptionData.data.messageSent;

        return Object.assign({}, prev, {
          messages:
            newMessage.sender.id === userId
              ? prev.messages
              : [newMessage, ...prev.messages],
        });
      },
    });
    return () => unsubscribe();
  }, [conversationId]);

  return (
    <Flex direction="column" justify="flex-end" overflow="hidden">
      {loading && <Loading />}
      {messages && (
        <Flex
          direction="column-reverse"
          overflowY="auto"
          height="100%"
          sx={{
            "::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              sentByMe={message.sender.id === userId}
            />
          ))}
        </Flex>
      )}
    </Flex>
  );
}
