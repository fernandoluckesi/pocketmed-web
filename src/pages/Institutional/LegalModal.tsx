import { X } from "lucide-react";
import {
  COMPANY,
  hasCompanyLegalInfo,
  hasDpoInfo,
} from "../../constants/company";

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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
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
        Última atualização: Outubro de 2026
      </p>

      <h3 className="text-lg font-bold text-slate-900 mt-4">1. Introdução</h3>
      <p>
        A Hispora Clinical Systems ("Hispora", "nós") valoriza a privacidade dos
        seus usuários. Esta Política de Privacidade descreve como coletamos,
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
          CPF, data de nascimento, gênero, CRM (para médicos).
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

      <h3 className="text-lg font-bold text-slate-900">
        3.1. Tratamento do CPF
      </h3>
      <p>
        O Hispora coleta o CPF de pacientes e de médicos. O CPF é utilizado para
        a identificação segura do usuário dentro da plataforma e poderá, no
        futuro, viabilizar integrações e a interoperabilidade com laboratórios,
        hospitais, clínicas e outros serviços e sistemas de saúde, quando
        aplicável e cabível.
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          O CPF é tratado com as mesmas medidas de segurança aplicadas aos
          demais dados pessoais (ver seção "Armazenamento e Segurança");
        </li>
        <li>
          O CPF não é utilizado como identificador público do usuário nem como
          credencial de acesso à conta;
        </li>
        <li>
          Eventual compartilhamento do CPF com terceiros ocorrerá apenas quando
          houver finalidade legítima e base legal adequada, observando os
          princípios da LGPD;
        </li>
        <li>
          O fornecimento do CPF pelo paciente é opcional no momento do cadastro
          e pode ser preenchido ou atualizado posteriormente no perfil.
        </li>
      </ul>
      <p>
        Você pode, a qualquer momento, exercer os direitos previstos na LGPD em
        relação ao tratamento do seu CPF e dos seus demais dados pessoais
        (conforme a seção "Direitos do Titular"), inclusive solicitar acesso,
        correção ou esclarecimentos, entrando em contato pelo canal indicado na
        seção "Contato".
      </p>

      <h3 className="text-lg font-bold text-slate-900">4. Base Legal (LGPD)</h3>
      <p>
        O tratamento dos dados pessoais e de saúde é realizado com base no
        consentimento do titular (Art. 7, I da LGPD), na execução de contrato
        (Art. 7, V), na tutela da saúde (Art. 7, VIII) e no cumprimento de
        obrigação legal (Art. 7, II), conforme aplicável.
      </p>

      {/* Audit finding R1: the platform has a dependents feature (children
          registered under a responsible adult), and LGPD art. 14 requires
          specific parental consent for a minor's data — which the policy did
          not address at all. */}
      <h3 className="text-lg font-bold text-slate-900">
        4.1. Dados de Crianças e Adolescentes
      </h3>
      <p>
        O Hispora permite que um adulto responsável cadastre dependentes menores
        de 18 anos, para acompanhar a saúde da família em um só lugar. O
        tratamento desses dados observa o Art. 14 da LGPD e é sempre realizado
        no melhor interesse da criança ou do adolescente.
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <strong>Quem pode cadastrar:</strong> somente o pai, a mãe ou o
          responsável legal, que declara essa condição ao criar o dependente e
          responde pela veracidade da informação;
        </li>
        <li>
          <strong>Consentimento parental:</strong> o cadastro do dependente e a
          autorização de acesso de profissionais de saúde ao prontuário dele são
          atos praticados exclusivamente pelo responsável, que exerce os
          direitos do titular menor;
        </li>
        <li>
          <strong>Menor não cria conta própria:</strong> o dependente não possui
          credenciais de acesso enquanto vinculado nessa condição;
        </li>
        <li>
          <strong>Sem publicidade e sem perfilamento:</strong> dados de menores
          não são usados para marketing, segmentação ou qualquer finalidade
          alheia ao cuidado em saúde, e não são condicionados ao fornecimento de
          informações além do necessário;
        </li>
        <li>
          <strong>Exercício de direitos:</strong> o responsável pode solicitar
          acesso, correção, portabilidade ou eliminação dos dados do dependente
          pelos mesmos canais desta política, respeitadas as obrigações legais
          de guarda de prontuário (ver seção 7).
        </li>
      </ul>
      <p>
        Ao atingir a maioridade, o titular pode solicitar a transferência do
        próprio prontuário para uma conta individual, passando a exercer
        diretamente os seus direitos.
      </p>

      <h3 className="text-lg font-bold text-slate-900">
        5. Compartilhamento de Dados
      </h3>
      <p>
        Seus dados de saúde só são compartilhados com profissionais de saúde que
        você explicitamente autorizar. Não vendemos, alugamos ou compartilhamos
        dados pessoais com terceiros para fins de marketing.
      </p>
      <p>Podemos compartilhar dados com:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Profissionais de saúde autorizados pelo paciente;</li>
        <li>
          Operadores (subprocessadores) que executam o serviço em nosso nome,
          listados na seção 5.1;
        </li>
        <li>Autoridades competentes quando exigido por lei.</li>
      </ul>

      {/* Audit finding 16.2: the policy referred to "provedores de
          infraestrutura" generically, without naming them and without
          disclosing international transfer (LGPD art. 33), which does occur
          — the whole stack is hosted outside Brazil. Naming subprocessors is
          what lets a data subject actually assess where their health data
          goes. Keep this table in sync with the deployed stack. */}
      <h3 className="text-lg font-bold text-slate-900">
        5.1. Operadores e Subprocessadores
      </h3>
      <p>
        Contamos com prestadores de serviço que tratam dados pessoais em nosso
        nome, sob instruções e obrigações contratuais de confidencialidade e
        segurança. São eles:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <strong>Railway</strong> (Estados Unidos) — hospedagem da aplicação e
          do banco de dados;
        </li>
        <li>
          <strong>Cloudflare R2</strong> (Estados Unidos) — armazenamento de
          documentos, exames e imagens de perfil;
        </li>
        <li>
          <strong>Resend</strong> (Estados Unidos) — envio de e-mails
          transacionais (verificação de conta, redefinição de senha, resumo de
          consulta);
        </li>
        <li>
          <strong>Mercado Pago</strong> (Brasil) — processamento de pagamentos
          das assinaturas de clínicas. Dados de cartão são tratados diretamente
          pelo provedor; o Hispora não armazena dados de cartão;
        </li>
        <li>
          <strong>Expo / Google Firebase Cloud Messaging</strong> (Estados
          Unidos) — entrega de notificações push no aplicativo.
        </li>
      </ul>
      <p>
        Esses operadores recebem apenas os dados necessários à sua função. Em
        especial, o provedor de pagamentos não tem acesso a dados de saúde, e o
        provedor de e-mail recebe somente o endereço do destinatário e o
        conteúdo da mensagem enviada.
      </p>

      <h3 className="text-lg font-bold text-slate-900">
        5.2. Transferência Internacional de Dados
      </h3>
      <p>
        Conforme indicado acima, parte da nossa infraestrutura está localizada
        fora do Brasil, principalmente nos Estados Unidos. Isso significa que
        seus dados pessoais e de saúde podem ser transferidos e armazenados em
        outro país.
      </p>
      <p>
        Essas transferências são realizadas nos termos do Art. 33 da LGPD, com
        fundamento na execução do contrato firmado com você e no cumprimento das
        finalidades descritas nesta política, e estão amparadas por cláusulas
        contratuais de proteção de dados firmadas com cada operador, que os
        obrigam a adotar medidas de segurança equivalentes às exigidas pela
        legislação brasileira.
      </p>

      {/* "e em repouso" removed: field-level encryption was rolled back (see
          archives/docs/security/features-secutiry.md, item 5). The remaining
          claims are each backed by real code — access control (guards +
          RBAC), audit trail (src/audit), anomaly detection
          (audit-anomaly.service.ts) and retention (audit-retention.service). */}
      <h3 className="text-lg font-bold text-slate-900">
        6. Armazenamento e Segurança
      </h3>
      <p>
        Os dados são armazenados em servidores seguros, com criptografia em
        trânsito (TLS). Documentos e exames ficam em armazenamento privado,
        acessível apenas por links assinados e temporários. Implementamos
        controle de acesso por perfil, auditoria de operações, detecção de
        anomalias e políticas de retenção conforme a legislação vigente.
      </p>

      {/* Audit finding R3: CFM Res. 1.821/2007 requires keeping the medical
          record for 20 years, which collides with the LGPD right to erasure.
          The policy mentioned both but never reconciled them — so a user
          asking "will my data be deleted or not?" had no clear answer. This
          section states the rule explicitly, including WHAT survives a
          deletion request and why. */}
      <h3 className="text-lg font-bold text-slate-900">7. Retenção de Dados</h3>
      <p>
        Dados de prontuário médico são mantidos pelo prazo mínimo de 20 anos a
        contar do último registro, conforme a Resolução CFM 1.821/2007. Esse
        prazo é uma obrigação legal do profissional e da instituição de saúde, e
        não depende do nosso ou do seu consentimento.
      </p>
      <p>
        <strong>
          Como isso conversa com o seu direito de eliminação (LGPD Art. 18, VI)
        </strong>
      </p>
      <p>
        O direito de eliminação não é absoluto: o próprio Art. 16 da LGPD
        autoriza a conservação de dados para cumprimento de obrigação legal ou
        regulatória. Na prática, ao solicitar a exclusão da sua conta:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <strong>É eliminado:</strong> seu acesso à plataforma, credenciais,
          dados de contato usados para comunicação, preferências de notificação
          e foto de perfil;
        </li>
        <li>
          <strong>É retido pelo prazo legal:</strong> os documentos clínicos
          emitidos por profissionais de saúde (receitas, laudos, atestados e
          pedidos de exame), por constituírem prontuário sujeito à guarda
          obrigatória, junto com os dados que identificam você como titular
          desse prontuário (nome, CPF, data de nascimento) — sem eles o
          documento não identificaria o paciente e perderia a validade que
          justifica a própria guarda;
        </li>
        <li>
          <strong>Também é eliminado:</strong> dados de agendamento e
          acompanhamento que não compõem o documento emitido (consultas
          marcadas, medicamentos em uso, exames registrados, alergias, doenças,
          vacinas e cirurgias informados no perfil);
        </li>
        <li>
          <strong>O que muda no dado retido:</strong> ele deixa de ser acessível
          pela plataforma como um perfil ativo e passa a ser mantido
          exclusivamente para cumprimento da obrigação de guarda, não sendo
          utilizado para nenhuma outra finalidade;
        </li>
        <li>
          <strong>Ao fim do prazo:</strong> cessada a obrigação legal, os dados
          são eliminados.
        </li>
      </ul>
      <p>
        Essa distinção existe para proteger você: o prontuário é prova do
        cuidado recebido e pode ser necessário no futuro, inclusive para
        continuidade de tratamento ou em questões judiciais. Se você precisar de
        uma cópia dos seus dados antes da exclusão, pode solicitar a
        portabilidade pelos canais da seção 10.
      </p>

      <h3 className="text-lg font-bold text-slate-900">
        8. Direitos do Titular
      </h3>
      <p>Conforme a LGPD, você tem direito a:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Confirmar a existência de tratamento dos seus dados;</li>
        <li>Acessar seus dados pessoais;</li>
        <li>Corrigir dados incompletos ou desatualizados;</li>
        <li>Solicitar a exclusão de dados (respeitando obrigações legais);</li>
        <li>Revogar consentimento a qualquer momento;</li>
        <li>Solicitar portabilidade dos dados.</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">9. Exclusão de Conta</h3>
      <p>
        Você pode solicitar a exclusão da sua conta a qualquer momento através
        do aplicativo ou plataforma web. A exclusão é confirmada mediante
        verificação por código enviado ao email cadastrado. Dados clínicos
        obrigatórios por lei serão retidos pelo prazo legal.
      </p>

      <h3 className="text-lg font-bold text-slate-900">10. Contato</h3>
      <p>
        Para exercer seus direitos ou esclarecer dúvidas sobre esta política,
        entre em contato pelo email: <strong>{COMPANY.contactEmail}</strong>
      </p>

      {/* Controller identification. A data subject can only exercise their
          LGPD rights if they know WHO controls the data, so this block is
          part of the policy itself, not just the footer. Rendered only when
          the legal entity's data exists — see constants/company.ts. */}
      {hasCompanyLegalInfo && (
        <>
          <h3 className="text-lg font-bold text-slate-900">
            11. Controlador dos Dados
          </h3>
          <p>
            O controlador dos dados pessoais tratados nesta plataforma é{" "}
            <strong>{COMPANY.legalName}</strong>, inscrita no CNPJ sob o nº{" "}
            <strong>{COMPANY.cnpj}</strong>
            {COMPANY.address ? (
              <>
                , com sede em <strong>{COMPANY.address}</strong>
              </>
            ) : null}
            .
          </p>
        </>
      )}

      {/* Encarregado/DPO — LGPD art. 41 requires publicly disclosing the
          identity and contact. Separate from the general support channel
          above on purpose: this is the formal route for data-subject
          requests and for contact by the ANPD. */}
      {hasDpoInfo && (
        <>
          <h3 className="text-lg font-bold text-slate-900">
            {hasCompanyLegalInfo ? "12." : "11."} Encarregado pelo Tratamento de
            Dados (DPO)
          </h3>
          <p>
            Em atendimento ao Art. 41 da LGPD, o encarregado pelo tratamento de
            dados pessoais é <strong>{COMPANY.dpoName}</strong>, que pode ser
            contactado pelo e-mail <strong>{COMPANY.dpoEmail}</strong>.
          </p>
          <p>
            O encarregado é o canal formal para: exercer os direitos previstos
            nesta política, apresentar reclamações sobre o tratamento dos seus
            dados, esclarecer dúvidas e receber comunicações da Autoridade
            Nacional de Proteção de Dados (ANPD).
          </p>
          <p>
            Responderemos às solicitações no prazo legal. Caso você não fique
            satisfeito com a resposta, pode apresentar reclamação diretamente à
            ANPD.
          </p>
        </>
      )}
    </>
  );
}

export function TermsOfServiceContent() {
  return (
    <>
      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
        Última atualização: Outubro de 2026
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
        Senhas devem conter no mínimo 8 caracteres, incluindo letras maiúsculas,
        minúsculas, números e caracteres especiais.
      </p>

      <h3 className="text-lg font-bold text-slate-900">4. Uso Adequado</h3>
      <p>Você concorda em:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Fornecer informações verdadeiras e atualizadas;</li>
        <li>Não compartilhar credenciais de acesso;</li>
        <li>Não utilizar o serviço para fins ilegais;</li>
        <li>Não tentar acessar dados de outros usuários sem autorização;</li>
        <li>Não interferir no funcionamento da plataforma.</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">
        5. Profissionais de Saúde
      </h3>
      <p>
        Profissionais de saúde que utilizam a plataforma declaram possuir
        registro profissional válido (CRM, CRO ou equivalente). O Hispora não se
        responsabiliza por diagnósticos, prescrições ou orientações médicas
        registradas pelos profissionais.
      </p>

      <h3 className="text-lg font-bold text-slate-900">6. Dados de Saúde</h3>
      <p>
        Dados de saúde registrados no Hispora são de responsabilidade do
        profissional que os registrou e do paciente titular. O Hispora atua como
        operador dos dados conforme a LGPD, garantindo segurança e
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
        Nós nos esforçamos para manter o serviço disponível 24 horas por dia, 7
        dias por semana. No entanto, não garantimos disponibilidade ininterrupta
        e podemos realizar manutenções programadas.
      </p>

      <h3 className="text-lg font-bold text-slate-900">
        9. Limitação de Responsabilidade
      </h3>
      <p>
        O Hispora não substitui consultas médicas presenciais. A plataforma é
        uma ferramenta de organização e gestão de informações de saúde. Decisões
        clínicas são de responsabilidade exclusiva dos profissionais de saúde.
      </p>

      {/* Audit finding R2: the previous clauses limited liability generically
          but never stated that the clinical CONTENT belongs to the
          professional and that Hispora is a technical intermediary. For an
          electronic health record that is a standard clause, and its absence
          left room for the platform to be named in a malpractice claim. */}
      <h3 className="text-lg font-bold text-slate-900">
        9.1. Responsabilidade pelo Conteúdo Clínico
      </h3>
      <p>
        O Hispora é um meio técnico para registro, organização e transmissão de
        informações de saúde. Não praticamos atos médicos, não revisamos nem
        validamos o conteúdo clínico inserido na plataforma.
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <strong>Autoria e responsabilidade:</strong> todo conteúdo clínico —
          diagnósticos, prescrições, posologias, laudos, atestados, pedidos de
          exame e orientações — é de autoria e responsabilidade exclusiva do
          profissional de saúde que o registrou, no exercício da sua autonomia
          profissional e sujeito ao respectivo conselho de classe;
        </li>
        <li>
          <strong>Conferência pelo profissional:</strong> cabe ao profissional
          verificar a exatidão do que registra antes de emitir ou compartilhar o
          documento, inclusive quando o sistema oferecer sugestões,
          preenchimento automático, catálogos de medicamentos ou exames, ou
          extração de dados de arquivos anexados — tais recursos são auxílios à
          digitação e não constituem recomendação clínica;
        </li>
        <li>
          <strong>Dados informados pelo paciente:</strong> informações
          preenchidas pelo próprio paciente (alergias, medicamentos em uso,
          histórico) são declaratórias e não substituem avaliação profissional;
        </li>
        <li>
          <strong>Ferramenta, não parecer:</strong> indicadores, relatórios e
          painéis disponibilizados pela plataforma têm finalidade organizacional
          e administrativa, não configurando parecer clínico, diagnóstico ou
          recomendação de tratamento.
        </li>
      </ul>
      <p>
        O Hispora não responde por erro, omissão, inadequação ou desatualização
        do conteúdo clínico registrado por profissionais de saúde, nem por
        decisões tomadas com base nele. Em caso de emergência, procure
        atendimento médico presencial ou acione o serviço de urgência.
      </p>

      {/* Audit finding 4: recurring billing is live (Mercado Pago, monthly
          clinic subscriptions) and there was no refund policy anywhere, nor
          any mention of the CDC art. 49 right of withdrawal — which applies
          by law regardless of being written down, so omitting it was itself a
          breach of the duty to inform. Standard market terms for a monthly
          SaaS: 7-day withdrawal with full refund, cancel-anytime with access
          until the end of the paid period, no pro-rata refund after the
          withdrawal window. */}
      <h3 className="text-lg font-bold text-slate-900">
        10. Assinaturas, Pagamento e Reembolso
      </h3>
      <p>
        O uso do Hispora é <strong>gratuito para pacientes</strong>. As
        assinaturas pagas aplicam-se a clínicas e profissionais, em planos de
        cobrança <strong>mensal recorrente</strong>, conforme os valores
        vigentes na página de planos.
      </p>

      <p>
        <strong>10.1. Direito de arrependimento (7 dias)</strong>
      </p>
      <p>
        Nos termos do Art. 49 do Código de Defesa do Consumidor, você pode
        desistir da contratação no prazo de{" "}
        <strong>7 (sete) dias corridos</strong> contados da data da contratação,
        sem necessidade de justificativa e{" "}
        <strong>com devolução integral</strong> do valor pago. Basta solicitar
        pelo canal de contato indicado ao final destes termos.
      </p>

      <p>
        <strong>10.2. Cancelamento</strong>
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          Você pode cancelar a assinatura a qualquer momento, sem multa e sem
          período mínimo de permanência;
        </li>
        <li>
          O cancelamento interrompe as cobranças futuras e o acesso aos recursos
          pagos permanece ativo até o fim do período já pago;
        </li>
        <li>
          Após o prazo de arrependimento, não há reembolso proporcional de dias
          não utilizados do mês em curso, uma vez que o serviço foi
          disponibilizado durante todo o período contratado.
        </li>
      </ul>

      <p>
        <strong>10.3. Reembolso em outras hipóteses</strong>
      </p>
      <p>
        Devolveremos integralmente os valores pagos quando houver{" "}
        <strong>cobrança duplicada</strong>, <strong>cobrança indevida</strong>{" "}
        (por exemplo, após o cancelamento) ou{" "}
        <strong>indisponibilidade prolongada</strong> do serviço atribuível ao
        Hispora. Solicitações são analisadas em até 10 dias úteis e, quando
        procedentes, o estorno é processado pelo mesmo meio de pagamento
        utilizado, observados os prazos da instituição financeira ou do provedor
        de pagamento.
      </p>

      <p>
        <strong>10.4. Inadimplência e reajuste</strong>
      </p>
      <p>
        O não pagamento pode levar à suspensão dos recursos pagos, mediante
        aviso prévio. Dados de prontuário não são excluídos em razão de
        inadimplência, observadas as obrigações legais de guarda. Eventuais
        reajustes de preço serão comunicados com pelo menos 30 dias de
        antecedência, e você poderá cancelar sem ônus antes da vigência do novo
        valor.
      </p>

      <p>
        <strong>10.5. Encerramento da conta</strong>
      </p>
      <p>
        Você pode encerrar sua conta a qualquer momento. Ao encerrar, seus dados
        serão tratados conforme nossa Política de Privacidade e as obrigações
        legais de retenção aplicáveis ao prontuário (ver seção 7 da Política de
        Privacidade).
      </p>

      <h3 className="text-lg font-bold text-slate-900">
        11. Alterações nos Termos
      </h3>
      <p>
        Podemos atualizar estes termos periodicamente. Alterações significativas
        serão comunicadas por email ou notificação no aplicativo. O uso
        continuado após as alterações constitui aceitação dos novos termos.
      </p>

      <h3 className="text-lg font-bold text-slate-900">12. Foro</h3>
      <p>
        Este contrato é regido pelas leis da República Federativa do Brasil.
        Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer
        controvérsias.
      </p>
    </>
  );
}

export function SecurityStandardsContent() {
  return (
    <>
      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
        Última atualização: Outubro de 2026
      </p>

      <h3 className="text-lg font-bold text-slate-900 mt-4">1. Visão Geral</h3>
      <p>
        O Hispora implementa um conjunto robusto de controles de segurança para
        proteger dados pessoais e de saúde dos nossos usuários. Este documento
        descreve os padrões e práticas adotados.
      </p>

      {/* Describes only controls that actually exist in the backend today.
          The previous version claimed "dados sensíveis armazenados com
          criptografia no banco de dados" — field-level encryption was
          implemented and then deliberately rolled back (see
          archives/docs/security/features-secutiry.md, item 5), so that
          sentence was publicly stating a control the platform does not have.
          Keeping it would be a transparency breach under LGPD art. 6, VI and
          would weigh against us in any ANPD assessment after an incident. */}
      <h3 className="text-lg font-bold text-slate-900">2. Criptografia</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <strong>Em trânsito:</strong> todas as comunicações entre aplicativos,
          navegador e servidores utilizam HTTPS com TLS 1.2 ou superior;
        </li>
        <li>
          <strong>Senhas:</strong> nunca armazenadas em texto puro — somente o
          hash criptográfico (bcrypt), que é irreversível;
        </li>
        <li>
          <strong>Documentos e exames:</strong> armazenados em bucket privado,
          sem acesso público. Cada visualização gera um link assinado e
          temporário, válido por poucos minutos;
        </li>
        <li>
          <strong>Links enviados por e-mail:</strong> receitas e pedidos de
          exame usam token de acesso único, restrito àquele documento e com
          prazo de validade.
        </li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">
        3. Autenticação e Autorização
      </h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          Autenticação baseada em JWT (JSON Web Tokens) com expiração de 7 dias;
        </li>
        <li>
          Política de senha forte: mínimo 8 caracteres com maiúsculas,
          minúsculas, números e símbolos;
        </li>
        <li>Verificação de email obrigatória por código de 6 dígitos;</li>
        <li>
          Verificação por código para operações críticas (exclusão de conta);
        </li>
        <li>
          Controle de acesso baseado em papéis (RBAC): médico, admin,
          secretário(a), paciente.
        </li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">
        4. Sistema de Auditoria
      </h3>
      <p>
        Todas as operações sobre dados sensíveis são registradas em um sistema
        de auditoria centralizado com:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Registro de quem realizou a operação (ator);</li>
        <li>Qual recurso foi afetado e qual paciente está relacionado;</li>
        <li>Timestamp com precisão de microssegundos;</li>
        <li>Endereço IP e User-Agent da requisição;</li>
        <li>Campos alterados (antes/depois) para operações de UPDATE;</li>
        <li>Cadeia de hash SHA-256 para detecção de adulteração;</li>
        <li>
          Registros em modo append-only (não podem ser alterados ou excluídos).
        </li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">
        5. Detecção de Anomalias
      </h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          Monitoramento de tentativas de brute force (login) por IP e usuário;
        </li>
        <li>Detecção de padrões de acesso anômalos a prontuários;</li>
        <li>
          Alertas automáticos para operações em massa (downloads, exportações);
        </li>
        <li>Limites configuráveis para diferentes tipos de ameaça.</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">
        6. Controle de Acesso a Dados Clínicos
      </h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          Profissionais só acessam prontuários com autorização explícita do
          paciente;
        </li>
        <li>Pacientes podem revogar acesso a qualquer momento;</li>
        <li>
          Tentativas de acesso não autorizado são registradas e auditadas;
        </li>
        <li>Secretários(as) não possuem acesso a dados clínicos.</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">7. Infraestrutura</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>Hospedagem em provedores com certificação SOC 2;</li>
        <li>Banco de dados com backups automáticos diários;</li>
        <li>Isolamento de ambientes (desenvolvimento, staging, produção);</li>
        <li>Monitoramento contínuo de saúde da aplicação.</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">
        8. Política de Retenção
      </h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>Dados de prontuário: mínimo 20 anos (Resolução CFM 1.821/2007);</li>
        <li>Logs de auditoria: 7 anos por padrão (configurável);</li>
        <li>
          Dados de conta excluída: removidos imediatamente, exceto obrigações
          legais.
        </li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">9. Conformidade</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <strong>LGPD</strong> (Lei Geral de Proteção de Dados), Lei
          13.709/2018;
        </li>
        <li>
          <strong>CFM 1.821/2007</strong>, normas técnicas para prontuário
          eletrônico;
        </li>
        <li>
          <strong>CFM 2.217/2018</strong>, Código de Ética Médica (sigilo
          profissional);
        </li>
        <li>Princípios de minimização de dados e privacy by design.</li>
      </ul>

      <h3 className="text-lg font-bold text-slate-900">
        10. Relato de Vulnerabilidades
      </h3>
      <p>
        Caso identifique uma vulnerabilidade de segurança, entre em contato pelo
        email:
        <strong> hispora.suporte@yahoo.com</strong>. Nós nos comprometemos a
        avaliar e responder em até 72 horas.
      </p>
    </>
  );
}
