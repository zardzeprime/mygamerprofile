import { useState } from "react";
import { Crosshair, Database, ExternalLink, MousePointer2, UsersRound } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getEsportsPlayers,
  getEsportsTeams,
  type EsportsGameSlug,
  type EsportsPlayer,
  type EsportsTeam,
} from "@/data/esportsCompendium";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

type RegionFilter = "all" | "Americas" | "EMEA" | "Pacific" | "China";

const REGION_FILTERS: RegionFilter[] = ["all", "Americas", "EMEA", "Pacific", "China"];

export function CompetitiveCompendium({ game, locale }: { game: EsportsGameSlug; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const teams = getEsportsTeams(game);
  const players = getEsportsPlayers(game);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("all");

  const visibleTeams =
    regionFilter === "all" ? teams : teams.filter((team) => team.region === regionFilter);
  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;
  const selectedRoster = selectedTeam
    ? players.filter((player) => selectedTeam.playerIds.includes(player.id))
    : [];
  const selectedPlayer =
    selectedRoster.find((player) => player.id === selectedPlayerId) ?? selectedRoster[0] ?? null;

  const openTeam = (team: EsportsTeam) => {
    const roster = players.filter((player) => team.playerIds.includes(player.id));
    setSelectedTeamId(team.id);
    setSelectedPlayerId(roster[0]?.id ?? null);
  };

  const closeTeam = () => {
    setSelectedTeamId(null);
    setSelectedPlayerId(null);
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="surface-panel p-4 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker">MG PROFILE COMPENDIUM / 0.1.9</p>
            <h2 className="mt-2 font-display text-xl font-semibold text-foreground sm:text-2xl">
              {copy("Compêndio competitivo", "Competitive compendium", "Compendio competitivo")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:mt-3 sm:leading-7">
              {game === "valorant"
                ? copy(
                    "Escolha uma região e abra um time. No perfil do jogador ficam função, configurações verificadas, crosshair e a fonte exata de cada dado.",
                    "Choose a region and open a team. Player profiles show role, verified settings, crosshair and the exact source for each data point.",
                    "Elige una región y abre un equipo. El perfil del jugador muestra rol, configuraciones verificadas, mira y la fuente exacta de cada dato.",
                  )
                : copy(
                    "Escolha um time para abrir o elenco e as informações profissionais verificadas pelo MG Profile.",
                    "Choose a team to open its roster and professional information verified by MG Profile.",
                    "Elige un equipo para abrir su plantilla y la información profesional verificada por MG Profile.",
                  )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground sm:text-xs">
            <span className="rounded-full border border-border px-2.5 py-1 sm:px-3 sm:py-1.5">
              {teams.length} {copy("times", "teams", "equipos")}
            </span>
            <span className="rounded-full border border-border px-2.5 py-1 sm:px-3 sm:py-1.5">
              {players.length} {copy("jogadores verificados", "verified players", "jugadores verificados")}
            </span>
          </div>
        </div>
      </section>

      {teams.length > 0 ? (
        <section className="surface-panel p-3 sm:p-7">
          <div className="flex items-center gap-2 px-1 sm:px-0">
            <UsersRound className="size-4 text-gold-strong sm:size-5" />
            <h3 className="font-display text-lg font-semibold text-foreground sm:text-xl">
              {copy("Times", "Teams", "Equipos")}
            </h3>
          </div>

          {game === "valorant" ? (
            <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {REGION_FILTERS.map((region) => {
                const active = regionFilter === region;
                const label =
                  region === "all" ? copy("Todos", "All", "Todos") : region;
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => setRegionFilter(region)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "border-gold/40 bg-gold/10 text-gold-strong"
                        : "border-border bg-background/45 text-muted-foreground hover:border-gold/25 hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {visibleTeams.map((team) => {
              const roster = players.filter((player) => team.playerIds.includes(player.id));
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => openTeam(team)}
                  className="group min-w-0 rounded-xl border border-border bg-muted/10 p-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-gold/35 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/35 sm:rounded-2xl sm:p-4"
                >
                  <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                    <TeamLogo team={team} className="size-9 rounded-lg sm:size-11 sm:rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-semibold text-foreground sm:text-base">
                        {team.name}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-xs">
                        {team.region ?? team.countryCode ?? "VALORANT"}
                        {roster.length > 0 ? ` · ${roster.length}` : ""}
                      </p>
                    </div>
                  </div>

                  {roster.length > 0 ? (
                    <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
                      {roster.slice(0, 3).map((player) => (
                        <span
                          key={player.id}
                          className="max-w-full truncate rounded-full border border-border bg-background/55 px-2 py-1 text-[10px] text-muted-foreground"
                        >
                          {player.handle}
                        </span>
                      ))}
                      {roster.length > 3 ? (
                        <span className="rounded-full border border-border bg-background/55 px-2 py-1 text-[10px] text-muted-foreground">
                          +{roster.length - 3}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-2 hidden text-[10px] text-muted-foreground sm:block">
                      {copy("Elenco em verificação", "Roster being verified", "Plantilla en verificación")}
                    </p>
                  )}

                  <p className="mt-2 text-[10px] font-semibold text-gold-strong sm:mt-3 sm:text-xs">
                    {copy("Abrir →", "Open →", "Abrir →")}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-border bg-muted/10 p-6 text-center">
          <Database className="mx-auto size-6 text-gold-strong" />
          <p className="mt-3 font-display text-lg font-semibold text-foreground">
            {copy("Base editorial em preparação", "Editorial dataset in preparation", "Base editorial en preparación")}
          </p>
        </section>
      )}

      <Dialog
        open={Boolean(selectedTeam)}
        onOpenChange={(open) => {
          if (!open) closeTeam();
        }}
      >
        {selectedTeam ? (
          <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] max-w-5xl overflow-hidden border-border bg-background p-0 sm:max-h-[88vh]">
            <div className="max-h-[92dvh] overflow-y-auto sm:max-h-[88vh]">
              <DialogHeader className="border-b border-border bg-surface px-4 py-4 pr-11 sm:px-7 sm:py-5 sm:pr-12">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <TeamLogo team={selectedTeam} className="size-10 rounded-xl sm:size-14 sm:rounded-2xl" />
                  <div className="min-w-0">
                    <DialogTitle className="truncate font-display text-xl text-foreground sm:text-2xl">
                      {selectedTeam.name}
                    </DialogTitle>
                    <DialogDescription className="mt-0.5 text-xs sm:mt-1 sm:text-sm">
                      {selectedTeam.region ?? copy("Competitivo", "Competitive", "Competitivo")}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(220px,0.7fr)_minmax(0,1.3fr)] lg:gap-5 lg:p-7">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]">
                    {copy("Elenco", "Roster", "Plantilla")}
                  </p>

                  {selectedRoster.length > 0 ? (
                    <div className="mt-2 grid grid-cols-2 gap-2 lg:block lg:space-y-2">
                      {selectedRoster.map((player) => {
                        const active = player.id === selectedPlayer?.id;
                        return (
                          <button
                            key={player.id}
                            type="button"
                            onMouseEnter={() => setSelectedPlayerId(player.id)}
                            onFocus={() => setSelectedPlayerId(player.id)}
                            onClick={() => setSelectedPlayerId(player.id)}
                            className={`group flex min-w-0 items-center gap-2 rounded-lg border p-2 text-left transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 sm:rounded-xl sm:p-2.5 lg:w-full lg:hover:scale-[1.01] ${
                              active
                                ? "border-gold/40 bg-gold/5"
                                : "border-border bg-muted/10 hover:border-gold/25 hover:bg-muted/20"
                            }`}
                          >
                            <PlayerAvatar player={player} compact />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-foreground sm:text-sm">{player.handle}</p>
                              <p className="hidden truncate text-[10px] text-muted-foreground sm:block">
                                {player.role ?? copy("Função não verificada", "Role not verified", "Rol no verificado")}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/10 p-4 text-xs leading-5 text-muted-foreground">
                      {copy(
                        "O time está no diretório competitivo, mas o elenco atual ainda está sendo conferido antes de ser publicado.",
                        "The team is in the competitive directory, but its current roster is still being verified before publication.",
                        "El equipo está en el directorio competitivo, pero su plantilla actual aún se está verificando antes de publicarse.",
                      )}
                    </div>
                  )}

                  <TeamProvenance team={selectedTeam} copy={copy} />
                </div>

                <div className="min-w-0">
                  {selectedPlayer ? (
                    <PlayerPanel player={selectedPlayer} team={selectedTeam} copy={copy} />
                  ) : null}
                </div>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}

function TeamLogo({ team, className }: { team: EsportsTeam; className: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(team.logoUrl) && !failed;

  return (
    <div
      className={`grid shrink-0 place-items-center border border-border bg-background/70 p-1.5 text-[10px] font-bold text-foreground ${className}`}
      aria-label={`${team.name} logo`}
    >
      {showImage ? (
        <img
          src={team.logoUrl}
          alt=""
          className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="max-w-full truncate">{team.shortName ?? team.name.slice(0, 4).toUpperCase()}</span>
      )}
    </div>
  );
}

function PlayerAvatar({ player, compact = false }: { player: EsportsPlayer; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  const sizeClass = compact ? "size-8 rounded-lg" : "size-16 rounded-xl sm:size-20 sm:rounded-2xl";

  if (player.photoUrl && !failed) {
    return (
      <img
        src={player.photoUrl}
        alt={player.handle}
        className={`${sizeClass} shrink-0 object-cover`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={`grid ${sizeClass} shrink-0 place-items-center border border-border bg-background/70 font-bold text-gold-strong`}>
      {player.handle.slice(0, 2).toUpperCase()}
    </div>
  );
}

function TeamProvenance({
  team,
  copy,
}: {
  team: EsportsTeam;
  copy: (pt: string, en: string, es: string) => string;
}) {
  const vlrSource = team.sources.find((source) => source.label.startsWith("VLR.gg"));
  const officialSource = team.sources.find((source) => source.label.startsWith("VALORANT Esports"));
  const source = vlrSource ?? officialSource;
  if (!source) return null;

  return (
    <div className="mt-3 rounded-xl border border-border bg-background/45 p-3 sm:mt-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[10px]">
        {copy("Procedência", "Provenance", "Procedencia")}
      </p>
      <a
        href={source.url}
        target="_blank"
        rel="noreferrer"
        className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-gold-strong hover:underline sm:mt-2 sm:text-xs"
      >
        {vlrSource
          ? copy("Elenco: VLR.gg", "Roster: VLR.gg", "Plantilla: VLR.gg")
          : copy("Time: VALORANT Esports", "Team: VALORANT Esports", "Equipo: VALORANT Esports")}
        <ExternalLink className="size-3" />
      </a>
      <p className="mt-1 text-[9px] text-muted-foreground sm:text-[10px]">
        {copy("Conferido", "Verified", "Verificado")} {source.verifiedAt}
      </p>
    </div>
  );
}

function PlayerPanel({
  player,
  team,
  copy,
}: {
  player: EsportsPlayer;
  team: EsportsTeam;
  copy: (pt: string, en: string, es: string) => string;
}) {
  const settings = player.settings;
  const vlrSource = player.sources.find((source) => source.label.startsWith("VLR.gg"));
  const proSource = player.sources.find((source) => source.label === "ProSettings.net");

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-muted/10 sm:rounded-2xl">
      <div className="flex items-center gap-3 border-b border-border p-4 sm:gap-4 sm:p-5">
        <PlayerAvatar player={player} />
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground sm:text-xs">
            {team.name}
          </p>
          <h4 className="mt-0.5 truncate font-display text-xl font-semibold text-foreground sm:mt-1 sm:text-2xl">
            {player.handle}
          </h4>
          {player.realName ? <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">{player.realName}</p> : null}
          <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
            <span className="rounded-full border border-border bg-background/55 px-2 py-0.5 text-[10px] font-semibold text-foreground sm:px-2.5 sm:py-1 sm:text-xs">
              {player.role ?? copy("Função não verificada", "Role not verified", "Rol no verificado")}
            </span>
            {player.countryCode ? (
              <span className="rounded-full border border-border bg-background/55 px-2 py-0.5 text-[10px] text-muted-foreground sm:px-2.5 sm:py-1 sm:text-xs">
                {player.countryCode}
              </span>
            ) : null}
          </div>
          {vlrSource ? (
            <a
              href={vlrSource.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-gold-strong hover:underline sm:mt-3 sm:text-xs"
            >
              VLR.gg <ExternalLink className="size-3" />
            </a>
          ) : null}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <MousePointer2 className="size-4 text-gold-strong" />
          <h5 className="font-display text-base font-semibold text-foreground sm:text-lg">
            {copy("Configurações profissionais", "Professional settings", "Configuraciones profesionales")}
          </h5>
        </div>

        {settings ? (
          <>
            <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-3 sm:mt-4 sm:gap-x-5 sm:gap-y-4">
              <Stat label="DPI" value={settings.dpi} />
              <Stat label={copy("Sens.", "Sens.", "Sens.")} value={settings.sensitivity} />
              <Stat label="eDPI" value={settings.edpi} />
              <Stat label="Hz" value={settings.pollingRateHz} />
              <Stat label={copy("Resolução", "Resolution", "Resolución")} value={settings.resolution} />
              <Stat label={copy("Tela", "Display", "Pantalla")} value={settings.displayMode} />
            </dl>

            {settings.mouse ? (
              <div className="mt-3 rounded-lg border border-border bg-background/50 p-3 sm:mt-4 sm:rounded-xl">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[10px]">Mouse</p>
                <p className="mt-1 text-xs font-semibold text-foreground sm:text-sm">{settings.mouse}</p>
              </div>
            ) : null}

            {settings.crosshairCode ? (
              <div className="mt-2 rounded-lg border border-border bg-background/50 p-3 sm:mt-3 sm:rounded-xl">
                <div className="flex items-center gap-2">
                  <Crosshair className="size-3.5 text-gold-strong sm:size-4" />
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[10px]">Crosshair</p>
                </div>
                <code className="mt-2 block break-all text-[10px] leading-4 text-foreground sm:text-[11px] sm:leading-5">
                  {settings.crosshairCode}
                </code>
              </div>
            ) : null}

            {proSource ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 sm:mt-4 sm:pt-4">
                <a
                  href={proSource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-gold-strong hover:underline sm:text-xs"
                >
                  ProSettings.net <ExternalLink className="size-3" />
                </a>
                <span className="text-[9px] text-muted-foreground sm:text-[10px]">
                  {copy("Conferido", "Verified", "Verificado")} {proSource.verifiedAt}
                </span>
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-border bg-background/40 p-3 text-xs leading-5 text-muted-foreground sm:mt-4 sm:p-4 sm:text-sm sm:leading-6">
            {copy(
              "As configurações ainda não foram verificadas individualmente. Elas ficam ocultas até existir uma fonte específica e conferida.",
              "Settings have not yet been individually verified. They stay hidden until a specific verified source is available.",
              "Las configuraciones aún no fueron verificadas individualmente. Permanecen ocultas hasta que exista una fuente específica y verificada.",
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined) return null;
  return (
    <div className="min-w-0">
      <dt className="truncate text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground sm:text-[10px] sm:tracking-[0.1em]">{label}</dt>
      <dd className="mt-0.5 truncate text-xs font-semibold text-foreground sm:mt-1 sm:text-sm">{value}</dd>
    </div>
  );
}
