import { Box } from "@chakra-ui/react";
import { NextPageContext } from "next";
import { getSession, useSession } from "next-auth/react";
import Auth from "../components/Auth/Auth";
import Chat from "../components/Chat/Chat";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/auth.context";
import { useEffect } from "react";
import { useMutation } from "@apollo/client";
import UserOperations from "../graphql/operations/user";
import { LoginData, LoginVariables } from "../utils/types";

export default function SignIn() {
  const { data: session } = useSession();
  const { isAuthenticated, getToken, removeToken } = useAuth();

  const [login, { loading }] = useMutation<LoginData, LoginVariables>(
    UserOperations.Mutations.login,
    {
      onCompleted: (data) => {
        getToken(data.login.accessToken);
      },
      onError: (error) => {
        removeToken();
        toast.error(error.message);
      },
    }
  );

  // TODO: this reloads the session
  function reloadSession() {}

  useEffect(() => {
    if (session?.user) {
      login({ variables: { userId: session.user.id } });
    }
  }, [session, isAuthenticated]);

  return (
    <Box>
      {session?.user.username && isAuthenticated ? (
        <Chat session={session} />
      ) : loading ? (
        "Carregando..."
      ) : (
        <Auth
          session={session}
          reloadSession={reloadSession}
          isAuthenticated={isAuthenticated}
        />
      )}
      <Toaster />
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
