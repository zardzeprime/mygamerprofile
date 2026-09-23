import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  Newspaper,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { LEAGUE_NEWS, type LeagueNewsCategory } from "@/data/leagueNews";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

type Filter = "all" | LeagueNewsCategory;
type Order = "newest" | "oldest";

const FILTERS: Filter[] = ["all", "patch", "announcement", "esports", "media", "dev"];

export function LeagueNews({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<Order>("newest");

  const items = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return LEAGUE_NEWS.filter((item) => {
      if (filter !== "all" && item.category !== filter) return false;
      if (!term) return true;
      return `${item.title[locale]} ${item.summary[locale]} ${item.sourceLabel}`
        .toLocaleLowerCase()
        .includes(term);
    }).sort((a, b) => {
      const delta = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return order === "newest" ? delta : -delta;
    });
  }, [filter, locale, order, query]);

  const upcoming = items.filter((item) => item.upcoming);
  const published = items.filter((item) => !item.upcoming);

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-2xl border border-gold/25 bg-[radial-gradient(circle_at_top_right,rgba(12,92,140,0.16),transparent_36%),hsl(var(--surface))] p-6 sm:p-8">
        <div className="flex items-center gap-2 text-gold-strong">
          <Newspaper className="size-4" />
          <span className="section-kicker">{copy("FEED OFICIAL", "OFFICIAL FEED", "FEED OFICIAL")}</span>
        </div>
        <h2 className="mt-3 font-display text-3xl font-bold">
          {copy("Novidades de League", "League news", "Novedades de League")}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          {copy(
            "Patches, anúncios e esports reunidos somente de Riot Games e LoL Esports. A ordem é cronológica e rumores ficam de fora.",
            "Patches, announcements and esports gathered only from Riot Games and LoL Esports. The archive is chronological and excludes rumors.",
            "Parches, anuncios y esports reunidos solo de Riot Games y LoL Esports. El archivo es cronológico y excluye rumores.",
          )}
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/[0.06] px-3 py-1.5 text-[0.68rem] font-semibold text-muted-foreground">
          <ShieldCheck className="size-3.5 text-gold-strong" />
          {copy("Somente fonte oficial", "Official sources only", "Solo fuentes oficiales")}
        </div>
      </header>

      <div className="space-y-3 border-y border-border py-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 focus-within:border-gold/60">
            <Search className="size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-auto border-0 p-0 shadow-none"
              placeholder={copy("Buscar novidade", "Search news", "Buscar novedad")}
            />
          </label>
          <button
            type="button"
            onClick={() => setOrder((current) => (current === "newest" ? "oldest" : "newest"))}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-gold/30 hover:text-foreground"
          >
            <SlidersHorizontal className="size-3.5" />
            {order === "newest"
              ? copy("Mais recentes primeiro", "Newest first", "Más recientes primero")
              : copy("Mais antigas primeiro", "Oldest first", "Más antiguas primero")}
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === item
                  ? "border-gold/50 bg-gold/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-gold/30 hover:text-foreground",
              )}
            >
              {filterLabel(item, locale)}
            </button>
          ))}
        </div>
      </div>

      {upcoming.length ? (
        <section className="rounded-2xl border border-gold/25 bg-gold/[0.035] p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <CalendarClock className="size-4 text-gold-strong" />
            <h3 className="font-display text-lg font-semibold">
              {copy("Confirmado para breve", "Confirmed upcoming", "Confirmado próximamente")}
            </h3>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {upcoming.map((item) => <NewsCard key={item.id} item={item} locale={locale} featured />)}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold">{copy("Arquivo", "Archive", "Archivo")}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {copy(`${published.length} itens encontrados`, `${published.length} items found`, `${published.length} elementos encontrados`)}
            </p>
          </div>
          <a
            href="https://www.leagueoflegends.com/pt-br/news/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-strong hover:text-foreground"
          >
            Riot News <ArrowUpRight className="size-3.5" />
          </a>
        </div>

        {published.length ? (
          <div className="relative space-y-3 before:absolute before:bottom-5 before:left-[0.92rem] before:top-5 before:w-px before:bg-border sm:before:left-[1.15rem]">
            {published.map((item) => <NewsCard key={item.id} item={item} locale={locale} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            {copy("Nenhuma novidade corresponde aos filtros.", "No news matches these filters.", "Ninguna novedad coincide con los filtros.")}
          </div>
        )}
      </section>
    </div>
  );
}

function NewsCard({
  item,
  locale,
  featured = false,
}: {
  item: (typeof LEAGUE_NEWS)[number];
  locale: Locale;
  featured?: boolean;
}) {
  const dateLocale = locale === "pt-BR" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US";
  const date = new Intl.DateTimeFormat(dateLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(item.publishedAt));

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group relative block overflow-hidden rounded-xl border bg-surface p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-lift sm:p-5",
        featured ? "border-gold/30" : "ml-8 border-border sm:ml-10",
      )}
    >
      {!featured ? (
        <span
          className="absolute -left-[2.03rem] top-5 size-3 rounded-full border-2 border-background bg-gold shadow-[0_0_0_3px_hsl(var(--surface))] sm:-left-[2.45rem]"
          aria-hidden="true"
        />
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-gold/20 bg-gold/[0.06] px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-gold-strong">
            {categoryLabel(item.category, locale)}
          </span>
          <span className="inline-flex items-center gap-1 text-[0.64rem] font-semibold text-muted-foreground">
            <ShieldCheck className="size-3" />
            {item.sourceLabel}
          </span>
        </div>
        <span className="text-[0.64rem] font-semibold text-muted-foreground">{date}</span>
      </div>
      <div className="mt-3 flex items-start justify-between gap-4">
        <div>
          <h4 className="font-display text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-gold-strong">
            {item.title[locale]}
          </h4>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary[locale]}</p>
        </div>
        <ArrowUpRight className="mt-1 size-4 shrink-0 text-gold-strong" />
      </div>
    </a>
  );
}

function filterLabel(filter: Filter, locale: Locale) {
  if (filter === "all") return locale === "pt-BR" ? "Tudo" : locale === "es" ? "Todo" : "All";
  return categoryLabel(filter, locale);
}

function categoryLabel(category: LeagueNewsCategory, locale: Locale) {
  const values: Record<LeagueNewsCategory, [string, string, string]> = {
    patch: ["Atualizações", "Patches", "Actualizaciones"],
    announcement: ["Anúncios", "Announcements", "Anuncios"],
    esports: ["Esports", "Esports", "Esports"],
    media: ["Mídia", "Media", "Media"],
    dev: ["Dev", "Dev", "Dev"],
  };
  const row = values[category];
  return locale === "pt-BR" ? row[0] : locale === "es" ? row[2] : row[1];
}
