import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileUp,
  CheckCircle,
  ShieldAlert,
  ArrowLeft,
  Clock,
  XCircle,
  ExternalLink,
  Loader2,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../components/MainLayout";
import { useToast } from "../../contexts/ToastContext";
import { ApiError } from "../../services/api";
import {
  DOCUMENT_DESCRIPTIONS,
  DOCUMENT_LABELS,
  DOCUMENT_ORDER,
  DOCUMENT_STATUS_LABELS,
  VERIFICATION_STATUS_LABELS,
  getVerificationStatus,
  uploadDocument,
  type DocumentState,
  type DocumentStatus,
  type DocumentType,
  type VerificationState,
} from "../../services/doctorDocuments";

const STATUS_BADGE: Record<DocumentStatus, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-100",
  PENDING: "bg-blue-50 text-primary border-blue-100",
  NOT_UPLOADED: "bg-slate-100 text-slate-500 border-slate-200",
};

const STATUS_ICON: Record<DocumentStatus, React.ReactNode> = {
  APPROVED: <CheckCircle className="w-3.5 h-3.5" />,
  REJECTED: <XCircle className="w-3.5 h-3.5" />,
  PENDING: <Clock className="w-3.5 h-3.5" />,
  NOT_UPLOADED: <FileUp className="w-3.5 h-3.5" />,
};

/** Banner shown at the top, summarising the overall verification state. */
const OVERALL_BANNER: Record<
  string,
  { className: string; icon: React.ReactNode; text: string }
> = {
  APPROVED: {
    className: "bg-emerald-50 border-emerald-200 text-emerald-800",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />,
    text: "Seu cadastro está verificado. Todas as funcionalidades estão liberadas.",
  },
  SUBMITTED: {
    className: "bg-blue-50 border-blue-200 text-blue-800",
    icon: <Clock className="w-5 h-5 text-primary" />,
    text: "Seus documentos estão em análise. Avisaremos assim que houver retorno.",
  },
  REJECTED: {
    className: "bg-rose-50 border-rose-200 text-rose-800",
    icon: <XCircle className="w-5 h-5 text-rose-700" />,
    text: "Um ou mais documentos precisam de ajuste. Veja os motivos abaixo e reenvie.",
  },
  PENDING: {
    className: "bg-amber-50 border-amber-200 text-amber-800",
    icon: <ShieldAlert className="w-5 h-5 text-amber-700" />,
    text: "Envie os 4 documentos obrigatórios para iniciarmos a análise.",
  },
};

export default function Verification() {
  const navigate = useNavigate();
  const toast = useToast();

  const [state, setState] = useState<VerificationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [error, setError] = useState("");
  // Files chosen by the user but NOT yet uploaded. They are only sent to the
  // backend when the user clicks "Enviar documentos" at the bottom.
  const [pendingFiles, setPendingFiles] = useState<
    Partial<Record<DocumentType, File>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(async () => {
    try {
      setState(await getVerificationStatus());
      setError("");
    } catch {
      setError("Não foi possível carregar seus documentos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Only stages the chosen file locally — nothing is sent until the user
  // submits all documents at once.
  function handleFileSelected(type: DocumentType, file: File | null) {
    if (!file) return;
    setError("");
    setPendingFiles((prev) => ({ ...prev, [type]: file }));
    // Clear the input so selecting the same file again still triggers change.
    const input = fileRefs.current[type];
    if (input) input.value = "";
  }

  function removePendingFile(type: DocumentType) {
    setPendingFiles((prev) => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
  }

  // Uploads every staged file in sequence, then reloads the verification state.
  async function handleSubmitAll() {
    const entries = Object.entries(pendingFiles) as [DocumentType, File][];
    if (entries.length === 0) return;

    setSubmitting(true);
    setError("");
    const failed: DocumentType[] = [];

    for (const [type, file] of entries) {
      setUploadingType(type);
      try {
        await uploadDocument(type, file);
      } catch (err) {
        failed.push(type);
        const msg =
          err instanceof ApiError
            ? err.data?.message || `Erro ao enviar ${DOCUMENT_LABELS[type]}.`
            : `Erro ao enviar ${DOCUMENT_LABELS[type]}. Verifique sua conexão.`;
        setError(String(msg));
      }
    }
    setUploadingType(null);

    // Keep only the files that failed so the user can retry just those.
    setPendingFiles((prev) => {
      const next: Partial<Record<DocumentType, File>> = {};
      for (const type of failed) if (prev[type]) next[type] = prev[type];
      return next;
    });

    if (failed.length === 0) {
      toast.success("Documentos enviados para análise.");
    } else {
      toast.error("Alguns documentos não puderam ser enviados. Tente novamente.");
    }

    // Re-sync with the server so the UI reflects what was actually saved.
    await load();
    setSubmitting(false);
  }

  const documents: DocumentState[] = state?.documents ?? [];
  const uploadedCount = documents.filter((d) => d.uploaded).length;
  const approvedCount = documents.filter((d) => d.status === "APPROVED").length;
  const banner = OVERALL_BANNER[state?.verificationStatus || "PENDING"];

  return (
    <MainLayout>
      <div className="space-y-8 w-full">
        <button
          onClick={() => navigate("/account")}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft size={20} />
          <span>Voltar a Minha Conta</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <ShieldAlert className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              Verificação Profissional
            </h2>
            <p className="text-slate-500 text-sm">
              Envie os documentos obrigatórios para validar seu cadastro médico.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Carregando seus documentos...
          </div>
        ) : (
          <>
            {/* Overall status */}
            {banner && (
              <div
                className={`rounded-2xl border p-4 flex items-center gap-4 ${banner.className}`}
              >
                <div className="shrink-0">{banner.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold">
                    {
                      VERIFICATION_STATUS_LABELS[
                        state?.verificationStatus || "PENDING"
                      ]
                    }
                  </p>
                  <p className="text-xs opacity-90">{banner.text}</p>
                </div>
                <button
                  type="button"
                  onClick={load}
                  aria-label="Atualizar status"
                  className="p-2 rounded-xl hover:bg-black/5 transition-colors cursor-pointer border-none bg-transparent shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Progress */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-700">
                  Documentos aprovados
                </span>
                <span className="text-sm font-bold text-primary">
                  {approvedCount}/{DOCUMENT_ORDER.length} aprovados ·{" "}
                  {uploadedCount}/{DOCUMENT_ORDER.length} enviados
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${(approvedCount / DOCUMENT_ORDER.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-500 font-medium">
                {error}
              </p>
            )}

            {/* Document cards */}
            <div className="space-y-4">
              {documents.map((doc) => {
                const isUploading = uploadingType === doc.type;
                const locked = !doc.canReplace;
                const pendingFile = pendingFiles[doc.type];

                return (
                  <div
                    key={doc.type}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900">
                          {DOCUMENT_LABELS[doc.type]}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {DOCUMENT_DESCRIPTIONS[doc.type]}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 border ${STATUS_BADGE[doc.status]}`}
                      >
                        {STATUS_ICON[doc.status]}
                        {DOCUMENT_STATUS_LABELS[doc.status]}
                      </span>
                    </div>

                    {/* Reviewer feedback */}
                    {doc.status === "REJECTED" && doc.rejectionReason && (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                        <p className="text-xs font-bold text-rose-700 mb-0.5">
                          Motivo da recusa
                        </p>
                        <p className="text-xs text-rose-700">
                          {doc.rejectionReason}
                        </p>
                      </div>
                    )}

                    {doc.status === "APPROVED" && (
                      <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                        Documento aprovado pela nossa equipe.
                      </p>
                    )}

                    {doc.status === "PENDING" && (
                      <p className="text-xs text-primary bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
                        Em análise. Não é possível alterar este documento até
                        haver um retorno.
                      </p>
                    )}

                    {/* Uploaded file */}
                    {doc.uploaded && (
                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                        <CheckCircle className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm text-slate-700 font-medium truncate flex-1">
                          {doc.originalFileName || "Arquivo enviado"}
                        </span>
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:opacity-80 shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver
                          </a>
                        )}
                      </div>
                    )}

                    {/* Newly selected file, staged for submission */}
                    {pendingFile && (
                      <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                        <FileUp className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm text-slate-700 font-medium truncate flex-1">
                          {pendingFile.name}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary shrink-0">
                          A enviar
                        </span>
                        {!submitting && (
                          <button
                            type="button"
                            onClick={() => removePendingFile(doc.type)}
                            aria-label="Remover arquivo selecionado"
                            className="shrink-0 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer border-none bg-transparent"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}

                    <input
                      ref={(el) => {
                        fileRefs.current[doc.type] = el;
                      }}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) =>
                        handleFileSelected(
                          doc.type,
                          e.target.files?.[0] || null,
                        )
                      }
                    />

                    {/* Choose / replace action (staging only — no upload yet) */}
                    {!locked && (
                      <button
                        type="button"
                        disabled={isUploading || submitting}
                        onClick={() => fileRefs.current[doc.type]?.click()}
                        className="w-full flex items-center justify-center gap-2 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer border border-dashed border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <FileUp className="w-4 h-4 text-slate-400" />
                        {pendingFile
                          ? "Trocar arquivo selecionado"
                          : doc.uploaded
                            ? "Substituir arquivo (PDF, JPG ou PNG)"
                            : "Selecionar arquivo (PDF, JPG ou PNG)"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit all staged documents at once */}
            {(() => {
              const pendingCount = Object.keys(pendingFiles).length;
              return (
                <div className="flex flex-col items-stretch gap-2 pt-2">
                  <button
                    type="button"
                    disabled={pendingCount === 0 || submitting}
                    onClick={handleSubmitAll}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl px-6 py-3.5 text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando documentos...
                      </>
                    ) : (
                      <>
                        <FileUp className="w-4 h-4" />
                        {pendingCount > 0
                          ? `Enviar ${pendingCount} documento${pendingCount > 1 ? "s" : ""} para análise`
                          : "Enviar documentos para análise"}
                      </>
                    )}
                  </button>
                  {pendingCount === 0 && (
                    <p className="text-xs text-slate-400 text-center">
                      Selecione ao menos um documento acima para habilitar o envio.
                    </p>
                  )}
                </div>
              );
            })()}
          </>
        )}
      </div>
    </MainLayout>
  );
}
