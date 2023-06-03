import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface IAuthContextProps {
  token: string | null;
  setToken: Dispatch<SetStateAction<string | null>>;
  logout: () => void;
}

const AuthContext = createContext<IAuthContextProps>(null as never);

export const AuthContextProvider = ({ children }: any) => {
  const [token, setToken] = useState<string | null>(null);

  useCallback(() => {
    if (token) localStorage.setItem("token", token);
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      setToken,
      logout,
    }),
    [token]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
