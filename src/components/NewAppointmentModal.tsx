import { X, ClipboardCheck, UserSearch, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewAppointmentModal({ isOpen, onClose }: NewAppointmentModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-10 pt-10 pb-6 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ClipboardCheck className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">Novo Agendamento</h2>
                  </div>
                  <p className="text-slate-500 text-sm pl-11">Preencha os dados abaixo para reservar um horário.</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="px-10 py-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Paciente</label>
                <div className="relative">
                  <UserSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 outline-none"
                    placeholder="Pesquisar por nome ou CPF..."
                    type="text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Médico Responsável</label>
                  <select className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer outline-none">
                    <option>Dr. Ricardo Silva (Cardiologia)</option>
                    <option>Dra. Helena Souza (Neurologia)</option>
                    <option>Dr. Marcos Mendes (Ortopedia)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Data da Consulta</label>
                  <div className="relative">
                    <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                    <input
                      className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer outline-none"
                      type="date"
                      defaultValue="2024-10-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Horário
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-700 hover:bg-primary hover:text-white transition-all cursor-pointer border-none">08:00</button>
                    <button className="py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-md shadow-primary/20 cursor-pointer border-none">08:30</button>
                    <button className="py-2 bg-slate-100 rounded-xl text-sm font-bold text-slate-700 hover:bg-primary hover:text-white transition-all cursor-pointer border-none">09:00</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tipo de Consulta</label>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">Rotina</button>
                    <button className="px-4 py-2 bg-priority/10 text-priority border border-priority/20 rounded-full text-xs font-bold cursor-pointer">Prioridade</button>
                    <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">Pós-Op</button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Observações Clínicas</label>
                <textarea
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400 resize-none outline-none"
                  placeholder="Detalhes relevantes para o atendimento..."
                  rows={3}
                ></textarea>
              </div>
            </div>

            {/* Footer */}
            <div className="px-10 pb-10 pt-6 flex flex-col sm:flex-row justify-end items-center gap-4 border-t border-slate-100">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-10 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button className="w-full sm:w-auto px-10 py-4 bg-primary hover:brightness-110 text-white font-bold rounded-full shadow-xl shadow-primary/25 transition-all active:scale-95 cursor-pointer border-none">
                Confirmar Agendamento
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
