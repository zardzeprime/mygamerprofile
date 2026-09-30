import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Compass, Hammer, ScrollText } from "lucide-react";

import { GameArtwork } from "@/components/games/GameArtwork";
import { ACTIVE_GAMES } from "@/config/gameAvailability";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { buildSeo } from "@/lib/seo";

const SORTED_GAMES = [...ACTIVE_GAMES].sort((a, b) =>
  a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
);

export const Route = createFileRoute("/codice")({
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
              {copy("Conhecimento que muda a partida.", "Knowledge that changes the game.", "Conocimiento que cambia la partida.")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              {copy(
                "O Códice reúne os caminhos para builds, guias, estratégias e sistemas já disponíveis nos hubs do ÍMPAR. Ele cresce junto com o conteúdo real da plataforma — sem inventar guia onde ainda não existe.",
                "The Codex gathers the paths to builds, guides, strategies and systems already available across ÍMPAR. It grows with real platform content — no pretending a guide exists when it does not.",
                "El Códice reúne los caminos hacia builds, guías, estrategias y sistemas ya disponibles en ÍMPAR. Crece junto al contenido real de la plataforma, sin fingir que existe una guía cuando todavía no existe.",
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
            <p className="impar-kicker">{copy("ENTRADAS DO CÓDICE", "CODEX ENTRIES", "ENTRADAS DEL CÓDICE")}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
              {copy("Escolha um jogo", "Choose a game", "Elige un juego")}
            </h2>
          </div>
          <Link to="/games" className="hidden text-sm font-semibold text-[var(--impar-spectral)] sm:inline-flex sm:items-center sm:gap-2">
            {copy("Ver Arquivos", "View Archives", "Ver Archivos")}
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {SORTED_GAMES.map((game) => (
            <Link
              key={game.slug}
              to="/games/$slug"
              params={{ slug: game.slug }}
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
                  {copy("Abrir registro", "Open entry", "Abrir registro")}
                </span>
                <span className="mt-1 flex items-center justify-between gap-2 font-display text-base font-semibold text-white sm:text-lg">
                  {game.name}
                  <ArrowRight className="size-4 shrink-0 text-[var(--impar-amber)] transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-muted/15 p-5 sm:p-6">
          <p className="text-sm leading-6 text-muted-foreground">
            {copy(
              "Alguns jogos ainda têm áreas em desenvolvimento. Quando um guia ou build não estiver publicado, o Códice leva você ao hub real do jogo em vez de preencher o espaço com conteúdo fictício.",
              "Some games still have areas in development. When a guide or build is not published yet, the Codex takes you to the real game hub instead of filling the space with fictional content.",
              "Algunos juegos todavía tienen áreas en desarrollo. Cuando una guía o build aún no está publicada, el Códice te lleva al hub real del juego en vez de llenar el espacio con contenido ficticio.",
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
