import { useEffect, useMemo, useState } from "react";
import { CalendarClock, ExternalLink, Radio } from "lucide-react";
import {
  VALORANT_ESPORTS_MATCHES,
  type ValorantEsportsFilter,
  type ValorantEsportsMatch,
} from "@/data/valorantEsports";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";
import { getValorantOfficialBroadcasts, type ValorantBroadcast } from "@/lib/valorant-broadcast.functions";

const FILTERS: ValorantEsportsFilter[] = ["all", "champions", "americas", "emea", "pacific", "china"];

export function ValorantEsportsPanel({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [filter, setFilter] = useState<ValorantEsportsFilter>("all");
  const [broadcasts, setBroadcasts] = useState<ValorantBroadcast[]>([]);
  const [broadcastProviderConfigured, setBroadcastProviderConfigured] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getValorantOfficialBroadcasts()
      .then((result) => {
        if (cancelled) return;
        setBroadcastProviderConfigured(result.configured);
        setBroadcasts(result.broadcasts);
      })
      .catch(() => {
        if (!cancelled) setBroadcastProviderConfigured(false);
      });
    return () => { cancelled = true; };
  }, []);

  const matches = useMemo(
    () => VALORANT_ESPORTS_MATCHES.filter((match) => filter === "all" || match.circuit === filter),
    [filter],
  );
  const liveMatches = matches.filter((match) => match.status === "live");
  const upcoming = matches.filter((match) => match.status === "upcoming").slice(0, 6);
  const officialLive = broadcasts.find((broadcast) => broadcast.status === "live");

  return (
    <section className="surface-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Radio className="size-4 text-gold-strong" />
          <h2 className="font-display text-sm font-semibold uppercase text-foreground">
            {copy("Cenário competitivo", "Competitive scene", "Escena competitiva")}
          </h2>
        </div>
        <span className={cn("size-2 rounded-full", liveMatches.length || officialLive ? "animate-pulse bg-red-500" : "bg-gold/70")} aria-hidden="true" />
      </div>

      <div className="flex gap-1.5 overflow-x-auto border-b border-border px-4 py-3">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-[0.64rem] font-bold uppercase tracking-[0.08em] transition-colors",
              filter === item
                ? "border-gold/45 bg-gold/10 text-foreground"
                : "border-border text-muted-foreground hover:border-gold/25 hover:text-foreground",
            )}
          >
            {filterLabel(item, locale)}
          </button>
        ))}
      </div>

      {officialLive ? (
        <div className="border-b border-border bg-red-500/[0.045] p-4">
          <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-red-400">{copy("Transmissão oficial ao vivo", "Official live broadcast", "Transmisión oficial en vivo")}</p>
          <a href={officialLive.url} target="_blank" rel="noreferrer" className="group block rounded-xl border border-red-500/20 bg-background/55 p-3 transition-colors hover:border-red-400/40">
            <p className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">{officialLive.title}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-red-400">{copy("Abrir no YouTube", "Open on YouTube", "Abrir en YouTube")}<ExternalLink className="size-3.5 transition-transform group-hover:translate-x-0.5" /></span>
          </a>
        </div>
      ) : null}

      {liveMatches.length ? (
        <div className="border-b border-border bg-red-500/[0.035] p-4">
          <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-red-400">{copy("Ao vivo agora", "Live now", "En vivo ahora")}</p>
          {liveMatches.map((match) => <MatchRow key={match.id} match={match} locale={locale} />)}
        </div>
      ) : null}

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-muted-foreground"><CalendarClock className="size-4" /><span className="text-[0.68rem] font-bold uppercase tracking-[0.12em]">{copy("Próximas partidas", "Upcoming matches", "Próximas partidas")}</span></div>
          <span className="text-[0.64rem] font-semibold text-muted-foreground">{copy("horário local", "local time", "hora local")}</span>
        </div>

        {upcoming.length ? (
          <div className="space-y-2">{upcoming.map((match) => <MatchRow key={match.id} match={match} locale={locale} />)}</div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-5 text-center text-xs leading-5 text-muted-foreground">
            {copy("Nenhuma partida futura cadastrada para este filtro.", "No upcoming matches are registered for this filter.", "No hay partidas futuras registradas para este filtro.")}
          </div>
        )}

        <div className="mt-4 rounded-xl border border-dashed border-border px-3.5 py-3 text-[0.68rem] leading-5 text-muted-foreground">
          {broadcastProviderConfigured
            ? copy(
                "Agenda editorial baseada no calendário oficial. O MGP já consulta o canal oficial do VCT para detectar transmissões ao vivo.",
                "Editorial schedule based on the official calendar. MGP is already checking the official VCT channel for live broadcasts.",
                "Agenda editorial basada en el calendario oficial. MGP ya consulta el canal oficial de VCT para detectar transmisiones en vivo.",
              )
            : copy(
                "Agenda inicial baseada no calendário oficial do VALORANT Esports. A descoberta automática de lives fica pronta assim que a chave da API do YouTube for configurada no servidor.",
                "Initial schedule based on the official VALORANT Esports calendar. Automatic live discovery becomes active as soon as the YouTube API key is configured on the server.",
                "Agenda inicial basada en el calendario oficial de VALORANT Esports. El descubrimiento automático de directos se activa cuando la clave de la API de YouTube se configura en el servidor.",
              )}
        </div>
      </div>
    </section>
  );
}

function MatchRow({ match, locale }: { match: ValorantEsportsMatch; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const localeCode = locale === "pt-BR" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US";
  const date = new Date(match.scheduledAt);
  const dateLabel = new Intl.DateTimeFormat(localeCode, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);

  const body = (
    <div className="rounded-xl border border-border bg-muted/20 p-3 transition-colors hover:border-gold/30 hover:bg-gold/[0.035]">
      <div className="flex items-center justify-between gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        <div className="flex min-w-0 items-center gap-2">
          {match.competitionLogoUrl ? (
            <span className="grid size-6 shrink-0 place-items-center rounded-md border border-border bg-black/30 p-1">
              <img src={match.competitionLogoUrl} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
            </span>
          ) : null}
          <span className="truncate">{match.competition} · {match.stage}</span>
        </div>
        <span className="shrink-0">Bo{match.bestOf}</span>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Team team={match.teamA} align="left" />
        <div className="text-center">
          {match.status === "live" ? <span className="rounded-full bg-red-500/15 px-2 py-1 text-[0.62rem] font-bold uppercase text-red-400">LIVE</span> : <span className="text-[0.66rem] font-semibold text-muted-foreground">{dateLabel}</span>}
        </div>
        <Team team={match.teamB} align="right" />
      </div>
      {match.status === "live" && match.broadcastUrl ? (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-gold-strong"><ExternalLink className="size-3.5" />{copy("Assistir transmissão", "Watch broadcast", "Ver transmisión")}</div>
      ) : null}
    </div>
  );

  return match.status === "live" && match.broadcastUrl ? <a href={match.broadcastUrl} target="_blank" rel="noreferrer">{body}</a> : body;
}

function Team({ team, align }: { team: ValorantEsportsMatch["teamA"]; align: "left" | "right" }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", align === "right" && "flex-row-reverse text-right")}>
      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border border-gold/20 bg-white p-1 shadow-sm">
        {team.logoUrl ? (
          <img src={team.logoUrl} alt={`${team.name} logo`} className="max-h-full max-w-full object-contain" loading="lazy" />
        ) : (
          <span className="font-display text-[0.58rem] font-black text-black">{team.short.slice(0, 4)}</span>
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold text-foreground" title={team.name}>{team.name}</span>
        <span className="block text-[0.58rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">{team.short}</span>
      </span>
    </div>
  );
}

function filterLabel(filter: ValorantEsportsFilter, locale: Locale) {
  if (filter === "all") return locale === "pt-BR" ? "Todos" : locale === "es" ? "Todos" : "All";
  if (filter === "champions") return "Champions";
  if (filter === "americas") return "Americas";
  if (filter === "emea") return "EMEA";
  if (filter === "pacific") return "Pacific";
  if (filter === "china") return "China";
  return filter;
}
