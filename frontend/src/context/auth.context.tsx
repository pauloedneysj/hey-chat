import {
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextValue {
  isAuthenticated: boolean;
  getToken: (value: string) => void;
  removeToken: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider(props: React.PropsWithChildren<{}>) {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  function getToken(value: string) {
    localStorage.setItem("graphql-token", value);
    setToken(value);
  }

  function removeToken() {
    localStorage.removeItem("graphql-token");
    setToken(null);
  }

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, getToken, removeToken }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
