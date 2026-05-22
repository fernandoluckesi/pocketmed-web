import { api } from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  gender: string;
  specialty: string;
  cpf: string;
  phone: string;
  birthDate: string;
  crm: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    type: string;
    verificationStatus?: string;
    [key: string]: unknown;
  };
  token: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const data = await api("/auth/login", {
    method: "POST",
    body: payload,
  });
  localStorage.setItem("pocketmed_token", data.token);
  localStorage.setItem("pocketmed_user", JSON.stringify(data.user));
  return data;
}

export async function register(
  payload: RegisterPayload,
  profileImage?: File,
): Promise<AuthResponse> {
  if (profileImage) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    formData.append("profileImage", profileImage);
    const data = await api("/auth/register/doctor", {
      method: "POST",
      body: formData,
      isFormData: true,
    });
    localStorage.setItem("pocketmed_token", data.token);
    localStorage.setItem("pocketmed_user", JSON.stringify(data.user));
    return data;
  }

  const data = await api("/auth/register/doctor", {
    method: "POST",
    body: payload,
  });
  localStorage.setItem("pocketmed_token", data.token);
  localStorage.setItem("pocketmed_user", JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem("pocketmed_token");
  localStorage.removeItem("pocketmed_user");
  window.location.href = "/login";
}

export function getToken(): string | null {
  return localStorage.getItem("pocketmed_token");
}

export function getUser() {
  const raw = localStorage.getItem("pocketmed_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
