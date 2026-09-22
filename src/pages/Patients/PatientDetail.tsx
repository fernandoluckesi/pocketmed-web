import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
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
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  Info,
  Download,
  X,
  FileCheck,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "../../components/MainLayout";
import { Button } from "../../components/ui/Button";
import { usePatientDetail } from "../../hooks/usePatients";
import type {
  PatientFromAPI,
  Appointment,
  Medication,
  Exam,
} from "../../hooks/usePatients";
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
import { SegmentedToggle } from "../../components/ui/SegmentedToggle";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { financialApi, type Convenio } from "../../services/financial";
import { EXAM_CATALOG } from "../../data/exam-catalog";
import { VACCINE_CATALOG } from "../../data/vaccine-catalog";
import { useAuth } from "../../contexts/AuthContext";
import { useDoctorVerification } from "../../hooks/useDoctorVerification";
import {
  DEMO_PATIENT_ID,
  DEMO_DEPENDENT_ID,
} from "../../mocks/demoPatientApi";
import { generateVaccinePrescriptionPdf } from "../../utils/generate-pdf";
import { api } from "../../services/api";
import { AtestadoForm, type CertificateRecord } from "../Atestados/AtestadoForm";
import { Snackbar } from "../../components/Snackbar";
import {
  canEditRecord,
  isRecordOwner,
  isWithinEditWindow,
  EDIT_EXPIRED_MESSAGE,
} from "../../utils/edit-window";

// --- Types ---

// --- Helpers ---

/**
 * Horizontally-scrollable container for the tabs bar. Hides the native
 * scrollbar and shows a soft fade on whichever edge still has hidden
 * content, so overflow is contained here instead of the whole page.
 */
function TabsScrollArea({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const updateFades = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 4);
    setShowRightFade(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateFades();
    window.addEventListener("resize", updateFades);
    return () => window.removeEventListener("resize", updateFades);
  }, [updateFades]);

  function scrollByStep(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.round(el.clientWidth * 0.6);
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative mb-8">
      <div
        ref={scrollRef}
        onScroll={updateFades}
        className="scrollbar-hide flex space-x-1 p-1 bg-white rounded-2xl max-w-full shadow-sm border border-gray-100 overflow-x-auto"
      >
        {children}
      </div>
      {showLeftFade && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 rounded-l-2xl bg-gradient-to-r from-white to-transparent" />
          <button
            type="button"
            aria-label="Rolar abas para a esquerda"
            onClick={() => scrollByStep("left")}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </>
      )}
      {showRightFade && (
        <>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 rounded-r-2xl bg-gradient-to-l from-white to-transparent" />
          <button
            type="button"
            aria-label="Rolar abas para a direita"
            onClick={() => scrollByStep("right")}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

/** Active insurance plans ("convênios") of the doctor's clinic, for the
 * payment-type select in the consultation form. */
function useActiveConvenios() {
  const [convenios, setConvenios] = useState<Convenio[]>([]);

  useEffect(() => {
    financialApi
      .listConvenios()
      .then((data) =>
        setConvenios(
          (Array.isArray(data) ? data : []).filter((c: Convenio) => c.active),
        ),
      )
      .catch(() => setConvenios([]));
  }, []);

  return convenios;
}

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
  onSelect,
}: {
  medications: PatientFromAPI["medications"];
  onSelect: (med: Medication) => void;
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
          onClick={() => onSelect(med)}
          className={`group bg-white hover:bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4 cursor-pointer transition-all border-l-4 ${
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

const MEDICATION_FREQUENCY_OPTIONS = [
  { value: "once_daily", label: "1x ao dia" },
  { value: "twice_daily", label: "2x ao dia" },
  { value: "three_times_daily", label: "3x ao dia" },
  { value: "four_times_daily", label: "4x ao dia" },
  { value: "every_6_hours", label: "A cada 6 horas" },
  { value: "every_8_hours", label: "A cada 8 horas" },
  { value: "every_12_hours", label: "A cada 12 horas" },
  { value: "as_needed", label: "Se necessário" },
];

function getMedicationFrequencyLabel(value: string): string {
  return (
    MEDICATION_FREQUENCY_OPTIONS.find((opt) => opt.value === value)?.label ||
    value
  );
}

function getMedicationTimeSlots(frequency: string): number {
  switch (frequency) {
    case "once_daily":
      return 1;
    case "twice_daily":
      return 2;
    case "three_times_daily":
      return 3;
    case "four_times_daily":
      return 4;
    case "every_6_hours":
      return 4;
    case "every_8_hours":
      return 3;
    case "every_12_hours":
      return 2;
    case "as_needed":
      return 0;
    default:
      return 1;
  }
}

/** Debounced remote search against the ANVISA-backed medication catalog
 * (GET /medication-catalog), for the "Nome do Medicamento" searchable select. */
function useMedicationCatalogSearch() {
  const [options, setOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!query || query.trim().length < 2) {
      setOptions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await api(
          `/medication-catalog?search=${encodeURIComponent(query.trim())}&limit=50`,
        );
        const items = Array.isArray(data?.data) ? data.data : [];
        const seen = new Set<string>();
        const opts: { value: string; label: string }[] = [];
        for (const item of items) {
          if (!item.product || seen.has(item.product)) continue;
          seen.add(item.product);
          opts.push({
            value: item.product,
            label:
              item.substance && item.substance !== item.product
                ? `${item.product} (${item.substance})`
                : item.product,
          });
        }
        setOptions(opts);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  return { options, loading, search };
}

function MedicationForm({
  onClose,
  onSaved,
  initial,
  variant = "modal",
}: {
  onClose: () => void;
  onSaved: () => void;
  initial: Medication;
  variant?: "modal" | "inline";
}) {
  const [name, setName] = useState(initial.name || "");
  const medicationSearch = useMedicationCatalogSearch();
  const [dosage, setDosage] = useState(initial.dosage || "");
  const [frequency, setFrequency] = useState(initial.frequency || "once_daily");
  const [times, setTimes] = useState<string[]>(
    initial.times && initial.times.length > 0 ? initial.times : [],
  );
  const [startDate, setStartDate] = useState(
    initial.startDate?.split("T")[0] || "",
  );
  const [endDate, setEndDate] = useState(initial.endDate?.split("T")[0] || "");
  const [instructions, setInstructions] = useState(
    initial.instructions || "",
  );
  const [active, setActive] = useState<"true" | "false">(
    initial.active ? "true" : "false",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFrequencyChange(value: string) {
    setFrequency(value);
    const count = getMedicationTimeSlots(value);
    setTimes(count > 0 ? generateDistributedTimes(count) : []);
  }

  function updateTime(index: number, value: string) {
    const updated = [...times];
    updated[index] = value;
    setTimes(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !dosage.trim() || !startDate) return;
    setSaving(true);
    setError(null);
    try {
      await api(`/medications/${initial.id}`, {
        method: "PUT",
        body: {
          name: name.trim(),
          dosage: dosage.trim(),
          frequency,
          times: times.length > 0 ? times : undefined,
          startDate,
          endDate: endDate || undefined,
          instructions: instructions.trim() || undefined,
          isActive: active === "true",
        },
      });
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao salvar medicamento. Tente novamente.",
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
      <SearchableSelect
        label="Nome do Medicamento"
        name="med-name"
        value={name}
        onChange={setName}
        options={medicationSearch.options}
        onSearch={medicationSearch.search}
        loading={medicationSearch.loading}
        placeholder="Pesquise o medicamento (base ANVISA)"
        allowFreeText
      />
      <TextInput
        label="Dosagem / Apresentação"
        name="med-dosage"
        value={dosage}
        onChange={setDosage}
        placeholder="Ex: 50mg, Comprimido"
      />
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Frequência
        </label>
        <CustomSelect
          name="med-frequency"
          value={frequency}
          onChange={handleFrequencyChange}
          options={MEDICATION_FREQUENCY_OPTIONS}
          placeholder="Selecione a frequência"
        />
      </div>
      {times.length > 0 && (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Horários
          </label>
          <div className="flex flex-wrap gap-3">
            {times.map((t, idx) => (
              <input
                key={idx}
                type="time"
                value={t}
                onChange={(e) => updateTime(idx, e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
              />
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-6">
        <DateInput
          label="Data de Início"
          name="med-start"
          value={startDate}
          onChange={setStartDate}
        />
        <DateInput
          label="Data de Fim"
          name="med-end"
          value={endDate}
          onChange={setEndDate}
        />
      </div>
      <Textarea
        label="Posologia / Instruções"
        name="med-instructions"
        value={instructions}
        onChange={setInstructions}
        placeholder="Ex: Tomar 1 comprimido ao dia após o café"
        rows={2}
      />
      <SegmentedToggle
        label="Status"
        value={active}
        onChange={setActive}
        options={[
          { value: "true", label: "Ativo" },
          { value: "false", label: "Inativo" },
        ]}
      />
      <FormActions
        onCancel={onClose}
        loading={saving}
        submitLabel="Salvar Alterações"
      />
    </form>
  );
}

function MedicationDetailView({
  medication,
  onClose,
  onSaved,
}: {
  medication: Medication;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = !!user?.userId && user.userId === medication.doctorId;

  async function handleDelete() {
    if (!window.confirm("Tem certeza que deseja excluir este medicamento?"))
      return;
    setDeleting(true);
    try {
      await api(`/medications/${medication.id}`, { method: "DELETE" });
      onSaved();
    } catch (err) {
      console.error("Erro ao excluir medicamento:", err);
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <MedicationForm
        onClose={() => setEditing(false)}
        onSaved={onSaved}
        initial={medication}
        variant="inline"
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      {medication.lockedByDoctor && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
          <Stethoscope className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-blue-700">
            Registro médico, preenchido pelo profissional de saúde
          </span>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Medicamento
            </p>
            <p className="text-lg font-bold text-slate-900">
              {medication.name}
            </p>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
              medication.active
                ? "text-green-700 bg-green-100"
                : "text-slate-500 bg-slate-100"
            }`}
          >
            {medication.active ? "Ativo" : "Inativo"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Dosagem
            </p>
            <p className="text-sm font-medium text-slate-800">
              {medication.dosage || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Frequência
            </p>
            <p className="text-sm font-medium text-slate-800">
              {medication.frequency
                ? getMedicationFrequencyLabel(medication.frequency)
                : "—"}
            </p>
          </div>
        </div>

        {medication.times && medication.times.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Horários
            </p>
            <p className="text-sm font-medium text-slate-800">
              {medication.times.join(", ")}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Início
            </p>
            <p className="text-sm font-medium text-slate-800">
              {medication.startDate
                ? new Date(medication.startDate).toLocaleDateString("pt-BR")
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Fim
            </p>
            <p className="text-sm font-medium text-slate-800">
              {medication.endDate
                ? new Date(medication.endDate).toLocaleDateString("pt-BR")
                : "—"}
            </p>
          </div>
        </div>

        {medication.instructions && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Posologia / Instruções
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {medication.instructions}
            </p>
          </div>
        )}
      </div>

      {isOwner && (
        <div className="flex items-center justify-between pt-[24px]">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0 disabled:opacity-50 text-red-600"
          >
            <X className="w-3.5 h-3.5" />
            {deleting ? "Excluindo..." : "Excluir medicamento"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0 text-primary"
          >
            <Edit className="w-3.5 h-3.5" />
            Editar medicamento
          </button>
        </div>
      )}

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

function ExamsSection({
  exams,
  patientId: _pid,
  onRefresh,
  onSelect,
}: {
  exams: PatientFromAPI["exams"];
  patientId: string;
  onRefresh: () => void;
  onSelect: (exam: Exam) => void;
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
                      onClick={() => onSelect(exam)}
                      className="flex items-center justify-between py-2 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors px-2 -mx-2"
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setResultModal({
                              examId: exam.id,
                              examName: exam.title,
                            });
                          }}
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

const EXAM_TYPE_OPTIONS = [
  { value: "blood_test", label: "Exame de Sangue" },
  { value: "urine_test", label: "Exame de Urina" },
  { value: "xray", label: "Raio-X" },
  { value: "ct_scan", label: "Tomografia" },
  { value: "mri", label: "Ressonância Magnética" },
  { value: "ultrasound", label: "Ultrassonografia" },
  { value: "ecg", label: "Eletrocardiograma" },
  { value: "endoscopy", label: "Endoscopia" },
  { value: "colonoscopy", label: "Colonoscopia" },
  { value: "biopsy", label: "Biópsia" },
  { value: "other", label: "Outro" },
];

const EXAM_STATUS_OPTIONS = [
  { value: "scheduled", label: "Agendado" },
  { value: "completed", label: "Realizado" },
  { value: "cancelled", label: "Cancelado" },
];

function getExamTypeLabel(value: string): string {
  return EXAM_TYPE_OPTIONS.find((opt) => opt.value === value)?.label || value;
}

function ExamForm({
  onClose,
  onSaved,
  initial,
  variant = "modal",
}: {
  onClose: () => void;
  onSaved: () => void;
  initial: Exam;
  variant?: "modal" | "inline";
}) {
  const [title, setTitle] = useState(initial.title || "");
  const [type, setType] = useState(initial.type || "other");
  const [description, setDescription] = useState(initial.description || "");
  const [date, setDate] = useState(initial.date?.split("T")[0] || "");
  const [status, setStatus] = useState(initial.status || "scheduled");
  const [source, setSource] = useState(initial.source || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await api(`/exams/${initial.id}`, {
        method: "PUT",
        body: {
          name: title.trim(),
          type,
          description: description.trim() || undefined,
          scheduledDate: date || undefined,
          status,
          laboratory: source.trim() || undefined,
        },
      });
      onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao salvar exame. Tente novamente.",
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
      <TextInput
        label="Nome do Exame"
        name="exam-title"
        value={title}
        onChange={setTitle}
        placeholder="Ex: Hemograma Completo"
      />
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
          Tipo
        </label>
        <CustomSelect
          name="exam-type"
          value={type}
          onChange={setType}
          options={EXAM_TYPE_OPTIONS}
          placeholder="Selecione o tipo"
        />
      </div>
      <Textarea
        label="Descrição"
        name="exam-description"
        value={description}
        onChange={setDescription}
        placeholder="Descrição ou observações sobre o exame"
        rows={2}
      />
      <div className="grid grid-cols-2 gap-6">
        <DateInput
          label="Data"
          name="exam-date"
          value={date}
          onChange={setDate}
        />
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Status
          </label>
          <CustomSelect
            name="exam-status"
            value={status}
            onChange={setStatus}
            options={EXAM_STATUS_OPTIONS}
            placeholder="Selecione o status"
          />
        </div>
      </div>
      <TextInput
        label="Laboratório / Origem"
        name="exam-source"
        value={source}
        onChange={setSource}
        placeholder="Ex: Laboratório São Lucas"
      />
      <FormActions
        onCancel={onClose}
        loading={saving}
        submitLabel="Salvar Alterações"
      />
    </form>
  );
}

function ExamDetailView({
  exam,
  onClose,
  onSaved,
}: {
  exam: Exam;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = !!user?.userId && user.userId === exam.doctorId;
  const completed = exam.status === "completed";

  async function handleDelete() {
    if (!window.confirm("Tem certeza que deseja excluir este exame?")) return;
    setDeleting(true);
    try {
      await api(`/exams/${exam.id}`, { method: "DELETE" });
      onSaved();
    } catch (err) {
      console.error("Erro ao excluir exame:", err);
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <ExamForm
        onClose={() => setEditing(false)}
        onSaved={onSaved}
        initial={exam}
        variant="inline"
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Exame
            </p>
            <p className="text-lg font-bold text-slate-900">{exam.title}</p>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
              completed
                ? "text-green-700 bg-green-100"
                : "text-amber-700 bg-amber-100"
            }`}
          >
            {completed ? "Realizado" : "Pendente"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Tipo
            </p>
            <p className="text-sm font-medium text-slate-800">
              {exam.type ? getExamTypeLabel(exam.type) : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Data
            </p>
            <p className="text-sm font-medium text-slate-800">
              {exam.date
                ? new Date(exam.date).toLocaleDateString("pt-BR")
                : "—"}
            </p>
          </div>
        </div>
        {exam.source && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Laboratório / Origem
            </p>
            <p className="text-sm font-medium text-slate-800">
              {exam.source}
            </p>
          </div>
        )}
        {exam.completedAt && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Realizado em
            </p>
            <p className="text-sm font-medium text-slate-800">
              {new Date(exam.completedAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        )}
        {exam.description && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Descrição
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {exam.description}
            </p>
          </div>
        )}
        {exam.resultFiles && exam.resultFiles.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Arquivos de Resultado
            </p>
            <div className="space-y-2">
              {exam.resultFiles.map((file, idx) => (
                <a
                  key={idx}
                  href={file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Arquivo {idx + 1}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {isOwner && (
        <div className="flex items-center justify-between pt-[24px]">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0 disabled:opacity-50 text-red-600"
          >
            <X className="w-3.5 h-3.5" />
            {deleting ? "Excluindo..." : "Excluir exame"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0 text-primary"
          >
            <Edit className="w-3.5 h-3.5" />
            Editar exame
          </button>
        </div>
      )}

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
  patientId,
  onSaved,
  variant = "modal",
}: {
  onClose: () => void;
  patientId: string;
  onSaved: () => void;
  variant?: "modal" | "inline";
}) {
  const [examNames, setExamNames] = useState<string[]>([""]);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [readingAttachment, setReadingAttachment] = useState(false);
  const [readingError, setReadingError] = useState(false);

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

  async function handleAttachFile(file: File | null) {
    if (!file) return;
    setReadingAttachment(true);
    setReadingError(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await api("/exam-catalog/parse-order", {
        method: "POST",
        body: formData,
        isFormData: true,
      });
      const matches: { name: string }[] = Array.isArray(result?.matchedExams)
        ? result.matchedExams
        : [];
      if (matches.length > 0) {
        setExamNames((prev) => {
          const hasContent = prev.some((n) => n.trim());
          const base = hasContent ? prev : [];
          return [...base, ...matches.map((m) => m.name)];
        });
      }
    } catch {
      setReadingError(true);
    } finally {
      setReadingAttachment(false);
    }
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
    <form
      className={
        variant === "inline"
          ? "bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5"
          : "p-8 pt-0 space-y-5"
      }
      onSubmit={handleSubmit}
    >
      <div>
        <FileInput
          label="Anexar pedido de exame (PDF ou imagem)"
          name="exam-file"
          onChange={handleAttachFile}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        {readingAttachment && (
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Lendo anexo...
          </p>
        )}
        {readingError && !readingAttachment && (
          <p className="text-xs text-red-600 mt-2">
            Não foi possível ler o anexo automaticamente. Preencha os campos
            abaixo manualmente.
          </p>
        )}
      </div>

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
  { value: "once_daily", label: "1x ao dia" },
  { value: "twice_daily", label: "2x ao dia" },
  { value: "three_times_daily", label: "3x ao dia" },
  { value: "four_times_daily", label: "4x ao dia" },
  { value: "every_6_hours", label: "A cada 6 horas" },
  { value: "every_8_hours", label: "A cada 8 horas" },
  { value: "every_12_hours", label: "A cada 12 horas" },
  { value: "as_needed", label: "Se necessário" },
];

function getTimeSlotsCount(frequency: string): number {
  switch (frequency) {
    case "once_daily":
      return 1;
    case "twice_daily":
      return 2;
    case "three_times_daily":
      return 3;
    case "four_times_daily":
      return 4;
    case "every_6_hours":
      return 4;
    case "every_8_hours":
      return 3;
    case "every_12_hours":
      return 2;
    case "as_needed":
      return 0;
    default:
      return 1;
  }
}

function generateDistributedTimes(count: number): string[] {
  if (count <= 0) return [];
  if (count === 1) return ["08:00"];
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
  patientId,
  onSaved,
  variant = "modal",
}: {
  onClose: () => void;
  patientId: string;
  onSaved: () => void;
  variant?: "modal" | "inline";
}) {
  const medicationSearch = useMedicationCatalogSearch();
  const [medications, setMedications] = useState<MedFormItem[]>([
    {
      name: "",
      dosage: "",
      frequency: "once_daily",
      times: ["08:00"],
      startDate: "",
      endDate: "",
      instructions: "",
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [submissionErrors, setSubmissionErrors] = useState<string[]>([]);
  const [readingAttachment, setReadingAttachment] = useState(false);
  const [readingError, setReadingError] = useState(false);

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
        frequency: "once_daily",
        times: ["08:00"],
        startDate: "",
        endDate: "",
        instructions: "",
      },
    ]);
  }

  async function handleAttachFile(file: File | null) {
    if (!file) return;
    setReadingAttachment(true);
    setReadingError(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await api("/medication-catalog/parse-order", {
        method: "POST",
        body: formData,
        isFormData: true,
      });
      const matches: { product: string }[] = Array.isArray(
        result?.matchedMedications,
      )
        ? result.matchedMedications
        : [];
      if (matches.length > 0) {
        setMedications((prev) => {
          const hasContent = prev.some((m) => m.name.trim());
          const base = hasContent ? prev : [];
          const newRows: MedFormItem[] = matches.map((m) => ({
            name: m.product,
            dosage: "",
            frequency: "once_daily",
            times: ["08:00"],
            startDate: "",
            endDate: "",
            instructions: "",
          }));
          return [...base, ...newRows];
        });
      }
    } catch {
      setReadingError(true);
    } finally {
      setReadingAttachment(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validMeds = medications.filter(
      (m) => m.name.trim() && m.dosage.trim() && m.startDate,
    );
    if (validMeds.length === 0) return;

    setSaving(true);
    setSubmissionErrors([]);
    const errors: string[] = [];

    for (const med of validMeds) {
      try {
        await api("/medications", {
          method: "POST",
          body: {
            name: med.name.trim(),
            dosage: med.dosage.trim(),
            frequency: med.frequency,
            times: med.times.length > 0 ? med.times : undefined,
            startDate: med.startDate,
            endDate: med.endDate || undefined,
            instructions: med.instructions.trim() || undefined,
            patientId,
          },
        });
      } catch {
        errors.push(`Medicamento "${med.name}"`);
      }
    }

    if (errors.length > 0) {
      setSubmissionErrors(errors);
    } else {
      onSaved();
      onClose();
    }
    setSaving(false);
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
      {submissionErrors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 relative">
          <button
            type="button"
            onClick={() => setSubmissionErrors([])}
            className="absolute top-3 right-3 text-amber-600 hover:text-amber-800 cursor-pointer border-none bg-transparent p-0"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-xs font-semibold text-amber-800 mb-1">
            Não foi possível salvar:
          </p>
          <p className="text-xs text-amber-700">
            {submissionErrors.join(", ")}
          </p>
        </div>
      )}

      <div>
        <FileInput
          label="Anexar receita/pedido (PDF ou imagem)"
          name="prescription-file"
          onChange={handleAttachFile}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        {readingAttachment && (
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Lendo anexo...
          </p>
        )}
        {readingError && !readingAttachment && (
          <p className="text-xs text-red-600 mt-2">
            Não foi possível ler o anexo automaticamente. Preencha os campos
            abaixo manualmente.
          </p>
        )}
      </div>

      {medications.map((med, index) => (
        <div key={index} className="space-y-4">
          {index > 0 && <div className="h-px bg-slate-100" />}
          <SearchableSelect
            label={
              index === 0 ? "Nome do Medicamento" : `Medicamento ${index + 1}`
            }
            name={`med-nome-${index}`}
            value={med.name}
            onChange={(val) => updateMed(index, "name", val)}
            options={medicationSearch.options}
            onSearch={medicationSearch.search}
            loading={medicationSearch.loading}
            placeholder="Pesquise o medicamento (base ANVISA)"
            allowFreeText
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

      <FormActions
        onCancel={onClose}
        submitLabel="Prescrever"
        loading={saving}
      />
    </form>
  );
}

// --- Consulta Form ---

function ConsultaForm({
  onClose,
  patientId,
  onSaved,
  variant = "modal",
}: {
  onClose: () => void;
  patientId: string;
  onSaved: () => void;
  variant?: "modal" | "inline";
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [finalizada, setFinalizada] = useState(false);
  const [diagnostico, setDiagnostico] = useState("");
  const [orientações, setorientações] = useState("");
  const [visitType, setVisitType] = useState<"consulta" | "retorno">(
    "consulta",
  );
  const [paymentType, setPaymentType] = useState<"particular" | "convenio">(
    "particular",
  );
  const [convenioId, setConvenioId] = useState("");
  const convenios = useActiveConvenios();
  const medicationSearch = useMedicationCatalogSearch();
  const [saving, setSaving] = useState(false);
  const [addMedication, setAddMedication] = useState(false);
  const [addExam, setAddExam] = useState(false);
  const [medications, setMedications] = useState<MedFormItem[]>([
    {
      name: "",
      dosage: "",
      frequency: "once_daily",
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
          visitType,
          paymentType,
          convenioId: paymentType === "convenio" ? convenioId : undefined,
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
    <form
      className={
        variant === "inline"
          ? "bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5"
          : "p-8 pt-0 space-y-5"
      }
      onSubmit={handleSubmit}
    >
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

      <div className="grid grid-cols-2 gap-6">
        <SegmentedToggle
          label="Tipo de Visita"
          value={visitType}
          onChange={setVisitType}
          options={[
            { value: "consulta", label: "Consulta" },
            { value: "retorno", label: "Retorno" },
          ]}
        />
        <SegmentedToggle
          label="Forma de Pagamento"
          value={paymentType}
          onChange={(v) => {
            setPaymentType(v);
            if (v === "particular") setConvenioId("");
          }}
          options={[
            { value: "particular", label: "Particular" },
            { value: "convenio", label: "Convênio" },
          ]}
        />
      </div>

      {paymentType === "convenio" && (
        <SearchableSelect
          label="Convênio"
          name="consulta-convenio"
          value={convenioId}
          onChange={setConvenioId}
          options={convenios.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Selecione o convênio"
          allowFreeText={false}
        />
      )}

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
                      frequency: "once_daily",
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
                  <SearchableSelect
                    label="Nome do Medicamento"
                    name={`med-name-${index}`}
                    value={med.name}
                    onChange={(val) =>
                      handleMedicationChange(index, "name", val)
                    }
                    options={medicationSearch.options}
                    onSearch={medicationSearch.search}
                    loading={medicationSearch.loading}
                    placeholder="Pesquise o medicamento (base ANVISA)"
                    allowFreeText
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
                      frequency: "once_daily",
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
  const [visitType, setVisitType] = useState<"consulta" | "retorno">(
    consultation.visitType === "retorno" ? "retorno" : "consulta",
  );
  const [paymentType, setPaymentType] = useState<"particular" | "convenio">(
    consultation.paymentType === "convenio" ? "convenio" : "particular",
  );
  const [convenioId, setConvenioId] = useState(consultation.convenioId || "");
  const convenios = useActiveConvenios();
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
          visitType,
          paymentType,
          convenioId: paymentType === "convenio" ? convenioId : undefined,
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
    <form
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5"
      onSubmit={handleSubmit}
    >
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

      <div className="grid grid-cols-2 gap-6">
        <SegmentedToggle
          label="Tipo de Visita"
          value={visitType}
          onChange={setVisitType}
          options={[
            { value: "consulta", label: "Consulta" },
            { value: "retorno", label: "Retorno" },
          ]}
        />
        <SegmentedToggle
          label="Forma de Pagamento"
          value={paymentType}
          onChange={(v) => {
            setPaymentType(v);
            if (v === "particular") setConvenioId("");
          }}
          options={[
            { value: "particular", label: "Particular" },
            { value: "convenio", label: "Convênio" },
          ]}
        />
      </div>

      {paymentType === "convenio" && (
        <SearchableSelect
          label="Convênio"
          name="edit-consulta-convenio"
          value={convenioId}
          onChange={setConvenioId}
          options={convenios.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Selecione o convênio"
          allowFreeText={false}
        />
      )}

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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      {/* Doctor lock chip */}
      {consultation.lockedByDoctor && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
          <Stethoscope className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-blue-700">
            Registro médico, preenchido pelo profissional de saúde
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

        {(consultation.locationClinicName || consultation.locationStreet) && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Local da Consulta
            </p>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                {consultation.locationClinicName && (
                  <p className="text-sm font-semibold text-slate-800">
                    {consultation.locationClinicName}
                  </p>
                )}
                {consultation.locationStreet && (
                  <p className="text-sm text-slate-600">
                    {consultation.locationStreet}
                    {consultation.locationNumber
                      ? `, ${consultation.locationNumber}`
                      : ""}
                    {consultation.locationNeighborhood
                      ? ` - ${consultation.locationNeighborhood}`
                      : ""}
                  </p>
                )}
                {(consultation.locationCity || consultation.locationState) && (
                  <p className="text-sm text-slate-600">
                    {[consultation.locationCity, consultation.locationState]
                      .filter(Boolean)
                      .join(" - ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

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
          className="rounded-full cursor-pointer"
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
  doctorId: string | null;
  createdAt: string;
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
  const [adding, setAdding] = useState(false);
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

  if (viewingDisease) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setViewingDisease(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent mb-4 p-0"
        >
          <ArrowLeft size={18} />
          <span>Voltar para Doenças</span>
        </button>
        <DiseaseDetailView
          disease={viewingDisease}
          patientId={patientId}
          onClose={() => setViewingDisease(null)}
          onSaved={() => {
            loadDiseases();
            setViewingDisease(null);
          }}
        />
      </div>
    );
  }

  if (adding) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setAdding(false)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent mb-4 p-0"
        >
          <ArrowLeft size={18} />
          <span>Voltar para Doenças</span>
        </button>
        <DiseaseForm
          patientId={patientId}
          onClose={() => setAdding(false)}
          onSaved={() => {
            loadDiseases();
            setAdding(false);
          }}
          variant="inline"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl font-display tracking-tight">
          Condições e Doenças
        </h3>
        <Button
          onClick={() => setAdding(true)}
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5 cursor-pointer" />}
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
    </div>
  );
}

function DiseaseForm({
  patientId,
  onClose,
  onSaved,
  initial,
  variant = "modal",
}: {
  patientId: string;
  onClose: () => void;
  onSaved: () => void;
  initial?: Disease;
  variant?: "modal" | "inline";
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
    <form
      className={
        variant === "inline"
          ? "bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5"
          : "p-8 pt-0 space-y-5"
      }
      onSubmit={handleSubmit}
    >
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
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showExpired, setShowExpired] = useState(false);

  const isOwner = isRecordOwner(disease, user?.userId);
  const canEdit = canEditRecord(disease, user?.userId);

  function handleEditClick() {
    if (isOwner && !isWithinEditWindow(disease)) {
      setShowExpired(true);
      return;
    }
    setEditing(true);
  }

  if (editing) {
    return (
      <DiseaseForm
        patientId={patientId}
        onClose={() => setEditing(false)}
        onSaved={onSaved}
        initial={disease}
        variant="inline"
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
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

      {isOwner && (
        <div className="flex justify-end pt-[24px]">
          <button
            type="button"
            onClick={handleEditClick}
            className={`flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 transition-opacity cursor-pointer border-none bg-transparent p-0 ${
              canEdit
                ? "text-primary hover:opacity-80"
                : "text-slate-400 hover:opacity-80"
            }`}
          >
            <Edit className="w-3.5 h-3.5" />
            Editar doença
          </button>
        </div>
      )}

      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-slate-100 rounded-full font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border-none"
        >
          Fechar
        </button>
      </div>

      <Snackbar
        message={EDIT_EXPIRED_MESSAGE}
        visible={showExpired}
        onClose={() => setShowExpired(false)}
      />
    </div>
  );
}

// --- Surgeries Section ---

interface Surgery {
  id: string;
  name: string;
  status: string;
  date: string | null;
  indication: string | null;
  diagnosisId: string | null;
  bodyRegion: string | null;
  laterality: string | null;
  hospitalOrClinic: string | null;
  surgeonName: string | null;
  surgeonSpecialty: string | null;
  city: string | null;
  state: string | null;
  surgeryType: string | null;
  technique: string | null;
  anesthesia: string | null;
  outcome: string | null;
  hadComplications: boolean | null;
  complications: string | null;
  hospitalAdmission: boolean | null;
  dischargeDate: string | null;
  postoperativeNotes: string | null;
  hasPermanentImplant: boolean | null;
  implantType: string | null;
  implantDescription: string | null;
  implantManufacturer: string | null;
  implantModel: string | null;
  implantSerial: string | null;
  implantLocation: string | null;
  doctorId: string | null;
  createdAt: string;
}

const SURGERY_STATUS_OPTIONS = [
  { value: "PLANNED", label: "Planejada" },
  { value: "PERFORMED", label: "Realizada" },
  { value: "CANCELLED", label: "Cancelada" },
];

const SURGERY_LATERALITY_OPTIONS = [
  { value: "RIGHT", label: "Direita" },
  { value: "LEFT", label: "Esquerda" },
  { value: "BILATERAL", label: "Bilateral" },
  { value: "NOT_APPLICABLE", label: "Não aplicável" },
];

const SURGERY_TYPE_OPTIONS = [
  { value: "ELECTIVE", label: "Eletiva" },
  { value: "URGENT", label: "Urgência" },
  { value: "EMERGENCY", label: "Emergência" },
];

const SURGERY_TECHNIQUE_OPTIONS = [
  { value: "OPEN", label: "Aberta" },
  { value: "LAPAROSCOPIC", label: "Laparoscópica" },
  { value: "ROBOTIC", label: "Robótica" },
  { value: "OTHER", label: "Outra" },
];

const SURGERY_ANESTHESIA_OPTIONS = [
  { value: "GENERAL", label: "Geral" },
  { value: "LOCAL", label: "Local" },
  { value: "REGIONAL", label: "Regional" },
  { value: "SEDATION", label: "Sedação" },
  { value: "OTHER", label: "Outra" },
];

const YES_NO_OPTIONS = [
  { value: "no", label: "Não" },
  { value: "yes", label: "Sim" },
];

function surgeryEnumLabel(
  options: { value: string; label: string }[],
  value: string | null,
): string | null {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label || value;
}

function getSurgeryStatusLabel(status: string): string {
  return (
    SURGERY_STATUS_OPTIONS.find((o) => o.value === status)?.label || status
  );
}

function getSurgeryStatusStyle(status: string): string {
  switch (status) {
    case "PERFORMED":
      return "bg-green-100 text-green-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    case "PLANNED":
    default:
      return "bg-blue-100 text-primary";
  }
}

function getSurgeryBorderStyle(status: string): string {
  switch (status) {
    case "PERFORMED":
      return "border-l-green-500";
    case "CANCELLED":
      return "border-l-red-500";
    case "PLANNED":
    default:
      return "border-l-blue-500";
  }
}

function SurgeriesSection({ patientId }: { patientId: string }) {
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [viewingSurgery, setViewingSurgery] = useState<Surgery | null>(null);

  async function loadSurgeries() {
    try {
      const data = await api(`/patients/${patientId}/surgeries`);
      setSurgeries(Array.isArray(data) ? data : []);
    } catch {
      setSurgeries([]);
    } finally {
      setLoading(false);
    }
  }

  useState(() => {
    loadSurgeries();
  });

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Carregando...</div>;
  }

  if (viewingSurgery) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setViewingSurgery(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent mb-4 p-0"
        >
          <ArrowLeft size={18} />
          <span>Voltar para Cirurgias</span>
        </button>
        <SurgeryDetailView
          surgery={viewingSurgery}
          patientId={patientId}
          onClose={() => setViewingSurgery(null)}
          onSaved={() => {
            loadSurgeries();
            setViewingSurgery(null);
          }}
        />
      </div>
    );
  }

  if (adding) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setAdding(false)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent mb-4 p-0"
        >
          <ArrowLeft size={18} />
          <span>Voltar para Cirurgias</span>
        </button>
        <SurgeryForm
          patientId={patientId}
          onClose={() => setAdding(false)}
          onSaved={() => {
            loadSurgeries();
            setAdding(false);
          }}
          variant="inline"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl font-display tracking-tight">
          Cirurgias
        </h3>
        <Button
          onClick={() => setAdding(true)}
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5 cursor-pointer" />}
        >
          Adicionar Cirurgia
        </Button>
      </div>

      {surgeries.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Activity className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhuma cirurgia registrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {surgeries.map((surgery) => (
            <div
              key={surgery.id}
              onClick={() => setViewingSurgery(surgery)}
              className={`group bg-white hover:bg-slate-50 rounded-2xl p-6 flex items-center gap-6 transition-all border border-slate-100 shadow-sm cursor-pointer border-l-4 ${getSurgeryBorderStyle(
                surgery.status,
              )}`}
            >
              <div className="flex-grow min-w-0">
                <h4 className="font-bold text-lg text-slate-900">
                  {surgery.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 truncate">
                  {[
                    surgery.date
                      ? new Date(surgery.date).toLocaleDateString("pt-BR")
                      : null,
                    surgery.hospitalOrClinic,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Sem data definida"}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${getSurgeryStatusStyle(
                  surgery.status,
                )}`}
              >
                {getSurgeryStatusLabel(surgery.status)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SurgeryForm({
  patientId,
  onClose,
  onSaved,
  initial,
  variant = "modal",
}: {
  patientId: string;
  onClose: () => void;
  onSaved: () => void;
  initial?: Surgery;
  variant?: "modal" | "inline";
}) {
  const [name, setName] = useState(initial?.name || "");
  const [status, setStatus] = useState(initial?.status || "PLANNED");
  const [date, setDate] = useState(initial?.date?.split("T")[0] || "");
  const [indication, setIndication] = useState(initial?.indication || "");
  const [diagnosisId, setDiagnosisId] = useState(initial?.diagnosisId || "");
  const [bodyRegion, setBodyRegion] = useState(initial?.bodyRegion || "");
  const [laterality, setLaterality] = useState(initial?.laterality || "");
  const [hospitalOrClinic, setHospitalOrClinic] = useState(
    initial?.hospitalOrClinic || "",
  );
  const [surgeonName, setSurgeonName] = useState(initial?.surgeonName || "");
  const [surgeonSpecialty, setSurgeonSpecialty] = useState(
    initial?.surgeonSpecialty || "",
  );
  const [city, setCity] = useState(initial?.city || "");
  const [state, setState] = useState(initial?.state || "");
  const [surgeryType, setSurgeryType] = useState(initial?.surgeryType || "");
  const [technique, setTechnique] = useState(initial?.technique || "");
  const [anesthesia, setAnesthesia] = useState(initial?.anesthesia || "");
  const [outcome, setOutcome] = useState(initial?.outcome || "");
  const [hadComplications, setHadComplications] = useState(
    initial?.hadComplications ? "yes" : "no",
  );
  const [complications, setComplications] = useState(
    initial?.complications || "",
  );
  const [hospitalAdmission, setHospitalAdmission] = useState(
    initial?.hospitalAdmission ? "yes" : "no",
  );
  const [dischargeDate, setDischargeDate] = useState(
    initial?.dischargeDate?.split("T")[0] || "",
  );
  const [postoperativeNotes, setPostoperativeNotes] = useState(
    initial?.postoperativeNotes || "",
  );
  const [hasPermanentImplant, setHasPermanentImplant] = useState(
    initial?.hasPermanentImplant ? "yes" : "no",
  );
  const [implantType, setImplantType] = useState(initial?.implantType || "");
  const [implantDescription, setImplantDescription] = useState(
    initial?.implantDescription || "",
  );
  const [implantManufacturer, setImplantManufacturer] = useState(
    initial?.implantManufacturer || "",
  );
  const [implantModel, setImplantModel] = useState(initial?.implantModel || "");
  const [implantSerial, setImplantSerial] = useState(
    initial?.implantSerial || "",
  );
  const [implantLocation, setImplantLocation] = useState(
    initial?.implantLocation || "",
  );
  const [diagnosisOptions, setDiagnosisOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isPerformed = status === "PERFORMED";
  const showImplant = hasPermanentImplant === "yes";

  useState(() => {
    (async () => {
      try {
        const data = await api(`/patients/${patientId}/diseases`);
        const list = Array.isArray(data) ? (data as Disease[]) : [];
        setDiagnosisOptions(list.map((d) => ({ value: d.id, label: d.name })));
      } catch {
        setDiagnosisOptions([]);
      }
    })();
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Informe o nome da cirurgia.");
      return;
    }
    if (isPerformed && date && dischargeDate && dischargeDate < date) {
      setError("A data de alta não pode ser anterior à data da cirurgia.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        status,
        date: date || undefined,
        indication: indication.trim() || undefined,
        diagnosisId: diagnosisId || undefined,
        bodyRegion: bodyRegion.trim() || undefined,
        laterality: laterality || undefined,
        hospitalOrClinic: hospitalOrClinic.trim() || undefined,
        surgeonName: surgeonName.trim() || undefined,
        surgeonSpecialty: surgeonSpecialty.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        surgeryType: surgeryType || undefined,
        technique: technique || undefined,
        anesthesia: anesthesia || undefined,
        outcome: isPerformed ? outcome.trim() || undefined : undefined,
        hadComplications: isPerformed ? hadComplications === "yes" : undefined,
        complications: isPerformed
          ? complications.trim() || undefined
          : undefined,
        hospitalAdmission: isPerformed
          ? hospitalAdmission === "yes"
          : undefined,
        dischargeDate: isPerformed ? dischargeDate || undefined : undefined,
        postoperativeNotes: isPerformed
          ? postoperativeNotes.trim() || undefined
          : undefined,
        hasPermanentImplant: hasPermanentImplant === "yes",
        implantType: showImplant ? implantType.trim() || undefined : undefined,
        implantDescription: showImplant
          ? implantDescription.trim() || undefined
          : undefined,
        implantManufacturer: showImplant
          ? implantManufacturer.trim() || undefined
          : undefined,
        implantModel: showImplant
          ? implantModel.trim() || undefined
          : undefined,
        implantSerial: showImplant
          ? implantSerial.trim() || undefined
          : undefined,
        implantLocation: showImplant
          ? implantLocation.trim() || undefined
          : undefined,
      };

      if (initial) {
        await api(`/patients/${patientId}/surgeries/${initial.id}`, {
          method: "PUT",
          body,
        });
      } else {
        await api(`/patients/${patientId}/surgeries`, {
          method: "POST",
          body,
        });
      }
      onSaved();
    } catch (err) {
      console.error("Erro ao salvar cirurgia:", err);
      setError("Não foi possível salvar a cirurgia. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className={
        variant === "inline"
          ? "bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6"
          : "p-8 pt-0 space-y-6"
      }
      onSubmit={handleSubmit}
    >
      {/* Informações */}
      <div className="space-y-5">
        <p className="text-xs font-bold text-primary uppercase tracking-wider">
          Informações
        </p>
        <TextInput
          label="Nome da Cirurgia"
          name="surgery-name"
          value={name}
          onChange={setName}
          placeholder="Ex: Colecistectomia"
        />
        <SelectInput
          label="Status"
          name="surgery-status"
          value={status}
          onChange={setStatus}
          options={SURGERY_STATUS_OPTIONS}
        />
        <DateInput
          label="Data da Cirurgia"
          name="surgery-date"
          value={date}
          onChange={setDate}
        />
        <Textarea
          label="Indicação"
          name="surgery-indication"
          value={indication}
          onChange={setIndication}
          placeholder="Motivo/indicação da cirurgia"
          rows={2}
        />
        {diagnosisOptions.length > 0 && (
          <SelectInput
            label="Diagnóstico Relacionado"
            name="surgery-diagnosis"
            value={diagnosisId}
            onChange={setDiagnosisId}
            options={diagnosisOptions}
            placeholder="Nenhum"
          />
        )}
      </div>

      {/* Local e equipe */}
      <div className="space-y-5">
        <p className="text-xs font-bold text-primary uppercase tracking-wider">
          Local e equipe
        </p>
        <TextInput
          label="Região do Corpo"
          name="surgery-body-region"
          value={bodyRegion}
          onChange={setBodyRegion}
          placeholder="Ex: Abdome"
        />
        <SelectInput
          label="Lateralidade"
          name="surgery-laterality"
          value={laterality}
          onChange={setLaterality}
          options={SURGERY_LATERALITY_OPTIONS}
          placeholder="Não informado"
        />
        <TextInput
          label="Hospital / Clínica"
          name="surgery-hospital"
          value={hospitalOrClinic}
          onChange={setHospitalOrClinic}
          placeholder="Local da cirurgia"
        />
        <div className="grid grid-cols-2 gap-6">
          <TextInput
            label="Cirurgião"
            name="surgery-surgeon"
            value={surgeonName}
            onChange={setSurgeonName}
            placeholder="Nome do cirurgião"
          />
          <TextInput
            label="Especialidade"
            name="surgery-surgeon-specialty"
            value={surgeonSpecialty}
            onChange={setSurgeonSpecialty}
            placeholder="Ex: Cirurgia geral"
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <TextInput
            label="Cidade"
            name="surgery-city"
            value={city}
            onChange={setCity}
          />
          <TextInput
            label="Estado"
            name="surgery-state"
            value={state}
            onChange={setState}
          />
        </div>
      </div>

      {/* Detalhes */}
      <div className="space-y-5">
        <p className="text-xs font-bold text-primary uppercase tracking-wider">
          Detalhes
        </p>
        <SelectInput
          label="Tipo de Cirurgia"
          name="surgery-type"
          value={surgeryType}
          onChange={setSurgeryType}
          options={SURGERY_TYPE_OPTIONS}
          placeholder="Não informado"
        />
        <SelectInput
          label="Técnica"
          name="surgery-technique"
          value={technique}
          onChange={setTechnique}
          options={SURGERY_TECHNIQUE_OPTIONS}
          placeholder="Não informado"
        />
        <SelectInput
          label="Anestesia"
          name="surgery-anesthesia"
          value={anesthesia}
          onChange={setAnesthesia}
          options={SURGERY_ANESTHESIA_OPTIONS}
          placeholder="Não informado"
        />
      </div>

      {/* Pós-operatório (só PERFORMED) */}
      {isPerformed && (
        <div className="space-y-5">
          <p className="text-xs font-bold text-primary uppercase tracking-wider">
            Pós-operatório
          </p>
          <Textarea
            label="Desfecho"
            name="surgery-outcome"
            value={outcome}
            onChange={setOutcome}
            placeholder="Resultado da cirurgia"
            rows={2}
          />
          <SelectInput
            label="Houve Complicações?"
            name="surgery-had-complications"
            value={hadComplications}
            onChange={setHadComplications}
            options={YES_NO_OPTIONS}
          />
          {hadComplications === "yes" && (
            <Textarea
              label="Complicações"
              name="surgery-complications"
              value={complications}
              onChange={setComplications}
              placeholder="Descreva as complicações"
              rows={2}
            />
          )}
          <SelectInput
            label="Houve Internação?"
            name="surgery-hospital-admission"
            value={hospitalAdmission}
            onChange={setHospitalAdmission}
            options={YES_NO_OPTIONS}
          />
          <DateInput
            label="Data de Alta"
            name="surgery-discharge-date"
            value={dischargeDate}
            onChange={setDischargeDate}
          />
          <Textarea
            label="Notas Pós-operatórias"
            name="surgery-postop-notes"
            value={postoperativeNotes}
            onChange={setPostoperativeNotes}
            placeholder="Observações do pós-operatório"
            rows={3}
          />
        </div>
      )}

      {/* Implante */}
      <div className="space-y-5">
        <p className="text-xs font-bold text-primary uppercase tracking-wider">
          Implante
        </p>
        <SelectInput
          label="Possui Implante Permanente?"
          name="surgery-has-implant"
          value={hasPermanentImplant}
          onChange={setHasPermanentImplant}
          options={YES_NO_OPTIONS}
        />
        {showImplant && (
          <>
            <TextInput
              label="Tipo do Implante"
              name="surgery-implant-type"
              value={implantType}
              onChange={setImplantType}
            />
            <Textarea
              label="Descrição do Implante"
              name="surgery-implant-description"
              value={implantDescription}
              onChange={setImplantDescription}
              rows={2}
            />
            <div className="grid grid-cols-2 gap-6">
              <TextInput
                label="Fabricante"
                name="surgery-implant-manufacturer"
                value={implantManufacturer}
                onChange={setImplantManufacturer}
              />
              <TextInput
                label="Modelo"
                name="surgery-implant-model"
                value={implantModel}
                onChange={setImplantModel}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <TextInput
                label="Número de Série"
                name="surgery-implant-serial"
                value={implantSerial}
                onChange={setImplantSerial}
              />
              <TextInput
                label="Localização"
                name="surgery-implant-location"
                value={implantLocation}
                onChange={setImplantLocation}
              />
            </div>
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <FormActions
        onCancel={onClose}
        submitLabel={initial ? "Salvar Alterações" : "Adicionar"}
        loading={saving}
      />
    </form>
  );
}

function SurgeryDetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
    </div>
  );
}

function SurgeryDetailView({
  surgery,
  patientId,
  onClose,
  onSaved,
}: {
  surgery: Surgery;
  patientId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showExpired, setShowExpired] = useState(false);

  const isOwner = isRecordOwner(surgery, user?.userId);
  const canEdit = canEditRecord(surgery, user?.userId);

  function handleEditClick() {
    if (!canEdit) {
      setShowExpired(true);
      return;
    }
    setEditing(true);
  }

  async function handleDelete() {
    if (!canEdit) {
      setShowExpired(true);
      return;
    }
    if (!window.confirm("Tem certeza que deseja excluir esta cirurgia?"))
      return;
    setDeleting(true);
    try {
      await api(`/patients/${patientId}/surgeries/${surgery.id}`, {
        method: "DELETE",
      });
      onSaved();
    } catch (err) {
      console.error("Erro ao excluir cirurgia:", err);
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <SurgeryForm
        patientId={patientId}
        onClose={() => setEditing(false)}
        onSaved={onSaved}
        initial={surgery}
        variant="inline"
      />
    );
  }

  const isPerformed = surgery.status === "PERFORMED";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Status
          </p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getSurgeryStatusStyle(
              surgery.status,
            )}`}
          >
            {getSurgeryStatusLabel(surgery.status)}
          </span>
        </div>

        <SurgeryDetailField
          label="Data da Cirurgia"
          value={
            surgery.date
              ? new Date(surgery.date).toLocaleDateString("pt-BR")
              : null
          }
        />
        <SurgeryDetailField label="Indicação" value={surgery.indication} />
        <SurgeryDetailField
          label="Região do Corpo"
          value={surgery.bodyRegion}
        />
        <SurgeryDetailField
          label="Lateralidade"
          value={surgeryEnumLabel(
            SURGERY_LATERALITY_OPTIONS,
            surgery.laterality,
          )}
        />
        <SurgeryDetailField
          label="Hospital / Clínica"
          value={surgery.hospitalOrClinic}
        />
        <SurgeryDetailField label="Cirurgião" value={surgery.surgeonName} />
        <SurgeryDetailField
          label="Especialidade"
          value={surgery.surgeonSpecialty}
        />
        <SurgeryDetailField
          label="Local"
          value={
            [surgery.city, surgery.state].filter(Boolean).join(" - ") || null
          }
        />
        <SurgeryDetailField
          label="Tipo de Cirurgia"
          value={surgeryEnumLabel(SURGERY_TYPE_OPTIONS, surgery.surgeryType)}
        />
        <SurgeryDetailField
          label="Técnica"
          value={surgeryEnumLabel(SURGERY_TECHNIQUE_OPTIONS, surgery.technique)}
        />
        <SurgeryDetailField
          label="Anestesia"
          value={surgeryEnumLabel(
            SURGERY_ANESTHESIA_OPTIONS,
            surgery.anesthesia,
          )}
        />

        {isPerformed && (
          <>
            <SurgeryDetailField label="Desfecho" value={surgery.outcome} />
            {surgery.hadComplications != null && (
              <SurgeryDetailField
                label="Complicações"
                value={
                  surgery.hadComplications
                    ? surgery.complications || "Sim"
                    : "Não"
                }
              />
            )}
            {surgery.hospitalAdmission != null && (
              <SurgeryDetailField
                label="Internação"
                value={surgery.hospitalAdmission ? "Sim" : "Não"}
              />
            )}
            <SurgeryDetailField
              label="Data de Alta"
              value={
                surgery.dischargeDate
                  ? new Date(surgery.dischargeDate).toLocaleDateString("pt-BR")
                  : null
              }
            />
            <SurgeryDetailField
              label="Notas Pós-operatórias"
              value={surgery.postoperativeNotes}
            />
          </>
        )}

        {surgery.hasPermanentImplant && (
          <>
            <SurgeryDetailField
              label="Tipo do Implante"
              value={surgery.implantType}
            />
            <SurgeryDetailField
              label="Descrição do Implante"
              value={surgery.implantDescription}
            />
            <SurgeryDetailField
              label="Fabricante"
              value={surgery.implantManufacturer}
            />
            <SurgeryDetailField label="Modelo" value={surgery.implantModel} />
            <SurgeryDetailField
              label="Número de Série"
              value={surgery.implantSerial}
            />
            <SurgeryDetailField
              label="Localização do Implante"
              value={surgery.implantLocation}
            />
          </>
        )}
      </div>

      {isOwner && (
        <div className="flex items-center justify-between pt-[24px]">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className={`flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0 disabled:opacity-50 ${
              canEdit ? "text-red-600" : "text-slate-400"
            }`}
          >
            <X className="w-3.5 h-3.5" />
            {deleting ? "Excluindo..." : "Excluir cirurgia"}
          </button>
          <button
            type="button"
            onClick={handleEditClick}
            className={`flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0 ${
              canEdit ? "text-primary" : "text-slate-400"
            }`}
          >
            <Edit className="w-3.5 h-3.5" />
            Editar cirurgia
          </button>
        </div>
      )}

      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-slate-100 rounded-full font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border-none"
        >
          Fechar
        </button>
      </div>

      <Snackbar
        message={EDIT_EXPIRED_MESSAGE}
        visible={showExpired}
        onClose={() => setShowExpired(false)}
      />
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
  doctorId: string | null;
  createdAt: string;
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
  const [adding, setAdding] = useState(false);
  const [viewingAllergy, setViewingAllergy] = useState<Allergy | null>(null);

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

  if (viewingAllergy) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setViewingAllergy(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent mb-4 p-0"
        >
          <ArrowLeft size={18} />
          <span>Voltar para Alergias</span>
        </button>
        <AllergyDetailView
          allergy={viewingAllergy}
          patientId={patientId}
          onClose={() => setViewingAllergy(null)}
          onSaved={() => {
            loadAllergies();
            setViewingAllergy(null);
          }}
        />
      </div>
    );
  }

  if (adding) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setAdding(false)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent mb-4 p-0"
        >
          <ArrowLeft size={18} />
          <span>Voltar para Alergias</span>
        </button>
        <AllergyForm
          patientId={patientId}
          onClose={() => setAdding(false)}
          onSaved={() => {
            loadAllergies();
            setAdding(false);
          }}
          variant="inline"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl font-display tracking-tight">
          Alergias
        </h3>
        <Button
          onClick={() => setAdding(true)}
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5 cursor-pointer" />}
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
              onClick={() => setViewingAllergy(allergy)}
              className="group bg-white hover:bg-slate-50 rounded-2xl p-6 flex items-center gap-6 border border-slate-100 shadow-sm cursor-pointer transition-all"
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
    </div>
  );
}

function AllergyForm({
  patientId,
  onClose,
  onSaved,
  initial,
  variant = "modal",
}: {
  patientId: string;
  onClose: () => void;
  onSaved: () => void;
  initial?: Allergy;
  variant?: "modal" | "inline";
}) {
  const [name, setName] = useState(initial?.name || "");
  const [severity, setSeverity] = useState(initial?.severity || "moderate");
  const [reaction, setReaction] = useState(initial?.reaction || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        severity,
        reaction: reaction.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      if (initial) {
        await api(`/patients/${patientId}/allergies/${initial.id}`, {
          method: "PUT",
          body,
        });
      } else {
        await api(`/patients/${patientId}/allergies`, {
          method: "POST",
          body,
        });
      }
      onSaved();
    } catch (err) {
      console.error(err);
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
        submitLabel={initial ? "Salvar Alterações" : "Adicionar"}
        loading={saving}
      />
    </form>
  );
}

function AllergyDetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
    </div>
  );
}

function AllergyDetailView({
  allergy,
  patientId,
  onClose,
  onSaved,
}: {
  allergy: Allergy;
  patientId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showExpired, setShowExpired] = useState(false);

  const isOwner = isRecordOwner(allergy, user?.userId);
  const canEdit = canEditRecord(allergy, user?.userId);

  function handleEditClick() {
    if (!canEdit) {
      setShowExpired(true);
      return;
    }
    setEditing(true);
  }

  if (editing) {
    return (
      <AllergyForm
        patientId={patientId}
        onClose={() => setEditing(false)}
        onSaved={onSaved}
        initial={allergy}
        variant="inline"
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Severidade
          </p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getSeverityStyle(
              allergy.severity,
            )}`}
          >
            {getSeverityLabel(allergy.severity)}
          </span>
        </div>
        <AllergyDetailField label="Reação" value={allergy.reaction} />
        <AllergyDetailField label="Observações" value={allergy.notes} />
      </div>

      {isOwner && (
        <div className="flex justify-end pt-[24px]">
          <button
            type="button"
            onClick={handleEditClick}
            className={`flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0 ${
              canEdit ? "text-primary" : "text-slate-400"
            }`}
          >
            <Edit className="w-3.5 h-3.5" />
            Editar alergia
          </button>
        </div>
      )}

      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-slate-100 rounded-full font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border-none"
        >
          Fechar
        </button>
      </div>

      <Snackbar
        message={EDIT_EXPIRED_MESSAGE}
        visible={showExpired}
        onClose={() => setShowExpired(false)}
      />
    </div>
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
  doctorId: string | null;
  createdAt: string;
}

// --- Certificates ("Atestados") Section ---

function AtestadoDetailView({
  certificate,
  onClose,
  onEdit,
}: {
  certificate: CertificateRecord;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            CRM do Médico
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {certificate.crm}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            CID
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {certificate.cid || "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Dias de Afastamento
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {certificate.daysOff != null ? `${certificate.daysOff} dia(s)` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Data do Atestado
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {certificate.issueDate
              ? new Date(certificate.issueDate).toLocaleDateString("pt-BR")
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Descrição
          </p>
          <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap">
            {certificate.description || "—"}
          </p>
        </div>
        {certificate.fileUrl && (
          <a
            href={certificate.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline underline-offset-2"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar anexo
          </a>
        )}
      </div>

      <div className="flex justify-end pt-[24px]">
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0 text-primary"
        >
          <Edit className="w-3.5 h-3.5" />
          Editar atestado
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

function AtestadosSection({ patientId }: { patientId: string }) {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [viewing, setViewing] = useState<CertificateRecord | null>(null);
  const [editing, setEditing] = useState(false);

  async function loadCertificates() {
    try {
      const data = await api(`/patients/${patientId}/certificates`);
      setCertificates(Array.isArray(data) ? data : []);
    } catch {
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }

  useState(() => {
    loadCertificates();
  });

  if (loading)
    return <div className="text-center py-8 text-slate-400">Carregando...</div>;

  if (viewing) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setViewing(null);
            setEditing(false);
          }}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent mb-4 p-0"
        >
          <ArrowLeft size={18} />
          <span>Voltar para Atestados</span>
        </button>
        {editing ? (
          <AtestadoForm
            patientId={patientId}
            initial={viewing}
            onClose={() => setEditing(false)}
            onSaved={() => {
              loadCertificates();
              setViewing(null);
              setEditing(false);
            }}
            variant="inline"
          />
        ) : (
          <AtestadoDetailView
            certificate={viewing}
            onClose={() => {
              setViewing(null);
              setEditing(false);
            }}
            onEdit={() => setEditing(true)}
          />
        )}
      </div>
    );
  }

  if (adding) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setAdding(false)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent mb-4 p-0"
        >
          <ArrowLeft size={18} />
          <span>Voltar para Atestados</span>
        </button>
        <AtestadoForm
          patientId={patientId}
          onClose={() => setAdding(false)}
          onSaved={() => {
            loadCertificates();
            setAdding(false);
          }}
          variant="inline"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl font-display tracking-tight">
          Atestados
        </h3>
        <Button
          onClick={() => setAdding(true)}
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5 cursor-pointer" />}
        >
          Adicionar Atestado
        </Button>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <FileCheck className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nenhum atestado registrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              onClick={() => setViewing(cert)}
              className="group bg-white hover:bg-slate-50 rounded-2xl p-6 flex items-center gap-6 border border-slate-100 shadow-sm cursor-pointer transition-all"
            >
              <div className="flex-grow min-w-0">
                <h4 className="font-bold text-lg text-slate-900">
                  {cert.cid || "Atestado"}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {cert.issueDate
                    ? new Date(cert.issueDate).toLocaleDateString("pt-BR")
                    : new Date(cert.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              {cert.daysOff != null && (
                <span className="px-3 py-1 rounded-full text-xs font-bold shrink-0 bg-blue-100 text-primary">
                  {cert.daysOff} dia(s)
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
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

const VACCINE_OPTIONS = [...VACCINE_CATALOG]
  .sort((a, b) => a.localeCompare(b, "pt-BR"))
  .map((name) => ({ value: name, label: name }));

function VaccinesSection({
  patientId,
  patientName,
}: {
  patientId: string;
  patientName: string;
}) {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addMode, setAddMode] = useState<"registro" | "receita">("registro");
  const [viewingVaccine, setViewingVaccine] = useState<Vaccine | null>(null);

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

  if (viewingVaccine) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setViewingVaccine(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent mb-4 p-0"
        >
          <ArrowLeft size={18} />
          <span>Voltar para Vacinas</span>
        </button>
        <VaccineDetailView
          vaccine={viewingVaccine}
          patientId={patientId}
          onClose={() => setViewingVaccine(null)}
          onSaved={() => {
            loadVaccines();
            setViewingVaccine(null);
          }}
        />
      </div>
    );
  }

  if (adding) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setAdding(false)}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent mb-4 p-0"
        >
          <ArrowLeft size={18} />
          <span>Voltar para Vacinas</span>
        </button>
        <div className="mb-5">
          <SegmentedToggle
            label="Tipo de Registro"
            value={addMode}
            onChange={setAddMode}
            options={[
              { value: "registro", label: "Vacina Já Tomada" },
              { value: "receita", label: "Receita / Indicação" },
            ]}
          />
        </div>
        {addMode === "registro" ? (
          <VaccineForm
            patientId={patientId}
            onClose={() => setAdding(false)}
            onSaved={() => {
              loadVaccines();
              setAdding(false);
            }}
            variant="inline"
          />
        ) : (
          <VaccinePrescriptionForm
            onClose={() => setAdding(false)}
            patientName={patientName}
            variant="inline"
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-xl font-display tracking-tight">
          Vacinas
        </h3>
        <Button
          onClick={() => setAdding(true)}
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5 cursor-pointer" />}
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
              onClick={() => setViewingVaccine(vaccine)}
              className="group bg-white hover:bg-slate-50 rounded-2xl p-6 flex items-center gap-6 border border-slate-100 shadow-sm cursor-pointer transition-all"
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
    </div>
  );
}

function VaccineForm({
  patientId,
  onClose,
  onSaved,
  initial,
  variant = "modal",
}: {
  patientId: string;
  onClose: () => void;
  onSaved: () => void;
  initial?: Vaccine;
  variant?: "modal" | "inline";
}) {
  const [name, setName] = useState(initial?.name || "");
  const [dose, setDose] = useState(initial?.dose || "");
  const [applicationDate, setApplicationDate] = useState(
    initial?.applicationDate?.split("T")[0] || "",
  );
  const [nextDoseDate, setNextDoseDate] = useState(
    initial?.nextDoseDate?.split("T")[0] || "",
  );
  const [laboratory, setLaboratory] = useState(initial?.laboratory || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        dose: dose.trim() || undefined,
        applicationDate: applicationDate || undefined,
        nextDoseDate: nextDoseDate || undefined,
        laboratory: laboratory.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      if (initial) {
        await api(`/patients/${patientId}/vaccines/${initial.id}`, {
          method: "PUT",
          body,
        });
      } else {
        await api(`/patients/${patientId}/vaccines`, {
          method: "POST",
          body,
        });
      }
      onSaved();
    } catch (err) {
      console.error(err);
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
      <SearchableSelect
        label="Nome da Vacina"
        name="vaccine-name"
        value={name}
        onChange={setName}
        options={VACCINE_OPTIONS}
        placeholder="Pesquise ou digite o nome da vacina"
        allowFreeText
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
        submitLabel={initial ? "Salvar Alterações" : "Adicionar"}
        loading={saving}
      />
    </form>
  );
}

interface VaccineFormItem {
  name: string;
  notes: string;
}

function VaccinePrescriptionForm({
  onClose,
  patientName,
  variant = "modal",
}: {
  onClose: () => void;
  patientName: string;
  variant?: "modal" | "inline";
}) {
  const { user } = useAuth();
  const [vaccines, setVaccines] = useState<VaccineFormItem[]>([
    { name: "", notes: "" },
  ]);

  function updateVaccine(
    index: number,
    field: keyof VaccineFormItem,
    value: string,
  ) {
    const updated = [...vaccines];
    updated[index] = { ...updated[index], [field]: value };
    setVaccines(updated);
  }

  function addVaccine() {
    setVaccines([...vaccines, { name: "", notes: "" }]);
  }

  async function handleGeneratePdf() {
    const validVaccines = vaccines.filter((v) => v.name.trim());
    if (validVaccines.length === 0) return;

    await generateVaccinePrescriptionPdf({
      doctor: {
        name: user?.name || "Médico",
        crm: user?.crm || "",
        specialty: user?.specialty,
        rqe: user?.rqe || undefined,
      },
      patient: { name: patientName },
      vaccines: validVaccines.map((v) => ({
        name: v.name,
        notes: v.notes || undefined,
      })),
    });
  }

  return (
    <form
      className={
        variant === "inline"
          ? "bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5"
          : "p-8 pt-0 space-y-5"
      }
      onSubmit={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      {vaccines.map((vaccine, index) => (
        <div key={index} className="space-y-4">
          {index > 0 && <div className="h-px bg-slate-100" />}
          <SearchableSelect
            label={index === 0 ? "Nome da Vacina" : `Vacina ${index + 1}`}
            name={`vaccine-rx-name-${index}`}
            value={vaccine.name}
            onChange={(val) => updateVaccine(index, "name", val)}
            options={VACCINE_OPTIONS}
            placeholder="Pesquise ou digite o nome da vacina"
            allowFreeText
          />
          <TextInput
            label="Observações"
            name={`vaccine-rx-notes-${index}`}
            value={vaccine.notes}
            onChange={(val) => updateVaccine(index, "notes", val)}
            placeholder="Ex: 2ª dose, aplicar em 30 dias"
          />
        </div>
      ))}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={addVaccine}
          className="flex items-center gap-1 text-primary text-xs font-semibold hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar outra vacina
        </button>
      </div>

      <button
        type="button"
        onClick={handleGeneratePdf}
        className="flex items-center gap-2 text-primary text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0"
      >
        <Download className="w-4 h-4" />
        Gerar PDF da Indicação
      </button>

      <FormActions onCancel={onClose} submitLabel="Concluir" />
    </form>
  );
}

function VaccineDetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
    </div>
  );
}

function VaccineDetailView({
  vaccine,
  patientId,
  onClose,
  onSaved,
}: {
  vaccine: Vaccine;
  patientId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showExpired, setShowExpired] = useState(false);

  const isOwner = isRecordOwner(vaccine, user?.userId);
  const canEdit = canEditRecord(vaccine, user?.userId);

  function handleEditClick() {
    if (!canEdit) {
      setShowExpired(true);
      return;
    }
    setEditing(true);
  }

  if (editing) {
    return (
      <VaccineForm
        patientId={patientId}
        onClose={() => setEditing(false)}
        onSaved={onSaved}
        initial={vaccine}
        variant="inline"
      />
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="space-y-5">
        <VaccineDetailField label="Dose" value={vaccine.dose} />
        <VaccineDetailField
          label="Data de Aplicação"
          value={
            vaccine.applicationDate
              ? new Date(vaccine.applicationDate).toLocaleDateString("pt-BR")
              : null
          }
        />
        <VaccineDetailField
          label="Próxima Dose"
          value={
            vaccine.nextDoseDate
              ? new Date(vaccine.nextDoseDate).toLocaleDateString("pt-BR")
              : null
          }
        />
        <VaccineDetailField label="Laboratório" value={vaccine.laboratory} />
        <VaccineDetailField label="Observações" value={vaccine.notes} />
      </div>

      {isOwner && (
        <div className="flex justify-end pt-[24px]">
          <button
            type="button"
            onClick={handleEditClick}
            className={`flex items-center gap-1.5 text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer border-none bg-transparent p-0 ${
              canEdit ? "text-primary" : "text-slate-400"
            }`}
          >
            <Edit className="w-3.5 h-3.5" />
            Editar vacina
          </button>
        </div>
      )}

      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-slate-100 rounded-full font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border-none"
        >
          Fechar
        </button>
      </div>

      <Snackbar
        message={EDIT_EXPIRED_MESSAGE}
        visible={showExpired}
        onClose={() => setShowExpired(false)}
      />
    </div>
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
    | "cirurgias"
    | "atestados"
    | "dependentes"
  >("consultas");
  const [addingConsulta, setAddingConsulta] = useState(false);
  const [addingMedicamento, setAddingMedicamento] = useState(false);
  const [addingExame, setAddingExame] = useState(false);
  const [editingConsulta, setEditingConsulta] = useState<Appointment | null>(
    null,
  );
  const [viewingMedication, setViewingMedication] =
    useState<Medication | null>(null);
  const [viewingExam, setViewingExam] = useState<Exam | null>(null);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const { user } = useAuth();
  const { isApproved, loading: verificationLoading } = useDoctorVerification();

  const isDependent = (patient as any)?.isDependent === true;
  const responsibles = (patient as any)?.responsibles || [];

  // Reset to consultas tab when navigating to a different patient/dependent
  useEffect(() => {
    setActiveTab("consultas");
  }, [id]);

  // Doctors pending verification can only reach the fictitious demo patient
  // and its one example dependent (fully mocked on the front, see
  // src/mocks/demoPatientApi.ts). A direct URL to a real patient bounces
  // back — the backend already rejects the API calls, this just avoids the
  // error screen.
  const isDemoPatient = id === DEMO_PATIENT_ID || id === DEMO_DEPENDENT_ID;
  useEffect(() => {
    if (!verificationLoading && !isApproved && !isDemoPatient) {
      navigate("/patients", { replace: true });
    }
  }, [verificationLoading, isApproved, isDemoPatient, navigate]);

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
          <TabsScrollArea>
            <button
              className={`shrink-0 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === "consultas"
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("consultas")}
            >
              Consultas
            </button>
            <button
              className={`shrink-0 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === "medicamentos"
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("medicamentos")}
            >
              Medicamentos
            </button>
            <button
              className={`shrink-0 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === "exames"
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("exames")}
            >
              Exames
            </button>
            <button
              className={`shrink-0 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === "doencas"
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("doencas")}
            >
              Doenças
            </button>
            <button
              className={`shrink-0 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === "alergias"
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("alergias")}
            >
              Alergias
            </button>
            <button
              className={`shrink-0 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === "vacinas"
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("vacinas")}
            >
              Vacinas
            </button>
            <button
              className={`shrink-0 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === "cirurgias"
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("cirurgias")}
            >
              Cirurgias
            </button>
            <button
              className={`shrink-0 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === "atestados"
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("atestados")}
            >
              Atestados
            </button>
            <button
              className={`shrink-0 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === "dependentes"
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab("dependentes")}
              style={isDependent ? { display: "none" } : undefined}
            >
              Dependentes
            </button>
          </TabsScrollArea>

          {/* Tab Content from API */}
          {activeTab === "consultas" &&
            (editingConsulta ? (
              <div>
                <button
                  type="button"
                  onClick={() => setEditingConsulta(null)}
                  className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent mb-4 p-0"
                >
                  <ArrowLeft size={18} />
                  <span>Voltar para Consultas</span>
                </button>
                <ConsultaDetailView
                  consultation={editingConsulta}
                  patientId={patient.id}
                  onClose={() => setEditingConsulta(null)}
                  onSaved={() => {
                    refetch();
                    setEditingConsulta(null);
                  }}
                />
              </div>
            ) : addingConsulta ? (
              <div>
                <button
                  type="button"
                  onClick={() => setAddingConsulta(false)}
                  className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent mb-4 p-0"
                >
                  <ArrowLeft size={18} />
                  <span>Voltar para Consultas</span>
                </button>
                <ConsultaForm
                  onClose={() => setAddingConsulta(false)}
                  patientId={patient.id}
                  onSaved={() => {
                    refetch();
                    setAddingConsulta(false);
                  }}
                  variant="inline"
                />
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl font-display tracking-tight">
                    Histórico de Consultas
                  </h3>
                  <Button
                    data-testid="btn-nova-consulta"
                    onClick={() => setAddingConsulta(true)}
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5 cursor-pointer" />}
                  >
                    Nova Consulta
                  </Button>
                </div>
                <AppointmentsSection
                  appointments={patient.appointments}
                  onSelect={setEditingConsulta}
                />
              </div>
            ))}
          {activeTab === "medicamentos" &&
            (viewingMedication ? (
              <div>
                <button
                  type="button"
                  onClick={() => setViewingMedication(null)}
                  className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent mb-4 p-0"
                >
                  <ArrowLeft size={18} />
                  <span>Voltar para Medicamentos</span>
                </button>
                <MedicationDetailView
                  medication={viewingMedication}
                  onClose={() => setViewingMedication(null)}
                  onSaved={() => {
                    refetch();
                    setViewingMedication(null);
                  }}
                />
              </div>
            ) : addingMedicamento ? (
              <div>
                <button
                  type="button"
                  onClick={() => setAddingMedicamento(false)}
                  className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent mb-4 p-0"
                >
                  <ArrowLeft size={18} />
                  <span>Voltar para Medicamentos</span>
                </button>
                <PrescriptionForm
                  onClose={() => setAddingMedicamento(false)}
                  patientId={patient.id}
                  onSaved={() => {
                    refetch();
                    setAddingMedicamento(false);
                  }}
                  variant="inline"
                />
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl font-display tracking-tight">
                    Prescrições Ativas
                  </h3>
                  <Button
                    onClick={() => setAddingMedicamento(true)}
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5 cursor-pointer" />}
                  >
                    Adicionar Medicamento
                  </Button>
                </div>
                <MedicationsSection
                  medications={patient.medications}
                  onSelect={setViewingMedication}
                />
              </div>
            ))}
          {activeTab === "exames" &&
            (viewingExam ? (
              <div>
                <button
                  type="button"
                  onClick={() => setViewingExam(null)}
                  className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent mb-4 p-0"
                >
                  <ArrowLeft size={18} />
                  <span>Voltar para Exames</span>
                </button>
                <ExamDetailView
                  exam={viewingExam}
                  onClose={() => setViewingExam(null)}
                  onSaved={() => {
                    refetch();
                    setViewingExam(null);
                  }}
                />
              </div>
            ) : addingExame ? (
              <div>
                <button
                  type="button"
                  onClick={() => setAddingExame(false)}
                  className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent mb-4 p-0"
                >
                  <ArrowLeft size={18} />
                  <span>Voltar para Exames</span>
                </button>
                <ExamRequestForm
                  onClose={() => setAddingExame(false)}
                  patientId={patient.id}
                  onSaved={() => {
                    refetch();
                    setAddingExame(false);
                  }}
                  variant="inline"
                />
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl font-display tracking-tight">
                    Exames Recentes
                  </h3>
                  <Button
                    onClick={() => setAddingExame(true)}
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5 cursor-pointer" />}
                  >
                    Solicitar Exame
                  </Button>
                </div>
                <ExamsSection
                  exams={patient.exams}
                  patientId={patient.id}
                  onRefresh={refetch}
                  onSelect={setViewingExam}
                />
              </div>
            ))}

          <div style={{ display: activeTab === "doencas" ? "block" : "none" }}>
            <DiseasesSection patientId={patient.id} onRefresh={refetch} />
          </div>

          <div style={{ display: activeTab === "alergias" ? "block" : "none" }}>
            <AllergiesSection patientId={patient.id} />
          </div>

          <div style={{ display: activeTab === "vacinas" ? "block" : "none" }}>
            <VaccinesSection patientId={patient.id} patientName={patient.name} />
          </div>

          <div
            style={{ display: activeTab === "cirurgias" ? "block" : "none" }}
          >
            <SurgeriesSection patientId={patient.id} />
          </div>

          <div
            style={{ display: activeTab === "atestados" ? "block" : "none" }}
          >
            <AtestadosSection patientId={patient.id} />
          </div>

          <div
            style={{ display: activeTab === "dependentes" ? "block" : "none" }}
          >
            <DependentsSection
              patientId={patient.id}
              onSelectDependent={(depId) => navigate(`/patients/${depId}`)}
            />
          </div>

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
