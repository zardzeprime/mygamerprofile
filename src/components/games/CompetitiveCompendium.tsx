import { Crosshair, Database, ShieldCheck, UsersRound } from "lucide-react";

import { getEsportsPlayers, getEsportsTeams, type EsportsGameSlug } from "@/data/esportsCompendium";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

export function CompetitiveCompendium({ game, locale }: { game: EsportsGameSlug; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const teams = getEsportsTeams(game);
  const players = getEsportsPlayers(game);

  return (
    <div className="space-y-5">
      <section className="surface-panel p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker">MGP COMPENDIUM / 0.1.9</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-foreground">
              {copy("Compêndio competitivo", "Competitive compendium", "Compendio competitivo")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {copy(
                "Times, jogadores e configurações profissionais vão entrar aqui com fonte e data de verificação. O MGP não cria um banco por scraping automático de sites de terceiros.",
                "Teams, players and professional settings will live here with source and verification date. MGP does not build this database by automatically scraping third-party sites.",
                "Equipos, jugadores y configuraciones profesionales vivirán aquí con fuente y fecha de verificación. MGP no crea esta base mediante scraping automático de terceros.",
              )}
            </p>
          </div>
          <div className="flex gap-2 text-xs font-semibold text-muted-foreground">
            <span className="rounded-full border border-border px-3 py-1.5">{teams.length} {copy("times", "teams", "equipos")}</span>
            <span className="rounded-full border border-border px-3 py-1.5">{players.length} {copy("jogadores", "players", "jugadores")}</span>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <CompendiumFeature
          icon={UsersRound}
          title={copy("Times e elencos", "Teams and rosters", "Equipos y plantillas")}
          body={copy(
            "Logo, país, elenco atual e fontes registradas por entrada.",
            "Logo, country, current roster and sources recorded per entry.",
            "Logo, país, plantilla actual y fuentes registradas por entrada.",
          )}
        />
        <CompendiumFeature
          icon={Crosshair}
          title={copy("Configurações pro", "Pro settings", "Configuraciones pro")}
          body={
            game === "valorant"
              ? copy("DPI, sensibilidade, eDPI e código de mira copiável.", "DPI, sensitivity, eDPI and copyable crosshair code.", "DPI, sensibilidad, eDPI y código de mira copiable.")
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

      <section className="rounded-2xl border border-dashed border-border bg-muted/10 p-6 text-center">
        <Database className="mx-auto size-6 text-gold-strong" />
        <p className="mt-3 font-display text-lg font-semibold text-foreground">
          {copy("Base editorial em preparação", "Editorial dataset in preparation", "Base editorial en preparación")}
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {copy(
            "As estruturas de time/jogador já estão no código. Vamos preencher por lotes, conferindo licença de logos/fotos e atualidade das configurações antes de publicar.",
            "Team/player structures are already in code. We will populate them in batches, checking logo/photo rights and settings freshness before publication.",
            "Las estructuras de equipo/jugador ya están en el código. Las llenaremos por lotes, revisando derechos de logos/fotos y vigencia de configuraciones antes de publicar.",
          )}
        </p>
      </section>
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
