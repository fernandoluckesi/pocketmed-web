import { api } from "./api";

export const BACKOFFICE_TOKEN_KEY = "hispora_backoffice_token";
export const BACKOFFICE_USER_KEY = "hispora_backoffice_user";

/** All back office requests authenticate with the back office session. */
function boApi(
  path: string,
  options: { method?: string; body?: unknown } = {},
) {
  return api(path, {
    ...options,
    tokenKey: BACKOFFICE_TOKEN_KEY,
    loginPath: "/backoffice/login",
  });
}

export interface BackofficeUser {
  id: string;
  name: string;
  email: string;
  type: "backoffice";
  role: "superadmin" | "analyst" | "auditor";
}

export type DocumentStatus =
  | "NOT_UPLOADED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export interface SubmissionDocument {
  id: string | null;
  type: "CIM" | "DIPLOMA" | "REGULARIDADE" | "RQE";
  uploaded: boolean;
  status: DocumentStatus;
  fileUrl?: string | null;
  originalFileName: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedBy?: string | null;
}

export interface Submission {
  id: string;
  name: string;
  email: string;
  specialty: string;
  crm: string;
  profileImage?: string | null;
  verificationStatus: string;
  createdAt: string;
  documents: SubmissionDocument[];
  pendingCount: number;
}

export interface AuditEventItem {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  actorUserId: string | null;
  actorRole: string | null;
  success: boolean;
  reason: string | null;
  timestamp: string;
  changedFields: Record<string, { before?: unknown; after?: unknown }> | null;
  metadata: Record<string, unknown> | null;
}

// --- Session -----------------------------------------------------------------

export function getBackofficeToken(): string | null {
  return localStorage.getItem(BACKOFFICE_TOKEN_KEY);
}

export function getBackofficeUser(): BackofficeUser | null {
  const raw = localStorage.getItem(BACKOFFICE_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BackofficeUser;
  } catch {
    return null;
  }
}

export function isBackofficeAuthenticated(): boolean {
  return !!getBackofficeToken();
}

export async function backofficeLogin(email: string, password: string) {
  const data = await boApi("/backoffice/auth/login", {
    method: "POST",
    body: { email, password },
  });

  // The back office session is stored under its own keys so it never collides
  // with (or grants access to) a clinical platform session.
  localStorage.setItem(BACKOFFICE_TOKEN_KEY, data.token);
  localStorage.setItem(BACKOFFICE_USER_KEY, JSON.stringify(data.user));
  return data.user as BackofficeUser;
}

export function backofficeLogout() {
  localStorage.removeItem(BACKOFFICE_TOKEN_KEY);
  localStorage.removeItem(BACKOFFICE_USER_KEY);
  window.location.href = "/backoffice/login";
}

// --- Doctor verification -----------------------------------------------------

export function getVerificationStats(): Promise<{
  pending: number;
  submitted: number;
  approved: number;
  rejected: number;
}> {
  return boApi("/backoffice/doctor-verification/stats");
}

export function listSubmissions(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: Submission[];
  total: number;
  page: number;
  limit: number;
}> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  return boApi(`/backoffice/doctor-verification/submissions?${query.toString()}`);
}

export function getSubmission(doctorId: string): Promise<{
  doctor: Omit<Submission, "documents" | "pendingCount">;
  documents: SubmissionDocument[];
}> {
  return boApi(`/backoffice/doctor-verification/submissions/${doctorId}`);
}

export function approveDocument(documentId: string, note?: string) {
  return boApi(
    `/backoffice/doctor-verification/documents/${documentId}/approve`,
    { method: "PATCH", body: note ? { note } : {} },
  );
}

export function rejectDocument(documentId: string, rejectionReason: string) {
  return boApi(`/backoffice/doctor-verification/documents/${documentId}/reject`, {
    method: "PATCH",
    body: { rejectionReason },
  });
}

// --- Audit -------------------------------------------------------------------

export function listAuditEvents(params: {
  action?: string;
  resourceType?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: AuditEventItem[];
  total: number;
  page: number;
  limit: number;
}> {
  const query = new URLSearchParams();
  if (params.action) query.set("action", params.action);
  if (params.resourceType) query.set("resourceType", params.resourceType);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  return boApi(`/backoffice/audit/events?${query.toString()}`);
}
