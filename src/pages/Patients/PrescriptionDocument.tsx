import { useState } from "react";
import { FileText, Download, Clock, Eye, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Textarea } from "../../components/ui/FormField";
import { DocumentPreview } from "../../components/DocumentPreview";
import { useToast } from "../../contexts/ToastContext";
import { ApiError } from "../../services/api";
import {
  prescriptionsApi,
  type Prescription,
  type PrescriptionItemInput,
} from "../../services/prescriptions";
import type { DocumentSpec } from "../../services/reports";

/**
 * "Gerar receita" step, shown right after medications are saved in
 * `PrescriptionForm` — review/complete the formal prescription wording
 * (concentration/form/route aren't captured by the lighter medication-
 * tracking fields), preview the document, then generate the PDF via the
 * backend. No digital signature exists yet — the status line below is never
 * allowed to claim otherwise (it mirrors whatever the backend reports).
 */
export function PrescriptionDocument({
  patientId,
  items: initialItems,
  observations: initialObservations,
  onClose,
}: {
  patientId: string;
  items: PrescriptionItemInput[];
  observations?: string;
  onClose: () => void;
}) {
  const toast = useToast();
  const [items, setItems] = useState(initialItems);
  const [observations, setObservations] = useState(initialObservations || "");
  const [step, setStep] = useState<"edit" | "preview">("edit");
  const [busy, setBusy] = useState(false);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [spec, setSpec] = useState<DocumentSpec | null>(null);

  function updateItem(
    index: number,
    field: keyof PrescriptionItemInput,
    value: string,
  ) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function reportError(err: unknown, fallback: string) {
    toast.error(
      err instanceof ApiError
        ? String(err.data?.message || fallback)
        : fallback,
    );
  }

  /** Saves the prescription (creating it on first pass, updating it on
   * subsequent edits) and loads the backend's document spec for review. */
  async function handlePreview() {
    setBusy(true);
    try {
      const saved = prescription
        ? await prescriptionsApi.update(prescription.id, {
            items,
            observations: observations || undefined,
          })
        : await prescriptionsApi.create({
            patientId,
            items,
            observations: observations || undefined,
          });
      setPrescription(saved);
      setSpec(await prescriptionsApi.preview(saved.id));
      setStep("preview");
    } catch (err) {
      reportError(err, "Erro ao preparar a receita.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerate() {
    if (!prescription) return;
    setBusy(true);
    try {
      setPrescription(await prescriptionsApi.generatePdf(prescription.id));
      toast.success("Receita gerada com sucesso!");
    } catch (err) {
      reportError(err, "Erro ao gerar a receita.");
    } finally {
      setBusy(false);
    }
  }

  const hasPdf = !!prescription?.documentUrl;

  if (step === "preview") {
    return (
      <div className="space-y-5">
        {spec && <DocumentPreview spec={spec} />}

        {hasPdf && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            {/* Mirrors the backend's signature status — never asserts a
                digital signature that doesn't exist. */}
            <p className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
              <Clock size={14} />
              {prescription?.signatureStatus === "signed"
                ? "Documento assinado digitalmente."
                : "Documento gerado — assinatura digital ainda não configurada."}
            </p>
            <div className="flex gap-3">
              <a
                href={prescription!.documentUrl!}
                target="_blank"
                rel="noreferrer"
                className="flex-1"
              >
                <Button type="button" variant="outline" size="md" fullWidth>
                  Visualizar PDF
                </Button>
              </a>
              <a href={prescription!.documentUrl!} download className="flex-1">
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
          </div>
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
                ? "Gerar receita novamente"
                : "Gerar receita"}
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
          Medicamentos salvos. Complete os campos abaixo (opcionais, mas
          recomendados para a receita formal) e clique em{" "}
          <strong>Visualizar receita</strong> para conferir o documento antes de
          gerar o PDF.
        </p>
      </div>

      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3"
        >
          <p className="text-sm font-bold text-slate-900">{item.name}</p>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Concentração (ex: 500mg)"
              aria-label={`Concentração de ${item.name}`}
              value={item.concentration || ""}
              onChange={(e) =>
                updateItem(index, "concentration", e.target.value)
              }
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
            />
            <input
              type="text"
              placeholder="Forma farmacêutica (ex: Comprimido)"
              aria-label={`Forma farmacêutica de ${item.name}`}
              value={item.pharmaceuticalForm || ""}
              onChange={(e) =>
                updateItem(index, "pharmaceuticalForm", e.target.value)
              }
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
            />
            <input
              type="text"
              placeholder="Quantidade (ex: 21 comprimidos)"
              aria-label={`Quantidade de ${item.name}`}
              value={item.quantity || ""}
              onChange={(e) => updateItem(index, "quantity", e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
            />
            <input
              type="text"
              placeholder="Via de administração (ex: Oral)"
              aria-label={`Via de administração de ${item.name}`}
              value={item.routeOfAdministration || ""}
              onChange={(e) =>
                updateItem(index, "routeOfAdministration", e.target.value)
              }
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
            />
            <input
              type="text"
              placeholder="Posologia"
              aria-label={`Posologia de ${item.name}`}
              value={item.posology || ""}
              onChange={(e) => updateItem(index, "posology", e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary col-span-2"
            />
            <input
              type="text"
              placeholder="Duração do tratamento (ex: 7 dias)"
              aria-label={`Duração do tratamento de ${item.name}`}
              value={item.treatmentDuration || ""}
              onChange={(e) =>
                updateItem(index, "treatmentDuration", e.target.value)
              }
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary col-span-2"
            />
          </div>
        </div>
      ))}

      <Textarea
        label="Observações (opcional)"
        name="prescription-observations"
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
          {busy ? "Preparando..." : "Visualizar receita"}
        </Button>
      </div>
    </div>
  );
}
