import { Link } from "react-router-dom";
import {
  Smartphone,
  Shield,
  Bell,
  Calendar,
  Pill,
  FileText,
  Heart,
  ArrowLeft,
  CheckCircle,
  Fingerprint,
  Wifi,
  Clock,
} from "lucide-react";
import { InstitutionalFooter } from "./InstitutionalFooter";
import { InstitutionalHeader } from "./InstitutionalHeader";
import mobileImg from "../../assets/images/mobile.png";

export default function InstitutionalMobile() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <InstitutionalHeader currentPage="mobile" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-0">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-1 mt-2 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar para o início
          </Link>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-8">
                <Smartphone size={16} />
                Aplicativo Mobile
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4 sm:mb-6">
                Seu prontuário
                <br />
                <span className="text-primary">no bolso</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 sm:mb-8">
                O aplicativo Hispora é gratuito e permite que pacientes
                acessem todo o seu histórico médico de forma simples, segura e
                instantânea. Consultas, exames, medicamentos, vacinas e
                alergias, tudo em um só lugar.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium">
                  Android
                </span>
                <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium">
                  iOS
                </span>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <img
                src={mobileImg}
                alt="Hispora App"
                className="w-[300px] drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-3 sm:mb-4">
          O que você pode fazer no app
        </h2>
        <p className="text-base sm:text-lg text-slate-600 text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          Todas as informações do seu prontuário médico organizadas e acessíveis
          a qualquer momento.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {[
            {
              icon: Calendar,
              title: "Consultas",
              desc: "Acompanhe todo o histórico de consultas, com detalhes do médico, diagnóstico e orientações recebidas.",
            },
            {
              icon: FileText,
              title: "Exames",
              desc: "Visualize resultados de exames laboratoriais e de imagem. Compartilhe com seu médico de confiança.",
            },
            {
              icon: Pill,
              title: "Medicamentos",
              desc: "Controle todos os medicamentos prescritos, dosagens, horários e durações do tratamento.",
            },
            {
              icon: Heart,
              title: "Vacinas e Alergias",
              desc: "Mantenha atualizado seu cartão de vacinas e alergias conhecidas para atendimentos de emergência.",
            },
            {
              icon: Bell,
              title: "Notificações",
              desc: "Receba lembretes de medicamentos, retornos médicos e aprovações de acesso ao seu prontuário.",
            },
            {
              icon: Shield,
              title: "Controle de Acesso",
              desc: "Você decide quais médicos podem acessar seu prontuário. Aprovação e revogação com um toque.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-slate-50 rounded-2xl p-7 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                <item.icon className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Segurança */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold text-center mb-16">
            Segurança em primeiro lugar
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Fingerprint,
                title: "Autenticação Segura",
                desc: "Login com email verificado e senha forte. Verificação em duas etapas por código.",
              },
              {
                icon: Shield,
                title: "Dados Protegidos",
                desc: "Criptografia em trânsito e em repouso. Conformidade total com a LGPD.",
              },
              {
                icon: CheckCircle,
                title: "Consentimento",
                desc: "Nenhum médico acessa seu prontuário sem sua autorização explícita.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/5 rounded-2xl p-8 border border-white/10"
              >
                <item.icon className="text-primary mb-4" size={32} />
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-16">
          Como funciona
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              step: "1",
              icon: Smartphone,
              title: "Baixe o App",
              desc: "Disponível na Google Play e App Store gratuitamente.",
            },
            {
              step: "2",
              icon: CheckCircle,
              title: "Crie sua Conta",
              desc: "Cadastro rápido com email e verificação por código.",
            },
            {
              step: "3",
              icon: Wifi,
              title: "Conecte com seu Médico",
              desc: "Aceite a solicitação de acesso do seu profissional de saúde.",
            },
            {
              step: "4",
              icon: Clock,
              title: "Acesse seu Prontuário",
              desc: "Consultas, exames e medicamentos organizados em tempo real.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-extrabold">
                {item.step}
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-primary py-16">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-extrabold mb-4">
            Baixe o Hispora agora
          </h2>
          <p className="text-blue-200 text-lg mb-8">
            Tenha seu prontuário médico completo sempre acessível no seu
            celular.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3.5 rounded-2xl hover:scale-[1.02] transition-transform"
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.3 2.3-8.636-8.632z" />
              </svg>
              <div className="text-left">
                <p className="text-[10px] font-medium text-slate-500 leading-none">
                  Disponível no
                </p>
                <p className="text-base font-bold leading-tight">Google Play</p>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3.5 rounded-2xl hover:scale-[1.02] transition-transform"
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <p className="text-[10px] font-medium text-slate-500 leading-none">
                  Disponível na
                </p>
                <p className="text-base font-bold leading-tight">App Store</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <InstitutionalFooter />
    </div>
  );
}
