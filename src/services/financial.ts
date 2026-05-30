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
  glosaValue: number | null;
  glosaReason: string | null;
  notes: string | null;
  convenio?: Convenio;
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
  getSettings: () => api("/financial/settings"),
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
  calculateTransfers: (month: string) => api(`/financial/transfers/calculate?month=${month}`),
  generateTransfers: (month: string) => api("/financial/transfers/generate", { method: "POST", body: { month } }),
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
  getDashboardKPIs: () => api("/financial/dashboard/kpis"),
  getRevenueBySpecialty: () => api("/financial/dashboard/revenue-by-specialty"),
  getRecentTransactions: (limit = 10) => api(`/financial/dashboard/recent-transactions?limit=${limit}`),
};
