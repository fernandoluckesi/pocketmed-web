import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, CheckCircle, Loader2 } from "lucide-react";
import { useRequestAccess } from "../hooks/usePatients";

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    id: string;
    name: string;
    profileImage?: string | null;
  };
  onSuccess?: () => void;
}

export function RequestAccessModal({
  isOpen,
  onClose,
  patient,
  onSuccess,
}: RequestAccessModalProps) {
  const [message, setMessage] = useState("");
  const { requestAccess, loading, error, success, reset } = useRequestAccess();

  useEffect(() => {
    if (!isOpen) {
      setMessage("");
      reset();
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success, onClose, onSuccess]);

  const handleSubmit = async () => {
    try {
      await requestAccess(patient.id, message.trim() || undefined);
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Success State */}
            {success ? (
              <div className="p-10 flex flex-col items-center text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>
                <h4 className="text-xl font-bold font-display text-gray-900">
                  Solicitação Enviada!
                </h4>
                <p className="text-gray-500 text-sm">
                  Sua solicitação de acesso ao prontuário de{" "}
                  <span className="font-semibold text-gray-700">
                    {patient.name}
                  </span>{" "}
                  foi enviada com sucesso.
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-6 pb-4 flex justify-between items-start border-b border-gray-100">
                  <div>
                    <div className="text-primary font-black text-[10px] uppercase tracking-widest mb-1">
                      Solicitar Acesso
                    </div>
                    <h4 className="text-xl font-display font-extrabold text-gray-900">
                      Acesso ao Prontuário
                    </h4>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 p-2 bg-gray-50 rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Patient Info */}
                <div className="px-6 pt-5 pb-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                      {patient.profileImage ? (
                        <img
                          src={patient.profileImage}
                          alt={patient.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-bold text-gray-900 truncate">
                        {patient.name}
                      </h5>
                      <p className="text-sm text-gray-500">
                        Paciente PocketMed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="px-6 pb-4 space-y-2">
                  <label className="text-xs font-bold text-gray-500 ml-1">
                    Mensagem (opcional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Explique o motivo da solicitação de acesso..."
                    rows={3}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/40 focus:outline-none resize-none text-sm"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="px-6 pb-3">
                    <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                      {error}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="p-6 pt-2 flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 bg-gray-100 py-3.5 rounded-xl font-bold text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-primary py-3.5 rounded-xl font-bold text-white shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Solicitação
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
