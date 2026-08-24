import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

// --- Types ---

type DialogVariant = "success" | "error" | "warning" | "info" | "confirm";

interface DialogOptions {
  title?: string;
  message: string;
  variant?: DialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface DialogState extends DialogOptions {
  open: boolean;
  resolve?: (value: boolean) => void;
}

interface DialogContextValue {
  showDialog: (options: DialogOptions) => Promise<boolean>;
  showSuccess: (message: string, title?: string) => Promise<boolean>;
  showError: (message: string, title?: string) => Promise<boolean>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
}

// --- Context ---

const DialogContext = createContext<DialogContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useDialog(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useDialog must be used within DialogProvider");
  return context;
}

// --- Provider ---

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState>({ open: false, message: "" });

  const showDialog = useCallback((options: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({ ...options, open: true, resolve });
    });
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    return showDialog({ message, title: title || "Sucesso", variant: "success" });
  }, [showDialog]);

  const showError = useCallback((message: string, title?: string) => {
    return showDialog({ message, title: title || "Erro", variant: "error" });
  }, [showDialog]);

  const showConfirm = useCallback((message: string, title?: string) => {
    return showDialog({ message, title: title || "Confirmação", variant: "confirm", confirmLabel: "Confirmar", cancelLabel: "Cancelar" });
  }, [showDialog]);

  const handleClose = (result: boolean) => {
    dialog.resolve?.(result);
    setDialog((prev) => ({ ...prev, open: false }));
  };

  const variantConfig = {
    success: { icon: CheckCircle, iconColor: "text-emerald-600", bgColor: "bg-emerald-100" },
    error: { icon: XCircle, iconColor: "text-red-600", bgColor: "bg-red-100" },
    warning: { icon: AlertTriangle, iconColor: "text-amber-600", bgColor: "bg-amber-100" },
    info: { icon: Info, iconColor: "text-blue-600", bgColor: "bg-blue-100" },
    confirm: { icon: AlertTriangle, iconColor: "text-amber-600", bgColor: "bg-amber-100" },
  };

  const variant = dialog.variant || "info";
  const config = variantConfig[variant];
  const IconComponent = config.icon;
  const isConfirm = variant === "confirm";

  return (
    <DialogContext.Provider value={{ showDialog, showSuccess, showError, showConfirm }}>
      {children}

      {dialog.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => handleClose(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200">
            <div className={`w-14 h-14 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-5`}>
              <IconComponent className={config.iconColor} size={28} />
            </div>
            {dialog.title && (
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">{dialog.title}</h3>
            )}
            <p className="text-sm text-slate-600 leading-relaxed mb-6">{dialog.message}</p>
            <div className="flex gap-3">
              {isConfirm && (
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors cursor-pointer border-none"
                >
                  {dialog.cancelLabel || "Cancelar"}
                </button>
              )}
              <button
                onClick={() => handleClose(true)}
                className={`flex-1 py-3 rounded-xl font-bold transition-colors cursor-pointer border-none ${
                  variant === "error"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : variant === "confirm"
                      ? "bg-primary text-white hover:bg-blue-700"
                      : "bg-primary text-white hover:bg-blue-700"
                }`}
              >
                {dialog.confirmLabel || "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
