import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Coins, Hammer, Search, ShieldCheck, Sparkles } from "lucide-react";
import { DataSourceIndicator } from "@/components/common/DataSourceIndicator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

const DDRAGON = "https://ddragon.leagueoflegends.com";
const FALLBACK_VERSION = "16.18.1";
const DATA_DRAGON_LOCALE: Record<Locale, string> = {
  "pt-BR": "pt_BR",
  en: "en_US",
  es: "es_ES",
};

type LeagueItem = {
  name: string;
  description: string;
  plaintext?: string;
  image: { full: string };
  gold?: { base: number; total: number; sell: number; purchasable: boolean };
  tags?: string[];
  maps?: Record<string, boolean>;
  into?: string[];
  from?: string[];
  depth?: number;
  inStore?: boolean;
  hideFromAll?: boolean;
  requiredChampion?: string;
  requiredAlly?: string;
  specialRecipe?: number;
  stats?: Record<string, number>;
};

type ItemPayload = { data: Record<string, LeagueItem> };
type ItemEntry = [string, LeagueItem];
type CatalogVariant = "base" | "masterwork";
type ItemTier = "all" | "basic" | "epic" | "legendary" | "boots" | "consumable";

type CatalogEntry = {
  key: string;
  id: string;
  item: LeagueItem;
  englishItem: LeagueItem;
  variant: CatalogVariant;
};

type UpgradeStatKey =
  | "attackDamage"
  | "abilityPower"
  | "health"
  | "armor"
  | "magicResistance"
  | "attackSpeed"
  | "abilityHaste";

type UpgradeStat = {
  key: UpgradeStatKey;
  base: number;
  bonus: number;
};

function stripMarkup(value: string | undefined) {
  return (value ?? "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function extractStatLines(description: string | undefined) {
  const match = description?.match(/<stats>([\s\S]*?)<\/stats>/i);
  if (!match) return [];
  return stripMarkup(match[1])
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractAbilityHaste(description: string | undefined) {
  if (!description) return 0;
  const statsBlock = description.match(/<stats>([\s\S]*?)<\/stats>/i)?.[1] ?? description;
  const cleaned = stripMarkup(statsBlock);
  const match = cleaned.match(/([\d.]+)\s+Ability Haste/i);
  return match ? Number(match[1]) || 0 : 0;
}

function isSummonersRiftItem(item: LeagueItem) {
  return item.maps?.["11"] === true;
}

function isVisibleStoreItem(item: LeagueItem) {
  return (
    isSummonersRiftItem(item) &&
    item.gold?.purchasable !== false &&
    item.inStore !== false &&
    item.hideFromAll !== true &&
    !item.requiredChampion &&
    !item.requiredAlly
  );
}

function dedupeCatalog(entries: ItemEntry[]) {
  const byName = new Map<string, ItemEntry>();
  for (const entry of entries) {
    const [id, item] = entry;
    const key = item.name.trim().toLocaleLowerCase();
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, entry);
      continue;
    }

    const [existingId, existingItem] = existing;
    const score = (candidateId: string, candidate: LeagueItem) => {
      let value = 0;
      if (candidate.inStore !== false) value += 8;
      if (!candidate.specialRecipe) value += 4;
      if (!candidate.requiredChampion && !candidate.requiredAlly) value += 4;
      if (candidate.gold?.purchasable !== false) value += 2;
      if (candidate.from?.length) value += 1;
      value -= Number(candidateId) / 1_000_000;
      return value;
    };

    if (score(id, item) > score(existingId, existingItem)) byName.set(key, entry);
  }

  return Array.from(byName.values()).sort(([, a], [, b]) => a.name.localeCompare(b.name));
}

function hasSummonersRiftUpgrade(item: LeagueItem, allItems: Map<string, LeagueItem>) {
  return Boolean(
    item.into?.some((id) => {
      const target = allItems.get(id);
      return target && isSummonersRiftItem(target) && target.gold?.purchasable !== false;
    }),
  );
}

function getItemTier(item: LeagueItem, allItems: Map<string, LeagueItem>): Exclude<ItemTier, "all"> {
  if (item.tags?.includes("Consumable") || item.tags?.includes("Trinket")) return "consumable";
  if (item.tags?.includes("Boots")) return "boots";
  if (!item.from?.length) return "basic";
  if (hasSummonersRiftUpgrade(item, allItems)) return "epic";
  return "legendary";
}

function isOrnnMasterworkCandidate(item: LeagueItem, allItems: Map<string, LeagueItem>) {
  if (!isVisibleStoreItem(item)) return false;
  if (getItemTier(item, allItems) !== "legendary") return false;
  if ((item.gold?.total ?? 0) < 1800) return false;
  const name = item.name.toLowerCase();
  if (name.includes("mejai")) return false;
  const excludedTags = new Set(["Boots", "Consumable", "Trinket", "GoldPer"]);
  if (item.tags?.some((tag) => excludedTags.has(tag))) return false;
  return Boolean(item.from?.length);
}

function baseUpgradeableStats(
  item: LeagueItem,
  englishItem: LeagueItem,
): Array<Omit<UpgradeStat, "bonus">> {
  const stats = item.stats ?? {};
  const rows: Array<Omit<UpgradeStat, "bonus">> = [];
  const push = (key: UpgradeStatKey, value: number | undefined) => {
    if (value && value > 0) rows.push({ key, base: value });
  };
  push("attackDamage", stats["FlatPhysicalDamageMod"]);
  push("abilityPower", stats["FlatMagicDamageMod"]);
  push("health", stats["FlatHPPoolMod"]);
  push("armor", stats["FlatArmorMod"]);
  push("magicResistance", stats["FlatSpellBlockMod"]);
  push("attackSpeed", stats["PercentAttackSpeedMod"] ? stats["PercentAttackSpeedMod"] * 100 : 0);
  push("abilityHaste", extractAbilityHaste(englishItem.description));
  return rows;
}

function masterworkStats(item: LeagueItem, englishItem: LeagueItem): UpgradeStat[] {
  const rows = baseUpgradeableStats(item, englishItem);
  if (!rows.length) return [];
  const share = 1000 / rows.length;
  return rows.map((row) => {
    let bonus = 0;
    if (row.key === "attackDamage") bonus = share / 35;
    if (row.key === "abilityPower") bonus = share / 20;
    if (row.key === "armor") bonus = share / 20;
    if (row.key === "magicResistance") bonus = share / 18;
    if (row.key === "attackSpeed") bonus = share / 30;
    if (row.key === "abilityHaste") bonus = share / 31.25;
    if (row.key === "health") {
      if (rows.length === 1) bonus = 375;
      else if (rows.length === 2) bonus = 185;
      else if (rows.length === 3) bonus = 125;
      else bonus = 90;
    }
    return { ...row, bonus };
  });
}

function statLabel(key: UpgradeStatKey, locale: Locale) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const labels: Record<UpgradeStatKey, string> = {
    attackDamage: copy("Dano de Ataque", "Attack Damage", "Daño de Ataque"),
    abilityPower: copy("Poder de Habilidade", "Ability Power", "Poder de Habilidad"),
    health: copy("Vida", "Health", "Vida"),
    armor: copy("Armadura", "Armor", "Armadura"),
    magicResistance: copy("Resistência Mágica", "Magic Resistance", "Resistencia Mágica"),
    attackSpeed: copy("Velocidade de Ataque", "Attack Speed", "Velocidad de Ataque"),
    abilityHaste: copy("Aceleração de Habilidade", "Ability Haste", "Aceleración de Habilidad"),
  };
  return labels[key];
}

function formatStat(key: UpgradeStatKey, value: number) {
  const rounded = Math.round(value * 10) / 10;
  return key === "attackSpeed" ? `${rounded}%` : `${rounded}`;
}

function tierLabel(tier: ItemTier, locale: Locale) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const labels: Record<ItemTier, string> = {
    all: copy("Todos", "All", "Todos"),
    basic: copy("Básicos", "Basic", "Básicos"),
    epic: copy("Épicos", "Epic", "Épicos"),
    legendary: copy("Lendários", "Legendary", "Legendarios"),
    boots: copy("Botas", "Boots", "Botas"),
    consumable: copy("Consumíveis", "Consumables", "Consumibles"),
  };
  return labels[tier];
}

function itemIcon(version: string, item: LeagueItem) {
  return `${DDRAGON}/cdn/${version}/img/item/${item.image.full}`;
}

export function LeagueItemsExplorerV2({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [version, setVersion] = useState(FALLBACK_VERSION);
  const [items, setItems] = useState<ItemEntry[]>([]);
  const [allItemEntries, setAllItemEntries] = useState<ItemEntry[]>([]);
  const [englishEntries, setEnglishEntries] = useState<ItemEntry[]>([]);
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<ItemTier>("all");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");
      try {
        let current = FALLBACK_VERSION;
        try {
          const versionsResponse = await fetch(`${DDRAGON}/api/versions.json`, {
            signal: controller.signal,
          });
          if (versionsResponse.ok) {
            const versions = (await versionsResponse.json()) as string[];
            current = versions[0] || FALLBACK_VERSION;
          }
        } catch (versionError) {
          if (!controller.signal.aborted) {
            console.warn("[League] Using fallback Data Dragon version.", versionError);
          }
        }

        const localUrl = `${DDRAGON}/cdn/${current}/data/${DATA_DRAGON_LOCALE[locale]}/item.json`;
        const englishUrl = `${DDRAGON}/cdn/${current}/data/en_US/item.json`;
        const [localResponse, englishResponse] = await Promise.all([
          fetch(localUrl, { signal: controller.signal }),
          locale === "en" ? Promise.resolve(null) : fetch(englishUrl, { signal: controller.signal }),
        ]);

        if (!localResponse.ok) throw new Error(`Data Dragon returned ${localResponse.status}`);
        if (englishResponse && !englishResponse.ok) {
          throw new Error(`Data Dragon EN returned ${englishResponse.status}`);
        }

        const payload = (await localResponse.json()) as ItemPayload;
        const englishPayload = englishResponse ? ((await englishResponse.json()) as ItemPayload) : payload;
        const everyItem = Object.entries(payload.data);

        setVersion(current);
        setAllItemEntries(everyItem);
        setEnglishEntries(Object.entries(englishPayload.data));
        setItems(dedupeCatalog(everyItem.filter(([, item]) => isVisibleStoreItem(item))));
      } catch (loadError) {
        if (controller.signal.aborted) return;
        console.error("[League] Item collection failed.", loadError);
        setError(
          copy(
            "Não foi possível carregar os itens oficiais agora.",
            "Official items could not be loaded right now.",
            "No se pudieron cargar los objetos oficiales en este momento.",
          ),
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [locale]);

  const allItems = useMemo(() => new Map(allItemEntries), [allItemEntries]);
  const englishItems = useMemo(() => new Map(englishEntries), [englishEntries]);

  const catalog = useMemo<CatalogEntry[]>(() => {
    const rows: CatalogEntry[] = [];
    for (const [id, item] of items) {
      const englishItem = englishItems.get(id) ?? item;
      rows.push({ key: `${id}:base`, id, item, englishItem, variant: "base" });
      if (isOrnnMasterworkCandidate(item, allItems) && masterworkStats(item, englishItem).length) {
        rows.push({ key: `${id}:masterwork`, id, item, englishItem, variant: "masterwork" });
      }
    }
    return rows;
  }, [allItems, englishItems, items]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return catalog.filter((entry) => {
      const tierMatch = tier === "all" || getItemTier(entry.item, allItems) === tier;
      if (!tierMatch) return false;
      if (!normalized) return true;
      return (
        entry.item.name.toLowerCase().includes(normalized) ||
        entry.item.tags?.some((tag) => tag.toLowerCase().includes(normalized)) ||
        (entry.variant === "masterwork" &&
          (normalized.includes("ornn") ||
            normalized.includes("magistral") ||
            normalized.includes("masterwork")))
      );
    });
  }, [allItems, catalog, query, tier]);

  const entryByKey = useMemo(() => new Map(catalog.map((entry) => [entry.key, entry])), [catalog]);

  const openEntry = (key: string, fromKey?: string) => {
    if (!entryByKey.has(key)) return;
    if (fromKey && fromKey !== key) setHistory((current) => [...current, fromKey].slice(-30));
    setSelectedKey(key);
  };

  const closeItem = () => {
    setSelectedKey(null);
    setHistory([]);
  };

  const goBack = () => {
    setHistory((current) => {
      if (!current.length) return current;
      const next = [...current];
      const previous = next.pop();
      if (previous) setSelectedKey(previous);
      return next;
    });
  };

  const selected = selectedKey ? entryByKey.get(selectedKey) : undefined;
  const tiers: ItemTier[] = ["all", "basic", "epic", "legendary", "boots", "consumable"];

  return (
    <section className="space-y-6">
      <div className="surface-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <DataSourceIndicator source="verified" />
              <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                Riot Data Dragon · {version}
              </span>
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {copy("Loja de itens", "Item shop", "Tienda de objetos")}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {copy(
                "A grade mostra só o essencial: ícone e preço. Abra qualquer item para ver atributos em linhas separadas, descrição e árvore completa de receita.",
                "The grid shows only the essentials: icon and price. Open any item to see separated stat rows, description and the full recipe tree.",
                "La cuadrícula muestra solo lo esencial: icono y precio. Abre cualquier objeto para ver atributos separados, descripción y el árbol completo de receta.",
              )}
            </p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {loading ? copy("Sincronizando…", "Syncing…", "Sincronizando…") : `${filtered.length} / ${catalog.length}`}
          </span>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-gold/50">
            <Search className="size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              placeholder={copy("Buscar qualquer item…", "Search any item…", "Buscar cualquier objeto…")}
            />
          </label>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tiers.map((entry) => (
              <button
                key={entry}
                type="button"
                aria-pressed={tier === entry}
                onClick={() => setTier(entry)}
                className={cn(
                  "min-h-10 shrink-0 rounded-full border px-3 text-xs font-semibold transition-all",
                  tier === entry
                    ? "border-gold/45 bg-gold/10 text-gold-strong"
                    : "border-border bg-background/55 text-muted-foreground hover:border-gold/25 hover:text-foreground",
                )}
              >
                {tierLabel(entry, locale)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {Array.from({ length: 36 }).map((_, index) => (
            <div key={index} className="aspect-[0.82] animate-pulse rounded-xl border border-border bg-muted/40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {filtered.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => openEntry(entry.key)}
              title={entry.item.name}
              aria-label={`${entry.item.name} · ${entry.item.gold?.total ?? 0} gold`}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-surface p-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45",
                entry.variant === "masterwork"
                  ? "border-orange-400/50 hover:border-orange-300"
                  : "border-border hover:border-gold/40",
              )}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-[radial-gradient(circle_at_top,hsl(var(--muted)/0.8),hsl(var(--background)))]">
                <img
                  src={itemIcon(version, entry.item)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
                {entry.variant === "masterwork" ? (
                  <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full border border-orange-300/70 bg-background/90 text-orange-500 shadow-lg">
                    <Hammer className="size-3" />
                  </span>
                ) : null}
              </div>
              <div className="mt-2 flex items-center justify-center gap-1 text-[0.66rem] font-bold text-gold-strong">
                <Coins className="size-3" />
                <span>{entry.item.gold?.total ?? 0}</span>
              </div>
              <span className="sr-only">{entry.item.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 rounded-2xl border border-border bg-muted/15 p-4 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-strong" />
        <p>
          {copy(
            "Dados, preços, receitas, atributos e ícones vêm do Riot Data Dragon. As categorias do MGP são de navegação: Básico, Épico e Lendário são derivados da posição do item na árvore atual; o antigo sistema de itens Míticos não é usado como filtro atual.",
            "Data, prices, recipes, stats and icons come from Riot Data Dragon. MGP categories are navigation helpers: Basic, Epic and Legendary are derived from the item's current recipe position; the former Mythic item system is not used as a current filter.",
            "Datos, precios, recetas, atributos e iconos provienen de Riot Data Dragon. Las categorías de MGP son ayudas de navegación: Básico, Épico y Legendario se derivan de la posición actual del objeto en la receta; el antiguo sistema Mítico no se usa como filtro actual.",
          )}
        </p>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && closeItem()}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          {selected ? (
            <ItemDetail
              entry={selected}
              version={version}
              locale={locale}
              allItems={allItems}
              englishItems={englishItems}
              canGoBack={history.length > 0}
              onBack={goBack}
              onSelect={(targetId) => openEntry(`${targetId}:base`, selected.key)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ItemDetail({
  entry,
  version,
  locale,
  allItems,
  englishItems,
  canGoBack,
  onBack,
  onSelect,
}: {
  entry: CatalogEntry;
  version: string;
  locale: Locale;
  allItems: Map<string, LeagueItem>;
  englishItems: Map<string, LeagueItem>;
  canGoBack: boolean;
  onBack: () => void;
  onSelect: (id: string) => void;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const { id, item, englishItem, variant } = entry;
  const components =
    item.from
      ?.map((componentId) => [componentId, allItems.get(componentId)] as const)
      .filter((row): row is readonly [string, LeagueItem] => Boolean(row[1])) ?? [];
  const upgrades =
    item.into
      ?.map((upgradeId) => [upgradeId, allItems.get(upgradeId)] as const)
      .filter(
        (row): row is readonly [string, LeagueItem] =>
          Boolean(row[1]) && Boolean(row[1]?.maps?.["11"]),
      ) ?? [];
  const statLines = extractStatLines(item.description);
  const masterwork = variant === "masterwork" ? masterworkStats(item, englishItem) : [];
  const description = stripMarkup(item.description);
  const cleanDescription = statLines.reduce((value, stat) => value.replace(stat, ""), description).trim();

  return (
    <div className="min-w-0">
      {canGoBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/20 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {copy("Voltar na árvore", "Back in tree", "Volver en el árbol")}
        </button>
      ) : null}

      <DialogHeader className="text-left">
        <div className="flex gap-4 pr-8">
          <div
            className={cn(
              "grid size-24 shrink-0 place-items-center rounded-[1.35rem] p-2 shadow-lift",
              variant === "masterwork"
                ? "bg-gradient-to-br from-orange-400 via-amber-200 to-orange-800"
                : "border border-border bg-muted/40",
            )}
          >
            <img
              src={itemIcon(version, item)}
              alt=""
              width={80}
              height={80}
              className="size-20 rounded-2xl bg-background object-contain"
            />
          </div>
          <div className="min-w-0">
            <DialogTitle className="font-display text-2xl sm:text-3xl">{item.name}</DialogTitle>
            <DialogDescription className="mt-1">
              {tierLabel(getItemTier(item, allItems), locale)}
              {variant === "masterwork" ? ` · ${copy("Magistral do Ornn", "Ornn Masterwork", "Magistral de Ornn")}` : ""}
            </DialogDescription>
            <p className="mt-3 flex items-center gap-1.5 text-base font-bold text-gold-strong">
              <Coins className="size-4" />
              {item.gold?.total ?? 0}
              {item.gold?.sell ? (
                <span className="ml-2 text-xs font-medium text-muted-foreground">
                  {copy("venda", "sell", "venta")} {item.gold.sell}
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </DialogHeader>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-muted/10">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Sparkles className="size-4 text-gold-strong" />
          <h3 className="text-xs font-black uppercase tracking-[0.13em] text-muted-foreground">
            {copy("Atributos", "Stats", "Atributos")}
          </h3>
        </div>

        {variant === "masterwork" && masterwork.length ? (
          <div className="divide-y divide-border">
            {masterwork.map((stat) => (
              <div key={stat.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3">
                <span className="text-sm font-semibold text-foreground">{statLabel(stat.key, locale)}</span>
                <span className="text-right font-mono text-sm font-bold text-foreground">
                  {formatStat(stat.key, stat.base)}
                  <span className="mx-2 text-muted-foreground">→</span>
                  <span className="text-orange-500">{formatStat(stat.key, stat.base + stat.bonus)}</span>
                </span>
              </div>
            ))}
          </div>
        ) : statLines.length ? (
          <div className="divide-y divide-border">
            {statLines.map((line, index) => {
              const match = line.match(/^([+\-]?\d+(?:\.\d+)?%?)\s*(.*)$/);
              return (
                <div key={`${line}-${index}`} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 px-4 py-3">
                  <span className="min-w-16 font-mono text-sm font-black text-gold-strong">
                    {match?.[1] ?? "•"}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{match?.[2] || line}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-4 py-4 text-sm text-muted-foreground">
            {copy(
              "Sem atributos diretos expostos nesta versão do Data Dragon.",
              "No direct stats exposed in this Data Dragon version.",
              "Sin atributos directos expuestos en esta versión de Data Dragon.",
            )}
          </p>
        )}
      </section>

      {cleanDescription || item.plaintext ? (
        <p className="mt-5 whitespace-pre-line text-sm leading-7 text-muted-foreground">
          {cleanDescription || item.plaintext}
        </p>
      ) : null}

      <RecipeTree
        currentId={id}
        currentItem={item}
        components={components}
        upgrades={upgrades}
        version={version}
        locale={locale}
        onSelect={onSelect}
      />

      {variant === "base" &&
      isOrnnMasterworkCandidate(item, allItems) &&
      masterworkStats(item, englishItems.get(id) ?? englishItem).length ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-orange-400/25 bg-orange-500/[0.05] p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-500">
            <Hammer className="size-4" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.1em] text-orange-500">
              {copy("Elegível ao Magistral do Ornn", "Eligible for Ornn Masterwork", "Elegible para Magistral de Ornn")}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {copy(
                "A versão aprimorada aparece como uma entrada separada no catálogo para não misturar os atributos normais com os bônus do Ornn.",
                "The upgraded version appears as a separate catalog entry so normal stats are never mixed with Ornn bonuses.",
                "La versión mejorada aparece como una entrada separada para no mezclar atributos normales con los bonos de Ornn.",
              )}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RecipeTree({
  currentId,
  currentItem,
  components,
  upgrades,
  version,
  locale,
  onSelect,
}: {
  currentId: string;
  currentItem: LeagueItem;
  components: Array<readonly [string, LeagueItem]>;
  upgrades: Array<readonly [string, LeagueItem]>;
  version: string;
  locale: Locale;
  onSelect: (id: string) => void;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <section className="mt-7">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            {copy("Árvore de construção", "Build tree", "Árbol de construcción")}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {copy(
              "Clique em qualquer nó para navegar pela receita.",
              "Select any node to navigate the recipe.",
              "Selecciona cualquier nodo para navegar por la receta.",
            )}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-[radial-gradient(circle_at_center,hsl(var(--gold)/0.06),transparent_65%),hsl(var(--muted)/0.08)] p-4 sm:p-5">
        {components.length ? (
          <>
            <div className="mb-3 flex items-center justify-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted-foreground">
              <ArrowDown className="size-3.5 text-gold-strong" />
              {copy("Componentes necessários", "Required components", "Componentes necesarios")}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {components.map(([id, item]) => (
                <RecipeNode key={id} id={id} item={item} version={version} onSelect={onSelect} />
              ))}
            </div>
            <div className="mx-auto my-3 h-7 w-px bg-gradient-to-b from-gold/60 to-border" />
          </>
        ) : null}

        <div className="mx-auto max-w-xs">
          <div className="rounded-2xl border border-gold/45 bg-background/90 p-3 shadow-lift">
            <div className="flex items-center gap-3">
              <img src={itemIcon(version, currentItem)} alt="" className="size-14 rounded-xl object-contain" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{currentItem.name}</p>
                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-gold-strong">
                  <Coins className="size-3" />
                  {currentItem.gold?.total ?? 0}
                </p>
                <span className="sr-only">#{currentId}</span>
              </div>
            </div>
          </div>
        </div>

        {upgrades.length ? (
          <>
            <div className="mx-auto my-3 h-7 w-px bg-gradient-to-b from-border to-gold/60" />
            <div className="mb-3 flex items-center justify-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted-foreground">
              <ArrowUp className="size-3.5 text-gold-strong" />
              {copy("Pode evoluir para", "Builds into", "Puede evolucionar a")}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {upgrades.map(([id, item]) => (
                <RecipeNode key={id} id={id} item={item} version={version} onSelect={onSelect} />
              ))}
            </div>
          </>
        ) : null}

        {!components.length && !upgrades.length ? (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {copy(
              "Este item não possui relações de receita expostas no Data Dragon atual.",
              "This item exposes no recipe relations in the current Data Dragon data.",
              "Este objeto no expone relaciones de receta en los datos actuales de Data Dragon.",
            )}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function RecipeNode({
  id,
  item,
  version,
  onSelect,
}: {
  id: string;
  item: LeagueItem;
  version: string;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className="group w-28 rounded-xl border border-border bg-background/80 p-2 text-center transition-all hover:-translate-y-1 hover:border-gold/45 hover:shadow-lift"
    >
      <img
        src={itemIcon(version, item)}
        alt=""
        loading="lazy"
        decoding="async"
        className="mx-auto size-12 rounded-lg object-contain transition-transform group-hover:scale-105"
      />
      <p className="mt-2 truncate text-[0.68rem] font-semibold text-foreground">{item.name}</p>
      <p className="mt-1 flex items-center justify-center gap-1 text-[0.62rem] font-bold text-gold-strong">
        <Coins className="size-3" />
        {item.gold?.total ?? 0}
      </p>
    </button>
  );
}
