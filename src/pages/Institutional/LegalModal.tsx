import { X } from "lucide-react";

interface LegalModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function LegalModal({
  open,
  onClose,
  title,
  children,
}: LegalModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-100 shrink-0">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        {/* Content */}
        <div className="overflow-y-auto px-5 sm:px-8 py-5 sm:py-6 text-sm text-slate-700 leading-relaxed space-y-4">
          {children}
        </div>
        {/* Footer */}
        <div className="px-5 sm:px-8 py-3 sm:py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-dark transition-colors cursor-pointer border-none"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicyContent() {
  return (
    <>
      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
        Última atualização: Agosto de 2026
      </p>

      <h3 className="text-lg font-bold text-slate-900 mt-4">1. Introdução</h3>
      <p>
        A Hispora Clínical Systems ("Hispora", "nos") valoriza a privacidade
        dos seus usuarios. Esta Política de Privacidade descreve como coletamos,
        usamos, armazenamos e protegemos seus dados pessoais quando você utiliza
        nosso aplicativo mobile e plataforma web.
      </p>

      <h3 className="text-lg font-bold text-slate-900">
        2. Dados que Coletamos
      </h3>
      <p>Coletamos as seguintes categorias de dados:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <strong>Dados de cadastro:</strong> nome completo, email, telefone,
          CPF, data de nascimento, genero, CRM (para médicos).
        </li>
        <li>
          <strong>Dados de saúde:</strong> histórico de consultas, diagnósticos,
          prescrições, resultados de exames, medicamentos, alergias, vacinas e
          doenças.
        </li>
        <li>
          <strong>Dados de uso:</strong> logs de acesso, endereços IP, tipo de
          dispositivo e navegador.
        </li>
        <li>
          <strong>Dados de comunicação:</strong> notificações enviadas e
          recebidas dentro da plataforma.
        </li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">
        3. Finalidade do Tratamento
      </h3>
      <p>Utilizamos seus dados para:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Prestar o serviço de prontuário eletrônico digital;</li>
        <li>
          Permitir a comunicação entre pacientes e profissionais de saúde;
        </li>
        <li>Enviar notificações sobre consultas, medicamentos e aprovações;</li>
        <li>Garantir a segurança e auditoria de acesso aos dados;</li>
        <li>Cumprir obrigações legais e regulatórias.</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">4. Base Legal (LGPD)</h3>
      <p>
        O tratamento dos dados pessoais e de saúde é realizado com base no
        consentimento do titular (Art. 7, I da LGPD), na execução de contrato
        (Art. 7, V), na tutela da saúde (Art. 7, VIII) e no cumprimento de
        obrigacao legal (Art. 7, II), conforme aplicavel.
      </p>

      <h3 className="text-lg font-bold text-slate-900">
        5. Compartilhamento de Dados
      </h3>
      <p>
        Seus dados de saúde só sao compartilhados com profissionais de saúde que
        você explícitamente autorizar. Não vendemos, alugamos ou compartilhamos
        dados pessoais com terceiros para fins de marketing.
      </p>
      <p>Podemos compartilhar dados com:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Profissionais de saúde autorizados pelo paciente;</li>
        <li>
          Provedores de infraestrutura (hospedagem, email) sob contrato de
          confidencialidade;
        </li>
        <li>Autoridades competentes quando exigido por lei.</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">
        6. Armazenamento e Segurança
      </h3>
      <p>
        Os dados sao armazenados em servidores seguros com criptografia em
        trânsito (TLS) e em repouso. Implementamos controle de acesso, auditoria
        de operações, detecção de anomalias e políticas de retenção conforme a
        legislacao vigente.
      </p>

      <h3 className="text-lg font-bold text-slate-900">7. Retenção de Dados</h3>
      <p>
        Dados de prontuário médico sao mantidos pelo prazo mínimo de 20 anos
        após o ultimo registro, conforme Resolucao CFM 1.821/2007. Dados de
        conta podem ser excluidos mediante solicitação do titular, respeitando
        obrigações legais de retenção.
      </p>

      <h3 className="text-lg font-bold text-slate-900">
        8. Direitos do Titular
      </h3>
      <p>Conforme a LGPD, você tem direito a:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Confirmar a existencia de tratamento dos seus dados;</li>
        <li>Acessar seus dados pessoais;</li>
        <li>Corrigir dados incompletos ou desatualizados;</li>
        <li>Solicitar a exclusão de dados (respeitando obrigações legais);</li>
        <li>Revogar consentimento a qualquer momento;</li>
        <li>Solicitar portabilidade dos dados.</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">9. Exclusão de Conta</h3>
      <p>
        Você pode solicitar a exclusão da sua conta a qualquer momento através
        do aplicativo ou plataforma web. A exclusão e confirmada mediante
        verificação por código enviado ao email cadastrado. Dados clinicos
        obrigatórios por lei serão retidos pelo prazo legal.
      </p>

      <h3 className="text-lg font-bold text-slate-900">10. Contato</h3>
      <p>
        Para exercer seus direitos ou esclarecer duvidas sobre esta politica,
        entre em contato pelo email:{" "}
        <strong>privacidade@pocketmed.com.br</strong>
      </p>
    </>
  );
}

export function TermsOfServiceContent() {
  return (
    <>
      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
        Última atualização: Agosto de 2026
      </p>

      <h3 className="text-lg font-bold text-slate-900 mt-4">
        1. Aceitação dos Termos
      </h3>
      <p>
        Ao utilizar o aplicativo Hispora ou a plataforma web, você concorda
        integralmente com estes Termos de Serviço. Caso não concorde, não
        utilize nossos serviços.
      </p>

      <h3 className="text-lg font-bold text-slate-900">
        2. Descrição do Serviço
      </h3>
      <p>O Hispora é uma plataforma de saúde digital que oferece:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Prontuário eletrônico universal para pacientes;</li>
        <li>Gestão de consultas, exames e medicamentos;</li>
        <li>Ferramentas de gestão clínica para profissionais de saúde;</li>
        <li>Sistema de controle de acesso e permissões;</li>
        <li>Notificações e lembretes de saúde.</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">3. Cadastro e Conta</h3>
      <p>
        Para utilizar o serviço, você deve criar uma conta fornecendo
        informações verdadeiras e atualizadas. Você é responsável por manter a
        segurança da sua senha e por todas as atividades realizadas na sua
        conta.
      </p>
      <p>
        Senhas devem conter no mínimo 8 caracteres, incluindo letras maiusculas,
        minusculas, numeros e caracteres especiais.
      </p>

      <h3 className="text-lg font-bold text-slate-900">4. Uso Adequado</h3>
      <p>Você concorda em:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Fornecer informações verdadeiras e atualizadas;</li>
        <li>Não compartilhar credenciais de acesso;</li>
        <li>Não utilizar o serviço para fins ilegais;</li>
        <li>Não tentar acessar dados de outros usuarios sem autorização;</li>
        <li>Não interferir no funcionamento da plataforma.</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">
        5. Profissionais de Saúde
      </h3>
      <p>
        Profissionais de saúde que utilizam a plataforma declaram possuir
        registro profissional valido (CRM, CRO ou equivalente). O Hispora não
        se responsabiliza por diagnósticos, prescrições ou orientações medicas
        registradas pelos profissionais.
      </p>

      <h3 className="text-lg font-bold text-slate-900">6. Dados de Saúde</h3>
      <p>
        Dados de saúde registrados no Hispora sao de responsabilidade do
        profissional que os registrou e do paciente titular. O Hispora atua
        como operador dos dados conforme a LGPD, garantindo segurança e
        disponibilidade.
      </p>

      <h3 className="text-lg font-bold text-slate-900">
        7. Consentimento e Acesso
      </h3>
      <p>
        Nenhum profissional pode acessar o prontuário de um paciente sem
        autorização explícita. O paciente pode conceder e revogar acesso a
        qualquer momento através do aplicativo.
      </p>

      <h3 className="text-lg font-bold text-slate-900">8. Disponibilidade</h3>
      <p>
        Nos esforçamos para manter o serviço disponível 24 horas por dia, 7 dias
        por semana. No entanto, não garantimos disponibilidade ininterrupta e
        podemos realizar manutenções programadas.
      </p>

      <h3 className="text-lg font-bold text-slate-900">
        9. Limitação de Responsabilidade
      </h3>
      <p>
        O Hispora não substitui consultas medicas presenciais. A plataforma é
        uma ferramenta de organizacao e gestão de informações de saúde. Decisoes
        clínicas sao de responsabilidade exclusiva dos profissionais de saúde.
      </p>

      <h3 className="text-lg font-bold text-slate-900">
        10. Cancelamento e Exclusão
      </h3>
      <p>
        Você pode cancelar sua conta a qualquer momento. Ao cancelar, seus dados
        serão tratados conforme nossa Política de Privacidade e obrigações
        legais de retenção.
      </p>

      <h3 className="text-lg font-bold text-slate-900">
        11. Alterações nos Termos
      </h3>
      <p>
        Podemos atualizar estes termos periodicamente. Alterações significativas
        serão comunicadas por email ou notificacao no aplicativo. O uso
        continuado após as alterações constitui aceitacao dos novos termos.
      </p>

      <h3 className="text-lg font-bold text-slate-900">12. Foro</h3>
      <p>
        Este contrato é regido pelas leis da Republica Federativa do Brasil.
        Fica eleito o foro da comarca de Sao Paulo/SP para dirimir quaisquer
        controvérsias.
      </p>
    </>
  );
}

export function SecurityStandardsContent() {
  return (
    <>
      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
        Última atualização: Agosto de 2026
      </p>

      <h3 className="text-lg font-bold text-slate-900 mt-4">1. Visão Geral</h3>
      <p>
        O Hispora implementa um conjunto robusto de controles de segurança
        para proteger dados pessoais e de saúde dos nossos usuarios. Este
        documento descreve os padrões e praticas adotados.
      </p>

      <h3 className="text-lg font-bold text-slate-900">2. Criptografia</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <strong>Em trânsito:</strong> todas as comunicacoes utilizam TLS 1.2+
          (HTTPS);
        </li>
        <li>
          <strong>Em repouso:</strong> dados sensiveis armazenados com
          criptografia no banco de dados;
        </li>
        <li>
          <strong>Senhas:</strong> armazenadas com hash bcrypt (salt rounds 10),
          nunca em texto puro.
        </li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">
        3. Autenticação e Autorização
      </h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          Autenticação baseada em JWT (JSON Web Tokens) com expiracao de 7 dias;
        </li>
        <li>
          Política de senha forte: mínimo 8 caracteres com maiusculas,
          minusculas, numeros e simbolos;
        </li>
        <li>Verificação de email obrigatória por código de 6 digitos;</li>
        <li>
          Verificação por código para operações criticas (exclusão de conta);
        </li>
        <li>
          Controle de acesso baseado em papeis (RBAC): médico, admin,
          secretário(a), paciente.
        </li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">
        4. Sistema de Auditoria
      </h3>
      <p>
        Todas as operações sobre dados sensiveis sao registradas em um sistema
        de auditoria centralizado com:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Registro de quem realizou a operacao (ator);</li>
        <li>Qual recurso foi afetado e qual paciente esta relacionado;</li>
        <li>Timestamp com precisao de microsegundos;</li>
        <li>Endereco IP e User-Agent da requisicao;</li>
        <li>Campos alterados (antes/depois) para operações de UPDATE;</li>
        <li>Cadeia de hash SHA-256 para detecção de adulteracao;</li>
        <li>
          Registros em modo append-only (nao podem ser alterados ou excluidos).
        </li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">
        5. Deteccao de Anomalias
      </h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          Monitoramento de tentativas de brute force (login) por IP e usuario;
        </li>
        <li>Deteccao de padrões de acesso anomalos a prontuários;</li>
        <li>
          Alertas automáticos para operações em massa (downloads, exportacoes);
        </li>
        <li>Thresholds configuráveis para diferentes tipos de ameaca.</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">
        6. Controle de Acesso a Dados Clinicos
      </h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          Profissionais só acessam prontuários com autorização explícita do
          paciente;
        </li>
        <li>Pacientes podem revogar acesso a qualquer momento;</li>
        <li>
          Tentativas de acesso não autorizado sao registradas e auditadas;
        </li>
        <li>Secretários(as) não possuem acesso a dados clinicos.</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">7. Infraestrutura</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>Hospedagem em provedores com certificacao SOC 2;</li>
        <li>Banco de dados com backups automáticos diarios;</li>
        <li>Isolamento de ambientes (desenvolvimento, staging, producao);</li>
        <li>Monitoramento continuo de saúde da aplicacao.</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">
        8. Política de Retenção
      </h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>Dados de prontuário: mínimo 20 anos (Resolucao CFM 1.821/2007);</li>
        <li>Logs de auditoria: 7 anos por padrao (configuravel);</li>
        <li>
          Dados de conta excluida: removidos imediatamente, exceto obrigações
          legais.
        </li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">9. Conformidade</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <strong>LGPD</strong> (Lei Geral de Proteção de Dados) — Lei
          13.709/2018;
        </li>
        <li>
          <strong>CFM 1.821/2007</strong> — Normas tecnicas para prontuário
          eletrônico;
        </li>
        <li>
          <strong>CFM 2.217/2018</strong> — Código de Ética Médica (sigilo
          profissional);
        </li>
        <li>Principios de minimizacao de dados e privacy by design.</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">
        10. Relato de Vulnerabilidades
      </h3>
      <p>
        Caso identifique uma vulnerabilidade de segurança, entre em contato pelo
        email:
        <strong> segurança@pocketmed.com.br</strong>. Nos comprometemos a
        avaliar e responder em até 72 horas.
      </p>
    </>
  );
}
