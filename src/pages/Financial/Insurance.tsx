import { useState } from "react";
import { Plus, Edit2, Trash2, ShieldCheck, ShieldAlert, Award, Calendar, Percent, X, CheckCircle, Info, Save, Handshake } from "lucide-react";
import { MainLayout } from "../../components/MainLayout";

interface Convenio {
  id: string;
  name: string;
  ansCode: string;
  paymentTerm: number;
  glosaTolerance: number;
  contractTable: "tuss" | "cbhpm" | "propria";
  active: boolean;
}

const INITIAL_CONVENIOS: Convenio[] = [
  { id: "1", name: "Unimed Nacional", ansCode: "302147", paymentTerm: 30, glosaTolerance: 1.8, contractTable: "tuss", active: true },
  { id: "2", name: "Bradesco Saúde", ansCode: "005711", paymentTerm: 45, glosaTolerance: 2.1, contractTable: "cbhpm", active: true },
  { id: "3", name: "Amil", ansCode: "326305", paymentTerm: 60, glosaTolerance: 4.2, contractTable: "tuss", active: true },
  { id: "4", name: "SulAmérica", ansCode: "006246", paymentTerm: 30, glosaTolerance: 1.5, contractTable: "propria", active: true },
  { id: "5", name: "Hapvida", ansCode: "368253", paymentTerm: 45, glosaTolerance: 3.0, contractTable: "tuss", active: false },
];

// --- Modal Component ---
function ModalConvenio({ isOpen, onClose, onSave, editData }: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (convenio: Omit<Convenio, "id"> & { id?: string }) => void;
  editData: Convenio | null;
}) {
  const [name, setName] = useState(editData?.name || "");
  const [ansCode, setAnsCode] = useState(editData?.ansCode || "");
  const [paymentTerm, setPaymentTerm] = useState<number | "">(editData?.paymentTerm || "");
  const [glosaTolerance, setGlosaTolerance] = useState<number | "">(editData?.glosaTolerance || "");
  const [contractTable, setContractTable] = useState<"tuss" | "cbhpm" | "propria">(editData?.contractTable || "tuss");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or editData changes
  const resetKey = `${isOpen}-${editData?.id || "new"}`;
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    if (isOpen) {
      setName(editData?.name || "");
      setAnsCode(editData?.ansCode || "");
      setPaymentTerm(editData?.paymentTerm || "");
      setGlosaTolerance(editData?.glosaTolerance || "");
      setContractTable(editData?.contractTable || "tuss");
      setErrors({});
    }
  }

  if (!isOpen) return null;

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = "Nome da operadora é obrigatório.";
    if (!ansCode.trim()) {
      tempErrors.ansCode = "Código ANS é obrigatório.";
    } else if (!/^\d{4,8}$/.test(ansCode.trim())) {
      tempErrors.ansCode = "Registro ANS inválido (4 a 8 dígitos numéricos).";
    }
    if (paymentTerm === "" || paymentTerm <= 0) {
      tempErrors.paymentTerm = "O prazo deve ser maior que 0.";
    }
    if (glosaTolerance === "" || glosaTolerance < 0 || glosaTolerance > 100) {
      tempErrors.glosaTolerance = "Tolerância deve ser entre 0% e 100%.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      id: editData?.id,
      name: name.trim(),
      ansCode: ansCode.trim(),
      paymentTerm: Number(paymentTerm),
      glosaTolerance: Number(glosaTolerance),
      contractTable,
      active: editData ? editData.active : true,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-primary">
              {editData ? "Editar Convênio" : "Novo Convênio"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Cadastre as diretrizes financeiras e contratuais da operadora.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-transparent">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Nome da Operadora</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Unimed Nacional" className={`w-full px-3 py-2 border rounded-lg bg-white outline-none text-sm transition-all focus:ring-1 ${errors.name ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-slate-300 focus:border-primary focus:ring-primary"}`} />
              {errors.name && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Registro ANS</label>
              <input type="text" value={ansCode} onChange={(e) => setAnsCode(e.target.value)} placeholder="Código numérico ANS" className={`w-full px-3 py-2 border rounded-lg bg-white outline-none text-sm transition-all focus:ring-1 ${errors.ansCode ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-slate-300 focus:border-primary focus:ring-primary"}`} />
              {errors.ansCode && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.ansCode}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Prazo de Pagamento (Dias)</label>
              <div className="relative">
                <input type="number" value={paymentTerm} onChange={(e) => setPaymentTerm(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Ex: 30" className={`w-full px-3 py-2 border rounded-lg bg-white outline-none text-sm pr-16 transition-all focus:ring-1 ${errors.paymentTerm ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-slate-300 focus:border-primary focus:ring-primary"}`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-extrabold tracking-wider pointer-events-none">DIAS</span>
              </div>
              {errors.paymentTerm && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.paymentTerm}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Tolerância de Glosa (%)</label>
              <div className="relative">
                <input type="number" step="0.1" value={glosaTolerance} onChange={(e) => setGlosaTolerance(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Ex: 2.5" className={`w-full px-3 py-2 border rounded-lg bg-white outline-none text-sm pr-12 transition-all focus:ring-1 ${errors.glosaTolerance ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500" : "border-slate-300 focus:border-primary focus:ring-primary"}`} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-extrabold tracking-wider pointer-events-none">%</span>
              </div>
              {errors.glosaTolerance && <p className="text-[10px] text-rose-500 font-bold mt-1">{errors.glosaTolerance}</p>}
            </div>

            {/* Contract Table Selection */}
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Tabela Contratual Base</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {([
                  { value: "tuss" as const, label: "TUSS", desc: "Padrão obrigatório para troca de informações em saúde." },
                  { value: "cbhpm" as const, label: "CBHPM", desc: "Classificação Brasileira Hierarquizada de Procedimentos." },
                  { value: "propria" as const, label: "Própria", desc: "Tabela de negociação direta e precificação livre." },
                ]).map((opt) => (
                  <label key={opt.value} className={`relative flex flex-col p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition-all select-none ${contractTable === opt.value ? "border-primary bg-primary/5" : "border-slate-200"}`}>
                    <input type="radio" name="contractTable" checked={contractTable === opt.value} onChange={() => setContractTable(opt.value)} className="sr-only" />
                    <span className="font-bold text-sm text-slate-900 mb-1">{opt.label}</span>
                    <span className="text-[11px] text-slate-500 leading-normal">{opt.desc}</span>
                    {contractTable === opt.value && <CheckCircle className="absolute top-2.5 right-2.5 h-4 w-4 text-primary" />}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Audit tip */}
          <div className="bg-blue-50/75 p-4 rounded-xl border border-blue-200/50 flex gap-3.5 items-start">
            <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Dica:</strong> Certifique-se de que o prazo de pagamento condiz com o contrato físico para garantir a precisão no cálculo do Fluxo de Caixa Projetado.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-all cursor-pointer border-none bg-transparent">Cancelar</button>
          <button type="submit" onClick={handleSubmit} className="px-5 py-2.5 bg-primary text-white text-xs font-extrabold hover:shadow-lg active:scale-[0.98] transition-all rounded-lg flex items-center gap-2 cursor-pointer shadow-sm border-none">
            <Save className="h-4 w-4" />
            <span>Salvar Convênio</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function Insurance() {
  const [convenios, setConvenios] = useState<Convenio[]>(INITIAL_CONVENIOS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConvenio, setEditingConvenio] = useState<Convenio | null>(null);
  const [selectedAgr, setSelectedAgr] = useState<Convenio | null>(convenios[0]);
  const [markupIncrease, setMarkupIncrease] = useState(0);

  const activeCount = convenios.filter((c) => c.active).length;
  const avgTerm = convenios.length > 0 ? Math.round(convenios.reduce((sum, c) => sum + c.paymentTerm, 0) / convenios.length) : 0;

  const handleSave = (data: Omit<Convenio, "id"> & { id?: string }) => {
    if (data.id) {
      setConvenios((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data, id: c.id } : c)));
    } else {
      setConvenios((prev) => [...prev, { ...data, id: `conv-${Date.now()}` }]);
    }
    setIsModalOpen(false);
    setEditingConvenio(null);
  };

  const handleDelete = (id: string) => {
    setConvenios((prev) => prev.filter((c) => c.id !== id));
    if (selectedAgr?.id === id) setSelectedAgr(null);
  };

  const handleToggleActive = (id: string) => {
    setConvenios((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Convênios de Saúde</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Controle de tabelas de honorários, termos de recebimento e auditoria de glosas</p>
          </div>
          <button onClick={() => { setEditingConvenio(null); setIsModalOpen(true); }} className="bg-primary text-white hover:opacity-95 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-all shadow-sm border-none">
            <Plus className="w-4 h-4" />
            Novo Convênio
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-4">
            <div className="p-2.5 bg-blue-50 text-primary rounded-lg"><Award className="h-5 w-5" /></div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">Contratos Ativos</span>
              <span className="text-lg font-extrabold text-slate-800">{activeCount} de {convenios.length}</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-4">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg"><Calendar className="h-5 w-5" /></div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">Prazo Médio</span>
              <span className="text-lg font-extrabold text-slate-800">{avgTerm} Dias</span>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center gap-4">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg"><Percent className="h-5 w-5" /></div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">Glosa Máxima</span>
              <span className="text-lg font-extrabold text-slate-800">Max 2.5%</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 min-w-[700px]">
              <thead className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-4 px-6">Operadora / ANS</th>
                  <th className="py-4 px-4 text-center">Tabela</th>
                  <th className="py-4 px-4 text-center">Prazo</th>
                  <th className="py-4 px-4 text-center">Glosa</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {convenios.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-slate-900">{c.name}</div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">ANS #{c.ansCode}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold tracking-wider ${c.contractTable === "tuss" ? "bg-blue-100 text-blue-700" : c.contractTable === "cbhpm" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {c.contractTable}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-mono">{c.paymentTerm} Dias</td>
                    <td className="py-4 px-4 text-center font-mono">{c.glosaTolerance.toFixed(1)}%</td>
                    <td className="py-4 px-4 text-center">
                      <button onClick={() => handleToggleActive(c.id)} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold cursor-pointer transition-colors border-none ${c.active ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
                        {c.active ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                        {c.active ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditingConvenio(c); setIsModalOpen(true); }} className="p-1.5 hover:bg-slate-100 text-primary rounded-lg transition-colors cursor-pointer border-none bg-transparent">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-slate-100 text-rose-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer border-none bg-transparent">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Selecionar Plano para Simulação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {convenios.filter((c) => c.active).map((a) => (
                <div key={a.id} onClick={() => { setSelectedAgr(a); setMarkupIncrease(0); }} className={`border p-4 rounded-xl transition-all cursor-pointer flex flex-col gap-2 ${selectedAgr?.id === a.id ? "border-primary bg-primary/5 shadow-xs" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-950">{a.name}</span>
                    <Handshake className={`w-4 h-4 ${selectedAgr?.id === a.id ? "text-primary" : "text-slate-400"}`} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 border-t border-slate-100/80 pt-2 text-xs">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Prazo</p>
                      <p className="font-extrabold text-slate-800">{a.paymentTerm} dias</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Glosa</p>
                      <p className={`font-extrabold ${a.glosaTolerance > 3.5 ? "text-amber-600" : "text-emerald-600"}`}>{a.glosaTolerance}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
            {selectedAgr ? (
              <>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedAgr.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-extrabold">Simulador de Reajuste</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-3">
                  <p className="text-[10px] text-slate-400">Simule um acréscimo de {markupIncrease}% na tabela:</p>
                  <input type="range" min="0" max="15" step="1" value={markupIncrease} onChange={(e) => setMarkupIncrease(parseInt(e.target.value))} className="w-full accent-primary h-1 bg-slate-200 rounded-lg cursor-pointer" />
                  <div className="mt-2 border-t border-slate-100 pt-2">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Novo Faturamento Esperado</p>
                    <p className="text-sm font-extrabold text-primary font-mono">
                      R$ {(48000 * (1 + markupIncrease / 100)).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 text-center py-10">Selecione um plano para simular.</p>
            )}
          </div>
        </div>
      </div>

      <ModalConvenio isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingConvenio(null); }} onSave={handleSave} editData={editingConvenio} />
    </MainLayout>
  );
}
