import { useState } from "react";
import { BriefcaseBusiness, Building2, Check, Copy, Crosshair, Database, Ear, ExternalLink, Headphones, Keyboard, Monitor, Mouse, MousePointer2, RectangleHorizontal, UsersRound } from "lucide-react";

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

type RegionFilter = "all" | "americas" | "emea" | "pacific" | "china";

const REGION_FILTERS: RegionFilter[] = ["all", "americas", "emea", "pacific", "china"];

const REGION_LABELS: Record<Exclude<RegionFilter, "all">, string> = {
  americas: "Americas",
  emea: "EMEA",
  pacific: "Pacific",
  china: "China",
};

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
                  region === "all" ? copy("Todos", "All", "Todos") : REGION_LABELS[region];
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

          <div className="mt-4 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
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
                    <div className="mt-2 grid grid-cols-1 gap-2 min-[440px]:grid-cols-2 lg:block lg:space-y-2">
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
                                {player.role ?? rosterStatusLabel(player.rosterStatus, copy)}
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

                  <TeamDetails team={selectedTeam} copy={copy} />
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

function staffRoleLabel(
  role: NonNullable<EsportsTeam["staff"]>[number]["role"],
  copy: (pt: string, en: string, es: string) => string,
) {
  if (role === "manager") return "Manager";
  if (role === "head-coach") return copy("Head coach", "Head coach", "Entrenador principal");
  if (role === "assistant-coach") return copy("Coach assistente", "Assistant coach", "Entrenador asistente");
  if (role === "performance-coach") return copy("Coach de performance", "Performance coach", "Coach de rendimiento");
  if (role === "analyst") return copy("Analista", "Analyst", "Analista");
  return copy("Comissão técnica", "Staff", "Cuerpo técnico");
}

function TeamDetails({
  team,
  copy,
}: {
  team: EsportsTeam;
  copy: (pt: string, en: string, es: string) => string;
}) {
  const staff = team.staff ?? [];
  const organization = team.organization;
  if (!staff.length && !organization) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/10 p-3 text-[11px] leading-5 text-muted-foreground sm:mt-4 sm:text-xs">
        {copy(
          "Comissão técnica e dados institucionais ainda não foram verificados para esta equipe.",
          "Staff and institutional details have not yet been verified for this team.",
          "El cuerpo técnico y los datos institucionales aún no fueron verificados para este equipo.",
        )}
      </div>
    );
  }

  return (
    <section className="mt-3 space-y-3 rounded-xl border border-border bg-background/45 p-3 sm:mt-4">
      {staff.length ? (
        <div>
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="size-3.5 text-gold-strong" />
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[10px]">
              {copy("Comissão técnica", "Team staff", "Cuerpo técnico")}
            </p>
          </div>
          <div className="mt-2 space-y-2">
            {staff.map((member) => (
              <div key={`${member.handle}-${member.role}`} className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-muted/10 px-2.5 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">{member.handle}</p>
                  {member.realName ? <p className="truncate text-[10px] text-muted-foreground">{member.realName}</p> : null}
                </div>
                <span className="shrink-0 text-right text-[9px] font-semibold uppercase tracking-[0.06em] text-gold-strong">
                  {staffRoleLabel(member.role, copy)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {organization ? (
        <div className="border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <Building2 className="size-3.5 text-gold-strong" />
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[10px]">
              {copy("Organização", "Organization", "Organización")}
            </p>
          </div>
          <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
            {organization.foundedYear ? <p>{copy("Fundação", "Founded", "Fundación")}: <span className="font-semibold text-foreground">{organization.foundedYear}</span></p> : null}
            {organization.headquarters ? <p>{copy("Sede", "Headquarters", "Sede")}: <span className="font-semibold text-foreground">{organization.headquarters}</span></p> : null}
            {organization.ownerName ? <p>{copy("Proprietário", "Owner", "Propietario")}: <span className="font-semibold text-foreground">{organization.ownerName}</span></p> : null}
            {organization.founderNames?.length ? <p>{copy("Fundadores", "Founders", "Fundadores")}: <span className="font-semibold text-foreground">{organization.founderNames.join(", ")}</span></p> : null}
            {organization.websiteUrl ? (
              <a href={organization.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-gold-strong hover:underline">
                {copy("Site oficial", "Official website", "Sitio oficial")} <ExternalLink className="size-3" />
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function rosterStatusLabel(
  status: EsportsPlayer["rosterStatus"],
  copy: (pt: string, en: string, es: string) => string,
) {
  if (!status || status === "active") return copy("Ativo", "Active", "Activo");
  if (status === "sub") return copy("Reserva", "Substitute", "Suplente");
  if (status === "inactive") return copy("Inativo", "Inactive", "Inactivo");
  if (status === "stand-in") return "Stand-in";
  if (status === "loan") return copy("Empréstimo", "Loan", "Préstamo");
  return status;
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
  const [copied, setCopied] = useState(false);
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
            {player.rosterStatus && player.rosterStatus !== "active" ? (
              <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 sm:px-2.5 sm:py-1 sm:text-xs">
                {rosterStatusLabel(player.rosterStatus, copy)}
              </span>
            ) : null}
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
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 sm:mt-4 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-4">
              <Stat label="DPI" value={settings.dpi} />
              <Stat label={copy("Sens.", "Sens.", "Sens.")} value={settings.sensitivity} />
              <Stat label="eDPI" value={settings.edpi} />
              <Stat label="Hz" value={settings.pollingRateHz} />
              <Stat label={copy("Resolução", "Resolution", "Resolución")} value={settings.resolution} />
              <Stat label={copy("Tela", "Display", "Pantalla")} value={settings.displayMode} />
            </dl>

            {settings.mouse || settings.keyboard || settings.monitor || settings.headset || settings.mousepad || settings.earphones ? (
              <div className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-2">
                <GearItem icon={<Mouse className="size-3.5" />} label="Mouse" value={settings.mouse} />
                <GearItem icon={<Keyboard className="size-3.5" />} label={copy("Teclado", "Keyboard", "Teclado")} value={settings.keyboard} />
                <GearItem icon={<Monitor className="size-3.5" />} label={copy("Monitor", "Monitor", "Monitor")} value={settings.monitor} />
                <GearItem icon={<Headphones className="size-3.5" />} label={copy("Headset", "Headset", "Auriculares")} value={settings.headset} />
                <GearItem icon={<RectangleHorizontal className="size-3.5" />} label="Mousepad" value={settings.mousepad} />
                <GearItem icon={<Ear className="size-3.5" />} label={copy("Fones", "Earphones", "Auriculares in-ear")} value={settings.earphones} />
              </div>
            ) : null}

            {settings.crosshairCode ? (
              <div className="mt-2 rounded-lg border border-border bg-background/50 p-3 sm:mt-3 sm:rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Crosshair className="size-3.5 text-gold-strong sm:size-4" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[10px]">Crosshair</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(settings.crosshairCode ?? "").then(() => {
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 1600);
                      });
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[9px] font-semibold text-gold-strong transition hover:border-gold/30 sm:text-[10px]"
                  >
                    {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copied ? copy("Copiado", "Copied", "Copiado") : copy("Copiar", "Copy", "Copiar")}
                  </button>
                </div>
                <code className="mt-2 block break-all text-[10px] leading-4 text-foreground sm:text-[11px] sm:leading-5">
                  {settings.crosshairCode}
                </code>
              </div>
            ) : null}

            {settings.crosshairCode ? <CrosshairPreview code={settings.crosshairCode} copy={copy} /> : null}

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

function GearItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-border bg-background/50 p-3 sm:rounded-xl">
      <div className="flex items-center gap-1.5 text-gold-strong">
        {icon}
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[10px]">{label}</p>
      </div>
      <p className="mt-1.5 text-xs font-semibold leading-5 text-foreground sm:text-sm">{value}</p>
    </div>
  );
}

type CrosshairVisual = {
  color: string;
  centerDot: boolean;
  centerSize: number;
  inner: boolean;
  innerLength: number;
  innerThickness: number;
  innerOffset: number;
  outer: boolean;
  outerLength: number;
  outerThickness: number;
  outerOffset: number;
  outline: boolean;
};

const VALORANT_CROSSHAIR_COLORS = ["#ffffff", "#00ff00", "#bfff00", "#dfff00", "#ffff00", "#00ffff", "#ff66ff", "#ff4040"];

function parseValorantCrosshairCode(code: string): CrosshairVisual {
  const tokens = code.split(";").filter(Boolean);
  const values: Record<string, string> = {};
  let primary = false;

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "P") {
      primary = true;
      continue;
    }
    if (primary && (token === "A" || token === "S")) break;
    if (!primary) continue;
    const next = tokens[index + 1];
    if (next !== undefined) {
      values[token] = next;
      index += 1;
    }
  }

  const number = (key: string, fallback: number) => {
    const parsed = Number(values[key]);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  const colorIndex = Math.max(0, Math.min(VALORANT_CROSSHAIR_COLORS.length - 1, number("c", 0)));

  return {
    color: values.u ? `#${values.u.replace(/^#/, "")}` : VALORANT_CROSSHAIR_COLORS[colorIndex],
    centerDot: values.d === "1",
    centerSize: Math.max(2, Math.min(8, number("z", 2))),
    inner: values["0b"] !== "0",
    innerLength: Math.max(2, Math.min(18, number("0l", 4))),
    innerThickness: Math.max(1, Math.min(6, number("0t", 2))),
    innerOffset: Math.max(0, Math.min(12, number("0o", 2))),
    outer: values["1b"] === "1",
    outerLength: Math.max(2, Math.min(18, number("1l", 2))),
    outerThickness: Math.max(1, Math.min(6, number("1t", 2))),
    outerOffset: Math.max(0, Math.min(16, number("1o", 4))),
    outline: values.h !== "0" && number("o", 0) > 0,
  };
}

function CrosshairPreview({
  code,
  copy,
}: {
  code: string;
  copy: (pt: string, en: string, es: string) => string;
}) {
  const visual = parseValorantCrosshairCode(code);
  return (
    <section className="mt-2 rounded-lg border border-border bg-background/50 p-3 sm:mt-3 sm:rounded-xl">
      <div className="flex items-center gap-2">
        <Crosshair className="size-3.5 text-gold-strong sm:size-4" />
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-[10px]">
            {copy("Prévia da mira", "Crosshair preview", "Vista previa de la mira")}
          </p>
          <p className="mt-0.5 text-[9px] text-muted-foreground">
            {copy("Reconstrução aproximada do código", "Approximate code reconstruction", "Reconstrucción aproximada del código")}
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <CrosshairCanvas visual={visual} tone="dark" label={copy("Fundo escuro", "Dark background", "Fondo oscuro")} />
        <CrosshairCanvas visual={visual} tone="light" label={copy("Fundo claro", "Light background", "Fondo claro")} />
      </div>
    </section>
  );
}

function CrosshairCanvas({ visual, tone, label }: { visual: CrosshairVisual; tone: "dark" | "light"; label: string }) {
  const lineStyle = (length: number, thickness: number, horizontal: boolean): React.CSSProperties => ({
    width: horizontal ? length * 2 : thickness,
    height: horizontal ? thickness : length * 2,
    backgroundColor: visual.color,
    boxShadow: visual.outline ? "0 0 0 1px rgba(0,0,0,.9)" : undefined,
  });
  const lines = (prefix: string, length: number, thickness: number, offset: number) => [
    <span key={`${prefix}-left`} className="absolute left-1/2 top-1/2" style={{ ...lineStyle(length, thickness, true), transform: `translate(calc(-100% - ${offset}px), -50%)` }} />,
    <span key={`${prefix}-right`} className="absolute left-1/2 top-1/2" style={{ ...lineStyle(length, thickness, true), transform: `translate(${offset}px, -50%)` }} />,
    <span key={`${prefix}-top`} className="absolute left-1/2 top-1/2" style={{ ...lineStyle(length, thickness, false), transform: `translate(-50%, calc(-100% - ${offset}px))` }} />,
    <span key={`${prefix}-bottom`} className="absolute left-1/2 top-1/2" style={{ ...lineStyle(length, thickness, false), transform: `translate(-50%, ${offset}px)` }} />,
  ];

  return (
    <div>
      <div className={`relative aspect-[4/3] overflow-hidden rounded-lg border ${tone === "dark" ? "border-white/10 bg-[#15191d]" : "border-black/10 bg-[#d8d2c6]"}`}>
        <div className={`absolute inset-0 opacity-35 ${tone === "dark" ? "bg-[radial-gradient(circle_at_65%_35%,#52616d,transparent_42%)]" : "bg-[linear-gradient(145deg,#f2eadc_0%,#aaa394_100%)]"}`} />
        <div className="absolute inset-x-0 bottom-[28%] h-px bg-black/15" />
        <div className="absolute bottom-0 left-[58%] h-[62%] w-px bg-black/15" />
        {visual.outer ? lines("outer", visual.outerLength, visual.outerThickness, visual.outerOffset + visual.innerLength) : null}
        {visual.inner ? lines("inner", visual.innerLength, visual.innerThickness, visual.innerOffset) : null}
        {visual.centerDot ? (
          <span
            className="absolute left-1/2 top-1/2"
            style={{
              width: visual.centerSize,
              height: visual.centerSize,
              backgroundColor: visual.color,
              boxShadow: visual.outline ? "0 0 0 1px rgba(0,0,0,.9)" : undefined,
              transform: "translate(-50%, -50%)",
            }}
          />
        ) : null}
      </div>
      <p className="mt-1 text-center text-[9px] font-semibold text-muted-foreground">{label}</p>
    </div>
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
