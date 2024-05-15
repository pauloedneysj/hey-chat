import { useConversation } from "@/src/context/conversation.context";
import ConversationOperations from "@/src/graphql/operations/conversation";
import MessageOperations from "@/src/graphql/operations/message";
import { userIsOnline } from "@/src/utils/functions";
import {
  ConversationDeletedData,
  ConversationPopulated,
  ConversationsData,
  ConversationUpdatedData,
  lastSeenUpdatedData,
  MessageData,
  ParticipantPopulated,
  UpdateLastSeenArgs,
  UpdateLastSeenResponse,
} from "@/src/utils/types";
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import ConversationList from "./ConversationList";

interface IConversationsWrapper {
  session: Session;
}

export default function ConversationsWrapper({
  session,
}: IConversationsWrapper) {
  const { id: userId } = session.user;

  const { conversationId, setConversationId } = useConversation();

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const {
    data: conversationsData,
    loading: conversationsLoading,
    subscribeToMore,
  } = useQuery<ConversationsData>(ConversationOperations.Queries.conversations);

  const [markConversationAsRead] = useMutation<
    { markConversationAsRead: boolean },
    { userId: string; conversationId: string }
  >(ConversationOperations.Mutations.markConversationAsRead);

  const [updateLastSeen] = useMutation<
    UpdateLastSeenResponse,
    UpdateLastSeenArgs
  >(ConversationOperations.Mutations.updateLastSeen);

  useSubscription<ConversationUpdatedData>(
    ConversationOperations.Subscriptions.conversationUpdated,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;

        if (!subscriptionData) return;

        const {
          conversationUpdated: {
            conversation: updatedConversation,
            addedUserIds,
            removedUserIds,
          },
        } = subscriptionData;

        const { id: updatedConversationId, latestMessage } =
          updatedConversation;

        /**
         * Check if user is being removed
         */
        if (removedUserIds && removedUserIds.length) {
          const isBeingRemoved = removedUserIds.find((id) => id === userId);

          if (isBeingRemoved) {
            const conversationsData = client.readQuery<ConversationsData>({
              query: ConversationOperations.Queries.conversations,
            });

            if (!conversationsData) return;

            client.writeQuery<ConversationsData>({
              query: ConversationOperations.Queries.conversations,
              data: {
                conversations: conversationsData.conversations.filter(
                  (c) => c.id !== updatedConversationId
                ),
              },
            });

            if (conversationId === updatedConversationId) {
              setConversationId(undefined);
            }

            /**
             * Early return - no more updates required
             */
            return;
          }
        }

        /**
         * Check if user is being added to conversation
         */
        if (addedUserIds && addedUserIds.length) {
          const isBeingAdded = addedUserIds.find((id) => id === userId);

          if (isBeingAdded) {
            const conversationsData = client.readQuery<ConversationsData>({
              query: ConversationOperations.Queries.conversations,
            });

            if (!conversationsData) return;

            client.writeQuery<ConversationsData>({
              query: ConversationOperations.Queries.conversations,
              data: {
                conversations: [
                  ...(conversationsData.conversations || []),
                  updatedConversation,
                ],
              },
            });
          }
        }

        /**
         * Already viewing conversation where
         * new message is received; no need
         * to manually update cache due to
         * message subscription
         */
        if (updatedConversationId === conversationId) {
          onViewConversation(conversationId, false);
          return;
        }

        const existing = client.readQuery<MessageData>({
          query: MessageOperations.Queries.messages,
          variables: { conversationId: updatedConversationId },
        });

        if (!existing) return;

        /**
         * Check if lastest message is already present
         * in the message query
         */
        const hasLatestMessage = existing.messages.find(
          (m) => m.id === latestMessage.id
        );

        /**
         * Update query as re-fetch won't happen if you
         * view a conversation you've already viewed due
         * to caching
         */
        if (!hasLatestMessage) {
          client.writeQuery<MessageData>({
            query: MessageOperations.Queries.messages,
            variables: { conversationId: updatedConversationId },
            data: {
              ...existing,
              messages: [latestMessage, ...existing.messages],
            },
          });
        }
      },
    }
  );

  useSubscription<ConversationDeletedData>(
    ConversationOperations.Subscriptions.conversationDeleted,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;

        if (!subscriptionData) return;

        const existing = client.readQuery<ConversationsData>({
          query: ConversationOperations.Queries.conversations,
        });

        if (!existing) return;

        const { conversations } = existing;
        const {
          conversationDeleted: { id: deletedConversationId },
        } = subscriptionData;

        client.writeQuery<ConversationsData>({
          query: ConversationOperations.Queries.conversations,
          data: {
            conversations: conversations.filter(
              (conversation) => conversation.id !== deletedConversationId
            ),
          },
        });
      },
    }
  );

  useSubscription<lastSeenUpdatedData>(
    ConversationOperations.Subscriptions.lastSeenUpdated,
    {
      onData: ({ client, data }) => {
        const { data: subscriptionData } = data;

        console.log("subscriptionData: ", subscriptionData);

        if (!subscriptionData) return;

        const {
          lastSeenUpdated: { participants },
        } = subscriptionData;

        let updatedOnlineUsers: string[] = [];

        participants.map((participant) => {
          const isOnline = userIsOnline(
            participant.lastSeen as unknown as string
          );
          if (isOnline) updatedOnlineUsers.push(participant.user.id);
        });

        setOnlineUsers(updatedOnlineUsers);
      },
    }
  );

  async function onViewConversation(
    conversationId: string,
    hasSeenLatestMessage: boolean | undefined
  ) {
    setConversationId(conversationId);

    if (hasSeenLatestMessage) return;

    try {
      await markConversationAsRead({
        variables: {
          userId,
          conversationId,
        },
        optimisticResponse: {
          markConversationAsRead: true,
        },
        refetchQueries: [
          {
            query: ConversationOperations.Queries.conversations,
          },
        ],
        update: (cache) => {
          /**
           * Get conversation participants
           * from cache
           */
          const participantsFragment = cache.readFragment<{
            participants: ParticipantPopulated[];
          }>({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment Participants on Conversation {
                participants {
                  user {
                    id
                    username
                  }
                  hasSeenLatestMessage
                }
              }
            `,
          });

          if (!participantsFragment) return;

          /**
           * Create copy to
           * allow mutation
           */
          const participants = [...participantsFragment.participants];

          const userParticipantIdx = participants.findIndex(
            (p) => p.user.id === userId
          );

          /**
           * Should always be found
           * but just in case
           */
          if (userParticipantIdx === -1) return;

          const userParticipant = participants[userParticipantIdx];

          /**
           * Update user to show latest
           * message as read
           */
          participants[userParticipantIdx] = {
            ...userParticipant,
            hasSeenLatestMessage: true,
          };

          /**
           * Update cache
           */
          cache.writeFragment({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment UpdatedParticipants on Conversation {
                participants
              }
            `,
            data: {
              participants,
            },
          });
        },
      });
    } catch (error) {
      console.log("onViewConversation error", error);
    }
  }

  function subscribeToNewConversations() {
    subscribeToMore({
      document: ConversationOperations.Subscriptions.conversationCreated,
      updateQuery: (
        prev,
        {
          subscriptionData,
        }: {
          subscriptionData: {
            data: { conversationCreated: ConversationPopulated };
          };
        }
      ) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const newConversation = subscriptionData.data.conversationCreated;

        if (
          prev.conversations.some(
            (conversation) => conversation.id === newConversation.id
          )
        ) {
          return prev;
        }

        return Object.assign({}, prev, {
          conversations: [...prev.conversations, newConversation],
        });
      },
    });
  }

  useEffect(() => {
    subscribeToNewConversations();
  }, []);

  useEffect(() => {
    const now = new Date();

    const timer = setInterval(() => {
      updateLastSeen({
        variables: {
          lastSeen: now,
        },
      });
    }, 20000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      display={{ base: conversationId ? "none" : "flex", md: "flex" }}
      width={{ base: "100%", md: "400px" }}
      bg="whiteAlpha.50"
      py={6}
      px={3}
      overflow="hidden"
    >
      <ConversationList
        session={session}
        conversations={conversationsData?.conversations ?? []}
        onViewConversation={onViewConversation}
        loading={conversationsLoading}
      />
    </Box>
  );
}
