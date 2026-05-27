import { useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { MainLayout } from "../../components/MainLayout";

interface Transaction {
  id: string;
  patient: string;
  procedure: string;
  doctor: string;
  value: number;
  status: "Pago" | "Pendente" | "Glosado";
  date: string;
  specialty: string;
  agreement: string;
}

const mockTransactions: Transaction[] = [
  { id: "1", patient: "Maria Silva", procedure: "Consulta Cardiológica", doctor: "Dr. André Santos", value: 450, status: "Pago", date: "2026-05-20", specialty: "Cardiologia", agreement: "Unimed" },
  { id: "2", patient: "João Oliveira", procedure: "Ecocardiograma", doctor: "Dra. Beatriz Lima", value: 850, status: "Pendente", date: "2026-05-21", specialty: "Cardiologia", agreement: "Bradesco Saúde" },
  { id: "3", patient: "Ana Costa", procedure: "Consulta Ortopédica", doctor: "Dr. André Santos", value: 380, status: "Pago", date: "2026-05-22", specialty: "Ortopedia", agreement: "Particular" },
  { id: "4", patient: "Pedro Souza", procedure: "Raio-X Coluna", doctor: "Dra. Carla Vieira", value: 220, status: "Glosado", date: "2026-05-23", specialty: "Ortopedia", agreement: "Amil" },
  { id: "5", patient: "Lucia Ferreira", procedure: "Consulta Pediátrica", doctor: "Dra. Carla Vieira", value: 350, status: "Pendente", date: "2026-05-24", specialty: "Pediatria", agreement: "SulAmérica" },
  { id: "6", patient: "Carlos Mendes", procedure: "Eletrocardiograma", doctor: "Dra. Beatriz Lima", value: 280, status: "Pago", date: "2026-05-25", specialty: "Cardiologia", agreement: "Unimed" },
  { id: "7", patient: "Fernanda Lima", procedure: "Cirurgia Artroscópica", doctor: "Dr. André Santos", value: 4500, status: "Pago", date: "2026-05-18", specialty: "Ortopedia", agreement: "Bradesco Saúde" },
];

export default function Revenue() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [search, setSearch] = useState("");
  const [filterDoc, setFilterDoc] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");

  // Form state
  const [patient, setPatient] = useState("");
  const [procedure, setProcedure] = useState("");
  const [doctor, setDoctor] = useState("Dr. André Santos");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"Pago" | "Pendente" | "Glosado">("Pago");
  const [specialty, setSpecialty] = useState("Cardiologia");
  const [agreement, setAgreement] = useState("Unimed");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient || !procedure || !value) return;
    const newTransaction: Transaction = {
      id: `t-${Date.now()}`,
      patient,
      procedure,
      doctor,
      value: parseFloat(value),
      status,
      date: new Date().toISOString().split("T")[0],
      specialty,
      agreement,
    };
    setTransactions([newTransaction, ...transactions]);
    setPatient("");
    setProcedure("");
    setValue("");
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const filtered = transactions.filter((t) => {
    const matchesSearch = t.patient.toLowerCase().includes(search.toLowerCase()) || t.procedure.toLowerCase().includes(search.toLowerCase());
    const matchesDoc = filterDoc === "Todos" || t.doctor === filterDoc;
    const matchesStatus = filterStatus === "Todos" || t.status === filterStatus;
    return matchesSearch && matchesDoc && matchesStatus;
  });

  const totalFilteredValue = filtered.reduce((acc, t) => acc + t.value, 0);

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">Receitas Médicas</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Controle de faturamento, guias de convênios e pagamentos particulares</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Faturar Guia / Consulta</span>
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Inserir Nova Guia / Lançamento Financeiro</h3>
              <p className="text-[10px] text-slate-400 mt-1">Preencha os dados do atendimento médico para registrar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Paciente</label>
                <input type="text" value={patient} onChange={(e) => setPatient(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden" placeholder="Nome completo do paciente" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Procedimento</label>
                <input type="text" value={procedure} onChange={(e) => setProcedure(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden" placeholder="Consulta, Ecocardiograma, Cirurgia" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Médico Responsável</label>
                <select value={doctor} onChange={(e) => setDoctor(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden">
                  <option value="Dr. André Santos">Dr. André Santos (Diretor)</option>
                  <option value="Dra. Beatriz Lima">Dra. Beatriz Lima (Cardio)</option>
                  <option value="Dra. Carla Vieira">Dra. Carla Vieira (Pediatria)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
                <input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-mono" placeholder="0.00" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Especialidade</label>
                <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden">
                  <option value="Cardiologia">Cardiologia</option>
                  <option value="Ortopedia">Ortopedia</option>
                  <option value="Pediatria">Pediatria</option>
                  <option value="Geral">Clínica Geral</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Convênio / Particular</label>
                <select value={agreement} onChange={(e) => setAgreement(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden">
                  <option value="Unimed">Unimed</option>
                  <option value="Bradesco Saúde">Bradesco Saúde</option>
                  <option value="Amil">Amil</option>
                  <option value="SulAmérica">SulAmérica</option>
                  <option value="Particular">Particular</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status Recebimento</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as "Pago" | "Pendente" | "Glosado")} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden">
                  <option value="Pago">Pago</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Glosado">Glosado</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 cursor-pointer">Cancelar</button>
              <button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm">Confirmar Lançamento</button>
            </div>
          </form>
        )}

        {/* Filter Options */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-slate-200 rounded-xl p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden" placeholder="Filtrar por paciente ou procedimento" />
          </div>
          <div>
            <select value={filterDoc} onChange={(e) => setFilterDoc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden">
              <option value="Todos">Médico: Todos</option>
              <option value="Dr. André Santos">Dr. André Santos</option>
              <option value="Dra. Beatriz Lima">Dra. Beatriz Lima</option>
              <option value="Dra. Carla Vieira">Dra. Carla Vieira</option>
            </select>
          </div>
          <div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden">
              <option value="Todos">Status: Todos</option>
              <option value="Pago">Pago</option>
              <option value="Pendente">Pendente</option>
              <option value="Glosado">Glosado</option>
            </select>
          </div>
          <div className="flex items-center justify-end px-2">
            <span className="text-[11px] font-bold text-slate-500">
              Filtrados: <strong className="text-blue-600">R$ {totalFilteredValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-3 font-bold">Paciente</th>
                  <th className="px-6 py-3 font-bold">Procedimento</th>
                  <th className="px-6 py-3 font-bold">Médico / Especialidade</th>
                  <th className="px-6 py-3 font-bold">Convênio</th>
                  <th className="px-6 py-3 font-bold text-right">Valor</th>
                  <th className="px-6 py-3 font-bold text-center">Status</th>
                  <th className="px-6 py-3 font-bold text-center">Excluir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5">
                      <p className="font-bold text-slate-900">{t.patient}</p>
                      <p className="text-[9px] text-slate-400 font-medium font-mono">{t.date}</p>
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-700">{t.procedure}</td>
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-slate-800">{t.doctor}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{t.specialty}</p>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-600">{t.agreement}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-slate-900 font-mono">R$ {t.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${t.status === "Pago" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : t.status === "Pendente" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-rose-100 text-rose-700 border border-rose-200"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <button onClick={() => handleDelete(t.id)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-md transition-all cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
