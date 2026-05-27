import { useState } from "react";
import { Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { MainLayout } from "../../components/MainLayout";

interface ProjectedMonth {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

const mockProjectedData: ProjectedMonth[] = [
  { month: "Jan", revenue: 120000, expenses: 78000, profit: 42000 },
  { month: "Fev", revenue: 115000, expenses: 82000, profit: 33000 },
  { month: "Mar", revenue: 135000, expenses: 85000, profit: 50000 },
  { month: "Abr", revenue: 128000, expenses: 80000, profit: 48000 },
  { month: "Mai", revenue: 142000, expenses: 88000, profit: 54000 },
  { month: "Jun", revenue: 138000, expenses: 84000, profit: 54000 },
];

export default function CashFlow() {
  const [revenueMultiplier, setRevenueMultiplier] = useState(1.0);
  const [expenseMultiplier, setExpenseMultiplier] = useState(1.0);

  const simulatedData = mockProjectedData.map((m) => {
    const simulatedRevenue = m.revenue * revenueMultiplier;
    const simulatedExpenses = m.expenses * expenseMultiplier;
    return {
      ...m,
      simulatedRevenue,
      simulatedExpenses,
      simulatedProfit: simulatedRevenue - simulatedExpenses,
    };
  });

  const baseProfitTotal = mockProjectedData.reduce((acc, m) => acc + m.profit, 0);
  const simulatedProfitTotal = simulatedData.reduce((acc, m) => acc + m.simulatedProfit, 0);
  const percentageGain = ((simulatedProfitTotal - baseProfitTotal) / baseProfitTotal) * 100;

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        {/* Header Panel */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Fluxo de Caixa & Projeções</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Análise e simulação de lucros com base em taxas tributárias, atendimentos e repasses</p>
          </div>
        </div>

        {/* Simulator Control Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-5 lg:col-span-1">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 leading-none">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Simulador Preditivo
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Ajuste os parâmetros abaixo para projetar cenários financeiros alternativos.</p>
            </div>

            <div className="mt-2 flex flex-col gap-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-bold">
                  <span className="text-slate-600">Volume de Atendimento</span>
                  <span className="text-blue-600">{(revenueMultiplier * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.5"
                  step="0.05"
                  value={revenueMultiplier}
                  onChange={(e) => setRevenueMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 h-1 bg-slate-100 rounded-lg cursor-pointer"
                />
                <span className="text-[9px] text-slate-400 mt-0.5 justify-between flex">
                  <span>-20% de queda</span>
                  <span>Padrão (100%)</span>
                  <span>+50% de alta</span>
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1 font-bold">
                  <span className="text-slate-600">Custos Operacionais</span>
                  <span className="text-rose-600">{(expenseMultiplier * 150 - 150).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.05"
                  value={expenseMultiplier}
                  onChange={(e) => setExpenseMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-rose-600 h-1 bg-slate-100 rounded-lg cursor-pointer"
                />
                <span className="text-[9px] text-slate-400 mt-0.5 justify-between flex">
                  <span>Otimizar -30%</span>
                  <span>Padrão</span>
                  <span>Aumento +30%</span>
                </span>
              </div>
            </div>

            <div className="mt-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Lucro Líquido Projetado</p>
              <p className="text-xl font-extrabold text-slate-950 mt-1 font-mono">
                R$ {simulatedProfitTotal.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
              </p>
              <div className={`flex items-center gap-1 mt-2 font-bold text-xs ${percentageGain >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {percentageGain >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{Math.abs(percentageGain).toFixed(1)}% vs cenário real</span>
              </div>
            </div>
          </div>

          {/* Projection Chart visual list */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-900 mb-4 leading-none">Comparativo de Cenários Mês a Mês</h3>

            <div className="flex flex-col gap-4">
              {simulatedData.map((data) => {
                const maxSimulated = Math.max(...simulatedData.map((d) => d.simulatedRevenue));
                const revWidth = (data.simulatedRevenue / maxSimulated) * 100;
                const expWidth = (data.simulatedExpenses / maxSimulated) * 100;

                return (
                  <div key={data.month} className="grid grid-cols-12 items-center gap-4 border-b border-slate-50 pb-3">
                    <div className="col-span-2 select-none">
                      <span className="text-xs font-bold text-slate-900 uppercase">{data.month}</span>
                      <span className="text-[9px] text-slate-400 font-bold font-mono block mt-0.5">2026</span>
                    </div>

                    <div className="col-span-7 flex flex-col gap-1.5 justify-center">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div style={{ width: `${revWidth}%` }} className="bg-blue-600 h-2 rounded-full transition-all duration-300"></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 w-16 font-mono text-right">R$ {(data.simulatedRevenue / 1000).toFixed(1)}k</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                          <div style={{ width: `${expWidth}%` }} className="bg-blue-200 h-1.5 rounded-full transition-all duration-300"></div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 w-16 font-mono text-right">R$ {(data.simulatedExpenses / 1000).toFixed(1)}k</span>
                      </div>
                    </div>

                    <div className="col-span-3 text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Margem</p>
                      <p className="text-xs font-bold text-blue-600 font-mono">R$ {data.simulatedProfit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
