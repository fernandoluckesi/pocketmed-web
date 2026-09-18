import { useState, useEffect, useCallback } from "react";
import { FileCheck, Paperclip } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../components/MainLayout";
import { api } from "../../services/api";

interface Certificate {
  id: string;
  patientName: string;
  patientAvatar?: string;
  cid?: string;
  daysOff?: number;
  issueDate?: string;
  fileUrl?: string;
  createdAt: string;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export default function Atestados() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCertificates = useCallback(async () => {
    try {
      const data = await api("/certificates");
      const mapped: Certificate[] = (Array.isArray(data) ? data : []).map(
        (cert: any) => ({
          id: cert.id,
          patientName:
            cert.patient?.name || cert.dependent?.name || "Paciente",
          patientAvatar: cert.patient?.profileImage || undefined,
          cid: cert.cid,
          daysOff: cert.daysOff,
          issueDate: cert.issueDate,
          fileUrl: cert.fileUrl,
          createdAt: cert.createdAt,
        }),
      );
      setCertificates(mapped);
    } catch {
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-4xl font-extrabold text-slate-900 tracking-tight">
            Atestados
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Histórico de atestados emitidos para seus pacientes.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 uppercase text-[10px] text-slate-400 font-extrabold tracking-wider">
                  <th className="px-8 py-5">Paciente</th>
                  <th className="px-6 py-5">CID</th>
                  <th className="px-6 py-5">Dias de Afastamento</th>
                  <th className="px-6 py-5">Data</th>
                  <th className="px-6 py-5 text-center">Anexo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-slate-400 text-sm">
                      Carregando...
                    </td>
                  </tr>
                ) : certificates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-800">
                        Nenhum atestado emitido
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Atestados adicionados a partir de uma consulta
                        aparecem aqui.
                      </p>
                    </td>
                  </tr>
                ) : (
                  certificates.map((cert) => (
                    <tr
                      key={cert.id}
                      className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/atestados/${cert.id}`)}
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          {cert.patientAvatar ? (
                            <img
                              alt={cert.patientName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-100"
                              src={cert.patientAvatar}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 border border-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold text-xs">
                              {cert.patientName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                          <p className="text-sm font-bold text-slate-900">
                            {cert.patientName}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {cert.cid || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {cert.daysOff ? `${cert.daysOff} dia(s)` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {formatDate(cert.issueDate || cert.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {cert.fileUrl ? (
                          <Paperclip className="w-4 h-4 text-primary inline" />
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
