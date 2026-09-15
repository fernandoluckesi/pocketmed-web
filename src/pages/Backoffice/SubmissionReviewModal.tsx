import { useEffect, useState } from "react";
import {
  X,
  FileCheck2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../contexts/ToastContext";
import { ApiError } from "../../services/api";
import {
  approveDocument,
  getSubmission,
  rejectDocument,
  type SubmissionDocument,
} from "../../services/backoffice";

const DOCUMENT_LABELS: Record<string, string> = {
  CIM: "Carteira de Identidade Médica (CIM)",
  DIPLOMA: "Diploma de Graduação em Medicina",
  REGULARIDADE: "Certificado de Regularidade de Inscrição",
  RQE: "Comprovante de RQE",
};

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-100",
  PENDING: "bg-blue-50 text-primary border-blue-100",
  NOT_UPLOADED: "bg-slate-100 text-slate-500 border-slate-200",
};

const STATUS_LABELS: Record<string, string> = {
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  PENDING: "Aguardando",
  NOT_UPLOADED: "Não enviado",
};

interface Props {
  doctorId: string | null;
  onClose: () => void;
  onReviewed?: () => void;
}

export function SubmissionReviewModal({
  doctorId,
  onClose,
  onReviewed,
}: Props) {
  const toast = useToast();
  const isOpen = !!doctorId;

  const [loading, setLoading] = useState(false);
  const [doctor, setDoctor] = useState<{
    name: string;
    email: string;
    crm: string;
    specialty: string;
    verificationStatus: string;
  } | null>(null);
  const [documents, setDocuments] = useState<SubmissionDocument[]>([]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!doctorId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      setRejectingId(null);
      setRejectionReason("");
      try {
        const result = await getSubmission(doctorId as string);
        if (cancelled) return;
        setDoctor(result.doctor as never);
        setDocuments(result.documents);
      } catch {
        if (!cancelled) setError("Erro ao carregar a submissão.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  async function refresh() {
    if (!doctorId) return;
    const result = await getSubmission(doctorId);
    setDoctor(result.doctor as never);
    setDocuments(result.documents);
    onReviewed?.();
  }

  async function handleApprove(documentId: string) {
    setActingId(documentId);
    setError("");
    try {
      await approveDocument(documentId);
      toast.success("Documento aprovado.");
      await refresh();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.data?.message || "Erro ao aprovar o documento."
          : "Erro ao aprovar o documento.";
      setError(String(msg));
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(documentId: string) {
    if (rejectionReason.trim().length < 10) {
      setError("Descreva o motivo da rejeição (mínimo 10 caracteres).");
      return;
    }
    setActingId(documentId);
    setError("");
    try {
      await rejectDocument(documentId, rejectionReason.trim());
      toast.success("Documento rejeitado.");
      setRejectingId(null);
      setRejectionReason("");
      await refresh();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.data?.message || "Erro ao rejeitar o documento."
          : "Erro ao rejeitar o documento.";
      setError(String(msg));
    } finally {
      setActingId(null);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-5 border-b border-slate-100 shrink-0 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileCheck2 className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
                    {doctor?.name || "Submissão"}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {doctor
                      ? `${doctor.email} · CRM ${doctor.crm || "—"}`
                      : "Carregando dados do médico..."}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Body */}
            {loading ? (
              <div className="flex items-center justify-center py-24 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Carregando...
              </div>
            ) : (
              <div className="px-8 py-6 space-y-4 overflow-y-auto flex-1">
                {documents.map((doc) => (
                  <div
                    key={doc.type}
                    className="border border-slate-200 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900">
                          {DOCUMENT_LABELS[doc.type] || doc.type}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {doc.originalFileName || "Nenhum arquivo enviado"}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
                          STATUS_STYLES[doc.status] ||
                          STATUS_STYLES.NOT_UPLOADED
                        }`}
                      >
                        {STATUS_LABELS[doc.status] || doc.status}
                      </span>
                    </div>

                    {doc.rejectionReason && (
                      <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
                        <span className="font-bold">Motivo: </span>
                        {doc.rejectionReason}
                      </p>
                    )}

                    {doc.uploaded && (
                      <div className="flex flex-wrap items-center gap-2">
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Abrir documento
                          </a>
                        )}

                        {doc.id && doc.status !== "APPROVED" && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprove(doc.id as string)}
                            loading={actingId === doc.id}
                            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Aprovar
                          </Button>
                        )}

                        {doc.id && doc.status !== "REJECTED" && (
                          <Button
                            variant="danger-outline"
                            size="sm"
                            onClick={() =>
                              setRejectingId(
                                rejectingId === doc.id ? null : doc.id,
                              )
                            }
                            icon={<XCircle className="w-3.5 h-3.5" />}
                          >
                            Rejeitar
                          </Button>
                        )}
                      </div>
                    )}

                    {rejectingId && rejectingId === doc.id && (
                      <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <label
                          htmlFor={`reason-${doc.type}`}
                          className="block text-xs font-bold text-slate-500 uppercase tracking-wider"
                        >
                          Motivo da rejeição
                        </label>
                        <textarea
                          id={`reason-${doc.type}`}
                          rows={3}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Explique o que o médico precisa corrigir..."
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 resize-none outline-none"
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(doc.id as string)}
                          loading={actingId === doc.id}
                        >
                          Confirmar rejeição
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {error && (
                  <p role="alert" className="text-sm text-red-500 font-medium">
                    {error}
                  </p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="px-8 py-5 flex justify-between items-center gap-3 border-t border-slate-100 shrink-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Status geral: {doctor?.verificationStatus || "—"}
              </p>
              <Button variant="ghost" size="md" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
