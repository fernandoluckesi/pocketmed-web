import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Loader2, PenLine, ShieldAlert } from "lucide-react";
import { Button } from "../components/ui/Button";
import { api, ApiError } from "../services/api";

interface PendingSignatureInfo {
  documentId: string;
  documentType: "prescription" | "report" | "exam";
  signerName: string;
}

const DOCUMENT_TYPE_LABELS: Record<PendingSignatureInfo["documentType"], string> = {
  prescription: "Receita médica",
  report: "Laudo médico",
  exam: "Pedido de exame",
};

/** The feature route each document type's confirm-signature call goes to.
 * Deliberately not a naive `${documentType}s` pluralization — "exam" would
 * collide with the unrelated `/exams` (scheduling/results) resource, so
 * exam-request documents live at `/exam-requests` instead. */
const ROUTE_PREFIX: Record<PendingSignatureInfo["documentType"], string> = {
  prescription: "prescriptions",
  report: "reports",
  exam: "exam-requests",
};

/**
 * Stand-in for a real e-signature provider's (DocuSign) hosted signing page —
 * no real provider is contracted yet. Opened in a new tab by
 * `SendDocumentModal`; same-origin, so it shares the doctor's existing
 * session (no separate auth scheme needed for this simulation). Clicking
 * "Assinar" here calls the issuing feature's own
 * `POST /:type/:id/confirm-signature` — never a generic endpoint — so each
 * feature stays in control of updating its own document.
 */
export default function SignatureSimulator() {
  const { token } = useParams<{ token: string }>();
  const [info, setInfo] = useState<PendingSignatureInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api(`/signature-simulator/${token}`);
      setInfo(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.data?.message || "Solicitação de assinatura não encontrada."
          : "Solicitação de assinatura não encontrada.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSign() {
    if (!info || !token) return;
    setSigning(true);
    setError(null);
    try {
      await api(`/${ROUTE_PREFIX[info.documentType]}/${info.documentId}/confirm-signature`, {
        method: "POST",
        body: { externalSignatureId: token },
      });
      setSigned(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.data?.message || "Não foi possível concluir a assinatura."
          : "Não foi possível concluir a assinatura.",
      );
    } finally {
      setSigning(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-slate-800 px-6 py-4 flex items-center gap-2">
          <PenLine className="w-4 h-4 text-white" />
          <p className="text-white text-sm font-bold tracking-wide">
            Plataforma de Assinatura (simulação)
          </p>
        </div>

        <div className="p-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-slate-500">Carregando documento...</p>
            </div>
          ) : error && !signed ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <ShieldAlert className="w-10 h-10 text-red-500" />
              <p className="text-sm font-bold text-slate-800">{error}</p>
            </div>
          ) : signed ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
              <p className="text-base font-bold text-slate-900">
                Documento assinado com sucesso
              </p>
              <p className="text-sm text-slate-500">
                Você já pode fechar esta aba e voltar para a Hispora.
              </p>
              <Button
                type="button"
                onClick={() => window.close()}
                variant="primary"
                size="md"
              >
                Fechar aba
              </Button>
            </div>
          ) : (
            info && (
              <>
                <div className="space-y-1 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {DOCUMENT_TYPE_LABELS[info.documentType]}
                  </p>
                  <p className="text-sm text-slate-600">
                    Solicitado por <strong>{info.signerName}</strong>
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
                  Esta é uma simulação do fluxo de assinatura digital (o
                  provedor real ainda não está integrado). Ao clicar em
                  "Assinar documento", a Hispora marcará este documento como
                  assinado e o enviará ao paciente.
                </div>
                <Button
                  type="button"
                  onClick={handleSign}
                  loading={signing}
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<PenLine className="w-4 h-4" />}
                >
                  {signing ? "Assinando..." : "Assinar documento"}
                </Button>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
