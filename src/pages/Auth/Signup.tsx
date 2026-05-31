import { useState, useRef } from "react";
import {
  User,
  Shield,
  Badge,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Stethoscope,
  Building2,
  Phone,
  Camera,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../contexts/AuthContext";
import { Snackbar } from "../../components/Snackbar";
import { CustomSelect } from "../../components/ui/CustomSelect";
import iconLogo from "../../assets/images/icon.png";

const UF_LIST = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const SPECIALTIES = [
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
];

const doctorSchema = Yup.object({
  name: Yup.string().required("Nome completo é obrigatório"),
  crmState: Yup.string().required("Selecione o estado do CRM"),
  crm: Yup.string().required("Número do CRM é obrigatório"),
  cpf: Yup.string()
    .required("CPF é obrigatório")
    .test("cpf-length", "CPF deve ter 11 dígitos", (val) => {
      if (!val) return false;
      return val.replace(/\D/g, "").length === 11;
    }),
  phone: Yup.string()
    .required("Celular é obrigatório")
    .test(
      "phone-length",
      "Celular deve ter 11 dígitos (DDD + número)",
      (val) => {
        if (!val) return false;
        return val.replace(/\D/g, "").length === 11;
      },
    ),
  birthDate: Yup.string().required("Data de nascimento é obrigatória"),
  gender: Yup.string().required("Gênero é obrigatório"),
  specialty: Yup.string().required("Especialidade é obrigatória"),
  rqe: Yup.string().when("specialty", {
    is: (val: string) => val && val !== "Nenhuma",
    then: (schema) => schema.required("RQE é obrigatório para especialistas"),
    otherwise: (schema) => schema.notRequired(),
  }),
  email: Yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
  password: Yup.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .required("Senha é obrigatória"),
  acceptTerms: Yup.boolean().oneOf([true], "Você deve aceitar os termos"),
});

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  let masked = "";
  if (digits.length > 0) masked += `(${digits.slice(0, 2)}`;
  if (digits.length >= 2) masked += `) `;
  if (digits.length > 2) masked += digits.slice(2, 7);
  if (digits.length > 7) masked += `-${digits.slice(7, 11)}`;
  return masked;
}

export default function Signup() {
  const navigate = useNavigate();
  const { registerDoctor } = useAuth();
  const [signupType, setSignupType] = useState<"select" | "doctor" | "clinic">(
    "select",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: "" });
  const [, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  }

  const formik = useFormik({
    initialValues: {
      name: "",
      crmState: "SP",
      crm: "",
      cpf: "",
      phone: "",
      birthDate: "",
      gender: "",
      specialty: "Nenhuma",
      rqe: "",
      email: "",
      password: "",
      acceptTerms: false,
    },
    validationSchema: doctorSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        await registerDoctor({
          name: values.name,
          email: values.email,
          password: values.password,
          gender: values.gender,
          specialty: values.specialty === "Nenhuma" ? "Clínica Geral" : values.specialty,
          cpf: values.cpf.replace(/\D/g, ""),
          phone: values.phone.replace(/\D/g, ""),
          birthDate: values.birthDate,
          crm: `${values.crm}/${values.crmState}`,
          rqe: values.rqe || undefined,
        });
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string; conflicts?: string[] } } };
        if (axiosErr.response?.status === 409) {
          const conflicts: string[] = axiosErr.response.data?.conflicts || [];
          if (conflicts.length > 0) {
            if (conflicts.includes("email")) {
              setFieldError("email", "Este e-mail já está cadastrado");
            }
            if (conflicts.includes("crm")) {
              setFieldError("crm", "Este CRM já está cadastrado");
            }
            if (conflicts.includes("phone")) {
              setFieldError("phone", "Este celular já está cadastrado");
            }
          } else {
            const msg = (axiosErr.response.data?.message || "").toLowerCase();
            if (msg.includes("email")) {
              setFieldError("email", "Este e-mail já está cadastrado");
            } else if (msg.includes("crm")) {
              setFieldError("crm", "Este CRM já está cadastrado");
            } else if (msg.includes("phone")) {
              setFieldError("phone", "Este celular já está cadastrado");
            } else {
              setSnackbar({
                visible: true,
                message: "Dados já cadastrados. Verifique os campos.",
              });
            }
          }
        } else {
          setSnackbar({
            visible: true,
            message: "Erro inesperado. Tente novamente.",
          });
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fieldError = (field: keyof typeof formik.values) =>
    formik.touched[field] && formik.errors[field] ? formik.errors[field] : null;

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side: Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden select-none h-screen sticky top-0">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <img
            alt="Abstract medical network"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRvZFCWIne01XNH_YXlP704D62hgNDD3hgMZDpabJUCj9QVcT0zoq4Zx_9_sD3aXh7zcrQ5ovDWsaUsQJlbo-O7ampapo0QRu5e6nFBo_io5EOrhgq0em9CVZObLG0-a_yhrRs4Z-mFbaBroicm4vplqhiD8q8Ah5vLDBJh-mtUR3zWR_lq3_2wyAwY1g5Ilz7DRLLfEMplROQi1ZRwv6lJ6HsV3nENcYQj29gOVu-jtdrDRkBi3TO3kk_MxwwiCnystjT5aJooxZW"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent flex flex-col justify-center p-16 z-10">
          <h2 className="text-4xl font-display font-extrabold text-white tracking-tight leading-tight mb-4">
            Precisão clínica na palma da sua mão.
          </h2>
          <p className="text-lg text-blue-100/90 max-w-md leading-relaxed">
            Junte-se à rede de especialistas que está transformando a gestão
            clínica com tecnologia de ponta e interface intuitiva.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-16 z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-base">
                Segurança de Dados
              </p>
              <p className="text-sm text-blue-100/80">
                Criptografia de nível hospitalar.
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Right Side: Form */}
      <main className="w-full lg:w-1/2 min-h-screen flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-24 bg-white relative z-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto">
          {/* Header */}
          <header className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 justify-center mb-12 w-full">
              <img
                src={iconLogo}
                alt="PocketMed"
                className="w-[72px] h-[72px] rounded-xl"
              />
              <h1 className="text-4xl font-display font-extrabold text-primary tracking-tight">
                PocketMed
              </h1>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
                Criar conta
              </h2>
              <p className="text-slate-500 text-base">
                Comece sua jornada digital no PocketMed hoje mesmo.
              </p>
            </div>
          </header>

          {/* Role Selection */}
          {signupType === "select" && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-600">
                Selecione o tipo de cadastro:
              </p>
              <button
                onClick={() => setSignupType("doctor")}
                className="w-full flex items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
              >
                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-base">
                    Cadastro como Médico
                  </p>
                  <p className="text-xs text-slate-500">
                    Para profissionais de saúde com CRM ativo
                  </p>
                </div>
              </button>
              <button
                onClick={() => setSignupType("clinic")}
                className="w-full flex items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
              >
                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-base">
                    Cadastro como Clínica
                  </p>
                  <p className="text-xs text-slate-500">
                    Para clínicas e instituições de saúde
                  </p>
                </div>
              </button>

              <div className="pt-4 text-center">
                <p className="text-slate-500 text-sm">
                  Já possui uma conta?{" "}
                  <button
                    type="button"
                    className="text-primary font-bold hover:underline border-none bg-transparent cursor-pointer"
                    onClick={() => navigate("/login")}
                  >
                    Fazer Login
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Doctor Form */}
          {signupType === "doctor" && (
            <>
              <button
                type="button"
                onClick={() => setSignupType("select")}
                className="text-sm text-slate-500 hover:text-primary font-medium border-none bg-transparent cursor-pointer"
              >
                ← Voltar para seleção
              </button>

              {/* Form */}
              <form
                className="space-y-4"
                onSubmit={formik.handleSubmit}
                noValidate
              >
                {/* Profile Image */}
                <div className="flex justify-center mb-2">
                  <div className="relative">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-full bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer"
                    >
                      {profilePreview ? (
                        <img
                          src={profilePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera
                          size={24}
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
                    <p className="text-[10px] text-slate-400 text-center mt-1.5 font-medium">
                      Foto (opcional)
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-semibold text-slate-500 uppercase tracking-wider block"
                    htmlFor="name"
                  >
                    Nome Completo
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      className={`w-full bg-slate-50 border rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10 ${fieldError("name") ? "border-red-400 focus:border-red-400" : "border-slate-200 focus:border-primary"}`}
                      id="name"
                      placeholder="Ex: Dr. Roberto Silva"
                      type="text"
                      {...formik.getFieldProps("name")}
                    />
                  </div>
                  {fieldError("name") && (
                    <p className="text-xs text-red-500 mt-1">{fieldError("name")}</p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Gênero
                  </label>
                  <CustomSelect
                    id="gender"
                    name="gender"
                    placeholder="Selecione"
                    value={formik.values.gender}
                    onChange={(val) => formik.setFieldValue("gender", val)}
                    onBlur={() => formik.setFieldTouched("gender", true)}
                    error={!!fieldError("gender")}
                    options={[
                      { value: "Masculino", label: "Masculino" },
                      { value: "Feminino", label: "Feminino" },
                      { value: "Outro", label: "Outro" },
                      { value: "Prefiro não informar", label: "Prefiro não informar" },
                    ]}
                  />
                  {fieldError("gender") && (
                    <p className="text-xs text-red-500 mt-1">{fieldError("gender")}</p>
                  )}
                </div>

                {/* CPF */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block" htmlFor="cpf">
                    CPF
                  </label>
                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      className={`w-full bg-slate-50 border rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10 ${fieldError("cpf") ? "border-red-400 focus:border-red-400" : "border-slate-200 focus:border-primary"}`}
                      id="cpf"
                      placeholder="000.000.000-00"
                      type="text"
                      inputMode="numeric"
                      maxLength={14}
                      name="cpf"
                      value={formik.values.cpf}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                        let masked = digits;
                        if (digits.length > 3) masked = digits.slice(0, 3) + "." + digits.slice(3);
                        if (digits.length > 6) masked = masked.slice(0, 7) + "." + digits.slice(6);
                        if (digits.length > 9) masked = masked.slice(0, 11) + "-" + digits.slice(9);
                        formik.setFieldValue("cpf", masked);
                      }}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  {fieldError("cpf") && (
                    <p className="text-xs text-red-500 mt-1">{fieldError("cpf")}</p>
                  )}
                </div>

                {/* Birth Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block" htmlFor="birthDate">
                    Data de Nascimento
                  </label>
                  <input
                    className={`w-full bg-slate-50 border rounded-xl py-3.5 px-4 text-slate-900 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/10 ${fieldError("birthDate") ? "border-red-400 focus:border-red-400" : "border-slate-200 focus:border-primary"}`}
                    id="birthDate"
                    type="date"
                    {...formik.getFieldProps("birthDate")}
                  />
                  {fieldError("birthDate") && (
                    <p className="text-xs text-red-500 mt-1">{fieldError("birthDate")}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block" htmlFor="phone">
                    Celular (com DDD)
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      className={`w-full bg-slate-50 border rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10 ${fieldError("phone") ? "border-red-400 focus:border-red-400" : "border-slate-200 focus:border-primary"}`}
                      id="phone"
                      placeholder="(11) 99428-6811"
                      type="tel"
                      inputMode="numeric"
                      maxLength={15}
                      name="phone"
                      value={formik.values.phone}
                      onChange={(e) => formik.setFieldValue("phone", formatPhone(e.target.value))}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  {fieldError("phone") && (
                    <p className="text-xs text-red-500 mt-1">{fieldError("phone")}</p>
                  )}
                </div>

                {/* CRM */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    CRM
                  </label>
                  <div className="grid grid-cols-[120px_1fr] gap-3">
                    <CustomSelect
                      name="crmState"
                      value={formik.values.crmState}
                      onChange={(val) => formik.setFieldValue("crmState", val)}
                      options={UF_LIST.map((uf) => ({ value: uf, label: uf }))}
                    />
                    <div className="relative group">
                      <Badge className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        className={`w-full bg-slate-50 border rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10 ${fieldError("crm") ? "border-red-400 focus:border-red-400" : "border-slate-200 focus:border-primary"}`}
                        placeholder="Número do CRM"
                        type="text"
                        inputMode="numeric"
                        name="crm"
                        value={formik.values.crm}
                        onChange={(e) => formik.setFieldValue("crm", e.target.value.replace(/\D/g, ""))}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                  </div>
                  {fieldError("crm") && (
                    <p className="text-xs text-red-500 mt-1">{fieldError("crm")}</p>
                  )}
                </div>

                {/* Specialty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Especialidade
                  </label>
                  <CustomSelect
                    id="specialty"
                    name="specialty"
                    placeholder="Selecione a especialidade"
                    value={formik.values.specialty}
                    onChange={(val) => formik.setFieldValue("specialty", val)}
                    onBlur={() => formik.setFieldTouched("specialty", true)}
                    error={!!fieldError("specialty")}
                    options={SPECIALTIES.map((s) => ({ value: s, label: s }))}
                  />
                  {fieldError("specialty") && (
                    <p className="text-xs text-red-500 mt-1">{fieldError("specialty")}</p>
                  )}
                </div>

                {/* RQE - only if specialty is not "Nenhuma" */}
                {formik.values.specialty && formik.values.specialty !== "Nenhuma" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block" htmlFor="rqe">
                      RQE (Registro de Qualificação de Especialista)
                    </label>
                    <input
                      className={`w-full bg-slate-50 border rounded-xl py-3.5 px-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10 ${fieldError("rqe") ? "border-red-400 focus:border-red-400" : "border-slate-200 focus:border-primary"}`}
                      id="rqe"
                      placeholder="Número do RQE"
                      type="text"
                      inputMode="numeric"
                      name="rqe"
                      value={formik.values.rqe}
                      onChange={(e) => formik.setFieldValue("rqe", e.target.value.replace(/\D/g, ""))}
                      onBlur={formik.handleBlur}
                    />
                    {fieldError("rqe") && (
                      <p className="text-xs text-red-500 mt-1">{fieldError("rqe")}</p>
                    )}
                  </div>
                )}

                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-semibold text-slate-500 uppercase tracking-wider block"
                    htmlFor="email"
                  >
                    E-mail Profissional
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      className={`w-full bg-slate-50 border rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10 ${fieldError("email") ? "border-red-400 focus:border-red-400" : "border-slate-200 focus:border-primary"}`}
                      id="email"
                      placeholder="contato@exemplo.com"
                      type="email"
                      {...formik.getFieldProps("email")}
                    />
                  </div>
                  {fieldError("email") && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldError("email")}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    className="text-xs font-semibold text-slate-500 uppercase tracking-wider block"
                    htmlFor="password"
                  >
                    Senha
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      className={`w-full bg-slate-50 border rounded-xl py-3.5 pl-12 pr-12 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10 ${fieldError("password") ? "border-red-400 focus:border-red-400" : "border-slate-200 focus:border-primary"}`}
                      id="password"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      {...formik.getFieldProps("password")}
                    />
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md border-none bg-transparent cursor-pointer"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {fieldError("password") && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldError("password")}
                    </p>
                  )}
                </div>

                {/* Terms */}
                <div className="space-y-1">
                  <div className="flex items-start pt-2">
                    <div className="flex items-center h-5">
                      <input
                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary/30"
                        id="terms"
                        type="checkbox"
                        name="acceptTerms"
                        checked={formik.values.acceptTerms}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </div>
                    <label
                      className="ml-3 text-xs text-slate-500 leading-normal"
                      htmlFor="terms"
                    >
                      Eu concordo com os{" "}
                      <a
                        className="text-primary font-semibold hover:underline"
                        href="#"
                      >
                        Termos de Serviço
                      </a>{" "}
                      e a{" "}
                      <a
                        className="text-primary font-semibold hover:underline"
                        href="#"
                      >
                        Política de Privacidade
                      </a>{" "}
                      do PocketMed.
                    </label>
                  </div>
                  {fieldError("acceptTerms") && (
                    <p className="text-xs text-red-500">
                      {fieldError("acceptTerms")}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  className="w-full mt-4 py-4 bg-gradient-to-r from-primary to-[#2b5aed] text-white font-semibold rounded-xl shadow-md shadow-primary/10 hover:shadow-primary/20 active:scale-[0.99] transition-all text-sm cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? "Criando conta..." : "Criar Conta"}
                </button>
              </form>

              <footer className="pt-6 border-t border-slate-100 text-center lg:text-left space-y-4">
                <p className="text-sm text-slate-500">
                  Já possui uma conta?{" "}
                  <button
                    type="button"
                    className="text-primary font-bold hover:underline border-none bg-transparent cursor-pointer"
                    onClick={() => navigate("/login")}
                  >
                    Fazer Login
                  </button>
                </p>
              </footer>
            </>
          )}

          {/* Clinic Form - Placeholder */}
          {signupType === "clinic" && (
            <div className="space-y-4 text-center">
              <p className="text-slate-500">
                Formulário de cadastro de clínica em breve.
              </p>
              <button
                onClick={() => setSignupType("select")}
                className="text-primary font-bold text-sm hover:underline border-none bg-transparent cursor-pointer"
              >
                ← Voltar
              </button>
            </div>
          )}
        </div>

        {/* Bottom footer */}
        <div className="mt-auto pt-8 pb-6 text-center lg:text-left space-y-2 w-full max-w-md">
          <div className="flex items-center gap-3 justify-center lg:justify-start text-[10px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
            <span>Políticas de Privacidade</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Termos de Serviço</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Padrões de Segurança</span>
          </div>
          <p className="text-[10px] text-slate-400">
            © 2026 PocketMed Clinical Systems. Todos os direitos reservados.
          </p>
        </div>

        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      </main>

      <Snackbar
        message={snackbar.message}
        visible={snackbar.visible}
        onClose={() => setSnackbar({ visible: false, message: "" })}
      />
    </div>
  );
}
