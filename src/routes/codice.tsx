import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Compass, Hammer, ScrollText } from "lucide-react";

import { GameArtwork } from "@/components/games/GameArtwork";
import { ACTIVE_GAMES } from "@/config/gameAvailability";
import { MODULE_LABELS, type GameConfig, type GameModuleKey } from "@/config/games";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { buildSeo } from "@/lib/seo";

const CODEX_MODULE_ORDER: GameModuleKey[] = ["builds", "guides", "bosses", "items", "weapons", "champions", "agents", "warframes", "runes", "skins", "competitive", "news"];

function getCodexSection(game: GameConfig): GameModuleKey {
  return CODEX_MODULE_ORDER.find((module) => game.modules.includes(module)) ?? "overview";
}

const SORTED_GAMES = [...ACTIVE_GAMES].sort((a, b) =>
  a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
);

export const Route = createFileRoute("/codice")({
  validateSearch: (search: Record<string, unknown>) => ({ module: typeof search.module === "string" ? search.module : undefined }),
  head: () =>
    buildSeo({
      title: "Códice — guias, builds e estratégias — ÍMPAR",
      description:
        "Entre no Códice do ÍMPAR: pontos de entrada para guias, builds, estratégias e conhecimento dos jogos suportados pela plataforma.",
      path: "/codice",
    }),
  component: CodicePage,
});

function CodicePage() {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <main className="impar-shell min-h-[calc(100vh-4.25rem)] pb-16">
      <section className="impar-grid relative overflow-hidden border-b border-border/70">
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <ScrollText className="size-4 text-[var(--impar-spectral)]" aria-hidden="true" />
              <p className="impar-kicker">ÍMPAR / CÓDICE</p>
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              {copy(
                "Conhecimento que muda a partida.",
                "Knowledge that changes the game.",
                "Conocimiento que cambia la partida.",
              )}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              {copy(
                "O Códice abre diretamente as seções de builds, guias e estratégias de cada jogo. Escolha um jogo e vá direto ao conteúdo, sem passar por outra página de hub.",
                "The Codex opens straight to each game's builds, guides and strategy sections. Pick a game and go directly to the relevant content without another hub stop.",
                "El Códice abre directamente las secciones de builds, guías y estrategias de cada juego. Elige un juego para ir al contenido correcto sin pasar por otra página de hub.",
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          <CodexPillar
            icon={Hammer}
            title={copy("Builds", "Builds", "Builds")}
            body={copy(
              "Configurações de personagens, armas, itens e progressão disponíveis em cada jogo.",
              "Character, weapon, item and progression setups available per game.",
              "Configuraciones de personajes, armas, objetos y progresión disponibles en cada juego.",
            )}
          />
          <CodexPillar
            icon={BookOpen}
            title={copy("Guias", "Guides", "Guías")}
            body={copy(
              "Rotas, mecânicas, sistemas e explicações organizadas para consulta rápida.",
              "Routes, mechanics, systems and explanations organized for quick reference.",
              "Rutas, mecánicas, sistemas y explicaciones organizadas para consulta rápida.",
            )}
          />
          <CodexPillar
            icon={Compass}
            title={copy("Estratégias", "Strategies", "Estrategias")}
            body={copy(
              "Conhecimento aplicado: do competitivo aos bosses, farms e decisões de progressão.",
              "Applied knowledge, from competitive play to bosses, farms and progression choices.",
              "Conocimiento aplicado: del competitivo a bosses, farmeo y decisiones de progresión.",
            )}
          />
        </div>

        <div className="mt-10 flex items-end justify-between gap-4">
          <div>
            <p className="impar-kicker">
              {copy("ENTRADAS DO CÓDICE", "CODEX ENTRIES", "ENTRADAS DEL CÓDICE")}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
              {copy("Escolha um jogo", "Choose a game", "Elige un juego")}
            </h2>
          </div>
          <Link
            to="/games"
            className="hidden text-sm font-semibold text-[var(--impar-spectral)] sm:inline-flex sm:items-center sm:gap-2"
          >
            {copy("Ver Arquivos", "View Archives", "Ver Archivos")}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {SORTED_GAMES.map((game) => {
            const section = getCodexSection(game);
            return (
            <Link
              key={game.slug}
              to="/games/$slug"
              params={{ slug: game.slug }}
              search={{ module: section }}
              className="impar-card impar-card-interactive group relative isolate min-h-44 overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--impar-spectral)] sm:min-h-56"
            >
              <GameArtwork
                game={game}
                variant="card"
                className="absolute inset-0 h-full w-full opacity-60 transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--impar-night)] via-[var(--impar-night)]/45 to-transparent" />
              <div className="relative flex h-full min-h-44 flex-col justify-end p-4 sm:min-h-56 sm:p-5">
                <span className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--impar-spectral)]">
                  {copy("Abrir", "Open", "Abrir")} · {MODULE_LABELS[section][locale]}
                </span>
                <span className="mt-1 flex items-center justify-between gap-2 font-display text-base font-semibold text-white sm:text-lg">
                  {game.name}
                  <ArrowRight className="size-4 shrink-0 text-[var(--impar-amber)] transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-muted/15 p-5 sm:p-6">
          <p className="text-sm leading-6 text-muted-foreground">
            {copy(
              "Cada cartão abre a seção mais relevante disponível para aquele jogo. Se uma área ainda estiver em preparação, esse estado aparece dentro da própria seção.",
              "Each card opens the most relevant available section for that game. If an area is still being prepared, that status appears inside the section itself.",
              "Cada tarjeta abre la sección más relevante disponible para ese juego. Si un área aún está en preparación, ese estado aparece dentro de la propia sección.",
            )}
          </p>
        </div>
      </section>
    </main>
  );
}

function CodexPillar({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof BookOpen;
  title: string;
  body: string;
}) {
  return (
    <article className="impar-card rounded-2xl p-5 sm:p-6">
      <div className="grid size-10 place-items-center rounded-xl border border-[var(--impar-line)] bg-[var(--impar-spectral-soft)] text-[var(--impar-spectral)]">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </article>
  );
}
