import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  Menu,
  RefreshCw,
  Sparkles,
  Star,
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { MODULE_LABELS, getGameConfig, type GameModuleKey, type GameConfig } from "@/config/games";
import { isGameActive } from "@/config/gameAvailability";
import { GAME_EDITORIAL_OVERVIEW } from "@/data/gameEditorialOverview";
import { useI18n, type Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";
import { GameLivePanel } from "@/components/games/GameLivePanel";
import { GameArtwork } from "@/components/games/GameArtwork";
import { FutureCollection } from "@/components/games/FutureCollection";
import { LeagueEsportsPanel } from "@/components/games/LeagueEsportsPanel";
import { RiotPlayerSearch } from "@/components/games/RiotPlayerSearch";
import { useGameAmbience } from "@/hooks/useGameAmbience";

export const Route = createFileRoute("/games/$slug")({
  loader: async ({ params }) => {
    const game = getGameConfig(params.slug);
    if (!game) throw notFound();
    return { game };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Jogo não encontrado — MG Profile" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.game.name} — MG Profile`;
    const description = `Informações, guias, builds e conteúdo editorial de ${loaderData.game.name} no MG Profile.`;
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
  const activeHub = isGameActive(game.slug);
  useGameAmbience(activeHub ? game.visual.ambientAudio : undefined);

  const [active, setActive] = useState<GameModuleKey>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const visibleModules = useMemo(() => {
    const modules = game.modules.filter(
      (moduleKey) => moduleKey !== "community" && moduleKey !== "lfg",
    );
    if (game.slug !== "league-of-legends") return modules;

    return Array.from(
      new Set(modules.map((moduleKey) => (moduleKey === "maps" ? "modes" : moduleKey))),
    ) as GameModuleKey[];
  }, [game.modules, game.slug]);
  useEffect(() => { setActive("overview"); setMobileMenuOpen(false); }, [game.slug]);
  const editorial = GAME_EDITORIAL_OVERVIEW[game.slug];

  const handleTab = (moduleKey: GameModuleKey, scrollToPanel = false) => {
    setActive(moduleKey);
    if (!scrollToPanel) return;

    requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panelRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  if (!activeHub) {
    return <PausedGameHub game={game} locale={locale} />;
  }

  const hasRiotLookup = game.slug === "valorant" || game.slug === "league-of-legends";

  return (
    <div
      className={cn(
        "game-hub overflow-x-clip pb-10",
        game.themeKey === "dark_souls" ? "game-hub-ember" : "game-hub-tactical",
      )}
    >
      <section className="game-hub-hero relative isolate overflow-hidden border-b border-border">
        <GameArtwork
          game={game}
          variant="hero"
          loading="eager"
          className="game-hub-artwork absolute inset-0 h-full w-full"
        />
        <div className="game-hub-scrim absolute inset-0" />
        <div className="game-hub-grain absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[26rem] w-full max-w-7xl items-end gap-7 px-4 pb-7 pt-20 sm:min-h-[32rem] sm:px-6 sm:pb-10 sm:pt-24 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <div className="group hidden aspect-[3/4] overflow-hidden rounded-lg border border-hero-border bg-hero-surface shadow-lift lg:block">
            <GameArtwork game={game} variant="card" className="h-full w-full" />
          </div>
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-hero-muted">
              <span>MG Profile</span>
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

            {game.expansions?.length ? (
              <div
                className="mt-4 flex flex-wrap items-center gap-2"
                aria-label={copy("Expansões e DLCs", "Expansions and DLC", "Expansiones y DLC")}
              >
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-hero-muted">
                  {copy("Conteúdo adicional", "Additional content", "Contenido adicional")}
                </span>
                {game.expansions.map((expansion) => (
                  <span
                    key={expansion.slug}
                    className="rounded-full border border-hero-border bg-hero-surface px-3 py-1 text-[0.7rem] font-semibold text-hero-foreground backdrop-blur"
                    title={expansion.kind}
                  >
                    {expansion.name}
                    {expansion.releaseLabel ? ` · ${expansion.releaseLabel}` : ""}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto min-w-0 w-full max-w-7xl px-4 sm:px-6">
        <div className="sticky top-[4.25rem] z-30 -mx-2 py-2 md:hidden">
          <div className="max-h-[calc(100dvh-5.25rem)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-background/96 p-2 shadow-lift backdrop-blur-lg">
            <button
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-hub-navigation"
              onClick={() => setMobileMenuOpen((value) => !value)}
              className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gold/10 text-gold-strong">
                  <Menu className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {copy("Navegar no hub", "Browse hub", "Navegar por el hub")}
                  </span>
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {MODULE_LABELS[active][locale]}
                  </span>
                </span>
              </span>
              <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", mobileMenuOpen && "rotate-180")} />
            </button>
            {mobileMenuOpen ? (
              <div id="mobile-hub-navigation" role="group" aria-label={game.name} className="mt-1 grid grid-cols-2 gap-1 border-t border-border pt-2">
                {visibleModules.map((moduleKey) => {
                  const selected = active === moduleKey;
                  return (
                    <button
                      key={moduleKey}
                      type="button"
                      aria-pressed={selected}
                      aria-controls="hub-panel-content"
                      onClick={() => {
                        handleTab(moduleKey, true);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "min-h-11 min-w-0 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition-colors",
                        selected ? "bg-gold/10 text-foreground" : "text-muted-foreground hover:bg-muted/35 hover:text-foreground",
                      )}
                    >
                      <span className="block truncate">{MODULE_LABELS[moduleKey][locale]}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div
          role="tablist"
          aria-label={game.name}
          className="hub-tablist hidden gap-1 overflow-x-auto border-b border-border py-3 md:flex"
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
                onKeyDown={(event) => {
                  const index = visibleModules.indexOf(moduleKey);
                  let next = index;
                  if (event.key === "ArrowRight") next = (index + 1) % visibleModules.length;
                  else if (event.key === "ArrowLeft") next = (index - 1 + visibleModules.length) % visibleModules.length;
                  else if (event.key === "Home") next = 0;
                  else if (event.key === "End") next = visibleModules.length - 1;
                  else return;
                  event.preventDefault();
                  const nextModule = visibleModules[next];
                  if (!nextModule) return;
                  handleTab(nextModule);
                  document.getElementById(`hub-tab-${visibleModules[next]}`)?.focus();
                }}
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
          aria-label={MODULE_LABELS[active][locale]}
          tabIndex={0}
          className="min-w-0 scroll-mt-36 py-5 outline-none sm:scroll-mt-24 sm:py-8"
        >
          <div
            key={active}
            className="animate-in fade-in slide-in-from-bottom-2 duration-200 motion-reduce:animate-none"
          >
            {active === "overview" ? (
              <div className="space-y-6">
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                  <article className="surface-panel min-w-0 overflow-hidden p-6 sm:p-8">
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
                        <p className="mt-3 max-w-3xl break-words text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
                          {editorial?.synopsis[locale] ?? game.description[locale]}
                        </p>

                        {editorial ? (
                          <div className="mt-7 grid gap-3 sm:grid-cols-2">
                            <GameFact icon={CalendarDays} label={copy("Lançamento", "Release", "Lanzamiento")} value={editorial.release[locale]} />
                            <GameFact icon={Building2} label={copy("Desenvolvimento", "Developer", "Desarrollo")} value={editorial.developer} />
                            <GameFact icon={Building2} label={copy("Publicação", "Publisher", "Publicación")} value={editorial.publisher} />
                            <GameFact icon={RefreshCw} label={copy("Versão", "Version", "Versión")} value={editorial.latestVersion} />
                          </div>
                        ) : null}
                      </div>

                      {editorial?.score ? (
                        <div className="self-start rounded-2xl border border-gold/25 bg-[radial-gradient(circle_at_top,rgba(212,167,44,0.14),transparent_65%),hsl(var(--muted)/0.2)] p-5 text-center transition-transform duration-300 hover:-translate-y-1">
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

                  {game.slug === "league-of-legends" ? (
                    <LeagueEsportsPanel
                      locale={locale}
                      compact
                      onOpenCompetitive={() => handleTab("competitive", true)}
                    />
                  ) : (
                    <GameLivePanel
                      gameSlug={game.slug}
                      themeKey={game.themeKey}
                      locale={locale}
                      onOpenModule={(moduleKey) => handleTab(moduleKey, true)}
                    />
                  )}
                </div>

                {hasRiotLookup ? <RiotPlayerSearch locale={locale} /> : null}
              </div>
            ) : (
              <FutureCollection
                gameSlug={game.slug}
                moduleKey={active}
                themeKey={game.themeKey}
                locale={locale}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PausedGameHub({ game, locale }: { game: GameConfig; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <div className="game-hub min-h-[75vh]">
      <section className="game-hub-hero relative isolate overflow-hidden border-b border-border">
        <GameArtwork game={game} variant="hero" loading="eager" className="absolute inset-0 h-full w-full opacity-50" />
        <div className="absolute inset-0 bg-background/65 backdrop-blur-[2px]" />
        <div className="relative mx-auto flex min-h-[32rem] w-full max-w-5xl items-center px-4 py-24 sm:px-6">
          <div className="max-w-2xl rounded-3xl border border-hero-border bg-hero-surface p-6 shadow-hero backdrop-blur-xl sm:p-9">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold-strong">
              <Clock3 className="size-4" />
              MGP 0.1.9
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold text-hero-foreground sm:text-5xl">{game.name}</h1>
            <p className="mt-4 text-sm leading-7 text-hero-muted sm:text-base">
              {copy(
                "Este hub está preservado, mas temporariamente fora do catálogo ativo enquanto a equipe prepara assets, conteúdo e integrações com o mesmo padrão dos hubs principais.",
                "This hub is preserved but temporarily outside the active catalog while assets, content and integrations are brought up to the same standard as the main hubs.",
                "Este hub está conservado, pero temporalmente fuera del catálogo activo mientras preparamos recursos, contenido e integraciones al nivel de los hubs principales.",
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/games" className="brand-button">
                {copy("Ver jogos ativos", "View active games", "Ver juegos activos")}
              </Link>
              <span className="inline-flex items-center rounded-full border border-hero-border px-4 py-2 text-xs font-semibold text-hero-muted">
                {copy("Dados mantidos para retorno futuro", "Data preserved for future return", "Datos conservados para su regreso")}
              </span>
            </div>
          </div>
        </div>
      </section>
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
    <div className="rounded-xl border border-border bg-muted/20 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/25 hover:bg-muted/30">
      <div className="flex items-center gap-2 text-gold-strong">
        <Icon className="size-4" />
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em]">{label}</span>
      </div>
      <p className="mt-2 break-words text-sm font-semibold leading-6 text-foreground">{value}</p>
    </div>
  );
}

