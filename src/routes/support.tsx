import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeDollarSign,
  Bug,
  CheckCircle2,
  Copy,
  ExternalLink,
  HeartHandshake,
  MessageSquareText,
  ServerCog,
  Share2,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { SUPPORT_METHODS } from "@/config/support";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/support")({
  component: SupportPage,
  head: () => ({
    meta: [
      { title: "Apoie o MG Profile — MGP" },
      {
        name: "description",
        content:
          "Conheça a história do MG Profile e veja como apoiar o desenvolvimento independente do projeto.",
      },
    ],
  }),
});

function SupportPage() {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) =>
    localeCopy(locale, pt, en, es);
  const [copied, setCopied] = useState(false);
  const pix = SUPPORT_METHODS.find((method) => method.id === "pix");
  const recurring = SUPPORT_METHODS.find((method) => method.id === "recurring");

  const copyPix = async () => {
    if (!pix?.pixKey) return;
    await navigator.clipboard.writeText(pix.pixKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
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
                "Ajude o MG Profile a continuar crescendo.",
                "Help MG Profile keep growing.",
                "Ayuda a MG Profile a seguir creciendo.",
              )}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              {copy(
                "O MGP está sendo desenvolvido com orçamento enxuto, por uma pessoa, com apoio de ferramentas de IA e infraestrutura acessível. Nesta fase inicial, o projeto não tem receita recorrente e qualquer apoio ajuda a manter domínio, hospedagem, integrações e tempo de desenvolvimento.",
                "MGP is being built on a very small budget by one person, with help from AI tools and accessible infrastructure. At this early stage the project has no recurring revenue, and support helps cover the domain, hosting, integrations and development time.",
                "MGP se está desarrollando con un presupuesto muy pequeño por una sola persona, con ayuda de herramientas de IA e infraestructura accesible. En esta fase inicial no hay ingresos recurrentes y cualquier apoyo ayuda con dominio, alojamiento, integraciones y tiempo de desarrollo.",
              )}
            </p>
          </div>

          <aside className="rounded-[1.1rem_1.1rem_0.5rem_1.1rem] border border-border bg-muted/20 p-5">
            <UserRound className="size-5 text-gold-strong" aria-hidden="true" />
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {copy("Quem está por trás", "Who is behind it", "Quién está detrás")}
            </p>
            <p className="mt-2 font-display text-lg font-semibold text-foreground">Edras, 22</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy(
                "Graduando em uma área fora da programação, aprendendo desenvolvimento enquanto transforma uma ideia antiga em produto real.",
                "A university student in a field outside programming, learning development while turning a long-held idea into a real product.",
                "Estudiante universitario de un área fuera de programación, aprendiendo desarrollo mientras convierte una idea antigua en un producto real.",
              )}
            </p>
          </aside>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <StoryCard
          icon={Sparkles}
          title={copy("Por que o MGP existe", "Why MGP exists", "Por qué existe MGP")}
          body={copy(
            "A ideia é criar uma identidade gamer de verdade: perfil, jogos favoritos, conquistas, comunidades, fóruns, LFG, guias, builds e tutoriais reunidos em uma experiência própria.",
            "The goal is to build a real gamer identity: profile, favorite games, achievements, communities, forums, LFG, guides, builds and tutorials in one dedicated experience.",
            "La idea es crear una identidad gamer real: perfil, juegos favoritos, logros, comunidades, foros, LFG, guías, builds y tutoriales en una experiencia propia.",
          )}
        />
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
            "A estrutura já está pronta, mas os meios de pagamento ainda estão em configuração. A ideia é manter uma opção direta por Pix e uma opção recorrente em plataforma brasileira.",
            "The structure is ready, but payment methods are still being configured. The plan is to keep a direct Pix option and a recurring option through a Brazilian platform.",
            "La estructura está lista, pero los métodos de pago siguen en configuración. La idea es mantener una opción directa por Pix y otra recurrente mediante una plataforma brasileña.",
          )}
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <SupportCard
            icon={WalletCards}
            title="Pix"
            badge={copy("Recomendado para apoio pontual", "Best for one-time support", "Recomendado para apoyo puntual")}
            description={copy(
              "Quando for ativado, o MGP usará uma chave aleatória dedicada ao projeto, evitando expor CPF, telefone ou e-mail pessoal.",
              "When enabled, MGP will use a random key dedicated to the project, avoiding exposure of a personal ID, phone number or email.",
              "Cuando se active, MGP usará una clave aleatoria dedicada al proyecto, evitando exponer documento, teléfono o correo personal.",
            )}
            active={Boolean(pix?.pixKey)}
            action={
              pix?.pixKey ? (
                <button type="button" onClick={copyPix} className="brand-button min-h-11 gap-2">
                  {copied ? <CheckCircle2 className="size-4" /> : <Copy className="size-4" />}
                  {copied
                    ? copy("Chave copiada", "Key copied", "Clave copiada")
                    : copy("Copiar chave Pix", "Copy Pix key", "Copiar clave Pix")}
                </button>
              ) : (
                <span className="inline-flex min-h-11 items-center rounded-lg border border-dashed border-border px-4 text-sm font-semibold text-muted-foreground">
                  {copy("Em configuração", "Being configured", "En configuración")}
                </span>
              )
            }
          />

          <SupportCard
            icon={BadgeDollarSign}
            title={recurring?.provider ?? "APOIA.se"}
            badge={copy("Para apoio mensal", "For monthly support", "Para apoyo mensual")}
            description={copy(
              "Uma campanha recorrente permite que quem quiser ajude com um valor mensal, sem transformar o MGP em assinatura obrigatória.",
              "A recurring campaign lets supporters contribute monthly without turning MGP into a required subscription.",
              "Una campaña recurrente permite apoyar mensualmente sin convertir MGP en una suscripción obligatoria.",
            )}
            active={Boolean(recurring?.url)}
            action={
              recurring?.url ? (
                <a
                  href={recurring.url}
                  target="_blank"
                  rel="noreferrer"
                  className="brand-button min-h-11 gap-2"
                >
                  {copy("Apoiar mensalmente", "Support monthly", "Apoyar mensualmente")}
                  <ExternalLink className="size-4" />
                </a>
              ) : (
                <span className="inline-flex min-h-11 items-center rounded-lg border border-dashed border-border px-4 text-sm font-semibold text-muted-foreground">
                  {copy("Campanha em configuração", "Campaign being configured", "Campaña en configuración")}
                </span>
              )
            }
          />
        </div>
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
              "Dizer o que está faltando, confuso ou interessante ajuda a decidir o que realmente merece prioridade.",
              "Saying what is missing, confusing or useful helps decide what actually deserves priority.",
              "Decir qué falta, qué confunde o qué funciona ayuda a decidir qué merece prioridad.",
            )}
          />
          <SmallHelp
            icon={Share2}
            title={copy("Compartilhar", "Share it", "Compartir")}
            body={copy(
              "Quando o MGP estiver pronto para teste público, mostrar a plataforma para outros jogadores já será uma ajuda enorme.",
              "When MGP is ready for public testing, showing it to other players will already be a huge help.",
              "Cuando MGP esté listo para pruebas públicas, enseñarlo a otros jugadores ya será una gran ayuda.",
            )}
          />
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/games" className="brand-button-secondary min-h-11">
          {copy("Continuar explorando o MGP", "Keep exploring MGP", "Seguir explorando MGP")}
        </Link>
        <a href="mailto:zardzeprime@gmail.com" className="brand-button-secondary min-h-11">
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
