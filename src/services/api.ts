const API_BASE_URL = import.meta.env.VITE_API_URL || "https://pocketmed-backend-production.up.railway.app";

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  data: { message?: string; statusCode?: number; [key: string]: unknown };

  constructor(status: number, data: { message?: string; statusCode?: number; [key: string]: unknown }) {
    super(data.message || "Erro na requisição");
    this.status = status;
    this.data = data;
  }
}

export async function api(path: string, options: ApiOptions = {}) {
  const token = localStorage.getItem("pocketmed_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401) {
    localStorage.removeItem("pocketmed_token");
    localStorage.removeItem("pocketmed_user");
    window.location.href = "/login";
    throw new ApiError(401, { message: "Unauthorized" });
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data;
}
