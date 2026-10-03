import { useState } from "react";
import { ScrollText, Download, X } from "lucide-react";
import {
  TextInput,
  DateInput,
  FileInput,
  FormActions,
} from "../../components/ui/FormField";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { RichTextEditor } from "../../components/ui/RichTextEditor";
import { useAuth } from "../../contexts/AuthContext";
import { ApiError } from "../../services/api";
import { parseCrm } from "../../utils/crm";
import {
  reportsApi,
  REPORT_CLINICAL_FIELDS,
  REPORT_TYPES,
  type Report,
  type ReportClinicalField,
  type ReportPayload,
  type ReportType,
  type RichTextDoc,
} from "../../services/reports";

/**
 * "Novo Laudo" / edit form, following the same shape as the other medical
 * record forms (AtestadoForm, ExamForm, SurgeryForm): inline/modal variants,
 * `FormActions` footer, inline error banner.
 *
 * Two independent ways to file a laudo, either or both:
 *  - write its content here (structured rich text — Hispora generates the PDF
 *    from it, and it stays editable);
 *  - attach an existing PDF the doctor issued elsewhere, possibly years ago.
 * The attachment is kept separate from the generated document precisely
 * because Hispora didn't produce it.
 */

const DOCTOR_FIELD_NOTE =
  "Preenchido a partir do seu perfil. Para alterar, atualize os dados em Minha Conta.";

/** Identification the doctor can see but not type over. */
function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="space-y-1.5">
      <p className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <p className="bg-slate-100 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-semibold text-slate-700">
        {value || "—"}
      </p>
    </div>
  );
}

type ClinicalContent = Record<ReportClinicalField, RichTextDoc | null>;

const EMPTY_CLINICAL = REPORT_CLINICAL_FIELDS.reduce(
  (acc, field) => ({ ...acc, [field.key]: null }),
  {} as ClinicalContent,
);

export function LaudoForm({
  patientId,
  dependentId,
  appointmentId,
  initial,
  onClose,
  onSaved,
  variant = "modal",
}: {
  patientId?: string;
  dependentId?: string;
  appointmentId?: string;
  initial?: Report;
  onClose: () => void;
  /** Receives the saved laudo so the caller can move on to the preview. */
  onSaved: (report: Report) => void;
  variant?: "modal" | "inline";
}) {
  const { user } = useAuth();

  const isEditing = !!initial;
  const isLocked =
    initial?.status === "signed" || initial?.status === "canceled";

  const [reportType, setReportType] = useState<ReportType>(
    initial?.reportType || "laudo_medico",
  );
  const [reportTypeOther, setReportTypeOther] = useState(
    initial?.reportTypeOther || "",
  );
  const [title, setTitle] = useState(initial?.title || "");
  const [issueDate, setIssueDate] = useState(
    initial?.issueDate?.split("T")[0] || new Date().toISOString().split("T")[0],
  );
  const [relatedServiceDate, setRelatedServiceDate] = useState(
    initial?.relatedServiceDate?.split("T")[0] || "",
  );
  const [purpose, setPurpose] = useState(initial?.purpose || "");
  const [clinical, setClinical] = useState<ClinicalContent>(() => {
    if (!initial) return EMPTY_CLINICAL;
    return REPORT_CLINICAL_FIELDS.reduce(
      (acc, field) => ({ ...acc, [field.key]: initial[field.key] ?? null }),
      {} as ClinicalContent,
    );
  });
  const [file, setFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState(
    initial?.fileUrl || null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doctorCrm = parseCrm(isEditing ? initial.doctorCrmSnapshot : user?.crm);

  async function handleRemoveFile() {
    if (!initial) return;
    try {
      const updated = await reportsApi.removeFile(initial.id);
      setExistingFileUrl(updated.fileUrl);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? String(err.data?.message || "Erro ao remover o anexo.")
          : "Erro ao remover o anexo.",
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Informe o título do laudo.");
      return;
    }
    if (!issueDate) {
      setError("Informe a data de emissão.");
      return;
    }
    if (reportType === "outro" && !reportTypeOther.trim()) {
      setError('Descreva o tipo de laudo ao escolher "Outro".');
      return;
    }

    // A laudo needs something on it: either content written here or an
    // attached document. Both empty would file a record with nothing in it.
    const hasContent = REPORT_CLINICAL_FIELDS.some(
      (field) => clinical[field.key] !== null,
    );
    if (!hasContent && !file && !existingFileUrl) {
      setError(
        "Preencha pelo menos um campo do laudo ou anexe um documento existente.",
      );
      return;
    }

    setSaving(true);
    try {
      const clinicalPayload = REPORT_CLINICAL_FIELDS.reduce(
        (acc, field) => {
          const value = clinical[field.key];
          if (value) acc[field.key] = value;
          return acc;
        },
        {} as Partial<Record<ReportClinicalField, RichTextDoc>>,
      );

      const payload: ReportPayload = {
        reportType,
        ...(reportType === "outro"
          ? { reportTypeOther: reportTypeOther.trim() }
          : {}),
        title: title.trim(),
        issueDate,
        ...(relatedServiceDate ? { relatedServiceDate } : {}),
        ...(purpose.trim() ? { purpose: purpose.trim() } : {}),
        ...clinicalPayload,
      };

      // Clinical fields are rich-text objects, so the laudo itself is saved
      // as JSON; the attachment goes up separately as multipart.
      let saved = isEditing
        ? await reportsApi.update(initial.id, payload)
        : await reportsApi.create({
            ...payload,
            ...(patientId ? { patientId } : {}),
            ...(dependentId ? { dependentId } : {}),
            ...(appointmentId ? { appointmentId } : {}),
          });

      if (file) {
        saved = await reportsApi.attachFile(saved.id, file);
      }

      onSaved(saved);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? String(
              err.data?.message || "Erro ao salvar laudo. Tente novamente.",
            )
          : "Erro ao salvar laudo. Tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className={
        variant === "inline"
          ? "bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5"
          : "p-8 pt-0 space-y-5"
      }
      onSubmit={handleSubmit}
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {isLocked && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm font-medium">
          {initial?.status === "signed"
            ? "Este laudo já foi assinado e não pode mais ser alterado. Para corrigi-lo, emita um novo laudo."
            : "Este laudo está cancelado e não pode mais ser alterado."}
        </div>
      )}

      {/* --- Médico responsável (never editable here) --- */}
      <div className="grid grid-cols-2 gap-4">
        <ReadOnlyField
          label="Médico(a) Responsável"
          value={isEditing ? initial.doctorNameSnapshot : user?.name}
        />
        <ReadOnlyField
          label="Especialidade"
          value={isEditing ? initial.doctorSpecialtySnapshot : user?.specialty}
        />
        <ReadOnlyField label="CRM" value={doctorCrm.number} />
        <ReadOnlyField label="UF do CRM" value={doctorCrm.uf} />
      </div>
      <p className="text-xs text-slate-400">{DOCTOR_FIELD_NOTE}</p>

      {/* --- Dados do laudo --- */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Tipo de Laudo
        </label>
        <CustomSelect
          name="report-type"
          value={reportType}
          onChange={(value) => setReportType(value as ReportType)}
          options={REPORT_TYPES.map((t) => ({
            value: t.value,
            label: t.label,
          }))}
          placeholder="Selecione o tipo"
        />
      </div>

      {reportType === "outro" && (
        <TextInput
          label="Descreva o Tipo"
          name="report-type-other"
          value={reportTypeOther}
          onChange={setReportTypeOther}
          placeholder="Ex: Laudo para prática esportiva"
          disabled={isLocked}
        />
      )}

      <TextInput
        label="Título"
        name="report-title"
        value={title}
        onChange={setTitle}
        placeholder="Ex: Laudo de acompanhamento clínico"
        disabled={isLocked}
      />

      <div className="grid grid-cols-2 gap-6">
        <DateInput
          label="Data de Emissão"
          name="report-issue-date"
          value={issueDate}
          onChange={setIssueDate}
        />
        <DateInput
          label="Data do Atendimento"
          name="report-service-date"
          value={relatedServiceDate}
          onChange={setRelatedServiceDate}
        />
      </div>

      <TextInput
        label="Finalidade"
        name="report-purpose"
        value={purpose}
        onChange={setPurpose}
        placeholder="Ex: Encaminhamento para especialista"
        disabled={isLocked}
      />

      {/* --- Conteúdo clínico --- */}
      <div className="pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-400 pt-4">
          Preencha os campos aplicáveis. Seções vazias não aparecem no documento
          gerado.
        </p>
      </div>

      {REPORT_CLINICAL_FIELDS.map((field) => (
        <RichTextEditor
          key={field.key}
          label={field.label}
          value={clinical[field.key]}
          disabled={isLocked}
          onChange={(value) =>
            setClinical((prev) => ({ ...prev, [field.key]: value }))
          }
        />
      ))}

      {/* --- Anexo de laudo pré-existente --- */}
      <div className="pt-2 border-t border-slate-100 space-y-4">
        {existingFileUrl ? (
          <div className="pt-4 space-y-2">
            <p className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Documento Anexado
            </p>
            <div className="flex items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <a
                href={existingFileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline underline-offset-2"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar anexo
              </a>
              {!isLocked && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0"
                >
                  <X className="w-3.5 h-3.5" />
                  Remover
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="pt-4">
            <FileInput
              label="Anexar Laudo Existente (PDF ou imagem)"
              name="report-file"
              onChange={setFile}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Para laudos emitidos fora do Hispora que você queira arquivar no
              prontuário. O anexo é guardado como está, sem substituir o
              documento gerado pela plataforma.
            </p>
          </div>
        )}
      </div>

      <FormActions
        onCancel={onClose}
        loading={saving}
        submitLabel={isEditing ? "Salvar Alterações" : "Salvar Laudo"}
        icon={<ScrollText className="w-4 h-4" />}
      />
    </form>
  );
}
