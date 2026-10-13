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

// Several backend handlers (e.g. DELETE endpoints whose service method
// returns void) send a 200/204 with an empty body. `response.json()` throws
// a SyntaxError on an empty body even when the request actually succeeded —
// that exception used to propagate as if the request itself had failed,
// turning a successful delete into a false error. Read the raw text first and
// only parse it when there's something to parse.
async function parseResponseBody(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function api(path: string, options: ApiOptions = {}) {
  const method = options.method || "GET";

  // The demo patient is fully mocked on the front — doctors pending
  // verification browse it through the real PatientDetail screen, but no
  // request for it ever reaches the backend. Reads return canned data,
  // writes are rejected so nothing is falsely persisted.
  const bodyPatientId =
    options.isFormData && options.body instanceof FormData
      ? (options.body.get("patientId") ?? undefined)
      : options.body &&
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
    const data = (await parseResponseBody(response)) || {
      message: "Unauthorized",
    };
    throw new ApiError(401, data);
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, data || {});
  }

  return data;
}
