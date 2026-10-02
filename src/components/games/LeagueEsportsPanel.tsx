import { CalendarDays, ExternalLink, Globe2, RadioTower, Swords, Trophy } from "lucide-react";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

type EventStatus = "completed" | "upcoming";

type EsportsEvent = {
  key: string;
  badge: string;
  name: string;
  dates: string;
  location: string;
  status: EventStatus;
  href: string;
  description: Record<Locale, string>;
};

type UpcomingMatch = {
  key: string;
  date: string;
  league: string;
  left: string;
  right: string;
  format: string;
  href: string;
};

const EVENTS: EsportsEvent[] = [
  {
    key: "worlds-2026",
    badge: "W",
    name: "Worlds 2026",
    dates: "15 Oct — 14 Nov 2026",
    location: "International",
    status: "upcoming",
    href: "https://lolesports.com/",
    description: {
      "pt-BR":
        "O Mundial fecha a temporada competitiva com as equipes classificadas pelos circuitos regionais e eventos internacionais.",
      en: "Worlds closes the competitive season with teams qualified through regional circuits and international events.",
      es: "El Mundial cierra la temporada competitiva con equipos clasificados desde circuitos regionales y eventos internacionales.",
    },
  },
  {
    key: "msi-2026",
    badge: "MSI",
    name: "Mid-Season Invitational 2026",
    dates: "28 Jun — 12 Jul 2026",
    location: "Daejeon · South Korea",
    status: "completed",
    href: "https://lolesports.com/",
    description: {
      "pt-BR":
        "O principal evento internacional de meio de temporada reuniu representantes dos circuitos Tier 1.",
      en: "The main mid-season international event brought together representatives from Tier 1 circuits.",
      es: "El principal evento internacional de mitad de temporada reunió representantes de los circuitos Tier 1.",
    },
  },
  {
    key: "first-stand-2026",
    badge: "FST",
    name: "First Stand 2026",
    dates: "16 Mar — 22 Mar 2026",
    location: "International",
    status: "completed",
    href: "https://lolesports.com/",
    description: {
      "pt-BR":
        "Primeiro grande encontro internacional da temporada, formado a partir das etapas regionais iniciais.",
      en: "The season's first major international meeting, built from the opening regional stages.",
      es: "El primer gran encuentro internacional de la temporada, formado desde las etapas regionales iniciales.",
    },
  },
];

const UPCOMING_MATCHES: UpcomingMatch[] = [
  {
    key: "lcs-2026-09-25",
    date: "25 Sep",
    league: "LCS · Playoffs",
    left: "TBD",
    right: "Shopify Rebellion",
    format: "Bo5",
    href: "https://lolesports.com/",
  },
  {
    key: "cblol-2026-09-26",
    date: "26 Sep",
    league: "CBLOL · Playoffs",
    left: "FURIA",
    right: "RED Canids",
    format: "Bo5",
    href: "https://lolesports.com/",
  },
  {
    key: "lcs-2026-09-26",
    date: "26 Sep",
    league: "LCS · Playoffs",
    left: "TBD",
    right: "TBD",
    format: "Bo5",
    href: "https://lolesports.com/",
  },
  {
    key: "cblol-2026-09-27",
    date: "27 Sep",
    league: "CBLOL · Upper Final",
    left: "LOUD",
    right: "LOS",
    format: "Bo5",
    href: "https://lolesports.com/",
  },
  {
    key: "lcs-2026-09-27",
    date: "27 Sep",
    league: "LCS · Playoffs",
    left: "TBD",
    right: "Cloud9",
    format: "Bo5",
    href: "https://lolesports.com/",
  },
  {
    key: "lcs-2026-10-03",
    date: "03 Oct",
    league: "LCS · Playoffs",
    left: "TBD",
    right: "TBD",
    format: "Bo5",
    href: "https://lolesports.com/",
  },
];

const REGIONS = ["CBLOL", "LCK", "LPL", "LEC", "LCS", "LCP"];

export function LeagueEsportsPanel({
  locale,
  compact = false,
  onOpenCompetitive,
}: {
  locale: Locale;
  compact?: boolean;
  onOpenCompetitive?: () => void;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  if (compact) {
    return (
      <aside className="surface-panel overflow-hidden lg:self-start">
        <div className="border-b border-border p-5">
          <div className="flex items-center gap-2 text-gold-strong">
            <Trophy className="size-4" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em]">
              LoL Esports · 2026
            </span>
          </div>
          <h2 className="mt-2 font-display text-xl font-semibold text-foreground">
            {copy("Circuito competitivo", "Competitive circuit", "Circuito competitivo")}
          </h2>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {copy(
              "Eventos globais, agenda recente e acesso ao diretório de times e jogadores.",
              "Global events, recent schedule and access to the team/player directory.",
              "Eventos globales, calendario reciente y acceso al directorio de equipos y jugadores.",
            )}
          </p>
        </div>

        <div className="divide-y divide-border">
          {UPCOMING_MATCHES.slice(0, 3).map((match) => (
            <a
              key={match.key}
              href={match.href}
              target="_blank"
              rel="noreferrer"
              className="group block p-4 transition-colors hover:bg-muted/25"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-gold-strong">
                  {match.date}
                </span>
                <span className="text-[0.62rem] font-semibold text-muted-foreground">
                  {match.league}
                </span>
              </div>
              <p className="mt-2 truncate text-sm font-semibold text-foreground">
                {match.left} <span className="text-muted-foreground">×</span> {match.right}
              </p>
              <div className="mt-1 flex items-center justify-between gap-2 text-[0.65rem] text-muted-foreground">
                <span>{match.format}</span>
                <ExternalLink className="size-3 transition-colors group-hover:text-gold-strong" />
              </div>
            </a>
          ))}
        </div>

        <div className="border-t border-border p-4">
          <p className="text-[0.62rem] leading-5 text-muted-foreground">
            {copy(
              "Agenda revisada em 21/09/2026. Confrontos marcados como TBD ainda dependem do resultado das chaves.",
              "Schedule reviewed on 2026-09-21. TBD matchups still depend on bracket results.",
              "Calendario revisado el 21/09/2026. Los cruces TBD todavía dependen de los resultados del cuadro.",
            )}
          </p>
          {onOpenCompetitive ? (
            <button
              type="button"
              onClick={onOpenCompetitive}
              className="mt-4 text-xs font-bold text-gold-strong hover:underline"
            >
              {copy("Abrir competitivo →", "Open competitive →", "Abrir competitivo →")}
            </button>
          ) : null}
        </div>
      </aside>
    );
  }

  return (
    <section className="space-y-6">
      <div className="surface-panel p-5 sm:p-6">
        <div className="flex items-center gap-2 text-gold-strong">
          <RadioTower className="size-4" />
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em]">
            LoL Esports · 2026
          </span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {copy(
            "Competitivo de League of Legends",
            "League of Legends competitive",
            "Competitivo de League of Legends",
          )}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {copy(
            "A área competitiva agora combina calendário, eventos internacionais e o diretório ÍMPAR de times/jogadores. Configurações pessoais não são inventadas: o perfil mostra função e dados profissionais apenas quando existe fonte.",
            "The competitive area now combines schedule, international events and ÍMPAR's team/player directory. Personal settings are never invented: profiles show role and professional data only when a source exists.",
            "El área competitiva combina calendario, eventos internacionales y el directorio ÍMPAR de equipos/jugadores. Las configuraciones personales nunca se inventan: el perfil muestra rol y datos profesionales solo cuando existe una fuente.",
          )}
        </p>
      </div>

      <section className="surface-panel overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border p-5">
          <div>
            <div className="flex items-center gap-2">
              <Swords className="size-4 text-gold-strong" />
              <h3 className="font-display text-xl font-semibold text-foreground">
                {copy("Próximos jogos", "Upcoming matches", "Próximos partidos")}
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {copy(
                "Snapshot do calendário oficial · 21/09/2026",
                "Official schedule snapshot · 2026-09-21",
                "Snapshot del calendario oficial · 21/09/2026",
              )}
            </p>
          </div>
          <a
            href="https://lolesports.com/"
            target="_blank"
            rel="noreferrer"
            className="shrink-0 text-xs font-bold text-gold-strong hover:underline"
          >
            LoL Esports ↗
          </a>
        </div>

        <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
          {UPCOMING_MATCHES.map((match) => (
            <a
              key={match.key}
              href={match.href}
              target="_blank"
              rel="noreferrer"
              className="group bg-background p-4 transition-colors hover:bg-muted/20"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-gold/25 bg-gold/5 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.1em] text-gold-strong">
                  {match.date}
                </span>
                <span className="text-[0.65rem] font-semibold text-muted-foreground">
                  {match.format}
                </span>
              </div>
              <p className="mt-3 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                {match.league}
              </p>
              <div className="mt-2 space-y-1">
                <p className="truncate text-sm font-semibold text-foreground">{match.left}</p>
                <p className="text-[0.62rem] font-black uppercase tracking-[0.12em] text-muted-foreground">
                  vs
                </p>
                <p className="truncate text-sm font-semibold text-foreground">{match.right}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {EVENTS.map((event) => (
          <article key={event.key} className="surface-panel overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-border p-5">
              <EventBadge event={event} large />
              <StatusPill status={event.status} locale={locale} />
            </div>
            <div className="p-5">
              <h3 className="font-display text-xl font-semibold text-foreground">{event.name}</h3>
              <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-3.5 text-gold-strong" />
                  {event.dates}
                </p>
                <p className="flex items-center gap-2">
                  <Globe2 className="size-3.5 text-gold-strong" />
                  {event.location}
                </p>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {event.description[locale]}
              </p>
              <a
                href={event.href}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-gold-strong hover:underline"
              >
                {copy("Ver no LoL Esports", "View on LoL Esports", "Ver en LoL Esports")}{" "}
                <ExternalLink className="size-3" />
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="surface-panel p-5 sm:p-6">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {copy("Circuitos Tier 1", "Tier 1 circuits", "Circuitos Tier 1")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <span
              key={region}
              className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm font-bold text-foreground"
            >
              {region}
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          {copy(
            "Calendário e estrutura vêm do LoL Esports oficial. O diretório de elencos usa snapshots datados e mantém a fonte visível; logos e fotos só entram quando existe procedência adequada.",
            "Schedule and structure come from official LoL Esports. The roster directory uses dated snapshots with visible sources; logos and photos are added only when provenance is adequate.",
            "El calendario y la estructura provienen de LoL Esports oficial. El directorio usa snapshots fechados con fuentes visibles; logos y fotos solo se añaden cuando existe procedencia adecuada.",
          )}
        </p>
      </div>
    </section>
  );
}

function EventBadge({ event, large = false }: { event: EsportsEvent; large?: boolean }) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-xl border border-gold/30 bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.22),transparent_72%),hsl(var(--muted)/0.2)] font-black tracking-tight text-gold-strong",
        large ? "size-16 text-sm" : "size-11 text-[0.65rem]",
      )}
    >
      {event.badge}
    </div>
  );
}

function StatusPill({ status, locale }: { status: EventStatus; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const label =
    status === "upcoming"
      ? copy("Próximo", "Upcoming", "Próximo")
      : copy("Concluído", "Completed", "Finalizado");

  return (
    <span className="rounded-full border border-border bg-muted/25 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
      {label}
    </span>
  );
}
