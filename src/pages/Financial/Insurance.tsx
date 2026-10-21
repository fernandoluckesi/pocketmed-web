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
  Table2,
  Tag,
  X,
  Check,
} from "lucide-react";
import { MainLayout } from "../../components/MainLayout";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { useToast } from "../../contexts/ToastContext";
import {
  financialApi,
  type Convenio,
  type ConvenioProcedure,
  type ConvenioPlan,
} from "../../services/financial";

export default function Insurance() {
  const dialog = useDialog();
  const toast = useToast();
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<Convenio | null>(null);

  // Remuneration table (how much this convênio pays per procedure code)
  const [managingProceduresFor, setManagingProceduresFor] =
    useState<Convenio | null>(null);
  const [procedures, setProcedures] = useState<ConvenioProcedure[]>([]);
  const [loadingProcedures, setLoadingProcedures] = useState(false);
  const [newProcedureCode, setNewProcedureCode] = useState("");
  const [newProcedureName, setNewProcedureName] = useState("");
  const [newProcedureValue, setNewProcedureValue] = useState("");
  const [editingProcedureId, setEditingProcedureId] = useState<string | null>(
    null,
  );
  const [editProcedureValue, setEditProcedureValue] = useState("");

  // Insurance plans (e.g. "Premium", "Básico") — populates the Plano select in Receitas
  const [managingPlansFor, setManagingPlansFor] = useState<Convenio | null>(null);
  const [plans, setPlans] = useState<ConvenioPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanName, setEditPlanName] = useState("");

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
    setManagingProceduresFor(null);
    setManagingPlansFor(null);
    setEditData(null);
    setName("");
    setAnsCode("");
    setPaymentTerm(30);
    setGlosaTolerance(2.0);
    setContractTable("tuss");
    setShowForm(true);
  };

  const openEdit = (conv: Convenio) => {
    setManagingProceduresFor(null);
    setManagingPlansFor(null);
    setEditData(conv);
    setName(conv.name);
    setAnsCode(conv.ansCode);
    setPaymentTerm(conv.paymentTerm);
    setGlosaTolerance(conv.glosaTolerance);
    setContractTable(conv.contractTable);
    setShowForm(true);
  };

  const loadProcedures = useCallback(async (convenioId: string) => {
    setLoadingProcedures(true);
    try {
      const data = await financialApi.listConvenioProcedures(convenioId);
      setProcedures(Array.isArray(data) ? data : []);
    } catch {
      setProcedures([]);
    } finally {
      setLoadingProcedures(false);
    }
  }, []);

  const openManageProcedures = (conv: Convenio) => {
    setShowForm(false);
    setManagingPlansFor(null);
    setManagingProceduresFor(conv);
    setNewProcedureCode("");
    setNewProcedureName("");
    setNewProcedureValue("");
    loadProcedures(conv.id);
  };

  const loadPlans = useCallback(async (convenioId: string) => {
    setLoadingPlans(true);
    try {
      const data = await financialApi.listConvenioPlans(convenioId);
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  const openManagePlans = (conv: Convenio) => {
    setShowForm(false);
    setManagingProceduresFor(null);
    setManagingPlansFor(conv);
    setNewPlanName("");
    loadPlans(conv.id);
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingPlansFor || !newPlanName.trim()) return;
    try {
      await financialApi.createConvenioPlan(managingPlansFor.id, {
        name: newPlanName.trim(),
      });
      setNewPlanName("");
      loadPlans(managingPlansFor.id);
    } catch {
      toast.error("Não foi possível adicionar. Verifique se o plano já existe.");
    }
  };

  const handleStartEditPlan = (p: ConvenioPlan) => {
    setEditingPlanId(p.id);
    setEditPlanName(p.name);
  };

  const handleSaveEditPlan = async (p: ConvenioPlan) => {
    if (!managingPlansFor || !editPlanName.trim()) return;
    try {
      await financialApi.updateConvenioPlan(managingPlansFor.id, p.id, {
        name: editPlanName.trim(),
      });
      setEditingPlanId(null);
      loadPlans(managingPlansFor.id);
    } catch {
      toast.error("Não foi possível atualizar o plano. Tente novamente.");
    }
  };

  const handleDeletePlan = async (p: ConvenioPlan) => {
    if (!managingPlansFor) return;
    const confirmed = await dialog.showConfirm(
      `Remover o plano "${p.name}" deste convênio?`,
    );
    if (!confirmed) return;
    try {
      await financialApi.deleteConvenioPlan(managingPlansFor.id, p.id);
      loadPlans(managingPlansFor.id);
    } catch {
      toast.error("Não foi possível remover. Tente novamente.");
    }
  };

  const handleAddProcedure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingProceduresFor || !newProcedureCode || !newProcedureName || !newProcedureValue)
      return;
    try {
      await financialApi.createConvenioProcedure(managingProceduresFor.id, {
        procedureCode: newProcedureCode.trim(),
        procedureName: newProcedureName,
        value: parseFloat(newProcedureValue),
      });
      setNewProcedureCode("");
      setNewProcedureName("");
      setNewProcedureValue("");
      loadProcedures(managingProceduresFor.id);
    } catch {
      toast.error("Não foi possível adicionar. Verifique se o código já existe.");
    }
  };

  const handleStartEditProcedure = (p: ConvenioProcedure) => {
    setEditingProcedureId(p.id);
    setEditProcedureValue(String(p.value));
  };

  const handleSaveEditProcedure = async (p: ConvenioProcedure) => {
    if (!managingProceduresFor) return;
    const value = parseFloat(editProcedureValue);
    if (isNaN(value) || value < 0) return;
    try {
      await financialApi.updateConvenioProcedure(managingProceduresFor.id, p.id, { value });
      setEditingProcedureId(null);
      loadProcedures(managingProceduresFor.id);
    } catch {
      toast.error("Não foi possível atualizar o valor. Tente novamente.");
    }
  };

  const handleDeleteProcedure = async (p: ConvenioProcedure) => {
    if (!managingProceduresFor) return;
    const confirmed = await dialog.showConfirm(
      `Remover o procedimento "${p.procedureName}" da tabela deste convênio?`,
    );
    if (!confirmed) return;
    try {
      await financialApi.deleteConvenioProcedure(managingProceduresFor.id, p.id);
      loadProcedures(managingProceduresFor.id);
    } catch {
      toast.error("Não foi possível remover. Tente novamente.");
    }
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
                <CustomSelect
                  value={contractTable}
                  onChange={setContractTable}
                  options={[
                    { value: "tuss", label: "TUSS" },
                    { value: "cbhpm", label: "CBHPM" },
                    { value: "propria", label: "Própria" },
                  ]}
                  size="sm"
                />
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

        {managingProceduresFor && (
          <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Tabela de Procedimentos — {managingProceduresFor.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Quanto este convênio paga por cada código de procedimento.
                  Usado para preencher o valor automaticamente ao faturar uma
                  guia.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManagingProceduresFor(null)}
                className="text-on-surface-variant hover:text-on-surface p-2 bg-surface-container-low rounded-full transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleAddProcedure}
              className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Código (TUSS)
                </label>
                <input
                  type="text"
                  value={newProcedureCode}
                  onChange={(e) => setNewProcedureCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-primary focus:outline-hidden"
                  placeholder="10101012"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Nome do Procedimento
                </label>
                <input
                  type="text"
                  value={newProcedureName}
                  onChange={(e) => setNewProcedureName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                  placeholder="Consulta médica"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newProcedureValue}
                  onChange={(e) => setNewProcedureValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-primary focus:outline-hidden"
                  placeholder="0.00"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-white hover:bg-primary-dark px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                Adicionar
              </button>
            </form>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                    <th className="px-4 py-2 font-bold">Código</th>
                    <th className="px-4 py-2 font-bold">Procedimento</th>
                    <th className="px-4 py-2 font-bold text-right">Valor</th>
                    <th className="px-4 py-2 font-bold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loadingProcedures ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400">
                        Carregando...
                      </td>
                    </tr>
                  ) : procedures.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400">
                        Nenhum procedimento cadastrado pra este convênio.
                      </td>
                    </tr>
                  ) : (
                    procedures.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-2.5 font-mono text-slate-700">
                          {p.procedureCode}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-slate-900">
                          {p.procedureName}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono">
                          {editingProcedureId === p.id ? (
                            <input
                              type="number"
                              step="0.01"
                              autoFocus
                              value={editProcedureValue}
                              onChange={(e) => setEditProcedureValue(e.target.value)}
                              className="w-24 bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs text-right font-mono"
                            />
                          ) : (
                            <span className="font-bold text-slate-900">
                              R${" "}
                              {Number(p.value).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {editingProcedureId === p.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveEditProcedure(p)}
                                  className="text-emerald-600 hover:bg-emerald-50 rounded p-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingProcedureId(null)}
                                  className="text-slate-400 hover:bg-slate-100 rounded p-1 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEditProcedure(p)}
                                  className="text-slate-500 hover:bg-slate-100 rounded p-1 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProcedure(p)}
                                  className="text-rose-500 hover:bg-rose-50 rounded p-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {managingPlansFor && (
          <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Planos — {managingPlansFor.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Os planos deste convênio (ex: Premium, Básico). Usado para
                  listar as opções do campo Plano ao faturar uma guia.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManagingPlansFor(null)}
                className="text-on-surface-variant hover:text-on-surface p-2 bg-surface-container-low rounded-full transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={handleAddPlan}
              className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
            >
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Nome do Plano
                </label>
                <input
                  type="text"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                  placeholder="Ex: Premium, Básico, Nacional Flex..."
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-white hover:bg-primary-dark px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                Adicionar
              </button>
            </form>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                    <th className="px-4 py-2 font-bold">Plano</th>
                    <th className="px-4 py-2 font-bold text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loadingPlans ? (
                    <tr>
                      <td colSpan={2} className="text-center py-8 text-slate-400">
                        Carregando...
                      </td>
                    </tr>
                  ) : plans.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center py-8 text-slate-400">
                        Nenhum plano cadastrado pra este convênio.
                      </td>
                    </tr>
                  ) : (
                    plans.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-2.5 font-bold text-slate-900">
                          {editingPlanId === p.id ? (
                            <input
                              type="text"
                              autoFocus
                              value={editPlanName}
                              onChange={(e) => setEditPlanName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs"
                            />
                          ) : (
                            p.name
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {editingPlanId === p.id ? (
                              <>
                                <button
                                  onClick={() => handleSaveEditPlan(p)}
                                  className="text-emerald-600 hover:bg-emerald-50 rounded p-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingPlanId(null)}
                                  className="text-slate-400 hover:bg-slate-100 rounded p-1 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEditPlan(p)}
                                  className="text-slate-500 hover:bg-slate-100 rounded p-1 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeletePlan(p)}
                                  className="text-rose-500 hover:bg-rose-50 rounded p-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
                    onClick={() => openManageProcedures(conv)}
                    title="Tabela de Procedimentos"
                    className="p-1.5 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                  >
                    <Table2 className="w-3.5 h-3.5 text-blue-500" />
                  </button>
                  <button
                    onClick={() => openManagePlans(conv)}
                    title="Planos"
                    className="p-1.5 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                  >
                    <Tag className="w-3.5 h-3.5 text-indigo-500" />
                  </button>
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
