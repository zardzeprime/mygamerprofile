import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Gamepad2,
  MessagesSquare,
  Compass,
  UsersRound,
  HeartHandshake,
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { AdReadyLayout, AdSlot } from "@/components/common/AdSlot";
import { GameCard } from "@/components/games/GameCard";
import { GameArtwork } from "@/components/games/GameArtwork";
import { ACTIVE_GAMES } from "@/config/gameAvailability";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { useAuth } from "@/hooks/useAuth";
import { listPosts } from "@/lib/posts.functions";
import { PostCard } from "@/components/posts/PostCard";
import { PostComposer } from "@/components/posts/PostComposer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState } from "react";

const SORTED_GAMES = [...ACTIVE_GAMES].sort((a, b) =>
  a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
);

export const Route = createFileRoute("/")({
  loader: async () => ({ posts: await listPosts({ data: {} }) }),
  head: () => ({
    meta: [
      { title: "MG Profile — Seu próximo jogo começa aqui" },
      {
        name: "description",
        content:
          "Explore jogos, confira setups do competitivo e encontre sua comunidade no MG Profile.",
      },
      { property: "og:title", content: "MG Profile — Seu próximo jogo começa aqui" },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const { user } = useAuth();
  const { posts: initialPosts } = Route.useLoaderData();
  const [posts, setPosts] = useState(initialPosts);
  const [visiblePosts, setVisiblePosts] = useState(6);
  const destinations = [
    {
      to: "/games" as const,
      icon: Gamepad2,
      title: copy("Escolha seu universo", "Pick your world", "Elige tu universo"),
      body: copy(
        "Guias, coleções e os detalhes que mudam sua partida.",
        "Guides, collections and the details that change your game.",
        "Guías, colecciones y los detalles que cambian tu partida.",
      ),
    },
    {
      to: "/communities" as const,
      icon: MessagesSquare,
      title: copy("Encontre sua comunidade", "Find your community", "Encuentra tu comunidad"),
      body: copy(
        "Troque ideias com quem joga os mesmos jogos.",
        "Trade ideas with people who play your games.",
        "Comparte ideas con quienes juegan a lo mismo.",
      ),
    },
    {
      to: "/lfg" as const,
      icon: UsersRound,
      title: copy("Complete o grupo", "Find your squad", "Completa tu equipo"),
      body: copy(
        "Procure companhia por jogo, plataforma e região.",
        "Find players by game, platform and region.",
        "Busca compañía por juego, plataforma y región.",
      ),
    },
  ];
  return (
    <div className="pb-16">
      <section className="relative isolate overflow-hidden border-b border-border bg-surface">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-gold-soft),transparent_65%)] opacity-50"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-12">
          <div className="animate-fade-in">
            <p className="section-kicker">
              MG PROFILE / {copy("ENTRE NO JOGO", "GET INTO THE GAME", "ENTRA EN EL JUEGO")}
            </p>
            <h1 className="mt-5 max-w-2xl text-balance font-display text-[clamp(2.25rem,5vw,4.5rem)] font-bold leading-[1.08] tracking-tight text-foreground">
              {copy(
                "Seu próximo jogo começa aqui.",
                "Your next game starts here.",
                "Tu próxima partida empieza aquí.",
              )}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              {copy(
                "Da build ao time que você acompanha. Explore seus jogos, confira setups e encontre gente para a próxima partida.",
                "From your next build to the team you follow. Explore your games, check out setups and find people for the next match.",
                "De tu próxima build al equipo que sigues. Explora tus juegos, descubre setups y encuentra gente para la próxima partida.",
              )}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/games" className="brand-button min-h-11 gap-2">
                {t("home.cta.exploreGames")}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              {user ? (
                <Link to="/settings/profile" className="brand-button-secondary min-h-11">
                  {copy("Editar meu perfil", "Edit my profile", "Editar mi perfil")}
                </Link>
              ) : (
                <Link to="/register" className="brand-button-secondary min-h-11">
                  {t("home.cta.createProfile")}
                </Link>
              )}
            </div>
          </div>
          <div
            className="grid grid-cols-2 gap-3"
            aria-label={copy("Atalhos para os jogos", "Game shortcuts", "Accesos a los juegos")}
          >
            {SORTED_GAMES.map((game, index) => (
              <Link
                key={game.slug}
                to="/games/$slug"
                params={{ slug: game.slug }}
                className="group relative isolate min-h-32 overflow-hidden rounded-2xl border border-border bg-black sm:min-h-40 motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <GameArtwork
                  game={game}
                  variant="hero"
                  loading={index < 2 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full opacity-70 motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="relative flex h-full min-h-32 flex-col justify-end p-4 sm:min-h-40">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-white/70">
                    {game.genre}
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-2 text-sm font-semibold text-white">
                    {game.name}
                    <ArrowRight className="size-4 shrink-0 text-gold" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <AdReadyLayout className="mx-auto w-full max-w-[92rem] px-4 pt-6 sm:px-6 sm:pt-8" rail={<AdSlot id="home-rail" format="rail" />}>
      <Tabs defaultValue="games" className="w-full">
        <TabsList
          className="grid h-auto w-full grid-cols-3 gap-1 rounded-2xl p-1.5 sm:max-w-lg"
          aria-label={copy("Explore o MG Profile", "Explore MG Profile", "Explora MG Profile")}
        >
          <TabsTrigger value="games" className="min-h-11 gap-2">
            <Gamepad2 className="hidden size-4 sm:block" aria-hidden="true" />
            {t("navigation.games")}
          </TabsTrigger>
          <TabsTrigger value="community" className="min-h-11 gap-2">
            <MessagesSquare className="hidden size-4 sm:block" aria-hidden="true" />
            {copy("Comunidade", "Community", "Comunidad")}
          </TabsTrigger>
          <TabsTrigger value="discover" className="min-h-11 gap-2">
            <Compass className="hidden size-4 sm:block" aria-hidden="true" />
            {copy("Descobrir", "Discover", "Descubrir")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="games" className="pt-6 motion-safe:animate-fade-in">
          <Carousel
            opts={{ align: "start", containScroll: "trimSnaps", loop: false, slidesToScroll: 1 }}
            aria-label={t("home.featured.title")}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold sm:text-2xl">
                {t("home.featured.title")}
              </h2>
              <div className="flex shrink-0 gap-2">
                <CarouselPrevious
                  aria-label={copy("Jogo anterior", "Previous game", "Juego anterior")}
                  className="static size-11 translate-y-0"
                />
                <CarouselNext
                  aria-label={copy("Próximo jogo", "Next game", "Siguiente juego")}
                  className="static size-11 translate-y-0"
                />
              </div>
            </div>
            <CarouselContent>
              {SORTED_GAMES.map((game) => (
                <CarouselItem key={game.slug} className="basis-[88%] sm:basis-[68%] lg:basis-1/2">
                  <GameCard game={game} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </TabsContent>
        <TabsContent value="community" className="pt-6 motion-safe:animate-fade-in">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <section className="space-y-4" aria-label={t("home.activity.title")}>
              <h2 className="font-display text-xl font-semibold">{t("home.activity.title")}</h2>
              {user && <PostComposer onCreated={(post) => setPosts((prev) => [post, ...prev])} />}
              {posts.length === 0 ? (
                <EmptyState title={t("home.activity.empty")} />
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
            </section>
            <aside className="surface-panel h-fit p-5">
              <UsersRound className="size-5 text-gold-strong" aria-hidden="true" />
              <h2 className="mt-3 font-semibold">
                {copy(
                  "Falta alguém no grupo?",
                  "Need one more player?",
                  "¿Falta alguien en el equipo?",
                )}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {destinations[2]?.body}
              </p>
              <Link
                to="/lfg"
                search={{}}
                className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gold-strong"
              >
                {copy("Buscar grupo", "Find a group", "Buscar grupo")}
                <ArrowRight className="size-4" />
              </Link>
            </aside>
          </div>
        </TabsContent>
        <TabsContent value="discover" className="pt-6 motion-safe:animate-fade-in">
          <h2 className="font-display text-xl font-semibold">
            {copy("Qual é o próximo passo?", "Where to next?", "¿Cuál es el siguiente paso?")}
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {destinations.map(({ to, icon: Icon, title, body }, i) => (
              <Link
                key={to}
                to={to}
                className="surface-panel group p-6 transition-colors hover:border-gold/50"
              >
                <div className="flex items-center justify-between">
                  <Icon className="size-6 text-gold-strong" aria-hidden="true" />
                  <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                <ArrowRight
                  className="mt-5 size-5 text-gold-strong motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <AdSlot id="home-after-explore" format="leaderboard" className="mt-8" />
      </AdReadyLayout>

      <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 rounded-[1.15rem_1.15rem_0.5rem_1.15rem] border border-border bg-muted/15 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-gold-strong">
              <HeartHandshake className="size-4" aria-hidden="true" />
              <p className="text-xs font-bold uppercase tracking-[0.12em]">
                {copy("Projeto independente", "Independent project", "Proyecto independiente")}
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy(
                "O MGP está sendo construído por uma pessoa, com orçamento enxuto. Se a ideia fizer sentido pra você, dá para conhecer a história do projeto e ajudar no desenvolvimento.",
                "MGP is being built by one person on a small budget. If the idea resonates with you, you can read the project's story and help its development.",
                "MGP está siendo construido por una sola persona con un presupuesto pequeño. Si la idea te interesa, puedes conocer la historia y ayudar al desarrollo.",
              )}
            </p>
          </div>
          <Link to="/support" className="brand-button-secondary min-h-11 shrink-0 gap-2">
            {copy("Apoie o MGP", "Support MGP", "Apoya MGP")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
