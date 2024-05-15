import {
  createContext,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

interface ConversationContextValue {
  conversationId: string | undefined;
  setConversationId: React.Dispatch<SetStateAction<string | undefined>>;
}

const ConversationContext = createContext<ConversationContextValue | undefined>(
  undefined
);

export function ConversationProvider(props: React.PropsWithChildren<{}>) {
  const [conversationId, setConversationId] = useState<string | undefined>();

  return (
    <ConversationContext.Provider value={{ conversationId, setConversationId }}>
      {props.children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);

  if (context === undefined) {
    throw new Error(
      "useConversation must be used within an ConversationProvider"
    );
  }

  return context;
}
