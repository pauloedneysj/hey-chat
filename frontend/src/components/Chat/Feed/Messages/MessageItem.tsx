import { MessagePopulated } from "@/src/utils/types";
import { Avatar, Box, Flex, Stack, Text } from "@chakra-ui/react";

interface IMessageItem {
  message: MessagePopulated;
  sentByMe: boolean;
}

export default function MessageItem({ message, sentByMe }: IMessageItem) {
  function formatRelativeLocale(date: string) {
    const parsedDate = new Date(date);
    const time = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(parsedDate);
    const day = Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
    }).format(parsedDate);
    return `${day} at ${time}`;
  }

  return (
    <Stack
      direction="row"
      p={4}
      spacing={4}
      _hover={{ bg: "whiteAlpha.200" }}
      justify={sentByMe ? "flex-end" : "flex-start"}
      wordBreak="break-word"
    >
      {!sentByMe && (
        <Flex align="flex-end">
          <Avatar size="sm" />
        </Flex>
      )}
      <Stack spacing={1} width="100%">
        <Flex justify={sentByMe ? "flex-end" : "flex-start"}>
          <Box
            bg={sentByMe ? "blue.500" : "whiteAlpha.300"}
            maxWidth="65%"
            px={4}
            py={2}
            borderRadius={`20px 20px 
          ${!sentByMe ? "20px" : "0"} 
          ${!sentByMe ? "0" : "20px"}`}
          >
            <Text>{message.body}</Text>
          </Box>
        </Flex>
        <Stack
          direction="row"
          align="center"
          justify={sentByMe ? "flex-end" : "flex-start"}
        >
          {!sentByMe && (
            <Text fontWeight={500} textAlign="left">
              {message.sender.username}
            </Text>
          )}
          <Text fontSize={14} color="whiteAlpha.700">
            {formatRelativeLocale(message.createdAt as unknown as string)}
          </Text>
        </Stack>
      </Stack>
    </Stack>
  );
}
