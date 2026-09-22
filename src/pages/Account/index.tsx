import { useState, useRef, useEffect } from "react";
import {
  Camera,
  Save,
  Lock,
  CreditCard,
  ShieldAlert,
  Building2,
  CheckCircle2,
  Users,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "motion/react";
import { MainLayout } from "../../components/MainLayout";
import { VerificationStatusCard } from "../../components/VerificationStatusCard";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { PasswordStrengthIndicator } from "../../components/PasswordStrengthIndicator";
import { useDialog } from "../../components/ui/Dialog";
import { Link, useLocation } from "react-router-dom";
import api from "../../config/api";
import { isValidCpf, maskCpf, normalizeCpf } from "../../utils/cpf";
import { fetchCep } from "../../services/cep";

// --- Subscription types ---

interface PlanFeatures {
  agenda: boolean;
  prontuario: boolean;
  examesDocumentos: boolean;
  dependentes: boolean;
  secretaria: boolean;
  gestaoClinica: boolean;
  financeiro: boolean;
  ocrIa: boolean;
  relatoriosAvancados: boolean;
  auditoriaAvancada: boolean;
  integracoesApi: boolean;
  suportePrioritario: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number | null;
  description: string;
  professionalsIncluded: number | null;
  activePatientsIncluded: number | null;
  additionalProfessionalPrice: number | null;
  additionalPatientsPer1000Price: number | null;
  highlighted?: boolean;
  features: PlanFeatures;
}

interface ClinicMembershipInfo {
  clinicId: string;
  name: string;
  cnpj: string | null;
  isActive: boolean;
  role: string;
  membershipId: string;
  joinedAt: string;
}

interface SubscriptionInfo {
  plan: Plan;
  additionalProfessionals: number;
  usage: {
    professionals: number;
    professionalsLimit: number | null;
    activePatients: number;
    activePatientsLimit: number | null;
  };
  billing: {
    managed: boolean;
    status: string | null;
    currentPeriodEnd: string | null;
    gatewayAvailable: boolean;
  };
}

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: "Ativa",
  trialing: "Em teste",
  past_due: "Pagamento pendente",
  canceled: "Cancelada",
  incomplete: "Incompleta",
  unpaid: "Não paga",
};

function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  let masked = digits;
  if (digits.length > 2) masked = digits.slice(0, 2) + "." + digits.slice(2);
  if (digits.length > 5) masked = masked.slice(0, 6) + "." + digits.slice(5);
  if (digits.length > 8) masked = masked.slice(0, 10) + "/" + digits.slice(8);
  if (digits.length > 12) masked = masked.slice(0, 15) + "-" + digits.slice(12);
  return masked;
}

function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) return digits.slice(0, 5) + "-" + digits.slice(5);
  return digits;
}

function formatPriceBRL(value: number | null): string {
  if (value === null) return "Sob consulta";
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

const profileSchema = Yup.object({
  name: Yup.string()
    .min(3, "Mínimo 3 caracteres")
    .required("Nome é obrigatório"),
  email: Yup.string().email("Email inválido").required("Email é obrigatório"),
  phone: Yup.string().required("Telefone é obrigatório"),
  gender: Yup.string().required("Gênero é obrigatório"),
  birthDate: Yup.string().required("Data de nascimento é obrigatória"),
  specialty: Yup.string().required("Especialidade é obrigatória"),
  crm: Yup.string().required("CRM é obrigatório"),
  cpf: Yup.string()
    .required("CPF é obrigatório")
    .test("cpf-valid", "CPF inválido", (val) => isValidCpf(val)),
});

const passwordSchema = Yup.object({
  oldPassword: Yup.string().required("Senha atual é obrigatória"),
  newPassword: Yup.string()
    .min(8, "Mínimo 8 caracteres")
    .matches(/[A-Z]/, "Deve conter letra maiúscula")
    .matches(/[a-z]/, "Deve conter letra minúscula")
    .matches(/\d/, "Deve conter um número")
    .matches(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      "Deve conter caractere especial",
    )
    .required("Nova senha é obrigatória"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Senhas não conferem")
    .required("Confirme a nova senha"),
});

export default function Account() {
  const { user } = useAuth();
  const dialog = useDialog();
  const location = useLocation();
  const navigationState = location.state as
    | { tab?: "profile" | "security" | "subscription"; planId?: string }
    | null;
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "subscription"
  >(navigationState?.tab || "profile");
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Subscription tab state ---
  const [clinics, setClinics] = useState<ClinicMembershipInfo[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null,
  );
  const [showBecomeClinicForm, setShowBecomeClinicForm] = useState(
    !!navigationState?.planId,
  );
  const [convertSaving, setConvertSaving] = useState(false);
  const [convertError, setConvertError] = useState("");
  const [subscriptionSaving, setSubscriptionSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepMessage, setCepMessage] = useState<string | null>(null);
  const [checkoutLoadingPlanId, setCheckoutLoadingPlanId] = useState<
    string | null
  >(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [subscriptionActionError, setSubscriptionActionError] = useState("");
  const [checkoutNotice, setCheckoutNotice] = useState<
    "success" | "canceled" | null
  >(
    (new URLSearchParams(location.search).get("checkout") as
      | "success"
      | "canceled"
      | null) || null,
  );

  const myClinic = clinics.find((c) => c.role === "admin");

  useEffect(() => {
    async function loadClinics() {
      setLoadingClinics(true);
      try {
        const { data } = await api.get("/clinics/mine");
        setClinics(Array.isArray(data) ? data : []);
      } catch {
        setClinics([]);
      } finally {
        setLoadingClinics(false);
      }
    }
    async function loadPlans() {
      try {
        const { data } = await api.get("/plans");
        setPlans(Array.isArray(data) ? data : []);
      } catch {
        setPlans([]);
      }
    }
    loadClinics();
    loadPlans();
  }, []);

  useEffect(() => {
    if (!myClinic) {
      setSubscription(null);
      return;
    }
    api
      .get(`/clinics/${myClinic.clinicId}/subscription`)
      .then(({ data }) => setSubscription(data))
      .catch(() => setSubscription(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myClinic?.clinicId]);

  const becomeClinicFormik = useFormik({
    initialValues: {
      clinicName: "",
      cnpj: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      noNumber: false,
      planId: navigationState?.planId || "plus",
    },
    validationSchema: Yup.object({
      clinicName: Yup.string().required("Nome da clínica é obrigatório"),
      cnpj: Yup.string()
        .required("CNPJ é obrigatório")
        .test(
          "cnpj-length",
          "CNPJ deve ter 14 dígitos",
          (val) => (val || "").replace(/\D/g, "").length === 14,
        ),
      cep: Yup.string()
        .required("CEP é obrigatório")
        .test(
          "cep-length",
          "CEP deve ter 8 dígitos",
          (val) => (val || "").replace(/\D/g, "").length === 8,
        ),
      street: Yup.string().required("Endereço é obrigatório"),
      number: Yup.string().when("noNumber", {
        is: false,
        then: (schema) => schema.required("Número é obrigatório"),
      }),
      neighborhood: Yup.string().required("Bairro é obrigatório"),
      city: Yup.string().required("Cidade é obrigatória"),
      state: Yup.string().required("Estado é obrigatório"),
      planId: Yup.string().required(),
    }),
    onSubmit: async (values) => {
      setConvertSaving(true);
      setConvertError("");
      try {
        const { data } = await api.post("/clinics/convert", {
          ...values,
          cnpj: values.cnpj.replace(/\D/g, ""),
          cep: values.cep.replace(/\D/g, ""),
        });
        localStorage.setItem("token", data.token);
        localStorage.setItem("pocketmed_token", data.token);
        window.location.reload();
      } catch (err: any) {
        setConvertError(
          err?.response?.data?.message ||
            "Erro ao criar a clínica. Tente novamente.",
        );
      } finally {
        setConvertSaving(false);
      }
    },
  });

  // CEP auto-fill for the "become a clinic" form
  const cepRequestRef = useRef(0);
  useEffect(() => {
    const digits = becomeClinicFormik.values.cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setCepMessage(null);
      return;
    }
    const requestId = ++cepRequestRef.current;
    setCepLoading(true);
    setCepMessage(null);
    fetchCep(digits).then((result) => {
      if (requestId !== cepRequestRef.current) return;
      setCepLoading(false);
      if (result.success) {
        becomeClinicFormik.setFieldValue("street", result.data.street);
        becomeClinicFormik.setFieldValue(
          "neighborhood",
          result.data.neighborhood,
        );
        becomeClinicFormik.setFieldValue("city", result.data.city);
        becomeClinicFormik.setFieldValue("state", result.data.state);
      } else if (result.error === "not_found") {
        setCepMessage("CEP não encontrado. Preencha o endereço manualmente.");
      } else {
        setCepMessage(
          "Não foi possível consultar o CEP. Preencha o endereço manualmente.",
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [becomeClinicFormik.values.cep]);

  async function refreshSubscription() {
    if (!myClinic) return;
    const { data: refreshed } = await api.get(
      `/clinics/${myClinic.clinicId}/subscription`,
    );
    setSubscription(refreshed);
  }

  // Tries real payment first (Stripe Checkout). If the gateway isn't
  // configured yet (503 — no STRIPE_SECRET_KEY/price ids set up), falls back
  // to the manual/free plan-selection path so choosing a plan never breaks,
  // even before a Stripe account exists.
  async function handleSelectPlan(planId: string) {
    if (!myClinic) return;
    setCheckoutLoadingPlanId(planId);
    setSubscriptionActionError("");
    try {
      const { data } = await api.post(
        `/clinics/${myClinic.clinicId}/subscription/checkout`,
        { planId },
      );
      window.location.href = data.url;
      return;
    } catch (err: any) {
      if (err?.response?.status !== 503) {
        setSubscriptionActionError(
          err?.response?.data?.message ||
            "Erro ao iniciar o pagamento. Tente novamente.",
        );
        setCheckoutLoadingPlanId(null);
        return;
      }
    }

    // Gateway not configured — manual fallback.
    setSubscriptionSaving(true);
    try {
      await api.patch(`/clinics/${myClinic.clinicId}/subscription`, {
        planId,
      });
      await refreshSubscription();
    } catch {
      dialog.showError("Erro ao trocar de plano. Tente novamente.");
    } finally {
      setSubscriptionSaving(false);
      setCheckoutLoadingPlanId(null);
    }
  }

  async function handleManageBilling() {
    if (!myClinic) return;
    setPortalLoading(true);
    setSubscriptionActionError("");
    try {
      const { data } = await api.post(
        `/clinics/${myClinic.clinicId}/subscription/portal`,
      );
      window.location.href = data.url;
    } catch (err: any) {
      setSubscriptionActionError(
        err?.response?.data?.message ||
          "Não foi possível abrir o portal de pagamento.",
      );
      setPortalLoading(false);
    }
  }

  useEffect(() => {
    if (!checkoutNotice) return;
    if (checkoutNotice === "success") refreshSubscription();
    window.history.replaceState({}, "", "/account");
    const timer = setTimeout(() => setCheckoutNotice(null), 8000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myClinic?.clinicId]);

  // Delete account state
  const [deleteStep, setDeleteStep] = useState<"code" | null>(null);
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteSending, setDeleteSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleRequestDeletion = async () => {
    setDeleteSending(true);
    try {
      const token = localStorage.getItem("pocketmed_token");
      await api.post(
        "/auth/request-account-deletion",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setDeleteStep("code");
      setDeleteCode("");
    } catch {
      dialog.showError(
        "Erro ao enviar código de verificação. Tente novamente.",
      );
    } finally {
      setDeleteSending(false);
    }
  };

  const handleConfirmDeletion = async () => {
    if (deleteCode.length !== 6) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("pocketmed_token");
      await api.delete("/auth/account", {
        headers: { Authorization: `Bearer ${token}` },
        data: { verificationCode: deleteCode },
      });
      await dialog.showSuccess("Conta excluída com sucesso.");
      localStorage.removeItem("pocketmed_token");
      window.location.href = "/login";
    } catch (err: any) {
      const msg = err?.response?.data?.message || "";
      if (msg.includes("expired")) {
        dialog.showError("Código expirado. Solicite um novo código.");
        setDeleteStep(null);
      } else if (msg.includes("Invalid")) {
        dialog.showError("Código inválido. Verifique e tente novamente.");
      } else {
        dialog.showError("Erro ao excluir conta. Tente novamente.");
      }
    } finally {
      setDeleting(false);
    }
  };

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePreview(URL.createObjectURL(file));
      setSelectedFile(file);
    }
  }

  const profileFormik = useFormik({
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      gender: user?.gender || "",
      birthDate: user?.birthDate ? String(user.birthDate).split("T")[0] : "",
      specialty: user?.specialty || "",
      crm: user?.crm || "",
      cpf: (() => {
        const digits = (user?.cpf || "").replace(/\D/g, "");
        if (digits.length === 11) {
          return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
        }
        return user?.cpf || "";
      })(),
      rqe: user?.rqe || "",
    },
    enableReinitialize: true,
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      setSaving(true);
      setSuccessMsg("");
      try {
        const formData = new FormData();
        if (values.name) formData.append("name", values.name);
        if (values.phone)
          formData.append("phone", values.phone.replace(/\D/g, ""));
        if (values.gender) formData.append("gender", values.gender);
        if (values.birthDate) formData.append("birthDate", values.birthDate);
        if (values.specialty) formData.append("specialty", values.specialty);
        if (values.crm) formData.append("crm", values.crm);
        if (values.rqe) formData.append("rqe", values.rqe);
        if (values.cpf) formData.append("cpf", normalizeCpf(values.cpf));
        if (selectedFile) formData.append("profileImage", selectedFile);

        const response = await api.patch("/auth/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Update local storage with new profile image
        if (response.data.profileImage) {
          const storedUser = localStorage.getItem("pocketmed_user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            parsed.profileImage = response.data.profileImage;
            parsed.name = values.name || parsed.name;
            localStorage.setItem("pocketmed_user", JSON.stringify(parsed));
          }
        }

        setSuccessMsg("Perfil atualizado com sucesso!");
        setSelectedFile(null);
        // Reload to reflect changes in header
        setTimeout(() => window.location.reload(), 1000);
      } catch (_err) {
        setSuccessMsg("Erro ao salvar perfil. Tente novamente.");
      } finally {
        setSaving(false);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
    validationSchema: passwordSchema,
    onSubmit: async () => {
      setSaving(true);
      setSuccessMsg("");
      await new Promise((r) => setTimeout(r, 1000));
      setSaving(false);
      setSuccessMsg("Senha alterada com sucesso!");
      passwordFormik.resetForm();
      setTimeout(() => setSuccessMsg(""), 3000);
    },
  });

  // Credential fields are validated against the approved documents, so editing
  // them sends the verification back to review (enforced by the backend).
  const credentialsChanged =
    profileFormik.values.crm !== (user?.crm || "") ||
    profileFormik.values.rqe !== (user?.rqe || "") ||
    profileFormik.values.specialty !== (user?.specialty || "");

  const tabs = [
    { id: "profile" as const, label: "Perfil", icon: Camera },
    { id: "security" as const, label: "Segurança", icon: Lock },
    { id: "subscription" as const, label: "Assinatura", icon: CreditCard },
  ];

  return (
    <MainLayout>
      <motion.div
        className="space-y-8 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Minha Conta
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Gerencie suas informações pessoais, segurança e assinatura.
          </p>
        </div>

        {/* Verification status: shown above the tabs so it is visible on every
            tab, since it affects the whole account. */}
        <VerificationStatusCard />

        {/* Tabs */}
        <div className="flex space-x-1 p-1 bg-white rounded-2xl w-fit shadow-sm border border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer border-none ${
                activeTab === tab.id
                  ? "bg-primary/5 text-primary"
                  : "text-gray-500 hover:text-gray-800 bg-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
            {successMsg}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-8">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer"
                >
                  {profilePreview || user?.profileImage ? (
                    <img
                      src={profilePreview || user?.profileImage || ""}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera
                      size={28}
                      className="text-slate-400 group-hover:text-primary transition-colors"
                    />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  {user?.name || user?.email}
                </p>
                <p className="text-sm text-slate-500">
                  Clique na imagem para alterar sua foto de perfil
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={profileFormik.handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">
                    Nome Completo
                  </label>
                  <input
                    name="name"
                    onChange={profileFormik.handleChange}
                    onBlur={profileFormik.handleBlur}
                    value={profileFormik.values.name}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="Dr. João Silva"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">
                    Email
                  </label>
                  <input
                    name="email"
                    onChange={profileFormik.handleChange}
                    value={profileFormik.values.email}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">
                    Telefone
                  </label>
                  <input
                    name="phone"
                    onChange={profileFormik.handleChange}
                    value={profileFormik.values.phone}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">
                    Gênero
                  </label>
                  <CustomSelect
                    name="gender"
                    value={profileFormik.values.gender}
                    onChange={(val) =>
                      profileFormik.setFieldValue("gender", val)
                    }
                    placeholder="Selecione"
                    options={[
                      { value: "Masculino", label: "Masculino" },
                      { value: "Feminino", label: "Feminino" },
                      { value: "Outro", label: "Outro" },
                      {
                        value: "Prefiro não informar",
                        label: "Prefiro não informar",
                      },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    onChange={profileFormik.handleChange}
                    value={profileFormik.values.birthDate}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">
                    CPF
                  </label>
                  <input
                    name="cpf"
                    value={profileFormik.values.cpf}
                    onChange={(e) => {
                      profileFormik.setFieldValue(
                        "cpf",
                        maskCpf(e.target.value),
                      );
                    }}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    maxLength={14}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">
                    Especialidade
                  </label>
                  <CustomSelect
                    name="specialty"
                    value={profileFormik.values.specialty}
                    onChange={(val) =>
                      profileFormik.setFieldValue("specialty", val)
                    }
                    placeholder="Selecione a especialidade"
                    options={[
                      "Nenhuma",
                      "Acupuntura",
                      "Alergia e Imunologia",
                      "Anestesiologia",
                      "Angiologia",
                      "Cancerologia",
                      "Cardiologia",
                      "Cirurgia Cardiovascular",
                      "Cirurgia da Mão",
                      "Cirurgia de Cabeça e Pescoço",
                      "Cirurgia do Aparelho Digestivo",
                      "Cirurgia Geral",
                      "Cirurgia Pediátrica",
                      "Cirurgia Plástica",
                      "Cirurgia Torácica",
                      "Cirurgia Vascular",
                      "Clínica Médica",
                      "Clínica Geral",
                      "Coloproctologia",
                      "Dermatologia",
                      "Endocrinologia e Metabologia",
                      "Endoscopia",
                      "Gastroenterologia",
                      "Genética Médica",
                      "Geriatria",
                      "Ginecologia e Obstetrícia",
                      "Hematologia e Hemoterapia",
                      "Homeopatia",
                      "Infectologia",
                      "Mastologia",
                      "Medicina de Emergência",
                      "Medicina de Família e Comunidade",
                      "Medicina do Trabalho",
                      "Medicina Esportiva",
                      "Medicina Física e Reabilitação",
                      "Medicina Intensiva",
                      "Medicina Legal e Perícia Médica",
                      "Medicina Nuclear",
                      "Medicina Preventiva e Social",
                      "Nefrologia",
                      "Neurocirurgia",
                      "Neurologia",
                      "Nutrologia",
                      "Oftalmologia",
                      "Ortopedia e Traumatologia",
                      "Otorrinolaringologia",
                      "Patologia",
                      "Patologia Clínica/Medicina Laboratorial",
                      "Pediatria",
                      "Pneumologia",
                      "Psiquiatria",
                      "Radiologia e Diagnóstico por Imagem",
                      "Radioterapia",
                      "Reumatologia",
                      "Urologia",
                    ].map((s) => ({ value: s, label: s }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">
                    CRM
                  </label>
                  <input
                    name="crm"
                    onChange={profileFormik.handleChange}
                    value={profileFormik.values.crm}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="123456/SP"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">
                    RQE
                  </label>
                  <input
                    name="rqe"
                    onChange={profileFormik.handleChange}
                    value={profileFormik.values.rqe}
                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none"
                    placeholder="Número do RQE (se aplicável)"
                  />
                </div>
              </div>

              {/* Warns before saving: changing credential data reopens the
                  verification, so it should not come as a surprise. */}
              {credentialsChanged && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    Você alterou dados profissionais (CRM, RQE ou
                    especialidade). Ao salvar, seus documentos voltarão para
                    análise da nossa equipe.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={saving}
                loading={saving}
                variant="primary"
                size="md"
                icon={!saving ? <Save size={18} /> : undefined}
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-6 max-w-lg">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900">
                  Alterar Senha
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Atualize sua senha para manter sua conta segura.
                </p>
              </div>
              <form
                onSubmit={passwordFormik.handleSubmit}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    name="oldPassword"
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    value={passwordFormik.values.oldPassword}
                    className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none ${passwordFormik.touched.oldPassword && passwordFormik.errors.oldPassword ? "ring-2 ring-red-300" : ""}`}
                    placeholder="••••••••"
                  />
                  {passwordFormik.touched.oldPassword &&
                    passwordFormik.errors.oldPassword && (
                      <p className="text-red-500 text-xs ml-1">
                        {passwordFormik.errors.oldPassword}
                      </p>
                    )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    value={passwordFormik.values.newPassword}
                    className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none ${passwordFormik.touched.newPassword && passwordFormik.errors.newPassword ? "ring-2 ring-red-300" : ""}`}
                    placeholder="••••••••"
                  />
                  {passwordFormik.touched.newPassword &&
                    passwordFormik.errors.newPassword && (
                      <p className="text-red-500 text-xs ml-1">
                        {passwordFormik.errors.newPassword}
                      </p>
                    )}
                  <PasswordStrengthIndicator
                    password={passwordFormik.values.newPassword}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant ml-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    value={passwordFormik.values.confirmPassword}
                    className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none ${passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword ? "ring-2 ring-red-300" : ""}`}
                    placeholder="••••••••"
                  />
                  {passwordFormik.touched.confirmPassword &&
                    passwordFormik.errors.confirmPassword && (
                      <p className="text-red-500 text-xs ml-1">
                        {passwordFormik.errors.confirmPassword}
                      </p>
                    )}
                </div>
                <Button
                  type="submit"
                  disabled={saving}
                  loading={saving}
                  variant="primary"
                  size="md"
                  icon={!saving ? <Lock size={18} /> : undefined}
                >
                  {saving ? "Alterando..." : "Alterar Senha"}
                </Button>
              </form>
            </div>

            {/* Delete Account */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 max-w-lg mt-6">
              <h3 className="text-lg font-bold text-red-600 mb-2">
                Excluir conta
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Esta ação é irreversível. Todos os seus dados serão removidos
                permanentemente.
              </p>

              {!deleteStep && (
                <Button
                  type="button"
                  onClick={handleRequestDeletion}
                  disabled={deleteSending}
                  variant="danger"
                  size="md"
                >
                  {deleteSending ? "Enviando código..." : "Excluir minha conta"}
                </Button>
              )}

              {deleteStep === "code" && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-700">
                    Um código de verificação foi enviado para o seu e-mail.
                    Insira-o abaixo para confirmar a exclusão.
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    value={deleteCode}
                    onChange={(e) =>
                      setDeleteCode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="000000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-slate-900 text-center tracking-[0.5em] font-mono text-lg outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
                  />
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handleConfirmDeletion}
                      disabled={deleting || deleteCode.length !== 6}
                      variant="danger"
                      size="md"
                    >
                      {deleting ? "Excluindo..." : "Confirmar exclusão"}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        setDeleteStep(null);
                        setDeleteCode("");
                      }}
                      variant="secondary"
                      size="md"
                      className="bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none cursor-pointer"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Subscription Tab */}
        {activeTab === "subscription" && (
          <div className="space-y-6">
            {checkoutNotice === "success" && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                Pagamento confirmado! Se o plano ainda aparecer desatualizado,
                aguarde alguns segundos e atualize a página.
              </div>
            )}
            {checkoutNotice === "canceled" && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm font-medium">
                Pagamento cancelado. Nenhuma cobrança foi feita — você pode
                tentar novamente quando quiser.
              </div>
            )}
            {subscriptionActionError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {subscriptionActionError}
              </div>
            )}

            {/* Clínicas Vinculadas */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900">
                    Clínicas Vinculadas
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Clínicas das quais você faz parte como médico ou
                    administrador.
                  </p>
                </div>
                <Link
                  to="/plans"
                  className="text-sm font-bold text-primary hover:opacity-80 transition-opacity whitespace-nowrap"
                >
                  Ver planos
                </Link>
              </div>
              <div className="mt-6 space-y-3">
                {loadingClinics ? (
                  <p className="text-sm text-slate-400">Carregando...</p>
                ) : clinics.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Você ainda não está vinculado a nenhuma clínica.
                  </p>
                ) : (
                  clinics.map((c) => (
                    <div
                      key={c.membershipId}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-500">
                            {c.role === "admin"
                              ? "Administrador(a)"
                              : c.role === "doctor"
                                ? "Médico(a)"
                                : c.role}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          c.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {c.isActive ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Plano Atual (quando o médico administra a própria clínica) */}
            {myClinic && subscription && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-900">
                      Plano Atual — {myClinic.name}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Gerencie a assinatura da sua clínica na plataforma Hispora.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {subscription.billing.status && (
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          subscription.billing.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : subscription.billing.status === "past_due" ||
                                subscription.billing.status === "unpaid"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {SUBSCRIPTION_STATUS_LABELS[
                          subscription.billing.status
                        ] || subscription.billing.status}
                      </span>
                    )}
                    <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold">
                      {subscription.plan.name}
                    </span>
                  </div>
                </div>

                {subscription.billing.managed && (
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      loading={portalLoading}
                      onClick={handleManageBilling}
                      icon={<CreditCard className="w-4 h-4" />}
                    >
                      Gerenciar pagamento e faturas
                    </Button>
                  </div>
                )}

                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Profissionais
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {subscription.usage.professionals}
                        {subscription.usage.professionalsLimit !== null &&
                          ` / ${subscription.usage.professionalsLimit}`}
                      </p>
                    </div>
                    {subscription.usage.professionalsLimit !== null && (
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min(100, (subscription.usage.professionals / subscription.usage.professionalsLimit) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Pacientes Ativos
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {subscription.usage.activePatients}
                        {subscription.usage.activePatientsLimit !== null &&
                          ` / ${subscription.usage.activePatientsLimit}`}
                      </p>
                    </div>
                    {subscription.usage.activePatientsLimit !== null && (
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min(100, (subscription.usage.activePatients / subscription.usage.activePatientsLimit) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Planos Disponíveis (quando o médico administra a própria clínica) */}
            {myClinic && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold font-display text-slate-900 mb-1">
                  Planos Disponíveis
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Escolha o plano que melhor se encaixa no tamanho da sua
                  clínica.{" "}
                  {subscription?.billing.gatewayAvailable
                    ? "Você será direcionado para um pagamento seguro."
                    : "O pagamento online ainda está sendo configurado — por enquanto a troca é registrada diretamente."}
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans.map((plan) => {
                    const isCurrent = subscription?.plan.id === plan.id;
                    return (
                      <div
                        key={plan.id}
                        className={`rounded-2xl border p-5 flex flex-col ${
                          plan.highlighted
                            ? "border-primary shadow-md"
                            : "border-slate-200"
                        }`}
                      >
                        <p className="font-bold text-slate-900">{plan.name}</p>
                        <p className="text-2xl font-display font-extrabold text-slate-900 mt-1">
                          {formatPriceBRL(plan.price)}
                          {plan.price !== null && (
                            <span className="text-xs font-normal text-slate-500">
                              /mês
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 flex-1">
                          {plan.professionalsIncluded === null
                            ? "Profissionais personalizados"
                            : `Até ${plan.professionalsIncluded} profissionais`}{" "}
                          •{" "}
                          {plan.activePatientsIncluded === null
                            ? "pacientes personalizados"
                            : `${plan.activePatientsIncluded.toLocaleString("pt-BR")} pacientes ativos`}
                        </p>
                        <Button
                          type="button"
                          variant={isCurrent ? "outline" : "primary"}
                          size="sm"
                          disabled={
                            isCurrent ||
                            subscriptionSaving ||
                            checkoutLoadingPlanId !== null
                          }
                          loading={checkoutLoadingPlanId === plan.id}
                          onClick={() => handleSelectPlan(plan.id)}
                          className="mt-4 w-full"
                        >
                          {isCurrent ? "Plano Atual" : "Selecionar"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Torne-se uma Clínica (quando o médico ainda não administra uma) */}
            {!loadingClinics && !myClinic && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold font-display text-slate-900">
                      Torne-se uma Clínica
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Cadastre o CNPJ e o endereço da sua clínica, escolha um
                      plano, e passe a poder vincular outros médicos à sua
                      própria clínica.
                    </p>
                  </div>
                </div>

                {!showBecomeClinicForm ? (
                  <Button
                    type="button"
                    variant="primary"
                    className="mt-6"
                    onClick={() => setShowBecomeClinicForm(true)}
                  >
                    Começar
                  </Button>
                ) : (
                  <form
                    onSubmit={becomeClinicFormik.handleSubmit}
                    className="mt-6 space-y-5"
                  >
                    {convertError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                        {convertError}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Nome da Clínica
                      </label>
                      <input
                        name="clinicName"
                        value={becomeClinicFormik.values.clinicName}
                        onChange={becomeClinicFormik.handleChange}
                        placeholder="Clínica Saúde Total"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                      />
                      {becomeClinicFormik.touched.clinicName &&
                        becomeClinicFormik.errors.clinicName && (
                          <p className="text-xs text-red-500 mt-1">
                            {becomeClinicFormik.errors.clinicName}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        CNPJ
                      </label>
                      <input
                        name="cnpj"
                        value={becomeClinicFormik.values.cnpj}
                        onChange={(e) =>
                          becomeClinicFormik.setFieldValue(
                            "cnpj",
                            formatCNPJ(e.target.value),
                          )
                        }
                        placeholder="00.000.000/0000-00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                      />
                      {becomeClinicFormik.touched.cnpj &&
                        becomeClinicFormik.errors.cnpj && (
                          <p className="text-xs text-red-500 mt-1">
                            {becomeClinicFormik.errors.cnpj}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        CEP
                      </label>
                      <input
                        name="cep"
                        value={becomeClinicFormik.values.cep}
                        onChange={(e) =>
                          becomeClinicFormik.setFieldValue(
                            "cep",
                            formatCEP(e.target.value),
                          )
                        }
                        placeholder="00000-000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                      />
                      {cepLoading && (
                        <p className="text-xs text-slate-400 mt-1">
                          Buscando endereço...
                        </p>
                      )}
                      {cepMessage && (
                        <p className="text-xs text-amber-600 mt-1">
                          {cepMessage}
                        </p>
                      )}
                      {becomeClinicFormik.touched.cep &&
                        becomeClinicFormik.errors.cep && (
                          <p className="text-xs text-red-500 mt-1">
                            {becomeClinicFormik.errors.cep}
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Endereço
                      </label>
                      <input
                        name="street"
                        value={becomeClinicFormik.values.street}
                        onChange={becomeClinicFormik.handleChange}
                        placeholder="Rua, avenida..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                      />
                      {becomeClinicFormik.touched.street &&
                        becomeClinicFormik.errors.street && (
                          <p className="text-xs text-red-500 mt-1">
                            {becomeClinicFormik.errors.street}
                          </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                          Número
                        </label>
                        <input
                          name="number"
                          value={becomeClinicFormik.values.number}
                          onChange={becomeClinicFormik.handleChange}
                          disabled={becomeClinicFormik.values.noNumber}
                          placeholder="100"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary disabled:opacity-50"
                        />
                        <label className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                          <input
                            type="checkbox"
                            checked={becomeClinicFormik.values.noNumber}
                            onChange={(e) =>
                              becomeClinicFormik.setFieldValue(
                                "noNumber",
                                e.target.checked,
                              )
                            }
                          />
                          Sem número
                        </label>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                          Complemento
                        </label>
                        <input
                          name="complement"
                          value={becomeClinicFormik.values.complement}
                          onChange={becomeClinicFormik.handleChange}
                          placeholder="Sala 101"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                        Bairro
                      </label>
                      <input
                        name="neighborhood"
                        value={becomeClinicFormik.values.neighborhood}
                        onChange={becomeClinicFormik.handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                      />
                      {becomeClinicFormik.touched.neighborhood &&
                        becomeClinicFormik.errors.neighborhood && (
                          <p className="text-xs text-red-500 mt-1">
                            {becomeClinicFormik.errors.neighborhood}
                          </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                          Cidade
                        </label>
                        <input
                          name="city"
                          value={becomeClinicFormik.values.city}
                          onChange={becomeClinicFormik.handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary"
                        />
                        {becomeClinicFormik.touched.city &&
                          becomeClinicFormik.errors.city && (
                            <p className="text-xs text-red-500 mt-1">
                              {becomeClinicFormik.errors.city}
                            </p>
                          )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                          Estado (UF)
                        </label>
                        <input
                          name="state"
                          value={becomeClinicFormik.values.state}
                          onChange={becomeClinicFormik.handleChange}
                          maxLength={2}
                          placeholder="SP"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary uppercase"
                        />
                        {becomeClinicFormik.touched.state &&
                          becomeClinicFormik.errors.state && (
                            <p className="text-xs text-red-500 mt-1">
                              {becomeClinicFormik.errors.state}
                            </p>
                          )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                        Plano
                      </label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {plans.map((plan) => (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() =>
                              becomeClinicFormik.setFieldValue(
                                "planId",
                                plan.id,
                              )
                            }
                            className={`text-left rounded-xl border p-4 cursor-pointer transition-all ${
                              becomeClinicFormik.values.planId === plan.id
                                ? "border-primary bg-primary/5"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-sm text-slate-900">
                                {plan.name}
                              </p>
                              {becomeClinicFormik.values.planId ===
                                plan.id && (
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <p className="text-lg font-display font-extrabold text-slate-900">
                              {formatPriceBRL(plan.price)}
                              {plan.price !== null && (
                                <span className="text-xs font-normal text-slate-500">
                                  /mês
                                </span>
                              )}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={convertSaving}
                        icon={<Users className="w-4 h-4" />}
                      >
                        Criar Clínica
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowBecomeClinicForm(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}
