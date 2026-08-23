import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Smartphone,
  Shield,
  Heart,
  Users,
  ArrowRight,
  CheckCircle,
  Stethoscope,
  Calendar,
  Pill,
  BarChart3,
  Bell,
  Star,
} from "lucide-react";
import iconLogo from "../assets/images/icon.png";
import mobileImg from "../assets/images/mobile.png";
import {
  LegalModal,
  PrivacyPolicyContent,
  TermsOfServiceContent,
  SecurityStandardsContent,
} from "./Institutional/LegalModal";

type ModalType = "privacy" | "terms" | "security" | null;

export default function LandingPage() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={iconLogo}
              alt="PocketMed"
              className="w-10 h-10 rounded-xl"
            />
            <span className="text-xl font-extrabold text-slate-900">
              Pocket<span className="text-primary">Med</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/institutional/mobile"
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              App Mobile
            </Link>
            <Link
              to="/institutional/platform"
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              Para Médicos
            </Link>
            <Link
              to="/institutional"
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              Sobre
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-bold text-slate-700 hover:text-primary transition-colors px-4 py-2.5"
            >
              Entrar
            </Link>
            <Link
              to="/signup"
              className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden h-[calc(100vh-73px)] max-h-[800px] flex items-center bg-white">
        <div className="relative max-w-6xl mx-auto px-6 py-8 w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-8">
                <Heart size={16} />
                Prontuário digital inteligente
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Saude conectada,
                <br />
                <span className="text-primary">prontuário universal</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed mb-10">
                O PocketMed conecta pacientes e profissionais de saúde em uma
                plataforma segura. Acesse consultas, exames e histórico médico
                de qualquer lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                >
                  Começar Gratuitamente
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/institutional"
                  className="flex items-center justify-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-2xl font-bold border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  Saiba Mais
                </Link>
              </div>
            </div>
            {/* Hero Visual */}
            <div className="hidden md:flex justify-center relative">
              <img
                src={mobileImg}
                alt="PocketMed App"
                className="w-[300px] drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Numeros */}
      <section className="border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "100%", label: "Gratuito para pacientes" },
            { value: "LGPD", label: "Conformidade total" },
            { value: "24/7", label: "Acesso ao prontuário" },
            { value: "256-bit", label: "Criptografia" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold text-primary mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Para Quem */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Uma plataforma, dois mundos
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Conectamos quem cuida com quem precisa de cuidado.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Pacientes */}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl p-10 border border-emerald-100 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <Smartphone className="text-emerald-600" size={32} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-3">
              Para Pacientes
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Acesse seu prontuário completo pelo celular. Consultas, exames,
              medicamentos, vacinas e alergias — tudo organizado e seguro.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Histórico de consultas",
                "Resultados de exames",
                "Controle de medicamentos",
                "Cartao de vacinas",
                "Notificações em tempo real",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <CheckCircle
                    size={16}
                    className="text-emerald-500 shrink-0"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/institutional/mobile"
              className="text-primary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all"
            >
              Saiba mais sobre o app <ArrowRight size={16} />
            </Link>
          </div>

          {/* Médicos */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-10 border border-blue-100 hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
              <Stethoscope className="text-blue-600" size={32} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-3">
              Para Profissionais
            </h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Gerencie pacientes, prontuários, agenda e equipe médica em um
              painel web completo, moderno e seguro.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Prontuário eletrônico",
                "Gestão de agenda",
                "Equipe e clínica",
                "Financeiro integrado",
                "Auditoria completa",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <CheckCircle size={16} className="text-blue-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/institutional/platform"
              className="text-primary font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all"
            >
              Saiba mais sobre a plataforma <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-900 text-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Recursos que fazem a diferença
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Tecnologia de ponta para cuidar do que mais importa: a sua saúde.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Segurança Avançada",
                desc: "Criptografia, auditoria, hash de integridade e detecção de anomalias.",
              },
              {
                icon: Users,
                title: "Controle de Acesso",
                desc: "Voce decide quem ve seu prontuário. Concessao e revogação instantânea.",
              },
              {
                icon: Calendar,
                title: "Agenda Inteligente",
                desc: "Agendamento, lembretes e aprovações de consultas automatizadas.",
              },
              {
                icon: Pill,
                title: "Gestão de Medicamentos",
                desc: "Histórico completo de prescrições com dosagens e duracao.",
              },
              {
                icon: BarChart3,
                title: "Financeiro",
                desc: "Dashboard com receitas, despesas, repasses e DRE para clínicas.",
              },
              {
                icon: Bell,
                title: "Notificações Push",
                desc: "Alertas em tempo real sobre consultas, exames e aprovações.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/5 rounded-2xl p-7 border border-white/10 hover:border-primary/30 transition-colors"
              >
                <item.icon className="text-primary mb-4" size={28} />
                <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimento / Trust */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-r from-primary to-blue-700 rounded-3xl p-12 md:p-16 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
          <div className="relative z-10">
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={24}
                  className="text-amber-300 fill-amber-300"
                />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl font-bold leading-snug mb-8 max-w-3xl mx-auto">
              "O PocketMed transformou a forma como gerencio minha clínica. Tudo
              integrado, seguro e acessível."
            </blockquote>
            <p className="text-blue-200 font-medium">
              Dr. Fernando Luckesi — Clínica Geral
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
          Comece agora, é gratuito
        </h2>
        <p className="text-lg text-slate-600 max-w-xl mx-auto mb-10">
          Crie sua conta em menos de 2 minutos e tenha acesso a todas as
          funcionalidades.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
            Criar Conta Gratuita
          </Link>
          <Link
            to="/login"
            className="text-slate-700 font-bold px-10 py-4 rounded-2xl border border-slate-200 hover:border-primary/30 transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-10 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          {/* Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
            <button
              onClick={() => setActiveModal("privacy")}
              className="text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
            >
              Políticas de Privacidade
            </button>
            <button
              onClick={() => setActiveModal("terms")}
              className="text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
            >
              Termos de Serviço
            </button>
            <button
              onClick={() => setActiveModal("security")}
              className="text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
            >
              Padrões de Segurança
            </button>
          </div>

          {/* Nav + Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src={iconLogo}
                alt="PocketMed"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-sm font-bold text-slate-700">
                Pocket<span className="text-primary">Med</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link
                to="/institutional"
                className="hover:text-primary transition-colors"
              >
                Sobre
              </Link>
              <Link
                to="/institutional/mobile"
                className="hover:text-primary transition-colors"
              >
                App Mobile
              </Link>
              <Link
                to="/institutional/platform"
                className="hover:text-primary transition-colors"
              >
                Plataforma Web
              </Link>
            </div>
            <p className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} PocketMed Clínical Systems.
              Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <LegalModal
        open={activeModal === "privacy"}
        onClose={() => setActiveModal(null)}
        title="Política de Privacidade"
      >
        <PrivacyPolicyContent />
      </LegalModal>
      <LegalModal
        open={activeModal === "terms"}
        onClose={() => setActiveModal(null)}
        title="Termos de Serviço"
      >
        <TermsOfServiceContent />
      </LegalModal>
      <LegalModal
        open={activeModal === "security"}
        onClose={() => setActiveModal(null)}
        title="Padrões de Segurança"
      >
        <SecurityStandardsContent />
      </LegalModal>
    </div>
  );
}
