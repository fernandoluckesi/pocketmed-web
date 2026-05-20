import { useState } from "react";
import { User, Shield, Badge, Building, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  const handleSubmit = (e: React.FormEvent) => {
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
    // TODO: integrate with real auth
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center w-full px-6 py-5 max-w-7xl mx-auto">
        <div className="text-2xl font-black text-primary tracking-tight flex items-center gap-2">
          <span className="p-1 px-2.5 bg-primary text-white rounded-lg text-lg">P</span>
          PocketMed
        </div>
        <button
          onClick={() => navigate("/login")}
          className="text-sm font-bold text-primary hover:underline transition duration-150 border-none bg-transparent cursor-pointer"
        >
          Já tenho conta
        </button>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-2xl shadow-[0_12px_40px_rgba(25,28,30,0.08)] bg-white border border-slate-100">
          {/* Branding Section */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-primary relative overflow-hidden text-white">
            <div className="relative z-10">
              <h1 className="text-4xl font-extrabold tracking-tight mb-6 leading-tight font-display">
                Precisão clínica na palma da sua mão.
              </h1>
              <p className="text-lg text-blue-100/90 max-w-md leading-relaxed">
                Junte-se à rede de especialistas que está transformando a gestão clínica com tecnologia de ponta e interface intuitiva.
              </p>
            </div>

            <div className="relative z-10 mt-12">
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

            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <img
                alt="Abstract medical network"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRvZFCWIne01XNH_YXlP704D62hgNDD3hgMZDpabJUCj9QVcT0zoq4Zx_9_sD3aXh7zcrQ5ovDWsaUsQJlbo-O7ampapo0QRu5e6nFBo_io5EOrhgq0em9CVZObLG0-a_yhrRs4Z-mFbaBroicm4vplqhiD8q8Ah5vLDBJh-mtUR3zWR_lq3_2wyAwY1g5Ilz7DRLLfEMplROQi1ZRwv6lJ6HsV3nENcYQj29gOVu-jtdrDRkBi3TO3kk_MxwwiCnystjT5aJooxZW"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8 md:p-12 lg:p-14 flex flex-col justify-center bg-white">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight font-display mb-2">Criar conta</h2>
              <p className="text-slate-500 text-sm md:text-base">Comece sua jornada digital no PocketMed hoje mesmo.</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 font-medium">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block" htmlFor="name">
                  Nome Completo
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 w-5 h-5 text-slate-400" />
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-[#f2f4f6] border-none rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
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
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block" htmlFor="crm">
                    CRM (Médicos)
                  </label>
                  <div className="relative flex items-center">
                    <Badge className="absolute left-4 w-5 h-5 text-slate-400" />
                    <input
                      className="w-full pl-12 pr-4 py-3 bg-[#f2f4f6] border-none rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                      id="crm"
                      placeholder="000000-SP"
                      type="text"
                      value={crm}
                      onChange={(e) => setCrm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block" htmlFor="clinic">
                    Nome da Clínica
                  </label>
                  <div className="relative flex items-center">
                    <Building className="absolute left-4 w-5 h-5 text-slate-400" />
                    <input
                      className="w-full pl-12 pr-4 py-3 bg-[#f2f4f6] border-none rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block" htmlFor="email">
                  E-mail Profissional
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-5 h-5 text-slate-400" />
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-[#f2f4f6] border-none rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block" htmlFor="password">
                  Senha
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-slate-400" />
                  <input
                    className="w-full pl-12 pr-12 py-3 bg-[#f2f4f6] border-none rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="absolute right-4 text-slate-400 hover:text-primary transition-colors focus:outline-none border-none bg-transparent cursor-pointer"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                className="w-full mt-4 py-3.5 bg-gradient-to-r from-primary to-[#2b5aed] text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.99] transition-all outline-none focus:ring-2 focus:ring-primary/40 text-sm cursor-pointer border-none"
                type="submit"
              >
                Criar Conta
              </button>

              {/* Switch to login */}
              <div className="pt-4 text-center">
                <p className="text-slate-500 text-sm">
                  Já possui uma conta?{" "}
                  <button
                    type="button"
                    className="text-primary font-bold hover:underline ml-1 focus:outline-none border-none bg-transparent cursor-pointer"
                    onClick={() => navigate("/login")}
                  >
                    Fazer Login
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col md:flex-row justify-between items-center w-full max-w-7xl mx-auto px-8 py-6 text-slate-400 text-xs gap-4 border-t border-slate-200/40">
        <p>© 2026 PocketMed Clinical Systems. Todos os direitos reservados.</p>
        <div className="flex gap-6">
          <span className="hover:text-slate-600 transition cursor-pointer">Normas de Segurança</span>
          <span className="hover:text-slate-600 transition cursor-pointer">Ajuda</span>
        </div>
      </footer>
    </div>
  );
}
