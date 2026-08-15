import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Download,
  PlusCircle,
  CalendarDays,
  SlidersHorizontal,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MainLayout } from "../../components/MainLayout";
import { api } from "../../services/api";

// --- Types ---
interface Consultation {
  id: string;
  patientName: string;
  patientCpf: string;
  patientAvatar?: string;
  date: string;
  time: string;
  doctorName: string;
  specialty: string;
  status: "REALIZADA" | "AGENDADA" | "CANCELADA";
}

// --- Helpers ---
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${d.getDate().toString().padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function mapStatus(apt: any): "REALIZADA" | "AGENDADA" | "CANCELADA" {
  if (apt.isCompleted || apt.status === "completed") return "REALIZADA";
  if (apt.status === "rejected" || apt.status === "cancelled") return "CANCELADA";
  return "AGENDADA";
}

// --- Main Page ---
export default function Consultations() {
  const [statusFilter, setStatusFilter] = useState<"Todas" | "Agendadas" | "Realizadas" | "Canceladas">("Todas");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [_loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  const loadConsultations = useCallback(async () => {
    try {
      const data = await api("/appointments");
      const mapped: Consultation[] = (Array.isArray(data) ? data : []).map((apt: any) => {
        const dt = new Date(apt.dateTime);
        return {
          id: apt.id,
          patientName: apt.patient?.name || apt.patientName || "Paciente",
          patientCpf: apt.patient?.phone || "",
          patientAvatar: apt.patient?.profileImage || undefined,
          date: apt.dateTime,
          time: dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          doctorName: apt.doctorName || "—",
          specialty: apt.doctorSpecialty || "—",
          status: mapStatus(apt),
        };
      });
      setConsultations(mapped);
    } catch {
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConsultations(); }, [loadConsultations]);

  const filteredConsultations = consultations.filter((con) => {
    if (statusFilter === "Todas") return true;
    if (statusFilter === "Agendadas") return con.status === "AGENDADA";
    if (statusFilter === "Realizadas") return con.status === "REALIZADA";
    return con.status === "CANCELADA";
  });

  const totalItems = filteredConsultations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConsultations = filteredConsultations.slice(startIndex, startIndex + itemsPerPage);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">
              Gestão de Consultas
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              Visualize e organize o fluxo de atendimento.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200/40 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors cursor-pointer">
              <Download className="w-4 h-4 text-slate-500" />
              Exportar
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer">
              <PlusCircle className="w-4 h-4" />
              Agendar Consulta
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 bg-slate-50 border border-slate-200/40 rounded-2xl p-4 flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest px-1">
              Filtrar por Status
            </label>
            <div className="flex p-1 bg-slate-200/55 rounded-xl border border-slate-200/20">
              {(["Todas", "Agendadas", "Realizadas", "Canceladas"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => { setStatusFilter(filter); setCurrentPage(1); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border-none ${
                    statusFilter === filter
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 bg-slate-50 border border-slate-200/40 rounded-2xl p-4 flex flex-col gap-2">
            <label className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest px-1">
              Período
            </label>
            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-200/50">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-800 flex-1"
              />
              <span className="text-xs text-slate-400">até</span>
              <input
                type="date"
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-800 flex-1"
              />
            </div>
          </div>

          <div className="md:col-span-3 bg-slate-50 border border-slate-200/40 rounded-2xl p-4 flex flex-col justify-center">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`w-full py-2.5 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                showAdvancedFilters
                  ? "bg-slate-200 border-slate-300 text-slate-900"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtros Avançados
            </button>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 border border-slate-200/30 p-4 rounded-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Especialidade</label>
              <select className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-primary text-slate-700">
                <option>Todas</option>
                <option>Cardiologia</option>
                <option>Dermatologia</option>
                <option>Neurologia</option>
                <option>Pediatria</option>
                <option>Clínica Geral</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Profissional</label>
              <select className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-primary text-slate-700">
                <option>Todos</option>
                <option>Dr. Ricardo Fontes</option>
                <option>Dra. Alice Moraes</option>
                <option>Dra. Juliana Lima</option>
                <option>Dr. Marcos Vale</option>
              </select>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 uppercase text-[10px] text-slate-400 font-extrabold tracking-wider">
                  <th className="px-8 py-5">Paciente</th>
                  <th className="px-6 py-5">Data e Hora</th>
                  <th className="px-6 py-5">Médico</th>
                  <th className="px-6 py-5">Especialidade</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedConsultations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-800">Nenhuma consulta encontrada</p>
                      <p className="text-xs text-slate-400 mt-1">Tente mudar o filtro de status.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedConsultations.map((con) => (
                    <tr key={con.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          {con.patientAvatar ? (
                            <img alt={con.patientName} className="w-10 h-10 rounded-full object-cover border border-slate-100" src={con.patientAvatar} referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 border border-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold text-xs">
                              {con.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-slate-900">{con.patientName}</p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">CPF: {con.patientCpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, "$1.***.***-$4")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{formatDate(con.date)}</p>
                        <p className="text-[11px] text-slate-400 font-bold mt-0.5">{con.time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-800">{con.doctorName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200/20 text-on-surface-variant rounded-full text-[11px] font-bold">
                          {con.specialty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {con.status === "REALIZADA" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-emerald-100/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            Realizada
                          </span>
                        )}
                        {con.status === "AGENDADA" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-primary rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-blue-100/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            Agendada
                          </span>
                        )}
                        {con.status === "CANCELADA" && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-slate-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Cancelada
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all cursor-pointer border-none bg-transparent">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-all cursor-pointer border-none bg-transparent">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer border-none bg-transparent">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-slate-50/60 px-8 py-4 flex items-center justify-between border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Mostrando {paginatedConsultations.length} de {totalItems} consultas
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 text-slate-400 hover:text-primary transition-all disabled:opacity-30 cursor-pointer border-none bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer border-none ${
                      currentPage === pg
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-200/50 bg-transparent"
                    }`}
                  >
                    {pg}
                  </button>
                ))}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 text-slate-400 hover:text-primary transition-all disabled:opacity-30 cursor-pointer border-none bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
