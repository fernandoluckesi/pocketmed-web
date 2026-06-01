import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />,
  error: <XCircle className="w-5 h-5 text-red-500 shrink-0" />,
  info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
};

const styles: Record<ToastType, string> = {
  success: "border-green-200 bg-white",
  error: "border-red-200 bg-white",
  info: "border-blue-200 bg-white",
};

export function ToastContainer({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-xl border shadow-lg shadow-black/5 min-w-[320px] max-w-[420px] ${styles[toast.type]}`}
          >
            {icons[toast.type]}
            <span className="flex-1 text-sm font-medium text-gray-800">
              {toast.message}
            </span>
            <button
              onClick={() => onRemove(toast.id)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors shrink-0"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
