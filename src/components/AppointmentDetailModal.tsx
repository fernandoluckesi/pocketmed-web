import { X, User, Stethoscope, ClipboardList, Clock, CheckCircle2, Edit3, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export function AppointmentDetailModal({ isOpen, onClose, appointment }: AppointmentDetailModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden relative z-10"
          >
            {/* Header */}
            <div className="relative h-36 bg-gradient-to-r from-primary to-blue-400 p-8 flex items-end">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <X size={24} />
              </button>
              <div>
                <h3 className="text-white text-2xl font-display font-extrabold">Detalhes do Agendamento</h3>
                <p className="text-white/80 font-medium">Protocolo: #PM-{appointment?.id || '2024-001'}</p>
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
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Paciente</p>
                  <h4 className="text-xl font-bold text-slate-900">{appointment?.patientName || 'Helena S. Ferreira'}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      {appointment?.status || 'Confirmado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-y-6 gap-x-8 bg-slate-50 p-6 rounded-2xl">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter mb-1.5">Médico Responsável</p>
                  <div className="flex items-center gap-2.5">
                    <Stethoscope size={18} className="text-primary" />
                    <p className="text-slate-900 font-semibold text-sm">{appointment?.doctorName || 'Dr. Roberto Silva'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter mb-1.5">Tipo de Consulta</p>
                  <div className="flex items-center gap-2.5">
                    <ClipboardList size={18} className="text-secondary" />
                    <p className="text-slate-900 font-semibold text-sm">{appointment?.type || 'Rotina'}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter mb-1.5">Data e Hora</p>
                  <div className="flex items-center gap-2.5">
                    <Clock size={18} className="text-primary" />
                    <p className="text-slate-900 font-semibold text-sm">{appointment?.dateTime || '15 Out 2024, 10:00'}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter mb-3">Histórico / Queixa Principal</p>
                <div className="bg-white border border-slate-200 p-5 rounded-xl italic text-slate-600 text-sm leading-relaxed relative">
                  <span className="absolute -left-1 top-2 text-primary opacity-20 text-4xl font-display">"</span>
                  {appointment?.notes || 'Paciente relata dores recorrentes na região lombar ao despertar. Histórico prévio de sedentarismo e início recente de atividades físicas leves. Necessita avaliação postural completa.'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <button className="w-full bg-primary text-white py-4 rounded-xl font-extrabold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 cursor-pointer border-none">
                  <CheckCircle2 size={20} />
                  <span>Finalizar Consulta</span>
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-slate-100 text-slate-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors active:scale-[0.98] cursor-pointer border-none">
                    <Edit3 size={18} />
                    <span>Editar</span>
                  </button>
                  <button className="bg-slate-100 text-slate-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors active:scale-[0.98] cursor-pointer border-none">
                    <RotateCcw size={18} />
                    <span>Reagendar</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
