import { useConversation } from "@/src/context/conversation.context";
import { Flex } from "@chakra-ui/react";
import { Session } from "next-auth";
import MessagesHeader from "./Messages/Header";
import MessageInput from "./Messages/Input";
import Messages from "./Messages/Messages";

interface IFeedWrapper {
  session: Session;
}

export default function FeedWrapper({ session }: IFeedWrapper) {
  const { conversationId } = useConversation();

  const {
    user: { id: userId },
  } = session;

  return (
    <Flex
      display={{ base: conversationId ? "flex" : "none", md: "flex" }}
      width="100%"
      direction="column"
    >
      {conversationId && typeof conversationId === "string" ? (
        <>
          <Flex
            direction="column"
            justify="space-between"
            overflow="hidden"
            flexGrow={1}
          >
            <MessagesHeader conversationId={conversationId} userId={userId} />
            <Messages userId={userId} conversationId={conversationId} />
          </Flex>
          <MessageInput session={session} conversationId={conversationId} />
        </>
      ) : (
        <Flex align="center" justify="center" height="100%">
          <span className="text-3xl text-gray-400 font-bold m-auto ">
            Select a conversation
          </span>
        </Flex>
      )}
    </Flex>
  );
}
