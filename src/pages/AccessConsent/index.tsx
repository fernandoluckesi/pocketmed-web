import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Stethoscope,
  Building2,
} from "lucide-react";
import { InstitutionalHeader } from "../Institutional/InstitutionalHeader";
import { InstitutionalFooter } from "../Institutional/InstitutionalFooter";
import { api, ApiError } from "../../services/api";

/**
 * Public cross-clinic record-sharing consent page (patient Shadow flow).
 *
 * Reached from the single-use link emailed to a patient who has no app
 * account — no login here, identity is the link + (when the record has a
 * CPF on file) the last 4 digits as a lightweight second factor. Opening
 * this page never grants access by itself: that only happens once the
 * patient explicitly confirms below, matching
 * `CrossClinicAccessService.getConsentDetails` on the backend, which never
 * consumes the token on a GET.
 */

interface ConsentDetails {
  doctorName: string;
  clinicName: string;
  purpose: string;
  patientName: string;
  requiresCpfConfirmation: boolean;
  expiresAt: string | null;
  accessWindowMinutes: number;
}

type ViewState =
  | { kind: "loading" }
  | { kind: "invalid" }
  | { kind: "ready"; details: ConsentDetails }
  | { kind: "done"; decision: "AUTHORIZE" | "DENY" };

const GENERIC_LINK_ERROR =
  "Este link é inválido ou já expirou. Se você ainda deseja autorizar o acesso, peça ao médico para enviar uma nova solicitação.";

function formatWindow(minutes: number): string {
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return hours === 1 ? "1 hora" : `${hours} horas`;
  }
  return `${minutes} minutos`;
}

export default function AccessConsent() {
  const { requestId } = useParams<{ requestId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [view, setView] = useState<ViewState>({ kind: "loading" });
  const [cpfLast4, setCpfLast4] = useState("");
  const [cpfError, setCpfError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"AUTHORIZE" | "DENY" | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!requestId || !token) {
        setView({ kind: "invalid" });
        return;
      }
      try {
        const details = await api(
          `/access-consent/${requestId}?token=${encodeURIComponent(token)}`,
        );
        if (!cancelled) setView({ kind: "ready", details });
      } catch {
        if (!cancelled) setView({ kind: "invalid" });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [requestId, token]);

  async function respond(decision: "AUTHORIZE" | "DENY") {
    if (view.kind !== "ready" || !requestId) return;
    setCpfError(null);

    if (decision === "AUTHORIZE" && view.details.requiresCpfConfirmation) {
      if (!/^\d{4}$/.test(cpfLast4)) {
        setCpfError("Informe os 4 últimos dígitos do seu CPF.");
        return;
      }
    }

    setSubmitting(decision);
    try {
      await api(`/access-consent/${requestId}/respond`, {
        method: "POST",
        body: {
          token,
          decision,
          cpfLast4: decision === "AUTHORIZE" ? cpfLast4 : undefined,
        },
      });
      setView({ kind: "done", decision });
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setCpfError(
          String(
            err.data?.message || "Não foi possível confirmar sua identidade.",
          ),
        );
      } else {
        setView({ kind: "invalid" });
      }
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <InstitutionalHeader />

      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="text-primary" size={28} />
          <h1 className="text-2xl sm:text-2xl font-extrabold text-slate-900">
            Autorização de acesso ao prontuário
          </h1>
        </div>

        {view.kind === "loading" && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {view.kind === "invalid" && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-red-600" size={22} />
              <h2 className="text-lg font-extrabold text-red-900">
                Link inválido
              </h2>
            </div>
            <p className="text-sm text-red-900/80 leading-relaxed">
              {GENERIC_LINK_ERROR}
            </p>
          </div>
        )}

        {view.kind === "ready" && (
          <div className="space-y-6">
            <p className="text-sm text-slate-500">
              Olá
              {view.details.patientName ? `, ${view.details.patientName}` : ""}.
              Um profissional de outra clínica está solicitando acesso
              temporário ao seu prontuário no Hispora.
            </p>

            <div className="rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Stethoscope
                  className="text-primary shrink-0 mt-0.5"
                  size={20}
                />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Médico solicitante
                  </p>
                  <p className="font-bold text-slate-900">
                    {view.details.doctorName}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="text-primary shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Clínica
                  </p>
                  <p className="font-bold text-slate-900">
                    {view.details.clinicName}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="text-primary shrink-0 mt-0.5"
                  size={20}
                />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Finalidade
                  </p>
                  <p className="font-bold text-slate-900">
                    {view.details.purpose}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-primary shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Duração do acesso, se autorizado
                  </p>
                  <p className="font-bold text-slate-900">
                    {formatWindow(view.details.accessWindowMinutes)} — acesso
                    temporário, não permanente
                  </p>
                </div>
              </div>
            </div>

            {view.details.requiresCpfConfirmation && (
              <div className="space-y-1.5">
                <label
                  htmlFor="cpfLast4"
                  className="block text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  Confirme sua identidade — últimos 4 dígitos do seu CPF
                </label>
                <input
                  id="cpfLast4"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={cpfLast4}
                  onChange={(e) =>
                    setCpfLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="0000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10 focus:border-primary"
                />
                {cpfError && <p className="text-xs text-red-500">{cpfError}</p>}
              </div>
            )}

            <p className="text-xs text-slate-400 leading-relaxed">
              Abrir este link não autoriza nada por si só. Você só concede
              acesso ao confirmar abaixo, e pode negar a qualquer momento.
              Consulte nossa{" "}
              <Link
                to="/legal#privacidade"
                className="font-semibold text-primary hover:underline"
              >
                Política de Privacidade
              </Link>
              .
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => respond("DENY")}
                disabled={submitting !== null}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {submitting === "DENY" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Negar acesso
              </button>
              <button
                onClick={() => respond("AUTHORIZE")}
                disabled={submitting !== null}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting === "AUTHORIZE" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Autorizar acesso
              </button>
            </div>
          </div>
        )}

        {view.kind === "done" && view.decision === "AUTHORIZE" && (
          <div className="rounded-2xl border border-green-100 bg-green-50 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-700" size={22} />
              <h2 className="text-lg font-extrabold text-green-900">
                Acesso autorizado
              </h2>
            </div>
            <p className="text-sm text-green-900 leading-relaxed">
              O profissional já pode visualizar seu prontuário por tempo
              limitado. Você pode revogar esse acesso a qualquer momento pelo
              aplicativo Hispora, caso tenha uma conta.
            </p>
          </div>
        )}

        {view.kind === "done" && view.decision === "DENY" && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <XCircle className="text-slate-500" size={22} />
              <h2 className="text-lg font-extrabold text-slate-900">
                Acesso negado
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Nenhum acesso foi concedido ao seu prontuário.
            </p>
          </div>
        )}
      </main>

      <InstitutionalFooter />
    </div>
  );
}
