import { SearchedUser } from "@/src/utils/types";
import { Avatar, Button, Flex, Stack, Text } from "@chakra-ui/react";

interface IUserSearchList {
  searchedUsers: SearchedUser[] | undefined;
  addParticipant: (user: SearchedUser) => void;
}

export default function UserSearchList({
  searchedUsers,
  addParticipant,
}: IUserSearchList) {
  return (
    <>
      {searchedUsers?.length === 0 ? (
        <Flex mt={6} justify="center">
          <Text>No users found</Text>
        </Flex>
      ) : (
        <Stack mt={6}>
          {searchedUsers?.map((user) => (
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
              <Flex justifyContent="space-between" align="center" width="100%">
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
          ))}
        </Stack>
      )}
    </>
  );
}
