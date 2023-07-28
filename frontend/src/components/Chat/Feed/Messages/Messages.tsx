import Loading from "@/src/components/UI/Loading/Loading";
import MessageOperations from "@/src/graphql/operations/message";
import { MessageData, MessageVariables } from "@/src/utils/types";
import { useQuery } from "@apollo/client";
import { Flex } from "@chakra-ui/react";
import { useMemo } from "react";
import { toast } from "react-hot-toast";

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

  return (
    <Flex direction="column" justify="flex-end" overflow="hidden">
      {loading && <Loading />}
      {messages && (
        <Flex direction="column-reverse" overflowY="scroll" height="100%">
          {messages.map((message) => (
            <div key={message.id}>{message.body}</div>
          ))}
        </Flex>
      )}
    </Flex>
  );
}
