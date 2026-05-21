import { useState } from "react";
import { User, Shield, Badge, Building, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/auth";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [crm, setCrm] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Por favor, insira seu nome completo.");
    if (!crm.trim()) return setError("Por favor, insira seu número de CRM.");
    if (!clinicName.trim()) return setError("Por favor, insira o nome da sua clínica.");
    if (!email.trim()) return setError("Por favor, insira seu e-mail profissional.");
    if (!password.trim() || password.length < 6) {
      return setError("Por favor, insira uma senha com pelo menos 6 caracteres.");
    }
    if (!acceptTerms) {
      return setError("Você precisa aceitar os Termos de Serviço e Política de Privacidade.");
    }

    setError("");
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        gender: "Masculino",
        specialty: "Clínica Geral",
        cpf: "00000000000",
        phone: "(00) 00000-0000",
        birthDate: "1990-01-01",
        crm,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side: Visual - Fixed height */}
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
            Junte-se à rede de especialistas que está transformando a gestão clínica com tecnologia de ponta e interface intuitiva.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-16 z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-base">Segurança de Dados</p>
              <p className="text-sm text-blue-100/80">Criptografia de nível hospitalar.</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Right Side: Form */}
      <main className="w-full lg:w-1/2 min-h-screen flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-24 bg-white relative z-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto">
          {/* Header */}
          <header className="text-center lg:text-left space-y-4">
            <div className="inline-flex items-center gap-3 justify-center lg:justify-start mb-6">
              <img src="/src/assets/images/icon.png" alt="PocketMed" className="w-[72px] h-[72px] rounded-xl" />
              <h1 className="text-4xl font-display font-extrabold text-primary tracking-tight">PocketMed</h1>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Criar conta</h2>
              <p className="text-slate-500 text-base">Comece sua jornada digital no PocketMed hoje mesmo.</p>
            </div>
          </header>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block" htmlFor="name">
                Nome Completo
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10"
                  id="name"
                  placeholder="Ex: Dr. Roberto Silva"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* CRM & Clinic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block" htmlFor="crm">
                  CRM (Médicos)
                </label>
                <div className="relative group">
                  <Badge className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10"
                    id="crm"
                    placeholder="000000-SP"
                    type="text"
                    value={crm}
                    onChange={(e) => setCrm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block" htmlFor="clinic">
                  Nome da Clínica
                </label>
                <div className="relative group">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10"
                    id="clinic"
                    placeholder="Clínica Saúde"
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block" htmlFor="email">
                E-mail Profissional
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-3.5 pl-12 pr-4 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10"
                  id="email"
                  placeholder="contato@exemplo.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block" htmlFor="password">
                Senha
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-3.5 pl-12 pr-12 text-slate-900 text-sm placeholder:text-slate-400 outline-none transition-all focus:ring-2 focus:ring-primary/10"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md border-none bg-transparent cursor-pointer"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start pt-2">
              <div className="flex items-center h-5">
                <input
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary/30"
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                />
              </div>
              <label className="ml-3 text-xs text-slate-500 leading-normal" htmlFor="terms">
                Eu concordo com os{" "}
                <a className="text-primary font-semibold hover:underline" href="#">
                  Termos de Serviço
                </a>{" "}
                e a{" "}
                <a className="text-primary font-semibold hover:underline" href="#">
                  Política de Privacidade
                </a>{" "}
                do PocketMed.
              </label>
            </div>

            {/* Submit */}
            <button
              className="w-full mt-4 py-4 bg-gradient-to-r from-primary to-[#2b5aed] text-white font-semibold rounded-xl shadow-md shadow-primary/10 hover:shadow-primary/20 active:scale-[0.99] transition-all text-sm cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>
          </form>

          {/* Footer */}
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
        </div>

        {/* Bottom footer pinned */}
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
    </div>
  );
}
