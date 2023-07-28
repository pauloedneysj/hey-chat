import { Avatar, Box, Flex, Stack, Text } from "@chakra-ui/react";
import { ConversationPopulated } from "../../../../../backend/src/utils/types";
import { formatUsernames } from "@/src/utils/functions";
import { formatRelative } from "date-fns";
import { enUS } from "date-fns/locale";
import { useRouter } from "next/router";

const formatRelativeLocale = {
  lastWeek: "eeee",
  yesterday: "'Yesterday",
  today: "p",
  other: "MM/dd/yy",
};

interface IConversationItem {
  userId: string;
  conversation: ConversationPopulated;
  onClick: () => void;
  isSelected: boolean;
}

export default function ConversationItem({
  conversation,
  onClick,
  isSelected,
  userId,
}: IConversationItem) {
  const router = useRouter();

  return (
    <Stack
      width="100%"
      direction="row"
      justify="space-between"
      p={4}
      cursor="pointer"
      borderRadius={4}
      bg={isSelected ? "whiteAlpha.200" : "none"}
      _hover={{ bg: "whiteAlpha.200" }}
      position="relative"
      onClick={onClick}
    >
      <Avatar />
      <Flex justify="space-between" height="100%">
        <Flex align="center" width={{ base: "280px", md: "120px" }}>
          <Text
            fontWeight={600}
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            overflow="hidden"
          >
            {formatUsernames(conversation.participants, userId)}
          </Text>
          {conversation.latestMessage && (
            <Box width="140%">
              <Text
                color="whiteAlpha.700"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {conversation.latestMessage.body}
              </Text>
            </Box>
          )}
        </Flex>
        <Flex align="center">
          <Text color="whiteAlpha.700" textAlign="right">
            {formatRelative(new Date(conversation.updatedAt), new Date(), {
              locale: {
                ...enUS,
                formatRelative: (token) =>
                  formatRelativeLocale[
                    token as keyof typeof formatRelativeLocale
                  ],
              },
            })}
          </Text>
        </Flex>
      </Flex>
    </Stack>
  );
}
