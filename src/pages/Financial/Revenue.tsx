import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { MainLayout } from "../../components/MainLayout";
import { financialApi, Revenue as RevenueType } from "../../services/financial";

export default function Revenue() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [revenues, setRevenues] = useState<RevenueType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");

  // Form state
  const [procedure, setProcedure] = useState("");
  const [specialty, setSpecialty] = useState("Cardiologia");
  const [grossValue, setGrossValue] = useState("");
  const [status, setStatus] = useState("PENDENTE");
  const [paymentMethod, setPaymentMethod] = useState("Particular");
  const [dueDate, setDueDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const loadRevenues = useCallback(async () => {
    try {
      const filters: Record<string, string> = {};
      if (filterStatus !== "Todos") filters.status = filterStatus;
      const result = await financialApi.listRevenues(filters);
      setRevenues(result.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    loadRevenues();
  }, [loadRevenues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedure || !grossValue) return;
    try {
      await financialApi.createRevenue({
        procedure,
        specialty,
        grossValue: parseFloat(grossValue),
        discountValue: 0,
        netValue: parseFloat(grossValue),
        paymentMethod,
        status,
        dueDate,
      });
      setProcedure("");
      setGrossValue("");
      setShowAddForm(false);
      loadRevenues();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await financialApi.deleteRevenue(id);
      loadRevenues();
    } catch {
      alert("Apenas receitas pendentes podem ser excluídas.");
    }
  };

  const filtered = revenues.filter((t) => {
    const matchesSearch =
      (t.procedure || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.specialty || "").toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const totalFilteredValue = filtered.reduce(
    (acc, t) => acc + (Number(t.netValue) || 0),
    0,
  );

  const statusMap: Record<string, { label: string; classes: string }> = {
    PAGO: {
      label: "Pago",
      classes: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    RECEBIDO: {
      label: "Recebido",
      classes: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    PENDENTE: {
      label: "Pendente",
      classes: "bg-amber-100 text-amber-700 border border-amber-200",
    },
    VENCIDO: {
      label: "Vencido",
      classes: "bg-rose-100 text-rose-700 border border-rose-200",
    },
    GLOSADO: {
      label: "Glosado",
      classes: "bg-rose-100 text-rose-700 border border-rose-200",
    },
    CANCELADO: {
      label: "Cancelado",
      classes: "bg-slate-100 text-slate-500 border border-slate-200",
    },
    FATURADO: {
      label: "Faturado",
      classes: "bg-blue-50 text-blue-700 border border-blue-100",
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
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
              Receitas Médicas
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Controle de faturamento, guias de convênios e pagamentos
              particulares
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Faturar Guia / Consulta</span>
          </button>
        </div>

        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm flex flex-col gap-4"
          >
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Inserir Nova Guia / Lançamento Financeiro
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Procedimento
                </label>
                <input
                  type="text"
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="Consulta, Ecocardiograma..."
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Especialidade
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Cardiologia">Cardiologia</option>
                  <option value="Ortopedia">Ortopedia</option>
                  <option value="Pediatria">Pediatria</option>
                  <option value="Clínica Geral">Clínica Geral</option>
                  <option value="Dermatologia">Dermatologia</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={grossValue}
                  onChange={(e) => setGrossValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-mono"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="Particular">Particular</option>
                  <option value="Convênio">Convênio</option>
                  <option value="Cartão Crédito">Cartão Crédito</option>
                  <option value="Cartão Débito">Cartão Débito</option>
                  <option value="PIX">PIX</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Vencimento
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="PENDENTE">Pendente</option>
                  <option value="PAGO">Pago</option>
                  <option value="FATURADO">Faturado</option>
                </select>
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
                className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                Confirmar Lançamento
              </button>
            </div>
          </form>
        )}

        {/* Filter Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-slate-200 rounded-xl p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              placeholder="Filtrar por procedimento ou especialidade"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="Todos">Status: Todos</option>
              <option value="PAGO">Pago</option>
              <option value="PENDENTE">Pendente</option>
              <option value="GLOSADO">Glosado</option>
              <option value="VENCIDO">Vencido</option>
              <option value="FATURADO">Faturado</option>
            </select>
          </div>
          <div className="flex items-center justify-end px-2">
            <span className="text-[11px] font-bold text-slate-500">
              Total:{" "}
              <strong className="text-blue-600">
                R${" "}
                {totalFilteredValue.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-3 font-bold">Procedimento</th>
                  <th className="px-6 py-3 font-bold">Especialidade</th>
                  <th className="px-6 py-3 font-bold">Pagamento</th>
                  <th className="px-6 py-3 font-bold text-right">Valor</th>
                  <th className="px-6 py-3 font-bold text-center">Status</th>
                  <th className="px-6 py-3 font-bold">Vencimento</th>
                  <th className="px-6 py-3 font-bold text-center">Excluir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-slate-400"
                    >
                      Nenhuma receita registrada
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => {
                    const info = statusMap[t.status] || {
                      label: t.status,
                      classes:
                        "bg-slate-100 text-slate-600 border border-slate-200",
                    };
                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-3.5 font-bold text-slate-900">
                          {t.procedure}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200/20 text-on-surface-variant rounded-full text-[11px] font-bold">
                            {t.specialty}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-medium text-slate-600">
                          {t.paymentMethod}
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold text-slate-900 font-mono">
                          R${" "}
                          {Number(t.netValue).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${info.classes}`}
                          >
                            {info.label}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600 font-medium">
                          {new Date(t.dueDate).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-md transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
