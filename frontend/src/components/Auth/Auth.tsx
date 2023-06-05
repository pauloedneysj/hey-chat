import UserOperations from "@/src/graphql/operations/user";
import { CreateUserData, CreateUserVariables } from "@/src/utils/types";
import { useMutation } from "@apollo/client";
import { Button, Center, Image, Input, Stack, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface IAuthProps {
  session: Session | null;
  reloadSession: () => void;
}

export default function Auth({ session, reloadSession }: IAuthProps) {
  const [username, setUsername] = useState("");
  const [createUsername, { loading }] = useMutation<
    CreateUserData,
    CreateUserVariables
  >(UserOperations.Mutations.createUsername, {
    onCompleted: () => window.location.reload(),
    onError: (error) => toast.error(error.message),
  });

  async function onSubmit() {
    await createUsername({ variables: { username } });
  }

  return (
    <Center height="100vh">
      <Stack spacing={8} align="center">
        {session ? (
          <>
            <Text fontSize="3xl">Create a username</Text>
            <Input
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <Button
              width="100%"
              onClick={onSubmit}
              isLoading={loading}
              isDisabled={!username}
            >
              Register
            </Button>
          </>
        ) : (
          <>
            <Text>heyChat</Text>
            <Button
              onClick={() => signIn("google")}
              leftIcon={
                <Image
                  height="20px"
                  src="/images/google-logo.svg"
                  alt="google-logo"
                />
              }
            >
              Continue with Google
            </Button>
          </>
        )}
      </Stack>
    </Center>
  );
}
