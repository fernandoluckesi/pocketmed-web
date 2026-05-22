import { Check, Star, Zap, Crown } from "lucide-react";
import { motion } from "motion/react";
import { MainLayout } from "../../components/MainLayout";

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    description:
      "Ideal para começar a usar a plataforma e conhecer os recursos.",
    icon: Zap,
    features: [
      "Até 10 pacientes",
      "Agendamento básico",
      "Prontuário eletrônico",
      "Suporte por email",
    ],
  },
  {
    id: "pro",
    name: "Profissional",
    price: "R$ 89",
    period: "/mês",
    description:
      "Para médicos que precisam de mais recursos e pacientes ilimitados.",
    icon: Star,
    highlighted: true,
    badge: "Mais Popular",
    features: [
      "Pacientes ilimitados",
      "Agendamento avançado",
      "Prontuário completo",
      "Prescrição digital",
      "Teleconsulta integrada",
      "Relatórios e analytics",
      "Suporte prioritário",
      "Notificações push",
    ],
  },
  {
    id: "clinic",
    name: "Clínica",
    price: "R$ 249",
    period: "/mês",
    description: "Para clínicas com múltiplos profissionais e gestão completa.",
    icon: Crown,
    features: [
      "Tudo do Profissional",
      "Até 10 profissionais",
      "Gestão de equipe",
      "Secretárias e admins",
      "Multi-agenda",
      "Faturamento integrado",
      "API personalizada",
      "Suporte dedicado 24/7",
      "Onboarding assistido",
    ],
  },
];

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className={`relative rounded-[2rem] p-8 flex flex-col justify-between transition-all ${
        plan.highlighted
          ? "bg-primary text-white shadow-2xl shadow-primary/30 scale-[1.02]"
          : "bg-white border border-slate-100 shadow-sm hover:shadow-lg"
      }`}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">
            {plan.badge}
          </span>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.highlighted ? "bg-white/20" : "bg-primary/10"}`}
          >
            <plan.icon
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
              {plan.price}
            </span>
            <span
              className={`text-sm font-medium ${plan.highlighted ? "text-white/70" : "text-slate-500"}`}
            >
              {plan.period}
            </span>
          </div>
          <p
            className={`text-sm mt-2 ${plan.highlighted ? "text-white/80" : "text-slate-500"}`}
          >
            {plan.description}
          </p>
        </div>

        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
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
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <button
        className={`mt-8 w-full py-4 rounded-full font-bold text-sm transition-all active:scale-95 ${
          plan.highlighted
            ? "bg-white text-primary hover:bg-white/90 shadow-lg"
            : "bg-primary text-white hover:bg-primary-container shadow-lg shadow-primary/20"
        }`}
      >
        {plan.id === "free" ? "Plano Atual" : "Assinar Agora"}
      </button>
    </motion.div>
  );
}

export default function Plans() {
  return (
    <MainLayout>
      <motion.div
        className="space-y-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Escolha seu Plano
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-lg">
            Selecione o plano ideal para sua prática médica. Todos incluem
            acesso à plataforma PocketMed com atualizações gratuitas.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} />
          ))}
        </div>

        {/* FAQ / Info */}
        <div className="bg-slate-50 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-display font-bold text-slate-900 mb-2">
            Dúvidas sobre os planos?
          </h3>
          <p className="text-slate-500 max-w-lg mx-auto">
            Todos os planos incluem 14 dias de teste grátis. Cancele a qualquer
            momento sem multa. Precisa de um plano personalizado para sua
            instituição?
          </p>
          <button className="mt-6 bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold hover:bg-slate-800 transition-all active:scale-95">
            Falar com Vendas
          </button>
        </div>
      </motion.div>
    </MainLayout>
  );
}
