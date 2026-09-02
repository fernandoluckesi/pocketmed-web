import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ShieldCheck, Mail } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PasswordStrengthIndicator } from "../../components/PasswordStrengthIndicator";
import iconLogo from "../../assets/images/icon.png";
import api from "../../config/api";

type Step = "email" | "code" | "password";

const emailSchema = Yup.object({
  email: Yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
});

const codeSchema = Yup.object({
  code: Yup.string()
    .length(6, "O código deve ter 6 dígitos")
    .required("Código é obrigatório"),
});

const passwordSchema = Yup.object({
  password: Yup.string()
    .min(8, "Mínimo 8 caracteres")
    .matches(/[A-Z]/, "Deve conter letra maiúscula")
    .matches(/[a-z]/, "Deve conter letra minúscula")
    .matches(/\d/, "Deve conter um número")
    .matches(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      "Deve conter caractere especial",
    )
    .required("Senha é obrigatória"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Senhas não conferem")
    .required("Confirme a nova senha"),
});

export default function ActivateAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [step, setStep] = useState<Step>(initialEmail ? "code" : "email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emailFormik = useFormik({
    initialValues: { email: initialEmail },
    validationSchema: emailSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError("");
      try {
        const response = await api.post("/auth/check-shadow", {
          email: values.email,
        });
        if (response.data?.isShadow) {
          setEmail(values.email);
          setStep("code");
        } else {
          setError(
            "Nenhuma conta pendente de ativação encontrada com este email.",
          );
        }
      } catch {
        setError("Erro ao verificar email. Tente novamente.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const codeFormik = useFormik({
    initialValues: { code: "" },
    validationSchema: codeSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError("");
      try {
        await api.post("/auth/validate-code", {
          email,
          verificationCode: values.code,
        });
        setCode(values.code);
        setStep("password");
      } catch (err: any) {
        const msg = err?.response?.data?.message || "";
        if (msg.includes("expired") || msg.includes("expirado")) {
          setError(
            "Código expirado. Solicite um novo código ao administrador.",
          );
        } else if (msg.includes("Invalid") || msg.includes("inválido")) {
          setError("Código inválido. Verifique e tente novamente.");
        } else {
          setError("Erro ao validar código. Tente novamente.");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: passwordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError("");
      try {
        await api.post("/auth/activate-shadow-account", {
          email,
          verificationCode: code,
          password: values.password,
        });
        setSuccess("Conta ativada com sucesso! Você já pode fazer login.");
        setTimeout(() => navigate("/login"), 2500);
      } catch (err: any) {
        const msg = err?.response?.data?.message || "";
        if (msg.includes("expired") || msg.includes("expirado")) {
          setError(
            "Código expirado. Solicite um novo código ao administrador.",
          );
          setStep("email");
        } else if (msg.includes("Invalid") || msg.includes("inválido")) {
          setError("Código inválido. Verifique e tente novamente.");
          setStep("code");
        } else {
          setError("Erro ao ativar conta. Tente novamente.");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fieldError = (formik: any, field: string) =>
    formik.touched[field] && formik.errors[field] ? formik.errors[field] : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={iconLogo}
            alt="Hispora"
            className="w-14 h-14 mx-auto rounded-xl mb-4"
          />
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="text-slate-900">His</span>
            <span className="text-primary">pora</span>
          </h1>
          <p className="text-sm text-slate-500 mt-3">
            {step === "email" &&
              "Informe o email cadastrado pelo administrador"}
            {step === "code" &&
              `Insira o código de 6 dígitos enviado para ${email}`}
            {step === "password" &&
              "Crie uma senha segura para acessar sua conta"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <p className="text-sm text-emerald-700">{success}</p>
            </div>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={emailFormik.handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  E-mail
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    className={`w-full bg-slate-50 border rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10 ${fieldError(emailFormik, "email") ? "border-red-400" : "border-slate-200 focus:border-primary"}`}
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...emailFormik.getFieldProps("email")}
                  />
                </div>
                {fieldError(emailFormik, "email") && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldError(emailFormik, "email")}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={emailFormik.isSubmitting}
                className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl shadow-md transition-all cursor-pointer border-none disabled:opacity-60"
              >
                {emailFormik.isSubmitting ? "Verificando..." : "Continuar"}
              </button>
            </form>
          )}

          {/* Step 2: Code */}
          {step === "code" && (
            <form onSubmit={codeFormik.handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="code"
                  className="text-sm font-medium text-slate-700"
                >
                  Código de verificação
                </label>
                <input
                  className={`w-full bg-slate-50 border rounded-xl py-3.5 px-4 text-slate-900 text-sm text-center tracking-[0.5em] font-mono placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10 ${fieldError(codeFormik, "code") ? "border-red-400" : "border-slate-200 focus:border-primary"}`}
                  id="code"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  {...codeFormik.getFieldProps("code")}
                />
                {fieldError(codeFormik, "code") && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldError(codeFormik, "code")}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={codeFormik.isSubmitting}
                className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl shadow-md transition-all cursor-pointer border-none disabled:opacity-60"
              >
                Verificar código
              </button>
            </form>
          )}

          {/* Step 3: Password */}
          {step === "password" && (
            <form onSubmit={passwordFormik.handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Nova senha
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    className={`w-full bg-slate-50 border rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10 ${fieldError(passwordFormik, "password") ? "border-red-400" : "border-slate-200 focus:border-primary"}`}
                    id="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    {...passwordFormik.getFieldProps("password")}
                  />
                </div>
                {fieldError(passwordFormik, "password") && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldError(passwordFormik, "password")}
                  </p>
                )}
                <PasswordStrengthIndicator
                  password={passwordFormik.values.password}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-slate-700"
                >
                  Confirmar senha
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    className={`w-full bg-slate-50 border rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10 ${fieldError(passwordFormik, "confirmPassword") ? "border-red-400" : "border-slate-200 focus:border-primary"}`}
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a nova senha"
                    {...passwordFormik.getFieldProps("confirmPassword")}
                  />
                </div>
                {fieldError(passwordFormik, "confirmPassword") && (
                  <p className="text-xs text-red-500 mt-1">
                    {fieldError(passwordFormik, "confirmPassword")}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={passwordFormik.isSubmitting}
                className="w-full bg-primary text-white font-semibold py-3.5 rounded-xl shadow-md transition-all cursor-pointer border-none disabled:opacity-60"
              >
                {passwordFormik.isSubmitting ? "Ativando..." : "Ativar conta"}
              </button>
            </form>
          )}
        </div>

        {/* Back to login */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-slate-500 hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
          >
            Voltar para o login
          </button>
        </div>
      </div>
    </div>
  );
}
