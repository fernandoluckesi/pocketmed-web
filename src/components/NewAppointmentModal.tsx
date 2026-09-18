import { useState, useEffect } from "react";
import {
  X,
  ClipboardCheck,
  Search,
  Calendar as CalendarIcon,
  Clock,
  UserPlus,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/Button";
import { SegmentedToggle } from "./ui/SegmentedToggle";
import { SearchableSelect } from "./ui/SearchableSelect";
import { api, ApiError } from "../services/api";
import { financialApi, type Convenio } from "../services/financial";
import { useToast } from "../contexts/ToastContext";
import {
  emptyWeekly,
  generateSlots,
  resolveDayAvailability,
  type Weekly,
  type AvailabilityRule,
  type AvailabilityException,
} from "../utils/availability";

/** Existing appointment rendered by the modal in view/edit mode. */
export interface EditableAppointment {
  id: string;
  /** ISO datetime of the appointment. */
  dateTime: string;
  reason?: string;
  doctorId?: string;
  doctorName?: string;
  patientName?: string;
  patientEmail?: string;
  isCompleted?: boolean;
  visitType?: string;
  paymentType?: string;
  convenioId?: string;
  convenioName?: string;
}

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after an appointment is successfully created or updated. */
  onCreated?: () => void;
  /**
   * When provided, the modal renders the existing appointment instead of a blank
   * form: read-only first, switching to editable fields via the "Editar" action.
   */
  appointment?: EditableAppointment | null;
  /** Called after the appointment is cancelled (deleted). */
  onCancelled?: () => void;
}

interface FoundPatient {
  id: string;
  name: string;
  email: string;
}

interface ClinicDoctor {
  id: string;
  name: string;
  specialty: string;
}

const GENDER_OPTIONS = [
  { value: "Masculino", label: "Masculino" },
  { value: "Feminino", label: "Feminino" },
  { value: "Outro", label: "Outro" },
];

export function NewAppointmentModal({
  isOpen,
  onClose,
  onCreated,
  appointment = null,
  onCancelled,
}: NewAppointmentModalProps) {
  const toast = useToast();

  // Existing appointment → starts read-only; "Editar" unlocks the same fields.
  const isExisting = !!appointment;
  const [editing, setEditing] = useState(false);
  const readOnly = isExisting && !editing;
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Patient search
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<FoundPatient[]>([]);
  const [patient, setPatient] = useState<FoundPatient | null>(null);
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Shadow (pre-registration) form
  const [showShadowForm, setShowShadowForm] = useState(false);
  const [shadowName, setShadowName] = useState("");
  const [shadowEmail, setShadowEmail] = useState("");
  const [shadowGender, setShadowGender] = useState("Masculino");
  const [shadowPhone, setShadowPhone] = useState("");
  const [shadowBirthDate, setShadowBirthDate] = useState("");

  // Appointment fields
  const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [visitType, setVisitType] = useState<"consulta" | "retorno">(
    "consulta",
  );
  const [paymentType, setPaymentType] = useState<"particular" | "convenio">(
    "particular",
  );
  const [convenioId, setConvenioId] = useState("");
  const [convenioName, setConvenioName] = useState("");
  const [convenios, setConvenios] = useState<Convenio[]>([]);

  // Availability (weekly rule + specific-date exceptions)
  const [weekly, setWeekly] = useState<Weekly>(emptyWeekly());
  const [duration, setDuration] = useState(30);
  const [buffer, setBuffer] = useState(0);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Carregar médicos ativos da clínica (admin)
  useEffect(() => {
    if (!isOpen) return;
    async function loadDoctors() {
      try {
        const data = await api("/clinic-admin/doctors");
        setDoctors(
          (Array.isArray(data) ? data : []).map((d: any) => ({
            id: d.id,
            name: d.name,
            specialty: d.specialty || "",
          })),
        );
      } catch {
        setDoctors([]);
      }
    }
    loadDoctors();
  }, [isOpen]);

  // Carregar convênios ativos da clínica (para o select de forma de pagamento)
  useEffect(() => {
    if (!isOpen) return;
    async function loadConvenios() {
      try {
        const data = await financialApi.listConvenios();
        setConvenios(
          (Array.isArray(data) ? data : []).filter((c: Convenio) => c.active),
        );
      } catch {
        setConvenios([]);
      }
    }
    loadConvenios();
  }, [isOpen]);

  // Carregar a configuração de agenda (regra semanal + exceções por data)
  useEffect(() => {
    if (!isOpen) return;
    async function loadAvailability() {
      try {
        const [rules, excs] = await Promise.all([
          api("/availabilityRules") as Promise<AvailabilityRule[]>,
          (
            api("/availabilityExceptions") as Promise<AvailabilityException[]>
          ).catch(() => [] as AvailabilityException[]),
        ]);
        const rule = Array.isArray(rules) && rules.length > 0 ? rules[0] : null;
        if (rule) {
          const normalized = emptyWeekly();
          for (const key of Object.keys(normalized)) {
            const dc = rule.weekly?.[key];
            if (dc) {
              normalized[key] = {
                enabled: !!dc.enabled,
                intervals: Array.isArray(dc.intervals) ? dc.intervals : [],
              };
            }
          }
          setWeekly(normalized);
          setDuration(rule.duration ?? 30);
          setBuffer(rule.buffer ?? 0);
        }
        setExceptions(Array.isArray(excs) ? excs : []);
      } catch {
        // Fallback silencioso: mantém a grade vazia até a data ser escolhida.
      }
    }
    loadAvailability();
  }, [isOpen]);

  // Popula os campos com a consulta existente ao abrir o modal.
  useEffect(() => {
    if (!isOpen) return;

    if (!appointment) {
      setEditing(false);
      setConfirmingCancel(false);
      return;
    }

    const dt = new Date(appointment.dateTime);
    const pad = (n: number) => String(n).padStart(2, "0");

    setEditing(false);
    setConfirmingCancel(false);
    setSelectedDoctor(appointment.doctorId || "");
    setNotes(appointment.reason || "");
    setVisitType(appointment.visitType === "retorno" ? "retorno" : "consulta");
    setPaymentType(
      appointment.paymentType === "convenio" ? "convenio" : "particular",
    );
    setConvenioId(appointment.convenioId || "");
    setConvenioName(appointment.convenioName || "");
    if (!Number.isNaN(dt.getTime())) {
      setDate(
        `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`,
      );
      setSelectedTime(`${pad(dt.getHours())}:${pad(dt.getMinutes())}`);
    }
    setPatient(
      appointment.patientName
        ? {
            id: "",
            name: appointment.patientName,
            email: appointment.patientEmail || "",
          }
        : null,
    );
  }, [isOpen, appointment]);

  // Resolve a disponibilidade e a grade de horários para a data escolhida.
  const dayAvailability = date
    ? resolveDayAvailability(date, weekly, exceptions)
    : null;
  const timeSlots =
    dayAvailability && dayAvailability.open
      ? generateSlots(dayAvailability.intervals, duration, buffer)
      : [];

  /**
   * The appointment's own time may fall outside the current availability grid
   * (rule changed since booking), so it is always offered as a slot to avoid
   * losing it while viewing/editing.
   */
  const displaySlots =
    selectedTime && !timeSlots.includes(selectedTime)
      ? [...timeSlots, selectedTime].sort()
      : timeSlots;

  // Ao trocar a data, limpa o horário se ele não existir mais na nova grade.
  // Em modo leitura o horário da consulta é preservado.
  useEffect(() => {
    if (readOnly) return;
    if (selectedTime && !displaySlots.includes(selectedTime)) {
      setSelectedTime("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, displaySlots.join(","), readOnly]);

  function resetAll() {
    setSearchTerm("");
    setResults([]);
    setPatient(null);
    setSearchError("");
    setHasSearched(false);
    setShowShadowForm(false);
    setShadowName("");
    setShadowEmail("");
    setShadowGender("Masculino");
    setShadowPhone("");
    setShadowBirthDate("");
    setSelectedDoctor("");
    setDate("");
    setSelectedTime("");
    setNotes("");
    setVisitType("consulta");
    setPaymentType("particular");
    setConvenioId("");
    setConvenioName("");
    setSubmitting(false);
    setFormError("");
  }

  function handleClose() {
    resetAll();
    setEditing(false);
    setConfirmingCancel(false);
    setCancelling(false);
    onClose();
  }

  async function handleCancelAppointment() {
    if (!appointment) return;
    setFormError("");
    setCancelling(true);
    try {
      await api(`/appointments/${appointment.id}`, { method: "DELETE" });
      toast.success("Consulta cancelada com sucesso!");
      onCancelled?.();
      handleClose();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.data?.message || "Erro ao cancelar a consulta."
          : "Erro ao cancelar a consulta.";
      setFormError(String(msg));
    } finally {
      setCancelling(false);
    }
  }

  async function handleSearchPatient() {
    const term = searchTerm.trim();
    if (term.length < 3) {
      setSearchError("Digite ao menos 3 caracteres.");
      return;
    }
    setSearching(true);
    setSearchError("");
    setPatient(null);
    setResults([]);
    setHasSearched(true);
    try {
      const data = await api(`/patients/search?q=${encodeURIComponent(term)}`);
      const arr = Array.isArray(data) ? data : [];
      setResults(
        arr.map((p: any) => ({ id: p.id, name: p.name, email: p.email })),
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setSearchError(err.data?.message || "Erro ao buscar paciente.");
      } else {
        setSearchError("Erro ao buscar paciente.");
      }
    } finally {
      setSearching(false);
    }
  }

  function openShadowForm() {
    // Pre-fill the name/email fields if the user typed something useful.
    const term = searchTerm.trim();
    if (term.includes("@")) {
      setShadowEmail(term);
      setShadowName("");
    } else {
      setShadowName(term);
      setShadowEmail("");
    }
    setShowShadowForm(true);
  }

  /**
   * Creates the shadow patient (pre-registration) tied to the selected clinic
   * doctor. The backend grants access to the whole clinic automatically.
   * Returns the created patient id.
   */
  async function createShadowPatient(doctorId: string): Promise<string> {
    const formData = new FormData();
    formData.append("name", shadowName.trim());
    formData.append("email", shadowEmail.trim());
    formData.append("gender", shadowGender);
    formData.append("phone", shadowPhone.trim());
    formData.append("birthDate", shadowBirthDate);
    formData.append("doctorCreatorId", doctorId);

    const res = await api("/auth/register/patient-shadow", {
      method: "POST",
      body: formData,
      isFormData: true,
    });
    return res.user.id as string;
  }

  function buildDateTimeIso(): string | null {
    if (!date || !selectedTime) return null;
    // Build a local datetime and convert to ISO.
    const dt = new Date(`${date}T${selectedTime}:00`);
    if (Number.isNaN(dt.getTime())) return null;
    return dt.toISOString();
  }

  async function handleSubmit() {
    setFormError("");

    if (!selectedDoctor) {
      setFormError("Selecione o médico responsável.");
      return;
    }

    const dateTime = buildDateTimeIso();
    if (!dateTime) {
      setFormError("Selecione a data e o horário da consulta.");
      return;
    }

    if (paymentType === "convenio" && !convenioId) {
      setFormError("Selecione o convênio.");
      return;
    }

    const reason = notes.trim() || "Consulta";

    // Editing an existing appointment: reschedule / reassign / update reason.
    if (appointment) {
      setSubmitting(true);
      try {
        await api(`/appointments/${appointment.id}`, {
          method: "PUT",
          body: {
            dateTime,
            reason,
            doctorId: selectedDoctor,
            visitType,
            paymentType,
            convenioId: paymentType === "convenio" ? convenioId : undefined,
          },
        });
        toast.success("Consulta atualizada com sucesso!");
        onCreated?.();
        handleClose();
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.data?.message || "Erro ao atualizar a consulta."
            : "Erro ao atualizar a consulta.";
        setFormError(String(msg));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Determine the patient: existing selection or a new shadow.
    let patientId = patient?.id || null;

    if (!patientId && showShadowForm) {
      if (
        !shadowName.trim() ||
        !shadowEmail.trim() ||
        !shadowPhone.trim() ||
        !shadowBirthDate
      ) {
        setFormError(
          "Preencha nome, email, telefone e data de nascimento do novo paciente.",
        );
        return;
      }
    }

    if (!patientId && !showShadowForm) {
      setFormError("Selecione um paciente ou cadastre um novo.");
      return;
    }

    setSubmitting(true);
    try {
      // Create the shadow patient first, if needed.
      if (!patientId && showShadowForm) {
        try {
          patientId = await createShadowPatient(selectedDoctor);
        } catch (err) {
          const msg =
            err instanceof ApiError
              ? err.data?.message || "Erro ao cadastrar paciente."
              : "Erro ao cadastrar paciente.";
          setFormError(String(msg));
          setSubmitting(false);
          return;
        }
      }

      await api("/appointments", {
        method: "POST",
        body: {
          doctorId: selectedDoctor,
          patientId,
          dateTime,
          reason,
          visitType,
          paymentType,
          convenioId: paymentType === "convenio" ? convenioId : undefined,
        },
      });

      toast.success("Consulta agendada com sucesso!");
      onCreated?.();
      handleClose();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.data?.message || "Erro ao agendar consulta."
          : "Erro ao agendar consulta.";
      setFormError(String(msg));
    } finally {
      setSubmitting(false);
    }
  }

  const canPickSchedule = !!patient || showShadowForm;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-5 border-b border-slate-100 shrink-0">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ClipboardCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
                      {!isExisting
                        ? "Agendar Consulta"
                        : editing
                          ? "Editar Consulta"
                          : "Detalhes do Agendamento"}
                    </h2>
                    <p className="text-slate-500 text-sm">
                      {!isExisting
                        ? "Preencha os dados abaixo para reservar um horário."
                        : editing
                          ? "Altere os dados abaixo e salve as alterações."
                          : "Confira os dados da consulta agendada."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="px-8 py-6 space-y-5 overflow-y-auto flex-1">
              {/* Paciente */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Paciente
                </label>

                {/* Selected patient */}
                {patient ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {patient.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {patient.email}
                        </p>
                      </div>
                    </div>
                    {/* The patient of an existing appointment cannot be swapped. */}
                    {!isExisting && (
                      <button
                        onClick={() => setPatient(null)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer border-none bg-transparent"
                      >
                        Trocar
                      </button>
                    )}
                  </div>
                ) : showShadowForm ? (
                  /* Shadow pre-registration form */
                  <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <UserPlus className="w-4 h-4 text-primary" />
                        Cadastrar novo paciente
                      </div>
                      <button
                        onClick={() => setShowShadowForm(false)}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer border-none bg-transparent"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        Voltar à busca
                      </button>
                    </div>
                    <input
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 outline-none"
                      placeholder="Nome completo"
                      value={shadowName}
                      onChange={(e) => setShadowName(e.target.value)}
                    />
                    <input
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 outline-none"
                      placeholder="Email"
                      type="email"
                      value={shadowEmail}
                      onChange={(e) => setShadowEmail(e.target.value)}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <select
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer outline-none"
                        value={shadowGender}
                        onChange={(e) => setShadowGender(e.target.value)}
                      >
                        {GENDER_OPTIONS.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                      <input
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 outline-none"
                        placeholder="Telefone"
                        value={shadowPhone}
                        onChange={(e) => setShadowPhone(e.target.value)}
                      />
                      <input
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer outline-none"
                        type="date"
                        value={shadowBirthDate}
                        onChange={(e) => setShadowBirthDate(e.target.value)}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      O paciente ficará disponível para toda a clínica e
                      receberá um convite por email.
                    </p>
                  </div>
                ) : isExisting ? (
                  /* Existing appointment without patient data resolved */
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-500">
                    Paciente não informado.
                  </div>
                ) : (
                  /* Search box */
                  <>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 outline-none"
                          placeholder="Pesquisar por nome ou email na Hispora..."
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSearchPatient()
                          }
                        />
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSearchPatient}
                        loading={searching}
                      >
                        Buscar
                      </Button>
                    </div>
                    {searchError && (
                      <p className="text-xs text-red-500 ml-1">{searchError}</p>
                    )}

                    {results.length > 0 && (
                      <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                        {results.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => {
                              setPatient(r);
                              setResults([]);
                            }}
                            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-white"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                              {r.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {r.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {r.email}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {hasSearched && !searching && results.length === 0 && (
                      <div className="text-center py-3">
                        <p className="text-sm text-slate-500 mb-2">
                          Nenhum paciente encontrado.
                        </p>
                        <button
                          onClick={openShadowForm}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 cursor-pointer border-none bg-transparent"
                        >
                          <UserPlus className="w-4 h-4" />
                          Cadastrar novo paciente
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Médico + Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Médico Responsável
                  </label>
                  <select
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer outline-none disabled:cursor-default disabled:text-slate-600"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    disabled={readOnly}
                  >
                    <option value="">Selecione o médico</option>
                    {/* Keeps the label visible even if the doctor list is unavailable. */}
                    {readOnly &&
                      appointment?.doctorName &&
                      !doctors.some((d) => d.id === selectedDoctor) && (
                        <option value={selectedDoctor}>
                          {appointment.doctorName}
                        </option>
                      )}
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name}
                        {doc.specialty ? ` (${doc.specialty})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Data da Consulta
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                    <input
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer outline-none disabled:cursor-default disabled:text-slate-600"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      disabled={readOnly}
                    />
                  </div>
                </div>
              </div>

              {/* Tipo de Visita + Forma de Pagamento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SegmentedToggle
                  label="Tipo de Visita"
                  value={visitType}
                  onChange={setVisitType}
                  disabled={readOnly}
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
                    if (v === "particular") {
                      setConvenioId("");
                      setConvenioName("");
                    }
                  }}
                  disabled={readOnly}
                  options={[
                    { value: "particular", label: "Particular" },
                    { value: "convenio", label: "Convênio" },
                  ]}
                />
              </div>

              {paymentType === "convenio" &&
                (readOnly ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Convênio
                    </label>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-600">
                      {convenioName || "—"}
                    </div>
                  </div>
                ) : (
                  <SearchableSelect
                    label="Convênio"
                    name="convenioId"
                    value={convenioId}
                    onChange={setConvenioId}
                    options={convenios.map((c) => ({ value: c.id, label: c.name }))}
                    placeholder="Selecione o convênio"
                    allowFreeText={false}
                  />
                ))}

              {/* Horário */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Horário
                </label>

                {!date ? (
                  <div className="flex items-center gap-2 py-4 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-sm text-slate-400">
                    <CalendarIcon className="w-4 h-4" />
                    Selecione uma data para ver os horários disponíveis.
                  </div>
                ) : !dayAvailability?.open ? (
                  <div className="flex items-center gap-2 py-4 px-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-500">
                    <Clock className="w-4 h-4" />
                    {dayAvailability?.reason || "Sem atendimento nesta data."}
                  </div>
                ) : displaySlots.length === 0 ? (
                  <div className="flex items-center gap-2 py-4 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    Nenhum horário disponível para esta data.
                  </div>
                ) : (
                  <>
                    {dayAvailability.customized && (
                      <p className="text-[11px] font-semibold text-primary">
                        Horário personalizado para esta data.
                      </p>
                    )}
                    <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                      {displaySlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          disabled={readOnly}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border-none ${
                            readOnly ? "cursor-default" : "cursor-pointer"
                          } ${
                            selectedTime === time
                              ? "bg-primary text-white shadow-md shadow-primary/20"
                              : `bg-slate-100 text-slate-700 ${
                                  readOnly
                                    ? "opacity-60"
                                    : "hover:bg-primary/10 hover:text-primary"
                                }`
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Motivo / Observações
                </label>
                <textarea
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 resize-none outline-none disabled:text-slate-600"
                  placeholder="Motivo da consulta ou detalhes relevantes..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={readOnly}
                />
              </div>

              {formError && (
                <p className="text-sm text-red-500 font-medium">{formError}</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 flex justify-end items-center gap-3 border-t border-slate-100 shrink-0">
              {confirmingCancel ? (
                <>
                  <span className="mr-auto text-sm font-medium text-slate-600">
                    Cancelar esta consulta? Essa ação não pode ser desfeita.
                  </span>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setConfirmingCancel(false)}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    onClick={handleCancelAppointment}
                    loading={cancelling}
                  >
                    Cancelar Consulta
                  </Button>
                </>
              ) : readOnly ? (
                <>
                  <Button
                    variant="danger-outline"
                    size="md"
                    onClick={() => setConfirmingCancel(true)}
                  >
                    Cancelar Consulta
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setEditing(true)}
                  >
                    Editar
                  </Button>
                </>
              ) : isExisting ? (
                <>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setEditing(false)}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmit}
                    loading={submitting}
                  >
                    Salvar Alterações
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="md" onClick={handleClose}>
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={!canPickSchedule}
                  >
                    Confirmar Agendamento
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
