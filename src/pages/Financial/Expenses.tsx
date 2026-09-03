import { useDialog } from "../../components/ui/Dialog";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  TrendingUp,
  PlusCircle,
  Filter,
  Download,
  Clock,
  AlertCircle,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MainLayout } from "../../components/MainLayout";
import {
  financialApi,
  type Expense as ExpenseType,
} from "../../services/financial";

export default function Expenses() {
  const dialog = useDialog();
  const [expenses, setExpenses] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const filters: Record<string, string> = {};
      if (statusFilter !== "Todos") filters.status = statusFilter;
      const result = await financialApi.listExpenses(filters);
      setExpenses(result.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalExpensesMonth = useMemo(
    () => expenses.reduce((sum, item) => sum + (Number(item.netValue) || 0), 0),
    [expenses],
  );
  const pendingBillsCount = useMemo(
    () => expenses.filter((item) => item.status !== "PAGO").length,
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

  const handleAddExpense = async (data: {
    category: string;
    provider: string;
    grossValue: number;
    dueDate: string;
    status: string;
  }) => {
    try {
      await financialApi.createExpense({
        category: data.category,
        provider: data.provider,
        grossValue: data.grossValue,
        netValue: data.grossValue,
        paymentMethod: "Transferência",
        status: data.status,
        dueDate: data.dueDate,
        recurrence: "AVULSO",
      });
      loadData();
    } catch {
      // ignore
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await financialApi.deleteExpense(id);
      loadData();
    } catch {
      dialog.showError("Apenas despesas pendentes podem ser excluídas.");
    }
  };

  const handlePayExpense = async (id: string) => {
    try {
      await financialApi.payExpense(id);
      loadData();
    } catch {
      // ignore
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
                {pendingBillsCount} faturas pendentes
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
                onClick={() => setIsAddModalOpen(true)}
                className="bg-white text-blue-600 hover:bg-slate-50 font-bold text-xs py-2.5 px-4 rounded-lg shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Lançar Despesa
              </button>
            </div>
          </div>
        </section>

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
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-slate-800 focus:outline-none cursor-pointer font-bold"
              >
                <option value="Todos">Status (Todos)</option>
                <option value="PAGO">Pago</option>
                <option value="PENDENTE">Pendente</option>
                <option value="VENCIDO">Vencido</option>
              </select>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 font-bold text-xs text-slate-700 hover:text-blue-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all cursor-pointer"
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
                          {new Date(exp.dueDate).toLocaleDateString("pt-BR")}
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
                        <td className="px-6 py-3.5 text-center flex items-center justify-center gap-1">
                          {exp.status !== "PAGO" && (
                            <button
                              onClick={() => handlePayExpense(exp.id)}
                              className="text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Pagar
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1 rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Add Modal */}
        <AddExpenseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddExpense}
        />
      </div>
    </MainLayout>
  );
}

function AddExpenseModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    category: string;
    provider: string;
    grossValue: number;
    dueDate: string;
    status: string;
  }) => void;
}) {
  const [category, setCategory] = useState("Insumos");
  const [provider, setProvider] = useState("");
  const [value, setValue] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [status] = useState("PENDENTE");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !value || isNaN(parseFloat(value))) return;
    onAdd({
      category,
      provider,
      grossValue: parseFloat(value),
      dueDate,
      status,
    });
    setProvider("");
    setValue("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center bg-primary p-5 text-white">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Lançar Nova Despesa</h3>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
                  Categoria
                </label>
                <div className="grid grid-cols-3 gap-2">
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
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
                  Fornecedor
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: MedSupply Brasil"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
                    Vencimento
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm text-slate-500 font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold cursor-pointer active:scale-95"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
