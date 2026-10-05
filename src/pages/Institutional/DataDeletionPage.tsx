import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { InstitutionalHeader } from "./InstitutionalHeader";
import { InstitutionalFooter } from "./InstitutionalFooter";
import { api, ApiError } from "../../services/api";

/**
 * Public account/data deletion request page.
 *
 * This is the URL submitted in Google Play's Data Safety section ("URL para
 * exclusão de contas" / "URL para exclusão de dados"), so it has to work for
 * someone who never installed the app and isn't signed in — hence a public
 * form rather than the in-app flow.
 *
 * Google requires the page to state the app name, the steps to request
 * deletion, and which data is deleted vs. retained. All three are on the page.
 *
 * It deliberately does NOT ask for a password. A public form that accepts
 * credentials is a credential-harvesting target, and it wouldn't prove
 * anything anyway. The request is recorded and acknowledged by email; the
 * deletion itself is still confirmed through the authenticated in-app flow.
 */

type RequestType = "account_and_data" | "data_only";

const REQUEST_TYPES: { value: RequestType; label: string; help: string }[] = [
  {
    value: "account_and_data",
    label: "Excluir minha conta e meus dados",
    help: "Encerra o acesso e remove os dados associados à conta.",
  },
  {
    value: "data_only",
    label: "Excluir apenas meus dados, mantendo a conta",
    help: "A conta continua ativa, sem o histórico armazenado.",
  },
];

const REASONS = [
  "Não utilizo mais o aplicativo",
  "Criei a conta por engano",
  "Preocupação com privacidade dos meus dados",
  "Encontrei outra solução",
  "Outro motivo",
];

function Field({
  label,
  htmlFor,
  error,
  children,
  hint,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold text-slate-500 uppercase tracking-wider"
      >
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10 focus:border-primary";

export default function DataDeletionPage() {
  const [searchParams] = useSearchParams();
  // `?tipo=dados` lets the Play Console "data deletion" URL land on this same
  // page with the data-only option already selected, so the two required URLs
  // don't need two near-identical pages.
  const initialType: RequestType =
    searchParams.get("tipo") === "dados" ? "data_only" : "account_and_data";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requestType, setRequestType] = useState<RequestType>(initialType);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [protocol, setProtocol] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!fullName.trim()) next.fullName = "Informe seu nome completo.";
    if (!email.trim()) {
      next.email = "Informe o email da conta.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Informe um email válido.";
    }
    // Typo-guard: the receipt goes to this address, and a wrong one means the
    // requester never learns their request was received.
    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      next.confirmEmail = "Os emails não coincidem.";
    }
    if (!acknowledged) {
      next.acknowledged = "É necessário confirmar que leu o aviso acima.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const composedReason = [reason, details.trim()]
        .filter(Boolean)
        .join(" — ");

      const response = await api("/auth/request-data-deletion", {
        method: "POST",
        body: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          requestType,
          reason: composedReason || undefined,
        },
      });

      setProtocol(response?.protocol || "—");
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? String(
              err.data?.message ||
                "Não foi possível registrar a solicitação. Tente novamente.",
            )
          : "Não foi possível registrar a solicitação. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <InstitutionalHeader />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Voltar ao início
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Trash2 className="text-primary" size={28} />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Exclusão de conta e dados
          </h1>
        </div>
        <p className="text-sm text-slate-500 mb-8">
          Solicite a exclusão da sua conta no <strong>Hispora</strong> ou apenas
          dos seus dados. Esta página é mantida pela Hispora Clinical Systems,
          desenvolvedora do aplicativo Hispora.
        </p>

        {protocol ? (
          /* --- Success state --- */
          <div className="rounded-2xl border border-green-100 bg-green-50 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-green-700" size={22} />
              <h2 className="text-lg font-extrabold text-green-900">
                Solicitação registrada
              </h2>
            </div>
            <p className="text-sm text-green-900 leading-relaxed">
              Seu número de protocolo é{" "}
              <strong className="font-mono">{protocol}</strong>. Guarde-o para
              acompanhar a solicitação.
            </p>
            <p className="text-sm text-green-900 leading-relaxed">
              Enviamos uma confirmação para o email informado. Nossa equipe
              responderá em até <strong>15 dias</strong>, conforme a LGPD. Por
              segurança, podemos solicitar uma confirmação adicional antes de
              executar a exclusão.
            </p>
            <p className="text-xs text-green-800">
              Dúvidas: hispora.suporte@yahoo.com
            </p>
          </div>
        ) : (
          <>
            {/* --- What gets deleted vs. retained (required by Google Play) --- */}
            <section className="rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 mb-6 space-y-4">
              <h2 className="text-base font-extrabold text-slate-900">
                O que é excluído
              </h2>
              <ul className="text-sm text-slate-600 leading-relaxed list-disc pl-5 space-y-1">
                <li>Dados cadastrais: nome, email, telefone, CPF, foto</li>
                <li>
                  Registros de saúde: consultas, medicamentos, exames, doenças,
                  alergias, vacinas, cirurgias
                </li>
                <li>Documentos emitidos e anexos enviados</li>
                <li>Dependentes administrados exclusivamente por você</li>
                <li>Autorizações de acesso concedidas a profissionais</li>
              </ul>

              <h2 className="text-base font-extrabold text-slate-900 pt-2">
                O que pode ser retido
              </h2>
              <ul className="text-sm text-slate-600 leading-relaxed list-disc pl-5 space-y-1">
                <li>
                  Registros clínicos que a legislação obriga o profissional ou a
                  clínica a guardar — o prontuário médico deve ser preservado
                  por no mínimo <strong>20 anos</strong> após o último
                  atendimento (Resolução CFM 1.821/2007)
                </li>
                <li>
                  Registros de auditoria de acesso, mantidos para segurança e
                  conformidade
                </li>
                <li>
                  Dados fiscais de pagamentos, pelo prazo exigido pela
                  legislação tributária
                </li>
              </ul>
              <p className="text-xs text-slate-400">
                Esses dados ficam restritos ao cumprimento da obrigação legal e
                não são usados para mais nada. Detalhes na{" "}
                <Link
                  to="/legal#privacidade"
                  className="font-semibold text-primary hover:underline"
                >
                  Política de Privacidade
                </Link>
                .
              </p>
            </section>

            {/* --- Steps (required by Google Play) --- */}
            <section className="rounded-2xl bg-slate-50 border border-slate-100 p-5 sm:p-6 mb-6">
              <h2 className="text-base font-extrabold text-slate-900 mb-3">
                Como solicitar
              </h2>
              <ol className="text-sm text-slate-600 leading-relaxed list-decimal pl-5 space-y-1.5">
                <li>Preencha o formulário abaixo com os dados da sua conta.</li>
                <li>
                  Escolha entre excluir a conta e os dados, ou só os dados.
                </li>
                <li>Envie a solicitação e guarde o número de protocolo.</li>
                <li>
                  Confirme a solicitação pelo email que enviaremos para o
                  endereço informado.
                </li>
              </ol>
              <p className="text-xs text-slate-500 mt-3">
                Já tem o app instalado? A exclusão é imediata em{" "}
                <strong>Perfil → Configurações → Excluir Conta</strong>,
                confirmada por um código enviado ao seu email.
              </p>
            </section>

            {/* --- Form --- */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {submitError}
                </div>
              )}

              <Field
                label="Nome completo"
                htmlFor="fullName"
                error={errors.fullName}
              >
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  placeholder="Como consta no seu cadastro"
                  autoComplete="name"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Email da conta"
                  htmlFor="email"
                  error={errors.email}
                >
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </Field>
                <Field
                  label="Confirme o email"
                  htmlFor="confirmEmail"
                  error={errors.confirmEmail}
                >
                  <input
                    id="confirmEmail"
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className={inputClass}
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </Field>
              </div>

              <Field
                label="Telefone (opcional)"
                htmlFor="phone"
                hint="Ajuda a localizar seu cadastro, caso o email tenha mudado."
              >
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="(11) 99999-0000"
                  autoComplete="tel"
                />
              </Field>

              <fieldset className="space-y-2">
                <legend className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  O que você deseja excluir
                </legend>
                <div className="space-y-2">
                  {REQUEST_TYPES.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                        requestType === option.value
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="requestType"
                        value={option.value}
                        checked={requestType === option.value}
                        onChange={() => setRequestType(option.value)}
                        className="mt-0.5 accent-primary"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">
                          {option.label}
                        </span>
                        <span className="block text-xs text-slate-500 mt-0.5">
                          {option.help}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <Field label="Motivo (opcional)" htmlFor="reason">
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="">Prefiro não informar</option>
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Detalhes adicionais (opcional)"
                htmlFor="details"
                hint="Não inclua senhas, dados de cartão ou informações clínicas aqui."
              >
                <textarea
                  id="details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  maxLength={1500}
                  className={`${inputClass} resize-none`}
                  placeholder="Algo que devemos saber sobre a sua solicitação"
                />
              </Field>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                <ShieldAlert
                  className="text-amber-700 shrink-0 mt-0.5"
                  size={18}
                />
                <div className="space-y-2">
                  <p className="text-xs text-amber-900 leading-relaxed">
                    A exclusão é <strong>permanente e irreversível</strong>. Não
                    é possível recuperar os dados depois de concluída. Nunca
                    pedimos sua senha nesta página — se alguém pedir, não
                    informe.
                  </p>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acknowledged}
                      onChange={(e) => setAcknowledged(e.target.checked)}
                      className="mt-0.5 accent-primary"
                    />
                    <span className="text-xs font-semibold text-amber-900">
                      Li e entendo que a exclusão é permanente.
                    </span>
                  </label>
                  {errors.acknowledged && (
                    <p className="text-xs text-red-600">
                      {errors.acknowledged}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar solicitação"
                )}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Clock size={13} />
                Responderemos em até 15 dias, conforme a LGPD.
              </p>
            </form>
          </>
        )}
      </main>

      <InstitutionalFooter />
    </div>
  );
}
