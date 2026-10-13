import { useDialog } from "../../components/ui/Dialog";
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  Award,
  Percent,
  Save,
  Handshake,
} from "lucide-react";
import { MainLayout } from "../../components/MainLayout";
import { financialApi, type Convenio } from "../../services/financial";

export default function Insurance() {
  const dialog = useDialog();
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<Convenio | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [ansCode, setAnsCode] = useState("");
  const [paymentTerm, setPaymentTerm] = useState<number | "">(30);
  const [glosaTolerance, setGlosaTolerance] = useState<number | "">(2.0);
  const [contractTable, setContractTable] = useState("tuss");

  const loadData = useCallback(async () => {
    try {
      const data = await financialApi.listConvenios();
      setConvenios(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAdd = () => {
    setEditData(null);
    setName("");
    setAnsCode("");
    setPaymentTerm(30);
    setGlosaTolerance(2.0);
    setContractTable("tuss");
    setShowForm(true);
  };

  const openEdit = (conv: Convenio) => {
    setEditData(conv);
    setName(conv.name);
    setAnsCode(conv.ansCode);
    setPaymentTerm(conv.paymentTerm);
    setGlosaTolerance(conv.glosaTolerance);
    setContractTable(conv.contractTable);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ansCode) return;

    const payload = {
      name,
      ansCode,
      paymentTerm: Number(paymentTerm),
      glosaTolerance: Number(glosaTolerance),
      contractTable,
    };

    try {
      if (editData) {
        await financialApi.updateConvenio(editData.id, payload);
      } else {
        await financialApi.createConvenio(payload);
      }
      setShowForm(false);
      loadData();
    } catch {
      dialog.showError("Erro ao salvar convênio. Verifique se o código ANS já existe.");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await financialApi.toggleConvenio(id);
      loadData();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await dialog.showConfirm("Tem certeza que deseja excluir este convênio?"); if (!confirmed) return;
    try {
      await financialApi.deleteConvenio(id);
      loadData();
    } catch {
      dialog.showError("Não é possível excluir convênio com receitas vinculadas.");
    }
  };

  const activeCount = convenios.filter((c) => c.active).length;
  const tableLabels: Record<string, string> = {
    tuss: "TUSS",
    cbhpm: "CBHPM",
    propria: "Própria",
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
            <Handshake className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                Convênios
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {activeCount} ativos de {convenios.length} cadastrados
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="bg-primary text-white hover:bg-primary-dark px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Convênio</span>
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm flex flex-col gap-4"
          >
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editData ? "Editar Convênio" : "Novo Convênio"}
              </h3>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                placeholder="Ex: Unimed Nacional"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Código ANS
                </label>
                <input
                  type="text"
                  value={ansCode}
                  onChange={(e) => setAnsCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden font-mono"
                  placeholder="302147"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Tabela
                </label>
                <select
                  value={contractTable}
                  onChange={(e) => setContractTable(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                >
                  <option value="tuss">TUSS</option>
                  <option value="cbhpm">CBHPM</option>
                  <option value="propria">Própria</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Prazo (dias)
                </label>
                <input
                  type="number"
                  value={paymentTerm}
                  onChange={(e) =>
                    setPaymentTerm(
                      e.target.value ? parseInt(e.target.value) : "",
                    )
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <Percent className="w-3 h-3" /> Glosa Tolerância
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={glosaTolerance}
                  onChange={(e) =>
                    setGlosaTolerance(
                      e.target.value ? parseFloat(e.target.value) : "",
                    )
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-primary text-white hover:bg-primary-dark px-5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> Salvar
              </button>
            </div>
          </form>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {convenios.map((conv) => (
            <div
              key={conv.id}
              className={`bg-white border rounded-xl p-5 transition-all ${conv.active ? "border-slate-200 hover:shadow-md" : "border-slate-100 opacity-60"}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className={`w-5 h-5 ${conv.active ? "text-emerald-600" : "text-slate-400"}`}
                  />
                  <h3 className="text-sm font-bold text-slate-900">
                    {conv.name}
                  </h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(conv)}
                    className="p-1.5 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(conv.id)}
                    className="p-1.5 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">ANS:</span>
                  <span className="font-bold text-slate-700 font-mono">
                    {conv.ansCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Prazo pgto:</span>
                  <span className="font-bold text-slate-700">
                    {conv.paymentTerm} dias
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Glosa tolerância:</span>
                  <span className="font-bold text-slate-700">
                    {conv.glosaTolerance}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tabela:</span>
                  <span className="font-bold text-blue-600">
                    {tableLabels[conv.contractTable] || conv.contractTable}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleToggle(conv.id)}
                  className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${conv.active ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {conv.active ? "✓ Ativo" : "Inativo, Reativar"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {convenios.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Award className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-medium text-sm">Nenhum convênio cadastrado</p>
          </div>
        )}

      </div>
    </MainLayout>
  );
}
