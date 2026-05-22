import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Stethoscope,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Camera,
} from "lucide-react";
import api from "../../config/api";

const registerSchema = Yup.object({
  name: Yup.string()
    .min(3, "Mínimo 3 caracteres")
    .required("Nome é obrigatório"),
  email: Yup.string().email("Email inválido").required("Email é obrigatório"),
  password: Yup.string()
    .min(6, "Mínimo 6 caracteres")
    .required("Senha é obrigatória"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Senhas não conferem")
    .required("Confirme a senha"),
  gender: Yup.string().required("Gênero é obrigatório"),
  phone: Yup.string().required("Telefone é obrigatório"),
  birthDate: Yup.string().required("Data de nascimento é obrigatória"),
  specialty: Yup.string().required("Especialidade é obrigatória"),
  crm: Yup.string().required("CRM é obrigatório"),
  cpf: Yup.string().required("CPF é obrigatório"),
});

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
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
      email: "",
      password: "",
      confirmPassword: "",
      gender: "",
      phone: "",
      birthDate: "",
      specialty: "",
      crm: "",
      cpf: "",
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError("");
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword: _unused, ...rest } = values;
        const formData = new FormData();
        Object.entries(rest).forEach(([key, value]) => {
          formData.append(key, value);
        });
        if (profileImage) {
          formData.append("profileImage", profileImage);
        }
        await api.post("/auth/register/doctor", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2000);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(
          error.response?.data?.message ||
            "Erro ao cadastrar. Tente novamente.",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">✓</span>
          </div>
          <h3 className="text-2xl font-black text-on-surface font-display">
            Cadastro realizado!
          </h3>
          <p className="text-on-surface-variant">
            Sua conta foi criada com sucesso. Redirecionando para o login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-2/5 sticky top-0 h-screen bg-gradient-to-br from-primary to-primary-container p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[40rem] h-[40rem] bg-white/5 rounded-full blur-[100px]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight font-display">
                PocketMed
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                Excelência Clínica
              </p>
            </div>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight font-display leading-tight">
            Junte-se à<br />
            plataforma médica
            <br />
            do futuro.
          </h2>
          <p className="text-white/70 text-lg mt-6 max-w-md leading-relaxed">
            Crie sua conta e comece a gerenciar seus pacientes de forma moderna
            e segura.
          </p>
        </div>
        <p className="text-white/40 text-xs font-bold relative z-10">
          © 2024 PocketMed Clinical Systems
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg space-y-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary font-medium"
          >
            <ArrowLeft size={16} /> Voltar ao login
          </Link>

          <div>
            <h3 className="text-3xl font-black text-on-surface tracking-tight font-display">
              Criar conta
            </h3>
            <p className="text-on-surface-variant mt-2">
              Preencha os dados para cadastrar sua conta de médico.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Profile Image */}
            <div className="flex justify-center">
              <div className="relative">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  {profilePreview ? (
                    <img
                      src={profilePreview}
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
                <p className="text-[10px] text-on-surface-variant text-center mt-2 font-medium">
                  Foto de perfil (opcional)
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant ml-1">
                Nome Completo
              </label>
              <input
                type="text"
                name="name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none ${formik.touched.name && formik.errors.name ? "ring-2 ring-red-300" : ""}`}
                placeholder="Dr. João Silva"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-xs ml-1">
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
                type="email"
                name="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none ${formik.touched.email && formik.errors.email ? "ring-2 ring-red-300" : ""}`}
                placeholder="seu.email@exemplo.com"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-xs ml-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant ml-1">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                    className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 pr-10 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none ${formik.touched.password && formik.errors.password ? "ring-2 ring-red-300" : ""}`}
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-red-500 text-xs ml-1">
                    {formik.errors.password}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant ml-1">
                  Confirmar Senha
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                  className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "ring-2 ring-red-300" : ""}`}
                  placeholder="••••••"
                />
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <p className="text-red-500 text-xs ml-1">
                      {formik.errors.confirmPassword}
                    </p>
                  )}
              </div>
            </div>

            {/* Gender + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant ml-1">
                  Gênero
                </label>
                <select
                  name="gender"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.gender}
                  className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none appearance-none ${formik.touched.gender && formik.errors.gender ? "ring-2 ring-red-300" : ""}`}
                >
                  <option value="">Selecione</option>
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                </select>
                {formik.touched.gender && formik.errors.gender && (
                  <p className="text-red-500 text-xs ml-1">
                    {formik.errors.gender}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant ml-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="phone"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.phone}
                  className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none ${formik.touched.phone && formik.errors.phone ? "ring-2 ring-red-300" : ""}`}
                  placeholder="(11) 99999-9999"
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-red-500 text-xs ml-1">
                    {formik.errors.phone}
                  </p>
                )}
              </div>
            </div>

            {/* BirthDate + CPF */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant ml-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  name="birthDate"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.birthDate}
                  className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none ${formik.touched.birthDate && formik.errors.birthDate ? "ring-2 ring-red-300" : ""}`}
                />
                {formik.touched.birthDate && formik.errors.birthDate && (
                  <p className="text-red-500 text-xs ml-1">
                    {formik.errors.birthDate}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant ml-1">
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.cpf}
                  className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none ${formik.touched.cpf && formik.errors.cpf ? "ring-2 ring-red-300" : ""}`}
                  placeholder="000.000.000-00"
                />
                {formik.touched.cpf && formik.errors.cpf && (
                  <p className="text-red-500 text-xs ml-1">
                    {formik.errors.cpf}
                  </p>
                )}
              </div>
            </div>

            {/* Specialty + CRM */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant ml-1">
                  Especialidade
                </label>
                <input
                  type="text"
                  name="specialty"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.specialty}
                  className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none ${formik.touched.specialty && formik.errors.specialty ? "ring-2 ring-red-300" : ""}`}
                  placeholder="Cardiologia"
                />
                {formik.touched.specialty && formik.errors.specialty && (
                  <p className="text-red-500 text-xs ml-1">
                    {formik.errors.specialty}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant ml-1">
                  CRM
                </label>
                <input
                  type="text"
                  name="crm"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.crm}
                  className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none ${formik.touched.crm && formik.errors.crm ? "ring-2 ring-red-300" : ""}`}
                  placeholder="123456/SP"
                />
                {formik.touched.crm && formik.errors.crm && (
                  <p className="text-red-500 text-xs ml-1">
                    {formik.errors.crm}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-primary text-white py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {formik.isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : null}
              {formik.isSubmitting ? "Cadastrando..." : "Criar Conta"}
            </button>
          </form>

          <p className="text-center text-on-surface-variant text-sm">
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline"
            >
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
