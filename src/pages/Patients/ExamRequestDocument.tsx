import { useState } from "react";
import { FileText, Download, Clock, Eye, ArrowLeft, Send } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Textarea } from "../../components/ui/FormField";
import { DocumentPreview } from "../../components/DocumentPreview";
import { SendDocumentModal } from "../../components/SendDocumentModal";
import { useToast } from "../../contexts/ToastContext";
import { ApiError } from "../../services/api";
import {
  examRequestsApi,
  type ExamRequest,
  type ExamRequestItemInput,
} from "../../services/examRequests";
import type { DocumentSpec } from "../../services/reports";

/**
 * "Solicitar exame" step, shown right after the exam names are saved —
 * mirrors `PrescriptionDocument.tsx` exactly (same preview -> generate ->
 * send/sign flow, same shared `SendDocumentModal`/signature-simulator
 * infra), just for a "pedido de exame" instead of a receita.
 */
export function ExamRequestDocument({
  patientId,
  appointmentId,
  items: initialItems,
  observations: initialObservations,
  onClose,
}: {
  patientId: string;
  appointmentId?: string;
  items: ExamRequestItemInput[];
  observations?: string;
  onClose: () => void;
}) {
  const toast = useToast();
  const [items, setItems] = useState(initialItems);
  const [observations, setObservations] = useState(initialObservations || "");
  const [step, setStep] = useState<"edit" | "preview">("edit");
  const [busy, setBusy] = useState(false);
  const [examRequest, setExamRequest] = useState<ExamRequest | null>(null);
  const [spec, setSpec] = useState<DocumentSpec | null>(null);
  const [sendModalOpen, setSendModalOpen] = useState(false);

  function updateItemName(index: number, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, name: value } : item)),
    );
  }

  function reportError(err: unknown, fallback: string) {
    toast.error(
      err instanceof ApiError
        ? String(err.data?.message || fallback)
        : fallback,
    );
  }

  /** Saves the exam request (creating it on first pass, updating it on
   * subsequent edits) and loads the backend's document spec for review. */
  async function handlePreview() {
    setBusy(true);
    try {
      const saved = examRequest
        ? await examRequestsApi.update(examRequest.id, {
            items,
            observations: observations || undefined,
          })
        : await examRequestsApi.create({
            patientId,
            appointmentId,
            items,
            observations: observations || undefined,
          });
      setExamRequest(saved);
      setSpec(await examRequestsApi.preview(saved.id));
      setStep("preview");
    } catch (err) {
      reportError(err, "Erro ao preparar o pedido de exame.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerate() {
    if (!examRequest) return;
    setBusy(true);
    try {
      setExamRequest(await examRequestsApi.generatePdf(examRequest.id));
      toast.success("Pedido de exame gerado com sucesso!");
      // Straight into "como deseja enviar?" — the doctor shouldn't have to
      // remember a separate step to actually get the pedido to the patient.
      setSendModalOpen(true);
    } catch (err) {
      reportError(err, "Erro ao gerar o pedido de exame.");
    } finally {
      setBusy(false);
    }
  }

  const hasPdf = !!examRequest?.documentUrl;

  if (step === "preview") {
    return (
      <div className="space-y-5">
        {spec && <DocumentPreview spec={spec} />}

        {hasPdf && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            {/* Mirrors the backend's status/signatureStatus — never asserts a
                digital signature or delivery that didn't actually happen. */}
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
            onClick={hasPdf ? onClose : () => setStep("edit")}
            variant="secondary"
            size="md"
            fullWidth
            icon={hasPdf ? undefined : <ArrowLeft className="w-4 h-4" />}
            className="shadow-none bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            {hasPdf ? "Fechar" : "Voltar e editar"}
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            loading={busy}
            variant="primary"
            size="md"
            fullWidth
            icon={<FileText className="w-4 h-4" />}
          >
            {busy
              ? "Gerando..."
              : hasPdf
                ? "Gerar pedido novamente"
                : "Gerar pedido de exame"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          Exames salvos. Confira os nomes abaixo e clique em{" "}
          <strong>Visualizar pedido</strong> para conferir o documento antes
          de gerar o PDF.
        </p>
      </div>

      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3"
        >
          <input
            type="text"
            placeholder="Nome do exame"
            aria-label={`Exame ${index + 1}`}
            value={item.name}
            onChange={(e) => updateItemName(index, e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
          />
        </div>
      ))}

      <Textarea
        label="Observações (opcional)"
        name="exam-request-observations"
        value={observations}
        onChange={setObservations}
        rows={2}
      />

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
          onClick={handlePreview}
          loading={busy}
          variant="primary"
          size="md"
          fullWidth
          icon={<Eye className="w-4 h-4" />}
        >
          {busy ? "Preparando..." : "Visualizar pedido"}
        </Button>
      </div>
    </div>
  );
}
