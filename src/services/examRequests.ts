import { api } from "./api";
import type { DocumentSpec, DocumentStatus, SignatureStatus } from "./reports";

export interface ExamRequestItemInput {
  name: string;
}

export interface ExamRequest {
  id: string;
  doctorId: string;
  patientId: string | null;
  dependentId: string | null;
  appointmentId: string | null;
  issueDate: string;
  items: ExamRequestItemInput[];
  observations: string | null;
  status: DocumentStatus;
  documentUrl: string | null;
  documentHash: string | null;
  signatureStatus: SignatureStatus;
  signatureProvider: string | null;
  createdAt: string;
  updatedAt: string;
}

export const examRequestsApi = {
  create: (data: {
    patientId?: string;
    dependentId?: string;
    appointmentId?: string;
    items: ExamRequestItemInput[];
    observations?: string;
  }): Promise<ExamRequest> =>
    api("/exam-requests", { method: "POST", body: data }),

  getById: (id: string): Promise<ExamRequest> => api(`/exam-requests/${id}`),

  update: (
    id: string,
    data: {
      items?: ExamRequestItemInput[];
      observations?: string;
      issueDate?: string;
    },
  ): Promise<ExamRequest> =>
    api(`/exam-requests/${id}`, { method: "PATCH", body: data }),

  /** The document structure the backend renders the PDF from — lets the
   * "visualizar o pedido" step show the real document instead of a
   * frontend reconstruction of it. */
  preview: (id: string): Promise<DocumentSpec> =>
    api(`/exam-requests/${id}/preview`),

  generatePdf: (id: string): Promise<ExamRequest> =>
    api(`/exam-requests/${id}/generate-pdf`, { method: "POST" }),

  cancel: (id: string): Promise<ExamRequest> =>
    api(`/exam-requests/${id}/cancel`, { method: "POST" }),

  /** "Enviar sem assinatura digital" — delivers the already-generated PDF
   * to the patient as-is. */
  send: (id: string): Promise<ExamRequest> =>
    api(`/exam-requests/${id}/send`, { method: "POST" }),

  /** "Assinar digitalmente e enviar", step 1 — starts the (simulated)
   * signature request and returns the URL to open in a new tab. */
  requestSignature: (
    id: string,
  ): Promise<{ examRequest: ExamRequest; signingUrl: string }> =>
    api(`/exam-requests/${id}/request-signature`, { method: "POST" }),

  /** Step 2, called from the signature-simulator page once "signed". */
  confirmSignature: (
    id: string,
    externalSignatureId: string,
  ): Promise<ExamRequest> =>
    api(`/exam-requests/${id}/confirm-signature`, {
      method: "POST",
      body: { externalSignatureId },
    }),
};
