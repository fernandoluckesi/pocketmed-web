import { useState, useEffect, useCallback } from "react";
import { Network, Plus } from "lucide-react";
import { MainLayout } from "../../components/MainLayout";
import { financialApi, CostCenter } from "../../services/financial";

export default function Costs() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [budgetAllocated, setBudgetAllocated] = useState("");
  const [color, setColor] = useState("#2563EB");

  const loadData = useCallback(async () => {
    try {
      const data = await financialApi.listCostCenters();
      setCostCenters(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalValue = costCenters.reduce(
    (acc, c) => acc + (Number(c.budgetAllocated) || 0),
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    try {
      await financialApi.createCostCenter({
        name,
        code,
        budgetAllocated: budgetAllocated ? parseFloat(budgetAllocated) : 0,
        color,
      });
      setName("");
      setCode("");
      setBudgetAllocated("");
      setShowAdd(false);
      loadData();
    } catch {
      alert("Erro ao criar centro de custo. Verifique se o código já existe.");
    }
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
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
              Centros de Custo
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Orçamento total alocado:{" "}
              <strong className="text-blue-600">
                R${" "}
                {totalValue.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </strong>
            </p>
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
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="Ex: Folha de Pagamento"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  placeholder="CC007"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Orçamento (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={budgetAllocated}
                  onChange={(e) => setBudgetAllocated(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-mono"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Cor
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                Criar
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {costCenters.map((cc) => {
            const pct =
              totalValue > 0
                ? ((Number(cc.budgetAllocated) || 0) / totalValue) * 100
                : 0;
            return (
              <div
                key={cc.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${cc.color || "#2563EB"}20` }}
                  >
                    <Network
                      className="w-5 h-5"
                      style={{ color: cc.color || "#2563EB" }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {cc.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {cc.code}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-lg font-extrabold text-slate-900">
                      R${" "}
                      {(Number(cc.budgetAllocated) || 0).toLocaleString(
                        "pt-BR",
                        { minimumFractionDigits: 2 },
                      )}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold">
                      {pct.toFixed(1)}% do total
                    </p>
                  </div>
                </div>
                <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      backgroundColor: cc.color || "#2563EB",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {costCenters.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Network className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-medium text-sm">
              Nenhum centro de custo cadastrado
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
