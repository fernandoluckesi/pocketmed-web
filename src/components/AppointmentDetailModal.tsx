import { useState, useEffect } from "react";
import {
  X,
  User,
  Stethoscope,
  ClipboardList,
  Clock,
  Edit3,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../services/api";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (
    appointment: NonNullable<AppointmentDetailModalProps["appointment"]>,
  ) => void;
  onCancelled?: () => void;
  appointment?: {
    id: string;
    patientName: string;
    doctorName: string;
    type: string;
    dateTime: string;
    status: string;
    notes?: string;
  } | null;
}

export function AppointmentDetailModal({
  isOpen,
  onClose,
  onEdit,
  onCancelled,
  appointment,
}: AppointmentDetailModalProps) {
  const [view, setView] = useState<"details" | "confirm-cancel">("details");
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset internal state whenever the modal is (re)opened for a new appointment
  useEffect(() => {
    if (isOpen) {
      setView("details");
      setCancelling(false);
      setError(null);
    }
  }, [isOpen, appointment?.id]);

  function handleClose() {
    setView("details");
    setError(null);
    onClose();
  }

  async function handleConfirmCancel() {
    if (!appointment?.id) return;
    setCancelling(true);
    setError(null);
    try {
      await api(`/appointments/${appointment.id}`, { method: "DELETE" });
      onCancelled?.();
      handleClose();
    } catch {
      setError("Não foi possível cancelar a consulta. Tente novamente.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden relative z-10"
          >
            {view === "details" ? (
              <>
                {/* Header */}
                <div className="relative h-36 bg-gradient-to-r from-primary to-primary-gradient-end p-8 flex items-end">
                  <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full cursor-pointer border-none bg-transparent"
                  >
                    <X size={24} />
                  </button>
                  <div>
                    <h3 className="text-white text-2xl font-display font-extrabold">
                      Detalhes do Agendamento
                    </h3>
                    <p className="text-white/80 font-medium">
                      Protocolo: #PM-{appointment?.id || "2024-001"}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                  {/* Patient Summary */}
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center text-primary shadow-inner">
                      <User size={32} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        Paciente
                      </p>
                      <h4 className="text-xl font-bold text-slate-900">
                        {appointment?.patientName || "Paciente"}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          {appointment?.status || "Agendada"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-y-6 gap-x-8 bg-slate-50 p-6 rounded-2xl">
                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter mb-1.5">
                        Médico Responsável
                      </p>
                      <div className="flex items-center gap-2.5">
                        <Stethoscope size={18} className="text-primary" />
                        <p className="text-slate-900 font-semibold text-sm">
                          {appointment?.doctorName || "-"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter mb-1.5">
                        Tipo de Consulta
                      </p>
                      <div className="flex items-center gap-2.5">
                        <ClipboardList size={18} className="text-secondary" />
                        <p className="text-slate-900 font-semibold text-sm">
                          {appointment?.type || "Consulta"}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter mb-1.5">
                        Data e Hora
                      </p>
                      <div className="flex items-center gap-2.5">
                        <Clock size={18} className="text-primary" />
                        <p className="text-slate-900 font-semibold text-sm">
                          {appointment?.dateTime || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {appointment?.notes && (
                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter mb-3">
                        Queixa Principal
                      </p>
                      <div className="bg-white border border-slate-200 p-5 rounded-xl italic text-slate-600 text-sm leading-relaxed">
                        {appointment.notes}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => appointment && onEdit?.(appointment)}
                      className="bg-slate-100 text-slate-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors active:scale-[0.98] cursor-pointer border-none"
                    >
                      <Edit3 size={18} />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => setView("confirm-cancel")}
                      className="bg-red-50 text-red-600 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors active:scale-[0.98] cursor-pointer border-none"
                    >
                      <Trash2 size={18} />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Confirm Cancel View */
              <div className="p-8">
                <div className="flex flex-col items-center text-center space-y-5">
                  <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                    <AlertTriangle size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-display font-extrabold text-slate-900">
                      Cancelar consulta?
                    </h3>
                    <p className="text-slate-500 leading-relaxed">
                      Tem certeza que deseja cancelar a consulta de{" "}
                      <span className="font-bold text-slate-700">
                        {appointment?.patientName || "este paciente"}
                      </span>
                      {appointment?.dateTime ? (
                        <>
                          {" "}
                          em{" "}
                          <span className="font-bold text-slate-700">
                            {appointment.dateTime}
                          </span>
                        </>
                      ) : null}
                      ? Esta ação não pode ser desfeita.
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                  )}

                  <div className="grid grid-cols-2 gap-3 w-full pt-2">
                    <button
                      onClick={() => setView("details")}
                      disabled={cancelling}
                      className="bg-slate-100 text-slate-700 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-colors active:scale-[0.98] cursor-pointer border-none disabled:opacity-50"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleConfirmCancel}
                      disabled={cancelling}
                      className="bg-red-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors active:scale-[0.98] cursor-pointer border-none disabled:opacity-50"
                    >
                      {cancelling ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                      <span>Confirmar cancelamento</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
