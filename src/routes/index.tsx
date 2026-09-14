import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2, Users2, UsersRound } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { GameCard } from "@/components/games/GameCard";
import { GAMES } from "@/config/games";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { listPosts, createPost } from "@/lib/posts.functions";
import { PostCard } from "@/components/posts/PostCard";
import { PostComposer } from "@/components/posts/PostComposer";
import { useState } from "react";

export const Route = createFileRoute("/")({
  loader: async () => {
    const posts = await listPosts();
    return { posts };
  },
  head: () => ({
    meta: [
      { title: "MGP — Sua identidade nos jogos" },
      {
        name: "description",
        content:
          "Crie seu perfil gamer, monte Game Profiles por jogo, siga jogadores, participe de comunidades e encontre grupo no LFG.",
      },
      { property: "og:title", content: "MGP — Sua identidade nos jogos" },
      {
        property: "og:description",
        content: "Crie seu perfil gamer, monte Game Profiles por jogo, siga jogadores e encontre grupo no LFG.",
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
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="surface-panel relative overflow-hidden px-6 py-12 sm:px-10 sm:py-16">
        <span aria-hidden="true" className="hub-atmosphere-valorant absolute inset-0 opacity-10" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-strong">
            {t("brand.full")}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            {t("home.hero.title")}
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">{t("home.hero.subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <>
                <Link
                  to="/settings/profile"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {t("home.cta.myProfile")}
                </Link>
                <Link
                  to="/games"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {t("home.cta.exploreGames")}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {t("home.cta.createProfile")}
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {t("home.cta.login")}
                </Link>
                <Link
                  to="/games"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {t("home.cta.exploreGames")}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="featured-games">
        <h2 id="featured-games" className="font-display text-2xl font-semibold text-foreground">
          {t("home.featured.title")}
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {GAMES.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="community-activity">
        <h2 id="community-activity" className="font-display text-2xl font-semibold text-foreground">
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

      <section className="mt-14" aria-labelledby="discover-mgp">
        <h2 id="discover-mgp" className="font-display text-2xl font-semibold text-foreground">
          {t("home.discover.title")}
        </h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {discover.map(({ icon: Icon, title, body }) => (
            <article key={title} className="surface-panel p-5">
              <span className="grid size-10 place-items-center rounded-full bg-gold-soft/60 text-gold-strong">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
