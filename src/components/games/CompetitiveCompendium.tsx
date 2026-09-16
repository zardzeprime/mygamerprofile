import { Crosshair, Database, ExternalLink, MousePointer2, ShieldCheck, UsersRound } from "lucide-react";

import {
  COMPETITIVE_SOURCE_LINKS,
  getEsportsPlayers,
  getEsportsTeams,
  type EsportsGameSlug,
} from "@/data/esportsCompendium";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

export function CompetitiveCompendium({ game, locale }: { game: EsportsGameSlug; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const teams = getEsportsTeams(game);
  const players = getEsportsPlayers(game);
  const playersWithSettings = players.filter((player) => player.settings);

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
                    "VLR.gg agora referencia times, elencos e circuito; ProSettings referencia sensibilidade, mira, vídeo e periféricos. Cada snapshot publicado pelo MG Profile guarda a fonte e a data da conferência.",
                    "VLR.gg now references teams, rosters and the circuit; ProSettings references sensitivity, crosshair, video and gear. Every MG Profile snapshot stores its source and verification date.",
                    "VLR.gg ahora referencia equipos, plantillas y circuito; ProSettings referencia sensibilidad, mira, vídeo y periféricos. Cada snapshot de MG Profile guarda su fuente y fecha de verificación.",
                  )
                : copy(
                    "Times, jogadores e configurações profissionais entram aqui com fonte e data de verificação.",
                    "Teams, players and professional settings live here with source and verification date.",
                    "Equipos, jugadores y configuraciones profesionales viven aquí con fuente y fecha de verificación.",
                  )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
            <span className="rounded-full border border-border px-3 py-1.5">{teams.length} {copy("times", "teams", "equipos")}</span>
            <span className="rounded-full border border-border px-3 py-1.5">{players.length} {copy("jogadores", "players", "jugadores")}</span>
            {game === "valorant" ? (
              <span className="rounded-full border border-border px-3 py-1.5">{playersWithSettings.length} {copy("settings verificadas", "verified settings", "settings verificadas")}</span>
            ) : null}
          </div>
        </div>
      </section>

      {game === "valorant" ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {COMPETITIVE_SOURCE_LINKS.map((source) => (
            <a
              key={source.id}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="surface-panel group flex items-start justify-between gap-4 p-5 transition-colors hover:border-gold/35"
            >
              <div>
                <p className="font-display text-base font-semibold text-foreground">{source.name}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{source.purpose}</p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {copy("Conferido", "Verified", "Verificado")} {source.verifiedAt}
                </p>
              </div>
              <ExternalLink className="mt-1 size-4 shrink-0 text-gold-strong transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          ))}
        </section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <CompendiumFeature
          icon={UsersRound}
          title={copy("Times e elencos", "Teams and rosters", "Equipos y plantillas")}
          body={copy(
            "Logo, elenco atual e fontes registradas por entrada.",
            "Logo, current roster and sources recorded per entry.",
            "Logo, plantilla actual y fuentes registradas por entrada.",
          )}
        />
        <CompendiumFeature
          icon={Crosshair}
          title={copy("Configurações pro", "Pro settings", "Configuraciones pro")}
          body={
            game === "valorant"
              ? copy("DPI, sensibilidade, eDPI, mouse, polling rate, resolução e código de mira quando verificados.", "DPI, sensitivity, eDPI, mouse, polling rate, resolution and crosshair code when verified.", "DPI, sensibilidad, eDPI, ratón, polling rate, resolución y código de mira cuando estén verificados.")
              : copy("Mouse, resolução, vídeo e outras configurações quando houver fonte confiável.", "Mouse, resolution, video and other settings when a reliable source exists.", "Ratón, resolución, vídeo y otras configuraciones cuando exista una fuente fiable.")
          }
        />
        <CompendiumFeature
          icon={ShieldCheck}
          title={copy("Procedência", "Provenance", "Procedencia")}
          body={copy(
            "Cada dado sensível a mudança recebe URL de origem e data da última conferência.",
            "Every change-sensitive data point gets a source URL and last-checked date.",
            "Cada dato sensible a cambios recibe URL de origen y fecha de última verificación.",
          )}
        />
      </div>

      {teams.length > 0 ? (
        <section className="surface-panel p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <UsersRound className="size-5 text-gold-strong" />
            <h3 className="font-display text-xl font-semibold text-foreground">
              {copy("Times e elencos atuais", "Current teams and rosters", "Equipos y plantillas actuales")}
            </h3>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {teams.map((team) => {
              const roster = players.filter((player) => team.playerIds.includes(player.id));
              const source = team.sources[0];
              return (
                <article key={team.id} className="rounded-xl border border-border bg-muted/10 p-4">
                  <div className="flex items-center gap-3">
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt="" className="size-10 rounded-lg object-contain" loading="lazy" />
                    ) : (
                      <div className="grid size-10 place-items-center rounded-lg border border-border text-xs font-bold">{team.shortName}</div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{team.name}</p>
                      <p className="text-xs text-muted-foreground">{team.shortName}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {roster.map((player) => (
                      <span key={player.id} className="rounded-full border border-border bg-background/60 px-2 py-1 text-[11px] text-muted-foreground">
                        {player.handle}
                      </span>
                    ))}
                  </div>
                  {source ? (
                    <a href={source.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-gold-strong hover:underline">
                      VLR.gg <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {playersWithSettings.length > 0 ? (
        <section className="surface-panel p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <MousePointer2 className="size-5 text-gold-strong" />
            <h3 className="font-display text-xl font-semibold text-foreground">
              {copy("Pro Settings verificadas", "Verified pro settings", "Pro Settings verificadas")}
            </h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {copy(
              "Primeiro lote da v0.1.9. Os demais jogadores continuam com acesso direto ao diretório ao vivo do ProSettings até a conferência individual.",
              "First v0.1.9 batch. Remaining players keep a direct path to the live ProSettings directory until individually verified.",
              "Primer lote de v0.1.9. Los demás jugadores mantienen acceso directo al directorio en vivo de ProSettings hasta su verificación individual.",
            )}
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {playersWithSettings.map((player) => {
              const settings = player.settings!;
              const proSource = player.sources.find((source) => source.label === "ProSettings.net");
              return (
                <article key={player.id} className="rounded-xl border border-border bg-muted/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-semibold text-foreground">{player.handle}</p>
                      <p className="text-xs text-muted-foreground">{teams.find((team) => team.id === player.teamId)?.name}</p>
                    </div>
                    {proSource ? (
                      <a href={proSource.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-gold-strong hover:underline">
                        ProSettings <ExternalLink className="size-3" />
                      </a>
                    ) : null}
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <Stat label="DPI" value={settings.dpi} />
                    <Stat label={copy("Sensibilidade", "Sensitivity", "Sensibilidad")} value={settings.sensitivity} />
                    <Stat label="eDPI" value={settings.edpi} />
                    <Stat label="Hz" value={settings.pollingRateHz} />
                    <Stat label={copy("Resolução", "Resolution", "Resolución")} value={settings.resolution} />
                    <Stat label={copy("Tela", "Display", "Pantalla")} value={settings.displayMode} />
                  </dl>
                  {settings.mouse ? <p className="mt-4 text-xs leading-5 text-muted-foreground"><span className="font-semibold text-foreground">Mouse:</span> {settings.mouse}</p> : null}
                  {settings.crosshairCode ? (
                    <div className="mt-3 rounded-lg border border-border bg-background/50 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Crosshair</p>
                      <code className="mt-1 block max-h-12 overflow-hidden break-all text-[10px] leading-4 text-foreground">{settings.crosshairCode}</code>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {teams.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-muted/10 p-6 text-center">
          <Database className="mx-auto size-6 text-gold-strong" />
          <p className="mt-3 font-display text-lg font-semibold text-foreground">
            {copy("Base editorial em preparação", "Editorial dataset in preparation", "Base editorial en preparación")}
          </p>
        </section>
      ) : null}
    </div>
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

function CompendiumFeature({ icon: Icon, title, body }: { icon: typeof UsersRound; title: string; body: string }) {
  return (
    <article className="surface-panel p-5">
      <Icon className="size-5 text-gold-strong" />
      <h3 className="mt-4 font-display text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </article>
  );
}
