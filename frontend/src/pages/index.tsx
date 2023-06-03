import { Box } from "@chakra-ui/react";
import { NextPageContext } from "next";
import { getSession, useSession } from "next-auth/react";
import Auth from "../components/Auth/Auth";
import Chat from "../components/Chat/Chat";
import { useMutation } from "@apollo/client";
import UserOperations from "../graphql/operations/user";
import { LoginData, LoginVariables } from "../utils/types";
import { useEffect } from "react";

export default function SignIn() {
  const { data: session } = useSession();

  const [login, { data: loginResponse }] = useMutation<
    LoginData,
    LoginVariables
  >(UserOperations.Mutations.login, {
    onCompleted: (response) => {
      const { error, success, token } = response.login;

      if (token && success) {
        localStorage.setItem("graphql-token", token);
      } else {
        console.error(error);
      }
    },
    onError: (error) => console.error(error),
  });

  useEffect(() => {
    const token = localStorage.getItem("graphql-token");

    if (session && !token) {
      console.log(token);
      login({ variables: { userId: session.user.id } });
    } else {
      console.log(loginResponse?.login);
    }
  }, [loginResponse?.login, login, session]);

  // TODO: this reloads the session
  function reloadSession() {}

  return (
    <Box>
      {session?.user?.username ? (
        <Chat />
      ) : (
        <Auth session={session} reloadSession={reloadSession} />
      )}
    </Box>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
}
