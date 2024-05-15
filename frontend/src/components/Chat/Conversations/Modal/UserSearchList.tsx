import { SearchedUser } from "@/src/utils/types";
import { Avatar, Button, Flex, Stack, Text } from "@chakra-ui/react";

interface IUserSearchList {
  searchedUsers: SearchedUser[] | undefined;
  addParticipant: (user: SearchedUser) => void;
  participantAlreadyAdded: (userId: string) => boolean;
}

export default function UserSearchList({
  searchedUsers,
  addParticipant,
  participantAlreadyAdded,
}: IUserSearchList) {
  return (
    <>
      {searchedUsers?.length === 0 ? (
        <Flex justify="center">
          <Text>No users found</Text>
        </Flex>
      ) : (
        <Stack>
          {searchedUsers?.map((user) => (
            <>
              {!participantAlreadyAdded(user.id) && (
                <Stack
                  key={user.id}
                  direction="row"
                  align="center"
                  spacing={4}
                  py={2}
                  px={4}
                  borderRadius={4}
                  _hover={{ bg: "whiteAlpha.200" }}
                >
                  <Avatar size="sm" />
                  <Flex
                    justifyContent="space-between"
                    align="center"
                    width="100%"
                  >
                    <Text color="whiteAlpha.700">{user.username}</Text>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => addParticipant(user)}
                    >
                      Select
                    </Button>
                  </Flex>
                </Stack>
              )}
            </>
          ))}
        </Stack>
      )}
    </>
  );
}
