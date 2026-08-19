import { useState, useEffect, useCallback } from "react";
import { BarChart3, Download, Calendar } from "lucide-react";
import { MainLayout } from "../../components/MainLayout";
import { financialApi, DREResult } from "../../services/financial";

export default function DRE() {
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0"),
  );
  const [selectedYear, setSelectedYear] = useState(
    String(new Date().getFullYear()),
  );
  const [dre, setDre] = useState<DREResult | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDRE = useCallback(async () => {
    setLoading(true);
    try {
      const data = await financialApi.getDRE(
        parseInt(selectedYear),
        parseInt(selectedMonth),
      );
      setDre(data);
    } catch {
      setDre(null);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadDRE();
  }, [loadDRE]);

  const fmt = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const handleExportCSV = () => {
    if (!dre) return;
    const rows = [
      [
        "Demonstrativo do Resultado do Exercício (DRE)",
        `Referência: ${selectedYear}/${selectedMonth}`,
      ],
      [],
      ["Conta Contábil / Indicador", "Valor Realizado (R$)"],
      ["1. RECEITA OPERACIONAL BRUTA", dre.receitaBruta.toFixed(2)],
      ["(-) Glosas", `-${dre.deductions.glosas.toFixed(2)}`],
      ["(-) Descontos", `-${dre.deductions.descontos.toFixed(2)}`],
      ["(-) Cancelamentos", `-${dre.deductions.cancelamentos.toFixed(2)}`],
      ["RECEITA LÍQUIDA", dre.receitaLiquida.toFixed(2)],
      [
        "(-) Custos Assistenciais (Repasses)",
        `-${dre.custosAssistenciais.toFixed(2)}`,
      ],
      ["LUCRO BRUTO OPERACIONAL", dre.lucroBruto.toFixed(2)],
      ["(-) Despesas Operacionais", `-${dre.despesasOperacionais.toFixed(2)}`],
      ["EBITDA", dre.ebitda.toFixed(2)],
      ["(-) Impostos (ISS + DAS)", `-${dre.impostos.total.toFixed(2)}`],
      ["RESULTADO LÍQUIDO", dre.resultadoLiquido.toFixed(2)],
      ["MARGEM LÍQUIDA (%)", `${dre.margemLiquida.toFixed(2)}%`],
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((r) => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DRE_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                DRE — Demonstrativo de Resultado
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Visão mensal do resultado financeiro
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="01">Janeiro</option>
                <option value="02">Fevereiro</option>
                <option value="03">Março</option>
                <option value="04">Abril</option>
                <option value="05">Maio</option>
                <option value="06">Junho</option>
                <option value="07">Julho</option>
                <option value="08">Agosto</option>
                <option value="09">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
            <button
              onClick={handleExportCSV}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {!dre ? (
          <div className="text-center py-12 text-slate-400">
            Nenhum dado para este período
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-3 font-bold">
                    Conta Contábil / Indicador
                  </th>
                  <th className="px-6 py-3 font-bold text-right">
                    Valor Realizado (R$)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <tr className="bg-blue-50/50">
                  <td className="px-6 py-3 font-bold text-blue-900">
                    1. RECEITA OPERACIONAL BRUTA
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-blue-900 font-mono">
                    {fmt(dre.receitaBruta)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2.5 text-slate-600 pl-10">
                    (-) Glosas
                  </td>
                  <td className="px-6 py-2.5 text-right text-rose-600 font-mono">
                    - {fmt(dre.deductions.glosas)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2.5 text-slate-600 pl-10">
                    (-) Descontos
                  </td>
                  <td className="px-6 py-2.5 text-right text-rose-600 font-mono">
                    - {fmt(dre.deductions.descontos)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2.5 text-slate-600 pl-10">
                    (-) Cancelamentos
                  </td>
                  <td className="px-6 py-2.5 text-right text-rose-600 font-mono">
                    - {fmt(dre.deductions.cancelamentos)}
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="px-6 py-3 font-bold text-slate-900">
                    RECEITA LÍQUIDA
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-slate-900 font-mono">
                    {fmt(dre.receitaLiquida)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2.5 text-slate-600 pl-10">
                    (-) Custos Assistenciais (Repasses Médicos)
                  </td>
                  <td className="px-6 py-2.5 text-right text-rose-600 font-mono">
                    - {fmt(dre.custosAssistenciais)}
                  </td>
                </tr>
                <tr className="bg-emerald-50/50">
                  <td className="px-6 py-3 font-bold text-emerald-900">
                    LUCRO BRUTO
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-emerald-900 font-mono">
                    {fmt(dre.lucroBruto)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2.5 text-slate-600 pl-10">
                    (-) Despesas Operacionais
                  </td>
                  <td className="px-6 py-2.5 text-right text-rose-600 font-mono">
                    - {fmt(dre.despesasOperacionais)}
                  </td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="px-6 py-3 font-bold text-slate-900">EBITDA</td>
                  <td className="px-6 py-3 text-right font-bold text-slate-900 font-mono">
                    {fmt(dre.ebitda)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2.5 text-slate-600 pl-10">(-) ISS</td>
                  <td className="px-6 py-2.5 text-right text-rose-600 font-mono">
                    - {fmt(dre.impostos.iss)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-2.5 text-slate-600 pl-10">(-) DAS</td>
                  <td className="px-6 py-2.5 text-right text-rose-600 font-mono">
                    - {fmt(dre.impostos.das)}
                  </td>
                </tr>
                <tr
                  className={`${dre.resultadoLiquido >= 0 ? "bg-emerald-50" : "bg-rose-50"}`}
                >
                  <td className="px-6 py-4 font-extrabold text-lg text-slate-900">
                    RESULTADO LÍQUIDO
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-extrabold text-lg font-mono ${dre.resultadoLiquido >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                  >
                    {fmt(dre.resultadoLiquido)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-bold text-slate-700">
                    MARGEM LÍQUIDA
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-slate-700 font-mono">
                    {dre.margemLiquida.toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
