import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Gamepad2, MessageCircle, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import { GameArtwork } from "@/components/games/GameArtwork";
import { getGameConfig } from "@/config/games";
import { COMMUNITY_STARTER_POSTS } from "@/data/communityStarterPosts";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

export const Route = createFileRoute("/communities/$slug")({
  loader: async ({ params }) => {
    const game = getGameConfig(params.slug);
    const starter = COMMUNITY_STARTER_POSTS[params.slug];
    if (!game || !starter) throw notFound();
    return { game, starter };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Comunidade não encontrada — MGP" }, { name: "robots", content: "noindex" }] };
    const title = `${loaderData.game.name} — Comunidade MGP`;
    const description = `Comunidade de ${loaderData.game.name} no My Gamer Profile.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: GameCommunityPage,
});

function GameCommunityPage() {
  const { game, starter } = Route.useLoaderData();
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const ageLabel = starter.audience === "mature" ? "18+" : starter.audience === "teen" ? "13+" : copy("Geral", "General", "General");

  return (
    <div className="pb-14">
      <section className="relative isolate overflow-hidden border-b border-border">
        <GameArtwork game={game} variant="hero" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/35" />
        <div className="relative mx-auto flex min-h-[25rem] w-full max-w-7xl items-end px-4 pb-9 pt-24 sm:px-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
                <ShieldCheck className="size-3.5" />
                {copy("Comunidade MGP", "MGP community", "Comunidad MGP")}
              </span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-emerald-200 backdrop-blur">
                {copy("Aberta", "Open", "Abierta")}
              </span>
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold text-white sm:text-6xl">{game.name}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              {copy(
                `Discussões, descobertas, criação da comunidade e conteúdo editorial sobre ${game.name}, reunidos no mesmo espaço.`,
                `Discussions, discoveries, community creations and editorial content about ${game.name}, gathered in one space.`,
                `Debates, descubrimientos, creación de la comunidad y contenido editorial sobre ${game.name}, reunidos en un mismo espacio.`,
              )}
            </p>
            <Link
              to="/games/$slug"
              params={{ slug: game.slug }}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-gold-strong"
            >
              <Gamepad2 className="size-4" />
              {copy("Abrir hub do jogo", "Open game hub", "Abrir hub del juego")}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-gold-strong" />
            <p className="section-kicker">{copy("ABERTURA DA COMUNIDADE", "COMMUNITY OPENING", "APERTURA DE LA COMUNIDAD")}</p>
          </div>

          <article className="surface-panel overflow-hidden rounded-2xl">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-gold-strong">
                  <BadgeCheck className="size-3.5" />
                  MGP Editorial
                </span>
                <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {ageLabel}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{copy("Post de boas-vindas", "Welcome post", "Post de bienvenida")}</span>
            </header>

            <div className="p-5 sm:p-7">
              <h2 className="font-display text-2xl font-semibold leading-tight text-foreground sm:text-3xl">{starter.title[locale]}</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">{starter.body[locale]}</p>

              <div className="mt-6 rounded-xl border border-gold/20 bg-gold/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gold-strong">
                  {copy("Para começar a conversa", "Start the conversation", "Para empezar la conversación")}
                </p>
                <p className="mt-2 font-display text-lg font-semibold leading-7 text-foreground">{starter.prompt[locale]}</p>
              </div>
            </div>
          </article>

          <div className="surface-panel rounded-2xl p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 size-5 shrink-0 text-gold-strong" />
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  {copy("Feed comunitário em preparação", "Community feed in preparation", "Feed comunitario en preparación")}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {copy(
                    "A comunidade já tem identidade e conteúdo editorial inicial. O feed de usuários será conectado aqui quando moderação, classificação etária e publicação estiverem fechadas na mesma fundação.",
                    "The community already has its identity and initial editorial content. The user feed will connect here once moderation, age rating and publishing are finalized in the same foundation.",
                    "La comunidad ya tiene identidad y contenido editorial inicial. El feed de usuarios se conectará aquí cuando moderación, clasificación por edad y publicación estén finalizadas.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="surface-panel rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-gold-strong" />
              <h2 className="font-display text-sm font-semibold uppercase text-foreground">
                {copy("Regras rápidas", "Quick rules", "Reglas rápidas")}
              </h2>
            </div>
            <ul className="mt-4 space-y-3 text-xs leading-5 text-muted-foreground">
              <li>{copy("Marque spoilers e dê contexto antes de revelar momentos importantes.", "Mark spoilers and provide context before revealing major moments.", "Marca spoilers y da contexto antes de revelar momentos importantes.")}</li>
              <li>{copy("Sem assédio, preconceito, doxxing, spam ou conteúdo que coloque menores em risco.", "No harassment, hate, doxxing, spam or content that puts minors at risk.", "Sin acoso, odio, doxxing, spam ni contenido que ponga a menores en riesgo.")}</li>
              <li>{copy("Pornografia, sexo explícito e gore gratuito não são permitidos.", "Pornography, explicit sex and gratuitous gore are not allowed.", "Pornografía, sexo explícito y gore gratuito no están permitidos.")}</li>
              <li>{copy("Temas maduros legítimos podem receber aviso, desfoque ou restrição etária.", "Legitimate mature themes may receive a warning, blur or age restriction.", "Los temas maduros legítimos pueden recibir aviso, desenfoque o restricción de edad.")}</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-center gap-2 text-amber-500">
              <TriangleAlert className="size-4" />
              <h2 className="text-xs font-bold uppercase tracking-[0.12em]">{copy("Faixa etária", "Age safety", "Seguridad por edad")}</h2>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {copy(
                "A classificação do post é um controle de apresentação, não uma autorização para conteúdo proibido. Contas de adolescentes seguem as regras de supervisão do MGP.",
                "A post rating is a presentation control, not permission for prohibited content. Teen accounts remain subject to MGP supervision rules.",
                "La clasificación del post es un control de presentación, no un permiso para contenido prohibido. Las cuentas adolescentes siguen las reglas de supervisión de MGP.",
              )}
            </p>
          </section>
        </aside>
      </main>
    </div>
  );
}
