import { useState, useEffect } from "react";
import {
  X,
  ClipboardCheck,
  Search,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/Button";
import { api } from "../services/api";

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
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

// Horários de 08:00 até 20:00 de 30 em 30 min
const TIME_SLOTS: string[] = [];
for (let h = 8; h <= 20; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 20) TIME_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

export function NewAppointmentModal({
  isOpen,
  onClose,
}: NewAppointmentModalProps) {
  const [searchEmail, setSearchEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [patient, setPatient] = useState<FoundPatient | null>(null);
  const [searchError, setSearchError] = useState("");

  const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("08:30");
  const [notes, setNotes] = useState("");

  // Carregar médicos da clínica
  useEffect(() => {
    if (!isOpen) return;
    async function loadDoctors() {
      try {
        const data = await api("/doctors");
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

  async function handleSearchPatient() {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setSearchError("");
    setPatient(null);
    try {
      const results = await api(
        `/patients/search?q=${encodeURIComponent(searchEmail.trim())}`,
      );
      const arr = Array.isArray(results) ? results : [];
      if (arr.length > 0) {
        setPatient({ id: arr[0].id, name: arr[0].name, email: arr[0].email });
      } else {
        setSearchError("Nenhum paciente encontrado com esse email.");
      }
    } catch {
      setSearchError("Erro ao buscar paciente.");
    } finally {
      setSearching(false);
    }
  }

  function handleClose() {
    setSearchEmail("");
    setPatient(null);
    setSearchError("");
    setSelectedDoctor("");
    setDate("");
    setSelectedTime("08:30");
    setNotes("");
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
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
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ClipboardCheck className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
                      Novo Agendamento
                    </h2>
                  </div>
                  <p className="text-slate-500 text-sm pl-10">
                    Preencha os dados abaixo para reservar um horário.
                  </p>
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
              {/* Paciente — busca por email */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Paciente
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 outline-none"
                      placeholder="Pesquisar por email do paciente..."
                      type="text"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
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
                {patient && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {patient.name}
                      </p>
                      <p className="text-xs text-slate-500">{patient.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Médico + Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Médico Responsável
                  </label>
                  <select
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer outline-none"
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                  >
                    <option value="">Selecione o médico</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} ({doc.specialty})
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
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all cursor-pointer outline-none"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Horário */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Horário
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                  {TIME_SLOTS.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                        selectedTime === time
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "bg-slate-100 text-slate-700 hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Observações Clínicas
                </label>
                <textarea
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 resize-none outline-none"
                  placeholder="Detalhes relevantes para o atendimento..."
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 flex justify-end items-center gap-3 border-t border-slate-100 shrink-0">
              <Button variant="ghost" size="md" onClick={handleClose}>
                Cancelar
              </Button>
              <Button variant="primary" size="md">
                Confirmar Agendamento
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
