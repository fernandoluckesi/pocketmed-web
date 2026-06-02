import { createContext, useContext, useState, useCallback } from "react";
import { ToastContainer } from "../components/Toast";
import type { ToastItem, ToastType } from "../components/Toast";

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = String(++toastId);
      setToasts((prev) => [...prev, { id, type, message }]);

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast],
  );

  const toast: ToastContextValue = {
    success: useCallback(
      (message: string) => addToast("success", message),
      [addToast],
    ),
    error: useCallback(
      (message: string) => addToast("error", message),
      [addToast],
    ),
    info: useCallback(
      (message: string) => addToast("info", message),
      [addToast],
    ),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
