import UserOperations from "@/src/graphql/operations/user";
import ConversationOperations from "@/src/graphql/operations/conversation";

import {
  CreateConversationData,
  CreateConversationInput,
  SearchUsersData,
  SearchUsersInput,
  SearchedUser,
} from "@/src/utils/types";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  Button,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Modal,
  Stack,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import UserSearchList from "./UserSearchList";
import Participants from "./Participants";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useConversation } from "@/src/context/conversation.context";

interface IModal {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConversationModal({
  session,
  isOpen,
  onClose,
}: IModal) {
  const { id: currentUserId } = session.user;

  const { setConversationId } = useConversation();

  const [conversationName, setConversationName] = useState<string | undefined>(
    undefined
  );
  const [username, setUsername] = useState("");
  const [participants, setParticipants] = useState<SearchedUser[]>([]);

  const [searchUsers, { data: searchUsersData, loading: searchUsersLoading }] =
    useLazyQuery<SearchUsersData, SearchUsersInput>(
      UserOperations.Queries.searchUsers,
      {
        onCompleted: () => toast.success("Search successfully"),
        onError: (error) => toast.error(error.message),
      }
    );

  const [createConversation, { loading: createConversationLoading }] =
    useMutation<CreateConversationData, CreateConversationInput>(
      ConversationOperations.Mutations.createConversation,
      {
        onCompleted: ({ createConversation: { conversationId } }) => {
          setConversationId(conversationId);
          setParticipants([]);
          setConversationName(undefined);
          setUsername("");
          onClose();
        },
        onError: ({ message }) => toast.error(message),
      }
    );

  async function onSearch(event: React.FormEvent) {
    event.preventDefault();
    await searchUsers({ variables: { username } });
  }

  async function onCreateConversation() {
    const participantIds = [
      currentUserId,
      ...participants.map((participant) => participant.id),
    ];

    await createConversation({
      variables: { participantIds, conversationName },
    });
  }

  function addParticipant(user: SearchedUser) {
    setParticipants((prev) => [...prev, user]);
  }

  function removeParticipant(userId: string) {
    setParticipants((prev) =>
      prev.filter((participant) => participant.id !== userId)
    );
  }

  function participantAlreadyAdded(userId: string): boolean {
    return participants.some((participant) => participant.id === userId);
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New conversation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Input
                placeholder="Enter a username"
                onChange={(event) => setUsername(event.target.value)}
              />
              <Button
                onClick={onSearch}
                isLoading={searchUsersLoading}
                isDisabled={!username}
              >
                Search
              </Button>
              <UserSearchList
                searchedUsers={searchUsersData?.searchUsers}
                addParticipant={addParticipant}
                participantAlreadyAdded={participantAlreadyAdded}
              />
              {participants.length !== 0 && (
                <>
                  <Participants
                    participants={participants}
                    removeParticipant={removeParticipant}
                  />
                  {participants.length >= 2 && (
                    <Input
                      placeholder="Enter a conversation name"
                      onChange={(event) =>
                        setConversationName(event.target.value)
                      }
                    />
                  )}
                  {participants.length >= 2 ? (
                    <Button
                      colorScheme="blue"
                      mt={6}
                      onClick={onCreateConversation}
                      isLoading={createConversationLoading}
                      isDisabled={!conversationName}
                    >
                      Create a conversation
                    </Button>
                  ) : (
                    <Button
                      colorScheme="blue"
                      mt={6}
                      onClick={onCreateConversation}
                      isLoading={createConversationLoading}
                      isDisabled={participants.length === 0}
                    >
                      Create a conversation
                    </Button>
                  )}
                </>
              )}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
