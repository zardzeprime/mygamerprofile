import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { MODULE_LABELS, getGameConfig, type GameModuleKey } from "@/config/games";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { listPosts } from "@/lib/posts.functions";
import { listLfgPosts } from "@/lib/lfg.functions";
import { PostCard } from "@/components/posts/PostCard";
import { PostComposer } from "@/components/posts/PostComposer";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/games/$slug")({
  loader: async ({ params }) => {
    const game = getGameConfig(params.slug);
    if (!game) throw notFound();
    return { game };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Jogo não encontrado — MGP" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.game.name} — Hub MGP`;
    const description = `Comunidade, Game Profiles e LFG de ${loaderData.game.name} no MGP.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: GameHub,
  notFoundComponent: () => <HubMissing />,
});

function HubMissing() {
  const { t } = useI18n();
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <EmptyState
        title={t("games.empty")}
        action={
          <Link
            to="/games"
            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            {t("navigation.games")}
          </Link>
        }
      />
    </div>
  );
}

function GameHub() {
  const { game } = Route.useLoaderData();
  const { locale, t } = useI18n();
  const { user } = useAuth();
  const [active, setActive] = useState<GameModuleKey>("overview");
  const [posts, setPosts] = useState<any[]>([]);
  const [lfgPosts, setLfgPosts] = useState<any[]>([]);
  const [loaded, setLoaded] = useState<Record<GameModuleKey, boolean>>({ overview: true, community: false, lfg: false, builds: false, bosses: false, guides: false, agents: false, competitive: false, clips: false });

  const loadCommunity = async () => {
    if (loaded.community) return;
    const rows = await listPosts({ data: { gameId: game.id } });
    setPosts(rows);
    setLoaded((l) => ({ ...l, community: true }));
  };

  const loadLfg = async () => {
    if (loaded.lfg) return;
    const rows = await listLfgPosts({ data: { gameId: game.id } });
    setLfgPosts(rows);
    setLoaded((l) => ({ ...l, lfg: true }));
  };

  const handleTab = (moduleKey: GameModuleKey) => {
    setActive(moduleKey);
    if (moduleKey === "community") loadCommunity();
    if (moduleKey === "lfg") loadLfg();
  };

  return (
    <div className="pb-6">
      <section
        className={cn(
          "border-b border-border",
          game.themeKey === "dark_souls" ? "hub-atmosphere-dark-souls" : "hub-atmosphere-valorant",
        )}
      >
        <div className="mx-auto w-full max-w-6xl bg-background/70 px-4 py-12 backdrop-blur-sm sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-strong">{game.genre}</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">{game.name}</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">{game.description[locale]}</p>
          <ul className="mt-5 flex flex-wrap gap-1.5">
            <li className="rounded-full border border-border-strong px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {t("games.ageRating")}: {game.ageRating}
            </li>
            {game.platforms.map((platform) => (
              <li
                key={platform}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {platform}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div
          role="tablist"
          aria-label={game.name}
          className="-mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 py-3 sm:mx-0 sm:px-0"
        >
          {game.modules.map((moduleKey) => (
            <button
              key={moduleKey}
              type="button"
              role="tab"
              aria-selected={active === moduleKey}
              onClick={() => handleTab(moduleKey)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                active === moduleKey
                  ? "bg-gold-soft text-gold-strong"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {MODULE_LABELS[moduleKey][locale]}
            </button>
          ))}
        </div>

        <div className="py-8">
          {active === "overview" ? (
            <div className="grid gap-5 lg:grid-cols-3">
              <article className="surface-panel p-6 lg:col-span-2">
                <h2 className="font-display text-lg font-semibold text-foreground">{MODULE_LABELS.overview[locale]}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{game.description[locale]}</p>
              </article>
              <aside className="surface-panel p-6">
                <h2 className="font-display text-lg font-semibold text-foreground">{t("profile.games")}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{t("common.comingSoon")}</p>
              </aside>
            </div>
          ) : active === "community" ? (
            <div className="space-y-4">
              {user && <PostComposer gameId={game.id} onCreated={(post) => setPosts((prev) => [post, ...prev])} />}
              {posts.length === 0 ? (
                <EmptyState title={t("home.activity.empty")} />
              ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>
          ) : active === "lfg" ? (
            <div className="space-y-4">
              {lfgPosts.length === 0 ? (
                <EmptyState title={t("common.empty")} />
              ) : (
                lfgPosts.map((post) => (
                  <article key={post.id} className="surface-panel rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar src={post.author?.avatar_url} name={post.author?.display_name} size="md" />
                      <div>
                        <p className="font-semibold">{post.author?.display_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {post.platform} · {post.mode}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{post.description}</p>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/u/$username" params={{ username: post.author?.username ?? "" }}>
                          {t("lfg.viewProfile")}
                        </Link>
                      </Button>
                    </div>
                  </article>
                ))
              )}
            </div>
          ) : (
            <EmptyState title={MODULE_LABELS[active][locale]} description={t("common.comingSoon")} />
          )}
        </div>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
