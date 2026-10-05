import { useEffect, useRef, useState } from "react";
import { Clock, Download, FileText, Loader2, Send, XCircle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { SendDocumentModal } from "../../components/SendDocumentModal";
import { useToast } from "../../contexts/ToastContext";
import { ApiError } from "../../services/api";
import {
  examRequestsApi,
  type ExamRequest,
  type ExamRequestItemInput,
} from "../../services/examRequests";

type Status = "generating" | "ready" | "error";

/**
 * Shown right after exam names are saved — mirrors `PrescriptionDocument.tsx`
 * exactly: immediately creates the exam request and generates its PDF, no
 * manual review step, showing a loading state the whole time, then hands
 * straight into the shared "Como deseja enviar?" modal.
 */
export function ExamRequestDocument({
  patientId,
  appointmentId,
  items,
  observations,
  onClose,
}: {
  patientId: string;
  appointmentId?: string;
  items: ExamRequestItemInput[];
  observations?: string;
  onClose: () => void;
}) {
  const toast = useToast();
  const [status, setStatus] = useState<Status>("generating");
  const [errorMessage, setErrorMessage] = useState("");
  const [examRequest, setExamRequest] = useState<ExamRequest | null>(null);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const startedRef = useRef(false);

  async function generate() {
    setStatus("generating");
    setErrorMessage("");
    try {
      const created = await examRequestsApi.create({
        patientId,
        appointmentId,
        items,
        observations: observations || undefined,
      });
      const generated = await examRequestsApi.generatePdf(created.id);
      setExamRequest(generated);
      setStatus("ready");
      toast.success("Pedido de exame gerado com sucesso!");
      // Straight into "como deseja enviar?" — the doctor shouldn't have to
      // remember a separate step to actually get the pedido to the patient.
      setSendModalOpen(true);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? String(err.data?.message || "Erro ao gerar o pedido de exame.")
          : "Erro ao gerar o pedido de exame.";
      setErrorMessage(message);
      setStatus("error");
      toast.error(message);
    }
  }

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "generating") {
    return (
      <div className="py-16 flex flex-col items-center gap-4 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-bold text-slate-800">
          Gerando PDF do pedido de exame...
        </p>
        <p className="text-xs text-slate-500">Isso leva só alguns segundos.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="py-10 flex flex-col items-center gap-4 text-center">
        <XCircle className="w-10 h-10 text-red-500" />
        <p className="text-sm font-bold text-slate-800">{errorMessage}</p>
        <div className="flex gap-4 w-full pt-2">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            size="md"
            fullWidth
            className="shadow-none bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Fechar
          </Button>
          <Button type="button" onClick={generate} variant="primary" size="md" fullWidth>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const hasPdf = !!examRequest?.documentUrl;

  return (
    <div className="space-y-5">
      {hasPdf && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
            <Clock size={14} />
            {examRequest?.signatureStatus === "signed"
              ? "Documento assinado digitalmente e enviado ao paciente."
              : examRequest?.status === "sent"
                ? "Documento enviado ao paciente — sem assinatura digital."
                : "Documento gerado — ainda não enviado ao paciente."}
          </p>
          <div className="flex gap-3">
            <a
              href={examRequest!.documentUrl!}
              target="_blank"
              rel="noreferrer"
              className="flex-1"
            >
              <Button type="button" variant="outline" size="md" fullWidth>
                Visualizar PDF
              </Button>
            </a>
            <a href={examRequest!.documentUrl!} download className="flex-1">
              <Button
                type="button"
                variant="primary"
                size="md"
                fullWidth
                icon={<Download className="w-4 h-4" />}
              >
                Baixar PDF
              </Button>
            </a>
          </div>
          {examRequest?.status === "generated" && (
            <Button
              type="button"
              onClick={() => setSendModalOpen(true)}
              variant="primary"
              size="md"
              fullWidth
              icon={<Send className="w-4 h-4" />}
            >
              Enviar pedido de exame
            </Button>
          )}
        </div>
      )}

      {examRequest && (
        <SendDocumentModal
          isOpen={sendModalOpen}
          onClose={() => setSendModalOpen(false)}
          documentLabel="pedido de exame"
          onSendWithoutSignature={async () => {
            const updated = await examRequestsApi.send(examRequest.id);
            setExamRequest(updated);
            return { documentUrl: updated.documentUrl };
          }}
          onRequestSignature={async () => {
            const { examRequest: updated, signingUrl } =
              await examRequestsApi.requestSignature(examRequest.id);
            setExamRequest(updated);
            return { signingUrl };
          }}
          onPollSignature={async () => {
            const updated = await examRequestsApi.getById(examRequest.id);
            setExamRequest(updated);
            return {
              signed: updated.signatureStatus === "signed",
              failed: updated.signatureStatus === "failed",
              documentUrl: updated.documentUrl,
            };
          }}
        />
      )}

      <div className="flex gap-4 pt-2">
        <Button
          type="button"
          onClick={onClose}
          variant="secondary"
          size="md"
          fullWidth
          className="shadow-none bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          Fechar
        </Button>
        <Button
          type="button"
          onClick={generate}
          variant="outline"
          size="md"
          fullWidth
          icon={<FileText className="w-4 h-4" />}
        >
          Gerar pedido novamente
        </Button>
      </div>
    </div>
  );
}
