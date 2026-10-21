import { useState, useEffect, useCallback, useMemo } from "react";
import {
  TrendingUp,
  PlusCircle,
  Filter,
  Download,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import { MainLayout } from "../../components/MainLayout";
import { ActionsMenu } from "../../components/ui/ActionsMenu";
import { ConfirmModal } from "../../components/ConfirmModal";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { useToast } from "../../contexts/ToastContext";
import {
  financialApi,
  type Expense as ExpenseType,
  type CostCenter,
} from "../../services/financial";
import { formatDateOnly } from "../../utils/date";
import { maskCurrencyBRL, parseCurrencyBRL } from "../../utils/currency";

const CATEGORIES = [
  "Insumos",
  "Folha de Pagamento",
  "Aluguel",
  "Condomínio",
  "Energia",
  "Água",
  "Marketing",
  "Seguros",
  "Tecnologia",
  "Manutenção",
  "Outros",
];

export default function Expenses() {
  const toast = useToast();
  const [expenses, setExpenses] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [costCenterFilter, setCostCenterFilter] = useState("Todos");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [minValueFilter, setMinValueFilter] = useState("");
  const [maxValueFilter, setMaxValueFilter] = useState("");
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add-expense form state
  const [category, setCategory] = useState("Insumos");
  const [provider, setProvider] = useState("");
  const [value, setValue] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const loadData = useCallback(async () => {
    try {
      const filters: Record<string, string> = {};
      if (statusFilter !== "Todos") filters.status = statusFilter;
      if (categoryFilter !== "Todos") filters.category = categoryFilter;
      if (costCenterFilter !== "Todos") filters.costCenterId = costCenterFilter;
      if (startDateFilter) filters.startDate = startDateFilter;
      if (endDateFilter) filters.endDate = endDateFilter;
      const minValue = parseCurrencyBRL(minValueFilter);
      const maxValue = parseCurrencyBRL(maxValueFilter);
      if (minValue !== null) filters.minValue = String(minValue);
      if (maxValue !== null) filters.maxValue = String(maxValue);
      const result = await financialApi.listExpenses(filters);
      setExpenses(result.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [
    statusFilter,
    categoryFilter,
    costCenterFilter,
    startDateFilter,
    endDateFilter,
    minValueFilter,
    maxValueFilter,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    financialApi
      .listCostCenters()
      .then((data) => setCostCenters(Array.isArray(data) ? data : []))
      .catch(() => setCostCenters([]));
  }, []);

  const hasActiveFilters =
    statusFilter !== "Todos" ||
    categoryFilter !== "Todos" ||
    costCenterFilter !== "Todos" ||
    !!startDateFilter ||
    !!endDateFilter ||
    !!minValueFilter ||
    !!maxValueFilter;

  const clearFilters = () => {
    setStatusFilter("Todos");
    setCategoryFilter("Todos");
    setCostCenterFilter("Todos");
    setStartDateFilter("");
    setEndDateFilter("");
    setMinValueFilter("");
    setMaxValueFilter("");
  };

  const totalExpensesMonth = useMemo(
    () => expenses.reduce((sum, item) => sum + (Number(item.netValue) || 0), 0),
    [expenses],
  );
  const overdueBillsCount = useMemo(
    () => expenses.filter((item) => item.status === "VENCIDO").length,
    [expenses],
  );
  const overdueTotal = useMemo(
    () =>
      expenses
        .filter((item) => item.status === "VENCIDO")
        .reduce((sum, item) => sum + (Number(item.netValue) || 0), 0),
    [expenses],
  );

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        (e.provider || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.category || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [expenses, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !value || isNaN(parseFloat(value))) return;
    try {
      await financialApi.createExpense({
        category,
        provider,
        grossValue: parseFloat(value),
        netValue: parseFloat(value),
        paymentMethod: "Transferência",
        status: "PENDENTE",
        dueDate,
        recurrence: "AVULSO",
      });
      setProvider("");
      setValue("");
      setShowAddForm(false);
      loadData();
    } catch {
      // ignore
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<ExpenseType | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Optimistic: flips the status badge immediately, before the request
  // resolves. Success is silent (the UI already shows the right state);
  // failure reverts the status locally and surfaces a toast — the toast is
  // the only feedback shown, and only on error.
  const handleToggleStatus = async (expense: ExpenseType) => {
    const previousStatus = expense.status;
    const isPaid = previousStatus === "PAGO";
    const nextStatus = isPaid ? "PENDENTE" : "PAGO";

    setExpenses((prev) =>
      prev.map((e) => (e.id === expense.id ? { ...e, status: nextStatus } : e)),
    );

    try {
      if (isPaid) {
        await financialApi.updateExpense(expense.id, { status: "PENDENTE" });
      } else {
        await financialApi.payExpense(expense.id);
      }
    } catch {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === expense.id ? { ...e, status: previousStatus } : e,
        ),
      );
      toast.error("Não foi possível atualizar o status. Tente novamente.");
    }
  };

  // Optimistic delete: removes the row right away and only re-inserts it (at
  // its original position) if the request actually fails.
  const handleConfirmDelete = async () => {
    const target = deleteTarget;
    if (!target) return;
    const index = expenses.findIndex((e) => e.id === target.id);

    setDeleting(true);
    setExpenses((prev) => prev.filter((e) => e.id !== target.id));

    try {
      await financialApi.deleteExpense(target.id);
      toast.success("Despesa excluída com sucesso.");
    } catch {
      setExpenses((prev) => {
        const next = [...prev];
        next.splice(index, 0, target);
        return next;
      });
      toast.error("Apenas despesas pendentes podem ser excluídas.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleExportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(expenses, null, 2))}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", "Hispora_Despesas_Export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const statusLabels: Record<string, { label: string; classes: string }> = {
    PAGO: {
      label: "Pago",
      classes: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    PENDENTE: {
      label: "Pendente",
      classes: "bg-amber-100 text-amber-700 border-amber-200",
    },
    VENCIDO: {
      label: "Vencido",
      classes: "bg-rose-100 text-rose-700 border-rose-200",
    },
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        {/* Metrics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex items-center justify-between hover:shadow-lg transition-all duration-300">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Despesas
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                R${" "}
                {totalExpensesMonth.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </h2>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 border border-rose-100">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex items-center justify-between hover:shadow-lg transition-all duration-300">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Vencidos
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                R${" "}
                {overdueTotal.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </h2>
              <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {overdueBillsCount} faturas vencidas
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-primary text-white p-6 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-md">
            <div>
              <p className="text-[10px] uppercase font-extrabold tracking-widest text-blue-200">
                Ação Administrativa
              </p>
              <h4 className="font-bold text-base mt-1">
                Lançamento de Despesas
              </h4>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-white text-blue-600 hover:bg-slate-50 font-bold text-xs py-2.5 px-4 rounded-lg shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Lançar Despesa
              </button>
            </div>
          </div>
        </section>

        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm flex flex-col gap-4"
          >
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Lançar Nova Despesa
              </h3>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">
                Categoria
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  "Insumos",
                  "Folha de Pagamento",
                  "Aluguel",
                  "Energia",
                  "Marketing",
                  "Seguros",
                  "Tecnologia",
                  "Outros",
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center cursor-pointer ${category === cat ? "bg-blue-50 border-blue-600 text-blue-600" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Fornecedor
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: MedSupply Brasil"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Vencimento
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-primary text-white hover:bg-primary-dark px-5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                Confirmar Lançamento
              </button>
            </div>
          </form>
        )}

        {/* Filters + Table */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50/50">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-3 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Buscar por fornecedor ou categoria..."
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "Todos", label: "Status (Todos)" },
                  { value: "PAGO", label: "Pago" },
                  { value: "PENDENTE", label: "Pendente" },
                  { value: "VENCIDO", label: "Vencido" },
                ]}
                size="sm"
              />
            </div>
            <CustomSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: "Todos", label: "Categoria (Todas)" },
                ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
              ]}
              size="sm"
            />
            <CustomSelect
              value={costCenterFilter}
              onChange={setCostCenterFilter}
              options={[
                { value: "Todos", label: "Centro de Custo (Todos)" },
                ...costCenters.map((cc) => ({ value: cc.id, label: cc.name })),
              ]}
              size="sm"
            />
            <div className="flex items-center gap-1.5 text-xs">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Venc. de
              </label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                até
              </label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Valor de
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={minValueFilter}
                onChange={(e) => setMinValueFilter(maskCurrencyBRL(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                até
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={maxValueFilter}
                onChange={(e) => setMaxValueFilter(maskCurrencyBRL(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Limpar
              </button>
            )}
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 font-bold text-xs text-slate-700 hover:text-blue-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all cursor-pointer ml-auto"
            >
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-3 font-bold">Fornecedor</th>
                  <th className="px-6 py-3 font-bold">Categoria</th>
                  <th className="px-6 py-3 font-bold">Vencimento</th>
                  <th className="px-6 py-3 font-bold text-right">Valor</th>
                  <th className="px-6 py-3 font-bold text-center">Status</th>
                  <th className="px-6 py-3 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-slate-400"
                    >
                      Nenhuma despesa encontrada
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => {
                    const info = statusLabels[exp.status] || {
                      label: exp.status,
                      classes: "bg-slate-100 text-slate-600",
                    };
                    return (
                      <tr
                        key={exp.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <p className="font-bold text-slate-900">
                            {exp.provider}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            {exp.description || ""}
                          </p>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200/20 rounded-full text-[10px] font-bold text-slate-600">
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600 font-medium">
                          {formatDateOnly(exp.dueDate)}
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold text-slate-900 font-mono">
                          R${" "}
                          {Number(exp.netValue).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] border ${info.classes}`}
                          >
                            {info.label}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <ActionsMenu
                            items={[
                              {
                                label:
                                  exp.status === "PAGO"
                                    ? "Marcar como Pendente"
                                    : "Marcar como Pago",
                                onClick: () => handleToggleStatus(exp),
                              },
                              {
                                label: "Excluir",
                                onClick: () => setDeleteTarget(exp),
                                variant: "danger",
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir Despesa"
        description={`Tem certeza que deseja excluir "${deleteTarget?.provider}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleting}
      />
    </MainLayout>
  );
}
