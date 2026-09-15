import { useCallback, useEffect, useState } from "react";
import {
  FileCheck2,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from "lucide-react";
import { BackofficeLayout } from "../../components/BackofficeLayout";
import { Pagination } from "../../components/ui/Pagination";
import { useToast } from "../../contexts/ToastContext";
import {
  getVerificationStats,
  listSubmissions,
  type Submission,
} from "../../services/backoffice";
import { SubmissionReviewModal } from "./SubmissionReviewModal";

const STATUS_TABS = [
  { key: "SUBMITTED", label: "Aguardando análise" },
  { key: "APPROVED", label: "Aprovados" },
  { key: "REJECTED", label: "Rejeitados" },
  { key: "PENDING", label: "Incompletos" },
] as const;

const STATUS_BADGES: Record<string, string> = {
  SUBMITTED: "bg-blue-50 text-primary border-blue-100/60",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-100/60",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-100/60",
  PENDING: "bg-slate-100 text-slate-500 border-slate-200/60",
};

const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Aguardando",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  PENDING: "Incompleto",
};

export default function DoctorVerification() {
  const toast = useToast();
  const [status, setStatus] = useState<string>("SUBMITTED");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
  });
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [result, statsResult] = await Promise.all([
        listSubmissions({ status, search, page, limit: pageSize }),
        getVerificationStats().catch(() => null),
      ]);
      setSubmissions(result.data);
      setTotal(result.total);
      if (statsResult) setStats(statsResult);
    } catch {
      toast.error("Erro ao carregar as submissões.");
      setSubmissions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
    // toast is stable from context; excluded to avoid refetch loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <BackofficeLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">
            Análise de Documentos
          </h1>
          <p className="text-slate-500">
            Revise as credenciais enviadas pelos médicos e aprove ou rejeite
            cada documento.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Clock}
            label="Aguardando"
            value={stats.submitted}
            colorClass="bg-primary/10 text-primary"
          />
          <StatCard
            icon={CheckCircle2}
            label="Aprovados"
            value={stats.approved}
            colorClass="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={XCircle}
            label="Rejeitados"
            value={stats.rejected}
            colorClass="bg-rose-50 text-rose-600"
          />
          <StatCard
            icon={ShieldAlert}
            label="Incompletos"
            value={stats.pending}
            colorClass="bg-amber-50 text-amber-600"
          />
        </div>

        {/* Filters */}
        <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setStatus(tab.key);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  status === tab.key
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative md:ml-auto md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Nome, email ou CRM..."
              aria-label="Buscar médico"
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 uppercase text-[10px] text-slate-400 font-extrabold tracking-wider">
                  <th className="px-8 py-5">Médico</th>
                  <th className="px-6 py-5">CRM</th>
                  <th className="px-6 py-5">Especialidade</th>
                  <th className="px-6 py-5">Documentos</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-16 text-slate-400"
                    >
                      Carregando...
                    </td>
                  </tr>
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-800">
                        Nenhuma submissão encontrada
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Ajuste os filtros para ver outros registros.
                      </p>
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => {
                    const approved = sub.documents.filter(
                      (d) => d.status === "APPROVED",
                    ).length;
                    return (
                      <tr
                        key={sub.id}
                        className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedDoctorId(sub.id)}
                      >
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            {sub.profileImage ? (
                              <img
                                alt={sub.name}
                                src={sub.profileImage}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-full object-cover border border-slate-100"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-slate-100 border border-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold text-xs">
                                {sub.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {sub.name}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {sub.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-800 font-mono">
                            {sub.crm || "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200/20 text-slate-600 rounded-full text-[11px] font-bold">
                            {sub.specialty || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">
                            {approved}/{sub.documents.length} aprovados
                          </p>
                          {sub.pendingCount > 0 && (
                            <p className="text-[11px] text-primary font-bold mt-0.5">
                              {sub.pendingCount} aguardando
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
                              STATUS_BADGES[sub.verificationStatus] ||
                              STATUS_BADGES.PENDING
                            }`}
                          >
                            {STATUS_LABELS[sub.verificationStatus] ||
                              sub.verificationStatus}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDoctorId(sub.id);
                            }}
                            className="px-4 py-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all cursor-pointer border-none"
                          >
                            Analisar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50/60 px-8 py-4 border-t border-slate-100">
            <Pagination
              currentPage={page}
              totalItems={total}
              pageSize={pageSize}
              onPageChange={setPage}
              label="submissões"
            />
          </div>
        </div>
      </div>

      <SubmissionReviewModal
        doctorId={selectedDoctorId}
        onClose={() => setSelectedDoctorId(null)}
        onReviewed={load}
      />
    </BackofficeLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="bg-white p-5 rounded-2xl flex items-center gap-4 border border-slate-100 shadow-sm">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <h4 className="text-2xl font-display font-extrabold text-slate-900">
          {value}
        </h4>
      </div>
    </div>
  );
}
