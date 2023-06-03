import UserOperations from "@/src/graphql/operations/user";
import { CreateUserData, CreateUserVariables } from "@/src/utils/types";
import { useMutation } from "@apollo/client";
import { Button, Center, Image, Input, Stack, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { useState } from "react";

interface IAuthProps {
  session: Session | null;
  reloadSession: () => void;
}

export default function Auth({ session, reloadSession }: IAuthProps) {
  const [username, setUsername] = useState("");

  const [createUsername] = useMutation<CreateUserData, CreateUserVariables>(
    UserOperations.Mutations.createUsername,
    {
      onCompleted: (data) => {
        const { error, success } = data.createUsername;

        if (success) window.location.reload();
        else console.error(error);
      },
      onError: (error) => console.error(error),
    }
  );

  async function onSubmit() {
    if (!username) return null;

    try {
      return await createUsername({ variables: { username } });
    } catch (error) {
      return console.log("onSubmir error", error);
    }
  }

  return (
    <Center height="100vh">
      <Stack spacing={8} align="center">
        {session ? (
          <>
            <Text fontSize="3xl">Crie um nome de usuário</Text>
            <Input
              placeholder="Coloque seu nome de usuário"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <Button width="100%" onClick={onSubmit}>
              Salvar
            </Button>
          </>
        ) : (
          <>
            <Text>MessengerQL</Text>
            <Button
              onClick={() => signIn("google")}
              leftIcon={
                <Image
                  height="20px"
                  src="/images/google-logo.svg"
                  alt="google logo"
                />
              }
            >
              Continue com o Google
            </Button>
          </>
        )}
      </Stack>
    </Center>
  );
}
