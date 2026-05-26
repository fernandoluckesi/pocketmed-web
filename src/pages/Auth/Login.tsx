import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../contexts/AuthContext";
import { Snackbar } from "../../components/Snackbar";
import iconLogo from "../../assets/images/icon.png";

const loginSchema = Yup.object({
  email: Yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
  password: Yup.string().required("Senha é obrigatória"),
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: "" });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        await login(values.email, values.password);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr.response?.status === 401) {
          setFieldError("password", "E-mail ou senha incorretos");
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

  const fieldError = (field: "email" | "password") =>
    formik.touched[field] && formik.errors[field] ? formik.errors[field] : null;

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side: Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-neutral-900 overflow-hidden select-none h-screen sticky top-0">
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity grayscale-[20%] brightness-75"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_ICKjyHccRapfSsJLM5KtqB36YSgA0OSqydYRQHI1kyzLT3F_cCOwAJFlGud13vCWc6Tw3TWe5-r-ig-Vk9A__dGC0svSPrgq3ssWrxubtRzChSeoYZ405V5UbzoPwFA5n3Nq9-c-Ftgugjb15HDDF94OOKzGJ7fkkovFS7F0GcEjYqK1cZZG_vSf0hRRR0QK_IaVt3V4aEw3o3le5txnSXH1YVexcnQ-BUcG7OYgbIPCzdx5x3hOD2sbfnpFYlszrdLO4BGvZw2H"
          alt="PocketMed Clinical Setting"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-16 z-10">
          <h2 className="text-4xl font-display font-extrabold text-white tracking-tight leading-tight mb-4">
            Precisão Clínica Digital.
          </h2>
          <p className="text-lg text-slate-300 max-w-md leading-relaxed">
            Acesse sua plataforma integrada para gestão de prontuários,
            diagnósticos e apoio à decisão clínica em tempo real.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
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
              <h1 className="text-4xl font-display font-extrabold text-blue-700 tracking-tight">
                PocketMed
              </h1>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
                Bem-vindo de volta
              </h2>
              <p className="text-slate-500 text-base">
                Insira suas credenciais para acessar o portal clínico.
              </p>
            </div>
          </header>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  htmlFor="email-input"
                >
                  E-mail Profissional
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                  <input
                    className={`w-full bg-slate-50 border rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-100 ${fieldError("email") ? "border-red-400 focus:border-red-400" : "border-slate-200 focus:border-blue-500"}`}
                    id="email-input"
                    placeholder="dr.exemplo@hospital.com"
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
                  className="block text-xs font-semibold text-slate-500 uppercase tracking-wider"
                  htmlFor="password-input"
                >
                  Senha
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                  <input
                    className={`w-full bg-slate-50 border rounded-xl py-3.5 pl-12 pr-12 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-100 ${fieldError("password") ? "border-red-400 focus:border-red-400" : "border-slate-200 focus:border-blue-500"}`}
                    id="password-input"
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
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between py-1 text-sm">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <input
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                  type="checkbox"
                  name="rememberMe"
                  checked={formik.values.rememberMe}
                  onChange={formik.handleChange}
                />
                <span className="text-slate-600 group-hover:text-slate-900 transition-colors">
                  Lembrar-me
                </span>
              </label>
              <button
                type="button"
                className="font-semibold text-blue-600 hover:text-blue-800 transition-colors border-none bg-transparent cursor-pointer"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Submit */}
            <button
              className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-semibold py-4 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2.5 border-none disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={formik.isSubmitting}
            >
              <span>
                {formik.isSubmitting ? "Entrando..." : "Entrar no Sistema"}
              </span>
              {!formik.isSubmitting && (
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </form>

          {/* Footer */}
          <footer className="pt-6 border-t border-slate-100 text-center lg:text-left space-y-4">
            <p className="text-sm text-slate-500">
              Não tem uma conta?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-blue-600 font-bold hover:underline border-none bg-transparent cursor-pointer"
              >
                Cadastre-se agora
              </button>
            </p>
          </footer>
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
