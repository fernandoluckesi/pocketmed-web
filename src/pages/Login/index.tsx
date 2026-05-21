import { useState } from "react";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Stethoscope, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const loginSchema = Yup.object({
  email: Yup.string().email("Email inválido").required("Email é obrigatório"),
  password: Yup.string()
    .min(6, "Mínimo 6 caracteres")
    .required("Senha é obrigatória"),
});

export default function Login() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError("");
      try {
        await login(values.email, values.password);
      } catch (err: any) {
        setError(err.response?.data?.message || "Credenciais inválidas");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 sticky top-0 h-screen bg-gradient-to-br from-primary to-primary-container p-12 flex-col justify-between relative overflow-hidden">
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
          <h2 className="text-5xl font-black text-white tracking-tight font-display leading-tight">
            Gestão médica
            <br />
            inteligente e<br />
            simplificada.
          </h2>
          <p className="text-white/70 text-lg mt-6 max-w-md leading-relaxed">
            Gerencie pacientes, consultas e prontuários em uma plataforma segura
            e moderna.
          </p>
        </div>
        <p className="text-white/40 text-xs font-bold relative z-10">
          © 2024 PocketMed Clinical Systems
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black text-primary font-display">
              PocketMed
            </h1>
          </div>

          <div>
            <h3 className="text-3xl font-black text-on-surface tracking-tight font-display">
              Bem-vindo de volta
            </h3>
            <p className="text-on-surface-variant mt-2">
              Entre com suas credenciais para acessar o sistema.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-6">
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
                className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all ${
                  formik.touched.email && formik.errors.email
                    ? "ring-2 ring-red-300"
                    : ""
                }`}
                placeholder="seu.email@exemplo.com"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-xs ml-1">
                  {formik.errors.email}
                </p>
              )}
            </div>

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
                  className={`w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 pr-12 text-on-surface focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all ${
                    formik.touched.password && formik.errors.password
                      ? "ring-2 ring-red-300"
                      : ""
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs ml-1">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-primary text-white py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {formik.isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : null}
              {formik.isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-on-surface-variant text-sm">
            Não tem uma conta?{" "}
            <Link
              to="/register"
              className="text-primary font-bold hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
