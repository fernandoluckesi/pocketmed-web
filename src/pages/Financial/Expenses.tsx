import { useState, useMemo } from "react";
import {
  TrendingUp,
  PlusCircle,
  Filter,
  Download,
  Eye,
  Clock,
  AlertCircle,
  RefreshCw,
  X,
  Calendar,
  Landmark,
  Receipt,
  Tag,
  ShieldAlert,
  CheckCircle,
  Trash2,
  Printer,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MainLayout } from "../../components/MainLayout";

interface Expense {
  id: string;
  category: "Aluguel" | "Insumos" | "Folha" | "Energia" | "Outros" | "Marketing" | "Seguros";
  provider: string;
  dueDate: string;
  value: number;
  status: "Pago" | "Pendente" | "Vencido";
  icon: string;
}

const INITIAL_EXPENSES: Expense[] = [
  { id: "exp-1", category: "Folha", provider: "Sistema Folha Pagto", dueDate: "2026-06-15", value: 89000, status: "Pendente", icon: "group" },
  { id: "exp-2", category: "Aluguel", provider: "Imobiliaria Central", dueDate: "2026-06-10", value: 15000, status: "Pago", icon: "home_work" },
  { id: "exp-3", category: "Insumos", provider: "MedSupply Brasil", dueDate: "2026-05-20", value: 8420, status: "Vencido", icon: "medical_services" },
  { id: "exp-4", category: "Energia", provider: "Enel Distribuicao", dueDate: "2026-06-20", value: 2150, status: "Pendente", icon: "bolt" },
  { id: "exp-5", category: "Marketing", provider: "Ativa Digital Clinic", dueDate: "2026-05-28", value: 10000, status: "Pago", icon: "campaign" },
  { id: "exp-6", category: "Outros", provider: "MedCloud Premium SaaS", dueDate: "2026-05-26", value: 4010, status: "Pendente", icon: "cloud" },
  { id: "exp-7", category: "Seguros", provider: "Porto Seguro Clinicas", dueDate: "2026-06-05", value: 13920, status: "Pendente", icon: "shield" },
];


// Donut Chart Component
function DonutChart({ expenses }: { expenses: Expense[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const groupedData: Record<string, number> = {};
  let totalExpenses = 0;
  expenses.forEach((e) => {
    groupedData[e.category] = (groupedData[e.category] || 0) + e.value;
    totalExpenses += e.value;
  });

  const categoriesColorMap: Record<string, string> = {
    Folha: "#004ac6",
    Insumos: "#ba1a1a",
    Aluguel: "#9aa5ce",
    Outros: "#737686",
    Marketing: "#e11d48",
    Seguros: "#d97706",
    Energia: "#059669",
  };

  const slices = Object.keys(groupedData)
    .map((cat) => ({
      category: cat,
      value: groupedData[cat],
      percentage: totalExpenses > 0 ? (groupedData[cat] / totalExpenses) * 100 : 0,
      color: categoriesColorMap[cat] || "#cbd5e1",
    }))
    .sort((a, b) => b.value - a.value);

  let currentAngle = 0;
  const radius = 64;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const largestSlice = slices[0];
  const largestPercentage = largestSlice ? Math.round(largestSlice.percentage) : 0;

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="relative flex items-center justify-center py-4 h-64">
        <svg width="220" height="220" viewBox="0 0 200 200" className="transform -rotate-90">
          {slices.map((slice, idx) => {
            const strokeLength = (slice.percentage / 100) * circumference;
            const strokeOffset = circumference - strokeLength;
            const rotation = currentAngle;
            currentAngle += (slice.percentage / 100) * 360;
            return (
              <circle
                key={slice.category}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={hoveredIdx === idx ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${strokeLength} ${circumference}`}
                strokeDashoffset={strokeOffset}
                transform={`rotate(${rotation} 100 100)`}
                strokeLinecap="round"
                style={{ transformOrigin: "center", cursor: "pointer" }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900">
            {hoveredIdx !== null ? `${Math.round(slices[hoveredIdx].percentage)}%` : `${largestPercentage}%`}
          </span>
          <span className="text-xs font-semibold text-slate-500 mt-0.5 uppercase tracking-wider">
            {hoveredIdx !== null ? slices[hoveredIdx].category : "Operacional"}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 pt-4 border-t border-slate-100">
        {slices.map((slice, idx) => (
          <div
            key={slice.category}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`flex items-center justify-between p-1 rounded-md transition-colors cursor-pointer ${hoveredIdx === idx ? "bg-slate-50" : ""}`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
              <span className="text-xs font-medium text-slate-800 truncate">{slice.category}:</span>
            </div>
            <span className="text-xs font-bold text-slate-800 shrink-0 ml-1">{Math.round(slice.percentage)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bar Chart Component
function BarChart({ expenses }: { expenses: Expense[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const baseMonthlyValues: Record<string, number> = { "01": 95000, "02": 112000, "03": 105000, "04": 118000, "05": 0, "06": 78000 };
  expenses.forEach((exp) => {
    const month = exp.dueDate.split("-")[1];
    if (baseMonthlyValues[month] !== undefined) {
      baseMonthlyValues[month] += exp.value;
    }
  });

  const monthlyData = [
    { label: "Jan", value: baseMonthlyValues["01"] },
    { label: "Fev", value: baseMonthlyValues["02"] },
    { label: "Mar", value: baseMonthlyValues["03"] },
    { label: "Abr", value: baseMonthlyValues["04"] },
    { label: "Mai", value: baseMonthlyValues["05"] || 142500 },
    { label: "Jun", value: baseMonthlyValues["06"] },
  ];

  const maxVal = Math.max(...monthlyData.map((d) => d.value), 1);

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="h-6 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Evolucao Historica</span>
        <span className="text-xs font-extrabold text-blue-600">
          {hoveredIdx !== null
            ? `R$ ${monthlyData[hoveredIdx].value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`
            : `Media: R$ ${(monthlyData.reduce((acc, curr) => acc + curr.value, 0) / 6).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
        </span>
      </div>
      <div className="flex-1 flex items-end justify-between gap-3 sm:gap-4 md:gap-5 pt-8 min-h-[180px]">
        {monthlyData.map((data, idx) => {
          const pct = (data.value / maxVal) * 100;
          const displayHeight = Math.max(pct, 5);
          const isMay = data.label === "Mai";
          return (
            <div key={data.label} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
              <div
                className="w-full relative group cursor-pointer transition-all duration-200"
                style={{ height: `${displayHeight}%` }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className="absolute inset-0 bg-slate-100 rounded-t-lg" />
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  style={{ transformOrigin: "bottom" }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  className={`absolute inset-0 rounded-t-lg transition-colors ${isMay ? "bg-rose-500 hover:bg-rose-600" : "bg-blue-600/80 hover:bg-blue-600"}`}
                />
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap shadow-md z-10 font-bold">
                  R$ {Math.round(data.value / 1000)}k
                </div>
              </div>
              <span className={`text-[11px] font-bold transition-all ${hoveredIdx === idx ? "text-blue-600" : "text-slate-500 opacity-85"}`}>{data.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Add Expense Modal
function AddExpenseModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (expense: Omit<Expense, "id" | "icon">) => void }) {
  const [category, setCategory] = useState<Expense["category"]>("Insumos");
  const [provider, setProvider] = useState("");
  const [value, setValue] = useState("");
  const [dueDate, setDueDate] = useState("2026-06-01");
  const [status, setStatus] = useState<Expense["status"]>("Pendente");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !value || isNaN(parseFloat(value))) return;
    onAdd({ category, provider, dueDate, value: parseFloat(value), status });
    setProvider("");
    setValue("");
    setDueDate("2026-06-01");
    setCategory("Insumos");
    setStatus("Pendente");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center bg-blue-600 p-5 text-white">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-2 rounded-lg"><Plus className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-semibold text-lg">Lancar Nova Despesa</h3>
                  <p className="text-white/70 text-xs">Atalho rapido para nova fatura</p>
                </div>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Categoria</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Insumos", "Folha", "Aluguel", "Energia", "Marketing", "Seguros"] as const).map((cat) => (
                    <button key={cat} type="button" onClick={() => setCategory(cat)} className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all text-center ${category === cat ? "bg-blue-50 border-blue-600 text-blue-600 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Fornecedor</label>
                <input type="text" required placeholder="Ex: MedSupply Brasil" value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Valor (R$)</label>
                  <input type="number" step="0.01" required placeholder="0,00" value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Vencimento</label>
                  <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Status</label>
                <div className="flex gap-4">
                  {(["Pendente", "Pago", "Vencido"] as const).map((st) => (
                    <label key={st} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border cursor-pointer transition-all ${status === st ? (st === "Pago" ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold" : st === "Vencido" ? "bg-rose-50 border-rose-500 text-rose-800 font-semibold" : "bg-amber-50 border-amber-500 text-amber-800 font-semibold") : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                      <input type="radio" name="status" value={st} checked={status === st} onChange={() => setStatus(st)} className="sr-only" />
                      <span className={`w-2 h-2 rounded-full ${st === "Pago" ? "bg-emerald-500" : st === "Vencido" ? "bg-rose-500" : "bg-amber-500"}`} />
                      <span className="text-xs">{st}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm text-slate-500 transition-all font-medium">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-all shadow-md active:scale-95 font-semibold">Confirmar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// View Expense Modal
function ViewExpenseModal({ expense, onClose, onStatusToggle, onDelete }: { expense: Expense | null; onClose: () => void; onStatusToggle: (id: string) => void; onDelete: (id: string) => void }) {
  if (!expense) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className={`p-5 text-white flex justify-between items-center ${expense.status === "Pago" ? "bg-emerald-600" : expense.status === "Vencido" ? "bg-rose-600" : "bg-amber-500"}`}>
            <div className="flex items-center gap-2">
              {expense.status === "Pago" ? <CheckCircle className="w-5 h-5" /> : expense.status === "Vencido" ? <ShieldAlert className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              <div>
                <h3 className="font-semibold text-base">Comprovante de Despesa</h3>
                <p className="text-white/80 text-xs">#{expense.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-5">
            <div className="text-center py-4 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">Valor Total</span>
              <p className="text-3xl font-bold text-slate-900 mt-1">R$ {expense.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200">
                <span className={`w-2.5 h-2.5 rounded-full ${expense.status === "Pago" ? "bg-emerald-500" : expense.status === "Vencido" ? "bg-rose-500" : "bg-amber-500"}`} />
                <span className="text-slate-800">{expense.status}</span>
              </div>
            </div>
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5"><Landmark className="w-4 h-4 text-blue-600" /> Fornecedor</span>
                <span className="font-semibold text-slate-800">{expense.provider}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5"><Tag className="w-4 h-4 text-blue-600" /> Categoria</span>
                <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{expense.category}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-600" /> Vencimento</span>
                <span className="font-semibold text-slate-800">{new Date(expense.dueDate + "T12:00:00").toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500 flex items-center gap-1.5"><Receipt className="w-4 h-4 text-blue-600" /> Destinatario</span>
                <span className="font-mono text-xs font-semibold text-slate-800">POCKETMED FINANCE</span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button onClick={() => { onStatusToggle(expense.id); onClose(); }} className={`py-2 px-4 rounded-lg text-sm text-center font-semibold transition-all shadow-sm active:scale-95 ${expense.status === "Pago" ? "bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                {expense.status === "Pago" ? "Marcar como Pendente" : "Marcar como Pago"}
              </button>
              <div className="flex gap-2">
                <button type="button" className="flex-1 py-1 px-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"><Printer className="w-3.5 h-3.5" /> PDF</button>
                <button type="button" onClick={() => { onDelete(expense.id); onClose(); }} className="flex-1 py-1 px-3 border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Excluir</button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Main Expenses Page
export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const totalExpensesMonth = useMemo(() => expenses.reduce((sum, item) => sum + item.value, 0), [expenses]);

  const totalOverdueAndDueToday = useMemo(() => {
    return expenses.filter((item) => item.status === "Vencido" || item.id === "exp-6").reduce((sum, item) => sum + item.value, 0);
  }, [expenses]);

  const pendingBillsCount = useMemo(() => expenses.filter((item) => item.status !== "Pago").length, [expenses]);

  const handleAddExpense = (newExpenseData: Omit<Expense, "id" | "icon">) => {
    const iconMap: Record<string, string> = { Folha: "group", Aluguel: "home_work", Insumos: "medical_services", Energia: "bolt", Marketing: "campaign", Seguros: "shield", Outros: "cloud" };
    const newExpense: Expense = { ...newExpenseData, id: `exp-${Date.now()}`, icon: iconMap[newExpenseData.category] || "receipt_long" };
    setExpenses([newExpense, ...expenses]);
  };

  const handleDeleteExpense = (id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id));

  const handleToggleExpenseStatus = (id: string) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, status: e.status === "Pago" ? ("Pendente" as const) : ("Pago" as const) } : e)));
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch = e.provider.toLowerCase().includes(searchQuery.toLowerCase()) || e.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "Todos" || e.status === statusFilter;
      const matchCategory = categoryFilter === "Todos" || e.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [expenses, searchQuery, statusFilter, categoryFilter]);

  const handleExportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(expenses, null, 2))}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", "PocketMed_Despesas_Export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        {/* Metrics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex items-center justify-between hover:shadow-lg transition-all duration-300">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Despesas (Mes)</p>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">R$ {totalExpensesMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h2>
              <span className="text-rose-600 font-bold text-xs flex items-center gap-1 mt-1"><TrendingUp className="w-3.5 h-3.5" /> +12% vs mes anterior</span>
            </div>
            <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 border border-rose-100"><TrendingUp className="w-6 h-6" /></div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex items-center justify-between hover:shadow-lg transition-all duration-300">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contas a Pagar Hoje</p>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">R$ {totalOverdueAndDueToday.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h2>
              <p className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mt-1"><Clock className="w-3.5 h-3.5 text-amber-500" /><span>{pendingBillsCount} faturas pendentes</span></p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100"><AlertCircle className="w-6 h-6" /></div>
          </div>
          <div className="bg-blue-600 text-white p-6 rounded-xl relative overflow-hidden flex flex-col justify-between shadow-md group">
            <div className="relative z-10">
              <p className="text-[10px] uppercase font-extrabold tracking-widest text-blue-200">Acao Administrativa</p>
              <h4 className="font-bold text-base mt-1">Faturamento e Lancamento</h4>
            </div>
            <div className="mt-4 relative z-10 flex items-center justify-between">
              <button onClick={() => setIsAddModalOpen(true)} className="bg-white text-blue-600 hover:bg-slate-50 font-bold text-xs py-2.5 px-4 rounded-lg shadow-md active:scale-95 transition-all flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" /> Lancar Despesa
              </button>
              <p className="text-[11px] text-white/80 italic">Atalho para nova fatura</p>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Gastos por Categoria</h3>
                <p className="text-xs text-slate-500">Proporcao total desta competencia</p>
              </div>
            </div>
            <div className="flex-1"><DonutChart expenses={expenses} /></div>
          </div>
          <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Evolucao de Gastos</h3>
                <p className="text-xs text-slate-500">Despesas consolidadas dos ultimos 6 meses</p>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">Ultimos 6 meses</span>
            </div>
            <div className="flex-1"><BarChart expenses={expenses} /></div>
          </div>
        </section>

        {/* Table */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 bg-slate-50/50">
            <div>
              <h3 className="font-bold text-base text-slate-900">Rastreamento de Despesas</h3>
              <p className="text-xs text-slate-500">Controle administrativo e prazos contratuais</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-transparent border-none text-slate-800 focus:outline-none focus:ring-0 cursor-pointer py-0 font-bold">
                  <option value="Todos">Status (Todos)</option>
                  <option value="Pago">Pago</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Vencido">Vencido</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-transparent border-none text-slate-800 focus:outline-none focus:ring-0 cursor-pointer py-0 font-bold">
                  <option value="Todos">Categoria (Todas)</option>
                  <option value="Folha">Folha</option>
                  <option value="Aluguel">Aluguel</option>
                  <option value="Insumos">Insumos</option>
                  <option value="Energia">Energia</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Seguros">Seguros</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <button onClick={handleExportData} className="flex items-center gap-1.5 font-bold text-xs text-slate-700 hover:text-blue-600 px-3 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-all shadow-sm shrink-0">
                <Download className="w-3.5 h-3.5" /> Exportar JSON
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 font-bold text-xs text-slate-500">
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Fornecedor</th>
                  <th className="px-6 py-4">Vencimento</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredExpenses.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Nenhuma despesa correspondente aos filtros.</td></tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <motion.tr layoutId={exp.id} key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 font-semibold text-slate-800">
                          <span className={`w-1.5 h-1.5 rounded-full ${exp.category === "Folha" ? "bg-[#004ac6]" : exp.category === "Insumos" ? "bg-[#ba1a1a]" : exp.category === "Aluguel" ? "bg-[#9aa5ce]" : exp.category === "Energia" ? "bg-[#059669]" : "bg-slate-400"}`} />
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">{exp.provider}</td>
                      <td className="px-6 py-4 text-slate-600">{new Date(exp.dueDate + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 text-base">R$ {exp.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold leading-5 ${exp.status === "Pago" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : exp.status === "Vencido" ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>{exp.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedExpense(exp)} className="p-2 hover:bg-slate-200/60 rounded-full text-slate-500 hover:text-blue-600 transition-all" title="Ver Fatura"><Eye className="w-4 h-4" /></button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Exibindo {filteredExpenses.length} de {expenses.length} contas lancadas.</span>
            <button onClick={() => { setExpenses(INITIAL_EXPENSES); setCategoryFilter("Todos"); setStatusFilter("Todos"); setSearchQuery(""); }} className="flex items-center gap-1.5 text-blue-600 hover:underline font-bold">
              <RefreshCw className="w-3.5 h-3.5" /> Restaurar Dados
            </button>
          </div>
        </section>
      </div>

      <AddExpenseModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddExpense} />
      {selectedExpense && <ViewExpenseModal expense={selectedExpense} onClose={() => setSelectedExpense(null)} onStatusToggle={handleToggleExpenseStatus} onDelete={handleDeleteExpense} />}
    </MainLayout>
  );
}
