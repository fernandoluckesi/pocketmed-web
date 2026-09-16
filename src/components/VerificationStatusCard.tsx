import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  XCircle,
  ChevronRight,
} from "lucide-react";
import {
  getVerificationStatus,
  VERIFICATION_STATUS_LABELS,
  type VerificationState,
} from "../services/doctorDocuments";

const STYLES: Record<
  string,
  { card: string; iconWrap: string; icon: React.ReactNode; hint: string }
> = {
  APPROVED: {
    card: "bg-emerald-50 border-emerald-200",
    iconWrap: "bg-emerald-100 text-emerald-700",
    icon: <ShieldCheck className="w-5 h-5" />,
    hint: "Seu cadastro está verificado.",
  },
  SUBMITTED: {
    card: "bg-blue-50 border-blue-200",
    iconWrap: "bg-blue-100 text-primary",
    icon: <Clock className="w-5 h-5" />,
    hint: "Documentos em análise pela nossa equipe.",
  },
  REJECTED: {
    card: "bg-rose-50 border-rose-200",
    iconWrap: "bg-rose-100 text-rose-700",
    icon: <XCircle className="w-5 h-5" />,
    hint: "Há documentos que precisam de ajuste.",
  },
  PENDING: {
    card: "bg-amber-50 border-amber-200",
    iconWrap: "bg-amber-100 text-amber-700",
    icon: <ShieldAlert className="w-5 h-5" />,
    hint: "Envie os documentos obrigatórios para validar seu cadastro.",
  },
};

/**
 * Verification status summary for the account screen, with a shortcut into the
 * documents page so the doctor can review or resend files.
 */
export function VerificationStatusCard() {
  const navigate = useNavigate();
  const [state, setState] = useState<VerificationState | null>(null);

  useEffect(() => {
    let cancelled = false;
    getVerificationStatus()
      .then((result) => {
        if (!cancelled) setState(result);
      })
      .catch(() => {
        // Non-critical panel: stay hidden if the status cannot be loaded.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!state) return null;

  const style = STYLES[state.verificationStatus] || STYLES.PENDING;
  const approved = state.documents.filter(
    (d) => d.status === "APPROVED",
  ).length;
  const total = state.documents.length;

  return (
    <div className={`rounded-2xl border p-5 ${style.card}`}>
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl shrink-0 ${style.iconWrap}`}>
          {style.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Status da conta
            </p>
          </div>
          <p className="text-sm font-bold text-slate-900 mt-0.5">
            {VERIFICATION_STATUS_LABELS[state.verificationStatus]}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">{style.hint}</p>

          {state.rejectedCount > 0 && (
            <p className="text-xs font-semibold text-rose-700 mt-1">
              {state.rejectedCount}{" "}
              {state.rejectedCount === 1
                ? "documento recusado"
                : "documentos recusados"}
            </p>
          )}
        </div>

        <div className="text-right shrink-0 hidden sm:block">
          <p className="text-lg font-display font-extrabold text-slate-900">
            {approved}/{total}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            aprovados
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate("/verification")}
        className="mt-4 w-full flex items-center justify-between gap-2 bg-white/70 hover:bg-white rounded-xl px-4 py-3 text-sm font-bold text-slate-800 transition-colors cursor-pointer border border-white/60"
      >
        <span>
          {state.verificationStatus === "APPROVED"
            ? "Ver e atualizar meus documentos"
            : "Ver meus documentos"}
        </span>
        <ChevronRight className="w-4 h-4 shrink-0" />
      </button>
    </div>
  );
}
