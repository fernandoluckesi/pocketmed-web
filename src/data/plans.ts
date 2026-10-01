/**
 * Shared plan types and feature metadata.
 *
 * The plan data itself comes from the backend (`GET /plans`, served from
 * `plans.config.ts`) — only the presentation metadata lives here: the
 * human-readable label and description of each feature flag, in the order
 * they should be shown to the user.
 *
 * `PlanFeatures` must stay in sync with the backend interface of the same
 * name; `FEATURE_LABELS` is keyed by it, so a renamed flag surfaces as a
 * type error here instead of silently rendering an empty column.
 */

export interface PlanFeatures {
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

export interface Plan {
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

export interface FeatureLabel {
  key: keyof PlanFeatures;
  label: string;
  /** Shown in the comparison table so the user knows what the flag means. */
  description: string;
}

export const FEATURE_LABELS: FeatureLabel[] = [
  {
    key: "agenda",
    label: "Agenda",
    description: "Agendamento de consultas e controle de horários.",
  },
  {
    key: "prontuario",
    label: "Prontuário digital",
    description: "Histórico clínico, evoluções e prescrições do paciente.",
  },
  {
    key: "examesDocumentos",
    label: "Exames e documentos",
    description: "Upload, organização e consulta de exames e anexos.",
  },
  {
    key: "dependentes",
    label: "Dependentes / cuidadores",
    description: "Vínculo de dependentes e acesso de cuidadores responsáveis.",
  },
  {
    key: "secretaria",
    label: "Secretária",
    description: "Perfil de secretária com acesso restrito à agenda.",
  },
  {
    key: "gestaoClinica",
    label: "Gestão de clínica",
    description: "Equipe, convênios e configurações da clínica.",
  },
  {
    key: "financeiro",
    label: "Gestão financeira",
    description: "Receitas, despesas e fechamento financeiro.",
  },
  {
    key: "ocrIa",
    label: "OCR / leitura automática",
    description: "Extração automática de dados de exames enviados.",
  },
  {
    key: "relatoriosAvancados",
    label: "Relatórios avançados",
    description: "Indicadores e relatórios analíticos da operação.",
  },
  {
    key: "auditoriaAvancada",
    label: "Auditoria avançada",
    description: "Rastreamento detalhado de acessos e alterações.",
  },
  {
    key: "integracoesApi",
    label: "Integrações / API",
    description: "Acesso à API para integrar com sistemas próprios.",
  },
  {
    key: "suportePrioritario",
    label: "Suporte prioritário",
    description: "Atendimento com fila e prazo de resposta prioritários.",
  },
];

export function formatPriceBRL(value: number | null): string {
  if (value === null) return "Sob consulta";
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

/** "Até 5 profissionais • 2.000 pacientes ativos" — the capacity line shown
 * on plan cards and in the comparison table. */
export function formatCapacity(plan: Plan): string {
  const professionals =
    plan.professionalsIncluded === null
      ? "Profissionais personalizados"
      : `Até ${plan.professionalsIncluded} profissionais`;

  const patients =
    plan.activePatientsIncluded === null
      ? "pacientes personalizados"
      : `${plan.activePatientsIncluded.toLocaleString("pt-BR")} pacientes ativos`;

  return `${professionals} • ${patients}`;
}
