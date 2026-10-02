import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalDocument, type LegalSection } from "@/components/legal/LegalDocument";
import {
  LEGAL_CONTACT_LABEL,
  LEGAL_CONTACT_URL,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_OPERATOR_NAME,
  LEGAL_VERSION,
} from "@/config/legal";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () =>
    buildSeo({
      title: "Termos de Uso — ÍMPAR",
      description: "Regras para criar uma conta, publicar conteúdo e usar o ÍMPAR.",
      path: "/terms",
    }),
});

const listClassName = "list-disc space-y-1.5 pl-5 marker:text-gold-strong";
const linkClassName = "font-medium text-gold-strong underline-offset-4 hover:underline";

const sections: LegalSection[] = [
  {
    id: "aceitacao",
    title: "Aceitação e escopo",
    content: (
      <>
        <p>
          Estes Termos regulam o uso do ÍMPAR (ÍMPAR), um hub gamer independente mantido no Brasil
          por <strong className="text-foreground">{LEGAL_OPERATOR_NAME}</strong>. Ao criar uma conta
          ou continuar usando a plataforma, você declara que leu e aceita estes Termos e a{" "}
          <Link to="/privacy" className={linkClassName}>
            Política de Privacidade
          </Link>
          .
        </p>
        <p>
          Se você não concordar, não crie uma conta nem use áreas autenticadas. Recursos específicos
          podem ter avisos adicionais, que complementarão estes Termos sem eliminar os direitos
          previstos em lei.
        </p>
      </>
    ),
  },
  {
    id: "idade",
    title: "Idade, supervisão e experiência adequada",
    content: (
      <>
        <p>
          Você deve ter pelo menos 13 anos para criar uma conta. A data de nascimento informada no
          onboarding é privada e, durante a beta, é usada para aplicar faixas automáticas de
          segurança no LFG. Essas faixas limitam quais contas podem pedir/aceitar match entre si e
          não podem ser ampliadas manualmente pelo criador do grupo.
        </p>
        <p>
          A idade usada nessa fase é declarada pelo próprio usuário e não é apresentada como
          verificação documental. Informar uma data falsa para contornar regras de segurança é
          proibido e pode ser denunciado, bloqueado e resultar em restrições. Quando uma
          funcionalidade ou a lei exigir mecanismo mais forte de aferição, o ÍMPAR poderá exigir
          verificação adicional antes de liberar o recurso.
        </p>
        <p>
          Cada jogo pode possuir classificação indicativa própria. Ter acesso ao ÍMPAR não substitui
          as regras de idade do jogo, da plataforma ou da conta de terceiros correspondente. O ÍMPAR
          poderá aplicar avisos, desfoque e limitações adicionais a discussões legítimas sobre temas
          maduros mesmo quando o conteúdo não for proibido.
        </p>
      </>
    ),
  },
  {
    id: "conta",
    title: "Conta e segurança",
    content: (
      <ul className={listClassName}>
        <li>Forneça informações verdadeiras e mantenha seu e-mail atualizado.</li>
        <li>
          Escolha um username que não viole direitos, não engane e não se passe por outra pessoa.
        </li>
        <li>
          Proteja sua senha e sua conta de e-mail; você é responsável pela atividade sob sua conta.
        </li>
        <li>Não venda, alugue, compartilhe ou automatize o acesso à conta.</li>
        <li>
          Não tente alterar, apagar ou falsificar informações de idade, supervisão ou verificação
          para contornar controles de segurança.
        </li>
        <li>Avise o ÍMPAR se suspeitar de acesso indevido ou falha de segurança.</li>
      </ul>
    ),
  },
  {
    id: "servico",
    title: "O que o ÍMPAR oferece",
    content: (
      <>
        <p>
          O ÍMPAR permite criar um perfil gamer, selecionar jogos, preencher Game Profiles, publicar
          e interagir com conteúdo da comunidade e buscar grupos por LFG. No LFG, anúncios e DMs de
          matches podem ser temporários; o prazo aparece na interface e mensagens expiradas podem
          ser removidas automaticamente. Conteúdo denunciado pode ser preservado por mais tempo para
          moderação e segurança. Alguns recursos ainda podem estar em beta, ser experimentais ou
          depender de terceiros.
        </p>
        <p>
          Dados informados manualmente — como rank, função, personagem, build ou experiência — são
          declarações do próprio usuário e não representam verificação oficial. Quando uma
          integração aprovada importar dados de Steam, Riot Games ou outro provedor de jogos, o
          ÍMPAR deverá indicar a procedência e distinguir informação importada de informação
          declarada. Google é usado como método opcional de autenticação, não como fonte de dados de
          desempenho em jogos.
        </p>
        <p>
          O ÍMPAR não promete que uma plataforma externa fornecerá todo dado que o usuário deseja.
          Informações como horas jogadas, conquistas, partidas e biblioteca dependem das APIs,
          permissões e configurações de privacidade do provedor. Datas como “quando começou a jogar”
          podem ser derivadas de eventos disponíveis e, se forem derivadas, deverão ser rotuladas
          como estimativas/derivações em vez de dados oficiais.
        </p>
      </>
    ),
  },
  {
    id: "conteudo",
    title: "Seu conteúdo e a licença ao ÍMPAR",
    content: (
      <>
        <p>
          Você mantém os direitos que possui sobre textos, imagens e outros materiais que publicar e
          é responsável por ter as autorizações necessárias. Não envie conteúdo confidencial nem
          material que viole direitos de terceiros.
        </p>
        <p>
          Ao publicar conteúdo, você concede ao ÍMPAR uma licença não exclusiva, mundial, gratuita,
          sublicenciável apenas a fornecedores técnicos, para hospedar, armazenar, reproduzir,
          adaptar ao formato, exibir e distribuir esse material na medida necessária para operar,
          proteger, divulgar e melhorar a plataforma. A licença termina quando o conteúdo é
          removido, salvo por cópias técnicas temporárias, compartilhamentos anteriores ou obrigação
          legal.
        </p>
        <p>
          Comentários e sugestões sobre o produto podem ser usados para aprimorar o ÍMPAR sem
          obrigação de remuneração, sem que isso transfira conteúdo protegido que você tenha
          publicado.
        </p>
      </>
    ),
  },
  {
    id: "conteudo-maduro",
    title: "Jogos maduros, avisos e limites de conteúdo",
    content: (
      <>
        <p>
          O ÍMPAR pode hospedar comunidades de jogos com classificação indicativa alta. Isso não
          significa que qualquer conteúdo permitido no jogo possa ser republicado sem limites no
          fórum. Discussões sobre violência, narrativa, personagens, cenas ou mecânicas maduras
          podem ser aceitas em contexto legítimo, com aviso e classificação adequada quando
          necessário.
        </p>
        <p>
          Pornografia, sexo explícito, exploração sexual e gore gratuito ou usado apenas para chocar
          não são permitidos no ÍMPAR, independentemente da idade do usuário. Conteúdo permitido,
          mas sensível, poderá aparecer borrado e exigir uma ação consciente para revelar; esse
          gesto funciona como aviso de experiência, não como prova legal de maioridade.
        </p>
      </>
    ),
  },
  {
    id: "conduta",
    title: "Condutas proibidas",
    content: (
      <>
        <p>Ao usar o ÍMPAR, você não pode:</p>
        <ul className={listClassName}>
          <li>
            praticar ato ilegal, fraudulento, ameaçador, assediante, discriminatório ou de ódio;
          </li>
          <li>
            publicar pornografia, sexo explícito, conteúdo sexual envolvendo menores, exploração
            sexual ou material que coloque menores em risco;
          </li>
          <li>publicar gore gratuito ou conteúdo criado principalmente para chocar;</li>
          <li>
            divulgar dados pessoais de terceiros, ameaçar, perseguir ou tentar desanonimizar
            jogadores;
          </li>
          <li>
            se passar por pessoa, equipe, organização, moderador, desenvolvedora ou detentor de
            marca;
          </li>
          <li>violar direitos autorais, marcas, privacidade, imagem ou outros direitos;</li>
          <li>
            distribuir malware, spam, phishing ou tentar burlar autenticação e controles de acesso;
          </li>
          <li>raspar, copiar em massa, revender ou sobrecarregar a plataforma sem autorização;</li>
          <li>
            promover apostas, jogos de azar, comércio de contas ou esquemas financeiros enganosos;
          </li>
          <li>
            criar vantagem competitiva injusta, cheats, scouting pré-partida, cálculo alternativo de
            MMR/ELO apresentado como oficial ou qualquer uso que comprometa a integridade de um
            jogo;
          </li>
          <li>
            usar o ÍMPAR para infringir os termos de um jogo, console, loja ou serviço de terceiros.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "moderacao",
    title: "Moderação, classificação e denúncias",
    content: (
      <>
        <p>
          O ÍMPAR pode analisar denúncias e remover, limitar, ocultar, desfocar, classificar ou
          preservar conteúdo; restringir funções; suspender ou encerrar contas; e cooperar com
          autoridades quando necessário. As medidas considerarão contexto, faixa etária, gravidade,
          reincidência, segurança da comunidade e a legislação aplicável.
        </p>
        <p>
          Não garantimos revisão prévia de tudo que usuários publicam. A presença de um conteúdo não
          significa aprovação pelo ÍMPAR. Denúncias de boa-fé não devem ser usadas para assediar ou
          silenciar outros usuários.
        </p>
      </>
    ),
  },
  {
    id: "riot-terceiros",
    title: "Riot Games, Steam, EA e propriedade de terceiros",
    content: (
      <>
        <p>
          ÍMPAR was created under Riot Games&apos; &quot;Legal Jibber Jabber&quot; policy using
          assets owned by Riot Games. Riot Games does not endorse or sponsor this project.
        </p>
        <p>
          VALORANT, League of Legends, Riot Games, Steam/Valve, EA SPORTS FC, Electronic Arts, Dark
          Souls, Elden Ring, Bandai Namco, FromSoftware e demais nomes, imagens, marcas e conteúdos
          de jogos pertencem aos seus respectivos titulares. O uso no ÍMPAR é informativo, editorial
          e comunitário e não cria afiliação, patrocínio ou aprovação oficial.
        </p>
        <p>
          Integrações com dados de jogadores dependem das APIs, termos, registros e aprovações
          aplicáveis de cada fornecedor e da autorização do usuário quando necessária. O ÍMPAR não
          solicitará a senha de Steam, Riot, EA ou Google para conectar uma conta; a autenticação
          deve ocorrer pelo fluxo oficial disponibilizado pelo provedor.
        </p>
        <p>
          Recursos relacionados a Riot Games serão registrados e operados de acordo com o Riot
          Developer Portal antes de uso público de chaves de produção ou RSO. Recursos de EA SPORTS
          FC poderão existir de forma editorial e manual mesmo quando a EA não estiver aceitando
          novos parceiros de API.
        </p>
      </>
    ),
  },
  {
    id: "automacao",
    title: "Conteúdo editorial e automação",
    content: (
      <>
        <p>
          O ÍMPAR pode usar automação ou modelos de IA para auxiliar a criação de rascunhos
          editoriais, resumos e curiosidades sobre jogos. Conteúdo automatizado deve ser
          identificado por procedência interna e submetido a controles de segurança, duplicidade e
          fonte. Durante a fase inicial, a publicação pode depender de revisão humana.
        </p>
        <p>
          Automação não autoriza copiar artigos integrais, inventar fatos, publicar vazamentos
          privados nem se passar por desenvolvedoras, jornalistas ou usuários reais.
        </p>
      </>
    ),
  },
  {
    id: "terceiros-links",
    title: "Serviços e links externos",
    content: (
      <p>
        Vídeos, imagens, links, APIs, autenticação, banco de dados e hospedagem podem depender de
        serviços de terceiros. O uso desses serviços está sujeito aos termos deles. O ÍMPAR não
        controla a disponibilidade, segurança, conteúdo ou mudanças de plataformas externas.
      </p>
    ),
  },
  {
    id: "disponibilidade",
    title: "Disponibilidade, mudanças e beta",
    content: (
      <>
        <p>
          A plataforma é oferecida no estado em que se encontra e pode apresentar falhas,
          interrupções ou mudanças. Podemos corrigir, testar, adicionar, remover ou descontinuar
          recursos para manter a segurança, cumprir políticas de terceiros ou evoluir o produto.
        </p>
        <p>
          Faremos esforços razoáveis para preservar o serviço e os dados, mas você deve guardar
          cópia de qualquer conteúdo importante. Não prometemos disponibilidade contínua, ausência
          de erros ou compatibilidade permanente com um serviço externo.
        </p>
      </>
    ),
  },
  {
    id: "encerramento",
    title: "Suspensão e encerramento",
    content: (
      <>
        <p>
          Você pode deixar de usar o ÍMPAR e solicitar a exclusão da conta. Podemos suspender ou
          encerrar o acesso em caso de violação destes Termos, risco à comunidade, obrigação legal,
          descontinuação do serviço ou exigência de um titular de direitos ou fornecedor essencial.
        </p>
        <p>
          Quando razoável e permitido, informaremos a medida. Cláusulas que por sua natureza devam
          sobreviver — como propriedade intelectual, responsabilidade e resolução de conflitos —
          continuam válidas após o encerramento.
        </p>
      </>
    ),
  },
  {
    id: "responsabilidade",
    title: "Responsabilidade",
    content: (
      <>
        <p>
          Dentro dos limites permitidos pela legislação, o ÍMPAR não responde por conduta de
          usuários, negociações ou encontros organizados por LFG, dados declarados por terceiros,
          perda decorrente de serviço externo ou danos indiretos e imprevisíveis. Nada nestes Termos
          exclui direitos ou responsabilidades que não possam ser afastados por lei.
        </p>
        <p>
          Você é responsável pelos seus atos, pelo conteúdo que publica e por prejuízos causados por
          uso ilícito ou violação de direitos. Em encontros com outros jogadores, proteja seus dados
          pessoais, não envie dinheiro e use os controles de segurança e denúncia disponíveis.
        </p>
      </>
    ),
  },
  {
    id: "lei-alteracoes",
    title: "Lei aplicável e alterações",
    content: (
      <>
        <p>
          Estes Termos são regidos pelas leis da República Federativa do Brasil, incluindo, quando
          aplicável, LGPD, Marco Civil da Internet, Código de Defesa do Consumidor e ECA Digital.
          Ficam preservadas as regras obrigatórias de proteção do consumidor e o foro legalmente
          competente para cada usuário.
        </p>
        <p>
          Podemos atualizar estes Termos por razões legais, técnicas ou de produto. A nova versão
          indicará sua data de vigência. Mudanças relevantes serão destacadas e poderão exigir nova
          aceitação antes do uso de áreas autenticadas.
        </p>
      </>
    ),
  },
  {
    id: "contato",
    title: "Contato",
    content: (
      <p>
        Para dúvidas, denúncias jurídicas ou solicitações relacionadas a estes Termos, use o canal
        público do projeto em{" "}
        <a className={linkClassName} href={LEGAL_CONTACT_URL}>
          {LEGAL_CONTACT_LABEL}
        </a>
        . Não envie senhas ou códigos de autenticação.
      </p>
    ),
  },
];

function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Regras da comunidade"
      title="Termos de Uso"
      summary="Estas regras protegem a comunidade, esclarecem o que você pode publicar e definem como o hub gamer independente ÍMPAR funciona."
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      version={LEGAL_VERSION}
      sections={sections}
    />
  );
}
