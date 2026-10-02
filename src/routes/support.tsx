import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeDollarSign,
  Bug,
  CheckCircle2,
  Copy,
  ExternalLink,
  HeartHandshake,
  Instagram,
  Mail,
  MessageSquareText,
  ServerCog,
  Share2,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { KoFiSupportButton } from "@/components/support/KoFiSupportButton";
import { SupportFeedbackDesk } from "@/components/support/SupportFeedbackDesk";
import {
  SUPPORT_EMAIL,
  SUPPORT_INSTAGRAM_HANDLE,
  SUPPORT_INSTAGRAM_URL,
  SUPPORT_METHODS,
} from "@/config/support";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/support")({
  component: SupportPage,
  head: () =>
    buildSeo({
      title: "Apoie o ÍMPAR",
      description:
        "Conheça a história do ÍMPAR e veja como apoiar o desenvolvimento independente da plataforma gamer.",
      path: "/support",
    }),
});

function SupportPage() {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) =>
    localeCopy(locale, pt, en, es);
  const [copied, setCopied] = useState<"key" | "code" | null>(null);
  const pix = SUPPORT_METHODS.find((method) => method.id === "pix");
  const recurring = SUPPORT_METHODS.find((method) => method.id === "recurring");

  const copyPix = async (kind: "key" | "code") => {
    const value = kind === "code" ? pix?.pixCopyPasteCode : pix?.pixKey;
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1800);
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="relative overflow-hidden rounded-[1.4rem_1.4rem_0.65rem_1.4rem] border border-border bg-surface p-6 shadow-soft sm:p-9">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 12% 10%, color-mix(in oklab, var(--color-gold) 16%, transparent), transparent 32rem)",
          }}
        />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-lg border border-gold/25 bg-gold-soft/35 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-gold-strong">
              <HeartHandshake className="size-3.5" aria-hidden="true" />
              {copy("Projeto independente", "Independent project", "Proyecto independiente")}
            </div>

            <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-foreground sm:text-5xl">
              {copy(
                "Ajude o ÍMPAR a continuar crescendo.",
                "Help ÍMPAR keep growing.",
                "Ayuda a ÍMPAR a seguir creciendo.",
              )}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              {copy(
                "O ÍMPAR está sendo desenvolvido com orçamento enxuto, por uma pessoa, com apoio de ferramentas de IA e infraestrutura acessível. Nesta fase inicial, o projeto não tem receita recorrente e qualquer apoio ajuda a manter domínio, hospedagem, integrações e tempo de desenvolvimento.",
                "ÍMPAR is being built on a very small budget by one person, with help from AI tools and accessible infrastructure. At this early stage the project has no recurring revenue, and support helps cover the domain, hosting, integrations and development time.",
                "ÍMPAR se está desarrollando con un presupuesto muy pequeño por una sola persona, con ayuda de herramientas de IA e infraestructura accesible. En esta fase inicial no hay ingresos recurrentes y cualquier apoyo ayuda con dominio, alojamiento, integraciones y tiempo de desarrollo.",
              )}
            </p>
          </div>

          <aside className="rounded-[1.1rem_1.1rem_0.5rem_1.1rem] border border-border bg-muted/20 p-5">
            <UserRound className="size-5 text-gold-strong" aria-hidden="true" />
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {copy("Quem está por trás", "Who is behind it", "Quién está detrás")}
            </p>
            <p className="mt-2 font-display text-lg font-semibold text-foreground">ESDRAS, 22 anos</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy(
                "Graduando em uma área fora da programação, aprendendo desenvolvimento enquanto transforma algumas ideias antigas em um produto real e que possa fazer sentido para o público.",
                "A university student in a field outside programming, learning development while turning some long-held ideas into a real product that can make sense to people.",
                "Estudiante universitario de un área fuera de la programación, aprendiendo desarrollo mientras transforma algunas ideas antiguas en un producto real que pueda tener sentido para el público.",
              )}
            </p>
            <a
              href={SUPPORT_INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-gold-strong hover:underline"
            >
              <Instagram className="size-4" />
              {SUPPORT_INSTAGRAM_HANDLE}
              <ExternalLink className="size-3" />
            </a>
          </aside>
        </div>
      </section>

      <section className="mt-6 surface-panel overflow-hidden p-5 sm:p-7">
        <div className="flex items-center gap-2 text-gold-strong">
          <Sparkles className="size-4" />
          <span className="section-kicker">
            {copy("POR QUE O ÍMPAR EXISTE", "WHY ÍMPAR EXISTS", "POR QUÉ EXISTE ÍMPAR")}
          </span>
        </div>
        <h2 className="mt-3 max-w-3xl font-display text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
          {copy(
            "Uma rede social gamer, mas também um lugar para entender melhor os jogos.",
            "A gaming social network, but also a place to understand games better.",
            "Una red social gamer, pero también un lugar para entender mejor los juegos.",
          )}
        </h2>

        <div className="mt-5 grid gap-5 text-sm leading-7 text-muted-foreground lg:grid-cols-2">
          <div className="space-y-4">
            <p>
              {copy(
                "A ideia do ÍMPAR é criar uma rede social em que você consiga conhecer pessoas para jogar, sem transformar isso em obrigação de manter contato o tempo todo. Tem gente que prefere jogar sozinha, gente que gosta de companhia, gente que entra em grupo só para uma sessão. O ÍMPAR foi pensado para caber nesses jeitos diferentes de viver os games.",
                "ÍMPAR is meant to be a social network where you can meet people to play with without turning that into an obligation to stay in constant contact. Some people prefer playing alone, some like company, and some only want a group for one session. ÍMPAR is designed to fit those different ways of enjoying games.",
                "ÍMPAR está pensado como una red social donde puedas conocer gente para jugar sin convertirlo en una obligación de mantener contacto constante. Hay quienes prefieren jugar solos, quienes disfrutan de compañía y quienes solo buscan grupo para una sesión. ÍMPAR fue pensado para encajar en esas distintas formas de vivir los videojuegos.",
              )}
            </p>
            <p>
              {copy(
                "Ao mesmo tempo, o projeto não quer ser só uma comunidade. Cada jogo pode ter guias, builds, compêndios, ferramentas e formas interativas de aprender. A proposta é que você consiga entrar em um hub e encontrar contexto suficiente para entender melhor o jogo, se orientar e resolver dúvidas sem precisar abrir cinco lugares diferentes.",
                "At the same time, the project is not meant to be only a community. Each game can have guides, builds, compendiums, tools and interactive ways to learn. The idea is that you can enter a hub and find enough context to understand the game better, get oriented and solve questions without opening five different places.",
                "Al mismo tiempo, el proyecto no quiere ser solo una comunidad. Cada juego puede tener guías, builds, compendios, herramientas y formas interactivas de aprender. La idea es entrar a un hub y encontrar suficiente contexto para entender mejor el juego, orientarte y resolver dudas sin abrir cinco sitios distintos.",
              )}
            </p>
          </div>
          <div className="space-y-4">
            <p>
              {copy(
                "Isso vem de experiência pessoal. Eu já passei pela dificuldade de montar build, descobrir o que fazer em cada parte, entender quem era cada boss, onde ficava cada mapa ou simplesmente saber qual caminho seguir. O ÍMPAR nasceu para juntar comunidades em um ambiente só, mas também para ajudar quem está chegando agora ou quem ainda tem dificuldade de entender certos conteúdos.",
                "That comes from personal experience. I have dealt with the difficulty of making builds, figuring out what to do next, understanding who each boss was, where maps were or simply knowing which path to follow. ÍMPAR was born to bring communities together, but also to help newcomers and people who still struggle to understand certain game content.",
                "Eso viene de experiencia personal. Yo también pasé por la dificultad de montar builds, descubrir qué hacer en cada parte, entender quién era cada boss, dónde estaba cada mapa o simplemente saber qué camino seguir. ÍMPAR nació para reunir comunidades, pero también para ayudar a quienes están empezando o todavía tienen dificultad con ciertos contenidos.",
              )}
            </p>
            <p>
              {copy(
                "Também existe uma parte de identidade. Em outras redes, o perfil gira em torno do seu nome, suas fotos e sua rotina. O ÍMPAR é focado em jogos: uma foto jogando, uma conquista, um momento com amigos, namorado, noivo, família ou squad, um guia que você criou ou o jogo que marcou sua vida. A intenção é dar mais liberdade para expressar sua personalidade gamer em um lugar feito especificamente para isso.",
                "There is also an identity side to it. On other networks, your profile revolves around your name, photos and daily life. ÍMPAR is focused on games: a screenshot while playing, an achievement, a moment with friends, a partner, family or squad, a guide you made or a game that marked your life. The goal is to give people more freedom to express their gaming identity in a place built specifically for it.",
                "También hay una parte de identidad. En otras redes, el perfil gira alrededor de tu nombre, tus fotos y tu rutina. ÍMPAR está centrado en juegos: una foto jugando, un logro, un momento con amigos, pareja, familia o squad, una guía que creaste o el juego que marcó tu vida. La intención es dar más libertad para expresar tu identidad gamer en un espacio creado específicamente para eso.",
              )}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-gold/20 bg-gold/[0.04] p-4">
          <p className="text-sm leading-6 text-foreground/90">
            {copy(
              "O objetivo final é simples de explicar, mesmo que seja difícil de construir: fazer o ÍMPAR virar um hub interativo em que comunidade, descoberta de pessoas, guias, conhecimento e identidade gamer convivam dentro da mesma plataforma. O projeto começou com quatro jogos e vai crescer aos poucos. Como hoje ele é tocado por uma equipe de uma pessoa só, esse crescimento precisa ser gradual, testado e guiado por quem realmente usa.",
              "The final goal is simple to explain even if it is difficult to build: make ÍMPAR an interactive hub where community, finding people, guides, knowledge and gaming identity live on the same platform. The project started with four games and will expand gradually. Since it is currently run by a one-person team, that growth needs to be gradual, tested and guided by the people who actually use it.",
              "El objetivo final es sencillo de explicar aunque sea difícil de construir: convertir ÍMPAR en un hub interactivo donde comunidad, descubrimiento de personas, guías, conocimiento e identidad gamer convivan en una misma plataforma. El proyecto comenzó con cuatro juegos y crecerá poco a poco. Como hoy lo lleva un equipo de una sola persona, ese crecimiento debe ser gradual, probado y guiado por quienes realmente lo usan.",
            )}
          </p>
        </div>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2">
        <StoryCard
          icon={ServerCog}
          title={copy("Como está sendo feito", "How it is being built", "Cómo se está construyendo")}
          body={copy(
            "O projeto combina trabalho humano com IA para programação, pesquisa, revisão, testes e organização. A decisão final, a responsabilidade pelo produto e a direção continuam humanas.",
            "The project combines human work with AI for coding, research, review, testing and organization. Product direction, final decisions and responsibility remain human.",
            "El proyecto combina trabajo humano con IA para programación, investigación, revisión, pruebas y organización. La dirección, las decisiones finales y la responsabilidad siguen siendo humanas.",
          )}
        />
        <StoryCard
          icon={ShieldCheck}
          title={copy("Transparência primeiro", "Transparency first", "Transparencia primero")}
          body={copy(
            "Apoio financeiro é voluntário. Ele não compra participação no projeto, vantagem na moderação, tratamento preferencial nem promessa de retorno financeiro.",
            "Financial support is voluntary. It does not buy ownership, moderation privileges, preferential treatment or any promise of financial return.",
            "El apoyo financiero es voluntario. No compra participación, privilegios de moderación, trato preferencial ni promesa de retorno financiero.",
          )}
        />
      </section>

      <section className="mt-8">
        <p className="section-kicker">{copy("APOIO FINANCEIRO", "FINANCIAL SUPPORT", "APOYO FINANCIERO")}</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
          {copy("Duas formas simples de ajudar", "Two simple ways to help", "Dos formas simples de ayudar")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {copy(
            "O Ko-fi já está ativo para apoio recorrente. O Pix será a opção direta para quem preferir contribuir uma vez, com chave e QR Code dedicados ao projeto.",
            "Ko-fi is already active for recurring support. Pix will be the direct option for anyone who prefers a one-time contribution, with a dedicated key and QR code for the project.",
            "Ko-fi ya está activo para apoyo recurrente. Pix será la opción directa para quien prefiera contribuir una sola vez, con una clave y un código QR dedicados al proyecto.",
          )}
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <SupportCard
            icon={WalletCards}
            title="Pix"
            badge={copy("Recomendado para apoio pontual", "Best for one-time support", "Recomendado para apoyo puntual")}
            description={copy(
              "O Pix usa uma chave aleatória dedicada ao projeto, evitando expor CPF, telefone ou e-mail pessoal. O nome do recebedor é mostrado antes da cópia para você conferir o destino.",
              "Pix uses a random key dedicated to the project, avoiding exposure of a personal ID, phone number or email. The recipient name is shown before copying so you can confirm the destination.",
              "Pix usa una clave aleatoria dedicada al proyecto, evitando exponer documento, teléfono o correo personal. El nombre del receptor aparece antes de copiar para confirmar el destino.",
            )}
            active={Boolean(pix?.pixKey)}
            action={
              pix?.pixKey ? (
                <div className="space-y-3">
                  {pix.pixRecipientName ? (
                    <div className="rounded-lg border border-border bg-background/45 px-3 py-2">
                      <span className="block text-[0.62rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                        {copy("Recebedor", "Recipient", "Receptor")}
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-foreground">
                        {pix.pixRecipientName}
                      </span>
                    </div>
                  ) : null}
                  {pix.pixQrImageUrl && pix.pixCopyPasteCode ? (
                    <div className="grid gap-4 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:items-center">
                      <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
                        <img
                          src={pix.pixQrImageUrl}
                          alt={copy("QR Code Pix do ÍMPAR", "ÍMPAR Pix QR code", "Código QR Pix de ÍMPAR")}
                          className="mx-auto aspect-square w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs leading-5 text-muted-foreground">
                          {copy(
                            "QR Code estático sem valor fixo. Abra o app do seu banco, escaneie e escolha quanto deseja apoiar.",
                            "Static QR code with no fixed amount. Open your banking app, scan it and choose how much you want to support.",
                            "Código QR estático sin valor fijo. Abre la app de tu banco, escanéalo y elige cuánto deseas apoyar.",
                          )}
                        </p>
                        <p className="text-[0.68rem] font-semibold text-muted-foreground">
                          {pix.pixMerchantCity}
                        </p>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => void copyPix("code")} className="brand-button min-h-11 gap-2">
                      {copied === "code" ? <CheckCircle2 className="size-4" /> : <Copy className="size-4" />}
                      {copied === "code"
                        ? copy("Pix Copia e Cola copiado", "Pix code copied", "Código Pix copiado")
                        : copy("Copiar Pix Copia e Cola", "Copy Pix code", "Copiar código Pix")}
                    </button>
                    <button type="button" onClick={() => void copyPix("key")} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition hover:bg-muted/50">
                      {copied === "key" ? <CheckCircle2 className="size-4" /> : <Copy className="size-4" />}
                      {copied === "key"
                        ? copy("Chave copiada", "Key copied", "Clave copiada")
                        : copy("Copiar chave", "Copy key", "Copiar clave")}
                    </button>
                  </div>
                </div>
              ) : (
                <span className="inline-flex min-h-11 items-center rounded-lg border border-dashed border-border px-4 text-sm font-semibold text-muted-foreground">
                  {copy("Em configuração", "Being configured", "En configuración")}
                </span>
              )
            }
          />

          <SupportCard
            icon={BadgeDollarSign}
            title={recurring?.provider ?? "Ko-fi"}
            badge={copy("Para apoio mensal", "For monthly support", "Para apoyo mensual")}
            description={copy(
              "Uma campanha recorrente permite que quem quiser ajude com um valor mensal, sem transformar o ÍMPAR em assinatura obrigatória.",
              "A recurring campaign lets supporters contribute monthly without turning ÍMPAR into a required subscription.",
              "Una campaña recurrente permite apoyar mensualmente sin convertir ÍMPAR en una suscripción obligatoria.",
            )}
            active={Boolean(recurring?.url)}
            action={<KoFiSupportButton />}
          />
        </div>
      </section>

      <section className="mt-8 rounded-[1.2rem_1.2rem_0.55rem_1.2rem] border border-gold/20 bg-gold/[0.04] p-5 sm:p-6">
        <p className="section-kicker">{copy("MONETIZAÇÃO FUTURA", "FUTURE MONETIZATION", "MONETIZACIÓN FUTURA")}</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-foreground">
          {copy("Apoio hoje não é uma promessa de benefício amanhã.", "Support today is not a promise of future perks.", "Apoyar hoy no es una promesa de beneficios futuros.")}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          {copy(
            "O ÍMPAR ainda é pequeno e gerido por uma pessoa. Mais adiante, podem existir formas internas de monetização, como cosméticos e personalizações exclusivas, comunidades ou áreas especiais para apoiadores e conteúdos produzidos em colaboração com criadores, influenciadores ou jogadores do cenário quando isso for viável. Nada disso está sendo vendido ou garantido nesta fase.",
            "ÍMPAR is still small and run by one person. Later, internal monetization may include exclusive cosmetics and customization, supporter-only community spaces, or content produced with creators, influencers or competitive-scene players when feasible. None of those future ideas are being sold or guaranteed at this stage.",
            "ÍMPAR todavía es pequeño y está gestionado por una sola persona. Más adelante podrían existir formas internas de monetización como cosméticos y personalización exclusiva, espacios especiales para seguidores o contenido con creadores, influencers o jugadores del escenario competitivo cuando sea viable. Nada de eso se vende ni se garantiza en esta fase.",
          )}
        </p>
      </section>

      <section className="mt-8 rounded-[1.2rem_1.2rem_0.55rem_1.2rem] border border-border bg-muted/15 p-5 sm:p-6">
        <p className="section-kicker">{copy("SEM DINHEIRO TAMBÉM AJUDA", "YOU CAN HELP WITHOUT MONEY", "TAMBIÉN PUEDES AYUDAR SIN DINERO")}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <SmallHelp
            icon={Bug}
            title={copy("Testar e reportar bugs", "Test and report bugs", "Probar y reportar errores")}
            body={copy(
              "Abrir o site em celular e PC e apontar o que ficou estranho já economiza muito tempo.",
              "Opening the site on mobile and desktop and reporting what feels wrong saves a lot of time.",
              "Abrir el sitio en móvil y PC y señalar lo que se ve raro ya ahorra mucho tiempo.",
            )}
          />
          <SmallHelp
            icon={MessageSquareText}
            title={copy("Dar feedback", "Give feedback", "Dar feedback")}
            body={copy(
              "Dizer o que está faltando, confuso, interessante ou sugerir qual deveria ser o próximo jogo ajuda a decidir o que realmente merece prioridade.",
              "Saying what is missing, confusing or interesting — or suggesting which game should come next — helps decide what actually deserves priority.",
              "Decir qué falta, qué resulta confuso o interesante, o sugerir cuál debería ser el próximo juego, ayuda a decidir qué merece prioridad.",
            )}
          />
          <SmallHelp
            icon={Share2}
            title={copy("Compartilhar", "Share it", "Compartir")}
            body={copy(
              "Quando o ÍMPAR estiver pronto para teste público, mostrar a plataforma para outros jogadores já será uma ajuda enorme.",
              "When ÍMPAR is ready for public testing, showing it to other players will already be a huge help.",
              "Cuando ÍMPAR esté listo para pruebas públicas, enseñarlo a otros jugadores ya será una gran ayuda.",
            )}
          />
        </div>
      </section>

      <section className="mt-8">
        <p className="section-kicker">
          {copy("FALE COM O PROJETO", "CONTACT THE PROJECT", "HABLA CON EL PROYECTO")}
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
          {copy(
            "Feedback pode ficar dentro do próprio ÍMPAR.",
            "Feedback can stay inside ÍMPAR itself.",
            "El feedback puede quedarse dentro del propio ÍMPAR.",
          )}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {copy(
            "Usuários logados podem mandar mensagem direto para a caixa administrativa e acompanhar a resposta na própria página. O e-mail mgprofilesocial@gmail.com e o Instagram continuam disponíveis para quem preferir falar por fora.",
            "Signed-in users can message the admin inbox directly and track replies on this page. The email mgprofilesocial@gmail.com and Instagram remain available for anyone who prefers an external channel.",
            "Los usuarios que hayan iniciado sesión pueden enviar mensajes directamente a la bandeja administrativa y seguir la respuesta en esta misma página. El correo mgprofilesocial@gmail.com e Instagram siguen disponibles para quien prefiera un canal externo.",
          )}
        </p>

        <div className="mt-5">
          <SupportFeedbackDesk />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a
            href={"mailto:" + SUPPORT_EMAIL}
            className="surface-panel flex items-center gap-3 p-4 transition hover:border-gold/30"
          >
            <Mail className="size-4 text-gold-strong" />
            <span>
              <span className="block text-sm font-semibold text-foreground">E-mail</span>
              <span className="block text-xs text-muted-foreground">{SUPPORT_EMAIL}</span>
            </span>
          </a>
          <a
            href={SUPPORT_INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="surface-panel flex items-center gap-3 p-4 transition hover:border-gold/30"
          >
            <Instagram className="size-4 text-gold-strong" />
            <span>
              <span className="block text-sm font-semibold text-foreground">Instagram</span>
              <span className="block text-xs text-muted-foreground">{SUPPORT_INSTAGRAM_HANDLE}</span>
            </span>
          </a>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/games" className="brand-button-secondary min-h-11">
          {copy("Continuar explorando o ÍMPAR", "Keep exploring ÍMPAR", "Seguir explorando ÍMPAR")}
        </Link>
        <a href={"mailto:" + SUPPORT_EMAIL} className="brand-button-secondary min-h-11">
          {copy("Falar com o projeto", "Contact the project", "Contactar el proyecto")}
        </a>
      </div>
    </main>
  );
}

function StoryCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Sparkles;
  title: string;
  body: string;
}) {
  return (
    <article className="surface-panel p-5">
      <Icon className="size-5 text-gold-strong" aria-hidden="true" />
      <h2 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </article>
  );
}

function SupportCard({
  icon: Icon,
  title,
  badge,
  description,
  active,
  action,
}: {
  icon: typeof WalletCards;
  title: string;
  badge: string;
  description: string;
  active: boolean;
  action: ReactNode;
}) {
  return (
    <article
      className={cn(
        "surface-panel relative overflow-hidden p-5 sm:p-6",
        active && "border-gold/35",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="grid size-11 place-items-center rounded-[0.8rem_0.8rem_0.34rem_0.8rem] border border-gold/20 bg-gold-soft/35 text-gold-strong">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <span className="rounded-md border border-border bg-muted/40 px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {active ? "ON" : "SETUP"}
        </span>
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-gold-strong">{badge}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-5">{action}</div>
    </article>
  );
}

function SmallHelp({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Bug;
  title: string;
  body: string;
}) {
  return (
    <div>
      <Icon className="size-4 text-gold-strong" aria-hidden="true" />
      <h3 className="mt-2 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
    </div>
  );
}
