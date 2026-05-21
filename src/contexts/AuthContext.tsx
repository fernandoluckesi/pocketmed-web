import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/api";

interface User {
  userId: string;
  email: string;
  type: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Decode basic info from token
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUser({
          userId: payload.sub,
          email: payload.email,
          type: payload.type,
        });
      } catch {
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    const { access_token, user: userData } = response.data;

    localStorage.setItem("token", access_token);
    api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
    setToken(access_token);
    setUser(userData);
    navigate("/dashboard");
  }

  function logout() {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
