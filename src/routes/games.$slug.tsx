import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Building2,
  CalendarDays,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Star,
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { MODULE_LABELS, getGameConfig, type GameModuleKey } from "@/config/games";
import { GAME_EDITORIAL_OVERVIEW } from "@/data/gameEditorialOverview";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";
import { GameLivePanel } from "@/components/games/GameLivePanel";
import { GameArtwork } from "@/components/games/GameArtwork";
import { FutureCollection } from "@/components/games/FutureCollection";
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
    const title = `${loaderData.game.name} — MGP`;
    const description = `Informações, guias, builds e conteúdo editorial de ${loaderData.game.name} no MGP.`;
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
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const panelRef = useRef<HTMLDivElement>(null);
  useGameAmbience(game.visual.ambientAudio);

  const [active, setActive] = useState<GameModuleKey>("overview");
  const visibleModules = useMemo(
    () => game.modules.filter((moduleKey) => moduleKey !== "community" && moduleKey !== "lfg"),
    [game.modules],
  );
  const editorial = GAME_EDITORIAL_OVERVIEW[game.slug];

  const handleTab = (moduleKey: GameModuleKey, scrollToPanel = false) => {
    setActive(moduleKey);
    if (!scrollToPanel) return;

    requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panelRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  };

  return (
    <div className={cn("game-hub pb-10", game.themeKey === "dark_souls" ? "game-hub-ember" : "game-hub-tactical")}>
      <section className="game-hub-hero relative isolate overflow-hidden border-b border-border">
        <GameArtwork
          game={game}
          variant="hero"
          loading="eager"
          className="game-hub-artwork absolute inset-0 h-full w-full"
        />
        <div className="game-hub-scrim absolute inset-0" />
        <div className="game-hub-grain absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[32rem] w-full max-w-7xl items-end gap-7 px-4 pb-10 pt-24 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <div className="group hidden aspect-[3/4] overflow-hidden rounded-lg border border-hero-border bg-hero-surface shadow-lift lg:block">
            <GameArtwork game={game} variant="card" className="h-full w-full" />
          </div>
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-hero-muted">
              <span>MGP</span>
              <ChevronRight className="size-3" />
              <span>{game.genre}</span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-hero-foreground sm:text-6xl">
              {game.name}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-hero-muted sm:text-base">
              {game.description[locale]}
            </p>
            <ul className="mt-5 flex flex-wrap gap-1.5">
              <li className="rounded-full border border-hero-border bg-hero-surface px-3 py-1 text-xs font-semibold text-hero-muted backdrop-blur">
                {t("games.ageRating")}: {game.ageRating}
              </li>
              {game.platforms.map((platform) => (
                <li
                  key={platform}
                  className="rounded-full border border-hero-border bg-hero-surface px-3 py-1 text-xs font-medium text-hero-muted backdrop-blur"
                >
                  {platform}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div
          role="tablist"
          aria-label={game.name}
          className="hub-tablist -mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 py-3 sm:mx-0 sm:px-0"
        >
          {visibleModules.map((moduleKey) => {
            const selected = active === moduleKey;
            return (
              <button
                key={moduleKey}
                id={`hub-tab-${moduleKey}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="hub-panel-content"
                tabIndex={selected ? 0 : -1}
                onClick={() => handleTab(moduleKey)}
                className={cn(
                  "hub-tab shrink-0 px-3.5 py-3 text-sm font-semibold",
                  selected ? "hub-tab-active text-foreground" : "text-muted-foreground",
                )}
              >
                <span>{MODULE_LABELS[moduleKey][locale]}</span>
              </button>
            );
          })}
        </div>

        <div
          ref={panelRef}
          id="hub-panel-content"
          role="tabpanel"
          aria-labelledby={`hub-tab-${active}`}
          className="scroll-mt-24 py-8 outline-none"
        >
          {active === "overview" ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <article className="surface-panel p-6 sm:p-8">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-gold-strong" />
                  <span className="section-kicker">
                    {copy("FICHA DO JOGO", "GAME PROFILE", "FICHA DEL JUEGO")}
                  </span>
                </div>

                <div className="mt-4 grid gap-7 xl:grid-cols-[minmax(0,1fr)_13rem]">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-foreground">
                      {copy("Sobre o jogo", "About the game", "Sobre el juego")}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
                      {editorial?.synopsis[locale] ?? game.description[locale]}
                    </p>

                    {editorial ? (
                      <div className="mt-7 grid gap-3 sm:grid-cols-2">
                        <GameFact
                          icon={CalendarDays}
                          label={copy("Lançamento", "Release", "Lanzamiento")}
                          value={editorial.release[locale]}
                        />
                        <GameFact
                          icon={Building2}
                          label={copy("Desenvolvimento", "Developer", "Desarrollo")}
                          value={editorial.developer}
                        />
                        <GameFact
                          icon={Building2}
                          label={copy("Publicação", "Publisher", "Publicación")}
                          value={editorial.publisher}
                        />
                        <GameFact
                          icon={RefreshCw}
                          label={copy("Última atualização oficial", "Latest official update", "Última actualización oficial")}
                          value={editorial.latestUpdate[locale]}
                        />
                      </div>
                    ) : null}
                  </div>

                  {editorial?.score ? (
                    <div className="self-start rounded-2xl border border-gold/25 bg-[radial-gradient(circle_at_top,rgba(212,167,44,0.14),transparent_65%),hsl(var(--muted)/0.2)] p-5 text-center">
                      <Star className="mx-auto size-5 fill-current text-gold-strong" />
                      <p className="mt-3 font-display text-4xl font-bold text-foreground">
                        {editorial.score.value.toFixed(1)}
                        <span className="text-base font-semibold text-muted-foreground">/10</span>
                      </p>
                      <p className="mt-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        {copy("Média de referência", "Reference average", "Promedio de referencia")}
                      </p>
                      <p className="mt-3 text-xs leading-5 text-muted-foreground">{editorial.score.sourceLabel}</p>
                      <p className="mt-2 text-[0.7rem] leading-5 text-muted-foreground">{editorial.score.note[locale]}</p>
                    </div>
                  ) : null}
                </div>
              </article>

              <GameLivePanel
                gameSlug={game.slug}
                themeKey={game.themeKey}
                locale={locale}
                onOpenModule={(moduleKey) => handleTab(moduleKey, true)}
              />
            </div>
          ) : (
            <FutureCollection moduleKey={active} themeKey={game.themeKey} locale={locale} />
          )}
        </div>
      </div>
    </div>
  );
}

function GameFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-center gap-2 text-gold-strong">
        <Icon className="size-4" />
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold leading-6 text-foreground">{value}</p>
    </div>
  );
}
