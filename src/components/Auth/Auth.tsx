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

  const onSubmit = async () => {
    try {
    } catch (error) {
      console.log("onSubmir error", error);
    }
  };

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
              leftIcon={<Image height="20px" src="/images/google-logo.svg" />}
            >
              Continue com o Google
            </Button>
          </>
        )}
      </Stack>
    </Center>
  );
}
