import { Box, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import React, { useState } from "react";

interface IMessageInput {
  session: Session;
  conversationId: string;
}

export default function MessageInput({
  session,
  conversationId,
}: IMessageInput) {
  const [messageBody, setMessageBody] = useState("");

  function onSendMessage(event: React.FormEvent) {
    event.preventDefault();

    // TODO: call message here
  }

  return (
    <Box px={4} py={6} width="100%">
      <form onSubmit={() => {}}>
        <Input
          value={messageBody}
          onChange={(event) => setMessageBody(event.target.value)}
          placeholder="New message"
          size="md"
          resize="none"
        />
      </form>
    </Box>
  );
}
