import { useMutation } from "@apollo/client";
import { Box } from "@chakra-ui/react";
import { NextPageContext } from "next";
import { getSession, useSession } from "next-auth/react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import Auth from "../components/Auth/Auth";
import Chat from "../components/Chat/Chat";
import Loading from "../components/UI/Loading/Loading";
import { useAuth } from "../context/auth.context";
import UserOperations from "../graphql/operations/user";
import { LoginData, LoginVariables } from "../utils/types";

export default function SignIn() {
  const { data: session } = useSession();
  const { isAuthenticated, getToken, removeToken } = useAuth();

  const [login] = useMutation<LoginData, LoginVariables>(
    UserOperations.Mutations.login,
    {
      onCompleted: ({ login: { accessToken } }) => {
        getToken(accessToken);
      },
      onError: (error) => {
        removeToken();
        toast.error(error.message);
      },
    }
  );

  // TODO: this reloads the session
  function reloadSession() {}

  const onLogin = async (userId: string) => {
    await login({ variables: { userId } });
  };

  useEffect(() => {
    if (session && !isAuthenticated) {
      onLogin(session.user.id);
    }
  }, [session, isAuthenticated]);

  return (
    <Box>
      {session?.user.username && isAuthenticated ? (
        <Chat session={session} />
      ) : (
        <Auth
          session={session}
          reloadSession={reloadSession}
          isAuthenticated={isAuthenticated}
        />
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
