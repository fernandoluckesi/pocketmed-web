import { Link } from "react-router-dom";
import {
  Monitor,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Building2,
  Shield,
  ArrowLeft,
  CheckCircle,
  Stethoscope,
  ClipboardList,
  UserPlus,
  Bell,
  PieChart,
} from "lucide-react";
import { InstitutionalFooter } from "./InstitutionalFooter";
import { InstitutionalHeader } from "./InstitutionalHeader";

export default function InstitutionalPlatform() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <InstitutionalHeader currentPage="platform" />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50/30" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-12 sm:pb-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-4 sm:mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar para o início
          </Link>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-5 sm:mb-6">
              <Monitor size={16} />
              Plataforma Web
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4 sm:mb-6">
              Gestão completa para
              <br />
              <span className="text-primary">profissionais de saúde</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 sm:mb-8">
              A plataforma web do Hispora oferece aos médicos e clínicas todas
              as ferramentas necessárias para gestão de pacientes, prontuários
              eletrônicos, agendamentos, equipe médica e financeiro — tudo em um
              painel moderno e intuitivo.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-3 bg-primary text-white px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
            >
              Criar Conta Gratuita
            </Link>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-3 sm:mb-4">
          Funcionalidades da Plataforma
        </h2>
        <p className="text-base sm:text-lg text-slate-600 text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          Tudo o que um profissional de saúde precisa para gerenciar sua pratica
          clínica de forma eficiente e segura.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {[
            {
              icon: Users,
              title: "Gestão de Pacientes",
              desc: "Cadastro completo de pacientes com prontuário universal. Histórico médico, alergias, vacinas, doenças e dependentes.",
            },
            {
              icon: Calendar,
              title: "Agenda e Consultas",
              desc: "Agendamento de consultas com visualizacao por dia, semana e mes. Notificações automáticas para pacientes.",
            },
            {
              icon: ClipboardList,
              title: "Prontuário Eletrônico",
              desc: "Registro de evoluções clínicas, diagnósticos, prescrições e encaminhamentos. Tudo organizado por consulta.",
            },
            {
              icon: Stethoscope,
              title: "Equipe Medica",
              desc: "Gestão de múltiplos profissionais na clínica. Perfis de admin, médico e secretário(a) com permissões diferenciadas.",
            },
            {
              icon: FileText,
              title: "Exames e Resultados",
              desc: "Solicitacao de exames, upload de resultados e acompanhamento do histórico laboratorial do paciente.",
            },
            {
              icon: PieChart,
              title: "Financeiro",
              desc: "Dashboard financeiro completo com receitas, despesas, repasses médicos, convenios e DRE.",
            },
            {
              icon: Building2,
              title: "Gestão de Clínica",
              desc: "Cadastro de clínica, membros, especialidades e configuracoes. Visão completa do negocio.",
            },
            {
              icon: Bell,
              title: "Notificações Push",
              desc: "Envio automático de notificações para pacientes sobre consultas, aprovações e lembretes.",
            },
            {
              icon: UserPlus,
              title: "Convite de Pacientes",
              desc: "Cadastre pacientes shadow que recebem convite por email para ativar sua conta no app.",
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

      {/* Diferenciais */}
      <section className="bg-slate-50 py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-12 sm:mb-16">
            Por que escolher o Hispora?
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              {
                title: "Prontuário Universal",
                desc: "O prontuário acompanha o paciente, não o médico. O paciente controla quem pode acessar seus dados.",
              },
              {
                title: "Multi-clínica",
                desc: "Um profissional pode fazer parte de multiplas clínicas com perfis e permissões independentes.",
              },
              {
                title: "Auditoria Completa",
                desc: "Todas as operações sobre dados sensiveis sao registradas com rastreabilidade total (quem, quando, o que).",
              },
              {
                title: "Integração Mobile",
                desc: "Pacientes acessam pelo app tudo que o médico registra na plataforma web, em tempo real.",
              },
              {
                title: "Segurança Avançada",
                desc: "Hash de integridade, detecção de anomalias, política de retenção e controle de acesso granular.",
              },
              {
                title: "Gratuito para Começar",
                desc: "Plano gratuito com funcionalidades essenciais. Escale conforme sua necessidade.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <CheckCircle className="text-primary shrink-0 mt-1" size={22} />
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perfis de Acesso */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-12 sm:mb-16">
          Perfis de Acesso
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              icon: Stethoscope,
              role: "Médico",
              perms: [
                "Registrar consultas e evoluções",
                "Solicitar exames",
                "Prescrever medicamentos",
                "Gerenciar agenda",
                "Visualizar prontuários autorizados",
              ],
            },
            {
              icon: Building2,
              role: "Administrador",
              perms: [
                "Gestão de membros da clínica",
                "Painel financeiro completo",
                "Cadastro de médicos e secretários(as)",
                "Configuracoes da clínica",
                "Visão geral de pacientes",
              ],
            },
            {
              icon: BarChart3,
              role: "Secretário(a)",
              perms: [
                "Agendamento de consultas",
                "Visualizacao basica de pacientes",
                "Gestão de agenda dos médicos",
                "Sem acesso a dados clinicos",
                "Perfil de suporte administrativo",
              ],
            },
          ].map((item) => (
            <div
              key={item.role}
              className="bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <item.icon className="text-primary" size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                {item.role}
              </h3>
              <ul className="space-y-3">
                {item.perms.map((perm) => (
                  <li
                    key={perm}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <CheckCircle
                      size={16}
                      className="text-emerald-500 shrink-0 mt-0.5"
                    />
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Segurança */}
      <section className="bg-slate-900 text-white py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <Shield className="mx-auto mb-5 sm:mb-6 text-primary" size={40} />
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">
            Segurança e Conformidade
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 sm:mb-12">
            O Hispora foi projetado desde o início com segurança como
            prioridade. Todos os dados sao protegidos e rastreados.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto">
            {[
              "Conformidade LGPD",
              "Criptografia SSL/TLS",
              "Auditoria de Operacoes",
              "Controle de Permissoes",
            ].map((item) => (
              <div
                key={item}
                className="bg-white/5 rounded-xl p-4 border border-white/10"
              >
                <p className="text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
          Comece a usar agora
        </h2>
        <p className="text-base sm:text-lg text-slate-600 mb-8 sm:mb-10 max-w-xl mx-auto">
          Crie sua conta gratuita e tenha acesso a todas as funcionalidades
          essenciais.
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center gap-3 bg-primary text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
        >
          Criar Conta de Médico
        </Link>
      </section>

      {/* Footer */}
      <InstitutionalFooter />
    </div>
  );
}
