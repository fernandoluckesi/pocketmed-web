import { Link } from "react-router-dom";
import {
  Smartphone,
  Monitor,
  Shield,
  Heart,
  Users,
  FileText,
  Lock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { InstitutionalFooter } from "./InstitutionalFooter";
import { InstitutionalHeader } from "./InstitutionalHeader";

export default function InstitutionalHome() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <InstitutionalHeader currentPage="home" />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50/30" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 sm:mb-8">
            <Heart size={16} />
            Prontuário digital inteligente
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4 sm:mb-6">
            Seu prontuário médico,<br />
            <span className="text-primary">sempre com você</span>
          </h1>
          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-12">
            O PocketMed conecta pacientes e profissionais de saúde em uma plataforma segura
            e intuitiva. Acesse consultas, exames, medicamentos e histórico médico completo
            de qualquer lugar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/institutional/mobile"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-white px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              <Smartphone size={20} />
              Conhecer o App Mobile
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/institutional/platform"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-slate-900 px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl font-bold border border-slate-200 hover:border-primary/30 hover:shadow-lg transition-all"
            >
              <Monitor size={20} />
              Plataforma para Médicos
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* O que é o PocketMed */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">O que é o PocketMed?</h2>
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
            O PocketMed é um ecossistema completo de saúde digital que unifica o prontuário
            médico do paciente com as ferramentas de gestão do profissional de saúde.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-slate-50 rounded-3xl p-8 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Smartphone className="text-primary" size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">App para Pacientes</h3>
            <p className="text-slate-600 leading-relaxed">
              Acesse seu histórico médico completo, consultas, exames, medicamentos e vacinas
              diretamente do seu celular. Disponível para Android e iOS.
            </p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
              <Monitor className="text-indigo-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Plataforma para Médicos</h3>
            <p className="text-slate-600 leading-relaxed">
              Gestão completa de pacientes, agendamentos, prontuários eletrônicos e equipe
              médica. Tudo em um painel web moderno e seguro.
            </p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="text-emerald-600" size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Segurança e Privacidade</h3>
            <p className="text-slate-600 leading-relaxed">
              Dados protegidos com criptografia, sistema de auditoria completo e conformidade
              com a LGPD. Seu prontuário é sigiloso.
            </p>
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="bg-slate-50 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-12 sm:mb-16">
            Pilares da Plataforma
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: FileText, title: "Prontuário Universal", desc: "Histórico médico completo e acessível" },
              { icon: Users, title: "Conexão Médico-Paciente", desc: "Comunicação segura e direta" },
              { icon: Lock, title: "LGPD Compliant", desc: "Dados protegidos por lei" },
              { icon: CheckCircle, title: "Auditoria Completa", desc: "Rastreabilidade total de operações" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-primary" size={24} />
                </div>
                <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
          Pronto para começar?
        </h2>
        <p className="text-base sm:text-lg text-slate-600 mb-8 sm:mb-10 max-w-xl mx-auto">
          Junte-se a milhares de profissionais e pacientes que já utilizam o PocketMed.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform text-center"
          >
            Criar Conta Gratuita
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto text-primary font-bold px-10 py-4 rounded-2xl border border-primary/20 hover:bg-primary/5 transition-colors text-center"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Footer */}
      <InstitutionalFooter />
    </div>
  );
}
