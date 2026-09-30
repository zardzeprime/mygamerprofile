import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Clock3,
  Coins,
  ExternalLink,
  ImageOff,
  Loader2,
  PackageSearch,
  PlayCircle,
  Search,
  Shield,
  Sparkles,
  Sword,
  Zap,
} from "lucide-react";

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
  masteryReq?: number;
  tradable?: boolean;
  vaulted?: boolean;
  buildPrice?: number;
  buildTime?: number;
  skipBuildTimePrice?: number;
  buildQuantity?: number;
  components?: WarframeComponent[];
  drops?: WarframeDrop[];
  health?: number;
  shield?: number;
  armor?: number;
  power?: number;
  sprintSpeed?: number;
  totalDamage?: number;
  criticalChance?: number;
  criticalMultiplier?: number;
  procChance?: number;
  fireRate?: number;
  magazineSize?: number;
};

type WarframeComponent = WarframeItem & {
  itemCount?: number;
  count?: number;
};

const API_BASE = "https://api.warframestat.us";
const IMAGE_BASE = "https://cdn.warframestat.us/img";
const TAU_TRAILER_ID = "bRxDf7gu97g";
const API_DOCS = "https://docs.warframestat.us/";
const OFFICIAL_DROPS = "https://www.warframe.com/droptables";
const STARTER_ITEM_SEARCH = "Forma,Orokin Reactor,Orokin Catalyst,Exilus Warframe Adapter";

const memoryCache = new Map<string, WarframeItem[]>();

function localeToApiLanguage(locale: Locale) {
  if (locale === "pt-BR") return "pt";
  return locale;
}

function itemKey(item: WarframeItem) {
  return item.uniqueName || `${item.name}-${item.type ?? item.category ?? "item"}`;
}

function imageUrl(item?: WarframeItem) {
  if (!item?.imageName) return undefined;
  return `${IMAGE_BASE}/${encodeURIComponent(item.imageName)}`;
}

function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
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
  return Array.isArray(item?.components) ? item.components.filter((component) => component?.name) : [];
}

function componentCount(component: WarframeComponent) {
  return component.itemCount ?? component.count ?? component.buildQuantity ?? 1;
}

function buildWindow(item: WarframeItem) {
  const componentTimes = normalizedComponents(item)
    .map((component) => component.buildTime ?? 0)
    .filter((value) => value > 0);
  if (!item.buildTime || componentTimes.length === 0) return undefined;
  return item.buildTime + Math.max(...componentTimes);
}

async function fetchWarframeData(
  mode: WarframeDatabaseMode,
  locale: Locale,
  itemSearch: string,
  signal: AbortSignal,
) {
  const language = localeToApiLanguage(locale);
  const normalizedSearch = itemSearch.trim() || STARTER_ITEM_SEARCH;
  const cacheKey = `${mode}:${language}:${mode === "items" ? normalizedSearch.toLowerCase() : "all"}`;
  const cached = memoryCache.get(cacheKey);
  if (cached) return cached;

  const path =
    mode === "items"
      ? `/items/search/${encodeURIComponent(normalizedSearch)}`
      : mode === "warframes"
        ? "/warframes"
        : "/weapons";
  const params = new URLSearchParams({ language, remove: "patchlogs" });
  const response = await fetch(`${API_BASE}${path}?${params.toString()}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`WARFRAME_DATA_${response.status}`);
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
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [entries, setEntries] = useState<WarframeItem[]>([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [primeFilter, setPrimeFilter] = useState<"all" | "prime" | "base">("all");

  useEffect(() => {
    if (mode !== "items") return;
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [mode, query]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetchWarframeData(mode, locale, mode === "items" ? debouncedQuery : "", controller.signal)
      .then((data) => {
        setEntries(data);
        setSelectedKey((current) => {
          if (current && data.some((item) => itemKey(item) === current)) return current;
          return data[0] ? itemKey(data[0]) : "";
        });
      })
      .catch((reason) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "WARFRAME_DATA_ERROR");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedQuery, locale, mode]);

  useEffect(() => {
    setQuery("");
    setDebouncedQuery("");
    setSelectedKey("");
    setPrimeFilter("all");
  }, [mode]);

  const filtered = useMemo(() => {
    let data = entries;
    if (mode === "warframes" && primeFilter !== "all") {
      data = data.filter((item) =>
        primeFilter === "prime" ? /\bprime\b/i.test(item.name) : !/\bprime\b/i.test(item.name),
      );
    }
    if (mode === "items") return data;
    const term = query.trim().toLowerCase();
    if (!term) return data;
    return data.filter((item) =>
      [item.name, item.description, item.type, item.category, item.productCategory]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [entries, mode, primeFilter, query]);

  const selected =
    entries.find((item) => itemKey(item) === selectedKey) ?? filtered[0] ?? entries[0];

  const title =
    mode === "warframes"
      ? copy("Banco de Warframes", "Warframe database", "Base de Warframes")
      : mode === "weapons"
        ? copy("Arsenal de armas", "Weapon arsenal", "Arsenal de armas")
        : copy("Itens e Fundição", "Items and Foundry", "Objetos y Fundición");

  const description =
    mode === "warframes"
      ? copy(
          "Warframes atuais com imagem, requisitos da Fundição, peças, tempos e fontes de obtenção.",
          "Current Warframes with artwork, Foundry requirements, parts, build times and acquisition sources.",
          "Warframes actuales con imagen, requisitos de Fundición, piezas, tiempos y fuentes de obtención.",
        )
      : mode === "weapons"
        ? copy(
            "Armas pesquisáveis com estatísticas, Maestria, receita da Fundição, tempo, rush e componentes.",
            "Searchable weapons with stats, Mastery, Foundry recipe, build time, rush and components.",
            "Armas con búsqueda, estadísticas, Maestría, receta, tiempo, rush y componentes.",
          )
        : copy(
            "Pesquise recursos, blueprints e equipamentos. A busca consulta a base atual em vez de baixar milhares de itens de uma vez.",
            "Search resources, blueprints and gear. Search queries the current database instead of downloading thousands of items at once.",
            "Busca recursos, planos y equipo consultando la base actual sin descargar miles de objetos de una vez.",
          );

  return (
    <div className="space-y-5">
      <section className="surface-panel overflow-hidden">
        <div className="grid gap-5 border-b border-border p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-gold-strong" />
              <span className="section-kicker">MGP / TENNO DATABASE</span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <span className="rounded-full border border-border bg-muted/20 px-2.5 py-1">
                {copy("Dados atuais via WFCD", "Current WFCD data", "Datos actuales vía WFCD")}
              </span>
              <span className="rounded-full border border-border bg-muted/20 px-2.5 py-1">
                {copy("Imagens via CDN WarframeStatus", "WarframeStatus CDN images", "Imágenes vía CDN WarframeStatus")}
              </span>
            </div>
          </div>

          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background/75 px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-auto border-0 p-0 shadow-none"
              placeholder={
                mode === "items"
                  ? copy("Ex.: Forma, Neurodes, Catalyst...", "e.g. Forma, Neurodes, Catalyst...", "Ej.: Forma, Neurodes, Catalyst...")
                  : copy("Buscar por nome ou tipo", "Search by name or type", "Buscar por nombre o tipo")
              }
            />
          </label>
        </div>

        {mode === "warframes" ? (
          <div className="flex flex-wrap gap-2 border-b border-border px-5 py-3 sm:px-6">
            {(["all", "base", "prime"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setPrimeFilter(filter)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  primeFilter === filter
                    ? "border-gold/35 bg-gold/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted/30 hover:text-foreground",
                )}
              >
                {filter === "all"
                  ? copy("Todos", "All", "Todos")
                  : filter === "prime"
                    ? "Prime"
                    : copy("Base", "Base", "Base")}
              </button>
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="p-6 sm:p-8">
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
              <h3 className="font-display text-lg font-semibold text-foreground">
                {copy("A base do Arsenal não respondeu", "The Arsenal database did not respond", "La base del Arsenal no respondió")}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {copy(
                  "O hub continua íntegro. Tente novamente; os dados são carregados da API pública do ecossistema Warframe.",
                  "The hub is still intact. Try again; data is loaded from the public Warframe ecosystem API.",
                  "El hub sigue intacto. Inténtalo de nuevo; los datos se cargan desde la API pública del ecosistema Warframe.",
                )}
              </p>
              <a href={API_DOCS} target="_blank" rel="noreferrer" className="brand-button-secondary mt-4 gap-2">
                {copy("Ver fonte", "View source", "Ver fuente")}
                <ExternalLink className="size-4" />
              </a>
            </div>
          </div>
        ) : loading ? (
          <div className="grid min-h-72 place-items-center p-8 text-center">
            <div>
              <Loader2 className="mx-auto size-7 animate-spin text-gold-strong" />
              <p className="mt-3 text-sm font-semibold text-foreground">
                {copy("Sincronizando o Arsenal...", "Syncing the Arsenal...", "Sincronizando el Arsenal...")}
              </p>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <PackageSearch className="size-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              {copy("Nenhum resultado encontrado.", "No results found.", "No se encontraron resultados.")}
            </p>
          </div>
        ) : (
          <div className="grid min-w-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="border-b border-border p-3 lg:max-h-[760px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
              <div className="grid grid-cols-2 gap-2 min-[540px]:grid-cols-3 lg:grid-cols-1">
                {filtered.slice(0, 300).map((item) => {
                  const active = selected ? itemKey(selected) === itemKey(item) : false;
                  return (
                    <button
                      key={itemKey(item)}
                      type="button"
                      onClick={() => setSelectedKey(itemKey(item))}
                      className={cn(
                        "flex min-w-0 items-center gap-2 rounded-xl border p-2.5 text-left transition-colors",
                        active
                          ? "border-gold/35 bg-gold/[0.08]"
                          : "border-border bg-muted/10 hover:bg-muted/30",
                      )}
                    >
                      <ItemThumb item={item} className="size-10" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">{item.name}</span>
                        <span className="mt-0.5 block truncate text-[0.68rem] text-muted-foreground">
                          {item.type || item.category || item.productCategory || copy("Item", "Item", "Objeto")}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {filtered.length > 300 ? (
                <p className="px-2 py-3 text-xs leading-5 text-muted-foreground">
                  {copy(
                    "Mostrando os 300 primeiros resultados. Refine a busca para encontrar o restante.",
                    "Showing the first 300 results. Refine your search to find the rest.",
                    "Mostrando los primeros 300 resultados. Refina la búsqueda para ver el resto.",
                  )}
                </p>
              ) : null}
            </aside>

            {selected ? <ItemDetail item={selected} mode={mode} locale={locale} /> : null}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="surface-panel overflow-hidden">
          <div className="aspect-video bg-black">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${TAU_TRAILER_ID}`}
              title="Warframe: Tau — Official Trailer"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-2 text-gold-strong">
              <PlayCircle className="size-4" />
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em]">
                {copy("Mídia oficial", "Official media", "Medio oficial")}
              </span>
            </div>
            <h3 className="mt-2 font-display text-lg font-semibold text-foreground">Warframe: Tau</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy(
                "Trailer oficial da Digital Extremes exibido na TennoCon 2026.",
                "Official Digital Extremes trailer shown at TennoCon 2026.",
                "Tráiler oficial de Digital Extremes presentado en TennoCon 2026.",
              )}
            </p>
          </div>
        </div>

        <aside className="surface-panel p-5">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {copy("Como ler a Fundição", "How to read Foundry data", "Cómo leer la Fundición")}
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {copy(
              "“Rush máximo” é o preço inicial registrado no blueprint. No jogo, o custo fica no valor cheio até 50% do craft e depois reduz gradualmente, nunca abaixo de metade do valor inicial.",
              "“Maximum rush” is the blueprint's initial rush price. In game, the cost stays full until 50% craft progress and then decreases gradually, never below half the initial value.",
              "“Rush máximo” es el precio inicial del plano. En el juego se mantiene completo hasta 50% del craft y luego baja gradualmente, nunca por debajo de la mitad del valor inicial.",
            )}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <a href={API_DOCS} target="_blank" rel="noreferrer" className="brand-button-secondary justify-between gap-2">
              WarframeStatus API
              <ExternalLink className="size-4" />
            </a>
            <a href={OFFICIAL_DROPS} target="_blank" rel="noreferrer" className="brand-button-secondary justify-between gap-2">
              {copy("Drops oficiais", "Official drops", "Drops oficiales")}
              <ExternalLink className="size-4" />
            </a>
          </div>
        </aside>
      </section>
    </div>
  );
}

function ItemDetail({ item, mode, locale }: { item: WarframeItem; mode: WarframeDatabaseMode; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const components = normalizedComponents(item);
  const drops = normalizedDrops(item);
  const totalWindow = buildWindow(item);

  return (
    <article className="min-w-0 p-4 sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[14rem_minmax(0,1fr)]">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-[radial-gradient(circle_at_top,rgba(212,167,44,0.12),transparent_70%),hsl(var(--muted)/0.2)] p-4">
            <ItemImage item={item} />
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.masteryReq !== undefined ? <Badge>MR {item.masteryReq}</Badge> : null}
            {item.tradable ? <Badge>{copy("Negociável", "Tradable", "Intercambiable")}</Badge> : null}
            {item.vaulted ? <Badge>Vaulted</Badge> : null}
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-gold-strong">
            {item.type || item.category || item.productCategory || copy("Entrada do Arsenal", "Arsenal entry", "Entrada del Arsenal")}
          </p>
          <h3 className="mt-2 text-balance font-display text-3xl font-bold text-foreground">{item.name}</h3>
          {item.description ? (
            <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">{item.description}</p>
          ) : null}

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
            {item.buildTime !== undefined ? (
              <Fact icon={Clock3} label={copy("Tempo", "Build time", "Tiempo")} value={formatDuration(item.buildTime)} />
            ) : null}
            {item.skipBuildTimePrice !== undefined ? (
              <Fact
                icon={Zap}
                label={copy("Rush máximo", "Maximum rush", "Rush máximo")}
                value={`${formatNumber(item.skipBuildTimePrice)} PL`}
              />
            ) : null}
            {item.buildPrice !== undefined ? (
              <Fact icon={Coins} label={copy("Créditos", "Credits", "Créditos")} value={formatNumber(item.buildPrice)} />
            ) : null}
            {totalWindow ? (
              <Fact
                icon={Boxes}
                label={copy("Peças + montagem", "Parts + assembly", "Piezas + montaje")}
                value={formatDuration(totalWindow)}
              />
            ) : null}
          </div>

          {mode === "warframes" ? <WarframeStats item={item} locale={locale} /> : null}
          {mode === "weapons" ? <WeaponStats item={item} locale={locale} /> : null}
        </div>
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-border bg-muted/10 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Boxes className="size-4 text-gold-strong" />
            <h4 className="font-display text-lg font-semibold text-foreground">
              {copy("Receita e componentes", "Recipe and components", "Receta y componentes")}
            </h4>
          </div>
          {components.length ? (
            <div className="mt-4 space-y-3">
              {components.map((component) => (
                <ComponentCard key={itemKey(component)} component={component} locale={locale} />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {copy(
                "A base atual não expõe uma receita de Fundição para este item. Ele pode vir pronto, de mercado, troca, missão ou outro sistema.",
                "The current database exposes no Foundry recipe for this item. It may come built, from the Market, trading, missions or another system.",
                "La base actual no expone receta de Fundición para este objeto. Puede venir construido, del Mercado, comercio, misión u otro sistema.",
              )}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-muted/10 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <PackageSearch className="size-4 text-gold-strong" />
            <h4 className="font-display text-lg font-semibold text-foreground">
              {copy("Onde conseguir / onde dropa", "Where to get / drops", "Dónde conseguir / drops")}
            </h4>
          </div>
          {drops.length ? (
            <DropList drops={drops} locale={locale} />
          ) : components.some((component) => normalizedDrops(component).length > 0) ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {copy(
                "Os drops disponíveis estão detalhados dentro de cada componente ao lado.",
                "Available drops are detailed inside each component.",
                "Los drops disponibles aparecen dentro de cada componente.",
              )}
            </p>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {copy(
                "Nenhum drop estruturado veio na resposta atual. Use a tabela oficial para confirmar recompensas rotativas, relíquias e conteúdo recém-atualizado.",
                "No structured drop came with the current response. Use the official table to confirm rotations, relics and newly updated content.",
                "La respuesta actual no incluye drops estructurados. Usa la tabla oficial para confirmar rotaciones, reliquias y contenido reciente.",
              )}
            </p>
          )}
          <a href={OFFICIAL_DROPS} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-strong hover:underline">
            {copy("Conferir tabela oficial", "Check official drop table", "Ver tabla oficial")}
            <ExternalLink className="size-3.5" />
          </a>
        </section>
      </div>
    </article>
  );
}

function ComponentCard({ component, locale }: { component: WarframeComponent; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const drops = normalizedDrops(component);
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <div className="flex items-start gap-3">
        <ItemThumb item={component} className="size-11" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h5 className="font-semibold text-foreground">{component.name}</h5>
            <span className="text-xs font-bold text-gold-strong">×{componentCount(component)}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {component.buildTime ? <span>{copy("Fundição", "Build", "Fundición")}: {formatDuration(component.buildTime)}</span> : null}
            {component.skipBuildTimePrice !== undefined ? <span>Rush: {formatNumber(component.skipBuildTimePrice)} PL</span> : null}
            {component.buildPrice !== undefined ? <span>{formatNumber(component.buildPrice)} cr</span> : null}
          </div>
        </div>
      </div>
      {drops.length ? <DropList drops={drops.slice(0, 4)} locale={locale} compact /> : null}
    </div>
  );
}

function DropList({ drops, locale, compact = false }: { drops: WarframeDrop[]; locale: Locale; compact?: boolean }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  return (
    <div className={cn("space-y-2", compact ? "mt-3" : "mt-4")}>
      {drops.slice(0, compact ? 4 : 12).map((drop, index) => (
        <div key={`${drop.location ?? drop.type ?? "drop"}-${index}`} className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-muted/10 px-3 py-2.5">
          <div className="min-w-0">
            <p className="break-words text-xs font-semibold text-foreground">
              {drop.location || drop.type || copy("Fonte registrada", "Recorded source", "Fuente registrada")}
            </p>
            {drop.rarity ? <p className="mt-0.5 text-[0.68rem] text-muted-foreground">{drop.rarity}</p> : null}
          </div>
          {drop.chance !== undefined ? (
            <span className="shrink-0 text-xs font-bold text-gold-strong">{formatPercent(drop.chance)}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function WarframeStats({ item, locale }: { item: WarframeItem; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const stats = [
    [copy("Vida", "Health", "Vida"), item.health],
    [copy("Escudo", "Shield", "Escudo"), item.shield],
    [copy("Armadura", "Armor", "Armadura"), item.armor],
    [copy("Energia", "Energy", "Energía"), item.power],
    [copy("Sprint", "Sprint", "Sprint"), item.sprintSpeed],
  ].filter(([, value]) => value !== undefined);
  if (!stats.length) return null;
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {stats.map(([label, value]) => <Badge key={String(label)}>{String(label)}: {formatNumber(value as number)}</Badge>)}
    </div>
  );
}

function WeaponStats({ item, locale }: { item: WarframeItem; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const stats = [
    [copy("Dano", "Damage", "Daño"), item.totalDamage !== undefined ? formatNumber(item.totalDamage) : undefined],
    [copy("Crítico", "Critical", "Crítico"), item.criticalChance !== undefined ? formatPercent(item.criticalChance) : undefined],
    [copy("Multiplicador", "Multiplier", "Multiplicador"), item.criticalMultiplier !== undefined ? `${item.criticalMultiplier.toFixed(1)}×` : undefined],
    [copy("Status", "Status", "Estado"), item.procChance !== undefined ? formatPercent(item.procChance) : undefined],
    [copy("Cadência", "Fire rate", "Cadencia"), item.fireRate !== undefined ? formatNumber(item.fireRate) : undefined],
    [copy("Carregador", "Magazine", "Cargador"), item.magazineSize !== undefined ? formatNumber(item.magazineSize) : undefined],
  ].filter(([, value]) => value !== undefined);
  if (!stats.length) return null;
  return (
    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {stats.map(([label, value]) => (
        <div key={String(label)} className="rounded-lg border border-border bg-muted/15 px-3 py-2">
          <p className="text-[0.64rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
        </div>
      ))}
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/15 p-3">
      <div className="flex items-center gap-1.5 text-gold-strong">
        <Icon className="size-3.5" />
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.08em]">{label}</span>
      </div>
      <p className="mt-1.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ItemThumb({ item, className }: { item: WarframeItem; className?: string }) {
  const source = imageUrl(item);
  return (
    <span className={cn("grid shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted/20", className)}>
      {source ? <img src={source} alt="" loading="lazy" className="h-full w-full object-contain p-1" /> : <ImageOff className="size-4 text-muted-foreground" />}
    </span>
  );
}

function ItemImage({ item }: { item: WarframeItem }) {
  const source = imageUrl(item);
  if (!source) return <div className="grid h-full place-items-center"><ImageOff className="size-10 text-muted-foreground" /></div>;
  return <img src={source} alt={item.name} loading="lazy" className="h-full w-full object-contain" />;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[0.68rem] font-semibold text-muted-foreground">
      {children}
    </span>
  );
}
