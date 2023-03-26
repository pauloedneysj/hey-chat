import { Box, Button, Text } from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";

export default function Chat() {
  const { data } = useSession();

  return (
    <Box>
      <Text>{data?.user?.name}</Text>
      <br/>
      <Button onClick={() => signOut()}>Sair</Button>
    </Box>
  );
}
