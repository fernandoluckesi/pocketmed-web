import { api } from "./api";

// --- Types ---

export interface FinancialSettings {
  id: string;
  clinicId: string;
  taxRegime: string;
  issRate: number;
  dasRate: number | null;
  irpjRate: number | null;
  csllRate: number | null;
  defaultDoctorTransferPercentage: number;
  bankName: string | null;
  bankAgency: string | null;
  bankAccount: string | null;
  pixKey: string | null;
  invoicePrefix: string | null;
}

export interface CostCenter {
  id: string;
  clinicId: string;
  name: string;
  code: string;
  budgetAllocated: number | null;
  color: string | null;
  active: boolean;
  description: string | null;
}

export interface Convenio {
  id: string;
  clinicId: string;
  name: string;
  ansCode: string;
  cnpj: string | null;
  contractTable: string;
  paymentTerm: number;
  glosaTolerance: number;
  markupPercentage: number | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  active: boolean;
  notes: string | null;
}

export interface Revenue {
  id: string;
  clinicId: string;
  patientId: string | null;
  doctorId: string | null;
  appointmentId: string | null;
  convenioId: string | null;
  procedure: string;
  procedureCode: string | null;
  specialty: string;
  grossValue: number;
  discountValue: number | null;
  netValue: number;
  paymentMethod: string;
  status: string;
  dueDate: string;
  paidAt: string | null;
  invoiceNumber: string | null;
  guideNumber: string | null;
  authorizationNumber: string | null;
  insurancePlanName: string | null;
  insuranceCardNumber: string | null;
  glosaValue: number | null;
  glosaReason: string | null;
  notes: string | null;
  convenio?: Convenio;
}

export interface ConvenioProcedure {
  id: string;
  clinicId: string;
  convenioId: string;
  procedureCode: string;
  procedureName: string;
  value: number;
  active: boolean;
}

export interface TussProcedureOption {
  code: string;
  name: string;
}

export interface ConvenioPlan {
  id: string;
  clinicId: string;
  convenioId: string;
  name: string;
  active: boolean;
}

export interface Expense {
  id: string;
  clinicId: string;
  costCenterId: string;
  category: string;
  subcategory: string | null;
  provider: string;
  providerCnpj: string | null;
  description: string | null;
  grossValue: number;
  taxValue: number | null;
  netValue: number;
  paymentMethod: string;
  status: string;
  dueDate: string;
  paidAt: string | null;
  recurrence: string;
  invoiceNumber: string | null;
  attachmentUrl: string | null;
  notes: string | null;
  costCenter?: CostCenter;
}

export interface CalculatedTransfer {
  doctorId: string;
  referenceMonth: string;
  totalRevenue: number;
  transferPercentage: number;
  transferAmount: number;
  deductions: number;
  netTransfer: number;
  proceduresCount: number;
}

export interface DoctorTransfer {
  id: string;
  clinicId: string;
  doctorId: string;
  referenceMonth: string;
  totalRevenue: number;
  transferPercentage: number;
  transferAmount: number;
  deductions: number | null;
  netTransfer: number;
  proceduresCount: number;
  status: string;
  paidAt: string | null;
  paymentProof: string | null;
  notes: string | null;
}

export interface CashflowEntry {
  id: string;
  clinicId: string;
  type: string;
  sourceType: string;
  sourceId: string | null;
  description: string;
  value: number;
  date: string;
  balanceAfter: number | null;
  category: string | null;
  reconciled: boolean;
}

export interface DREResult {
  period: { year: number; month: number };
  receitaBruta: number;
  deductions: { glosas: number; descontos: number; cancelamentos: number; total: number };
  receitaLiquida: number;
  custosAssistenciais: number;
  lucroBruto: number;
  despesasOperacionais: number;
  ebitda: number;
  impostos: { iss: number; das: number; irpj: number; csll: number; total: number };
  resultadoLiquido: number;
  margemLiquida: number;
}

export interface DashboardKPIs {
  faturamento: number;
  lucro: number;
  ticketMedio: number;
  inadimplencia: number;
  crescimento: number;
  totalRevenues: number;
  totalDespesas: number;
}

// "Destaques do mês" — deterministic monthly highlights, same shape every
// clinic/month, built from the same reports below (no AI involved).
export interface FinancialHighlights {
  period: { year: number; month: number; monthLabel: string };
  resumoFinanceiro: { faturamento: number; lucro: number; crescimentoPercentual: number };
  riscoInadimplencia: { nivel: "baixo" | "medio" | "alto"; percentual: number; valorVencido: number };
  convenioComMaisGlosa: { nome: string; valorGlosado: number; percentualDaReceita: number } | null;
  medicoMaisProdutivo: { nome: string; faturamento: number; atendimentos: number } | null;
  centroDeCustoQueMaisCresceu: { nome: string; valorAtual: number; variacaoPercentual: number } | null;
}

export interface RevenueReport {
  totalGeral: number;
  totalRegistros: number;
  byConvenio: { name: string; total: number; count: number }[];
}

export interface InadimplenciaReport {
  totalInadimplente: number;
  totalRegistros: number;
}

export interface GlosaReport {
  totalGlosa: number;
  totalRegistros: number;
  byConvenio: { name: string; totalGlosa: number; count: number }[];
}

export interface ExpensesByCostCenterReport {
  totalGeral: number;
  totalRegistros: number;
  byCostCenter: { name: string; total: number; count: number }[];
}

export interface ProductivityReport {
  ranking: { doctorId: string; total: number; count: number; ticketMedio: number }[];
  totalMedicos: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- API Calls ---

// Settings
export const financialApi = {
  // Settings
  getSettings: (): Promise<FinancialSettings> => api("/financial/settings"),
  updateSettings: (data: Partial<FinancialSettings>) => api("/financial/settings", { method: "PUT", body: data }),

  // Cost Centers
  listCostCenters: () => api("/financial/cost-centers"),
  createCostCenter: (data: Partial<CostCenter>) => api("/financial/cost-centers", { method: "POST", body: data }),
  updateCostCenter: (id: string, data: Partial<CostCenter>) => api(`/financial/cost-centers/${id}`, { method: "PUT", body: data }),
  deleteCostCenter: (id: string) => api(`/financial/cost-centers/${id}`, { method: "DELETE" }),

  // Convenios
  listConvenios: () => api("/financial/convenios"),
  createConvenio: (data: Partial<Convenio>) => api("/financial/convenios", { method: "POST", body: data }),
  updateConvenio: (id: string, data: Partial<Convenio>) => api(`/financial/convenios/${id}`, { method: "PUT", body: data }),
  toggleConvenio: (id: string) => api(`/financial/convenios/${id}/toggle`, { method: "PATCH" }),
  deleteConvenio: (id: string) => api(`/financial/convenios/${id}`, { method: "DELETE" }),

  // Convenio remuneration table (how much this convênio pays per procedure code)
  listConvenioProcedures: (convenioId: string): Promise<ConvenioProcedure[]> =>
    api(`/financial/convenios/${convenioId}/procedures`),
  createConvenioProcedure: (
    convenioId: string,
    data: { procedureCode: string; procedureName: string; value: number },
  ): Promise<ConvenioProcedure> =>
    api(`/financial/convenios/${convenioId}/procedures`, { method: "POST", body: data }),
  updateConvenioProcedure: (
    convenioId: string,
    id: string,
    data: Partial<ConvenioProcedure>,
  ): Promise<ConvenioProcedure> =>
    api(`/financial/convenios/${convenioId}/procedures/${id}`, { method: "PUT", body: data }),
  deleteConvenioProcedure: (convenioId: string, id: string): Promise<void> =>
    api(`/financial/convenios/${convenioId}/procedures/${id}`, { method: "DELETE" }),

  // Convênio insurance plans (populate the Plano select in Receitas)
  listConvenioPlans: (convenioId: string): Promise<ConvenioPlan[]> =>
    api(`/financial/convenios/${convenioId}/plans`),
  createConvenioPlan: (convenioId: string, data: { name: string }): Promise<ConvenioPlan> =>
    api(`/financial/convenios/${convenioId}/plans`, { method: "POST", body: data }),
  updateConvenioPlan: (
    convenioId: string,
    id: string,
    data: Partial<ConvenioPlan>,
  ): Promise<ConvenioPlan> =>
    api(`/financial/convenios/${convenioId}/plans/${id}`, { method: "PUT", body: data }),
  deleteConvenioPlan: (convenioId: string, id: string): Promise<void> =>
    api(`/financial/convenios/${convenioId}/plans/${id}`, { method: "DELETE" }),

  // Official ANS TUSS code lookup (autocomplete for the Código do Procedimento field)
  searchTussProcedures: (q: string): Promise<TussProcedureOption[]> =>
    api(`/financial/tuss-procedures/search?q=${encodeURIComponent(q)}`),

  // This clinic's most-billed TUSS codes, shown as a head start on focus
  getCommonTussProcedures: (): Promise<TussProcedureOption[]> =>
    api(`/financial/tuss-procedures/common`),

  // Revenues
  listRevenues: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters || {}).toString();
    return api(`/financial/revenues${params ? `?${params}` : ""}`);
  },
  getRevenueSummary: () => api("/financial/revenues/summary"),
  createRevenue: (data: Partial<Revenue>) => api("/financial/revenues", { method: "POST", body: data }),
  updateRevenue: (id: string, data: Partial<Revenue>) => api(`/financial/revenues/${id}`, { method: "PUT", body: data }),
  updateRevenueStatus: (id: string, status: string, glosaValue?: number, glosaReason?: string) =>
    api(`/financial/revenues/${id}/status`, { method: "PATCH", body: { status, glosaValue, glosaReason } }),
  deleteRevenue: (id: string) => api(`/financial/revenues/${id}`, { method: "DELETE" }),

  // Expenses
  listExpenses: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters || {}).toString();
    return api(`/financial/expenses${params ? `?${params}` : ""}`);
  },
  getExpenseSummary: () => api("/financial/expenses/summary"),
  createExpense: (data: Partial<Expense>) => api("/financial/expenses", { method: "POST", body: data }),
  updateExpense: (id: string, data: Partial<Expense>) => api(`/financial/expenses/${id}`, { method: "PUT", body: data }),
  payExpense: (id: string) => api(`/financial/expenses/${id}/pay`, { method: "PATCH" }),
  deleteExpense: (id: string) => api(`/financial/expenses/${id}`, { method: "DELETE" }),

  // Doctor Transfers
  listTransfers: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters || {}).toString();
    return api(`/financial/transfers${params ? `?${params}` : ""}`);
  },
  calculateTransfers: (month: string): Promise<CalculatedTransfer[]> =>
    api(`/financial/transfers/calculate?month=${month}`),
  generateTransfers: (month: string): Promise<DoctorTransfer[]> =>
    api("/financial/transfers/generate", { method: "POST", body: { month } }),
  approveTransfer: (id: string) => api(`/financial/transfers/${id}/approve`, { method: "PATCH" }),
  payTransfer: (id: string) => api(`/financial/transfers/${id}/pay`, { method: "PATCH" }),
  getMyTransfers: () => api("/financial/transfers/my"),

  // Cashflow
  listCashflow: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters || {}).toString();
    return api(`/financial/cashflow${params ? `?${params}` : ""}`);
  },
  getBalance: () => api("/financial/cashflow/balance"),
  createAdjustment: (data: Partial<CashflowEntry>) => api("/financial/cashflow/adjustment", { method: "POST", body: data }),
  reconcileEntry: (id: string) => api(`/financial/cashflow/${id}/reconcile`, { method: "PATCH" }),

  // DRE
  getDRE: (year: number, month: number) => api(`/financial/dre?year=${year}&month=${month}`),

  // Dashboard
  getDashboardKPIs: (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.set("year", String(year));
    if (month) params.set("month", String(month));
    const qs = params.toString();
    return api(`/financial/dashboard/kpis${qs ? `?${qs}` : ""}`);
  },
  getRevenueBySpecialty: (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.set("year", String(year));
    if (month) params.set("month", String(month));
    const qs = params.toString();
    return api(`/financial/dashboard/revenue-by-specialty${qs ? `?${qs}` : ""}`);
  },
  getRecentTransactions: (limit = 10, status?: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (status) params.set("status", status);
    return api(`/financial/dashboard/recent-transactions?${params.toString()}`);
  },
  getDashboardHighlights: (year?: number, month?: number): Promise<FinancialHighlights> => {
    const params = new URLSearchParams();
    if (year) params.set("year", String(year));
    if (month) params.set("month", String(month));
    const qs = params.toString();
    return api(`/financial/dashboard/highlights${qs ? `?${qs}` : ""}`);
  },

  // Reports (same period filter style: YYYY-MM-DD strings)
  getRevenueReport: (startDate: string, endDate: string): Promise<RevenueReport> =>
    api(`/financial/reports/revenue?startDate=${startDate}&endDate=${endDate}`),
  getInadimplenciaReport: (startDate: string, endDate: string): Promise<InadimplenciaReport> =>
    api(`/financial/reports/inadimplencia?startDate=${startDate}&endDate=${endDate}`),
  getGlosaReport: (startDate: string, endDate: string): Promise<GlosaReport> =>
    api(`/financial/reports/glosas?startDate=${startDate}&endDate=${endDate}`),
  getExpensesByCostCenterReport: (startDate: string, endDate: string): Promise<ExpensesByCostCenterReport> =>
    api(`/financial/reports/expenses-by-cost-center?startDate=${startDate}&endDate=${endDate}`),
  getProductivityReport: (startDate: string, endDate: string): Promise<ProductivityReport> =>
    api(`/financial/reports/productivity?startDate=${startDate}&endDate=${endDate}`),

  // Clinic doctors (for filter dropdowns — admin/secretary scoped to active clinic)
  listClinicDoctors: (): Promise<
    {
      id: string;
      name: string;
      email: string;
      specialty: string;
      crm: string;
      membershipId: string | null;
      transferPercentage: number | null;
    }[]
  > => api("/clinic-admin/doctors"),

  // Per-doctor repasse percentage override (admin only). Null clears the
  // override, falling back to the clinic's default percentage.
  updateDoctorTransferPercentage: (
    membershipId: string,
    transferPercentage: number | null,
  ): Promise<{ id: string; professionalId: string; transferPercentage: number | null }> =>
    api(`/clinic-admin/members/${membershipId}/transfer-percentage`, {
      method: "PATCH",
      body: { transferPercentage },
    }),
};
