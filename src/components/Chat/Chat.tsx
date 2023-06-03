import { Box, Button, Text } from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";

export default function Chat() {
  const { data: session } = useSession();

  const logout = () => {
    localStorage.removeItem("graphql-token");
  };

  return (
    <Box>
      <Text>{session?.user?.name}</Text>
      <br />
      <Button
        onClick={() => {
          logout();
          signOut();
        }}
      >
        Sair
      </Button>
    </Box>
  );
}
