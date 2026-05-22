/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/api";

interface User {
  userId: string;
  email: string;
  type: string;
  role?: string;
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
  const navigate = useNavigate();

  // Initialize auth state from stored token (runs once on mount)
  const [initialized] = useState(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));
        return {
          user: {
            userId: payload.sub,
            email: payload.email,
            type: payload.type,
            role: payload.role,
          } as User,
          token: storedToken,
        };
      } catch {
        localStorage.removeItem("token");
        delete api.defaults.headers.common["Authorization"];
      }
    }
    return { user: null as User | null, token: null as string | null };
  });

  const [user, setUser] = useState<User | null>(initialized.user);
  const [token, setToken] = useState<string | null>(initialized.token);
  const isLoading = false;

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
