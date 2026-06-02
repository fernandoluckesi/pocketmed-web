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
  profileImage?: string;
  phone?: string;
  gender?: string;
  birthDate?: string;
  specialty?: string;
  crm?: string;
  cpf?: string;
  rqe?: string;
}

interface RegisterDoctorPayload {
  name: string;
  email: string;
  password: string;
  gender: string;
  specialty: string;
  cpf: string;
  phone: string;
  birthDate: string;
  crm: string;
  rqe?: string;
  clinicName?: string;
  cnpj?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  registerDoctor: (payload: RegisterDoctorPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  // Initialize auth state from stored token (runs once on mount)
  const [initialized] = useState(() => {
    const storedToken =
      localStorage.getItem("token") || localStorage.getItem("pocketmed_token");
    const storedUser = localStorage.getItem("pocketmed_user");
    if (storedToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));
        const savedUser = storedUser ? JSON.parse(storedUser) : null;

        // Use the full saved user object (from API response), fallback to JWT payload
        const user: User = savedUser
          ? {
              userId: savedUser.id || savedUser.userId || payload.sub,
              email: savedUser.email || payload.email,
              type: savedUser.type || payload.type,
              role: savedUser.role || payload.role,
              name: savedUser.name,
              profileImage: savedUser.profileImage,
              phone: savedUser.phone,
              gender: savedUser.gender,
              birthDate: savedUser.birthDate,
              specialty: savedUser.specialty,
              crm: savedUser.crm,
              cpf: savedUser.cpf,
              rqe: savedUser.rqe,
            }
          : {
              userId: payload.sub,
              email: payload.email,
              type: payload.type,
              role: payload.role,
            };

        return { user, token: storedToken };
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("pocketmed_token");
        localStorage.removeItem("pocketmed_user");
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
    const { token: access_token, user: userData } = response.data;

    localStorage.setItem("token", access_token);
    localStorage.setItem("pocketmed_token", access_token);
    localStorage.setItem("pocketmed_user", JSON.stringify(userData));
    api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
    setToken(access_token);
    setUser({
      userId: userData.id || userData.userId,
      email: userData.email,
      type: userData.type,
      role: userData.role,
      name: userData.name,
      profileImage: userData.profileImage,
      phone: userData.phone,
      gender: userData.gender,
      birthDate: userData.birthDate,
      specialty: userData.specialty,
      crm: userData.crm,
      cpf: userData.cpf,
      rqe: userData.rqe,
    });
    navigate("/dashboard");
  }

  async function registerDoctor(payload: RegisterDoctorPayload) {
    const response = await api.post("/auth/register/doctor", payload);
    const { token: access_token, user: userData } = response.data;

    localStorage.setItem("token", access_token);
    localStorage.setItem("pocketmed_token", access_token);
    localStorage.setItem("pocketmed_user", JSON.stringify(userData));
    api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
    setToken(access_token);
    setUser({
      userId: userData.id || userData.userId,
      email: userData.email,
      type: userData.type,
      role: userData.role,
      name: userData.name,
      profileImage: userData.profileImage,
      phone: userData.phone,
      gender: userData.gender,
      birthDate: userData.birthDate,
      specialty: userData.specialty,
      crm: userData.crm,
      cpf: userData.cpf,
      rqe: userData.rqe,
    });
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
        registerDoctor,
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
