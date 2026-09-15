const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://pocketmed-backend-production.up.railway.app";

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  isFormData?: boolean;
  /**
   * localStorage key holding the bearer token. Defaults to the platform session;
   * the back office passes its own key so the two sessions stay independent.
   */
  tokenKey?: string;
  /** Where to send the user on 401. Defaults to the platform login. */
  loginPath?: string;
}

export class ApiError extends Error {
  status: number;
  data: { message?: string; statusCode?: number; [key: string]: unknown };

  constructor(
    status: number,
    data: { message?: string; statusCode?: number; [key: string]: unknown },
  ) {
    super(data.message || "Erro na requisição");
    this.status = status;
    this.data = data;
  }
}

export async function api(path: string, options: ApiOptions = {}) {
  const tokenKey = options.tokenKey || "pocketmed_token";
  const token = localStorage.getItem(tokenKey);

  const headers: Record<string, string> = {
    ...(options.isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;
  if (options.body) {
    body = options.isFormData
      ? (options.body as FormData)
      : JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body,
  });

  if (response.status === 401) {
    // Only redirect to login if we're not already on a public auth route
    const isAuthRoute =
      path.startsWith("/auth/") || path.startsWith("/backoffice/auth/");
    if (!isAuthRoute) {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(
        tokenKey === "pocketmed_token"
          ? "pocketmed_user"
          : "hispora_backoffice_user",
      );
      window.location.href = options.loginPath || "/login";
    }
    const data = await response
      .json()
      .catch(() => ({ message: "Unauthorized" }));
    throw new ApiError(401, data);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data;
}
