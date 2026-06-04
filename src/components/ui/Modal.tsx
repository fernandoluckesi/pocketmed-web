import type { ReactNode } from "react";
import { X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  showFooter?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  label,
  title,
  children,
  maxWidth = "max-w-2xl",
  showFooter = true,
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
          >
            {/* Header */}
            <div className="p-8 pb-4 flex justify-between items-start shrink-0">
              <div>
                <div className="text-primary font-black text-[10px] uppercase tracking-widest mb-2">
                  {label}
                </div>
                <h4 className="text-2xl font-display font-extrabold text-on-surface">
                  {title}
                </h4>
              </div>
              <button
                onClick={onClose}
                className="text-on-surface-variant hover:text-on-surface p-2 bg-surface-container-low rounded-full transition-colors cursor-pointer border-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">{children}</div>

            {/* Footer */}
            {showFooter && (
              <div className="bg-blue-50/50 p-4 flex items-center justify-center gap-2 border-t border-outline-variant/5 shrink-0">
                <ShieldCheck size={16} className="text-primary fill-primary/10" />
                <p className="text-[10px] font-bold text-blue-700 tracking-wide uppercase">
                  Dados protegidos por criptografia PocketMed
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
