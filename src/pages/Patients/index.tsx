import { useState, useMemo, useEffect, useRef } from "react";
import {
  Users,
  Search,
  Plus,
  ArrowRight,
  Info,
  LayoutGrid,
  List,
  X,
  Ban,
  History,
  Hourglass,
  CheckCircle,
  ShieldCheck,
  UserX,
  Loader2,
  Clock,
  UserPlus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { MainLayout } from "../../components/MainLayout";
import { SearchWithViewToggle } from "../../components/ui/SearchWithViewToggle";
import { Pagination } from "../../components/ui/Pagination";
import { Button } from "../../components/ui/Button";
import {
  useMyPatients,
  useSearchPatients,
  useAccessRequests,
  useCancelAccessRequest,
  useCreateShadowPatient,
} from "../../hooks/usePatients";
import type { AccessRequest } from "../../hooks/usePatients";
import { RequestAccessModal } from "../../components/RequestAccessModal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { Skeleton } from "../../components/Skeleton";
import { EmptyState } from "../../components/EmptyState";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";

// --- Types ---

type TabType = "Meus Pacientes" | "Pesquisar Pacientes" | "Solicitações";

// --- Search Tab Components ---

function SearchHero({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <h3 className="text-2xl font-black font-display tracking-tight text-gray-900">
          Encontre Novos Pacientes
        </h3>
        <p className="text-gray-500 text-sm font-medium">
          Pesquise na base global do Hispora por nome ou CPF do paciente.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-2 max-w-lg">
        <div className="flex-1 relative flex items-center">
          <Users className="absolute left-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Nome ou CPF do paciente..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
          />
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<Search className="w-4 h-4" />}
        >
          Pesquisar
        </Button>
      </div>
    </motion.section>
  );
}

// --- API Search Result Card ---

type AccessStatus = "none" | "pending" | "approved";

function APIPatientCard({
  patient,
  accessStatus,
  onRequestAccess,
}: {
  patient: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    profileImage?: string | null;
    gender?: string;
  };
  accessStatus: AccessStatus;
  onRequestAccess: (patient: {
    id: string;
    name: string;
    profileImage?: string | null;
  }) => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-soft hover:shadow-xl transition-all flex flex-col justify-between group"
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
          {patient.profileImage ? (
            <img
              src={patient.profileImage}
              alt={patient.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
              {patient.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h5 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors font-display truncate">
            {patient.name}
          </h5>
          <p className="text-gray-500 text-sm font-medium truncate">
            {patient.email || ""}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        {accessStatus === "approved" ? (
          <div className="w-full py-4 bg-green-50 rounded-2xl font-bold flex items-center justify-center gap-2 text-green-700 cursor-default">
            <CheckCircle className="w-5 h-5" />
            Acesso Concedido
          </div>
        ) : accessStatus === "pending" ? (
          <div className="w-full py-4 bg-amber-50 rounded-2xl font-bold flex items-center justify-center gap-2 text-amber-700 cursor-default">
            <Clock className="w-5 h-5" />
            Aguardando Resposta
          </div>
        ) : (
          <Button
            onClick={() => onRequestAccess(patient)}
            variant="ghost"
            size="md"
            iconRight={<ArrowRight className="w-5 h-5" />}
            fullWidth
            className="py-4 rounded-2xl text-gray-700 bg-gray-50 hover:bg-primary hover:text-white"
          >
            Solicitar Acesso
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function APIPatientListRow({
  patient,
  index,
  accessStatus,
  onRequestAccess,
}: {
  patient: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    profileImage?: string | null;
    gender?: string;
  };
  index: number;
  accessStatus: AccessStatus;
  onRequestAccess: (patient: {
    id: string;
    name: string;
    profileImage?: string | null;
  }) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -2 }}
      className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group"
    >
      <div className="flex items-center gap-5 flex-1 min-w-0">
        <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-slate-100 group-hover:border-primary/20 transition-colors">
          {patient.profileImage ? (
            <img
              src={patient.profileImage}
              alt={patient.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
              {patient.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h5 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors truncate font-display">
            {patient.name}
          </h5>
          <p className="text-slate-400 text-sm font-semibold">
            {patient.email || ""}
          </p>
        </div>
      </div>

      <div className="shrink-0 w-full md:w-auto">
        {accessStatus === "approved" ? (
          <div className="w-full md:w-auto px-6 py-3 bg-green-50 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2 cursor-default">
            <CheckCircle className="w-4 h-4" />
            Acesso Concedido
          </div>
        ) : accessStatus === "pending" ? (
          <div className="w-full md:w-auto px-6 py-3 bg-amber-50 text-amber-700 rounded-xl font-bold flex items-center justify-center gap-2 cursor-default">
            <Clock className="w-4 h-4" />
            Aguardando Resposta
          </div>
        ) : (
          <Button
            onClick={() => onRequestAccess(patient)}
            variant="ghost"
            size="md"
            iconRight={
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            }
            className="w-full md:w-auto bg-blue-50 text-primary hover:bg-primary hover:text-white rounded-xl"
          >
            Solicitar Acesso
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// --- Solicitações Tab Components ---

function RequestsTable({
  requests,
  loading,
  onCancel,
}: {
  requests: AccessRequest[];
  loading: boolean;
  onCancel: (request: AccessRequest) => void;
}) {
  const statusMap: Record<
    string,
    { label: string; style: string; dot: string }
  > = {
    pending: {
      label: "Pendente",
      style: "bg-amber-100 text-amber-700",
      dot: "bg-amber-500",
    },
    approved: {
      label: "Aprovado",
      style: "bg-green-100 text-green-700",
      dot: "bg-green-500",
    },
    rejected: {
      label: "Recusado",
      style: "bg-red-100 text-red-700",
      dot: "bg-red-500",
    },
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-100">
        <div className="p-6 border-b border-slate-100">
          <div className="h-6 bg-gray-200 rounded-lg w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded-lg w-1/2 mt-2 animate-pulse" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-24" />
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-full bg-gray-200" />
                <div className="h-4 bg-gray-100 rounded w-32" />
              </div>
              <div className="h-6 bg-gray-100 rounded-full w-20" />
              <div className="h-8 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-100">
        <EmptyState
          icon={History}
          title="Nenhuma solicitação encontrada"
          description="Você ainda não fez nenhuma solicitação de acesso. Pesquise pacientes e solicite acesso aos prontuários."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-100 transition-all duration-300">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <div>
          <h2 className="font-display font-bold text-xl text-on-surface">
            Histórico de Solicitações
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Gerencie as permissões de acesso aos prontuários dos pacientes.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-display">
                Data da Solicitação
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-display">
                Nome do Paciente
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-display text-center">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-display text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {requests.map((req) => {
              const status = statusMap[req.status] || statusMap.pending;
              const patientName =
                req.patient?.name || `Paciente ${req.patientId.slice(0, 8)}`;
              const initials = patientName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              const formattedDate = new Date(req.createdAt).toLocaleDateString(
                "pt-BR",
              );
              const formattedTime = new Date(req.createdAt).toLocaleTimeString(
                "pt-BR",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );

              return (
                <tr
                  key={req.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-on-surface">
                        {formattedDate}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        {formattedTime}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {req.patient?.profileImage ? (
                        <img
                          src={req.patient.profileImage}
                          alt={patientName}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                          {initials}
                        </div>
                      )}
                      <span className="text-sm font-medium text-on-surface">
                        {patientName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold gap-2 ${status.style}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                        ></span>
                        {status.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      {req.status === "pending" && (
                        <button
                          onClick={() => onCancel(req)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline cursor-pointer border-none bg-transparent"
                        >
                          Cancelar Solicitação
                        </button>
                      )}
                      {req.status === "rejected" && (
                        <button
                          onClick={() => onCancel(req)}
                          className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline cursor-pointer border-none bg-transparent"
                        >
                          Solicitar novamente
                        </button>
                      )}
                      {req.status === "approved" && (
                        <span
                          className="text-slate-300"
                          title="Acesso concedido"
                        >
                          <Ban size={16} />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-6 bg-slate-50/30 flex items-center justify-between border-t border-slate-50">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
          Mostrando {requests.length} de {requests.length} solicitações
        </span>
      </div>
    </div>
  );
}

function StatsSection({ requests }: { requests: AccessRequest[] }) {
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-blue-50/60 p-6 rounded-2xl border border-blue-100/50 flex items-center gap-4 group hover:bg-blue-50 transition-colors">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 transition-transform group-hover:scale-110">
          <Hourglass size={24} fill="currentColor" />
        </div>
        <div>
          <div className="text-2xl font-black text-blue-900">
            {String(pendingCount).padStart(2, "0")}
          </div>
          <div className="text-xs font-bold uppercase text-blue-700/70 tracking-tight">
            Aguardando Resposta
          </div>
        </div>
      </div>
      <div className="bg-green-50/60 p-6 rounded-2xl border border-green-100/50 flex items-center gap-4 group hover:bg-green-50 transition-colors">
        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-200 transition-transform group-hover:scale-110">
          <CheckCircle size={24} fill="currentColor" />
        </div>
        <div>
          <div className="text-2xl font-black text-green-900">
            {String(approvedCount).padStart(2, "0")}
          </div>
          <div className="text-xs font-bold uppercase text-green-700/70 tracking-tight">
            Acessos Ativos
          </div>
        </div>
      </div>
      <div className="bg-orange-50/60 p-6 rounded-2xl border border-orange-100/50 flex items-center gap-4 group hover:bg-orange-50 transition-colors">
        <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-200 transition-transform group-hover:scale-110">
          <Info size={24} fill="currentColor" />
        </div>
        <div>
          <div className="text-xs font-bold text-orange-900 leading-tight">
            Privacidade & Dados
          </div>
          <p className="text-[10px] font-medium text-orange-800/80 mt-1 leading-relaxed">
            Todas as solicitações seguem as diretrizes da LGPD e protocolos de
            segurança hospitalar.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Add Patient Modal ---

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  let masked = "";
  if (digits.length > 0) masked += `(${digits.slice(0, 2)}`;
  if (digits.length >= 2) masked += `) `;
  if (digits.length > 2) masked += digits.slice(2, 7);
  if (digits.length > 7) masked += `-${digits.slice(7, 11)}`;
  return masked;
}

const addPatientSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .required("Nome é obrigatório"),
  email: Yup.string().email("Email inválido").required("Email é obrigatório"),
  phone: Yup.string().required("Telefone é obrigatório"),
  gender: Yup.string().required("Gênero é obrigatório"),
  birthDate: Yup.string().required("Data de nascimento é obrigatória"),
});

function AddPatientModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { createPatient, loading, error, success, reset } =
    useCreateShadowPatient();
  const { user } = useAuth();
  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      gender: "",
      birthDate: "",
    },
    validationSchema: addPatientSchema,
    onSubmit: async (values) => {
      try {
        await createPatient({
          ...values,
          phone: values.phone.replace(/\D/g, ""),
          doctorCreatorId: user?.userId || "",
        });
      } catch {
        toast.error("Erro ao processar. Tente novamente.");
      }
    },
  });

  // Handle success: show message, then close and refetch
  useEffect(() => {
    if (success) {
      toast.success("Paciente cadastrado com sucesso!");
      const timer = setTimeout(() => {
        onClose();
        onSuccess?.();
        formik.resetForm();
        reset();
      }, 1500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  // Reset state when modal closes
  const handleClose = () => {
    onClose();
    formik.resetForm();
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <div className="text-primary font-black text-[10px] uppercase tracking-widest mb-2">
              Novo Cadastro
            </div>
            <h4 className="text-2xl font-display font-extrabold text-on-surface">
              Adicionar Paciente
            </h4>
          </div>
          <button
            onClick={handleClose}
            className="text-on-surface-variant hover:text-on-surface p-2 bg-surface-container-low rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="p-8 pt-4 flex flex-col items-center justify-center gap-4 min-h-[200px]">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
            <div className="text-center">
              <h5 className="text-xl font-bold text-on-surface font-display">
                Paciente cadastrado!
              </h5>
              <p className="text-on-surface-variant mt-1">
                <span className="font-semibold">{formik.values.name}</span> foi
                adicionado(a) com sucesso.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={formik.handleSubmit} className="p-8 pt-0 space-y-5">
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Nome Completo */}
            <div className="col-span-2 space-y-2">
              <label className="text-xs font-bold text-on-surface-variant ml-1">
                Nome Completo
              </label>
              <input
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none ${
                  formik.touched.name && formik.errors.name
                    ? "border-red-300 bg-red-50/30"
                    : "border-transparent"
                }`}
                type="text"
                placeholder="Ana Maria Silveira"
                {...formik.getFieldProps("name")}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-xs text-red-500 ml-1">
                  {formik.errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant ml-1">
                Email
              </label>
              <input
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-300 bg-red-50/30"
                    : "border-transparent"
                }`}
                type="email"
                placeholder="anamaria@email.com"
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-red-500 ml-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Telefone + Gênero */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant ml-1">
                  Telefone
                </label>
                <input
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none ${
                    formik.touched.phone && formik.errors.phone
                      ? "border-red-300 bg-red-50/30"
                      : "border-transparent"
                  }`}
                  type="tel"
                  placeholder="(11) 98877-6655"
                  value={formik.values.phone}
                  onChange={(e) =>
                    formik.setFieldValue("phone", formatPhone(e.target.value))
                  }
                  onBlur={formik.handleBlur("phone")}
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-xs text-red-500 ml-1">
                    {formik.errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant ml-1">
                  Gênero
                </label>
                <select
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none appearance-none ${
                    formik.touched.gender && formik.errors.gender
                      ? "border-red-300 bg-red-50/30"
                      : "border-transparent"
                  }`}
                  {...formik.getFieldProps("gender")}
                >
                  <option value="">Selecione</option>
                  <option value="female">Feminino</option>
                  <option value="male">Masculino</option>
                  <option value="other">Outro</option>
                </select>
                {formik.touched.gender && formik.errors.gender && (
                  <p className="text-xs text-red-500 ml-1">
                    {formik.errors.gender}
                  </p>
                )}
              </div>
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant ml-1">
                Data de Nascimento
              </label>
              <input
                className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none ${
                  formik.touched.birthDate && formik.errors.birthDate
                    ? "border-red-300 bg-red-50/30"
                    : "border-transparent"
                }`}
                type="date"
                {...formik.getFieldProps("birthDate")}
              />
              {formik.touched.birthDate && formik.errors.birthDate && (
                <p className="text-xs text-red-500 ml-1">
                  {formik.errors.birthDate}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="pt-4 flex gap-4">
              <Button
                type="button"
                onClick={handleClose}
                disabled={loading}
                variant="secondary"
                size="lg"
                fullWidth
                className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-none"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                variant="primary"
                size="lg"
                fullWidth
                icon={!loading ? <UserPlus className="w-5 h-5" /> : undefined}
                className="rounded-full"
              >
                {loading ? "Cadastrando..." : "Confirmar Cadastro"}
              </Button>
            </div>
          </form>
        )}

        <div className="bg-blue-50/50 p-4 flex items-center justify-center gap-2 border-t border-outline-variant/5">
          <ShieldCheck size={16} className="text-primary fill-primary/10" />
          <p className="text-[10px] font-bold text-blue-700 tracking-wide uppercase">
            Dados protegidos por criptografia Hispora
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// --- Tab Content Components ---

function SearchTabContent({
  view,
  setView,
}: {
  view: "grid" | "list";
  setView: (v: "grid" | "list") => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const { results, loading: searchLoading } = useSearchPatients(searchQuery);
  const { requests, refetch: refetchRequests } = useAccessRequests();
  const [modalPatient, setModalPatient] = useState<{
    id: string;
    name: string;
    profileImage?: string | null;
  } | null>(null);
  const toast = useToast();

  // Build a map of patientId -> access status for quick lookup
  const accessStatusMap = useMemo(() => {
    const map = new Map<string, AccessStatus>();
    for (const req of requests) {
      if (req.status === "approved") {
        map.set(req.patientId, "approved");
      } else if (req.status === "pending") {
        // Only set pending if not already approved
        if (!map.has(req.patientId) || map.get(req.patientId) !== "approved") {
          map.set(req.patientId, "pending");
        }
      }
    }
    return map;
  }, [requests]);

  const getAccessStatus = (patientId: string): AccessStatus => {
    return accessStatusMap.get(patientId) || "none";
  };

  const handleRequestAccess = (patient: {
    id: string;
    name: string;
    profileImage?: string | null;
  }) => {
    setModalPatient(patient);
  };

  const handleModalSuccess = () => {
    toast.success("Solicitação enviada com sucesso!");
    refetchRequests();
  };

  // Determine what to display: API results if search is active, otherwise mock data
  const hasSearchQuery = searchQuery.trim().length >= 2;
  const displayResults = hasSearchQuery ? results : [];

  return (
    <>
      <SearchHero searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      {hasSearchQuery && (
        <section className="space-y-8 mt-10">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
                Resultados da Busca
              </p>
              <h4 className="text-3xl font-black font-display tracking-tight">
                {searchLoading
                  ? "Buscando..."
                  : `${displayResults.length} Pacientes Encontrados`}
              </h4>
            </div>
            <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-primary"}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-primary"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Loading state for search */}
          {hasSearchQuery && searchLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-3 text-slate-500 font-medium">
                Buscando pacientes...
              </span>
            </div>
          )}

          {/* API search results */}
          {hasSearchQuery && !searchLoading && displayResults.length > 0 && (
            <motion.div
              layout
              className={
                view === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                  : "space-y-4"
              }
            >
              <AnimatePresence>
                {displayResults.map((patient, idx) =>
                  view === "grid" ? (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <APIPatientCard
                        patient={patient}
                        accessStatus={getAccessStatus(patient.id)}
                        onRequestAccess={handleRequestAccess}
                      />
                    </motion.div>
                  ) : (
                    <APIPatientListRow
                      key={patient.id}
                      patient={patient}
                      index={idx}
                      accessStatus={getAccessStatus(patient.id)}
                      onRequestAccess={handleRequestAccess}
                    />
                  ),
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty search results */}
          {hasSearchQuery && !searchLoading && displayResults.length === 0 && (
            <EmptyState
              icon={Search}
              title="Nenhum resultado encontrado"
              description="Tente buscar com outros termos ou verifique a ortografia."
            />
          )}

          {/* No mock results — only show when user searches */}
        </section>
      )}

      {/* Request Access Modal */}
      {modalPatient && (
        <RequestAccessModal
          isOpen={!!modalPatient}
          onClose={() => setModalPatient(null)}
          patient={modalPatient}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
}

function SolicitacoesTabContent({ active }: { active: boolean }) {
  const { requests, loading, refetch } = useAccessRequests();
  const { cancelRequest, loading: cancelLoading } = useCancelAccessRequest();
  const [cancelTarget, setCancelTarget] = useState<AccessRequest | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (active) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      await cancelRequest(cancelTarget.id);
      setCancelTarget(null);
      toast.success("Solicitação cancelada");
      refetch();
    } catch {
      toast.error("Erro ao processar. Tente novamente.");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <RequestsTable
          requests={requests}
          loading={loading}
          onCancel={(req) => setCancelTarget(req)}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <StatsSection requests={requests} />
      </motion.div>

      <ConfirmModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        title="Cancelar Solicitação"
        description={`Tem certeza que deseja cancelar a solicitação de acesso ao prontuário de ${cancelTarget?.patient?.name || "este paciente"}? Esta ação não pode ser desfeita.`}
        confirmLabel="Cancelar Solicitação"
        loading={cancelLoading}
      />
    </div>
  );
}

// --- My Patients Tab Content ---

function MyPatientsContent({
  refetchRef,
}: {
  refetchRef?: React.MutableRefObject<(() => void) | null>;
}) {
  const { patients, loading, error, refetch } = useMyPatients();
  const [searchFilter, setSearchFilter] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Expose refetch to parent via ref
  useEffect(() => {
    if (refetchRef) {
      refetchRef.current = refetch;
    }
  }, [refetch, refetchRef]);

  // Use API data if available, otherwise fall back to mock data
  const hasAPIData = patients.length > 0;
  const useMock = !loading && !hasAPIData && !error;

  if (loading) {
    return (
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
              Acesso Liberado
            </p>
            <h4 className="text-3xl font-black font-display tracking-tight">
              Carregando...
            </h4>
          </div>
        </div>
        <Skeleton variant="card" count={6} />
      </section>
    );
  }

  if (error && !useMock && !hasAPIData) {
    return (
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
              Acesso Liberado
            </p>
            <h4 className="text-3xl font-black font-display tracking-tight">
              Meus Pacientes
            </h4>
          </div>
        </div>
        <EmptyState
          icon={UserX}
          title="Nenhum paciente encontrado"
          description="Você ainda não possui pacientes vinculados. Pesquise e solicite acesso a novos pacientes."
        />
      </section>
    );
  }

  // Render from API data
  if (hasAPIData) {
    const filteredPatients = searchFilter.trim()
      ? patients.filter(
          (p) =>
            p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
            (p.email &&
              p.email.toLowerCase().includes(searchFilter.toLowerCase())),
        )
      : patients;

    // Paginate
    const totalFiltered = filteredPatients.length;
    const startIdx = (currentPage - 1) * pageSize;
    const paginatedPatients = filteredPatients.slice(
      startIdx,
      startIdx + pageSize,
    );

    return (
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
              Acesso Liberado
            </p>
            <h4 className="text-3xl font-black font-display tracking-tight">
              {patients.length} Pacientes Ativos
            </h4>
          </div>
        </div>

        <SearchWithViewToggle
          placeholder="Buscar por nome ou email..."
          value={searchFilter}
          onChange={setSearchFilter}
          view={view}
          onViewChange={setView}
        />

        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {paginatedPatients.map((patient, idx) =>
            view === "grid" ? (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -6 }}
                className="group"
              >
                <Link
                  to={`/patients/${patient.id}`}
                  className="block bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all no-underline text-inherit"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      {patient.profileImage ? (
                        <img
                          src={patient.profileImage}
                          alt={patient.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors font-display truncate">
                        {patient.name}
                      </h5>
                      <p className="text-gray-500 text-sm font-medium">
                        {patient.email || patient.phone || ""}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${patient.isShadow ? "bg-blue-50 text-blue-700" : "bg-green-100 text-green-700"}`}
                      >
                        <CheckCircle size={12} />
                        {patient.isShadow ? "Local" : "Ativo"}
                        {patient.isShadow && (
                          <span className="relative group/tip cursor-help">
                            <Info size={12} className="text-blue-500" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-slate-900 text-white text-[10px] font-normal normal-case rounded-lg opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all z-50 text-center leading-relaxed shadow-lg">
                              Este paciente está cadastrado somente para
                              visualização deste médico. Para compartilhar com
                              outros profissionais, o paciente deve baixar o
                              aplicativo Hispora no celular.
                            </span>
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400">
                      Ver prontuário completo
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <Link
                  to={`/patients/${patient.id}`}
                  className="block bg-white p-5 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all no-underline text-inherit"
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-slate-100">
                        {patient.profileImage ? (
                          <img
                            src={patient.profileImage}
                            alt={patient.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-lg">
                            {patient.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-base leading-tight hover:text-primary transition-colors font-display truncate">
                          {patient.name}
                        </h5>
                        <p className="text-gray-400 text-sm font-medium truncate">
                          {patient.email || patient.phone || ""}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${patient.isShadow ? "bg-blue-50 text-blue-700" : "bg-green-100 text-green-700"}`}
                      >
                        <CheckCircle size={12} />
                        {patient.isShadow ? "Local" : "Ativo"}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ),
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={totalFiltered}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          label="pacientes"
        />
      </section>
    );
  }

  // No patients found — show empty state
  return (
    <section className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
            Acesso Liberado
          </p>
          <h4 className="text-3xl font-black font-display tracking-tight">
            Meus Pacientes
          </h4>
        </div>
      </div>
      <EmptyState
        icon={UserX}
        title="Nenhum paciente vinculado"
        description="Você ainda não possui pacientes com acesso liberado. Pesquise pacientes na aba 'Pesquisar Pacientes' e solicite acesso."
      />
    </section>
  );
}

// --- Main Page Component ---

export default function Patients() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<TabType>("Meus Pacientes");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const refetchPatientsRef = useRef<(() => void) | null>(null);

  const handlePatientCreated = () => {
    refetchPatientsRef.current?.();
  };

  const tabs: TabType[] = [
    "Meus Pacientes",
    "Pesquisar Pacientes",
    "Solicitações",
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-surface selection:bg-primary/10">
        <div className="space-y-12">
          {/* Header Action */}
          <div className="space-y-6">
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <h2 className="text-4xl font-extrabold font-display tracking-tight text-gray-900 leading-none">
                  Gestão de Pacientes
                </h2>
                <p className="text-gray-500 font-medium">
                  Pesquise e gerencie sua base de pacientes global.
                </p>
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="primary"
                size="md"
                icon={<Plus className="w-5 h-5" />}
              >
                Adicionar Paciente
              </Button>
            </div>

            <div className="flex space-x-1 p-1 bg-white rounded-2xl w-fit shadow-sm border border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (
                      tab === "Meus Pacientes" &&
                      refetchPatientsRef.current
                    ) {
                      refetchPatientsRef.current();
                    }
                  }}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                    tab === activeTab
                      ? "bg-primary/5 text-primary"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className={activeTab === "Pesquisar Pacientes" ? "" : "hidden"}>
            <SearchTabContent view={view} setView={setView} />
          </div>
          <div className={activeTab === "Solicitações" ? "" : "hidden"}>
            <SolicitacoesTabContent active={activeTab === "Solicitações"} />
          </div>
          <div className={activeTab === "Meus Pacientes" ? "" : "hidden"}>
            <MyPatientsContent refetchRef={refetchPatientsRef} />
          </div>
        </div>

        {/* Add Patient Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <AddPatientModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSuccess={handlePatientCreated}
            />
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
