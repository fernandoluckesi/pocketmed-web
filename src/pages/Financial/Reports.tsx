import { useState, useEffect, useCallback } from "react";
import { FileText, TrendingUp, AlertTriangle, ShieldAlert, Award, TrendingDown } from "lucide-react";
import { MainLayout } from "../../components/MainLayout";
import {
  financialApi,
  type FinancialHighlights,
  type RevenueReport,
  type GlosaReport,
  type ExpensesByCostCenterReport,
  type ProductivityReport,
} from "../../services/financial";

const MONTH_OPTIONS = [
  { value: "01", label: "Janeiro" },
  { value: "02", label: "Fevereiro" },
  { value: "03", label: "Março" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Maio" },
  { value: "06", label: "Junho" },
  { value: "07", label: "Julho" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
];

function currency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0"),
  );
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(true);
  const [highlights, setHighlights] = useState<FinancialHighlights | null>(null);
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [glosaReport, setGlosaReport] = useState<GlosaReport | null>(null);
  const [expensesReport, setExpensesReport] = useState<ExpensesByCostCenterReport | null>(null);
  const [productivityReport, setProductivityReport] = useState<ProductivityReport | null>(null);
  const [doctorNames, setDoctorNames] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const year = parseInt(selectedYear, 10);
      const month = parseInt(selectedMonth, 10);
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const endDate = `${selectedYear}-${selectedMonth}-${String(lastDayOfMonth(year, month)).padStart(2, "0")}`;

      const [highlightsData, revenueData, glosaData, expensesData, productivityData, doctors] =
        await Promise.all([
          financialApi.getDashboardHighlights(year, month).catch(() => null),
          financialApi.getRevenueReport(startDate, endDate).catch(() => null),
          financialApi.getGlosaReport(startDate, endDate).catch(() => null),
          financialApi.getExpensesByCostCenterReport(startDate, endDate).catch(() => null),
          financialApi.getProductivityReport(startDate, endDate).catch(() => null),
          financialApi.listClinicDoctors().catch(() => []),
        ]);

      setHighlights(highlightsData);
      setRevenueReport(revenueData);
      setGlosaReport(glosaData);
      setExpensesReport(expensesData);
      setProductivityReport(productivityData);
      setDoctorNames(
        Object.fromEntries((Array.isArray(doctors) ? doctors : []).map((d) => [d.id, d.name])),
      );
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const nivelBadge: Record<string, string> = {
    baixo: "bg-emerald-50 text-emerald-700 border-emerald-100",
    medio: "bg-amber-100 text-amber-700 border-amber-200",
    alto: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                Relatório Financeiro
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Destaques do mês, produtividade, glosas e despesas por centro de custo
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-hidden"
            >
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-hidden"
            >
              {[0, 1, 2].map((offset) => {
                const y = new Date().getFullYear() - offset;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Destaques do Mês */}
            {highlights && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Resumo Financeiro</span>
                  </div>
                  <p className="text-xl font-extrabold text-slate-900">
                    {currency(highlights.resumoFinanceiro.faturamento)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Lucro: {currency(highlights.resumoFinanceiro.lucro)} ·{" "}
                    <span
                      className={
                        highlights.resumoFinanceiro.crescimentoPercentual >= 0
                          ? "text-emerald-600 font-bold"
                          : "text-rose-600 font-bold"
                      }
                    >
                      {highlights.resumoFinanceiro.crescimentoPercentual >= 0 ? "+" : ""}
                      {highlights.resumoFinanceiro.crescimentoPercentual.toFixed(1)}%
                    </span>{" "}
                    vs. mês anterior
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Risco de Inadimplência</span>
                  </div>
                  <p className="text-xl font-extrabold text-slate-900">
                    {highlights.riscoInadimplencia.percentual.toFixed(1)}%
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${nivelBadge[highlights.riscoInadimplencia.nivel]}`}
                    >
                      {highlights.riscoInadimplencia.nivel.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500">
                      {currency(highlights.riscoInadimplencia.valorVencido)} em atraso
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Convênio com Mais Glosa</span>
                  </div>
                  {highlights.convenioComMaisGlosa ? (
                    <>
                      <p className="text-xl font-extrabold text-slate-900">
                        {highlights.convenioComMaisGlosa.nome}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {currency(highlights.convenioComMaisGlosa.valorGlosado)} (
                        {highlights.convenioComMaisGlosa.percentualDaReceita.toFixed(1)}% da receita)
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400 mt-2">Nenhuma glosa registrada neste período.</p>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <Award className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Médico Mais Produtivo</span>
                  </div>
                  {highlights.medicoMaisProdutivo ? (
                    <>
                      <p className="text-xl font-extrabold text-slate-900">
                        {highlights.medicoMaisProdutivo.nome}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {currency(highlights.medicoMaisProdutivo.faturamento)} em{" "}
                        {highlights.medicoMaisProdutivo.atendimentos} atendimento(s)
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400 mt-2">Sem receitas vinculadas a um médico neste período.</p>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-slate-500 mb-2">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Despesa em Alta</span>
                  </div>
                  {highlights.centroDeCustoQueMaisCresceu ? (
                    <>
                      <p className="text-xl font-extrabold text-slate-900">
                        {highlights.centroDeCustoQueMaisCresceu.nome}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {currency(highlights.centroDeCustoQueMaisCresceu.valorAtual)} (
                        <span className="text-amber-600 font-bold">
                          +{highlights.centroDeCustoQueMaisCresceu.variacaoPercentual.toFixed(1)}%
                        </span>{" "}
                        vs. mês anterior)
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-400 mt-2">Nenhum centro de custo com crescimento este mês.</p>
                  )}
                </div>
              </div>
            )}

            {/* Produtividade por Médico */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Produtividade por Médico</h3>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-2">Médico</th>
                    <th className="px-6 py-2 text-right">Atendimentos</th>
                    <th className="px-6 py-2 text-right">Faturamento</th>
                    <th className="px-6 py-2 text-right">Ticket Médio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {!productivityReport || productivityReport.ranking.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400">
                        Nenhuma receita paga vinculada a um médico neste período.
                      </td>
                    </tr>
                  ) : (
                    productivityReport.ranking.map((r) => (
                      <tr key={r.doctorId}>
                        <td className="px-6 py-2.5 font-bold text-slate-900">
                          {doctorNames[r.doctorId] || "Médico não identificado"}
                        </td>
                        <td className="px-6 py-2.5 text-right">{r.count}</td>
                        <td className="px-6 py-2.5 text-right font-mono">{currency(r.total)}</td>
                        <td className="px-6 py-2.5 text-right font-mono text-slate-500">
                          {currency(r.ticketMedio)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Receita por Convênio */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Receita por Convênio</h3>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                      <th className="px-6 py-2">Convênio</th>
                      <th className="px-6 py-2 text-right">Guias</th>
                      <th className="px-6 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {!revenueReport || revenueReport.byConvenio.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-slate-400">
                          Nenhuma receita neste período.
                        </td>
                      </tr>
                    ) : (
                      [...revenueReport.byConvenio]
                        .sort((a, b) => b.total - a.total)
                        .map((c) => (
                          <tr key={c.name}>
                            <td className="px-6 py-2.5 font-bold text-slate-900">{c.name}</td>
                            <td className="px-6 py-2.5 text-right">{c.count}</td>
                            <td className="px-6 py-2.5 text-right font-mono">{currency(c.total)}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Glosas por Convênio */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Glosas por Convênio</h3>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                      <th className="px-6 py-2">Convênio</th>
                      <th className="px-6 py-2 text-right">Guias</th>
                      <th className="px-6 py-2 text-right">Valor Glosado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {!glosaReport || glosaReport.byConvenio.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-8 text-slate-400">
                          Nenhuma glosa neste período.
                        </td>
                      </tr>
                    ) : (
                      [...glosaReport.byConvenio]
                        .sort((a, b) => b.totalGlosa - a.totalGlosa)
                        .map((c) => (
                          <tr key={c.name}>
                            <td className="px-6 py-2.5 font-bold text-slate-900">{c.name}</td>
                            <td className="px-6 py-2.5 text-right">{c.count}</td>
                            <td className="px-6 py-2.5 text-right font-mono text-rose-600">
                              {currency(c.totalGlosa)}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Despesas por Centro de Custo */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Despesas por Centro de Custo</h3>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                    <th className="px-6 py-2">Centro de Custo</th>
                    <th className="px-6 py-2 text-right">Lançamentos</th>
                    <th className="px-6 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {!expensesReport || expensesReport.byCostCenter.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-slate-400">
                        Nenhuma despesa neste período.
                      </td>
                    </tr>
                  ) : (
                    [...expensesReport.byCostCenter]
                      .sort((a, b) => b.total - a.total)
                      .map((c) => (
                        <tr key={c.name}>
                          <td className="px-6 py-2.5 font-bold text-slate-900">{c.name}</td>
                          <td className="px-6 py-2.5 text-right">{c.count}</td>
                          <td className="px-6 py-2.5 text-right font-mono">{currency(c.total)}</td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
