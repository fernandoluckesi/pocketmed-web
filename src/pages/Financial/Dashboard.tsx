import { useState, useEffect, useCallback } from "react";
import {
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Filter,
  Download,
  BrainCircuit,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { MainLayout } from "../../components/MainLayout";
import { api } from "../../services/api";

interface KPIs {
  faturamento: number;
  lucro: number;
  ticketMedio: number;
  inadimplencia: number;
  crescimento: number;
  totalRevenues: number;
  totalDespesas: number;
}

interface SpecialtyData {
  specialty: string;
  total: number;
  count: number;
}

interface RevenueTransaction {
  id: string;
  procedure: string;
  specialty: string;
  grossValue: number;
  netValue: number;
  status: string;
  paymentMethod: string;
  dueDate: string;
  patientId: string | null;
  doctorId: string | null;
  createdAt: string;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
  return `R$ ${value.toFixed(2)}`;
}

export default function FinancialDashboard() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [specialties, setSpecialties] = useState<SpecialtyData[]>([]);
  const [transactions, setTransactions] = useState<RevenueTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [kpiData, specData, txData] = await Promise.all([
        api("/financial/dashboard-kpis").catch(() => null),
        api("/financial/revenue-by-specialty").catch(() => []),
        api("/financial/recent-transactions?limit=10").catch(() => []),
      ]);
      if (kpiData) setKpis(kpiData);
      setSpecialties(Array.isArray(specData) ? specData : []);
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Procedimento,Especialidade,Valor,Status,Data"].join(",") +
      "\n" +
      transactions.map((t) => `${t.procedure},${t.specialty},R$ ${Number(t.netValue).toFixed(2)},${t.status},${t.dueDate}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transacoes_pocketmed.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSpecialtyRevenue = specialties.reduce((s, sp) => s + sp.total, 0);
  const topSpecialty = specialties.length > 0 ? specialties.sort((a, b) => b.total - a.total)[0] : null;
  const topPercent = topSpecialty && totalSpecialtyRevenue > 0 ? Math.round((topSpecialty.total / totalSpecialtyRevenue) * 100) : 0;

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
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Faturamento</span>
              <span className="text-blue-600 bg-blue-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{formatCurrency(kpis?.faturamento || 0)}</h3>
            <div className="flex items-center gap-1 mt-1 text-slate-500">
              <span className="text-[10px] font-bold">{kpis?.totalRevenues || 0} lançamentos</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lucro Líquido</span>
              <span className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <PiggyBank className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{formatCurrency(kpis?.lucro || 0)}</h3>
            <div className={`flex items-center gap-1 mt-1 ${(kpis?.lucro || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {(kpis?.lucro || 0) >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-bold">Rec - Desp</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Despesas</span>
              <span className="text-slate-600 bg-slate-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{formatCurrency(kpis?.totalDespesas || 0)}</h3>
            <div className="flex items-center gap-1 mt-1 text-slate-500">
              <span className="text-[10px] font-bold">Este mês</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ticket Médio</span>
              <span className="text-blue-600 bg-blue-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">R$ {(kpis?.ticketMedio || 0).toFixed(0)}</h3>
            <div className="flex items-center gap-1 mt-1 text-slate-500">
              <span className="text-[10px] font-bold">Por atendimento</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Inadimplência</span>
              <span className="text-rose-600 bg-rose-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{(kpis?.inadimplencia || 0).toFixed(1)}%</h3>
            <div className="flex items-center gap-1 mt-1 text-rose-600">
              <span className="text-[10px] font-bold">Pendentes vencidos</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Crescimento</span>
              <span className="text-indigo-600 bg-indigo-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{(kpis?.crescimento || 0) >= 0 ? '+' : ''}{(kpis?.crescimento || 0).toFixed(1)}%</h3>
            <div className={`flex items-center gap-1 mt-1 ${(kpis?.crescimento || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span className="text-[10px] font-bold">vs mês anterior</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Revenue by Specialty */}
          <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 leading-none">Receita por Especialidade</h2>
            {specialties.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Nenhum dado disponível</p>
            ) : (
              <>
                <div className="flex items-center justify-center py-4">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0" viewBox="0 0 36 36">
                      <circle className="stroke-slate-100" cx="18" cy="18" r="16" fill="none" strokeWidth="3" />
                      <circle className="stroke-blue-600" cx="18" cy="18" r="16" fill="none" strokeWidth="3.5" strokeDasharray={`${topPercent} ${100 - topPercent}`} strokeDashoffset="0" />
                    </svg>
                    <div className="text-center">
                      <span className="text-2xl font-extrabold text-slate-900 tracking-tight block">{topPercent}%</span>
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-tight">{topSpecialty?.specialty?.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  {specialties.slice(0, 5).map((sp, idx) => {
                    const colors = ['bg-blue-600', 'bg-blue-400', 'bg-slate-400', 'bg-emerald-400', 'bg-amber-400'];
                    return (
                      <div key={sp.specialty} className="flex justify-between items-center py-1 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${colors[idx % colors.length]}`}></div>
                          <span className="text-xs font-medium text-slate-600">{sp.specialty}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-900 font-mono">R$ {sp.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* AI Insights */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
            <div className="bg-slate-950 text-white p-6 rounded-xl relative overflow-hidden group shadow-lg border border-slate-800">
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-600/25 rounded-full blur-2xl group-hover:bg-blue-600/35 transition-all duration-500"></div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <BrainCircuit className="w-5 h-5 text-blue-400 animate-pulse" />
                <h2 className="text-md font-bold text-white tracking-tight">PocketIA Insights</h2>
              </div>
              <div className="flex flex-col gap-3 relative z-10">
                <div className="p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all cursor-pointer group/card text-left">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-200 group-hover/card:text-blue-300 transition-colors">Resumo do Mês</span>
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">{formatCurrency(kpis?.faturamento || 0)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Faturamento de {formatCurrency(kpis?.faturamento || 0)} com despesas de {formatCurrency(kpis?.totalDespesas || 0)}. Resultado: {formatCurrency(kpis?.lucro || 0)}.
                  </p>
                </div>
                <div className="p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all cursor-pointer group/card text-left">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-200 group-hover/card:text-blue-300 transition-colors">Inadimplência</span>
                    <span className="text-[10px] font-bold text-rose-400 font-mono">{(kpis?.inadimplencia || 0).toFixed(1)}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    {(kpis?.inadimplencia || 0) > 5
                      ? 'Atenção: inadimplência acima de 5%. Considere revisar políticas de cobrança.'
                      : 'Inadimplência sob controle. Continue acompanhando.'}
                  </p>
                </div>
                <div className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all cursor-pointer flex items-center justify-between mt-1 shadow-sm font-semibold text-xs active:scale-95">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 fill-white/10" />
                    <span>Ver relatórios detalhados</span>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b border-slate-200">
            <div>
              <h2 className="text-md font-bold text-slate-950 tracking-tight leading-none">Transações Recentes</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Últimos lançamentos financeiros</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer active:scale-95 transition-all">
                <Filter className="w-3.5 h-3.5" />
                <span>Filtrar</span>
              </button>
              <button
                onClick={handleExport}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-3 font-bold">Procedimento</th>
                  <th className="px-6 py-3 font-bold">Especialidade</th>
                  <th className="px-6 py-3 font-bold">Pagamento</th>
                  <th className="px-6 py-3 font-bold text-right">Valor</th>
                  <th className="px-6 py-3 font-bold text-center">Status</th>
                  <th className="px-6 py-3 font-bold">Vencimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="font-medium">Nenhuma transação registrada</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => {
                    const statusMap: Record<string, { label: string; classes: string }> = {
                      PAGO: { label: 'Pago', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                      RECEBIDO: { label: 'Recebido', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                      PENDENTE: { label: 'Pendente', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
                      VENCIDO: { label: 'Vencido', classes: 'bg-rose-100 text-rose-700 border-rose-200' },
                      GLOSADO: { label: 'Glosado', classes: 'bg-rose-100 text-rose-700 border-rose-200' },
                      CANCELADO: { label: 'Cancelado', classes: 'bg-slate-100 text-slate-500 border-slate-200' },
                    };
                    const statusInfo = statusMap[t.status] || { label: t.status, classes: 'bg-slate-100 text-slate-600 border-slate-200' };

                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors duration-150 group">
                        <td className="px-6 py-3.5">
                          <span className="font-bold text-slate-900">{t.procedure}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200/20 text-on-surface-variant rounded-full text-[11px] font-bold">
                            {t.specialty}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 font-medium text-slate-600">{t.paymentMethod}</td>
                        <td className="px-6 py-3.5 text-right font-semibold text-slate-900 font-mono">
                          R$ {Number(t.netValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] border ${statusInfo.classes}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600 font-medium">
                          {new Date(t.dueDate).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {transactions.length > 0 && (
            <div className="p-3.5 flex justify-center bg-slate-50 border-t border-slate-100">
              <span className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer">
                Ver todo o histórico de receitas
              </span>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
