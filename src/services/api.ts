import {
  DEMO_PATIENT_ACTION_BLOCKED_MESSAGE,
  isDemoPatientId,
  isDemoPatientPath,
  resolveDemoPatientGet,
} from "../mocks/demoPatientApi";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://pocketmed-backend-production.up.railway.app";

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  isFormData?: boolean;
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
  const method = options.method || "GET";

  // The demo patient is fully mocked on the front — doctors pending
  // verification browse it through the real PatientDetail screen, but no
  // request for it ever reaches the backend. Reads return canned data,
  // writes are rejected so nothing is falsely persisted.
  const bodyPatientId =
    !options.isFormData &&
    options.body &&
    typeof options.body === "object" &&
    "patientId" in (options.body as Record<string, unknown>)
      ? (options.body as Record<string, unknown>).patientId
      : undefined;
  const targetsDemoPatient =
    isDemoPatientPath(path) || isDemoPatientId(bodyPatientId);

  if (targetsDemoPatient) {
    if (method === "GET") {
      return resolveDemoPatientGet(path);
    }
    throw new ApiError(403, { message: DEMO_PATIENT_ACTION_BLOCKED_MESSAGE });
  }

  const token = localStorage.getItem("pocketmed_token");

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
    method,
    headers,
    body,
  });

  if (response.status === 401) {
    // Only redirect to login if we're not already on a public auth route
    const isAuthRoute = path.startsWith("/auth/");
    if (!isAuthRoute) {
      localStorage.removeItem("pocketmed_token");
      localStorage.removeItem("pocketmed_user");
      window.location.href = "/login";
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
