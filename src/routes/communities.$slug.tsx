import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, BadgeCheck, Hammer, MessageCircle, ShieldCheck, Sparkles, TriangleAlert, Users } from "lucide-react";
import { GameArtwork } from "@/components/games/GameArtwork";
import { PostCard } from "@/components/posts/PostCard";
import { PostComposer } from "@/components/posts/PostComposer";
import { isGameActive } from "@/config/gameAvailability";
import { getGameConfig } from "@/config/games";
import { COMMUNITY_STARTER_POSTS } from "@/data/communityStarterPosts";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { getGameBySlug } from "@/lib/games.functions";
import { listPosts } from "@/lib/posts.functions";

export const Route = createFileRoute("/communities/$slug")({
  loader: async ({ params }) => {
    const game = getGameConfig(params.slug);
    const starter = COMMUNITY_STARTER_POSTS[params.slug];
    if (!game || !starter || !isGameActive(params.slug)) throw notFound();

    const gameRecord = await getGameBySlug({ data: { slug: params.slug } });
    const posts = await listPosts({ data: { gameId: gameRecord.id, page: 1 } }).catch((error) => {
      console.warn("[Community] Could not load posts", error);
      return [];
    });

    return { game, starter, gameRecord, posts };
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
  const { game, starter, gameRecord, posts: initialPosts } = Route.useLoaderData();
  const { user } = useAuth();
  const { locale } = useI18n();
  const [posts, setPosts] = useState(initialPosts);
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
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/games/$slug"
                params={{ slug: game.slug }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition hover:border-gold/40 hover:text-gold-strong"
              >
                <Hammer className="size-4" />
                {copy("Builds e guias", "Builds & guides", "Builds y guías")}
              </Link>
              <a
                href={`/lfg?game=${encodeURIComponent(game.slug)}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition hover:border-gold/40 hover:text-gold-strong"
              >
                <Users className="size-4" />
                LFG
              </a>
              <a
                href="#community-feed"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition hover:border-gold/40 hover:text-gold-strong"
              >
                <MessageCircle className="size-4" />
                {copy("Ir para o feed", "Open feed", "Ir al feed")}
                <ArrowRight className="size-4" />
              </a>
            </div>
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

          <section id="community-feed" className="space-y-4 scroll-mt-24">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="size-5 text-gold-strong" />
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    {copy("Feed da comunidade", "Community feed", "Feed de la comunidad")}
                  </h2>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {copy(
                    "Posts publicados aqui aparecem vinculados a este jogo e podem receber curtidas e comentários.",
                    "Posts published here are linked to this game and support likes and comments.",
                    "Los posts publicados aquí quedan vinculados a este juego y admiten me gusta y comentarios.",
                  )}
                </p>
              </div>
              <span className="rounded-full border border-border bg-muted/20 px-3 py-1 text-xs font-semibold text-muted-foreground">
                {posts.length} {copy("posts recentes", "recent posts", "posts recientes")}
              </span>
            </div>

            {user ? (
              <PostComposer
                gameId={gameRecord.id}
                onCreated={(post) => setPosts((current) => [post, ...current])}
              />
            ) : (
              <div className="surface-panel rounded-xl p-4 text-sm text-muted-foreground">
                {copy(
                  "Entre na sua conta para publicar nesta comunidade.",
                  "Sign in to publish in this community.",
                  "Inicia sesión para publicar en esta comunidad.",
                )}{" "}
                <Link to="/login" className="font-semibold text-gold-strong hover:underline">
                  {copy("Entrar", "Sign in", "Entrar")}
                </Link>
              </div>
            )}

            {posts.length ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="surface-panel rounded-2xl p-6 text-center">
                <Sparkles className="mx-auto size-5 text-gold-strong" />
                <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
                  {copy("Abra a conversa", "Start the conversation", "Abre la conversación")}
                </h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                  {copy(
                    "Ainda não há posts de jogadores aqui. Use a pergunta editorial acima como ponto de partida ou publique sua própria descoberta.",
                    "There are no player posts here yet. Use the editorial prompt above as a starting point or publish your own discovery.",
                    "Todavía no hay posts de jugadores aquí. Usa la pregunta editorial de arriba como punto de partida o publica tu propio descubrimiento.",
                  )}
                </p>
              </div>
            )}
          </section>
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
