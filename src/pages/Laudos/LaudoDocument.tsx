import { useCallback, useEffect, useState } from "react";
import {
  Clock,
  Download,
  FileText,
  Loader2,
  Paperclip,
  Pencil,
  Send,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { DocumentPreview } from "../../components/DocumentPreview";
import { SendDocumentModal } from "../../components/SendDocumentModal";
import { useToast } from "../../contexts/ToastContext";
import { ApiError } from "../../services/api";
import {
  reportsApi,
  type DocumentSpec,
  type Report,
} from "../../services/reports";

/**
 * "Visualizar laudo" step: renders the document spec the backend will draw
 * the PDF from, then generates it. The preview and the PDF come from the
 * same server-side structure, so what's approved on screen is what gets
 * generated.
 */
export function LaudoDocument({
  report,
  onBackToEdit,
  onGenerated,
}: {
  report: Report;
  onBackToEdit: () => void;
  onGenerated: (updated: Report) => void;
}) {
  const toast = useToast();
  const [spec, setSpec] = useState<DocumentSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    try {
      setSpec(await reportsApi.preview(report.id));
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? String(err.data?.message || "Erro ao carregar a pré-visualização.")
          : "Erro ao carregar a pré-visualização.",
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.id, report.updatedAt]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const updated = await reportsApi.generatePdf(report.id);
      onGenerated(updated);
      toast.success("PDF gerado com sucesso.");
      // Straight into "como deseja enviar?" — the doctor shouldn't have to
      // remember a separate step to actually get the laudo to the patient.
      setSendModalOpen(true);
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? String(err.data?.message || "Erro ao gerar o PDF.")
          : "Erro ao gerar o PDF.",
      );
    } finally {
      setGenerating(false);
    }
  }

  const hasPdf = !!report.documentUrl;
  // The backend rejects regeneration for signed (immutable) and canceled
  // documents; don't offer an action that can only fail.
  const canGenerate =
    report.status !== "signed" && report.status !== "canceled";

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : spec ? (
        <DocumentPreview spec={spec} />
      ) : null}

      {report.fileUrl && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          {/* An uploaded document, not one Hispora produced — labeled as such
              so it's never mistaken for the generated PDF below. */}
          <p className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
            <Paperclip size={14} />
            Documento anexado pelo médico (emitido fora da plataforma).
          </p>
          <div className="flex gap-3">
            <a
              href={report.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1"
            >
              <Button type="button" variant="outline" size="md" fullWidth>
                Visualizar anexo
              </Button>
            </a>
            <a href={report.fileUrl} download className="flex-1">
              <Button
                type="button"
                variant="secondary"
                size="md"
                fullWidth
                icon={<Download className="w-4 h-4" />}
                className="shadow-none bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Baixar anexo
              </Button>
            </a>
          </div>
        </div>
      )}

      {hasPdf && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          {/* Mirrors the backend's status/signatureStatus — never asserts a
              digital signature or delivery that didn't actually happen. */}
          <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
            <Clock size={14} />
            {report.signatureStatus === "signed"
              ? "Documento assinado digitalmente e enviado ao paciente."
              : report.status === "sent"
                ? "Documento enviado ao paciente — sem assinatura digital."
                : "Documento gerado — ainda não enviado ao paciente."}
          </p>
          <div className="flex gap-3">
            <a
              href={report.documentUrl!}
              target="_blank"
              rel="noreferrer"
              className="flex-1"
            >
              <Button type="button" variant="outline" size="md" fullWidth>
                Visualizar PDF
              </Button>
            </a>
            <a href={report.documentUrl!} download className="flex-1">
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
          {report.status === "generated" && (
            <Button
              type="button"
              onClick={() => setSendModalOpen(true)}
              variant="primary"
              size="md"
              fullWidth
              icon={<Send className="w-4 h-4" />}
            >
              Enviar laudo
            </Button>
          )}
        </div>
      )}

      <SendDocumentModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        documentLabel="laudo"
        onSendWithoutSignature={async () => {
          const updated = await reportsApi.send(report.id);
          onGenerated(updated);
          return { documentUrl: updated.documentUrl };
        }}
        onRequestSignature={async () => {
          const { report: updated, signingUrl } = await reportsApi.requestSignature(report.id);
          onGenerated(updated);
          return { signingUrl };
        }}
        onPollSignature={async () => {
          const updated = await reportsApi.getById(report.id);
          onGenerated(updated);
          return {
            signed: updated.signatureStatus === "signed",
            failed: updated.signatureStatus === "failed",
            documentUrl: updated.documentUrl,
          };
        }}
      />

      <div className="flex gap-4">
        <Button
          type="button"
          variant="secondary"
          size="md"
          fullWidth
          onClick={onBackToEdit}
          icon={canGenerate ? <Pencil className="w-4 h-4" /> : undefined}
          className="shadow-none bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          {canGenerate ? "Editar laudo" : "Fechar"}
        </Button>
        {canGenerate && (
          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            loading={generating}
            onClick={handleGenerate}
            icon={<FileText className="w-4 h-4" />}
          >
            {generating
              ? "Gerando..."
              : hasPdf
                ? "Gerar PDF novamente"
                : "Gerar PDF"}
          </Button>
        )}
      </div>
    </div>
  );
}
