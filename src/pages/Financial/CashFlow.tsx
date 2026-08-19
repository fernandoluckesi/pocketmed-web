import { useState, useEffect, useCallback } from "react";
import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { MainLayout } from "../../components/MainLayout";
import { financialApi, type CashflowEntry } from "../../services/financial";

export default function CashFlow() {
  const [entries, setEntries] = useState<CashflowEntry[]>([]);
  const [balance, setBalance] = useState({
    balance: 0,
    totalEntradas: 0,
    totalSaidas: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [balanceData, entriesData] = await Promise.all([
        financialApi.getBalance(),
        financialApi.listCashflow(),
      ]);
      setBalance(balanceData);
      setEntries(entriesData.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Saldo Atual
              </span>
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
            <h3
              className={`text-2xl font-extrabold ${balance.balance >= 0 ? "text-slate-900" : "text-rose-600"}`}
            >
              R${" "}
              {balance.balance.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </h3>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Total Entradas
              </span>
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-emerald-700">
              R${" "}
              {balance.totalEntradas.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </h3>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Total Saídas
              </span>
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-rose-700">
              R${" "}
              {balance.totalSaidas.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </h3>
          </div>
        </div>

        {/* Entries Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-md font-bold text-slate-900">Movimentações</h2>
            <p className="text-[11px] text-slate-400">
              Extrato de entradas e saídas
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-3 font-bold">Data</th>
                  <th className="px-6 py-3 font-bold">Tipo</th>
                  <th className="px-6 py-3 font-bold">Descrição</th>
                  <th className="px-6 py-3 font-bold">Categoria</th>
                  <th className="px-6 py-3 font-bold text-right">Valor</th>
                  <th className="px-6 py-3 font-bold text-center">
                    Reconciliado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {entries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-slate-400"
                    >
                      Nenhuma movimentação registrada
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-3.5 text-slate-600 font-medium">
                        {new Date(entry.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${entry.type === "ENTRADA" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                        >
                          {entry.type === "ENTRADA" ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {entry.type === "ENTRADA" ? "Entrada" : "Saída"}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-900">
                        {entry.description}
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">
                        {entry.category || "—"}
                      </td>
                      <td
                        className={`px-6 py-3.5 text-right font-bold font-mono ${entry.type === "ENTRADA" ? "text-emerald-700" : "text-rose-700"}`}
                      >
                        {entry.type === "ENTRADA" ? "+" : "-"} R${" "}
                        {Number(entry.value).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span
                          className={`inline-flex w-2 h-2 rounded-full ${entry.reconciled ? "bg-emerald-500" : "bg-amber-400"}`}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
