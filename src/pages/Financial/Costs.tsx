import { useState } from "react";
import { Network, Plus } from "lucide-react";
import { MainLayout } from "../../components/MainLayout";

interface CostCenter {
  id: string;
  name: string;
  allocatedValue: number;
  color: string;
}

const initialCostCenters: CostCenter[] = [
  { id: "CC001", name: "Folha de Pagamento", allocatedValue: 89000, color: "#2563EB" },
  { id: "CC002", name: "Infraestrutura Predial", allocatedValue: 15000, color: "#10B981" },
  { id: "CC003", name: "Insumos Médicos", allocatedValue: 8420, color: "#8B5CF6" },
  { id: "CC004", name: "Marketing Digital", allocatedValue: 10000, color: "#EC4899" },
  { id: "CC005", name: "Tecnologia e SaaS", allocatedValue: 4010, color: "#F59E0B" },
  { id: "CC006", name: "Seguros e Compliance", allocatedValue: 13920, color: "#6B7280" },
];

export default function Costs() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>(initialCostCenters);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [allocatedValue, setAllocatedValue] = useState("");
  const [color, setColor] = useState("#2563EB");

  const totalValue = costCenters.reduce((acc, c) => acc + c.allocatedValue, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !allocatedValue) return;
    setCostCenters([
      ...costCenters,
      { id: `CC${Date.now()}`, name, allocatedValue: parseFloat(allocatedValue), color },
    ]);
    setName("");
    setAllocatedValue("");
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setCostCenters(costCenters.filter((c) => c.id !== id));
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Centros de Custos</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Classificação e distribuição dos dispêndios corporativos da unidade clínica</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Centro de Custo</span>
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4 text-xs font-bold">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Configurar Nova Categoria Administrativa</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-slate-500 mb-1">Título do Departamento</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden" placeholder="Ex. Terceirizados, Tecnologia" required />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-500 mb-1">Verba Alocada (R$)</label>
                <input type="number" value={allocatedValue} onChange={(e) => setAllocatedValue(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-mono" placeholder="0.00" required />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-slate-500 mb-1">Cor Identificadora</label>
                <select value={color} onChange={(e) => setColor(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden">
                  <option value="#2563EB">Azul Royal</option>
                  <option value="#10B981">Esmeralda</option>
                  <option value="#8B5CF6">Roxo Ametista</option>
                  <option value="#F59E0B">Âmbar</option>
                  <option value="#EC4899">Rosa Coral</option>
                  <option value="#6B7280">Cinza Ardósia</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 text-xs font-bold">
              <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer">Cancelar</button>
              <button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-lg cursor-pointer transition-all active:scale-95 shadow-sm">Adicionar</button>
            </div>
          </form>
        )}

        {/* Grid displays */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {costCenters.map((cc) => {
            const currentPercentage = totalValue > 0 ? (cc.allocatedValue / totalValue) * 100 : 0;
            return (
              <div key={cc.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{cc.name}</h3>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block mt-0.5">{cc.id}</span>
                  </div>
                  <div style={{ backgroundColor: `${cc.color}20`, color: cc.color }} className="p-1.5 rounded-lg text-xs">
                    <Network className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Consumo Estimado</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">R$ {cc.allocatedValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                    <div style={{ width: `${currentPercentage}%`, backgroundColor: cc.color }} className="h-2 rounded-full transition-all duration-500"></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] font-bold text-slate-400">Proporção Operacional</span>
                    <span className="text-[10px] font-bold font-mono" style={{ color: cc.color }}>{currentPercentage.toFixed(1)}%</span>
                  </div>
                </div>

                {!["CC001", "CC002", "CC003"].includes(cc.id) && (
                  <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end">
                    <button onClick={() => handleDelete(cc.id)} className="text-slate-400 hover:text-rose-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer">
                      Excluir Centro
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
