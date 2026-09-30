import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Hammer, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { GameArtwork } from "@/components/games/GameArtwork";
import { ACTIVE_GAMES } from "@/config/gameAvailability";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/communities/")({
  head: () =>
    buildSeo({
      title: "Guildas — espaços sociais por jogo — ÍMPAR",
      description:
        "Entre nas Guildas do ÍMPAR para conversar, publicar, compartilhar builds e encontrar jogadores de Valorant, League of Legends, Dark Souls e outros jogos.",
      path: "/communities",
    }),
  component: CommunitiesCatalog,
});

function CommunitiesCatalog() {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <div className="impar-shell mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="max-w-3xl">
        <p className="impar-kicker">ÍMPAR / GUILDAS</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-5xl">
          {copy("Guildas", "Guilds", "Guildas")}
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
          {copy(
            "Os Arquivos organizam os jogos. O Códice guarda conhecimento. As Guildas são onde as pessoas entram: conversas, criadores, posts, builds, discussões e LFG em torno do que vocês jogam.",
            "Archives organize games. The Codex holds knowledge. Guilds are where people step in: conversations, creators, posts, builds, discussions and LFG around what you play.",
            "Los Archivos organizan los juegos. El Códice guarda conocimiento. Las Guildas son donde entra la gente: conversaciones, creadores, posts, builds, debates y LFG alrededor de lo que juegan.",
          )}
        </p>
        <p className="mt-3 inline-flex rounded-full border border-[var(--impar-line)] bg-[var(--impar-spectral-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--impar-spectral)]">
          {copy("Todas fazem parte da Comunidade ÍMPAR.", "All are part of the ÍMPAR Community.", "Todas forman parte de la Comunidad ÍMPAR.")}
        </p>
      </div>

      <div className="mt-9 grid grid-cols-1 gap-4 md:grid-cols-2">
        {ACTIVE_GAMES.map((game) => (
          <article key={game.slug} className="impar-card group overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5">
            <div className="relative h-44 overflow-hidden border-b border-border sm:h-48">
              <GameArtwork
                game={game}
                variant="card"
                className="h-full w-full transition-transform duration-500 group-hover:scale-[1.025]"
                {...(game.slug === "league-of-legends" ? { imageClassName: "!p-[8%] !opacity-100" } : {})}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--impar-night)] via-[var(--impar-night)]/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
                    <ShieldCheck className="size-3.5" />
                    {copy("Guilda ÍMPAR", "ÍMPAR Guild", "Guilda ÍMPAR")}
                  </span>
                  <span className="rounded-full border border-[var(--impar-spectral)]/20 bg-[var(--impar-spectral-soft)] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--impar-spectral)]">
                    {copy("Aberta", "Open", "Abierta")}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-bold text-white">{game.name}</h2>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-sm leading-6 text-muted-foreground">
                {copy(
                  `Espaço social de ${game.name}: posts, builds, discussões, LFG e conteúdo criado por quem joga.`,
                  `${game.name} social space: posts, builds, discussions, LFG and player-created content.`,
                  `Espacio social de ${game.name}: posts, builds, debates, LFG y contenido creado por jugadores.`,
                )}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <CommunityFeature icon={MessageCircle} label={copy("Posts", "Posts", "Posts")} />
                <CommunityFeature icon={Hammer} label={copy("Builds", "Builds", "Builds")} />
                <CommunityFeature icon={Users} label="LFG" />
              </div>

              <Link
                to="/communities/$slug"
                params={{ slug: game.slug }}
                className="mt-5 inline-flex w-full items-center justify-between rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold text-foreground transition hover:border-[var(--impar-spectral)]/35 hover:bg-[var(--impar-spectral-soft)]"
              >
                <span>{copy("Entrar na guilda", "Enter guild", "Entrar en la guilda")}</span>
                <ArrowRight className="size-4 text-[var(--impar-amber)] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function CommunityFeature({ icon: Icon, label }: { icon: typeof Users; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-3 text-center">
      <Icon className="mx-auto size-4 text-[var(--impar-spectral)]" />
      <span className="mt-1.5 block text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
