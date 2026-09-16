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

export function CompetitiveCompendium({ game, locale }: { game: EsportsGameSlug; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const teams = getEsportsTeams(game);
  const players = getEsportsPlayers(game);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

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
    <div className="space-y-5">
      <section className="surface-panel p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker">MG PROFILE COMPENDIUM / 0.1.9</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
              {copy("Compêndio competitivo", "Competitive compendium", "Compendio competitivo")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {game === "valorant"
                ? copy(
                    "Escolha um time para abrir o elenco. Dentro dele, passe o mouse ou selecione um jogador para ver função, configurações verificadas, crosshair e a procedência exata de cada dado.",
                    "Choose a team to open its roster. Inside, hover or select a player to see role, verified settings, crosshair and the exact provenance for each data point.",
                    "Elige un equipo para abrir su plantilla. Dentro, pasa el cursor o selecciona un jugador para ver rol, configuraciones verificadas, mira y la procedencia exacta de cada dato.",
                  )
                : copy(
                    "Escolha um time para abrir o elenco e as informações profissionais verificadas pelo MG Profile.",
                    "Choose a team to open its roster and professional information verified by MG Profile.",
                    "Elige un equipo para abrir su plantilla y la información profesional verificada por MG Profile.",
                  )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
            <span className="rounded-full border border-border px-3 py-1.5">
              {teams.length} {copy("times", "teams", "equipos")}
            </span>
            <span className="rounded-full border border-border px-3 py-1.5">
              {players.length} {copy("jogadores", "players", "jugadores")}
            </span>
          </div>
        </div>
      </section>

      {teams.length > 0 ? (
        <section className="surface-panel p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <UsersRound className="size-5 text-gold-strong" />
            <h3 className="font-display text-xl font-semibold text-foreground">
              {copy("Times", "Teams", "Equipos")}
            </h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {copy(
              "Os links de VLR.gg e ProSettings não ficam soltos no diretório: eles aparecem somente junto do dado que sustentam.",
              "VLR.gg and ProSettings links are not shown as loose directory cards: they appear only beside the data they support.",
              "Los enlaces de VLR.gg y ProSettings no aparecen como tarjetas sueltas: se muestran solamente junto al dato que respaldan.",
            )}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teams.map((team) => {
              const roster = players.filter((player) => team.playerIds.includes(player.id));
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => openTeam(team)}
                  className="group rounded-2xl border border-border bg-muted/10 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-gold/35 hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/35"
                >
                  <div className="flex items-center gap-3">
                    {team.logoUrl ? (
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-background/70 p-1.5">
                        <img
                          src={team.logoUrl}
                          alt={`${team.name} logo`}
                          className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-background/70 text-xs font-bold text-foreground">
                        {team.shortName}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-semibold text-foreground">{team.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {team.countryCode ? `${team.countryCode} · ` : ""}
                        {roster.length} {copy("jogadores", "players", "jugadores")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {roster.slice(0, 5).map((player) => (
                      <span
                        key={player.id}
                        className="rounded-full border border-border bg-background/55 px-2 py-1 text-[11px] text-muted-foreground"
                      >
                        {player.handle}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs font-semibold text-gold-strong">
                    {copy("Abrir time →", "Open team →", "Abrir equipo →")}
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
          <DialogContent className="max-h-[88vh] max-w-5xl overflow-hidden border-border bg-background p-0">
            <div className="max-h-[88vh] overflow-y-auto">
              <DialogHeader className="border-b border-border bg-surface px-5 py-5 pr-12 sm:px-7">
                <div className="flex items-center gap-4">
                  {selectedTeam.logoUrl ? (
                    <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-border bg-background/70 p-2">
                      <img src={selectedTeam.logoUrl} alt={`${selectedTeam.name} logo`} className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-border bg-background/70 text-sm font-bold">
                      {selectedTeam.shortName}
                    </div>
                  )}
                  <div className="min-w-0">
                    <DialogTitle className="font-display text-2xl text-foreground">{selectedTeam.name}</DialogTitle>
                    <DialogDescription className="mt-1">
                      {copy(
                        "Passe o mouse nos jogadores ou clique para fixar os detalhes.",
                        "Hover players or click to pin their details.",
                        "Pasa el cursor por los jugadores o haz clic para fijar sus detalles.",
                      )}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(240px,0.72fr)_minmax(0,1.28fr)]">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {copy("Elenco", "Roster", "Plantilla")}
                  </p>
                  <div className="mt-3 space-y-2">
                    {selectedRoster.map((player) => {
                      const active = player.id === selectedPlayer?.id;
                      return (
                        <button
                          key={player.id}
                          type="button"
                          onMouseEnter={() => setSelectedPlayerId(player.id)}
                          onFocus={() => setSelectedPlayerId(player.id)}
                          onClick={() => setSelectedPlayerId(player.id)}
                          className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition duration-150 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/30 ${
                            active
                              ? "border-gold/40 bg-gold/5"
                              : "border-border bg-muted/10 hover:border-gold/25 hover:bg-muted/20"
                          }`}
                        >
                          {player.photoUrl ? (
                            <img
                              src={player.photoUrl}
                              alt={player.handle}
                              className="size-10 rounded-xl object-cover transition-transform duration-150 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-background/70 text-xs font-bold text-gold-strong">
                              {player.handle.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{player.handle}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {player.role ?? copy("Função não verificada", "Role not verified", "Rol no verificado")}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

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

function TeamProvenance({
  team,
  copy,
}: {
  team: EsportsTeam;
  copy: (pt: string, en: string, es: string) => string;
}) {
  const vlrSource = team.sources.find((source) => source.label.startsWith("VLR.gg"));
  if (!vlrSource) return null;

  return (
    <div className="mt-4 rounded-xl border border-border bg-background/45 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {copy("Procedência do elenco", "Roster provenance", "Procedencia de plantilla")}
      </p>
      <a
        href={vlrSource.url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-strong hover:underline"
      >
        {copy("Informações tiradas de VLR.gg", "Information sourced from VLR.gg", "Información obtenida de VLR.gg")}
        <ExternalLink className="size-3" />
      </a>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {copy("Conferido", "Verified", "Verificado")} {vlrSource.verifiedAt}
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
    <article className="overflow-hidden rounded-2xl border border-border bg-muted/10">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center">
        {player.photoUrl ? (
          <img src={player.photoUrl} alt={player.handle} className="size-24 rounded-2xl object-cover" />
        ) : (
          <div className="grid size-20 shrink-0 place-items-center rounded-2xl border border-border bg-background/70 font-display text-2xl font-bold text-gold-strong sm:size-24">
            {player.handle.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-muted-foreground">{team.name}</p>
          <h4 className="mt-1 font-display text-2xl font-semibold text-foreground">{player.handle}</h4>
          {player.realName ? <p className="mt-1 text-sm text-muted-foreground">{player.realName}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-border bg-background/55 px-2.5 py-1 text-xs font-semibold text-foreground">
              {player.role ?? copy("Função ainda não verificada", "Role not verified yet", "Rol aún no verificado")}
            </span>
            {player.countryCode ? (
              <span className="rounded-full border border-border bg-background/55 px-2.5 py-1 text-xs text-muted-foreground">
                {player.countryCode}
              </span>
            ) : null}
          </div>
          {vlrSource ? (
            <a
              href={vlrSource.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-strong hover:underline"
            >
              {copy("Informações tiradas de VLR.gg", "Information sourced from VLR.gg", "Información obtenida de VLR.gg")}
              <ExternalLink className="size-3" />
            </a>
          ) : null}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2">
          <MousePointer2 className="size-4 text-gold-strong" />
          <h5 className="font-display text-lg font-semibold text-foreground">
            {copy("Configurações profissionais", "Professional settings", "Configuraciones profesionales")}
          </h5>
        </div>

        {settings ? (
          <>
            <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3">
              <Stat label="DPI" value={settings.dpi} />
              <Stat label={copy("Sensibilidade", "Sensitivity", "Sensibilidad")} value={settings.sensitivity} />
              <Stat label="eDPI" value={settings.edpi} />
              <Stat label="Hz" value={settings.pollingRateHz} />
              <Stat label={copy("Resolução", "Resolution", "Resolución")} value={settings.resolution} />
              <Stat label={copy("Tela", "Display", "Pantalla")} value={settings.displayMode} />
            </dl>

            {settings.mouse ? (
              <div className="mt-4 rounded-xl border border-border bg-background/50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Mouse</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{settings.mouse}</p>
              </div>
            ) : null}

            {settings.crosshairCode ? (
              <div className="mt-3 rounded-xl border border-border bg-background/50 p-3">
                <div className="flex items-center gap-2">
                  <Crosshair className="size-4 text-gold-strong" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Crosshair</p>
                </div>
                <code className="mt-2 block break-all text-[11px] leading-5 text-foreground">
                  {settings.crosshairCode}
                </code>
              </div>
            ) : null}

            {proSource ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                <a
                  href={proSource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-strong hover:underline"
                >
                  {copy(
                    "Configurações tiradas de ProSettings.net",
                    "Settings sourced from ProSettings.net",
                    "Configuraciones obtenidas de ProSettings.net",
                  )}
                  <ExternalLink className="size-3" />
                </a>
                <span className="text-[10px] text-muted-foreground">
                  {copy("Conferido", "Verified", "Verificado")} {proSource.verifiedAt}
                </span>
              </div>
            ) : null}
          </>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-background/40 p-4 text-sm leading-6 text-muted-foreground">
            {copy(
              "As configurações deste jogador ainda não foram verificadas individualmente pelo MG Profile. Em vez de inventar valores ou mostrar um link genérico, elas ficam ocultas até existir uma fonte específica e conferida.",
              "This player's settings have not yet been individually verified by MG Profile. Instead of guessing values or showing a generic link, they stay hidden until a specific verified source exists.",
              "Las configuraciones de este jugador aún no fueron verificadas individualmente por MG Profile. En lugar de inventar valores o mostrar un enlace genérico, permanecen ocultas hasta que exista una fuente específica y verificada.",
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
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold text-foreground">{value}</dd>
    </div>
  );
}
