import { useState, useRef } from "react";
import { FileUp, CheckCircle, X, ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../components/MainLayout";

interface DocState {
  file: File | null;
  status: "NOT_UPLOADED" | "PENDING" | "APPROVED" | "REJECTED";
}

const DOCUMENTS = [
  {
    key: "CIM",
    label: "Carteira de Identidade Médica (CIM)",
    description: "Documento de identidade profissional emitido pelo CRM, com validade de RG em todo o território nacional.",
  },
  {
    key: "DIPLOMA",
    label: "Diploma de Graduação em Medicina",
    description: "Cópia frente e verso do diploma emitido por instituição reconhecida pelo MEC.",
  },
  {
    key: "REGULARIDADE",
    label: "Certificado de Regularidade de Inscrição",
    description: "Certidão emitida pelo CRM do estado que atesta licença ativa e sem impedimentos.",
  },
  {
    key: "RQE",
    label: "Comprovante de RQE (Registro de Qualificação de Especialista)",
    description: "Certificado do RQE emitido pelo CRM para classificação por especialidade.",
  },
];

export default function Verification() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Record<string, DocState>>({
    CIM: { file: null, status: "NOT_UPLOADED" },
    DIPLOMA: { file: null, status: "NOT_UPLOADED" },
    REGULARIDADE: { file: null, status: "NOT_UPLOADED" },
    RQE: { file: null, status: "NOT_UPLOADED" },
  });

  const fileRefs = {
    CIM: useRef<HTMLInputElement>(null),
    DIPLOMA: useRef<HTMLInputElement>(null),
    REGULARIDADE: useRef<HTMLInputElement>(null),
    RQE: useRef<HTMLInputElement>(null),
  };

  const handleFileChange = (key: string, file: File | null) => {
    setDocs((prev) => ({
      ...prev,
      [key]: { file, status: file ? "PENDING" : "NOT_UPLOADED" },
    }));
  };

  const uploadedCount = Object.values(docs).filter((d) => d.file !== null).length;

  const handleSubmitAll = () => {
    // TODO: integrate with API POST /doctors/documents/:type
    alert("Documentos enviados para análise. Você será notificado quando a verificação for concluída.");
    navigate("/dashboard");
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft size={20} />
          <span>Voltar ao Dashboard</span>
        </button>

        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-2xl">
              <ShieldAlert className="w-7 h-7 text-amber-700" />
            </div>
            <div>
              <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
                Verificação Profissional
              </h2>
              <p className="text-slate-500 text-sm">
                Envie os documentos obrigatórios para validar seu cadastro médico.
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-700">Progresso do envio</span>
            <span className="text-sm font-bold text-primary">{uploadedCount}/4 documentos</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${(uploadedCount / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Document Cards */}
        <div className="space-y-4">
          {DOCUMENTS.map((doc) => {
            const state = docs[doc.key];
            const ref = fileRefs[doc.key as keyof typeof fileRefs];

            return (
              <div
                key={doc.key}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">{doc.label}</h4>
                    <p className="text-xs text-slate-500 mt-1">{doc.description}</p>
                  </div>
                  {state.file && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase shrink-0">
                      <CheckCircle size={12} />
                      Enviado
                    </span>
                  )}
                </div>

                <input
                  ref={ref}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleFileChange(doc.key, e.target.files?.[0] || null)}
                />

                {state.file ? (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-sm text-green-800 font-medium truncate flex-1">
                      {state.file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleFileChange(doc.key, null)}
                      className="text-slate-400 hover:text-red-500 border-none bg-transparent cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => ref.current?.click()}
                    className="w-full flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer border border-dashed border-slate-300"
                  >
                    <FileUp className="w-4 h-4 text-slate-400" />
                    Selecionar arquivo (PDF, JPG ou PNG)
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmitAll}
          disabled={uploadedCount < 4}
          className={`w-full py-4 rounded-2xl font-bold text-white transition-all cursor-pointer border-none ${
            uploadedCount === 4
              ? "bg-primary shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.99]"
              : "bg-slate-300 cursor-not-allowed"
          }`}
        >
          {uploadedCount === 4 ? "Enviar Documentos para Verificação" : `Selecione todos os 4 documentos (${uploadedCount}/4)`}
        </button>
      </div>
    </MainLayout>
  );
}
