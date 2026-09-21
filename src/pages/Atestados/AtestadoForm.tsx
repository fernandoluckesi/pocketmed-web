import { useState } from "react";
import { FileCheck } from "lucide-react";
import {
  TextInput,
  NumberInput,
  DateInput,
  Textarea,
  FileInput,
  FormActions,
} from "../../components/ui/FormField";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../services/api";

export interface CertificateRecord {
  id: string;
  crm: string;
  cid: string | null;
  description: string | null;
  daysOff: number | null;
  issueDate: string | null;
  fileUrl: string | null;
  createdAt: string;
  patientId?: string | null;
  dependentId?: string | null;
  appointmentId?: string | null;
  patient?: { id: string; name: string; profileImage?: string | null } | null;
  dependent?: { id: string; name: string } | null;
  doctorId?: string;
}

interface AtestadoFormProps {
  patientId?: string;
  dependentId?: string;
  appointmentId?: string;
  initial?: CertificateRecord;
  onClose: () => void;
  onSaved: () => void;
  variant?: "modal" | "inline";
}

export function AtestadoForm({
  patientId,
  dependentId,
  appointmentId,
  initial,
  onClose,
  onSaved,
  variant = "modal",
}: AtestadoFormProps) {
  const { user } = useAuth();
  const [crm, setCrm] = useState(initial?.crm || user?.crm || "");
  const [cid, setCid] = useState(initial?.cid || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [daysOff, setDaysOff] = useState(
    initial?.daysOff != null ? String(initial.daysOff) : "",
  );
  const [issueDate, setIssueDate] = useState(
    initial?.issueDate?.split("T")[0] ||
      new Date().toISOString().split("T")[0],
  );
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!crm.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("crm", crm.trim());
      if (cid.trim()) formData.append("cid", cid.trim());
      if (description.trim()) formData.append("description", description.trim());
      if (daysOff) formData.append("daysOff", daysOff);
      if (issueDate) formData.append("issueDate", issueDate);
      if (file) formData.append("file", file);

      if (initial) {
        await api(`/certificates/${initial.id}`, {
          method: "PUT",
          body: formData,
          isFormData: true,
        });
      } else {
        if (patientId) formData.append("patientId", patientId);
        if (dependentId) formData.append("dependentId", dependentId);
        if (appointmentId) formData.append("appointmentId", appointmentId);
        await api("/certificates", {
          method: "POST",
          body: formData,
          isFormData: true,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao salvar atestado. Tente novamente.",
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

      <p className="text-xs text-slate-400">
        Preenchimento manual por enquanto, a leitura automática do PDF para
        preencher estes campos está prevista para uma próxima etapa.
      </p>

      <TextInput
        label="CRM do Médico"
        name="crm"
        value={crm}
        onChange={setCrm}
        placeholder="CRM/SP 123456"
      />

      <TextInput
        label="CID"
        name="cid"
        value={cid}
        onChange={setCid}
        placeholder="J11"
      />

      <Textarea
        label="Descrição"
        name="description"
        value={description}
        onChange={setDescription}
        placeholder="Repouso domiciliar por síndrome gripal."
      />

      <div className="grid grid-cols-2 gap-4">
        <NumberInput
          label="Dias de Afastamento"
          name="daysOff"
          value={daysOff}
          onChange={setDaysOff}
          min="0"
        />
        <DateInput
          label="Data do Atestado"
          name="issueDate"
          value={issueDate}
          onChange={setIssueDate}
        />
      </div>

      <FileInput
        label="Anexar Atestado (PDF ou imagem)"
        name="file"
        onChange={setFile}
        accept=".pdf,.jpg,.jpeg,.png"
      />

      <FormActions
        onCancel={onClose}
        loading={saving}
        submitLabel="Salvar Atestado"
        icon={<FileCheck className="w-4 h-4" />}
      />
    </form>
  );
}
