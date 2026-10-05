import { api } from "./api";
import type { DocumentSpec, DocumentStatus, SignatureStatus } from "./reports";

export interface PrescriptionItemInput {
  name: string;
  concentration?: string;
  pharmaceuticalForm?: string;
  quantity?: string;
  posology?: string;
  routeOfAdministration?: string;
  treatmentDuration?: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string | null;
  dependentId: string | null;
  appointmentId: string | null;
  issueDate: string;
  items: PrescriptionItemInput[];
  observations: string | null;
  status: DocumentStatus;
  documentUrl: string | null;
  documentHash: string | null;
  signatureStatus: SignatureStatus;
  signatureProvider: string | null;
  createdAt: string;
  updatedAt: string;
}

export const prescriptionsApi = {
  create: (data: {
    patientId?: string;
    dependentId?: string;
    appointmentId?: string;
    items: PrescriptionItemInput[];
    observations?: string;
  }): Promise<Prescription> =>
    api("/prescriptions", { method: "POST", body: data }),

  getById: (id: string): Promise<Prescription> => api(`/prescriptions/${id}`),

  update: (
    id: string,
    data: {
      items?: PrescriptionItemInput[];
      observations?: string;
      issueDate?: string;
    },
  ): Promise<Prescription> =>
    api(`/prescriptions/${id}`, { method: "PATCH", body: data }),

  /** The document structure the backend renders the PDF from — lets the
   * "visualizar a receita" step show the real document instead of a
   * frontend reconstruction of it. */
  preview: (id: string): Promise<DocumentSpec> =>
    api(`/prescriptions/${id}/preview`),

  generatePdf: (id: string): Promise<Prescription> =>
    api(`/prescriptions/${id}/generate-pdf`, { method: "POST" }),

  cancel: (id: string): Promise<Prescription> =>
    api(`/prescriptions/${id}/cancel`, { method: "POST" }),

  /** "Enviar sem assinatura digital" — delivers the already-generated PDF
   * to the patient as-is. */
  send: (id: string): Promise<Prescription> =>
    api(`/prescriptions/${id}/send`, { method: "POST" }),

  /** "Assinar digitalmente e enviar", step 1 — starts the (simulated)
   * signature request and returns the URL to open in a new tab. */
  requestSignature: (
    id: string,
  ): Promise<{ prescription: Prescription; signingUrl: string }> =>
    api(`/prescriptions/${id}/request-signature`, { method: "POST" }),

  /** Step 2, called from the signature-simulator page once "signed". */
  confirmSignature: (
    id: string,
    externalSignatureId: string,
  ): Promise<Prescription> =>
    api(`/prescriptions/${id}/confirm-signature`, {
      method: "POST",
      body: { externalSignatureId },
    }),
};
