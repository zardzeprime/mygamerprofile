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
import { GameLivePanel } from "@/components/games/GameLivePanel";
import { GameArtwork } from "@/components/games/GameArtwork";
import { FutureCollection } from "@/components/games/FutureCollection";
import { ChevronRight, Headphones, Shield, Sparkles } from "lucide-react";
import { useSound } from "@/lib/sound";
import { useGameAmbience } from "@/hooks/useGameAmbience";

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
  const { ambienceEnabled } = useSound();
  useGameAmbience(game.visual.ambientAudio);
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
    <div className={cn("game-hub pb-10", game.themeKey === "dark_souls" ? "game-hub-ember" : "game-hub-tactical")}>
      <section className="game-hub-hero relative isolate overflow-hidden border-b border-border">
        <GameArtwork game={game} variant="hero" loading="eager" className="game-hub-artwork absolute inset-0 h-full w-full" />
        <div className="game-hub-scrim absolute inset-0" />
        <div className="relative mx-auto grid min-h-[32rem] w-full max-w-7xl items-end gap-7 px-4 pb-10 pt-24 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)_auto]">
          <div className="hidden aspect-[3/4] overflow-hidden rounded-md border border-hero-border shadow-lift lg:block"><img src={game.visual.coverImage} alt="" width={1600} height={1000} className="h-full w-full object-cover" /></div>
          <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-hero-muted"><span>MGP</span><ChevronRight className="size-3" /><span>{game.genre}</span></div>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-hero-foreground sm:text-6xl">{game.name}</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-hero-muted sm:text-base">{game.description[locale]}</p>
          <ul className="mt-5 flex flex-wrap gap-1.5">
            <li className="rounded-sm border border-hero-border bg-hero-surface px-2.5 py-1 text-xs font-semibold text-hero-muted backdrop-blur">
              {t("games.ageRating")}: {game.ageRating}
            </li>
            {game.platforms.map((platform) => (
              <li
                key={platform}
                className="rounded-sm border border-hero-border bg-hero-surface px-2.5 py-1 text-xs font-medium text-hero-muted backdrop-blur"
              >
                {platform}
              </li>
            ))}
          </ul>
          </div>
          <div className="flex items-center gap-2 self-end text-xs font-medium text-hero-muted"><Headphones className="size-4 text-gold" />{ambienceEnabled ? (locale === "pt-BR" ? "Ambiente habilitado" : "Ambience enabled") : (locale === "pt-BR" ? "Ambiente disponível" : "Ambience available")}</div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
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
                "hub-tab shrink-0 px-3.5 py-3 text-sm font-semibold transition-colors",
                active === moduleKey
                   ? "hub-tab-active text-gold-strong"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {MODULE_LABELS[moduleKey][locale]}
            </button>
          ))}
        </div>

        <div className="py-8">
          {active === "overview" ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="space-y-5">
                <article className="surface-panel p-6 sm:p-8">
                  <div className="mb-5 flex items-center gap-2"><Sparkles className="size-4 text-gold-strong" /><span className="section-kicker">{locale === "pt-BR" ? "IDENTIDADE DO JOGO" : "GAME IDENTITY"}</span></div>
                  <h2 className="font-display text-2xl font-semibold text-foreground">{MODULE_LABELS.overview[locale]}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{game.description[locale]}</p>
                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    <Feature icon={Shield} label={locale === "pt-BR" ? "Game Profiles" : "Game Profiles"} />
                    <Feature icon={Sparkles} label={locale === "pt-BR" ? "Comunidade" : "Community"} />
                    <Feature icon={Headphones} label="LFG" />
                  </div>
                </article>
                <EmptyState title={locale === "pt-BR" ? "Conteúdo da comunidade em preparação" : "Community content in preparation"} description={locale === "pt-BR" ? "Este espaço crescerá com perfis, guias e atividade real." : "This space will grow with profiles, guides and real activity."} />
              </div>
              <GameLivePanel themeKey={game.themeKey} locale={locale} />
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
            <FutureCollection moduleKey={active} themeKey={game.themeKey} locale={locale} />
          )}
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof Shield; label: string }) {
  return <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-4 py-3"><Icon className="size-4 text-gold-strong" /><span className="text-sm font-semibold">{label}</span></div>;
}
