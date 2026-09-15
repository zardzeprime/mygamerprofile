import { CalendarDays, ExternalLink, Globe2, RadioTower, Trophy } from "lucide-react";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

type EventStatus = "completed" | "upcoming" | "regional";

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

const EVENTS: EsportsEvent[] = [
  {
    key: "worlds-2026",
    badge: "W",
    name: "Worlds 2026",
    dates: "15 Oct — 14 Nov 2026",
    location: "Los Angeles · Allen · Brooklyn",
    status: "upcoming",
    href: "https://lolesports.com/",
    description: {
      "pt-BR": "O Mundial fecha a temporada competitiva com as melhores equipes classificadas das ligas regionais e eventos internacionais.",
      en: "Worlds closes the competitive season with the best teams qualified through regional leagues and international events.",
      es: "El Mundial cierra la temporada competitiva con los mejores equipos clasificados desde ligas regionales y eventos internacionales.",
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
      "pt-BR": "Evento internacional de meio de temporada que reúne as principais forças de cada região e influencia a classificação para o Mundial.",
      en: "The mid-season international event brings together leading teams from every region and affects qualification for Worlds.",
      es: "El evento internacional de mitad de temporada reúne a las principales fuerzas de cada región e influye en la clasificación al Mundial.",
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
      "pt-BR": "Primeiro grande encontro internacional da temporada, formado a partir dos melhores desempenhos das etapas regionais iniciais.",
      en: "The season's first major international meeting, built from the best results of the opening regional stages.",
      es: "El primer gran encuentro internacional de la temporada, formado por los mejores resultados de las etapas regionales iniciales.",
    },
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
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em]">LoL Esports · 2026</span>
          </div>
          <h2 className="mt-2 font-display text-xl font-semibold text-foreground">
            {copy("Circuito competitivo", "Competitive circuit", "Circuito competitivo")}
          </h2>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {copy("Os principais eventos globais da temporada e o caminho até o Mundial.", "The season's main global events and the road to Worlds.", "Los principales eventos globales de la temporada y el camino al Mundial.")}
          </p>
        </div>

        <div className="divide-y divide-border">
          {EVENTS.map((event) => (
            <a key={event.key} href={event.href} target="_blank" rel="noreferrer" className="group flex gap-3 p-4 transition-colors hover:bg-muted/25">
              <EventBadge event={event} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold text-foreground">{event.name}</h3>
                  <ExternalLink className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-gold-strong" />
                </div>
                <p className="mt-1 text-[0.7rem] font-medium text-muted-foreground">{event.dates}</p>
                <p className="mt-1 truncate text-[0.68rem] text-muted-foreground/80">{event.location}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="border-t border-border p-4">
          <div className="flex flex-wrap gap-1.5">
            {REGIONS.map((region) => (
              <span key={region} className="rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[0.65rem] font-bold text-muted-foreground">{region}</span>
            ))}
          </div>
          {onOpenCompetitive ? (
            <button type="button" onClick={onOpenCompetitive} className="mt-4 text-xs font-bold text-gold-strong hover:underline">
              {copy("Abrir visão competitiva →", "Open competitive view →", "Abrir vista competitiva →")}
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
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em]">LoL Esports · Tier 1</span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {copy("Temporada competitiva de League of Legends", "League of Legends competitive season", "Temporada competitiva de League of Legends")}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {copy("A temporada global combina ligas regionais, First Stand, MSI e Worlds. Esta seção funciona como porta de entrada; resultados e integrações ao vivo entram quando a API oficial estiver conectada.", "The global season combines regional leagues, First Stand, MSI and Worlds. This section is an entry point; live results and integrations arrive when the official API is connected.", "La temporada global combina ligas regionales, First Stand, MSI y Worlds. Esta sección funciona como punto de entrada; resultados e integraciones en vivo llegarán cuando conectemos la API oficial.")}
        </p>
      </div>

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
                <p className="flex items-center gap-2"><CalendarDays className="size-3.5 text-gold-strong" />{event.dates}</p>
                <p className="flex items-center gap-2"><Globe2 className="size-3.5 text-gold-strong" />{event.location}</p>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{event.description[locale]}</p>
              <a href={event.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-gold-strong hover:underline">
                {copy("Ver no LoL Esports", "View on LoL Esports", "Ver en LoL Esports")} <ExternalLink className="size-3" />
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="surface-panel p-5 sm:p-6">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">{copy("Principais regiões Tier 1", "Main Tier 1 regions", "Principales regiones Tier 1")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <span key={region} className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm font-bold text-foreground">{region}</span>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">
          {copy("Calendário e estrutura desta seção são resumidos a partir do LoL Esports oficial. Logos de terceiros não são copiados automaticamente de wikis; cada mídia precisa ter licença própria compatível.", "Schedule and structure here are summarized from official LoL Esports sources. Third-party logos are not automatically copied from wikis; each media file needs its own compatible license.", "El calendario y la estructura se resumen a partir de fuentes oficiales de LoL Esports. Los logos de terceros no se copian automáticamente de wikis; cada archivo necesita una licencia compatible.")}
        </p>
      </div>
    </section>
  );
}

function EventBadge({ event, large = false }: { event: EsportsEvent; large?: boolean }) {
  return (
    <div className={cn("grid shrink-0 place-items-center rounded-xl border border-gold/30 bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.22),transparent_72%),hsl(var(--muted)/0.2)] font-black tracking-tight text-gold-strong", large ? "size-16 text-sm" : "size-11 text-[0.65rem]")}>{event.badge}</div>
  );
}

function StatusPill({ status, locale }: { status: EventStatus; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const label = status === "upcoming" ? copy("Próximo", "Upcoming", "Próximo") : status === "completed" ? copy("Concluído", "Completed", "Finalizado") : copy("Regional", "Regional", "Regional");
  return <span className="rounded-full border border-border bg-muted/25 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">{label}</span>;
}
