import { useState } from "react";
import { Handshake, Percent } from "lucide-react";
import { MainLayout } from "../../components/MainLayout";

interface Agreement {
  id: string;
  name: string;
  activePatients: number;
  glosPercentage: number;
  paymentTermDays: number;
  revenueShare: number;
}

const mockAgreements: Agreement[] = [
  { id: "1", name: "Unimed Nacional", activePatients: 142, glosPercentage: 1.8, paymentTermDays: 30, revenueShare: 48000 },
  { id: "2", name: "Bradesco Saúde", activePatients: 98, glosPercentage: 2.1, paymentTermDays: 45, revenueShare: 35000 },
  { id: "3", name: "Amil", activePatients: 76, glosPercentage: 4.2, paymentTermDays: 60, revenueShare: 22000 },
  { id: "4", name: "SulAmérica", activePatients: 54, glosPercentage: 1.5, paymentTermDays: 30, revenueShare: 18000 },
];

export default function Insurance() {
  const [selectedAgr, setSelectedAgr] = useState<Agreement | null>(mockAgreements[0]);
  const [markupIncrease, setMarkupIncrease] = useState(0);

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Convênios de Saúde</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Controle de tabelas de honorários, termos de recebimento e auditoria de glosas por plano</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Covenant list */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Planos Cadastrados</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockAgreements.map((a) => {
                const isSelected = selectedAgr?.id === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => {
                      setSelectedAgr(a);
                      setMarkupIncrease(0);
                    }}
                    className={`border p-4 rounded-xl transition-all cursor-pointer relative flex flex-col gap-2 ${
                      isSelected ? "border-blue-600 bg-blue-50/20 shadow-xs" : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-950">{a.name}</span>
                      <Handshake className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 border-t border-slate-100/80 pt-2 text-xs">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Pacientes Ativos</p>
                        <p className="font-extrabold text-slate-800">{a.activePatients}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Taxa de Glosa</p>
                        <p className={`font-extrabold ${a.glosPercentage > 3.5 ? "text-amber-600" : "text-emerald-600"}`}>{a.glosPercentage}%</p>
                      </div>
                      <div className="col-span-2 mt-1">
                        <p className="text-[9px] text-slate-400 uppercase font-bold">Repasse de Faturamento</p>
                        <p className="font-bold text-slate-900 font-mono">R$ {a.revenueShare.toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected covenant detailed audits */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
            {selectedAgr ? (
              <>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedAgr.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-extrabold">Auditoria Contratual</p>
                </div>

                <div className="flex flex-col gap-3.5 my-2">
                  <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-medium">Prazo Médio de Recebimento</span>
                    <span className="font-bold text-slate-900 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded-full">{selectedAgr.paymentTermDays} Dias</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-medium">Glosa Técnica Média</span>
                    <span className="font-bold text-slate-900">{selectedAgr.glosPercentage}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Score de Parceria</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${selectedAgr.glosPercentage > 3.0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {selectedAgr.glosPercentage > 3.0 ? "Score Médio" : "Excelente"}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-3">
                  <div className="flex items-center gap-1">
                    <Percent className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900">Simulador de Reajuste Contratual</h4>
                  </div>
                  <p className="text-[10px] inline-block text-slate-400">Simule um acréscimo médio de {markupIncrease}% na tabela de procedimentos:</p>

                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={markupIncrease}
                    onChange={(e) => setMarkupIncrease(parseInt(e.target.value))}
                    className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                  />

                  <div className="mt-2 border-t border-slate-100 pt-2">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Novo Faturamento Esperado</p>
                    <p className="text-sm font-extrabold text-blue-600 font-mono">
                      R$ {(selectedAgr.revenueShare * (1 + markupIncrease / 100)).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 text-center py-10">Selecione um plano para acessar a auditoria técnica.</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
