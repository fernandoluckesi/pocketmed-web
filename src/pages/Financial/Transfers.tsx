import { useState } from "react";
import { Coins, CheckCircle, Clock, FileCheck } from "lucide-react";
import { MainLayout } from "../../components/MainLayout";

interface DoctorTransfer {
  id: string;
  name: string;
  specialty: string;
  proceduresCompleted: number;
  totalRevenue: number;
  transferPercentage: number;
  transferAmount: number;
  status: "Pago" | "Pendente";
}

const mockDoctors: DoctorTransfer[] = [
  { id: "1", name: "Dr. André Santos", specialty: "Cardiologia", proceduresCompleted: 45, totalRevenue: 68000, transferPercentage: 60, transferAmount: 40800, status: "Pendente" },
  { id: "2", name: "Dra. Beatriz Lima", specialty: "Radiologia", proceduresCompleted: 38, totalRevenue: 52000, transferPercentage: 55, transferAmount: 28600, status: "Pago" },
  { id: "3", name: "Dra. Carla Vieira", specialty: "Pediatria", proceduresCompleted: 32, totalRevenue: 42000, transferPercentage: 50, transferAmount: 21000, status: "Pendente" },
  { id: "4", name: "Dr. Ricardo Almeida", specialty: "Ortopedia", proceduresCompleted: 28, totalRevenue: 55000, transferPercentage: 58, transferAmount: 31900, status: "Pago" },
];

export default function Transfers() {
  const [doctors, setDoctors] = useState<DoctorTransfer[]>(mockDoctors);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(doctors[0]?.id || null);

  const activeDoc = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  const totalDues = doctors.reduce((acc, d) => acc + d.transferAmount, 0);
  const paidDues = doctors.filter((d) => d.status === "Pago").reduce((acc, d) => acc + d.transferAmount, 0);
  const pendingDues = doctors.filter((d) => d.status === "Pendente").reduce((acc, d) => acc + d.transferAmount, 0);

  const handleTriggerPayment = (id: string) => {
    setDoctors(doctors.map((d) => (d.id === id ? { ...d, status: "Pago" as const } : d)));
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Repasses Médicos</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Cálculo de honorários médicos, comissionamento e liquidação de repasses administrativos</p>
        </div>

        {/* Global repayments grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Repasses Globais</p>
              <p className="text-md font-bold text-slate-900 font-mono">R$ {totalDues.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Lançado Pago</p>
              <p className="text-md font-bold text-slate-900 font-mono">R$ {paidDues.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Lançado Pendente</p>
              <p className="text-md font-bold text-slate-900 font-mono">R$ {pendingDues.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Main split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clinicians selector */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Honorários Individuais</h3>

            <div className="flex flex-col gap-2">
              {doctors.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDoctorId(d.id)}
                  className={`flex justify-between items-center p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedDoctorId === d.id ? "border-blue-600 bg-blue-50/20 shadow-xs" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {d.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{d.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{d.specialty}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Honorário Devido</p>
                      <p className="text-xs font-extrabold text-slate-950 font-mono">R$ {d.transferAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${d.status === "Pago" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-100 text-amber-700 border border-amber-200"}`}>
                      {d.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Clinical Details Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
            {activeDoc ? (
              <>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {activeDoc.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{activeDoc.name}</h3>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">{activeDoc.transferPercentage}% Repasse</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Atendimentos Processados</span>
                    <span className="font-bold text-slate-800 font-mono">{activeDoc.proceduresCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-slate-400 font-medium">Faturamento Gerado</span>
                    <span className="font-bold text-slate-800 font-mono">R$ {activeDoc.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-slate-50 rounded-lg px-2 mt-1">
                    <span className="text-slate-600 font-bold">Valor Líquido Médico</span>
                    <span className="font-extrabold text-blue-600 font-mono text-sm">R$ {activeDoc.transferAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {activeDoc.status === "Pendente" ? (
                  <button
                    onClick={() => handleTriggerPayment(activeDoc.id)}
                    className="bg-blue-600 text-white hover:bg-blue-700 w-full rounded-xl py-2.5 font-bold text-xs mt-2 transition-all duration-200 active:scale-95 shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <FileCheck className="w-4 h-4 shrink-0" />
                    <span>Quitar Repasse Médico</span>
                  </button>
                ) : (
                  <div className="w-full text-center py-2.5 bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 rounded-xl text-xs mt-2 select-none flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Repasse Quitado e Liquidado</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-400 text-center py-10">Escolha um médico para avaliar os contratos.</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
