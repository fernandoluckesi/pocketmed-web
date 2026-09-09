import { Link } from "react-router-dom";
import { ArrowLeft, Mail, LifeBuoy, Trash2, ShieldCheck } from "lucide-react";
import { InstitutionalHeader } from "./InstitutionalHeader";
import { InstitutionalFooter } from "./InstitutionalFooter";

/**
 * Public support page. Linked as the App Store "Support URL" and from the
 * institutional site. Provides contact channels and answers to the most common
 * questions, including how to delete the account (required by the App Store).
 */
export default function SupportPage() {
  const faqs = [
    {
      question: "Como faço para excluir minha conta?",
      answer:
        "No aplicativo, acesse Perfil, Configurações e toque em Excluir Conta. A exclusão é confirmada por um código enviado ao seu email cadastrado. Dados clínicos obrigatórios por lei podem ser retidos pelo prazo legal, conforme a Política de Privacidade.",
    },
    {
      question: "Esqueci minha senha. O que devo fazer?",
      answer:
        "Na tela de login, toque em Esqueci minha senha e informe o email cadastrado. Você receberá um código para redefinir a senha.",
    },
    {
      question: "Como compartilho meus dados com um médico?",
      answer:
        "O compartilhamento é feito por autorização. Você decide quais profissionais podem acessar o seu prontuário e pode revogar esse acesso a qualquer momento pelo aplicativo.",
    },
    {
      question: "Como gerencio meus dependentes?",
      answer:
        "Na área de Dependentes, você pode cadastrar pessoas sob seus cuidados, como filhos e pais, e gerenciar as informações de saúde de cada um em uma única conta.",
    },
    {
      question: "O Hispora substitui uma consulta médica?",
      answer:
        "Não. O Hispora é uma ferramenta de organização e registro de informações de saúde. Ele não substitui a avaliação, o diagnóstico ou o tratamento de um profissional de saúde.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <InstitutionalHeader />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Voltar ao início
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <LifeBuoy className="text-primary" size={28} />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Suporte
          </h1>
        </div>
        <p className="text-sm text-slate-500 mb-8 sm:mb-10">
          Precisa de ajuda com o Hispora? Estamos aqui para ajudar. Confira as
          perguntas frequentes ou entre em contato conosco.
        </p>

        {/* Contact channels */}
        <section className="grid gap-4 sm:grid-cols-2 mb-10 sm:mb-12">
          <a
            href="mailto:suporte@hispora.com.br"
            className="flex items-start gap-3 rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-primary/40 transition-colors"
          >
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Mail className="text-primary" size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Suporte</p>
              <p className="text-sm text-slate-500">suporte@hispora.com.br</p>
              <p className="text-xs text-slate-400 mt-1">
                Dúvidas, problemas e ajuda com o app
              </p>
            </div>
          </a>

          <a
            href="mailto:privacidade@hispora.com.br"
            className="flex items-start gap-3 rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-primary/40 transition-colors"
          >
            <div className="rounded-xl bg-primary/10 p-2.5">
              <ShieldCheck className="text-primary" size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Privacidade</p>
              <p className="text-sm text-slate-500">
                privacidade@hispora.com.br
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Direitos do titular e dados pessoais (LGPD)
              </p>
            </div>
          </a>
        </section>

        {/* Delete account highlight (required by the App Store) */}
        <section className="rounded-2xl bg-slate-50 border border-slate-100 p-5 sm:p-6 mb-10 sm:mb-12">
          <div className="flex items-center gap-2 mb-2">
            <Trash2 className="text-slate-500" size={18} />
            <h2 className="text-base font-extrabold text-slate-900">
              Exclusão de conta
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Você pode excluir sua conta e seus dados a qualquer momento, direto
            pelo aplicativo, em Perfil, Configurações, Excluir Conta. A ação é
            confirmada por um código enviado ao seu email. Dados clínicos
            obrigatórios por lei podem ser retidos pelo prazo legal, conforme a{" "}
            <Link
              to="/legal#privacidade"
              className="font-semibold text-primary hover:underline"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4">
            Perguntas frequentes
          </h2>
          <div className="space-y-5">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-slate-100 shadow-sm p-5"
              >
                <h3 className="font-bold text-slate-900 mb-1.5">
                  {faq.question}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
