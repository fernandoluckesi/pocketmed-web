import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Zap, Star, TrendingUp, Crown, Building2 } from "lucide-react";
import { motion } from "motion/react";
import { MainLayout } from "../../components/MainLayout";
import { api } from "../../services/api";

interface PlanFeatures {
  agenda: boolean;
  prontuario: boolean;
  examesDocumentos: boolean;
  dependentes: boolean;
  secretaria: boolean;
  gestaoClinica: boolean;
  financeiro: boolean;
  ocrIa: boolean;
  relatoriosAvancados: boolean;
  auditoriaAvancada: boolean;
  integracoesApi: boolean;
  suportePrioritario: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number | null;
  description: string;
  professionalsIncluded: number | null;
  activePatientsIncluded: number | null;
  additionalProfessionalPrice: number | null;
  additionalPatientsPer1000Price: number | null;
  highlighted?: boolean;
  features: PlanFeatures;
}

const PLAN_ICONS: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  starter: Zap,
  plus: Star,
  pro: TrendingUp,
  premium: Crown,
  enterprise: Building2,
};

const FEATURE_LABELS: { key: keyof PlanFeatures; label: string }[] = [
  { key: "agenda", label: "Agenda" },
  { key: "prontuario", label: "Prontuário digital" },
  { key: "examesDocumentos", label: "Exames e documentos" },
  { key: "dependentes", label: "Dependentes / cuidadores" },
  { key: "secretaria", label: "Secretária" },
  { key: "gestaoClinica", label: "Gestão de clínica" },
  { key: "financeiro", label: "Gestão financeira" },
  { key: "ocrIa", label: "OCR / leitura automática" },
  { key: "relatoriosAvancados", label: "Relatórios avançados" },
  { key: "auditoriaAvancada", label: "Auditoria avançada" },
  { key: "integracoesApi", label: "Integrações / API" },
  { key: "suportePrioritario", label: "Suporte prioritário" },
];

function formatPriceBRL(value: number | null): string {
  if (value === null) return "Sob consulta";
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

function PlanCard({
  plan,
  index,
  onChoose,
}: {
  plan: Plan;
  index: number;
  onChoose: () => void;
}) {
  const Icon = PLAN_ICONS[plan.id] || Zap;
  const activeFeatures = FEATURE_LABELS.filter(({ key }) => plan.features[key]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative rounded-[2rem] p-8 flex flex-col justify-between transition-all ${
        plan.highlighted
          ? "bg-primary text-white shadow-2xl shadow-primary/30 scale-[1.02]"
          : "bg-white border border-slate-100 shadow-sm hover:shadow-lg"
      }`}
    >
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">
            Plano Principal
          </span>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.highlighted ? "bg-white/20" : "bg-primary/10"}`}
          >
            <Icon
              size={24}
              className={plan.highlighted ? "text-white" : "text-primary"}
            />
          </div>
          <h3
            className={`text-xl font-display font-bold ${plan.highlighted ? "text-white" : "text-slate-900"}`}
          >
            {plan.name}
          </h3>
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-4xl font-display font-extrabold ${plan.highlighted ? "text-white" : "text-slate-900"}`}
            >
              {formatPriceBRL(plan.price)}
            </span>
            {plan.price !== null && (
              <span
                className={`text-sm font-medium ${plan.highlighted ? "text-white/70" : "text-slate-500"}`}
              >
                /mês
              </span>
            )}
          </div>
          <p
            className={`text-sm mt-2 ${plan.highlighted ? "text-white/80" : "text-slate-500"}`}
          >
            {plan.description}
          </p>
          <p
            className={`text-xs font-bold mt-3 ${plan.highlighted ? "text-white/90" : "text-slate-600"}`}
          >
            {plan.professionalsIncluded === null
              ? "Profissionais personalizados"
              : `Até ${plan.professionalsIncluded} profissionais`}{" "}
            •{" "}
            {plan.activePatientsIncluded === null
              ? "pacientes personalizados"
              : `${plan.activePatientsIncluded.toLocaleString("pt-BR")} pacientes ativos`}
          </p>
        </div>

        <ul className="space-y-3">
          {activeFeatures.map(({ key, label }) => (
            <li key={key} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.highlighted ? "bg-white/20" : "bg-green-100"}`}
              >
                <Check
                  size={12}
                  className={plan.highlighted ? "text-white" : "text-green-600"}
                />
              </div>
              <span
                className={`text-sm font-medium ${plan.highlighted ? "text-white/90" : "text-slate-700"}`}
              >
                {label}
              </span>
            </li>
          ))}
        </ul>

        {(plan.additionalProfessionalPrice !== null ||
          plan.additionalPatientsPer1000Price !== null) && (
          <p
            className={`text-xs ${plan.highlighted ? "text-white/70" : "text-slate-400"}`}
          >
            {plan.additionalProfessionalPrice !== null &&
              `+R$ ${plan.additionalProfessionalPrice}/mês por profissional adicional. `}
            {plan.additionalPatientsPer1000Price !== null &&
              `+R$ ${plan.additionalPatientsPer1000Price} a cada 1.000 pacientes ativos adicionais.`}
          </p>
        )}
      </div>

      <button
        onClick={onChoose}
        className={`mt-8 w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer border-none ${
          plan.highlighted
            ? "bg-white text-primary hover:bg-white/90 shadow-lg"
            : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
        }`}
      >
        {plan.id === "enterprise" ? "Falar com Vendas" : "Escolher Plano"}
      </button>
    </motion.div>
  );
}

export default function Plans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    api("/plans")
      .then((data) => setPlans(Array.isArray(data) ? data : []))
      .catch(() => setPlans([]));
  }, []);

  function handleChoose(planId: string) {
    navigate("/account", { state: { tab: "subscription", planId } });
  }

  return (
    <MainLayout>
      <motion.div
        className="space-y-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mt-10 mb-16">
          <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Escolha o Plano da sua Clínica
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-md">
            Planos por capacidade da clínica, não por número de médicos.
            Adicione mais profissionais quando precisar, sem pular de faixa de
            preço.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={index}
              onChoose={() => handleChoose(plan.id)}
            />
          ))}
        </div>

        {/* FAQ / Info */}
        <div className="bg-slate-50 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-display font-bold text-slate-900 mb-2">
            Dúvidas sobre os planos?
          </h3>
          <p className="text-slate-500 max-w-lg mx-auto">
            A troca de plano é feita direto em Minha Conta, na aba Assinatura.
            Precisa de um plano personalizado para sua rede de clínicas ou
            hospital?
          </p>
          <button
            onClick={() => handleChoose("enterprise")}
            className="mt-6 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-[0.98] cursor-pointer border-none"
          >
            Falar com Vendas
          </button>
        </div>
      </motion.div>
    </MainLayout>
  );
}
