import MessageOperations from "@/src/graphql/operations/message";
import { useMutation } from "@apollo/client";
import { Box, Flex, FormControl, IconButton, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { SendMessageArgs } from "../../../../../../backend/src/utils/types";
import { MessageData } from "@/src/utils/types";
import { IoMdSend } from "react-icons/io";

interface IMessageInput {
  session: Session;
  conversationId: string;
}

export default function MessageInput({
  session,
  conversationId,
}: IMessageInput) {
  const [messageBody, setMessageBody] = useState("");
  const [sendMessage] = useMutation<{ sendMessage: boolean }, SendMessageArgs>(
    MessageOperations.Mutations.sendMessage
  );

  async function onSendMessage(event: React.FormEvent) {
    event.preventDefault();

    try {
      const { id: senderId } = session.user;
      const newMessage: SendMessageArgs = {
        senderId,
        conversationId,
        body: messageBody,
      };

      setMessageBody("");

      const { data, errors } = await sendMessage({
        variables: { ...newMessage },
        optimisticResponse: {
          sendMessage: true,
        },
        update: (cache) => {
          const existing = cache.readQuery<MessageData>({
            query: MessageOperations.Queries.messages,
            variables: { conversationId },
          }) as MessageData;

          cache.writeQuery<MessageData>({
            query: MessageOperations.Queries.messages,
            variables: { conversationId },
            data: {
              ...existing,
              messages: [
                {
                  // ID is set by the backend
                  id: "",
                  body: messageBody,
                  senderId: session.user.id,
                  conversationId,
                  sender: {
                    id: session.user.id,
                    username: session.user.username,
                  },
                  createdAt: new Date(Date.now()),
                  updatedAt: new Date(Date.now()),
                },
                ...existing?.messages,
              ],
            },
          });
        },
      });

      if (!data?.sendMessage || errors) {
        throw new Error("Failed to send message");
      }
    } catch (error: any) {
      console.log("Error sending message:", error);
      toast.error(error?.message);
    }
  }

  return (
    <Box px={4} py={6} width="100%">
      <form onSubmit={onSendMessage}>
        <Flex gap={2}>
          <Input
            value={messageBody}
            onChange={(event) => setMessageBody(event.target.value)}
            placeholder="New message"
            size="md"
            resize="none"
          />
          <IconButton
            aria-label="Send message"
            type="submit"
            pointerEvents={messageBody ? "auto" : "none"}
            disabled={!messageBody}
            variant="ghost"
            icon={<IoMdSend color={!messageBody ? "gray" : "white"} />}
          />
        </Flex>
      </form>
    </Box>
  );
}
