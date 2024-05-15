import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { formatUsernames } from "@/src/utils/functions";
import { Avatar, Flex, Stack, Text } from "@chakra-ui/react";
import { formatRelative } from "date-fns";
import { enUS } from "date-fns/locale";
import { ConversationPopulated } from "../../../../../backend/src/utils/types";
import { useConversation } from "@/src/context/conversation.context";

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
  hasSeenLatestMessage: boolean | undefined;
}

export default function ConversationItem({
  conversation,
  onClick,
  isSelected,
  userId,
  hasSeenLatestMessage,
}: IConversationItem) {
  const { conversationId } = useConversation();

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <Stack
            position="relative"
            direction="row"
            justify="center"
            p={4}
            spacing={4}
            borderRadius={4}
            cursor="pointer"
            bg={isSelected ? "whiteAlpha.200" : "none"}
            _hover={{ bg: "whiteAlpha.200" }}
            onClick={onClick}
          >
            {hasSeenLatestMessage === false &&
              conversationId !== conversation.id && (
                <Flex position="absolute" left={0} top={"45%"} ml={1}>
                  <Flex
                    width={2}
                    height={2}
                    backgroundColor="#6b46c1"
                    borderRadius="full"
                  />
                </Flex>
              )}
            <Avatar />
            <Flex direction="column" width="75%">
              <Flex justify="space-between">
                <Text
                  fontWeight={600}
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                  overflow="hidden"
                  title={
                    conversation.name ??
                    formatUsernames(conversation.participants, userId)
                  }
                >
                  {conversation.name ??
                    formatUsernames(conversation.participants, userId)}
                </Text>
                <Text color="whiteAlpha.700" textAlign="right">
                  {formatRelative(
                    new Date(conversation.updatedAt),
                    new Date(),
                    {
                      locale: {
                        ...enUS,
                        formatRelative: (token) =>
                          formatRelativeLocale[
                            token as keyof typeof formatRelativeLocale
                          ],
                      },
                    }
                  )}
                </Text>
              </Flex>
              <Text
                // color="whiteAlpha.700"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                overflow="hidden"
              >
                {conversation.latestMessage?.body}
              </Text>
            </Flex>
          </Stack>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Edit</ContextMenuItem>
          <ContextMenuItem>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}
