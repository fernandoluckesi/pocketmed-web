import { useState } from "react";
import {
  PiggyBank,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Filter,
  Download,
  MoreVertical,
  BrainCircuit,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { MainLayout } from "../../components/MainLayout";

interface Transaction {
  id: string;
  patient: string;
  patientInitials: string;
  procedure: string;
  doctor: string;
  value: number;
  status: "Pago" | "Pendente" | "Glosado";
  date: string;
  specialty: "Cardiologia" | "Ortopedia" | "Pediatria" | "Geral";
}

interface ProjectedMonth {
  month: string;
  revenue: number;
  expenses: number;
}

const mockTransactions: Transaction[] = [
  { id: "1", patient: "Maria Silva", patientInitials: "MS", procedure: "Consulta Cardiológica", doctor: "Dr. André Santos", value: 450, status: "Pago", date: "2026-05-20", specialty: "Cardiologia" },
  { id: "2", patient: "João Oliveira", patientInitials: "JO", procedure: "Ecocardiograma", doctor: "Dra. Beatriz Lima", value: 850, status: "Pendente", date: "2026-05-21", specialty: "Cardiologia" },
  { id: "3", patient: "Ana Costa", patientInitials: "AC", procedure: "Consulta Ortopédica", doctor: "Dr. André Santos", value: 380, status: "Pago", date: "2026-05-22", specialty: "Ortopedia" },
  { id: "4", patient: "Pedro Souza", patientInitials: "PS", procedure: "Raio-X Coluna", doctor: "Dra. Carla Vieira", value: 220, status: "Glosado", date: "2026-05-23", specialty: "Ortopedia" },
  { id: "5", patient: "Lucia Ferreira", patientInitials: "LF", procedure: "Consulta Pediátrica", doctor: "Dra. Carla Vieira", value: 350, status: "Pendente", date: "2026-05-24", specialty: "Pediatria" },
];

const mockProjectedData: ProjectedMonth[] = [
  { month: "Jan", revenue: 120000, expenses: 78000 },
  { month: "Fev", revenue: 115000, expenses: 82000 },
  { month: "Mar", revenue: 135000, expenses: 85000 },
  { month: "Abr", revenue: 128000, expenses: 80000 },
  { month: "Mai", revenue: 142000, expenses: 88000 },
  { month: "Jun", revenue: 138000, expenses: 84000 },
];

export default function FinancialDashboard() {
  const [chartMode, setChartMode] = useState<"Mensal" | "Anual">("Mensal");
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Paciente,Procedimento,Medico,Valor,Status,Data"].join(",") +
      "\n" +
      mockTransactions.map((t) => `${t.patient},${t.procedure},${t.doctor},R$ ${t.value.toFixed(2)},${t.status},${t.date}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transacoes_recentes_pocketmed.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">R$ 142.5k</h3>
            <div className="flex items-center gap-1 mt-1 text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">8.2% vs mês ant.</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lucro Líquido</span>
              <span className="text-emerald-600 bg-emerald-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <PiggyBank className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">R$ 58.2k</h3>
            <div className="flex items-center gap-1 mt-1 text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">12.4%</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">A Receber</span>
              <span className="text-slate-600 bg-slate-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">R$ 31.9k</h3>
            <div className="flex items-center gap-1 mt-1 text-blue-600">
              <span className="text-[10px] font-bold">Previsto p/ dia 15</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ticket Médio</span>
              <span className="text-blue-600 bg-blue-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">R$ 485</h3>
            <div className="flex items-center gap-1 mt-1 text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">R$ 12 incr.</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Inadimplência</span>
              <span className="text-rose-600 bg-rose-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">4.2%</h3>
            <div className="flex items-center gap-1 mt-1 text-rose-600">
              <span className="text-[10px] font-bold">0.5% instável</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Crescimento</span>
              <span className="text-indigo-600 bg-indigo-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">+18%</h3>
            <div className="flex items-center gap-1 mt-1 text-emerald-600">
              <span className="text-[10px] font-bold text-slate-500">Meta Anual 92%</span>
            </div>
          </div>
        </div>

        {/* Main Charts & AI Section */}
        <div className="grid grid-cols-12 gap-6">
          {/* Cash Flow Chart */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Fluxo de Caixa</h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">Análise mensal de Receitas vs Despesas</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                <button
                  onClick={() => setChartMode("Mensal")}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    chartMode === "Mensal" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setChartMode("Anual")}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                    chartMode === "Anual" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Anual
                </button>
              </div>
            </div>

            <div className="h-[250px] flex items-end justify-between gap-2.5 px-2 relative pt-4">
              {chartMode === "Mensal"
                ? mockProjectedData.map((data, idx) => {
                    const maxVal = Math.max(...mockProjectedData.map((d) => d.revenue));
                    const revHeight = (data.revenue / maxVal) * 100;
                    const expHeight = (data.expenses / maxVal) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        <div className="absolute bottom-[105%] bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 text-center shadow-lg whitespace-nowrap">
                          <p className="font-bold">{data.month}</p>
                          <p className="text-emerald-400 font-medium font-mono">Rec: R$ {(data.revenue / 1000).toFixed(1)}k</p>
                          <p className="text-rose-400 font-medium font-mono">Des: R$ {(data.expenses / 1000).toFixed(1)}k</p>
                        </div>
                        <div className="w-full flex gap-1.5 items-end h-[180px] bg-slate-50/50 rounded-lg p-1">
                          <div style={{ height: `${expHeight}%` }} className="flex-1 bg-blue-100 hover:bg-blue-200 rounded-t-sm transition-all duration-300"></div>
                          <div style={{ height: `${revHeight}%` }} className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-t-sm transition-all duration-300"></div>
                        </div>
                        <span className="mt-3 text-[11px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase">{data.month}</span>
                      </div>
                    );
                  })
                : ["2022", "2023", "2024", "2025", "2026"].map((year, idx) => {
                    const values = [
                      { r: 920000, e: 600000 },
                      { r: 1100000, e: 720000 },
                      { r: 1350000, e: 840000 },
                      { r: 1580000, e: 980000 },
                      { r: 1710000, e: 1040000 },
                    ];
                    const activeVal = values[idx];
                    const maxVal = 1800000;
                    const revHeight = (activeVal.r / maxVal) * 100;
                    const expHeight = (activeVal.e / maxVal) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        <div className="absolute bottom-[105%] bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 text-center shadow-lg whitespace-nowrap">
                          <p className="font-bold">{year}</p>
                          <p className="text-emerald-400 font-medium font-mono">Rec: R$ {(activeVal.r / 1000000).toFixed(2)}M</p>
                          <p className="text-rose-400 font-medium font-mono">Des: R$ {(activeVal.e / 1000000).toFixed(2)}M</p>
                        </div>
                        <div className="w-full flex gap-1.5 items-end h-[180px] bg-slate-50/50 rounded-lg p-1">
                          <div style={{ height: `${expHeight}%` }} className="flex-1 bg-blue-100 hover:bg-blue-200 rounded-t-sm transition-all duration-300"></div>
                          <div style={{ height: `${revHeight}%` }} className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-t-sm transition-all duration-300"></div>
                        </div>
                        <span className="mt-3 text-[11px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors uppercase">{year}</span>
                      </div>
                    );
                  })}
            </div>

            <div className="flex gap-6 mt-6 border-t border-slate-100 pt-4 px-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-100"></div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Despesas</span>
              </div>
            </div>
          </div>

          {/* AI Insights Sidebar */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <div className="bg-slate-950 text-white p-6 rounded-xl relative overflow-hidden group shadow-lg border border-slate-800">
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-600/25 rounded-full blur-2xl group-hover:bg-blue-600/35 transition-all duration-500"></div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <BrainCircuit className="w-5 h-5 text-blue-400 animate-pulse" />
                <h2 className="text-md font-bold text-white tracking-tight">PocketIA Insights</h2>
              </div>
              <div className="flex flex-col gap-3 relative z-10">
                <div className="p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all cursor-pointer group/card text-left">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-200 group-hover/card:text-blue-300 transition-colors">Previsão Faturamento</span>
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">+15%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">Tendência de alta para o próximo trimestre com base nas consultas cadastradas.</p>
                </div>
                <div className="p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all cursor-pointer group/card text-left">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-200 group-hover/card:text-blue-300 transition-colors">Risco de Glosa</span>
                    <span className="text-[10px] font-bold text-rose-400 font-mono">12 guias</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">Inconsistências identificadas em prontuários e guias Unimed pendentes de envio.</p>
                </div>
                <div className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all cursor-pointer flex items-center justify-between mt-1 shadow-sm font-semibold text-xs active:scale-95">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 fill-white/10" />
                    <span>Otimizar tributação?</span>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </div>
              </div>
            </div>

            {/* Revenue by Specialty Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col flex-1">
              <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 leading-none">Receita por Especialidade</h2>
              <div className="flex items-center justify-center py-2 relative">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0" viewBox="0 0 36 36">
                    <circle className="stroke-slate-100" cx="18" cy="18" r="16" fill="none" strokeWidth="3" />
                    <circle className="stroke-slate-300" cx="18" cy="18" r="16" fill="none" strokeWidth="3.5" strokeDasharray="100 100" strokeDashoffset={0} />
                    <circle className="stroke-blue-400" cx="18" cy="18" r="16" fill="none" strokeWidth="3.5" strokeDasharray="60 100" strokeDashoffset={-40} />
                    <circle className="stroke-blue-600" cx="18" cy="18" r="16" fill="none" strokeWidth="3.5" strokeDasharray="45 100" strokeDashoffset={0} />
                  </svg>
                  <div className="text-center">
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight block">45%</span>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-tight">Cardio</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                    <span className="text-xs font-medium text-slate-600">Cardiologia</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 font-mono">R$ 64.125,00</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                    <span className="text-xs font-medium text-slate-600">Ortopedia</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 font-mono">R$ 35.625,00</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                    <span className="text-xs font-medium text-slate-600">Pediatria</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 font-mono">R$ 42.750,00</span>
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
              <p className="text-[11px] text-slate-400 mt-0.5">Últimas consultas, cirurgias e exames processados</p>
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
                  <th className="px-6 py-3 font-bold">Paciente</th>
                  <th className="px-6 py-3 font-bold">Procedimento</th>
                  <th className="px-6 py-3 font-bold">Médico</th>
                  <th className="px-6 py-3 font-bold text-right">Valor</th>
                  <th className="px-6 py-3 font-bold text-center">Status</th>
                  <th className="px-6 py-3 font-bold text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {mockTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors duration-150 group">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold relative shrink-0 ${
                            t.status === "Pago"
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : t.status === "Pendente"
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                        >
                          {t.patientInitials}
                        </div>
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{t.patient}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-600">{t.procedure}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-600">{t.doctor}</td>
                    <td className="px-6 py-3.5 text-right font-semibold text-slate-900 font-mono">R$ {t.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          t.status === "Pago"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : t.status === "Pendente"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-rose-100 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center relative">
                      <button
                        onClick={() => setSelectedTransactionId(selectedTransactionId === t.id ? null : t.id)}
                        className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {selectedTransactionId === t.id && (
                        <div className="absolute right-6 mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-30 text-left">
                          <div className="px-2 py-1 text-[9px] font-extrabold uppercase text-slate-400">Girar Status</div>
                          {(["Pago", "Pendente", "Glosado"] as const).map((stat) => (
                            <button
                              key={stat}
                              onClick={() => setSelectedTransactionId(null)}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 text-slate-700 hover:text-slate-950 font-medium cursor-pointer"
                            >
                              Setar {stat}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 flex justify-center bg-slate-50 border-t border-slate-100">
            <span className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer">
              Ver todo o histórico de receitas
            </span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
