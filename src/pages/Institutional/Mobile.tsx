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
import iconLogo from "../../assets/images/icon.png";
import { InstitutionalFooter } from "./InstitutionalFooter";
import { InstitutionalHeader } from "./InstitutionalHeader";

export default function InstitutionalMobile() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <InstitutionalHeader currentPage="mobile" />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50/30" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28">
          <Link to="/institutional" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-6 sm:mb-8 transition-colors">
            <ArrowLeft size={16} />
            Voltar para o início
          </Link>
          <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-5 sm:mb-6">
                <Smartphone size={16} />
                Aplicativo Mobile
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4 sm:mb-6">
                Seu prontuário<br />
                <span className="text-primary">no bolso</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 sm:mb-8">
                O aplicativo PocketMed permite que pacientes acessem todo o seu histórico
                médico de forma simples, segura e instantânea. Consultas, exames, medicamentos,
                vacinas e alergias — tudo em um só lugar.
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium">Android</span>
                <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium">iOS</span>
                <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium">Gratuito</span>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-56 sm:w-72 h-[440px] sm:h-[580px] bg-slate-900 rounded-[2.4rem] sm:rounded-[3rem] p-2 sm:p-3 shadow-2xl shadow-slate-900/20">
                <div className="w-full h-full bg-gradient-to-b from-primary to-blue-700 rounded-[2rem] sm:rounded-[2.4rem] flex flex-col items-center justify-center text-white p-6 sm:p-8">
                  <img src={iconLogo} alt="PocketMed" className="w-14 sm:w-20 h-14 sm:h-20 rounded-2xl mb-4 sm:mb-6" />
                  <h3 className="text-xl sm:text-2xl font-extrabold mb-2">PocketMed</h3>
                  <p className="text-blue-200 text-center text-xs sm:text-sm">Seu prontuário sempre com você</p>
                </div>
              </div>
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
          Todas as informações do seu prontuário médico organizadas e acessiveis a qualquer momento.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {[
            { icon: Calendar, title: "Consultas", desc: "Acompanhe todo o histórico de consultas, com detalhes do médico, diagnóstico e orientacoes recebidas." },
            { icon: FileText, title: "Exames", desc: "Visualize resultados de exames laboratoriais e de imagem. Compartilhe com seu médico de confianca." },
            { icon: Pill, title: "Medicamentos", desc: "Controle todos os medicamentos prescritos, dosagens, horarios e durações do tratamento." },
            { icon: Heart, title: "Vacinas e Alergias", desc: "Mantenha atualizado seu cartao de vacinas e alergias conhecidas para atendimentos de emergência." },
            { icon: Bell, title: "Notificações", desc: "Receba lembretes de medicamentos, retornos médicos e aprovações de acesso ao seu prontuário." },
            { icon: Shield, title: "Controle de Acesso", desc: "Voce decide quais médicos podem acessar seu prontuário. Aprovacao e revogação com um toque." },
          ].map((item) => (
            <div key={item.title} className="bg-slate-50 rounded-2xl p-7 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                <item.icon className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
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
              { icon: Fingerprint, title: "Autenticação Segura", desc: "Login com email verificado e senha forte. Verificação em duas etapas por código." },
              { icon: Shield, title: "Dados Protegidos", desc: "Criptografia em trânsito e em repouso. Conformidade total com a LGPD." },
              { icon: CheckCircle, title: "Consentimento", desc: "Nenhum médico acessa seu prontuário sem sua autorização explícita." },
            ].map((item) => (
              <div key={item.title} className="bg-white/5 rounded-2xl p-8 border border-white/10">
                <item.icon className="text-primary mb-4" size={32} />
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
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
            { step: "1", icon: Smartphone, title: "Baixe o App", desc: "Disponível na Google Play e App Store gratuitamente." },
            { step: "2", icon: CheckCircle, title: "Crie sua Conta", desc: "Cadastro rápido com email e verificação por código." },
            { step: "3", icon: Wifi, title: "Conecte com seu Médico", desc: "Aceite a solicitação de acesso do seu profissional de saúde." },
            { step: "4", icon: Clock, title: "Acesse seu Prontuário", desc: "Consultas, exames e medicamentos organizados em tempo real." },
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
      <section className="bg-gradient-to-r from-primary to-blue-700 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-extrabold mb-4">
            Baixe o PocketMed agora
          </h2>
          <p className="text-blue-200 text-lg mb-8">
            Tenha seu prontuário médico completo sempre acessível no seu celular.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:scale-[1.02] transition-transform"
            >
              Google Play
            </a>
            <a
              href="#"
              className="bg-white/10 text-white border border-white/30 px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-colors"
            >
              App Store (em breve)
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <InstitutionalFooter />
    </div>
  );
}
