import { useEffect } from "react";
import { X, AlertCircle } from "lucide-react";

interface SnackbarProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Snackbar({ message, visible, onClose, duration = 5000 }: SnackbarProps) {
  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl max-w-sm">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors border-none bg-transparent cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
