import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LegalDocument,
  type LegalSection,
} from "@/components/legal/LegalDocument";
import {
  LEGAL_CONTACT_LABEL,
  LEGAL_CONTACT_URL,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_VERSION,
} from "@/config/legal";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Termos de Uso — MGP" },
      {
        name: "description",
        content:
          "Regras para criar uma conta, publicar conteúdo e usar o My Gamer Profile.",
      },
    ],
  }),
});

const listClassName = "list-disc space-y-1.5 pl-5 marker:text-gold-strong";
const linkClassName =
  "font-medium text-gold-strong underline-offset-4 hover:underline";

const sections: LegalSection[] = [
  {
    id: "aceitacao",
    title: "Aceitação e escopo",
    content: (
      <>
        <p>
          Estes Termos regulam o uso do My Gamer Profile (MGP), um hub gamer
          independente mantido no Brasil por zardzeprime. Ao criar uma conta ou
          continuar usando a plataforma, você declara que leu e aceita estes
          Termos e a{" "}
          <Link to="/privacy" className={linkClassName}>
            Política de Privacidade
          </Link>
          .
        </p>
        <p>
          Se você não concordar, não crie uma conta nem use áreas autenticadas.
          Recursos específicos podem ter avisos adicionais, que complementarão
          estes Termos sem eliminar os direitos previstos em lei.
        </p>
      </>
    ),
  },
  {
    id: "idade",
    title: "Idade e capacidade",
    content: (
      <>
        <p>
          Você deve ter pelo menos 13 anos para criar uma conta. Pessoas entre
          13 e 17 anos devem usar o MGP com ciência e assistência de seus pais
          ou responsáveis. Ao autorizar o uso por um menor, o responsável
          concorda em orientar e supervisionar sua atividade.
        </p>
        <p>
          Cada jogo pode possuir classificação indicativa própria. Ter acesso ao
          MGP não substitui as regras de idade do jogo, da plataforma ou da
          conta de terceiros correspondente.
        </p>
      </>
    ),
  },
  {
    id: "conta",
    title: "Conta e segurança",
    content: (
      <ul className={listClassName}>
        <li>
          Forneça informações verdadeiras e mantenha seu e-mail atualizado.
        </li>
        <li>
          Escolha um username que não viole direitos, não engane e não se passe
          por outra pessoa.
        </li>
        <li>
          Proteja sua senha e sua conta de e-mail; você é responsável pela
          atividade sob sua conta.
        </li>
        <li>Não venda, alugue, compartilhe ou automatize o acesso à conta.</li>
        <li>
          Avise o MGP se suspeitar de acesso indevido ou falha de segurança.
        </li>
      </ul>
    ),
  },
  {
    id: "servico",
    title: "O que o MGP oferece",
    content: (
      <>
        <p>
          O MGP permite criar um perfil gamer, selecionar jogos, preencher Game
          Profiles, publicar e interagir com conteúdo da comunidade e buscar
          grupos por LFG. Alguns recursos ainda podem estar em beta, ser
          experimentais ou depender de terceiros.
        </p>
        <p>
          Dados informados manualmente — como rank, função, personagem, build ou
          experiência — são declarações do próprio usuário e não representam
          verificação oficial. O MGP não promete matchmaking, habilidade,
          identidade real, disponibilidade de equipe ou resultado de partida.
        </p>
      </>
    ),
  },
  {
    id: "conteudo",
    title: "Seu conteúdo e a licença ao MGP",
    content: (
      <>
        <p>
          Você mantém os direitos que possui sobre textos, imagens e outros
          materiais que publicar e é responsável por ter as autorizações
          necessárias. Não envie conteúdo confidencial nem material que viole
          direitos de terceiros.
        </p>
        <p>
          Ao publicar conteúdo, você concede ao MGP uma licença não exclusiva,
          mundial, gratuita, sublicenciável apenas a fornecedores técnicos, para
          hospedar, armazenar, reproduzir, adaptar ao formato, exibir e
          distribuir esse material na medida necessária para operar, proteger,
          divulgar e melhorar a plataforma. A licença termina quando o conteúdo
          é removido, salvo por cópias técnicas temporárias, compartilhamentos
          anteriores ou obrigação legal.
        </p>
        <p>
          Comentários e sugestões sobre o produto podem ser usados para
          aprimorar o MGP sem obrigação de remuneração, sem que isso transfira
          conteúdo protegido que você tenha publicado.
        </p>
      </>
    ),
  },
  {
    id: "conduta",
    title: "Condutas proibidas",
    content: (
      <>
        <p>Ao usar o MGP, você não pode:</p>
        <ul className={listClassName}>
          <li>
            praticar ato ilegal, fraudulento, ameaçador, assediante,
            discriminatório ou de ódio;
          </li>
          <li>
            publicar conteúdo sexual envolvendo menores ou explorar, incentivar
            ou colocar menores em risco;
          </li>
          <li>
            divulgar dados pessoais de terceiros, ameaçar, perseguir ou tentar
            desanonimizar jogadores;
          </li>
          <li>
            se passar por pessoa, equipe, organização, moderador, desenvolvedora
            ou detentor de marca;
          </li>
          <li>
            violar direitos autorais, marcas, privacidade, imagem ou outros
            direitos;
          </li>
          <li>
            distribuir malware, spam, phishing ou tentar burlar autenticação e
            controles de acesso;
          </li>
          <li>
            raspar, copiar em massa, revender ou sobrecarregar a plataforma sem
            autorização;
          </li>
          <li>
            promover apostas, jogos de azar, comércio de contas ou esquemas
            financeiros enganosos;
          </li>
          <li>
            criar vantagem competitiva injusta, cheats, scouting pré-partida,
            cálculo alternativo de MMR/ELO ou qualquer uso que comprometa a
            integridade de um jogo;
          </li>
          <li>
            usar o MGP para infringir os termos de um jogo, console, loja ou
            serviço de terceiros.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "moderacao",
    title: "Moderação e denúncias",
    content: (
      <>
        <p>
          O MGP pode analisar denúncias e remover, limitar, ocultar ou preservar
          conteúdo; restringir funções; suspender ou encerrar contas; e cooperar
          com autoridades quando necessário. As medidas considerarão contexto,
          gravidade, reincidência, segurança da comunidade e a legislação
          aplicável.
        </p>
        <p>
          Não garantimos revisão prévia de tudo que usuários publicam. A
          presença de um conteúdo não significa aprovação pelo MGP. Denúncias de
          boa-fé não devem ser usadas para assediar ou silenciar outros
          usuários.
        </p>
      </>
    ),
  },
  {
    id: "riot-terceiros",
    title: "Riot Games e propriedade de terceiros",
    content: (
      <>
        <p>
          MGP was created under Riot Games&apos; &quot;Legal Jibber Jabber&quot;
          policy using assets owned by Riot Games. Riot Games does not endorse
          or sponsor this project.
        </p>
        <p>
          VALORANT, Riot Games e ativos relacionados pertencem aos respectivos
          titulares. Dark Souls, Bandai Namco, FromSoftware e demais nomes,
          imagens, marcas e conteúdos de jogos também pertencem aos seus
          titulares. O uso no MGP é informativo, editorial e comunitário e não
          cria afiliação, patrocínio ou aprovação oficial.
        </p>
        <p>
          Qualquer futura integração com dados de jogadores de VALORANT
          dependerá de registro e aprovação aplicáveis no Riot Developer Portal,
          Riot Sign On (RSO) e autorização expressa do jogador. O MGP não
          solicitará a senha Riot do usuário nem exibirá dados pessoais Riot de
          quem não tiver optado pelo compartilhamento.
        </p>
      </>
    ),
  },
  {
    id: "terceiros-links",
    title: "Serviços e links externos",
    content: (
      <p>
        Vídeos, imagens, links, APIs, autenticação, banco de dados e hospedagem
        podem depender de serviços de terceiros. O uso desses serviços está
        sujeito aos termos deles. O MGP não controla a disponibilidade,
        segurança, conteúdo ou mudanças de plataformas externas.
      </p>
    ),
  },
  {
    id: "disponibilidade",
    title: "Disponibilidade, mudanças e beta",
    content: (
      <>
        <p>
          A plataforma é oferecida no estado em que se encontra e pode
          apresentar falhas, interrupções ou mudanças. Podemos corrigir, testar,
          adicionar, remover ou descontinuar recursos para manter a segurança,
          cumprir políticas de terceiros ou evoluir o produto.
        </p>
        <p>
          Faremos esforços razoáveis para preservar o serviço e os dados, mas
          você deve guardar cópia de qualquer conteúdo importante. Não
          prometemos disponibilidade contínua, ausência de erros ou
          compatibilidade permanente com um serviço externo.
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
          Você pode deixar de usar o MGP e solicitar a exclusão da conta.
          Podemos suspender ou encerrar o acesso em caso de violação destes
          Termos, risco à comunidade, obrigação legal, descontinuação do serviço
          ou exigência de um titular de direitos ou fornecedor essencial.
        </p>
        <p>
          Quando razoável e permitido, informaremos a medida. Cláusulas que por
          sua natureza devam sobreviver — como propriedade intelectual,
          responsabilidade e resolução de conflitos — continuam válidas após o
          encerramento.
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
          Dentro dos limites permitidos pela legislação, o MGP não responde por
          conduta de usuários, negociações ou encontros organizados por LFG,
          dados declarados por terceiros, perda decorrente de serviço externo ou
          danos indiretos e imprevisíveis. Nada nestes Termos exclui direitos ou
          responsabilidades que não possam ser afastados por lei.
        </p>
        <p>
          Você é responsável pelos seus atos, pelo conteúdo que publica e por
          prejuízos causados por uso ilícito ou violação de direitos. Em
          encontros com outros jogadores, proteja seus dados pessoais, não envie
          dinheiro e use os controles de segurança e denúncia disponíveis.
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
          Estes Termos são regidos pelas leis da República Federativa do Brasil.
          Ficam preservadas as regras obrigatórias de proteção do consumidor e o
          foro legalmente competente para cada usuário.
        </p>
        <p>
          Podemos atualizar estes Termos por razões legais, técnicas ou de
          produto. A nova versão indicará sua data de vigência. Mudanças
          relevantes serão destacadas e poderão exigir nova aceitação antes do
          uso de áreas autenticadas.
        </p>
      </>
    ),
  },
  {
    id: "contato",
    title: "Contato",
    content: (
      <p>
        Para dúvidas, denúncias jurídicas ou solicitações relacionadas a estes
        Termos, use o canal público do projeto em{" "}
        <a
          className={linkClassName}
          href={LEGAL_CONTACT_URL}
          target="_blank"
          rel="noreferrer"
        >
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
      summary="Estas regras protegem a comunidade, esclarecem o que você pode publicar e definem como o hub gamer independente MGP funciona."
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      version={LEGAL_VERSION}
      sections={sections}
    />
  );
}
