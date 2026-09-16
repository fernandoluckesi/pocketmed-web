import { api } from "./api";

export type DocumentType = "CIM" | "DIPLOMA" | "REGULARIDADE" | "RQE";

export type DocumentStatus =
  | "NOT_UPLOADED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type VerificationStatus =
  | "PENDING"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED";

export interface DocumentState {
  id: string | null;
  type: DocumentType;
  uploaded: boolean;
  status: DocumentStatus;
  fileUrl: string | null;
  originalFileName: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  submittedAt: string | null;
  /** False while the document is under review, locking replacement. */
  canReplace: boolean;
}

export interface VerificationState {
  verificationStatus: VerificationStatus;
  documents: DocumentState[];
  allUploaded: boolean;
  allApproved: boolean;
  pendingCount: number;
  rejectedCount: number;
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  CIM: "Carteira de Identidade Médica (CIM)",
  DIPLOMA: "Diploma de Graduação em Medicina",
  REGULARIDADE: "Certificado de Regularidade de Inscrição",
  RQE: "Comprovante de RQE",
};

export const DOCUMENT_DESCRIPTIONS: Record<DocumentType, string> = {
  CIM: "Documento de identidade profissional emitido pelo CRM, com validade de RG em todo o território nacional.",
  DIPLOMA:
    "Cópia frente e verso do diploma emitido por instituição reconhecida pelo MEC.",
  REGULARIDADE:
    "Certidão emitida pelo CRM do estado que atesta licença ativa e sem impedimentos.",
  RQE: "Certificado do RQE emitido pelo CRM para classificação por especialidade.",
};

export const DOCUMENT_ORDER: DocumentType[] = [
  "CIM",
  "DIPLOMA",
  "REGULARIDADE",
  "RQE",
];

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  PENDING: "Documentação incompleta",
  SUBMITTED: "Em análise",
  APPROVED: "Verificado",
  REJECTED: "Ajustes necessários",
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  NOT_UPLOADED: "Não enviado",
  PENDING: "Em análise",
  APPROVED: "Aprovado",
  REJECTED: "Recusado",
};

/** Current verification state of the logged-in doctor. */
export function getVerificationStatus(): Promise<VerificationState> {
  return api("/doctors/documents/status");
}

/**
 * Uploads (or replaces) a document. The backend rejects replacement while the
 * document is under review.
 */
export async function uploadDocument(type: DocumentType, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return api(`/doctors/documents/${type}`, {
    method: "POST",
    body: formData,
    isFormData: true,
  });
}
