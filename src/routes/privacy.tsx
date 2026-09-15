import { createFileRoute } from "@tanstack/react-router";
import {
  LegalDocument,
  type LegalSection,
} from "@/components/legal/LegalDocument";
import {
  LEGAL_CONTACT_LABEL,
  LEGAL_CONTACT_URL,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_OPERATOR_NAME,
  LEGAL_VERSION,
} from "@/config/legal";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Política de Privacidade — MGP" },
      {
        name: "description",
        content:
          "Saiba como o My Gamer Profile coleta, usa, compartilha e protege dados pessoais.",
      },
    ],
  }),
});

const listClassName = "list-disc space-y-1.5 pl-5 marker:text-gold-strong";
const linkClassName =
  "font-medium text-gold-strong underline-offset-4 hover:underline";

const sections: LegalSection[] = [
  {
    id: "responsavel",
    title: "Responsável e contato",
    content: (
      <>
        <p>
          O My Gamer Profile (MGP) é um projeto independente de comunidade
          gamer, mantido no Brasil por{" "}
          <strong className="text-foreground">{LEGAL_OPERATOR_NAME}</strong>.
          Para os tratamentos descritos nesta Política, o responsável pelo MGP
          determina as finalidades e os meios de uso dos dados e atua como
          controlador nos termos da Lei Geral de Proteção de Dados Pessoais
          (LGPD).
        </p>
        <p>
          Dúvidas, solicitações de privacidade e pedidos relacionados aos seus
          dados podem ser enviados pelo canal público do projeto em{" "}
          <a className={linkClassName} href={LEGAL_CONTACT_URL}>
            {LEGAL_CONTACT_LABEL}
          </a>
          . Nunca envie senhas, códigos de autenticação ou outros segredos nesse
          contato.
        </p>
      </>
    ),
  },
  {
    id: "dados-coletados",
    title: "Dados que tratamos",
    content: (
      <>
        <p>Dependendo de como você usa o MGP, podemos tratar:</p>
        <ul className={listClassName}>
          <li>
            <strong className="text-foreground">Conta e autenticação:</strong>{" "}
            e-mail, identificador de usuário, estado da sessão e registro da
            versão dos documentos aceita no cadastro. A senha é processada pelo
            provedor de autenticação e não fica disponível ao MGP em texto
            legível.
          </li>
          <li>
            <strong className="text-foreground">Perfil:</strong> username, nome
            de exibição, biografia, avatar, banner, idioma, tema, visibilidade e
            preferências de aparência.
          </li>
          <li>
            <strong className="text-foreground">Identidade gamer:</strong> jogos
            favoritos e dados que você informar manualmente nos Game Profiles,
            como função, agente, arma, mapa, build ou rank declarado.
          </li>
          <li>
            <strong className="text-foreground">Conteúdo e comunidade:</strong>{" "}
            posts, imagens, comentários, reações, seguidores, denúncias e
            informações inseridas em anúncios de LFG.
          </li>
          <li>
            <strong className="text-foreground">Dados técnicos:</strong>{" "}
            endereço IP, navegador, dispositivo, datas de acesso, páginas
            solicitadas, falhas e dados de segurança registrados pelos
            provedores de hospedagem e infraestrutura.
          </li>
          <li>
            <strong className="text-foreground">Preferências locais:</strong>{" "}
            idioma, tema e informações necessárias para manter sua sessão,
            armazenadas no navegador por cookies ou tecnologias equivalentes.
          </li>
        </ul>
        <p>
          Não solicitamos dados pessoais sensíveis. Evite publicar documentos,
          informações financeiras, localização precisa, dados de saúde ou
          qualquer informação desnecessária sobre você ou terceiros.
        </p>
      </>
    ),
  },
  {
    id: "finalidades-bases",
    title: "Como e por que usamos os dados",
    content: (
      <>
        <p>Usamos os dados para:</p>
        <ul className={listClassName}>
          <li>
            criar e proteger sua conta, autenticar acessos e prestar as
            funcionalidades solicitadas;
          </li>
          <li>
            publicar seu perfil e conteúdo conforme as opções de visibilidade
            escolhidas por você;
          </li>
          <li>personalizar idioma, tema, jogos e experiência de navegação;</li>
          <li>
            viabilizar interações sociais, LFG, moderação, denúncias e prevenção
            a abuso ou fraude;
          </li>
          <li>
            diagnosticar falhas, manter a segurança e melhorar desempenho e
            acessibilidade;
          </li>
          <li>
            cumprir obrigações legais e responder ao exercício de direitos.
          </li>
        </ul>
        <p>
          As bases legais podem incluir execução de contrato e procedimentos
          preliminares, cumprimento de obrigação legal ou regulatória, exercício
          regular de direitos, legítimo interesse avaliado com respeito às suas
          expectativas e, quando aplicável, consentimento. Se o tratamento
          depender de consentimento, você poderá revogá-lo para o futuro.
        </p>
      </>
    ),
  },
  {
    id: "dados-publicos",
    title: "Perfis, conteúdo e dados públicos",
    content: (
      <>
        <p>
          Perfis marcados como públicos podem ser encontrados e visualizados por
          qualquer pessoa, inclusive sem login. Username, nome de exibição,
          avatar, biografia, conteúdo publicado, interações visíveis, jogos
          favoritos e campos públicos dos Game Profiles podem aparecer nessas
          páginas.
        </p>
        <p>
          Não publicamos seu e-mail de acesso. Antes de postar, considere que
          outras pessoas podem copiar ou compartilhar conteúdo público fora do
          MGP. Configurações de privacidade reduzem a exposição futura, mas não
          apagam cópias já feitas por terceiros.
        </p>
        <p>
          Dados de conta ou partidas de VALORANT obtidos por integrações
          oficiais somente poderão ser exibidos após autorização expressa do
          próprio jogador por Riot Sign On (RSO) e com aviso claro sobre a
          visibilidade resultante. Campos atualmente informados de forma manual
          não são dados verificados pela Riot Games.
        </p>
      </>
    ),
  },
  {
    id: "compartilhamento",
    title: "Compartilhamento e fornecedores",
    content: (
      <>
        <p>
          Não vendemos seus dados pessoais. Podemos compartilhá-los apenas
          quando necessário com:
        </p>
        <ul className={listClassName}>
          <li>
            <strong className="text-foreground">Supabase:</strong> banco de
            dados, autenticação, armazenamento de imagens e infraestrutura
            relacionada;
          </li>
          <li>
            <strong className="text-foreground">Lovable:</strong> hospedagem,
            entrega e operação da aplicação web;
          </li>
          <li>
            <strong className="text-foreground">Google Fonts:</strong>{" "}
            carregamento das fontes exibidas na interface;
          </li>
          <li>
            autoridades ou terceiros, quando houver obrigação legal, ordem
            válida, necessidade de proteger direitos ou investigação de abuso;
          </li>
          <li>
            um sucessor do projeto, em eventual reorganização, sempre sujeito a
            esta Política.
          </li>
        </ul>
        <p>
          Cada fornecedor trata dados de acordo com seus próprios termos e
          medidas de segurança. O MGP busca limitar o compartilhamento ao
          necessário para cada finalidade.
        </p>
      </>
    ),
  },
  {
    id: "cookies-anuncios",
    title: "Cookies, armazenamento local e anúncios",
    content: (
      <>
        <p>
          O MGP usa armazenamento local e tecnologias equivalentes para manter
          login, idioma, tema e preferências essenciais. Você pode limpar esses
          dados no navegador, mas algumas funções podem deixar de operar
          corretamente.
        </p>
        <p>
          Na data desta versão, o MGP não integra o Google AdSense. Se a
          publicidade for ativada, esta Política será atualizada antes da
          veiculação. O Google e seus parceiros poderão usar cookies ou
          identificadores para entregar, limitar e medir anúncios, inclusive com
          base em visitas a este e a outros sites. As escolhas de personalização
          poderão ser gerenciadas na{" "}
          <a
            className={linkClassName}
            href="https://myadcenter.google.com/"
            target="_blank"
            rel="noreferrer"
          >
            Minha Central de Anúncios do Google
          </a>
          .
        </p>
        <p>
          Onde a lei exigir consentimento prévio, o MGP exibirá uma plataforma
          de gestão de consentimento adequada antes de usar cookies
          publicitários não essenciais. Recusar publicidade personalizada não
          bloqueará o acesso gratuito ao conteúdo principal.
        </p>
      </>
    ),
  },
  {
    id: "retencao-seguranca",
    title: "Retenção e segurança",
    content: (
      <>
        <p>
          Mantemos dados enquanto a conta estiver ativa e pelo período
          necessário para prestar o serviço, cumprir obrigações, prevenir
          fraude, resolver disputas e exercer direitos. Conteúdo excluído pode
          permanecer temporariamente em cópias de segurança e registros técnicos
          até a rotação segura desses sistemas.
        </p>
        <p>
          Adotamos controles técnicos e organizacionais compatíveis com o porte
          do projeto, incluindo autenticação, regras de acesso no banco e
          conexões criptografadas. Nenhum sistema é totalmente imune a
          incidentes; por isso, use senha exclusiva e proteja sua conta de
          e-mail.
        </p>
      </>
    ),
  },
  {
    id: "transferencias",
    title: "Transferências internacionais",
    content: (
      <p>
        Fornecedores de infraestrutura podem armazenar ou processar dados fora
        do Brasil. Nesses casos, buscamos fornecedores com salvaguardas
        contratuais e técnicas e aplicamos os mecanismos admitidos pela LGPD
        para transferências internacionais, conforme disponíveis e aplicáveis.
      </p>
    ),
  },
  {
    id: "direitos",
    title: "Seus direitos",
    content: (
      <>
        <p>Nos termos da LGPD, você pode solicitar, conforme aplicável:</p>
        <ul className={listClassName}>
          <li>confirmação e acesso aos dados;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>
            anonimização, bloqueio ou eliminação de dados desnecessários ou
            irregulares;
          </li>
          <li>portabilidade, quando regulamentada e tecnicamente aplicável;</li>
          <li>
            informação sobre compartilhamentos e sobre a possibilidade de negar
            consentimento;
          </li>
          <li>
            revogação do consentimento e eliminação dos dados tratados com essa
            base;
          </li>
          <li>
            oposição a tratamento irregular e revisão de decisões automatizadas,
            se houver.
          </li>
        </ul>
        <p>
          Podemos pedir informações proporcionais para confirmar sua identidade.
          Algumas solicitações podem ser limitadas quando a conservação for
          necessária por lei ou para exercício de direitos. Você também pode
          apresentar petição à Autoridade Nacional de Proteção de Dados (ANPD).
        </p>
      </>
    ),
  },
  {
    id: "menores",
    title: "Crianças e adolescentes",
    content: (
      <>
        <p>
          O MGP não é destinado a crianças menores de 13 anos e não busca
          coletar conscientemente dados delas. Pessoas entre 13 e 17 anos devem
          usar a plataforma com ciência e assistência de seus pais ou
          responsáveis, respeitando também a classificação indicativa dos jogos
          acessados.
        </p>
        <p>
          Se você acredita que uma criança forneceu dados indevidamente, entre
          em contato para que possamos avaliar e adotar as medidas cabíveis,
          sempre considerando o melhor interesse do menor.
        </p>
      </>
    ),
  },
  {
    id: "terceiros",
    title: "Links, jogos e serviços de terceiros",
    content: (
      <p>
        O MGP pode exibir links, vídeos, capas e referências a jogos ou serviços
        de terceiros. Ao sair da plataforma, aplicam-se os termos e políticas do
        destino. Riot Games, Bandai Namco, FromSoftware, Google, Supabase e
        Lovable não controlam esta Política e não são responsáveis pelas
        práticas do MGP.
      </p>
    ),
  },
  {
    id: "alteracoes",
    title: "Alterações desta Política",
    content: (
      <>
        <p>
          Podemos atualizar esta Política para refletir mudanças legais,
          técnicas ou de produto. A data e a versão no topo serão alteradas e,
          quando a mudança for relevante, apresentaremos aviso destacado ou
          solicitaremos novo consentimento, se necessário.
        </p>
        <p>
          Para exercer direitos ou esclarecer dúvidas, use o canal indicado na
          seção 1. Esta Política deve ser lida junto com os Termos de Uso do
          MGP.
        </p>
      </>
    ),
  },
];

function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Privacidade e proteção de dados"
      title="Política de Privacidade"
      summary="Este documento explica, em linguagem direta, quais dados o MGP trata, para quais finalidades e quais escolhas e direitos você possui."
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      version={LEGAL_VERSION}
      sections={sections}
    />
  );
}
