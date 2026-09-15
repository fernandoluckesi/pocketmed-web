import { useCallback, useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { BackofficeLayout } from "../../components/BackofficeLayout";
import { Pagination } from "../../components/ui/Pagination";
import { useToast } from "../../contexts/ToastContext";
import {
  listAuditEvents,
  type AuditEventItem,
} from "../../services/backoffice";

const ACTION_FILTERS = [
  { key: "", label: "Todas as ações" },
  { key: "APPROVE", label: "Aprovações" },
  { key: "REJECT", label: "Rejeições" },
  { key: "LOGIN", label: "Logins" },
  { key: "LOGIN_FAILURE", label: "Falhas de login" },
  { key: "ACCESS_DENIED", label: "Acessos negados" },
] as const;

const ACTION_STYLES: Record<string, string> = {
  APPROVE: "bg-emerald-50 text-emerald-700 border-emerald-100/60",
  REJECT: "bg-rose-50 text-rose-700 border-rose-100/60",
  LOGIN: "bg-blue-50 text-primary border-blue-100/60",
  LOGIN_FAILURE: "bg-amber-50 text-amber-700 border-amber-100/60",
  ACCESS_DENIED: "bg-rose-50 text-rose-700 border-rose-100/60",
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR");
}

export default function BackofficeAudit() {
  const toast = useToast();
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listAuditEvents({
        action: action || undefined,
        page,
        limit: pageSize,
      });
      setEvents(result.data);
      setTotal(result.total);
    } catch {
      toast.error("Erro ao carregar a auditoria.");
      setEvents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <BackofficeLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">
            Auditoria
          </h1>
          <p className="text-slate-500">
            Registro imutável de aprovações, rejeições e acessos realizados na
            plataforma.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 flex flex-wrap gap-2">
          {ACTION_FILTERS.map((filter) => (
            <button
              key={filter.key || "all"}
              type="button"
              onClick={() => {
                setAction(filter.key);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                action === filter.key
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 uppercase text-[10px] text-slate-400 font-extrabold tracking-wider">
                  <th className="px-8 py-5">Data e Hora</th>
                  <th className="px-6 py-5">Ação</th>
                  <th className="px-6 py-5">Recurso</th>
                  <th className="px-6 py-5">Autor</th>
                  <th className="px-8 py-5">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-16 text-slate-400"
                    >
                      Carregando...
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <ScrollText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-800">
                        Nenhum evento encontrado
                      </p>
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50/50">
                      <td className="px-8 py-4">
                        <p className="text-sm font-bold text-slate-800">
                          {formatDateTime(event.timestamp)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
                            ACTION_STYLES[event.action] ||
                            "bg-slate-100 text-slate-600 border-slate-200/60"
                          }`}
                        >
                          {event.action}
                        </span>
                        {!event.success && (
                          <p className="text-[10px] text-rose-600 font-bold mt-1">
                            {event.reason || "FALHA"}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {event.resourceType}
                        </p>
                        {event.resourceId && (
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {event.resourceId.slice(0, 8)}…
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700">
                          {event.actorRole || "—"}
                        </p>
                        {event.actorUserId && (
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {event.actorUserId.slice(0, 8)}…
                          </p>
                        )}
                      </td>
                      <td className="px-8 py-4">
                        {event.changedFields ? (
                          <p className="text-[11px] text-slate-600 font-mono">
                            {Object.entries(event.changedFields)
                              .map(
                                ([field, diff]) =>
                                  `${field}: ${String(diff.before)} → ${String(diff.after)}`,
                              )
                              .join(", ")}
                          </p>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
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
              label="eventos"
            />
          </div>
        </div>
      </div>
    </BackofficeLayout>
  );
}
