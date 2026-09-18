import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  FileCheck,
  Edit,
  Trash2,
  Download,
} from "lucide-react";
import { MainLayout } from "../../components/MainLayout";
import { Button } from "../../components/ui/Button";
import { useDialog } from "../../components/ui/Dialog";
import { api, ApiError } from "../../services/api";
import { AtestadoForm, type CertificateRecord } from "./AtestadoForm";

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-800">{value || "—"}</p>
    </div>
  );
}

export default function AtestadoDetail() {
  const navigate = useNavigate();
  const dialog = useDialog();
  const { id } = useParams<{ id: string }>();
  const [certificate, setCertificate] = useState<CertificateRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api(`/certificates/${id}`);
      setCertificate(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.data.message || "Atestado não encontrado."
          : "Erro ao carregar atestado.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!id) return;
    const confirmed = await dialog.showConfirm(
      "Tem certeza que deseja excluir este atestado?",
      "Excluir Atestado",
    );
    if (!confirmed) return;
    try {
      await api(`/certificates/${id}`, { method: "DELETE" });
      navigate("/atestados");
    } catch {
      dialog.showError("Erro ao excluir atestado. Tente novamente.");
    }
  }

  const patientName =
    certificate?.patient?.name || certificate?.dependent?.name || "Paciente";

  return (
    <MainLayout>
      <div className="space-y-8">
        <button
          onClick={() => navigate("/atestados")}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft size={20} />
          <span>Voltar para Atestados</span>
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : error || !certificate ? (
          <div className="text-center py-20">
            <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">
              {error || "Atestado não encontrado."}
            </p>
          </div>
        ) : editing ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <AtestadoForm
              initial={certificate}
              onClose={() => setEditing(false)}
              onSaved={load}
            />
          </div>
        ) : (
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-soft space-y-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileCheck className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
                    Atestado Médico
                  </p>
                  <h2 className="text-2xl font-black font-display tracking-tight text-gray-900">
                    {patientName}
                  </h2>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  onClick={() => setEditing(true)}
                  variant="secondary"
                  size="sm"
                  icon={<Edit className="w-3.5 h-3.5" />}
                  className="cursor-pointer"
                >
                  Editar
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="secondary"
                  size="sm"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  className="cursor-pointer bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Excluir
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <DetailField label="CRM do Médico" value={certificate.crm} />
              <DetailField label="CID" value={certificate.cid} />
              <DetailField
                label="Dias de Afastamento"
                value={
                  certificate.daysOff != null
                    ? `${certificate.daysOff} dia(s)`
                    : null
                }
              />
              <DetailField
                label="Data do Atestado"
                value={formatDate(certificate.issueDate || certificate.createdAt)}
              />
            </div>

            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                Descrição
              </p>
              <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">
                {certificate.description || "—"}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              {certificate.fileUrl ? (
                <a
                  href={certificate.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  <Download className="w-4 h-4" />
                  Baixar anexo do atestado
                </a>
              ) : (
                <p className="text-sm text-slate-400">
                  Nenhum arquivo anexado a este atestado.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
