import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  LibraryBig,
  MessagesSquare,
  Sparkles,
  UsersRound,
  HeartHandshake,
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { AdReadyLayout, AdSlot } from "@/components/common/AdSlot";
import { BrandLogoPlaceholder } from "@/components/brand/BrandLogoPlaceholder";
import { GameCard } from "@/components/games/GameCard";
import { ACTIVE_GAMES } from "@/config/gameAvailability";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { useAuth } from "@/hooks/useAuth";
import { listPosts } from "@/lib/posts.functions";
import { PostCard } from "@/components/posts/PostCard";
import { PostComposer } from "@/components/posts/PostComposer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState } from "react";
import { buildSeo } from "@/lib/seo";
import { requestNoctisOpen } from "@/lib/noctis-dialog";

const SORTED_GAMES = [...ACTIVE_GAMES].sort((a, b) =>
  a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
);

export const Route = createFileRoute("/")({
  loader: async () => ({ posts: await listPosts({ data: {} }) }),
  head: () =>
    buildSeo({
      title: "ÍMPAR — Seu jogo. Seu perfil. Do seu jeito.",
      description:
        "Construa sua identidade gamer no ÍMPAR: perfis, jogos, Códice, Comunidades, conteúdo e pessoas para jogar do seu jeito.",
      path: "/",
    }),
  component: Home,
});

function Home() {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const { user } = useAuth();
  const { posts: initialPosts } = Route.useLoaderData();
  const [posts, setPosts] = useState(initialPosts);
  const [visiblePosts, setVisiblePosts] = useState(6);

  const destinations = [
    {
      to: "/games" as const,
      icon: LibraryBig,
      title: copy("Arquivos", "Archives", "Archivos"),
      body: copy(
        "Jogos, personagens, itens, mapas e sistemas organizados para consulta.",
        "Games, characters, items, maps and systems organized for discovery.",
        "Juegos, personajes, objetos, mapas y sistemas organizados para consultar.",
      ),
      index: "01",
    },
    {
      to: "/codice" as const,
      icon: BookOpen,
      title: copy("Códice", "Codex", "Códice"),
      body: copy(
        "Builds, guias, estratégias e conhecimento criado para ajudar na próxima partida.",
        "Builds, guides, strategies and knowledge built for your next game.",
        "Builds, guías, estrategias y conocimiento para tu próxima partida.",
      ),
      index: "02",
    },
    {
      to: "/communities" as const,
      icon: MessagesSquare,
      title: copy("Comunidades", "Communities", "Comunidades"),
      body: copy(
        "Espaços sociais por jogo para conversar, criar e encontrar gente com a mesma vibe.",
        "Game-based social spaces to talk, create and meet people with the same vibe.",
        "Espacios sociales por juego para hablar, crear y conocer gente con la misma vibra.",
      ),
      index: "03",
    },
    {
      to: "/lfg" as const,
      icon: UsersRound,
      title: copy("Encontrar grupo", "Find a group", "Encontrar grupo"),
      body: copy(
        "LFG por jogo, plataforma e região quando você só precisa completar o squad.",
        "LFG by game, platform and region when you just need to complete the squad.",
        "LFG por juego, plataforma y región cuando solo falta completar el squad.",
      ),
      index: "04",
    },
  ];

  return (
    <div className="impar-shell pb-16">
      <section className="impar-grid impar-home-hero relative isolate overflow-hidden border-b border-border/70">
        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:py-16">
          <div className="animate-fade-in">
            <BrandLogoPlaceholder size="xl" withFullName className="mb-5" />
            <p className="impar-kicker">
              ÍMPAR / {copy("SUA FORMA DE JOGAR", "YOUR WAY TO PLAY", "TU FORMA DE JUGAR")}
            </p>
            <h1 className="mt-5 max-w-3xl text-balance font-display text-[clamp(2.7rem,6vw,5.35rem)] font-bold leading-[0.98] tracking-[-0.045em] text-foreground">
              {copy(
                "Seu jogo. Seu perfil. Do seu jeito.",
                "Your game. Your profile. Your way.",
                "Tu juego. Tu perfil. A tu manera.",
              )}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              {copy(
                "O que você joga faz parte da história. A forma como você monta seu perfil, cria conteúdo, encontra pessoas e vive cada jogo é ÍMPAR.",
                "What you play is part of the story. The way you build your profile, create, meet people and experience each game is ÍMPAR.",
                "Lo que juegas forma parte de la historia. La manera en que construyes tu perfil, creas, conoces gente y vives cada juego es ÍMPAR.",
              )}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {user ? (
                <Link to="/settings/profile" className="brand-button min-h-11 gap-2">
                  {copy("Dar meu toque ao perfil", "Shape my profile", "Dar mi toque al perfil")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : (
                <Link to="/register" className="brand-button min-h-11 gap-2">
                  {copy("Criar meu perfil", "Create my profile", "Crear mi perfil")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}
              <Link to="/codice" className="brand-button-secondary min-h-11 gap-2">
                {copy("Abrir o Códice", "Open the Codex", "Abrir el Códice")}
                <BookOpen className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="impar-card impar-home-noctis-card relative min-h-[20rem] overflow-hidden rounded-[2rem_2rem_0.8rem_2rem] p-5 sm:min-h-[23rem] sm:p-7">
            <div className="impar-noctis-halo absolute inset-0" aria-hidden="true" />
            <div className="relative z-10 grid min-h-[18rem] grid-cols-[minmax(0,1fr)_7rem] gap-3 sm:min-h-[20rem] sm:grid-cols-[minmax(0,1fr)_10.5rem] sm:gap-6">
              <div className="flex min-w-0 flex-col justify-between">
                <div>
                  <div className="impar-home-noctis-badge inline-flex items-center gap-2 rounded-full border border-[var(--impar-line)] bg-black/20 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--impar-spectral)] backdrop-blur">
                    <Sparkles className="size-3.5" aria-hidden="true" />
                    Noctis · {copy("guardião do ÍMPAR", "guardian of ÍMPAR", "guardián de ÍMPAR")}
                  </div>
                  <h2 className="mt-3 max-w-sm font-display text-xl font-semibold leading-tight sm:mt-4 sm:text-3xl">
                    {copy(
                      "Um guia para o seu próprio caminho.",
                      "A guide for your own path.",
                      "Un guía para tu propio camino.",
                    )}
                  </h2>
                  <p className="mt-2 max-w-sm text-[0.8rem] leading-5 text-muted-foreground sm:mt-3 sm:text-sm sm:leading-6">
                    {copy(
                      "Pergunte sobre jogos, builds, sistemas ou o próprio ÍMPAR. Noctis continua sendo a IA da plataforma — agora com uma casa que combina com ele.",
                      "Ask about games, builds, systems or ÍMPAR itself. Noctis remains the platform AI — now with a home that matches him.",
                      "Pregunta sobre juegos, builds, sistemas o el propio ÍMPAR. Noctis sigue siendo la IA de la plataforma, ahora con una casa a su altura.",
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={requestNoctisOpen}
                  className="mt-4 inline-flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-[var(--impar-spectral)] sm:mt-6"
                >
                  {copy("Falar com Noctis", "Talk to Noctis", "Hablar con Noctis")}
                  <ArrowRight className="size-4" />
                </button>
              </div>

              <div className="impar-home-mascot-stage relative flex min-h-40 items-end justify-center sm:min-h-0 sm:justify-end">
                <div
                  className="impar-home-mascot-shadow absolute bottom-2 left-1/2 h-5 w-28 rounded-full bg-black/35 blur-xl sm:bottom-5 sm:w-32"
                  aria-hidden="true"
                />
                <span className="impar-noctis-particle impar-noctis-particle--one" aria-hidden="true" />
                <span className="impar-noctis-particle impar-noctis-particle--two" aria-hidden="true" />
                <span className="impar-noctis-particle impar-noctis-particle--three" aria-hidden="true" />
                <img
                  src="/assets/noctis/noctis-impar-web-hd.webp"
                  alt="Noctis, mascote e IA do ÍMPAR"
                  width={1206}
                  height={1304}
                  loading="eager"
                  decoding="async"
                  className="impar-home-mascot relative z-10 block h-auto w-[6.5rem] max-w-full object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,.38)] sm:w-[11.5rem]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="impar-transition-panel rounded-[1.5rem_1.5rem_0.7rem_1.5rem] p-5 sm:p-6">
          <div className="relative z-10 grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
            <img
              src="/brand/noctis-mark.svg"
              alt="Rosto do Noctis, mascote do ÍMPAR"
              width={256}
              height={256}
              loading="lazy"
              className="size-14 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,.4)] sm:size-16"
            />
            <div>
              <span className="inline-flex rounded-full border border-[var(--impar-line)] bg-black/20 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.13em] text-[var(--impar-spectral)]">
                {copy("Identidade em evolução", "Identity evolving", "Identidad en evolución")}
              </span>
              <h2 className="mt-3 font-display text-2xl font-semibold text-foreground sm:text-3xl">
                {copy("ÍMPAR está em transição", "ÍMPAR is evolving", "ÍMPAR está en transición")}
              </h2>
              <p className="mt-3 max-w-5xl text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
                {copy(
                  "O projeto está passando por uma transição de identidade para refletir melhor sua proposta: ser um espaço de expressão, descoberta e conexão entre jogadores. Mais do que um catálogo de jogos, o ÍMPAR valoriza o perfil de cada pessoa, suas comunidades, seus gostos e sua forma única de viver o universo gamer. Durante esse processo, alguns elementos visuais, nomes e seções ainda podem estar sendo ajustados.",
                  "The project is going through an identity transition to better reflect its purpose: a space for expression, discovery and connection between players. More than a game catalog, ÍMPAR values each person's profile, communities, tastes and unique way of experiencing gaming. During this process, some visual elements, names and sections may still be adjusted.",
                  "El proyecto está pasando por una transición de identidad para reflejar mejor su propósito: ser un espacio de expresión, descubrimiento y conexión entre jugadores. Más que un catálogo de juegos, ÍMPAR valora el perfil de cada persona, sus comunidades, sus gustos y su forma única de vivir el universo gamer. Durante este proceso, algunos elementos visuales, nombres y secciones todavía pueden estar en ajuste.",
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pt-7 sm:px-6 sm:pt-9">
        <div className="impar-destination-grid">
          {destinations.map(({ to, icon: Icon, title, body, index }) => (
            <Link
              key={to}
              to={to}
              className="impar-card impar-card-interactive impar-home-destination group rounded-2xl p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="grid size-9 place-items-center rounded-xl bg-[var(--impar-spectral-soft)] text-[var(--impar-spectral)]">
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <span className="font-mono text-[0.65rem] text-muted-foreground">{index}</span>
              </div>
              <h2 className="mt-4 font-display text-base font-semibold sm:text-lg">{title}</h2>
              <p className="mt-2 hidden text-sm leading-6 text-muted-foreground sm:block">{body}</p>
              <ArrowRight className="mt-4 size-4 text-[var(--impar-amber)] transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      <AdReadyLayout
        className="mx-auto w-full max-w-[92rem] px-4 pt-10 sm:px-6 sm:pt-12"
        rail={<AdSlot id="home-rail" format="rail" />}
      >
        <section>
          <Carousel
            opts={{ align: "start", containScroll: "trimSnaps", loop: false, slidesToScroll: 1 }}
          >
            <div className="mb-5 flex items-end justify-between gap-3">
              <div className="max-w-2xl">
                <p className="impar-kicker">
                  {copy("ARQUIVOS EM DESTAQUE", "FEATURED ARCHIVES", "ARCHIVOS DESTACADOS")}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
                  {copy("Explore seus universos", "Explore your worlds", "Explora tus universos")}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {copy(
                    "Escolha um jogo para acessar guias, builds, comunidades e conteúdos criados para cada experiência.",
                    "Choose a game to access guides, builds, communities and content made for each experience.",
                    "Elige un juego para acceder a guías, builds, comunidades y contenido creado para cada experiencia.",
                  )}
                </p>
              </div>
              <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/70 bg-surface/70 p-1">
                <CarouselPrevious
                  aria-label={copy("Jogo anterior", "Previous game", "Juego anterior")}
                  className="size-9"
                  style={{ position: "static", inset: "auto", width: 36, height: 36, transform: "none" }}
                />
                <CarouselNext
                  aria-label={copy("Próximo jogo", "Next game", "Siguiente juego")}
                  className="size-9"
                  style={{ position: "static", inset: "auto", width: 36, height: 36, transform: "none" }}
                />
              </div>
            </div>
            <CarouselContent>
              {SORTED_GAMES.map((game) => (
                <CarouselItem key={game.slug} className="basis-[82%] sm:basis-[62%] lg:basis-1/2">
                  <GameCard game={game} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </section>

        <section
          className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]"
          aria-label={copy(
            "Atividade da Comunidade ÍMPAR",
            "ÍMPAR community activity",
            "Actividad de la Comunidad ÍMPAR",
          )}
        >
          <div className="space-y-4">
            <div>
              <p className="impar-kicker">
                {copy("COMUNIDADE ÍMPAR", "ÍMPAR COMMUNITY", "COMUNIDAD ÍMPAR")}
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                {copy(
                  "O que a galera está criando",
                  "What people are creating",
                  "Lo que la gente está creando",
                )}
              </h2>
            </div>
            {user && <PostComposer onCreated={(post) => setPosts((prev) => [post, ...prev])} />}
            {posts.length === 0 ? (
              <EmptyState
                title={copy(
                  "Nenhum post ainda. Seja o primeiro a publicar.",
                  "No posts yet. Be the first to publish.",
                  "Todavía no hay posts. Sé el primero en publicar.",
                )}
              />
            ) : (
              posts.slice(0, visiblePosts).map((post) => <PostCard key={post.id} post={post} />)
            )}
            {visiblePosts < posts.length && (
              <button
                type="button"
                className="brand-button-secondary min-h-11"
                onClick={() => setVisiblePosts((n) => n + 6)}
              >
                {copy("Mostrar mais publicações", "Show more posts", "Mostrar más publicaciones")}
              </button>
            )}
          </div>
          <aside className="impar-card h-fit rounded-2xl p-5">
            <UsersRound className="size-5 text-[var(--impar-spectral)]" aria-hidden="true" />
            <h2 className="mt-3 font-semibold">
              {copy(
                "Falta alguém no grupo?",
                "Need one more player?",
                "¿Falta alguien en el equipo?",
              )}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy(
                "Abra o LFG e encontre companhia por jogo, plataforma, região e faixa de grupo.",
                "Open LFG and find players by game, platform and region.",
                "Abre el LFG y encuentra gente por juego, plataforma y región.",
              )}
            </p>
            <Link
              to="/lfg"
              search={{ compose: false, game: "" }}
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--impar-spectral)]"
            >
              {copy("Encontrar grupo", "Find a group", "Encontrar grupo")}
              <ArrowRight className="size-4" />
            </Link>
          </aside>
        </section>

        <AdSlot id="home-after-explore" format="leaderboard" className="mt-8" />
      </AdReadyLayout>

      <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 rounded-[1.15rem_1.15rem_0.5rem_1.15rem] border border-border bg-muted/15 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[var(--impar-amber)]">
              <HeartHandshake className="size-4" aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-[0.12em]">
                {copy(
                  "Projeto independente brasileiro",
                  "Independent Brazilian project",
                  "Proyecto brasileño independiente",
                )}
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy(
                "O ÍMPAR está sendo construído por uma pessoa, com orçamento enxuto. Se a ideia fizer sentido pra você, dá para conhecer a história e ajudar o projeto a continuar crescendo.",
                "ÍMPAR is being built by one person on a small budget. If the idea resonates with you, you can read its story and help it keep growing.",
                "ÍMPAR está siendo construido por una sola persona con un presupuesto pequeño. Si la idea te interesa, puedes conocer su historia y ayudar al proyecto a crecer.",
              )}
            </p>
          </div>
          <Link to="/support" className="brand-button-secondary min-h-11 shrink-0 gap-2">
            {copy("Apoie o ÍMPAR", "Support ÍMPAR", "Apoya ÍMPAR")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
