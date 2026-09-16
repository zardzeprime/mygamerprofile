import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gamepad2, Trophy, Users2, UsersRound } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { GameCard } from "@/components/games/GameCard";
import { GameArtwork } from "@/components/games/GameArtwork";
import { GAMES } from "@/config/games";
import { useI18n } from "@/i18n";
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

const SORTED_GAMES = [...GAMES].sort((first, second) =>
  first.name.localeCompare(second.name, "en", { sensitivity: "base" }),
);

export const Route = createFileRoute("/")({
  loader: async () => {
    const posts = await listPosts({ data: {} });
    return { posts };
  },
  head: () => ({
    meta: [
      { title: "MG Profile — Sua identidade nos jogos" },
      {
        name: "description",
        content:
          "Crie seu perfil gamer, monte Game Profiles por jogo, siga jogadores, participe de comunidades e encontre grupo no LFG.",
      },
      { property: "og:title", content: "MG Profile — Sua identidade nos jogos" },
      {
        property: "og:description",
        content:
          "Crie seu perfil gamer, monte Game Profiles por jogo, siga jogadores e encontre grupo no LFG.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { posts: initialPosts } = Route.useLoaderData();
  const [posts, setPosts] = useState(initialPosts);

  const discover = [
    {
      icon: Gamepad2,
      title: t("home.discover.profiles.title"),
      body: t("home.discover.profiles.body"),
    },
    {
      icon: Users2,
      title: t("home.discover.communities.title"),
      body: t("home.discover.communities.body"),
    },
    { icon: UsersRound, title: t("home.discover.lfg.title"), body: t("home.discover.lfg.body") },
  ];

  return (
    <div className="pb-16">
      <section className="home-hero relative isolate min-h-[min(76vh,46rem)] overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid grid-cols-2" aria-hidden="true">
          {GAMES[0] ? (
            <GameArtwork
              game={GAMES[0]}
              variant="hero"
              loading="eager"
              className="h-full w-full opacity-70"
            />
          ) : null}
          {GAMES[1] ? (
            <GameArtwork
              game={GAMES[1]}
              variant="hero"
              loading="eager"
              className="h-full w-full opacity-65"
            />
          ) : null}
        </div>
        <div className="home-hero-scrim absolute inset-0" />
        <div className="relative mx-auto flex min-h-[min(76vh,46rem)] w-full max-w-7xl items-end px-4 pb-14 pt-28 sm:px-6 sm:pb-20">
          <div className="max-w-3xl animate-fade-in">
            <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase text-gold">
              <Trophy className="size-4" />
              {t("brand.full")}
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.05] text-hero-foreground sm:text-6xl lg:text-7xl">
              {t("home.hero.title")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-hero-muted sm:text-lg">
              {t("home.hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <>
                  <Link to="/settings/profile" className="brand-button">
                    {t("home.cta.myProfile")}
                  </Link>
                  <Link to="/games" className="brand-button-secondary">
                    {t("home.cta.exploreGames")}
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="brand-button">
                    {t("home.cta.createProfile")}
                  </Link>
                  <Link to="/login" className="brand-button-secondary">
                    {t("home.cta.login")}
                  </Link>
                  <Link to="/games" className="brand-button-secondary">
                    {t("home.cta.exploreGames")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <section className="py-14" aria-labelledby="featured-games">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-kicker">MG PROFILE / 01</p>
              <h2
                id="featured-games"
                className="mt-2 font-display text-2xl font-semibold text-foreground sm:text-3xl"
              >
                {t("home.featured.title")}
              </h2>
            </div>
            <Link
              to="/games"
              className="hidden items-center gap-2 text-sm font-semibold text-gold-strong sm:flex"
            >
              {t("home.cta.exploreGames")}
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <Carousel
            opts={{ align: "start", containScroll: "trimSnaps", loop: false, slidesToScroll: 1 }}
            className="mt-7"
            aria-label={t("home.featured.title")}
          >
            <CarouselContent className="ml-0">
              {SORTED_GAMES.map((game) => (
                <CarouselItem
                  key={game.slug}
                  className="basis-[88%] pl-0 pr-4 sm:basis-[70%] lg:basis-1/2"
                >
                  <GameCard game={game} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-top-12 left-auto right-11 translate-y-0 border-border bg-surface-elevated shadow-soft disabled:opacity-35 sm:-top-11" />
            <CarouselNext className="-top-12 right-0 translate-y-0 border-border bg-surface-elevated shadow-soft disabled:opacity-35 sm:-top-11" />
          </Carousel>
        </section>

        <section className="border-t border-border py-14" aria-labelledby="community-activity">
          <h2
            id="community-activity"
            className="font-display text-2xl font-semibold text-foreground"
          >
            {t("home.activity.title")}
          </h2>
          <div className="mt-5 space-y-4">
            {user && <PostComposer onCreated={(post) => setPosts((prev) => [post, ...prev])} />}
            {posts.length === 0 ? (
              <EmptyState title={t("home.activity.empty")} />
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </section>

        <section className="border-t border-border py-14" aria-labelledby="discover-mg-profile">
          <h2
            id="discover-mg-profile"
            className="font-display text-2xl font-semibold text-foreground"
          >
            {t("home.discover.title")}
          </h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {discover.map(({ icon: Icon, title, body }) => (
              <article key={title} className="surface-panel p-5">
                <span className="grid size-10 place-items-center rounded-full bg-gold-soft/60 text-gold-strong">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
