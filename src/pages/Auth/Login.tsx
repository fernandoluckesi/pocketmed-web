import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setLoginError("O campo de e-mail é obrigatório.");
      return;
    }
    if (!password) {
      setLoginError("O campo de senha é obrigatório.");
      return;
    }
    setLoginError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side: Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-neutral-900 overflow-hidden select-none">
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
            Acesse sua plataforma integrada para gestão de prontuários, diagnósticos e apoio à decisão clínica em tempo real.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Right Side: Form */}
      <main className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24 bg-white relative z-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto">
          {/* Header */}
          <header className="text-center lg:text-left space-y-4">
            <div className="inline-flex items-center gap-3 justify-center lg:justify-start mb-6">
              <img src="/src/assets/images/icon.png" alt="PocketMed" className="w-[72px] h-[72px] rounded-xl" />
              <h1 className="text-4xl font-display font-extrabold text-blue-700 tracking-tight">PocketMed</h1>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Bem-vindo de volta</h2>
              <p className="text-slate-500 text-base">Insira suas credenciais para acessar o portal clínico.</p>
            </div>
          </header>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {loginError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-xl font-medium border border-rose-100 flex items-center gap-2">
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="email-input">
                  E-mail Profissional
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                  <input
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-100"
                    id="email-input"
                    placeholder="dr.exemplo@hospital.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider" htmlFor="password-input">
                  Senha
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                  <input
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl py-3.5 pl-12 pr-12 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-blue-100"
                    id="password-input"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between py-1 text-sm">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <input
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Lembrar-me</span>
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
              disabled={loading}
            >
              <span>{loading ? "Entrando..." : "Entrar no Sistema"}</span>
              {!loading && <ChevronRight className="w-4 h-4 stroke-[2.5]" />}
            </button>
          </form>

          {/* Institutional */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-semibold">
              <span className="bg-white px-4 text-slate-400">Acesso Institucional</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all py-3.5 rounded-xl flex items-center justify-center gap-3 text-slate-600 hover:text-slate-900 font-medium cursor-pointer">
              <img
                className="w-5 h-5 object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4OzmSmb0NDXEVivXaNwY1W4bAZJ9AmpNF0zhfoBvmOHWO6rfzgOH18BM3bNtCS22lEM5QlLLob4bPpIM7xaphAYrn-w_1j8P0vlRRn6XAfeAiPMsi0BYNSaA7_5UQyHYF6ba6DMvSj8-T1mrk67x2Tnh2U_8P12wYbpAVEBNpv-er5Ntjk_X4jjg_7BPfbZsV01PWE4lGD1L7R2CHul1NsYpnEH26s5X70ITExGBCCm0Z4I5YDTXFD5nkqS0GTg0lP3720z1MHp2i"
                alt="Google Logo"
                referrerPolicy="no-referrer"
              />
              <span>Google Workspace</span>
            </button>
          </div>

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
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center lg:justify-start text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              <span>Políticas de Privacidade</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full mt-1.5 self-center"></span>
              <span>Termos de Serviço</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full mt-1.5 self-center"></span>
              <span>Padrões de Segurança</span>
            </div>
            <p className="text-[10px] text-slate-400">
              © 2026 PocketMed Clinical Systems. Todos os direitos reservados.
            </p>
          </footer>
        </div>

        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      </main>
    </div>
  );
}
