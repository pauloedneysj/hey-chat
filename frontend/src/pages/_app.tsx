import "@/src/styles/globals.css";
import { ApolloProvider } from "@apollo/client";
import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { theme } from "../chakra/theme";
import { AuthProvider } from "../context/auth.context";
import { ConversationProvider } from "../context/conversation.context";
import { client } from "../graphql/apollo-client";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ApolloProvider client={client}>
      <SessionProvider session={session}>
        <ChakraProvider theme={theme}>
          <AuthProvider>
            <ConversationProvider>
              <Component {...pageProps} />
              <Toaster />
            </ConversationProvider>
          </AuthProvider>
        </ChakraProvider>
      </SessionProvider>
    </ApolloProvider>
  );
}
