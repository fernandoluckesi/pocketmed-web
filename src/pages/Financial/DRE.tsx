import { useState } from "react";
import { BarChart3, Download, Calendar } from "lucide-react";
import { MainLayout } from "../../components/MainLayout";

export default function DRE() {
  const [selectedMonth, setSelectedMonth] = useState("05");

  // Mock DRE values
  const billingGross = 142500;
  const taxesRate = 0.08;
  const taxesTotal = billingGross * taxesRate;
  const netRevenue = billingGross - taxesTotal;
  const physicianPayouts = 82650;
  const grossProfit = netRevenue - physicianPayouts;
  const operativeExpenses = 24500;
  const ebitda = grossProfit - operativeExpenses;
  const depreciation = 1500;
  const netProfit = ebitda - depreciation;
  const netMargin = billingGross > 0 ? (netProfit / billingGross) * 100 : 0;

  const handleExportCSV = () => {
    const rows = [
      ["Demostrativo do Resultado do Exercício (DRE)", `Referência: 2026/${selectedMonth}`],
      [],
      ["Conta Contábil / Indicador", "Valor Realizado (R$)"],
      ["1. RECEITA OPERACIONAL BRUTA", billingGross.toFixed(2)],
      ["(-) Deduções Tributárias (8% ISS/DAS)", `-${taxesTotal.toFixed(2)}`],
      ["RECEITA LIQUIDA", netRevenue.toFixed(2)],
      ["(-) Repasse dos Profissionais Médicos", `-${physicianPayouts.toFixed(2)}`],
      ["LUCRO BRUTO OPERACIONAL", grossProfit.toFixed(2)],
      ["(-) Despesas Operacionais", `-${operativeExpenses.toFixed(2)}`],
      ["EBITDA", ebitda.toFixed(2)],
      ["(-) Depreciação", `-${depreciation.toFixed(2)}`],
      ["RESULTADO LIQUIDO", netProfit.toFixed(2)],
      ["MARGEM LIQUIDA (%)", `${netMargin.toFixed(2)}%`],
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((r) => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DRE_PocketMed_2026_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Demonstrativo de Resultado (DRE)</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Relatório de lucratividade mensal consolidado, deduções de impostos e margem líquida</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Planilha DRE</span>
          </button>
        </div>

        {/* DRE Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              DRE Competência Mensal
            </span>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white border border-slate-200 rounded-md py-1 px-2 text-[11px] font-bold text-slate-600 focus:outline-hidden"
              >
                <option value="05">Maio / 2026 (Atual)</option>
                <option value="04">Abril / 2026</option>
                <option value="03">Março / 2026</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 font-medium text-xs text-slate-700">
            <div className="flex justify-between items-center px-6 py-4 hover:bg-slate-50/50 transition-colors">
              <span className="font-extrabold text-slate-900">1. RECEITA OPERACIONAL BRUTA</span>
              <span className="font-extrabold text-slate-950 font-mono">R$ {billingGross.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
              <span className="text-slate-500 pl-4">(-) Deduções de Impostos (8% ISS/DAS)</span>
              <span className="text-rose-600 font-bold font-mono">- R$ {taxesTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-4 bg-slate-50/40 hover:bg-slate-50 transition-colors">
              <span className="font-bold text-slate-900 border-l-2 border-blue-600 pl-3">(=) RECEITA OPERACIONAL LÍQUIDA</span>
              <span className="font-extrabold text-slate-900 font-mono">R$ {netRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
              <span className="text-slate-500 pl-4">(-) Custos Assistenciais (Repasse de Médicos)</span>
              <span className="text-rose-600 font-bold font-mono">- R$ {physicianPayouts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-4 bg-slate-50/40 hover:bg-slate-50 transition-colors">
              <span className="font-bold text-slate-950">(=) LUCRO BRUTO DE EXERCÍCIO</span>
              <span className="font-extrabold text-slate-950 font-mono">R$ {grossProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
              <span className="text-slate-500 pl-4">(-) Despesas Administrativas e Infraestrutura</span>
              <span className="text-rose-600 font-bold font-mono">- R$ {operativeExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-4 bg-slate-50/70 hover:bg-slate-50 transition-colors">
              <span className="font-extrabold text-blue-700">(=) EBITDA OPERACIONAL DA UNIDADE</span>
              <span className="font-extrabold text-blue-700 font-mono text-sm">R$ {ebitda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
              <span className="text-slate-400 pl-4">(-) Depreciação de Equipamentos Médicos</span>
              <span className="text-rose-600 font-semibold font-mono">- R$ {depreciation.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-blue-50/50 to-white hover:bg-slate-50 transition-colors text-sm">
              <span className="font-extrabold text-slate-950 uppercase">(=) Resultado Líquido de Referência</span>
              <span className="font-black text-blue-600 font-mono text-base">R$ {netProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-4 hover:bg-slate-50/50 transition-colors">
              <span className="text-[11px] uppercase font-bold text-slate-400">Margem Líquida Comercial (%)</span>
              <span className="font-extrabold text-emerald-600 font-mono text-sm bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">{netMargin.toFixed(1)}% de Margem</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
