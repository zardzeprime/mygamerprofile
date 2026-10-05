import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Clock3,
  Coins,
  ExternalLink,
  ImageOff,
  Loader2,
  PackageSearch,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";

import { WarframeCodex } from "@/components/games/WarframeCodex";
import { WarframeWeapons } from "@/components/games/WarframeWeapons";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

type WarframeDatabaseMode = "warframes" | "weapons" | "items";

type WarframeDrop = {
  location?: string;
  chance?: number;
  rarity?: string;
  type?: string;
};

type WarframeItem = {
  uniqueName?: string;
  name: string;
  description?: string;
  imageName?: string;
  type?: string;
  category?: string;
  productCategory?: string;
  tradable?: boolean;
  buildPrice?: number;
  buildTime?: number;
  skipBuildTimePrice?: number;
  buildQuantity?: number;
  components?: WarframeComponent[];
  drops?: WarframeDrop[];
};

type WarframeComponent = WarframeItem & {
  itemCount?: number;
  count?: number;
};

const API_BASE = "https://api.warframestat.us";
const IMAGE_BASE = "https://cdn.warframestat.us/img";
const API_DOCS = "https://docs.warframestat.us/";
const OFFICIAL_DROPS = "https://www.warframe.com/droptables";
const STARTER_ITEM_SEARCH = "Forma,Orokin Reactor,Orokin Catalyst,Exilus Warframe Adapter";
const memoryCache = new Map<string, WarframeItem[]>();

function localeToApiLanguage(locale: Locale) {
  return locale === "pt-BR" ? "pt" : locale;
}

function itemKey(item: WarframeItem) {
  return item.uniqueName || `${item.name}-${item.type ?? item.category ?? "item"}`;
}

function imageUrl(item?: WarframeItem) {
  return item?.imageName ? `${IMAGE_BASE}/${encodeURIComponent(item.imageName)}` : undefined;
}

function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) return "—";
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  const hours = seconds / 3600;
  if (hours < 24) return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} h`;
  const days = hours / 24;
  return `${Number.isInteger(days) ? days : days.toFixed(1)} d`;
}

function formatNumber(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatPercent(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  const normalized = value <= 1 ? value * 100 : value;
  return `${normalized < 1 ? normalized.toFixed(2) : normalized.toFixed(1)}%`;
}

function normalizedDrops(item?: WarframeItem) {
  return Array.isArray(item?.drops) ? item.drops.filter(Boolean) : [];
}

function normalizedComponents(item?: WarframeItem) {
  return Array.isArray(item?.components)
    ? item.components.filter((component) => component?.name)
    : [];
}

function componentCount(component: WarframeComponent) {
  return component.itemCount ?? component.count ?? component.buildQuantity ?? 1;
}

function normalize(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

async function fetchItems(locale: Locale, search: string, signal: AbortSignal) {
  const language = localeToApiLanguage(locale);
  const normalizedSearch = search.trim() || STARTER_ITEM_SEARCH;
  const cacheKey = `items:${language}:${normalizedSearch.toLowerCase()}`;
  const cached = memoryCache.get(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({ language, remove: "patchlogs" });
  const response = await fetch(
    `${API_BASE}/items/search/${encodeURIComponent(normalizedSearch)}?${params.toString()}`,
    { signal, headers: { Accept: "application/json" } },
  );
  if (!response.ok) throw new Error(`WARFRAME_ITEMS_${response.status}`);
  const raw = (await response.json()) as unknown;
  const entries = Array.isArray(raw)
    ? raw.filter(
        (candidate): candidate is WarframeItem =>
          Boolean(candidate && typeof candidate === "object" && "name" in candidate),
      )
    : [];
  memoryCache.set(cacheKey, entries);
  return entries;
}

export function WarframeDatabase({ mode, locale }: { mode: WarframeDatabaseMode; locale: Locale }) {
  if (mode === "warframes") return <WarframeCodex locale={locale} />;
  if (mode === "weapons") return <WarframeWeapons locale={locale} />;
  return <WarframeItems locale={locale} />;
}

function WarframeItems({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [entries, setEntries] = useState<WarframeItem[]>([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetchItems(locale, debouncedQuery, controller.signal)
      .then((data) => {
        setEntries(data);
        setSelectedKey((current) =>
          current && data.some((item) => itemKey(item) === current)
            ? current
            : data[0]
              ? itemKey(data[0])
              : "",
        );
      })
      .catch((reason) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "WARFRAME_ITEMS_ERROR");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedQuery, locale]);

  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    if (!term || term === normalize(debouncedQuery)) return entries;
    return entries.filter((item) =>
      normalize([item.name, item.description, item.type, item.category].filter(Boolean).join(" ")).includes(term),
    );
  }, [debouncedQuery, entries, query]);

  const selected = entries.find((item) => itemKey(item) === selectedKey) ?? filtered[0] ?? entries[0];

  return (
    <div className="space-y-5">
      <section className="surface-panel overflow-hidden">
        <header className="wf-section-head grid gap-5 border-b border-border p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-[var(--impar-spectral)]">
              <Boxes className="size-4" />
              <span className="section-kicker">ÍMPAR / FUNDIÇÃO</span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
              {copy("Itens e Fundição", "Items and Foundry", "Objetos y Fundición")}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
              {copy(
                "Pesquise recursos, blueprints e equipamentos sem misturar esta biblioteca com Warframes e armas.",
                "Search resources, blueprints and equipment without mixing this library with Warframes and weapons.",
                "Busca recursos, planos y equipo sin mezclar esta biblioteca con Warframes y armas.",
              )}
            </p>
          </div>
          <label className="wf-search flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background/70 px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-auto border-0 bg-transparent p-0 shadow-none"
              placeholder={copy("Ex.: Forma, Neurodes...", "e.g. Forma, Neurodes...", "Ej.: Forma, Neurodes...")}
            />
          </label>
        </header>

        {error ? (
          <div className="p-6 sm:p-8">
            <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-5">
              <h3 className="font-display text-lg font-semibold text-foreground">{copy("A biblioteca não respondeu", "The library did not respond", "La biblioteca no respondió")}</h3>
              <a href={API_DOCS} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--impar-spectral)] hover:underline">{copy("Ver fonte", "View source", "Ver fuente")}<ExternalLink className="size-3.5" /></a>
            </div>
          </div>
        ) : loading ? (
          <div className="grid min-h-72 place-items-center p-8"><Loader2 className="size-6 animate-spin text-[var(--impar-spectral)]" /></div>
        ) : entries.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-center"><PackageSearch className="size-7 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">{copy("Nenhum resultado encontrado.", "No results found.", "No se encontraron resultados.")}</p></div>
        ) : (
          <div className="grid min-w-0 lg:grid-cols-[17rem_minmax(0,1fr)]">
            <aside className="wf-roster border-b border-border p-3 lg:max-h-[820px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
              <div className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-3 lg:grid-cols-1">
                {filtered.slice(0, 300).map((item) => {
                  const active = selected ? itemKey(selected) === itemKey(item) : false;
                  return (
                    <button key={itemKey(item)} type="button" onClick={() => setSelectedKey(itemKey(item))} className={cn("wf-roster-item", active && "wf-roster-item--active")}>
                      <ItemThumb item={item} />
                      <span className="min-w-0 text-left"><span className="block truncate text-sm font-semibold text-foreground">{item.name}</span><span className="mt-0.5 block truncate text-[0.68rem] text-muted-foreground">{item.type || item.category || copy("Item", "Item", "Objeto")}</span></span>
                    </button>
                  );
                })}
              </div>
            </aside>
            {selected ? <ItemDetail item={selected} locale={locale} /> : null}
          </div>
        )}
      </section>
    </div>
  );
}

function ItemDetail({ item, locale }: { item: WarframeItem; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const components = normalizedComponents(item);
  const drops = normalizedDrops(item);
  const source = imageUrl(item);

  return (
    <article className="min-w-0 p-4 sm:p-6 lg:p-7">
      <div className="grid gap-6 xl:grid-cols-[14rem_minmax(0,1fr)] xl:gap-8">
        <div>
          <div className="wf-portrait aspect-square overflow-hidden rounded-2xl border border-border p-4">
            {source ? <img src={source} alt={item.name} loading="lazy" className="h-full w-full object-contain" /> : <div className="grid h-full place-items-center"><ImageOff className="size-10 text-muted-foreground" /></div>}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">{item.tradable ? <Badge>{copy("Negociável", "Tradable", "Intercambiable")}</Badge> : null}</div>
        </div>
        <div className="min-w-0">
          <p className="text-[0.67rem] font-bold uppercase tracking-[0.1em] text-[var(--impar-spectral)]">{item.type || item.category || copy("Item", "Item", "Objeto")}</p>
          <h3 className="mt-2 text-balance font-display text-3xl font-bold text-foreground sm:text-4xl">{item.name}</h3>
          {item.description ? <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">{item.description}</p> : null}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {item.buildTime !== undefined ? <Fact icon={Clock3} label={copy("Tempo", "Time", "Tiempo")} value={formatDuration(item.buildTime)} /> : null}
            {item.buildPrice !== undefined ? <Fact icon={Coins} label={copy("Créditos", "Credits", "Créditos")} value={formatNumber(item.buildPrice)} /> : null}
            {item.skipBuildTimePrice !== undefined ? <Fact icon={Zap} label={copy("Rush", "Rush", "Rush")} value={`${formatNumber(item.skipBuildTimePrice)} PL`} /> : null}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="wf-learning-note">
          <div className="flex items-center gap-2"><Sparkles className="size-4 text-[var(--impar-spectral)]" /><h4 className="font-display text-base font-semibold text-foreground">{copy("Componentes", "Components", "Componentes")}</h4></div>
          {components.length ? <div className="mt-4 space-y-2">{components.slice(0, 10).map((component) => <div key={itemKey(component)} className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 text-xs last:border-0"><span className="truncate text-foreground">{component.name}</span><span className="shrink-0 text-muted-foreground">×{componentCount(component)}</span></div>)}</div> : <p className="mt-3 text-sm text-muted-foreground">{copy("Sem receita estruturada nesta resposta.", "No structured recipe in this response.", "Sin receta estructurada en esta respuesta.")}</p>}
        </section>

        <section className="wf-acquisition">
          <div className="flex items-center gap-2"><PackageSearch className="size-4 text-[var(--impar-spectral)]" /><h4 className="font-display text-base font-semibold text-foreground">{copy("Onde conseguir", "Where to get it", "Dónde conseguirlo")}</h4></div>
          {drops.length ? <div className="mt-4 space-y-2">{drops.slice(0, 10).map((drop, index) => <div key={`${drop.location ?? drop.type ?? "drop"}-${index}`} className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 text-xs last:border-0"><div><p className="text-foreground">{drop.location || drop.type || copy("Fonte registrada", "Recorded source", "Fuente registrada")}</p>{drop.rarity ? <p className="mt-0.5 text-muted-foreground">{drop.rarity}</p> : null}</div>{drop.chance !== undefined ? <span className="shrink-0 text-[var(--impar-spectral)]">{formatPercent(drop.chance)}</span> : null}</div>)}</div> : <p className="mt-3 text-sm text-muted-foreground">{copy("Sem drops estruturados nesta resposta.", "No structured drops in this response.", "Sin drops estructurados en esta respuesta.")}</p>}
          <a href={OFFICIAL_DROPS} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--impar-spectral)] hover:underline">{copy("Tabela oficial", "Official table", "Tabla oficial")}<ExternalLink className="size-3.5" /></a>
        </section>
      </div>
    </article>
  );
}

function ItemThumb({ item }: { item: WarframeItem }) {
  const source = imageUrl(item);
  return <span className="wf-thumb">{source ? <img src={source} alt="" loading="lazy" className="h-full w-full object-contain p-1" /> : <ImageOff className="size-4 text-muted-foreground" />}</span>;
}

function Fact({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return <div className="wf-stat"><div className="flex items-center gap-1.5 text-muted-foreground"><Icon className="size-3.5" /><span className="text-[0.62rem] font-bold uppercase tracking-[0.07em]">{label}</span></div><p className="mt-1.5 text-sm font-semibold text-foreground">{value}</p></div>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="wf-badge">{children}</span>;
}
