import { useState, useEffect, useCallback } from "react";
import { Coins, CheckCircle, Clock, FileCheck } from "lucide-react";
import { MainLayout } from "../../components/MainLayout";
import { financialApi, DoctorTransfer } from "../../services/financial";

export default function Transfers() {
  const [transfers, setTransfers] = useState<DoctorTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await financialApi.listTransfers();
      setTransfers(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalDues = transfers.reduce(
    (acc, d) => acc + (Number(d.netTransfer) || 0),
    0,
  );
  const paidDues = transfers
    .filter((d) => d.status === "PAGO")
    .reduce((acc, d) => acc + (Number(d.netTransfer) || 0), 0);
  const pendingDues = totalDues - paidDues;

  const handleApprove = async (id: string) => {
    try {
      await financialApi.approveTransfer(id);
      loadData();
    } catch {
      // ignore
    }
  };

  const handlePay = async (id: string) => {
    try {
      await financialApi.payTransfer(id);
      loadData();
    } catch {
      // ignore
    }
  };

  const statusMap: Record<
    string,
    { label: string; classes: string; icon: typeof CheckCircle }
  > = {
    PAGO: {
      label: "Pago",
      classes: "bg-emerald-50 text-emerald-700 border-emerald-100",
      icon: CheckCircle,
    },
    APROVADO: {
      label: "Aprovado",
      classes: "bg-blue-50 text-blue-700 border-blue-100",
      icon: FileCheck,
    },
    CALCULADO: {
      label: "Calculado",
      classes: "bg-amber-50 text-amber-700 border-amber-100",
      icon: Clock,
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
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <Coins className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                Repasses Médicos
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Controle de repasses por profissional
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-[10px] font-bold text-slate-500 uppercase">
                Total Repasses
              </p>
              <p className="text-xl font-extrabold text-slate-900">
                R${" "}
                {totalDues.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg">
              <p className="text-[10px] font-bold text-emerald-600 uppercase">
                Já Pagos
              </p>
              <p className="text-xl font-extrabold text-emerald-700">
                R${" "}
                {paidDues.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-[10px] font-bold text-amber-600 uppercase">
                Pendentes
              </p>
              <p className="text-xl font-extrabold text-amber-700">
                R${" "}
                {pendingDues.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-3 font-bold">Mês Ref.</th>
                  <th className="px-6 py-3 font-bold">Procedimentos</th>
                  <th className="px-6 py-3 font-bold text-right">
                    Receita Total
                  </th>
                  <th className="px-6 py-3 font-bold text-center">%</th>
                  <th className="px-6 py-3 font-bold text-right">
                    Valor Repasse
                  </th>
                  <th className="px-6 py-3 font-bold text-center">Status</th>
                  <th className="px-6 py-3 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {transfers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-slate-400"
                    >
                      <Coins className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="font-medium">Nenhum repasse registrado</p>
                    </td>
                  </tr>
                ) : (
                  transfers.map((t) => {
                    const info = statusMap[t.status] || {
                      label: t.status,
                      classes: "bg-slate-100 text-slate-600 border-slate-200",
                      icon: Clock,
                    };
                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-3.5 font-bold text-slate-900">
                          {t.referenceMonth}
                        </td>
                        <td className="px-6 py-3.5 text-slate-600 font-medium">
                          {t.proceduresCount}
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono text-slate-700">
                          R${" "}
                          {Number(t.totalRevenue).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-6 py-3.5 text-center font-bold text-blue-600">
                          {t.transferPercentage}%
                        </td>
                        <td className="px-6 py-3.5 text-right font-bold text-slate-900 font-mono">
                          R${" "}
                          {Number(t.netTransfer).toLocaleString("pt-BR", {
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
                        <td className="px-6 py-3.5 text-center">
                          {t.status === "CALCULADO" && (
                            <button
                              onClick={() => handleApprove(t.id)}
                              className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Aprovar
                            </button>
                          )}
                          {t.status === "APROVADO" && (
                            <button
                              onClick={() => handlePay(t.id)}
                              className="text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Pagar
                            </button>
                          )}
                          {t.status === "PAGO" && (
                            <span className="text-[10px] text-slate-400">
                              —
                            </span>
                          )}
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
