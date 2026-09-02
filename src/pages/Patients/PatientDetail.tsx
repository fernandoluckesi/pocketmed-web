import { useState, useEffect } from "react";
import {
  Calendar,
  User,
  Users,
  AlertTriangle,
  Activity,
  Stethoscope,
  MapPin,
  FileText,
  Plus,
  Edit,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  Info,
  Download,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "../../components/MainLayout";
import { Button } from "../../components/ui/Button";
import { usePatientDetail } from "../../hooks/usePatients";
import type { PatientFromAPI, Appointment } from "../../hooks/usePatients";
import { Skeleton } from "../../components/Skeleton";
import { Modal } from "../../components/ui/Modal";
import {
  TextInput,
  DateInput,
  Textarea,
  SelectInput,
  FileInput,
  FormActions,
} from "../../components/ui/FormField";
import { SearchableSelect } from "../../components/ui/SearchableSelect";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { EXAM_CATALOG } from "../../data/exam-catalog";
import { useAuth } from "../../contexts/AuthContext";
import {
  generateExamPdf,
  generatePrescriptionPdf,
} from "../../utils/generate-pdf";
import { api } from "../../services/api";

// --- Types ---

// --- Helpers ---

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return value;
}

// --- Components ---

function PatientHeroFromAPI({
  patient,
  onEdit,
}: {
  patient: PatientFromAPI;
  onEdit?: () => void;
}) {
  const navigate = useNavigate();
  const [now] = useState(() => Date.now());
  const age = patient.birthDate
    ? Math.floor(
        (now - new Date(patient.birthDate).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
      )
    : null;

  return (
    <section className="flex flex-col md:flex-row gap-8 items-start mb-10">
      <div className="relative group">
        {patient.profileImage ? (
          <img
            alt={patient.name}
            className="relative w-40 h-40 rounded-[1.75rem] object-cover border-4 border-white"
            src={patient.profileImage}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="relative w-40 h-40 rounded-[1.75rem] border-4 border-white bg-primary/10 flex items-center justify-center">
            <span className="text-5xl font-bold text-primary">
              {patient.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="flex-grow pt-2">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900">
            {patient.name}
          </h1>
          {patient.isShadow && (
            <span className="relative inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full text-xs font-bold text-blue-700">
              Local
              <span className="relative group/tip cursor-help">
                <Info size={12} className="text-blue-500" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-slate-900 text-white text-[10px] font-normal normal-case rounded-lg opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-50 text-center leading-relaxed shadow-lg">
                  Este paciente está cadastrado somente para visualização deste
                  médico. Para compartilhar com outros profissionais, o paciente
                  deve baixar o aplicativo Hispora no celular.
                </span>
              </span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-6 mt-4">
          {patient.birthDate && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Nascimento
                </p>
                <p className="font-semibold text-sm">
                  {new Date(patient.birthDate).toLocaleDateString("pt-BR")}
                  {age !== null && ` (${age} anos)`}
                </p>
              </div>
            </div>
          )}

          {patient.gender && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Gênero
                </p>
                <p className="font-semibold text-sm capitalize">
                  {patient.gender}
                </p>
              </div>
            </div>
          )}

          {patient.email && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Email
                </p>
                <p className="font-semibold text-sm">{patient.email}</p>
              </div>
            </div>
          )}

          {patient.phone && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Telefone
                </p>
                <p className="font-semibold text-sm">
                  {formatPhone(patient.phone)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Responsáveis (for dependents) */}
        {(patient as any).isDependent &&
          (patient as any).responsibles?.length > 0 && (
            <div className="flex items-center gap-3 mt-4">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Responsáveis:
              </span>
              <div className="flex gap-2 flex-wrap">
                {(patient as any).responsibles.map(
                  (r: { id: string; name: string }) => (
                    <button
                      key={r.id}
                      onClick={() => navigate(`/patients/${r.id}`)}
                      className="text-sm text-primary font-semibold bg-primary/5 px-3 py-1 rounded-full hover:bg-primary/10 transition-colors cursor-pointer border-none"
                    >
                      {r.name}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
      </div>

      {onEdit && (
        <div className="flex gap-2 self-start pt-2">
          <button
            onClick={onEdit}
            className="p-3 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer border-none"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}

function AppointmentsSection({
  appointments,
  onSelect,
}: {
  appointments: PatientFromAPI["appointments"];
  onSelect: (apt: Appointment) => void;
}) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="font-medium">Nenhuma consulta registrada</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {appointments.map((apt) => {
        const date = new Date(apt.date);
        const day = date.getDate().toString().padStart(2, "0");
        const month = date
          .toLocaleDateString("pt-BR", { month: "short" })
          .toUpperCase()
          .replace(".", "");

        return (
          <div
            key={apt.id}
            onClick={() => onSelect(apt)}
            className={`group bg-white hover:bg-slate-50 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 transition-all duration-300 border border-slate-100 shadow-sm cursor-pointer border-l-4 ${
              apt.status === "completed"
                ? "border-l-green-500"
                : apt.status === "cancelled" || apt.status === "rejected"
                  ? "border-l-red-500"
                  : apt.status === "pending_approval"
                    ? "border-l-amber-500"
                    : "border-l-primary"
            }`}
          >
            <div className="flex flex-col items-center justify-center flex-shrink-0 w-14">
              <span className="text-xl font-black text-primary">{day}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {month}
              </span>
            </div>

            <div className="flex-grow min-w-0">
              <h4 className="font-bold text-lg text-slate-900 truncate">
                {apt.type || "Consulta"}
              </h4>
              <div className="flex gap-4 mt-2 flex-wrap text-xs text-slate-500">
                {apt.doctorName && (
                  <div className="flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {apt.doctorName}
                      {apt.specialty && ` (${apt.specialty})`}
                    </span>
                  </div>
                )}
                {apt.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{apt.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  apt.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : apt.status === "cancelled" || apt.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : apt.status === "pending_approval"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-primary"
                }`}
              >
                {apt.status === "completed"
                  ? "Concluído"
                  : apt.status === "cancelled"
                    ? "Cancelado"
                    : apt.status === "rejected"
                      ? "Recusado"
                      : apt.status === "pending_approval"
                        ? "Aguardando aprovação"
                        : "Agendado"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MedicationsSection({
  medications,
}: {
  medications: PatientFromAPI["medications"];
}) {
  if (!medications || medications.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Activity className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="font-medium">Nenhum medicamento ativo</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {medications.map((med) => (
        <div
          key={med.id}
          className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4 border-l-4 ${
            med.active ? "border-l-green-500" : "border-l-slate-300"
          }`}
        >
          <div
            className={`p-3 rounded-xl flex-shrink-0 ${
              med.active
                ? "bg-blue-50 text-primary"
                : "bg-slate-50 text-slate-400"
            }`}
          >
            <Activity className="w-5 h-5" />
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-bold text-lg text-slate-950 truncate">
                {med.name}
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex-shrink-0 ${
                  med.active
                    ? "text-green-700 bg-green-100"
                    : "text-slate-500 bg-slate-100"
                }`}
              >
                {med.active ? "Ativo" : "Inativo"}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {med.dosage} • {med.frequency}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExamsSection({
  exams,
  patientId: _pid,
  onRefresh,
}: {
  exams: PatientFromAPI["exams"];
  patientId: string;
  onRefresh: () => void;
}) {
  const [openBatch, setOpenBatch] = useState<string | null>(null);
  const [resultModal, setResultModal] = useState<{
    examId: string;
    examName: string;
  } | null>(null);

  if (!exams || exams.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="font-medium">Nenhum exame registrado</p>
      </div>
    );
  }

  // Group exams by batchId
  const groups: {
    key: string;
    description: string;
    date: string;
    exams: typeof exams;
  }[] = [];
  const batchMap = new Map<string, typeof exams>();
  const soloExams: typeof exams = [];

  for (const exam of exams) {
    if (exam.batchId) {
      if (!batchMap.has(exam.batchId)) batchMap.set(exam.batchId, []);
      batchMap.get(exam.batchId)!.push(exam);
    } else {
      soloExams.push(exam);
    }
  }

  batchMap.forEach((batchExams, batchId) => {
    groups.push({
      key: batchId,
      description: batchExams[0].description || "Exames solicitados",
      date: batchExams[0].date,
      exams: batchExams,
    });
  });

  for (const exam of soloExams) {
    groups.push({
      key: exam.id,
      description: exam.description || exam.title,
      date: exam.date,
      exams: [exam],
    });
  }

  const allCompleted = (batchExams: typeof exams) =>
    batchExams.every((e) => e.status === "completed");

  return (
    <>
      <div className="space-y-3">
        {groups.map((group) => {
          const isOpen = openBatch === group.key;
          const completed = allCompleted(group.exams);

          return (
            <div
              key={group.key}
              className={`bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm border-l-4 ${
                completed ? "border-l-green-500" : "border-l-amber-500"
              }`}
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => setOpenBatch(isOpen ? null : group.key)}
                className="w-full p-5 flex items-center justify-between text-left cursor-pointer border-none bg-transparent hover:bg-slate-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-slate-800 truncate">
                    {group.description}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(group.date).toLocaleDateString("pt-BR")} •{" "}
                    {group.exams.length} exame
                    {group.exams.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${completed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {completed ? "Realizado" : "Pendente"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3">
                  {group.exams.map((exam) => (
                    <div
                      key={exam.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700">
                          {exam.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {exam.status === "completed" && exam.completedAt
                            ? `Realizado em ${new Date(exam.completedAt).toLocaleDateString("pt-BR")}`
                            : "Pendente"}
                        </p>
                      </div>
                      {exam.status !== "completed" && (
                        <button
                          type="button"
                          onClick={() =>
                            setResultModal({
                              examId: exam.id,
                              examName: exam.title,
                            })
                          }
                          className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0"
                        >
                          Inserir resultado
                        </button>
                      )}
                      {exam.status === "completed" &&
                        exam.resultFiles &&
                        exam.resultFiles.length > 0 && (
                          <span className="text-[10px] text-green-600 font-medium">
                            {exam.resultFiles.length} arquivo
                            {exam.resultFiles.length > 1 ? "s" : ""}
                          </span>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Result Modal */}
      {resultModal && (
        <ExamResultModal
          examId={resultModal.examId}
          examName={resultModal.examName}
          onClose={() => setResultModal(null)}
          onSaved={() => {
            setResultModal(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}

// --- Exam Result Modal ---

function ExamResultModal({
  examId,
  examName,
  onClose,
  onSaved,
}: {
  examId: string;
  examName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [completedAt, setCompletedAt] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      if (completedAt) formData.append("completedAt", completedAt);
      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append("files", files[i]);
        }
      }
      await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/exams/${examId}/result`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("pocketmed_token")}`,
          },
          body: formData,
        },
      );
      onSaved();
    } catch (err) {
      console.error("Erro ao enviar resultado:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-lg">Inserir Resultado</h3>
          <p className="text-sm text-slate-500 mt-1">{examName}</p>
        </div>
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <DateInput
            label="Data de Realização"
            name="exam-completed-at"
            value={completedAt}
            onChange={setCompletedAt}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Arquivos do Resultado
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFiles(e.target.files)}
              className="w-full px-4 py-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-sm cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary"
            />
          </div>
          <FormActions
            onCancel={onClose}
            submitLabel="Salvar Resultado"
            loading={saving}
          />
        </form>
      </div>
    </div>
  );
}

// --- Exam Request Form ---

function ExamRequestForm({
  onClose,
  patientName,
  patientId,
  onSaved,
}: {
  onClose: () => void;
  patientName: string;
  patientId: string;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [examNames, setExamNames] = useState<string[]>([""]);
  const [description, setDescription] = useState("");
  const [_file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const examOptions = [...EXAM_CATALOG]
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((name) => ({
      value: name,
      label: name,
    }));

  function handleExamChange(index: number, value: string) {
    const updated = [...examNames];
    updated[index] = value;
    setExamNames(updated);
  }

  function addExam() {
    setExamNames([...examNames, ""]);
  }

  async function handleGeneratePdf() {
    const validExams = examNames.filter((n) => n.trim());
    if (validExams.length === 0) return;

    await generateExamPdf({
      doctor: {
        name: user?.name || "Médico",
        crm: user?.crm || "",
        specialty: user?.specialty,
        rqe: user?.rqe || undefined,
      },
      patient: { name: patientName },
      exams: validExams,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validExams = examNames.filter((n) => n.trim());
    if (validExams.length === 0) return;

    setSaving(true);
    try {
      const batchId = crypto.randomUUID();
      for (const examName of validExams) {
        await api("/exams", {
          method: "POST",
          body: {
            name: examName,
            type: "other",
            description: description || undefined,
            patientId,
            batchId,
            lockedByDoctor: true,
          },
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error("Erro ao criar exames:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="p-8 pt-0 space-y-5" onSubmit={handleSubmit}>
      {examNames.map((name, index) => (
        <SearchableSelect
          key={index}
          label={index === 0 ? "Nome do Exame" : `Exame ${index + 1}`}
          name={`exam-name-${index}`}
          value={name}
          onChange={(val) => handleExamChange(index, val)}
          options={examOptions}
          placeholder="Pesquise ou digite o nome do exame"
          allowFreeText
        />
      ))}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={addExam}
          className="flex items-center gap-1 text-primary text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar outro exame
        </button>
      </div>

      <Textarea
        label="Descrição"
        name="exam-description"
        value={description}
        onChange={setDescription}
        placeholder="Descrição ou observações sobre os exames solicitados"
        rows={2}
      />

      <button
        type="button"
        onClick={handleGeneratePdf}
        className="flex items-center gap-2 text-primary text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0"
      >
        <Download className="w-4 h-4" />
        Gerar PDF do Pedido de Exame
      </button>

      <div className="flex items-center gap-4 py-2">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
          Ou
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <FileInput
        label="Upload da guia em PDF"
        name="exam-file"
        onChange={setFile}
        accept=".pdf"
      />

      <FormActions
        onCancel={onClose}
        submitLabel="Solicitar Exame"
        loading={saving}
      />
    </form>
  );
}

// --- Prescription Form ---

interface MedFormItem {
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate: string;
  instructions: string;
}

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Diário" },
  { value: "twice_daily", label: "2x ao dia" },
  { value: "three_times_daily", label: "3x ao dia" },
  { value: "four_times_daily", label: "4x ao dia" },
  { value: "custom", label: "Personalizado" },
];

function getTimeSlotsCount(frequency: string): number {
  switch (frequency) {
    case "daily":
      return 1;
    case "twice_daily":
      return 2;
    case "three_times_daily":
      return 3;
    case "four_times_daily":
      return 4;
    default:
      return 1;
  }
}

function generateDistributedTimes(count: number): string[] {
  if (count <= 1) return ["08:00"];
  if (count === 2) return ["08:00", "20:00"];
  if (count === 3) return ["08:00", "14:00", "20:00"];
  if (count === 4) return ["08:00", "12:00", "16:00", "20:00"];
  // fallback
  const start = 8;
  const interval = Math.floor(14 / (count - 1));
  return Array.from({ length: count }, (_, i) => {
    const hour = start + i * interval;
    return `${hour.toString().padStart(2, "0")}:00`;
  });
}

function PrescriptionForm({
  onClose,
  patientName,
}: {
  onClose: () => void;
  patientName: string;
}) {
  const { user } = useAuth();
  const [medications, setMedications] = useState<MedFormItem[]>([
    {
      name: "",
      dosage: "",
      frequency: "daily",
      times: ["08:00"],
      startDate: "",
      endDate: "",
      instructions: "",
    },
  ]);

  function updateMed(
    index: number,
    field: keyof MedFormItem,
    value: string | string[],
  ) {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "frequency" && typeof value === "string") {
      const count = getTimeSlotsCount(value);
      updated[index].times = generateDistributedTimes(count);
    }
    setMedications(updated);
  }

  function updateMedTime(medIndex: number, timeIndex: number, value: string) {
    const updated = [...medications];
    const times = [...updated[medIndex].times];
    times[timeIndex] = value;
    updated[medIndex] = { ...updated[medIndex], times };
    setMedications(updated);
  }

  function addMed() {
    setMedications([
      ...medications,
      {
        name: "",
        dosage: "",
        frequency: "daily",
        times: ["08:00"],
        startDate: "",
        endDate: "",
        instructions: "",
      },
    ]);
  }

  async function handleGeneratePdf() {
    const validMeds = medications.filter((m) => m.name.trim());
    if (validMeds.length === 0) return;

    await generatePrescriptionPdf({
      doctor: {
        name: user?.name || "Médico",
        crm: user?.crm || "",
        specialty: user?.specialty,
        rqe: user?.rqe || undefined,
      },
      patient: { name: patientName },
      medications: validMeds.map((m) => ({
        name: m.name,
        presentation: m.dosage || undefined,
        instructions: m.instructions || m.frequency || undefined,
      })),
    });
  }

  return (
    <form
      className="p-8 pt-0 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      {medications.map((med, index) => (
        <div key={index} className="space-y-4">
          {index > 0 && <div className="h-px bg-slate-100" />}
          <TextInput
            label={
              index === 0 ? "Nome do Medicamento" : `Medicamento ${index + 1}`
            }
            name={`med-nome-${index}`}
            value={med.name}
            onChange={(val) => updateMed(index, "name", val)}
            placeholder="Ex: Losartana Potássica"
          />
          <TextInput
            label="Dosagem / Apresentação"
            name={`med-dosagem-${index}`}
            value={med.dosage}
            onChange={(val) => updateMed(index, "dosage", val)}
            placeholder="Ex: 50mg, Comprimido"
          />
          <SelectInput
            label="Frequência"
            name={`med-frequencia-${index}`}
            value={med.frequency}
            onChange={(val) => updateMed(index, "frequency", val)}
            options={FREQUENCY_OPTIONS}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Horários
            </label>
            <div className="flex flex-wrap gap-3">
              {med.times.map((t, tIdx) => (
                <input
                  key={tIdx}
                  type="time"
                  value={t}
                  onChange={(e) => updateMedTime(index, tIdx, e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <DateInput
              label="Data de Início"
              name={`med-start-${index}`}
              value={med.startDate}
              onChange={(val) => updateMed(index, "startDate", val)}
            />
            <DateInput
              label="Data de Fim"
              name={`med-end-${index}`}
              value={med.endDate}
              onChange={(val) => updateMed(index, "endDate", val)}
            />
          </div>
          <Textarea
            label="Posologia / Instruções"
            name={`med-instrucoes-${index}`}
            value={med.instructions}
            onChange={(val) => updateMed(index, "instructions", val)}
            placeholder="Ex: Tomar 1 comprimido ao dia após o café"
            rows={2}
          />
        </div>
      ))}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={addMed}
          className="flex items-center gap-1 text-primary text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar outro medicamento
        </button>
      </div>

      <button
        type="button"
        onClick={handleGeneratePdf}
        className="flex items-center gap-2 text-primary text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0"
      >
        <Download className="w-4 h-4" />
        Gerar PDF da Receita
      </button>

      <FormActions onCancel={onClose} submitLabel="Prescrever" />
    </form>
  );
}

// --- Consulta Form ---

function ConsultaForm({
  onClose,
  patientId,
  onSaved,
}: {
  onClose: () => void;
  patientId: string;
  onSaved: () => void;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [finalizada, setFinalizada] = useState(false);
  const [diagnostico, setDiagnostico] = useState("");
  const [orientações, setorientações] = useState("");
  const [saving, setSaving] = useState(false);
  const [addMedication, setAddMedication] = useState(false);
  const [addExam, setAddExam] = useState(false);
  const [medications, setMedications] = useState<MedFormItem[]>([
    {
      name: "",
      dosage: "",
      frequency: "daily",
      times: ["08:00"],
      startDate: "",
      endDate: "",
      instructions: "",
    },
  ]);
  const [examNames, setExamNames] = useState<string[]>([""]);
  const [submissionErrors, setSubmissionErrors] = useState<string[]>([]);

  const examOptions = [...EXAM_CATALOG]
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((name) => ({
      value: name,
      label: name,
    }));

  function handleMedicationChange(
    index: number,
    field: string,
    value: string | string[],
  ) {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "frequency" && typeof value === "string") {
      const count = getTimeSlotsCount(value);
      updated[index].times = generateDistributedTimes(count);
    }
    setMedications(updated);
  }

  function handleMedTimeChange(
    medIndex: number,
    timeIndex: number,
    value: string,
  ) {
    const updated = [...medications];
    const times = [...updated[medIndex].times];
    times[timeIndex] = value;
    updated[medIndex] = { ...updated[medIndex], times };
    setMedications(updated);
  }

  function handleExamChange(index: number, value: string) {
    const updated = [...examNames];
    updated[index] = value;
    setExamNames(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;

    setSaving(true);
    setSubmissionErrors([]);

    try {
      const dateTime = time ? `${date}T${time}:00` : `${date}T00:00:00`;
      const consultation = await api(`/patients/${patientId}/consultations`, {
        method: "POST",
        body: {
          date: dateTime,
          symptoms: sintomas || undefined,
          diagnosis: finalizada ? diagnostico || undefined : undefined,
          prescription: finalizada ? orientações || undefined : undefined,
          completed: finalizada,
        },
      });

      const appointmentId = consultation.id;
      const errors: string[] = [];

      // Create linked medications
      if (addMedication) {
        for (const med of medications) {
          if (!med.name.trim()) continue;
          try {
            await api(`/patients/${patientId}/medications`, {
              method: "POST",
              body: {
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                startDate: date,
                notes: med.instructions || undefined,
                appointmentId,
              },
            });
          } catch {
            errors.push(`Medicamento "${med.name}"`);
          }
        }
      }

      // Create linked exams
      if (addExam) {
        for (const examName of examNames) {
          if (!examName.trim()) continue;
          try {
            await api(`/exams`, {
              method: "POST",
              body: {
                name: examName,
                type: "other",
                patientId,
                appointmentId,
              },
            });
          } catch {
            errors.push(`Exame "${examName}"`);
          }
        }
      }

      if (errors.length > 0) {
        setSubmissionErrors(errors);
      } else {
        onSaved();
        onClose();
      }
    } catch (err) {
      console.error("Erro ao salvar consulta:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="p-8 pt-0 space-y-5" onSubmit={handleSubmit}>
      {submissionErrors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 relative">
          <button
            type="button"
            onClick={() => setSubmissionErrors([])}
            className="absolute top-3 right-3 text-amber-600 hover:text-amber-800 cursor-pointer border-none bg-transparent p-0"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-sm font-medium text-amber-800 mb-2">
            Consulta salva com sucesso, mas os seguintes itens falharam:
          </p>
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
            {submissionErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <DateInput
          label="Data"
          name="consulta-data"
          value={date}
          onChange={setDate}
        />
        <div className="space-y-1.5">
          <label
            htmlFor="consulta-hora"
            className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
          >
            Hora
          </label>
          <input
            id="consulta-hora"
            name="consulta-hora"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/10 focus:border-primary"
          />
        </div>
      </div>
      <Textarea
        label="Sintomas / Motivo"
        name="consulta-sintomas"
        value={sintomas}
        onChange={setSintomas}
        placeholder="Descreva os sintomas apresentados"
        rows={3}
      />

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={finalizada}
          onChange={(e) => setFinalizada(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30 cursor-pointer accent-primary"
        />
        <span className="text-sm font-medium text-slate-700">
          Consulta finalizada
        </span>
      </label>

      {finalizada && (
        <>
          <Textarea
            label="Diagnóstico"
            name="consulta-diagnostico"
            value={diagnostico}
            onChange={setDiagnostico}
            placeholder="Diagnóstico principal"
            rows={3}
          />
          <Textarea
            label="Orientações"
            name="consulta-orientações"
            value={orientações}
            onChange={setorientações}
            placeholder="Orientações e recomendações ao paciente"
            rows={3}
          />

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={addMedication}
              onChange={(e) => {
                setAddMedication(e.target.checked);
                if (!e.target.checked) {
                  setMedications([
                    {
                      name: "",
                      dosage: "",
                      frequency: "daily",
                      times: ["08:00"],
                      startDate: "",
                      endDate: "",
                      instructions: "",
                    },
                  ]);
                }
              }}
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30 cursor-pointer accent-primary"
            />
            <span className="text-sm font-medium text-slate-700">
              Adicionar medicamento
            </span>
          </label>

          {addMedication && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              {medications.map((med, index) => (
                <div key={index} className="space-y-3">
                  {index > 0 && <div className="h-px bg-slate-200" />}
                  <TextInput
                    label="Nome do Medicamento"
                    name={`med-name-${index}`}
                    value={med.name}
                    onChange={(val) =>
                      handleMedicationChange(index, "name", val)
                    }
                    placeholder="Ex: Losartana 50mg"
                  />
                  <TextInput
                    label="Dosagem"
                    name={`med-dosage-${index}`}
                    value={med.dosage}
                    onChange={(val) =>
                      handleMedicationChange(index, "dosage", val)
                    }
                    placeholder="Ex: 50mg"
                  />
                  <SelectInput
                    label="Frequência"
                    name={`med-frequency-${index}`}
                    value={med.frequency}
                    onChange={(val) =>
                      handleMedicationChange(index, "frequency", val)
                    }
                    options={FREQUENCY_OPTIONS}
                  />
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                      Horários
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {med.times.map((t, tIdx) => (
                        <input
                          key={tIdx}
                          type="time"
                          value={t}
                          onChange={(e) =>
                            handleMedTimeChange(index, tIdx, e.target.value)
                          }
                          className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <DateInput
                      label="Data de Início"
                      name={`med-start-${index}`}
                      value={med.startDate}
                      onChange={(val) =>
                        handleMedicationChange(index, "startDate", val)
                      }
                    />
                    <DateInput
                      label="Data de Fim"
                      name={`med-end-${index}`}
                      value={med.endDate}
                      onChange={(val) =>
                        handleMedicationChange(index, "endDate", val)
                      }
                    />
                  </div>
                  <Textarea
                    label="Instruções"
                    name={`med-instructions-${index}`}
                    value={med.instructions}
                    onChange={(val) =>
                      handleMedicationChange(index, "instructions", val)
                    }
                    placeholder="Instruções de uso"
                    rows={2}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setMedications([
                    ...medications,
                    {
                      name: "",
                      dosage: "",
                      frequency: "daily",
                      times: ["08:00"],
                      startDate: "",
                      endDate: "",
                      instructions: "",
                    },
                  ])
                }
                className="flex items-center gap-1 text-primary text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar outro medicamento
              </button>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={addExam}
              onChange={(e) => {
                setAddExam(e.target.checked);
                if (!e.target.checked) {
                  setExamNames([""]);
                }
              }}
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30 cursor-pointer accent-primary"
            />
            <span className="text-sm font-medium text-slate-700">
              Adicionar exame
            </span>
          </label>

          {addExam && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              {examNames.map((name, index) => (
                <SearchableSelect
                  key={index}
                  label={index === 0 ? "Nome do Exame" : `Exame ${index + 1}`}
                  name={`consulta-exam-${index}`}
                  value={name}
                  onChange={(val) => handleExamChange(index, val)}
                  options={examOptions}
                  placeholder="Pesquise ou digite o nome do exame"
                  allowFreeText
                />
              ))}
              <button
                type="button"
                onClick={() => setExamNames([...examNames, ""])}
                className="flex items-center gap-1 text-primary text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar outro exame
              </button>
            </div>
          )}
        </>
      )}

      <FormActions
        onCancel={onClose}
        submitLabel="Salvar Consulta"
        loading={saving}
        loadingLabel="Salvando..."
      />
    </form>
  );
}

// --- Edit Consulta Form ---

function EditConsultaForm({
  consultation,
  patientId,
  onClose,
  onSaved,
}: {
  consultation: Appointment;
  patientId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const dateObj = new Date(consultation.date);
  const [date, setDate] = useState(dateObj.toISOString().split("T")[0]);
  const [time, setTime] = useState(dateObj.toTimeString().slice(0, 5));
  const [sintomas, setSintomas] = useState(consultation.type || "");
  const [finalizada, setFinalizada] = useState(
    consultation.status === "completed",
  );
  const [diagnostico, setDiagnostico] = useState(consultation.notes || "");
  const [orientações, setorientações] = useState(
    consultation.instructions || "",
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const dateTime = time ? `${date}T${time}:00` : `${date}T00:00:00`;
      await api(`/patients/${patientId}/consultations/${consultation.id}`, {
        method: "PUT",
        body: {
          date: dateTime,
          symptoms: sintomas || undefined,
          diagnosis: finalizada ? diagnostico || undefined : undefined,
          prescription: finalizada ? orientações || undefined : undefined,
          completed: finalizada,
        },
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Erro ao atualizar consulta:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="p-8 pt-0 space-y-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-6">
        <DateInput
          label="Data"
          name="edit-consulta-data"
          value={date}
          onChange={setDate}
        />
        <div className="space-y-1.5">
          <label
            htmlFor="edit-consulta-hora"
            className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"
          >
            Hora
          </label>
          <input
            id="edit-consulta-hora"
            name="edit-consulta-hora"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/10 focus:border-primary"
          />
        </div>
      </div>
      <Textarea
        label="Sintomas / Motivo"
        name="edit-consulta-sintomas"
        value={sintomas}
        onChange={setSintomas}
        placeholder="Descreva os sintomas apresentados"
        rows={3}
      />

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={finalizada}
          onChange={(e) => setFinalizada(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/30 cursor-pointer accent-primary"
        />
        <span className="text-sm font-medium text-slate-700">
          Consulta finalizada
        </span>
      </label>

      {finalizada && (
        <>
          <Textarea
            label="Diagnóstico"
            name="edit-consulta-diagnostico"
            value={diagnostico}
            onChange={setDiagnostico}
            placeholder="Diagnóstico principal"
            rows={3}
          />
          <Textarea
            label="Orientações"
            name="edit-consulta-orientações"
            value={orientações}
            onChange={setorientações}
            placeholder="Orientações e recomendações ao paciente"
            rows={3}
          />
        </>
      )}

      <FormActions
        onCancel={onClose}
        submitLabel="Salvar Alterações"
        loading={saving}
        loadingLabel="Salvando..."
      />
    </form>
  );
}

// --- View Consulta Detail ---

function ConsultaDetailView({
  consultation,
  patientId,
  onClose,
  onSaved,
}: {
  consultation: Appointment;
  patientId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const isOwner = user?.userId === consultation.doctorId;
  const isRejected = consultation.status === "rejected";
  const dateObj = new Date(consultation.date);
  const formattedDate = dateObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  async function handleResend() {
    setResending(true);
    try {
      await api(
        `/patients/${patientId}/consultations/${consultation.id}/resend`,
        {
          method: "POST",
        },
      );
      setCooldown(120);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      onSaved();
    } catch (err) {
      console.error("Erro ao reenviar consulta:", err);
    } finally {
      setResending(false);
    }
  }

  if (editing) {
    return (
      <EditConsultaForm
        consultation={consultation}
        patientId={patientId}
        onClose={() => setEditing(false)}
        onSaved={onSaved}
      />
    );
  }

  return (
    <div className="p-8 pt-0 space-y-6">
      {/* Doctor lock chip */}
      {consultation.lockedByDoctor && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
          <Stethoscope className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-blue-700">
            Registro médico — preenchido pelo profissional de saúde
          </span>
        </div>
      )}

      {/* Info fields */}
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Data
            </p>
            <p className="text-sm font-medium text-slate-800">
              {formattedDate}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Hora
            </p>
            <p className="text-sm font-medium text-slate-800">
              {formattedTime}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Status
          </p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
              consultation.status === "completed"
                ? "bg-green-100 text-green-700"
                : consultation.status === "cancelled" ||
                    consultation.status === "rejected"
                  ? "bg-red-100 text-red-700"
                  : consultation.status === "pending_approval"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-blue-100 text-primary"
            }`}
          >
            {consultation.status === "completed"
              ? "Concluído"
              : consultation.status === "cancelled"
                ? "Cancelado"
                : consultation.status === "rejected"
                  ? "Recusado"
                  : consultation.status === "pending_approval"
                    ? "Aguardando aprovação"
                    : "Agendado"}
          </span>
        </div>

        {consultation.type && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Sintomas / Motivo
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {consultation.type}
            </p>
          </div>
        )}

        {consultation.notes && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Diagnóstico
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {consultation.notes}
            </p>
          </div>
        )}

        {consultation.instructions && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Orientações
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {consultation.instructions}
            </p>
          </div>
        )}
      </div>

      {/* Edit button */}
      {isOwner && (
        <div className="flex justify-end pt-[24px]">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-primary text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0"
          >
            <Edit className="w-3.5 h-3.5" />
            Editar consulta
          </button>
        </div>
      )}

      {/* Resend button for rejected consultations */}
      {isOwner && isRejected && (
        <Button
          type="button"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          variant="primary"
          size="md"
          fullWidth
          className="rounded-full"
        >
          {resending
            ? "Reenviando..."
            : cooldown > 0
              ? `Aguarde ${Math.floor(cooldown / 60)}:${(cooldown % 60).toString().padStart(2, "0")}`
              : "Reenviar Consulta"}
        </Button>
      )}

      {/* Close button */}
      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-slate-100 rounded-full font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border-none"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

// --- Edit Patient Form ---

function EditPatientForm({
  patient,
  onClose,
  onSaved,
}: {
  patient: PatientFromAPI;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(patient.name || "");
  const [email, setEmail] = useState(patient.email || "");
  const [phone, setPhone] = useState(patient.phone || "");
  const [gender, setGender] = useState(patient.gender || "");
  const [birthDate, setBirthDate] = useState(
    patient.birthDate ? patient.birthDate.split("T")[0] : "",
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await api(`/patients/${patient.id}`, {
        method: "PUT",
        body: {
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          gender: gender || undefined,
          birthDate: birthDate || undefined,
        },
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Erro ao atualizar paciente:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="p-8 pt-0 space-y-5" onSubmit={handleSubmit}>
      <TextInput
        label="Nome Completo"
        name="edit-patient-name"
        value={name}
        onChange={setName}
        placeholder="Nome do paciente"
      />
      <TextInput
        label="Email"
        name="edit-patient-email"
        value={email}
        onChange={setEmail}
        placeholder="email@exemplo.com"
        type="email"
      />
      <div className="grid grid-cols-2 gap-6">
        <TextInput
          label="Telefone"
          name="edit-patient-phone"
          value={phone}
          onChange={setPhone}
          placeholder="11999999999"
          type="tel"
        />
        <SelectInput
          label="Gênero"
          name="edit-patient-gender"
          value={gender}
          onChange={setGender}
          placeholder="Selecione"
          options={[
            { value: "female", label: "Feminino" },
            { value: "male", label: "Masculino" },
            { value: "other", label: "Outro" },
          ]}
        />
      </div>
      <DateInput
        label="Data de Nascimento"
        name="edit-patient-birthdate"
        value={birthDate}
        onChange={setBirthDate}
      />
      <FormActions
        onCancel={onClose}
        submitLabel="Salvar"
        loading={saving}
        loadingLabel="Salvando..."
      />
    </form>
  );
}

// --- Diseases Section ---

interface Disease {
  id: string;
  name: string;
  description: string | null;
  observations: string | null;
  status: string;
  diagnosisDate: string | null;
  treatmentStartDate: string | null;
  treatmentEndDate: string | null;
}

const DISEASE_STATUS_OPTIONS = [
  { value: "in_treatment", label: "Em tratamento" },
  { value: "treatment_ended", label: "Tratamento encerrado" },
  { value: "treatment_suspended", label: "Tratamento suspenso" },
  { value: "cured", label: "Curado" },
];

function getDiseaseStatusLabel(status: string): string {
  return (
    DISEASE_STATUS_OPTIONS.find((o) => o.value === status)?.label || status
  );
}

function getDiseaseStatusStyle(status: string): string {
  switch (status) {
    case "cured":
      return "bg-green-100 text-green-700";
    case "in_treatment":
      return "bg-blue-100 text-primary";
    case "treatment_ended":
      return "bg-slate-100 text-slate-600";
    case "treatment_suspended":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function DiseasesSection({
  patientId,
}: {
  patientId: string;
  onRefresh?: () => void;
}) {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingDisease, setViewingDisease] = useState<Disease | null>(null);

  async function loadDiseases() {
    try {
      const data = await api(`/patients/${patientId}/diseases`);
      setDiseases(Array.isArray(data) ? data : []);
    } catch {
      setDiseases([]);
    } finally {
      setLoading(false);
    }
  }

  useState(() => {
    loadDiseases();
  });

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl font-display tracking-tight">
          Condições e Doenças
        </h3>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Adicionar Doença
        </Button>
      </div>

      {diseases.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhuma condição registrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {diseases.map((disease) => (
            <div
              key={disease.id}
              onClick={() => setViewingDisease(disease)}
              className={`group bg-white hover:bg-slate-50 rounded-2xl p-6 flex items-center gap-6 transition-all border border-slate-100 shadow-sm cursor-pointer border-l-4 ${
                disease.status === "resolved"
                  ? "border-l-green-500"
                  : disease.status === "in_treatment"
                    ? "border-l-amber-500"
                    : "border-l-red-500"
              }`}
            >
              <div className="flex-grow min-w-0">
                <h4 className="font-bold text-lg text-slate-900">
                  {disease.name}
                </h4>
                {disease.description && (
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {disease.description}
                  </p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${getDiseaseStatusStyle(disease.status)}`}
              >
                {getDiseaseStatusLabel(disease.status)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        label="Novo Registro"
        title="Adicionar Doença"
        maxWidth="max-w-2xl"
      >
        <DiseaseForm
          patientId={patientId}
          onClose={() => setShowCreateModal(false)}
          onSaved={() => {
            loadDiseases();
            setShowCreateModal(false);
          }}
        />
      </Modal>

      {/* View/Edit Modal */}
      <Modal
        isOpen={!!viewingDisease}
        onClose={() => setViewingDisease(null)}
        label="Condição"
        title="Detalhes da Doença"
        maxWidth="max-w-2xl"
      >
        {viewingDisease && (
          <DiseaseDetailView
            disease={viewingDisease}
            patientId={patientId}
            onClose={() => setViewingDisease(null)}
            onSaved={() => {
              loadDiseases();
              setViewingDisease(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function DiseaseForm({
  patientId,
  onClose,
  onSaved,
  initial,
}: {
  patientId: string;
  onClose: () => void;
  onSaved: () => void;
  initial?: Disease;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [observations, setObservations] = useState(initial?.observations || "");
  const [status, setStatus] = useState(initial?.status || "in_treatment");
  const [diagnosisDate, setDiagnosisDate] = useState(
    initial?.diagnosisDate?.split("T")[0] || "",
  );
  const [treatmentStartDate, setTreatmentStartDate] = useState(
    initial?.treatmentStartDate?.split("T")[0] || "",
  );
  const [treatmentEndDate, setTreatmentEndDate] = useState(
    initial?.treatmentEndDate?.split("T")[0] || "",
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        description: description.trim() || undefined,
        observations: observations.trim() || undefined,
        status,
        diagnosisDate: diagnosisDate || undefined,
        treatmentStartDate: treatmentStartDate || undefined,
        treatmentEndDate: treatmentEndDate || undefined,
      };

      if (initial) {
        await api(`/patients/${patientId}/diseases/${initial.id}`, {
          method: "PUT",
          body,
        });
      } else {
        await api(`/patients/${patientId}/diseases`, { method: "POST", body });
      }
      onSaved();
    } catch (err) {
      console.error("Erro ao salvar doença:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="p-8 pt-0 space-y-5" onSubmit={handleSubmit}>
      <TextInput
        label="Nome da Doença"
        name="disease-name"
        value={name}
        onChange={setName}
        placeholder="Ex: Diabetes Tipo 2"
      />
      <Textarea
        label="Descrição"
        name="disease-description"
        value={description}
        onChange={setDescription}
        placeholder="Descrição da condição"
        rows={2}
      />
      <Textarea
        label="Observação"
        name="disease-observations"
        value={observations}
        onChange={setObservations}
        placeholder="Observações adicionais sobre o tratamento"
        rows={3}
      />
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Status
        </label>
        <CustomSelect
          name="disease-status"
          value={status}
          onChange={setStatus}
          options={DISEASE_STATUS_OPTIONS}
          placeholder="Selecione o status"
        />
      </div>
      <DateInput
        label="Data do Diagnóstico"
        name="disease-diagnosis-date"
        value={diagnosisDate}
        onChange={setDiagnosisDate}
      />
      <div className="grid grid-cols-2 gap-6">
        <DateInput
          label="Início do Tratamento"
          name="disease-start"
          value={treatmentStartDate}
          onChange={setTreatmentStartDate}
        />
        <DateInput
          label="Fim do Tratamento"
          name="disease-end"
          value={treatmentEndDate}
          onChange={setTreatmentEndDate}
        />
      </div>
      <FormActions
        onCancel={onClose}
        submitLabel={initial ? "Salvar Alterações" : "Adicionar"}
        loading={saving}
      />
    </form>
  );
}

function DiseaseDetailView({
  disease,
  patientId,
  onClose,
  onSaved,
}: {
  disease: Disease;
  patientId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <DiseaseForm
        patientId={patientId}
        onClose={() => setEditing(false)}
        onSaved={onSaved}
        initial={disease}
      />
    );
  }

  return (
    <div className="p-8 pt-0 space-y-6">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Status
          </p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getDiseaseStatusStyle(disease.status)}`}
          >
            {getDiseaseStatusLabel(disease.status)}
          </span>
        </div>

        {disease.description && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Descrição
            </p>
            <p className="text-sm text-slate-700">{disease.description}</p>
          </div>
        )}

        {disease.observations && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Observação
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {disease.observations}
            </p>
          </div>
        )}

        {disease.diagnosisDate && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Data do Diagnóstico
            </p>
            <p className="text-sm text-slate-700">
              {new Date(disease.diagnosisDate).toLocaleDateString("pt-BR")}
            </p>
          </div>
        )}

        {disease.treatmentStartDate && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Início do Tratamento
            </p>
            <p className="text-sm text-slate-700">
              {new Date(disease.treatmentStartDate).toLocaleDateString("pt-BR")}
            </p>
          </div>
        )}

        {disease.treatmentEndDate && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Fim do Tratamento
            </p>
            <p className="text-sm text-slate-700">
              {new Date(disease.treatmentEndDate).toLocaleDateString("pt-BR")}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-[24px]">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 text-primary text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0"
        >
          <Edit className="w-3.5 h-3.5" />
          Editar doença
        </button>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-slate-100 rounded-full font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border-none"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

// --- Allergies Section ---

interface Allergy {
  id: string;
  name: string;
  severity: string;
  reaction: string | null;
  notes: string | null;
}

const SEVERITY_OPTIONS = [
  { value: "mild", label: "Leve" },
  { value: "moderate", label: "Moderada" },
  { value: "severe", label: "Grave" },
];

function getSeverityStyle(severity: string): string {
  switch (severity) {
    case "severe":
      return "bg-red-100 text-red-700";
    case "moderate":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-green-100 text-green-700";
  }
}

function getSeverityLabel(severity: string): string {
  return SEVERITY_OPTIONS.find((o) => o.value === severity)?.label || severity;
}

function AllergiesSection({ patientId }: { patientId: string }) {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  async function loadAllergies() {
    try {
      const data = await api(`/patients/${patientId}/allergies`);
      setAllergies(Array.isArray(data) ? data : []);
    } catch {
      setAllergies([]);
    } finally {
      setLoading(false);
    }
  }

  useState(() => {
    loadAllergies();
  });

  if (loading)
    return <div className="text-center py-8 text-slate-400">Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl font-display tracking-tight">
          Alergias
        </h3>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Adicionar Alergia
        </Button>
      </div>

      {allergies.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhuma alergia registrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {allergies.map((allergy) => (
            <div
              key={allergy.id}
              className="bg-white rounded-2xl p-6 flex items-center gap-6 border border-slate-100 shadow-sm"
            >
              <div className="flex-grow min-w-0">
                <h4 className="font-bold text-lg text-slate-900">
                  {allergy.name}
                </h4>
                {allergy.reaction && (
                  <p className="text-xs text-slate-500 mt-1">
                    {allergy.reaction}
                  </p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${getSeverityStyle(allergy.severity)}`}
              >
                {getSeverityLabel(allergy.severity)}
              </span>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        label="Novo Registro"
        title="Adicionar Alergia"
        maxWidth="max-w-2xl"
      >
        <AllergyForm
          patientId={patientId}
          onClose={() => setShowCreateModal(false)}
          onSaved={() => {
            loadAllergies();
            setShowCreateModal(false);
          }}
        />
      </Modal>
    </div>
  );
}

function AllergyForm({
  patientId,
  onClose,
  onSaved,
}: {
  patientId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [reaction, setReaction] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api(`/patients/${patientId}/allergies`, {
        method: "POST",
        body: {
          name: name.trim(),
          severity,
          reaction: reaction.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="p-8 pt-0 space-y-5" onSubmit={handleSubmit}>
      <TextInput
        label="Nome da Alergia"
        name="allergy-name"
        value={name}
        onChange={setName}
        placeholder="Ex: Penicilina, Ácaros"
      />
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Severidade
        </label>
        <CustomSelect
          name="allergy-severity"
          value={severity}
          onChange={setSeverity}
          options={SEVERITY_OPTIONS}
          placeholder="Selecione"
        />
      </div>
      <TextInput
        label="Reação"
        name="allergy-reaction"
        value={reaction}
        onChange={setReaction}
        placeholder="Ex: Urticária, inchaço facial"
      />
      <Textarea
        label="Observações"
        name="allergy-notes"
        value={notes}
        onChange={setNotes}
        placeholder="Notas adicionais"
        rows={2}
      />
      <FormActions
        onCancel={onClose}
        submitLabel="Adicionar"
        loading={saving}
      />
    </form>
  );
}

// --- Vaccines Section ---

interface Vaccine {
  id: string;
  name: string;
  dose: string | null;
  applicationDate: string | null;
  nextDoseDate: string | null;
  laboratory: string | null;
  notes: string | null;
}

// --- Dependents Section ---

interface DependentItem {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  profileImage: string | null;
  responsibles: { id: string; name: string }[];
}

function DependentsSection({
  patientId,
  onSelectDependent,
}: {
  patientId: string;
  onSelectDependent: (id: string) => void;
}) {
  const [dependents, setDependents] = useState<DependentItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDependents() {
    try {
      const data = await api(`/patients/${patientId}/dependents`);
      setDependents(Array.isArray(data) ? data : []);
    } catch {
      setDependents([]);
    } finally {
      setLoading(false);
    }
  }

  useState(() => {
    loadDependents();
  });

  if (loading)
    return <div className="text-center py-8 text-slate-400">Carregando...</div>;

  function calculateAge(birthDate: string) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl font-display tracking-tight">
          Dependentes
        </h3>
      </div>

      {dependents.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhum dependente cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {dependents.map((dep) => (
            <div
              key={dep.id}
              onClick={() => onSelectDependent(dep.id)}
              className="bg-white rounded-2xl p-6 flex items-center gap-5 border border-slate-100 shadow-sm hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-lg">
                  {dep.name.charAt(0)}
                </span>
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="font-bold text-lg text-slate-900">{dep.name}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {dep.birthDate && `${calculateAge(dep.birthDate)} anos`}
                  {dep.gender &&
                    ` • ${dep.gender === "male" ? "Masculino" : dep.gender === "female" ? "Feminino" : dep.gender}`}
                </p>
                {dep.responsibles.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Responsáveis:
                    </span>
                    <div className="flex gap-1 flex-wrap">
                      {dep.responsibles.map((r) => (
                        <span
                          key={r.id}
                          className="text-xs text-primary font-semibold bg-primary/5 px-2 py-0.5 rounded-full"
                        >
                          {r.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VaccinesSection({ patientId }: { patientId: string }) {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  async function loadVaccines() {
    try {
      const data = await api(`/patients/${patientId}/vaccines`);
      setVaccines(Array.isArray(data) ? data : []);
    } catch {
      setVaccines([]);
    } finally {
      setLoading(false);
    }
  }

  useState(() => {
    loadVaccines();
  });

  if (loading)
    return <div className="text-center py-8 text-slate-400">Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl font-display tracking-tight">
          Vacinas
        </h3>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Adicionar Vacina
        </Button>
      </div>

      {vaccines.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Activity className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhuma vacina registrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {vaccines.map((vaccine) => (
            <div
              key={vaccine.id}
              className="bg-white rounded-2xl p-6 flex items-center gap-6 border border-slate-100 shadow-sm"
            >
              <div className="flex-grow min-w-0">
                <h4 className="font-bold text-lg text-slate-900">
                  {vaccine.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {vaccine.dose && `Dose: ${vaccine.dose}`}
                  {vaccine.applicationDate &&
                    ` • ${new Date(vaccine.applicationDate).toLocaleDateString("pt-BR")}`}
                  {vaccine.laboratory && ` • ${vaccine.laboratory}`}
                </p>
              </div>
              {vaccine.nextDoseDate && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-primary shrink-0">
                  Próx:{" "}
                  {new Date(vaccine.nextDoseDate).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        label="Novo Registro"
        title="Adicionar Vacina"
        maxWidth="max-w-2xl"
      >
        <VaccineForm
          patientId={patientId}
          onClose={() => setShowCreateModal(false)}
          onSaved={() => {
            loadVaccines();
            setShowCreateModal(false);
          }}
        />
      </Modal>
    </div>
  );
}

function VaccineForm({
  patientId,
  onClose,
  onSaved,
}: {
  patientId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [applicationDate, setApplicationDate] = useState("");
  const [nextDoseDate, setNextDoseDate] = useState("");
  const [laboratory, setLaboratory] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api(`/patients/${patientId}/vaccines`, {
        method: "POST",
        body: {
          name: name.trim(),
          dose: dose.trim() || undefined,
          applicationDate: applicationDate || undefined,
          nextDoseDate: nextDoseDate || undefined,
          laboratory: laboratory.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="p-8 pt-0 space-y-5" onSubmit={handleSubmit}>
      <TextInput
        label="Nome da Vacina"
        name="vaccine-name"
        value={name}
        onChange={setName}
        placeholder="Ex: COVID-19 Pfizer, Gripe"
      />
      <TextInput
        label="Dose"
        name="vaccine-dose"
        value={dose}
        onChange={setDose}
        placeholder="Ex: 1ª dose, 2ª dose, reforço"
      />
      <div className="grid grid-cols-2 gap-6">
        <DateInput
          label="Data de Aplicação"
          name="vaccine-app-date"
          value={applicationDate}
          onChange={setApplicationDate}
        />
        <DateInput
          label="Próxima Dose"
          name="vaccine-next-date"
          value={nextDoseDate}
          onChange={setNextDoseDate}
        />
      </div>
      <TextInput
        label="Laboratório"
        name="vaccine-lab"
        value={laboratory}
        onChange={setLaboratory}
        placeholder="Ex: Pfizer, AstraZeneca"
      />
      <Textarea
        label="Observações"
        name="vaccine-notes"
        value={notes}
        onChange={setNotes}
        placeholder="Notas adicionais"
        rows={2}
      />
      <FormActions
        onCancel={onClose}
        submitLabel="Adicionar"
        loading={saving}
      />
    </form>
  );
}

// --- Main Page ---

export default function PatientDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { patient, loading, error, refetch } = usePatientDetail(id);
  const [activeTab, setActiveTab] = useState<
    | "consultas"
    | "medicamentos"
    | "exames"
    | "doencas"
    | "alergias"
    | "vacinas"
    | "dependentes"
  >("consultas");
  const [showConsultaModal, setShowConsultaModal] = useState(false);
  const [showMedicamentoModal, setShowMedicamentoModal] = useState(false);
  const [showDocumentoModal, setShowDocumentoModal] = useState(false);
  const [editingConsulta, setEditingConsulta] = useState<Appointment | null>(
    null,
  );
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const { user } = useAuth();

  const isDependent = (patient as any)?.isDependent === true;
  const responsibles = (patient as any)?.responsibles || [];

  // Reset to consultas tab when navigating to a different patient/dependent
  useEffect(() => {
    setActiveTab("consultas");
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <button
            onClick={() => navigate("/patients")}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent"
          >
            <ArrowLeft size={20} />
            <span>Voltar para Pacientes</span>
          </button>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <span className="ml-4 text-slate-500 font-medium text-lg">
              Carregando dados do paciente...
            </span>
          </div>
          <Skeleton variant="text" count={3} />
        </div>
      </MainLayout>
    );
  }

  // If API returned patient data, render from API
  if (patient && !error) {
    return (
      <MainLayout>
        <div className="space-y-8">
          {/* Back Button */}
          <button
            onClick={() => {
              if (isDependent && responsibles.length > 0) {
                navigate(`/patients/${responsibles[0].id}`);
              } else {
                navigate("/patients");
              }
            }}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent"
          >
            <ArrowLeft size={20} />
            <span>
              {isDependent
                ? "Voltar para responsável"
                : "Voltar para Pacientes"}
            </span>
          </button>

          {/* Patient Hero */}
          <PatientHeroFromAPI
            patient={patient}
            onEdit={
              patient.isShadow && patient.createdByDoctorId === user?.userId
                ? () => setShowEditPatientModal(true)
                : undefined
            }
          />

          {/* Tabs Navigation */}
          <div className="flex space-x-1 p-1 bg-white rounded-2xl w-fit shadow-sm border border-gray-100 mb-8">
            <button
              className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === "consultas"
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("consultas")}
            >
              Consultas
            </button>
            <button
              className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === "medicamentos"
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("medicamentos")}
            >
              Medicamentos
            </button>
            <button
              className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === "exames"
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("exames")}
            >
              Exames & Receitas
            </button>
            <button
              className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === "doencas"
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("doencas")}
            >
              Doenças
            </button>
            <button
              className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === "alergias"
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("alergias")}
            >
              Alergias
            </button>
            <button
              className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === "vacinas"
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("vacinas")}
            >
              Vacinas
            </button>
            <button
              className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === "dependentes"
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("dependentes")}
              style={isDependent ? { display: "none" } : undefined}
            >
              Dependentes
            </button>
          </div>

          {/* Tab Content from API */}
          {activeTab === "consultas" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl font-display tracking-tight">
                  Histórico de Consultas
                </h3>
                <Button
                  data-testid="btn-nova-consulta"
                  onClick={() => setShowConsultaModal(true)}
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Nova Consulta
                </Button>
              </div>
              <AppointmentsSection
                appointments={patient.appointments}
                onSelect={setEditingConsulta}
              />
            </div>
          )}
          {activeTab === "medicamentos" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl font-display tracking-tight">
                  Prescrições Ativas
                </h3>
                <Button
                  onClick={() => setShowMedicamentoModal(true)}
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Adicionar Medicamento
                </Button>
              </div>
              <MedicationsSection medications={patient.medications} />
            </div>
          )}
          {activeTab === "exames" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl font-display tracking-tight">
                  Exames Recentes
                </h3>
                <Button
                  onClick={() => setShowDocumentoModal(true)}
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Solicitar Exame
                </Button>
              </div>
              <ExamsSection
                exams={patient.exams}
                patientId={patient.id}
                onRefresh={refetch}
              />
            </div>
          )}

          <div style={{ display: activeTab === "doencas" ? "block" : "none" }}>
            <DiseasesSection patientId={patient.id} onRefresh={refetch} />
          </div>

          <div style={{ display: activeTab === "alergias" ? "block" : "none" }}>
            <AllergiesSection patientId={patient.id} />
          </div>

          <div style={{ display: activeTab === "vacinas" ? "block" : "none" }}>
            <VaccinesSection patientId={patient.id} />
          </div>

          <div
            style={{ display: activeTab === "dependentes" ? "block" : "none" }}
          >
            <DependentsSection
              patientId={patient.id}
              onSelectDependent={(depId) => navigate(`/patients/${depId}`)}
            />
          </div>

          {/* Modals */}
          <Modal
            isOpen={showConsultaModal}
            onClose={() => setShowConsultaModal(false)}
            label="Novo Registro"
            title="Nova Consulta"
            maxWidth="max-w-2xl"
          >
            <ConsultaForm
              onClose={() => setShowConsultaModal(false)}
              patientId={patient.id}
              onSaved={refetch}
            />
          </Modal>

          <Modal
            isOpen={showMedicamentoModal}
            onClose={() => setShowMedicamentoModal(false)}
            label="Nova Prescrição"
            title="Prescrever Medicamento"
            maxWidth="max-w-2xl"
          >
            <PrescriptionForm
              onClose={() => setShowMedicamentoModal(false)}
              patientName={patient.name}
            />
          </Modal>

          <Modal
            isOpen={showDocumentoModal}
            onClose={() => setShowDocumentoModal(false)}
            label="Novo Agendamento"
            title="Solicitar Exame"
            maxWidth="max-w-2xl"
          >
            <ExamRequestForm
              onClose={() => setShowDocumentoModal(false)}
              patientName={patient.name}
              patientId={patient.id}
              onSaved={refetch}
            />
          </Modal>

          {/* Edit Consultation Modal */}
          <Modal
            isOpen={!!editingConsulta}
            onClose={() => setEditingConsulta(null)}
            label="Consulta"
            title="Detalhes da Consulta"
            maxWidth="max-w-2xl"
          >
            {editingConsulta && (
              <ConsultaDetailView
                consultation={editingConsulta}
                patientId={patient.id}
                onClose={() => setEditingConsulta(null)}
                onSaved={() => {
                  refetch();
                  setEditingConsulta(null);
                }}
              />
            )}
          </Modal>

          {/* Edit Patient Modal */}
          <Modal
            isOpen={showEditPatientModal}
            onClose={() => setShowEditPatientModal(false)}
            label="Editar"
            title="Editar Paciente"
            maxWidth="max-w-2xl"
          >
            <EditPatientForm
              patient={patient}
              onClose={() => setShowEditPatientModal(false)}
              onSaved={refetch}
            />
          </Modal>
        </div>
      </MainLayout>
    );
  }

  // Error state — no mock fallback

  return (
    <MainLayout>
      <div className="space-y-8">
        <button
          onClick={() => navigate("/patients")}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft size={20} />
          <span>Voltar para Pacientes</span>
        </button>

        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Não foi possível carregar os dados do paciente
          </h3>
          <p className="text-slate-500 text-sm max-w-md mb-6">
            {error ||
              "Ocorreu um erro ao buscar as informações. Verifique se você tem permissão para acessar este prontuário."}
          </p>
          <Button onClick={() => refetch()} variant="primary" size="md">
            Tentar novamente
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
