import { useState, useRef } from "react";
import { Camera, Save, Lock, CreditCard, Loader2 } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion } from "motion/react";
import { MainLayout } from "../../components/MainLayout";
import { useAuth } from "../../contexts/AuthContext";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { Link } from "react-router-dom";

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
  cpf: Yup.string().required("CPF é obrigatório"),
});

const passwordSchema = Yup.object({
  oldPassword: Yup.string()
    .min(6, "Mínimo 6 caracteres")
    .required("Senha atual é obrigatória"),
  newPassword: Yup.string()
    .min(6, "Mínimo 6 caracteres")
    .required("Nova senha é obrigatória"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Senhas não conferem")
    .required("Confirme a nova senha"),
});

export default function Account() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "subscription"
  >("profile");
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePreview(URL.createObjectURL(file));
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
    onSubmit: async () => {
      setSaving(true);
      setSuccessMsg("");
      // Simula salvamento
      await new Promise((r) => setTimeout(r, 1000));
      setSaving(false);
      setSuccessMsg("Perfil atualizado com sucesso!");
      setTimeout(() => setSuccessMsg(""), 3000);
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

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-full w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <tab.icon size={16} />
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
                  className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-primary hover:bg-primary/5 transition-all group"
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
                <p className="font-bold text-slate-900">{user?.name || user?.email}</p>
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
                    onChange={(val) => profileFormik.setFieldValue("gender", val)}
                    placeholder="Selecione"
                    options={[
                      { value: "Masculino", label: "Masculino" },
                      { value: "Feminino", label: "Feminino" },
                      { value: "Outro", label: "Outro" },
                      { value: "Prefiro não informar", label: "Prefiro não informar" },
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
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                      let masked = digits;
                      if (digits.length > 3) masked = digits.slice(0, 3) + "." + digits.slice(3);
                      if (digits.length > 6) masked = masked.slice(0, 7) + "." + digits.slice(6);
                      if (digits.length > 9) masked = masked.slice(0, 11) + "-" + digits.slice(9);
                      profileFormik.setFieldValue("cpf", masked);
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
                    onChange={(val) => profileFormik.setFieldValue("specialty", val)}
                    placeholder="Selecione a especialidade"
                    options={[
                      "Nenhuma","Acupuntura","Alergia e Imunologia","Anestesiologia","Angiologia","Cancerologia","Cardiologia","Cirurgia Cardiovascular","Cirurgia da Mão","Cirurgia de Cabeça e Pescoço","Cirurgia do Aparelho Digestivo","Cirurgia Geral","Cirurgia Pediátrica","Cirurgia Plástica","Cirurgia Torácica","Cirurgia Vascular","Clínica Médica","Clínica Geral","Coloproctologia","Dermatologia","Endocrinologia e Metabologia","Endoscopia","Gastroenterologia","Genética Médica","Geriatria","Ginecologia e Obstetrícia","Hematologia e Hemoterapia","Homeopatia","Infectologia","Mastologia","Medicina de Emergência","Medicina de Família e Comunidade","Medicina do Trabalho","Medicina Esportiva","Medicina Física e Reabilitação","Medicina Intensiva","Medicina Legal e Perícia Médica","Medicina Nuclear","Medicina Preventiva e Social","Nefrologia","Neurocirurgia","Neurologia","Nutrologia","Oftalmologia","Ortopedia e Traumatologia","Otorrinolaringologia","Patologia","Patologia Clínica/Medicina Laboratorial","Pediatria","Pneumologia","Psiquiatria","Radiologia e Diagnóstico por Imagem","Radioterapia","Reumatologia","Urologia"
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
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-container transition-all active:scale-95 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-6 max-w-lg">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900">
                Alterar Senha
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Atualize sua senha para manter sua conta segura.
              </p>
            </div>
            <form onSubmit={passwordFormik.handleSubmit} className="space-y-5">
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
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-container transition-all active:scale-95 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Lock size={18} />
                )}
                {saving ? "Alterando..." : "Alterar Senha"}
              </button>
            </form>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === "subscription" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display text-slate-900">
                    Plano Atual
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Gerencie sua assinatura da plataforma PocketMed.
                  </p>
                </div>
                <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold">
                  Plano Gratuito
                </span>
              </div>
              <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900">Free</p>
                    <p className="text-sm text-slate-500">
                      Até 10 pacientes • Funcionalidades básicas
                    </p>
                  </div>
                  <p className="text-2xl font-display font-extrabold text-slate-900">
                    R$ 0
                    <span className="text-sm font-normal text-slate-500">
                      /mês
                    </span>
                  </p>
                </div>
              </div>
              <Link
                to="/plans"
                className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all active:scale-95"
              >
                <CreditCard size={18} />
                Ver Planos Disponíveis
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
}
