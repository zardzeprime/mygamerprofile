import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Coins, Hammer, Search, ShieldCheck, Sparkles } from "lucide-react";
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

function isOrnnMasterworkCandidate(item: LeagueItem, allItems: Map<string, LeagueItem>) {
  if (!isVisibleStoreItem(item)) return false;
  if ((item.depth ?? 0) < 3) return false;
  if ((item.gold?.total ?? 0) < 1800) return false;
  if (hasSummonersRiftUpgrade(item, allItems)) return false;
  const name = item.name.toLowerCase();
  if (name.includes("mejai")) return false;
  const excludedTags = new Set(["Boots", "Consumable", "Trinket", "GoldPer"]);
  if (item.tags?.some((tag) => excludedTags.has(tag))) return false;
  return Boolean(item.from?.length);
}

function baseUpgradeableStats(item: LeagueItem, englishItem: LeagueItem): Array<Omit<UpgradeStat, "bonus">> {
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

export function LeagueItemsExplorerV2({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [version, setVersion] = useState(FALLBACK_VERSION);
  const [items, setItems] = useState<ItemEntry[]>([]);
  const [allItemEntries, setAllItemEntries] = useState<ItemEntry[]>([]);
  const [englishEntries, setEnglishEntries] = useState<ItemEntry[]>([]);
  const [query, setQuery] = useState("");
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
          const versionsResponse = await fetch(`${DDRAGON}/api/versions.json`, { signal: controller.signal });
          if (versionsResponse.ok) {
            const versions = (await versionsResponse.json()) as string[];
            current = versions[0] || FALLBACK_VERSION;
          }
        } catch (versionError) {
          if (!controller.signal.aborted) console.warn("[League] Using fallback Data Dragon version.", versionError);
        }

        const localUrl = `${DDRAGON}/cdn/${current}/data/${DATA_DRAGON_LOCALE[locale]}/item.json`;
        const englishUrl = `${DDRAGON}/cdn/${current}/data/en_US/item.json`;
        const [localResponse, englishResponse] = await Promise.all([
          fetch(localUrl, { signal: controller.signal }),
          locale === "en" ? Promise.resolve(null) : fetch(englishUrl, { signal: controller.signal }),
        ]);
        if (!localResponse.ok) throw new Error(`Data Dragon returned ${localResponse.status}`);
        if (englishResponse && !englishResponse.ok) throw new Error(`Data Dragon EN returned ${englishResponse.status}`);
        const payload = (await localResponse.json()) as ItemPayload;
        const englishPayload = englishResponse ? ((await englishResponse.json()) as ItemPayload) : payload;
        const everyItem = Object.entries(payload.data);
        const summonersRiftItems = dedupeCatalog(everyItem.filter(([, item]) => isVisibleStoreItem(item)));

        setVersion(current);
        setAllItemEntries(everyItem);
        setEnglishEntries(Object.entries(englishPayload.data));
        setItems(summonersRiftItems);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        console.error("[League] Item collection failed.", loadError);
        setError(copy("Não foi possível carregar os itens oficiais agora.", "Official items could not be loaded right now.", "No se pudieron cargar los objetos oficiales en este momento."));
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
      if (!normalized) return true;
      return (
        entry.item.name.toLowerCase().includes(normalized) ||
        entry.item.tags?.some((tag) => tag.toLowerCase().includes(normalized)) ||
        (entry.variant === "masterwork" && (normalized.includes("ornn") || normalized.includes("magistral") || normalized.includes("masterwork")))
      );
    });
  }, [catalog, query]);

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

  return (
    <section className="space-y-6">
      <div className="surface-panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <DataSourceIndicator source="verified" />
              <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">Riot Data Dragon · {version}</span>
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">{copy("Itens de Summoner's Rift", "Summoner's Rift items", "Objetos de la Grieta del Invocador")}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {copy(
                "Atributos oficiais, receitas clicáveis e uma versão Magistral separada para cada Lendário elegível ao Ornn.",
                "Official stats, clickable recipes, and a separate Masterwork version for every Ornn-eligible Legendary.",
                "Estadísticas oficiales, recetas interactivas y una versión Magistral separada para cada Legendario elegible de Ornn.",
              )}
            </p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{loading ? copy("Sincronizando…", "Syncing…", "Sincronizando…") : `${filtered.length} ${copy("entradas", "entries", "entradas")}`}</span>
        </div>
        <label className="mt-5 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-gold/50">
          <Search className="size-4 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" placeholder={copy("Buscar item ou Ornn…", "Search item or Ornn…", "Buscar objeto u Ornn…")} />
        </label>
      </div>

      {error ? <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">{error}</div> : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 16 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-xl border border-border bg-muted/40" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((entry) => {
            const statLines = extractStatLines(entry.item.description).slice(0, 3);
            const upgrades = entry.variant === "masterwork" ? masterworkStats(entry.item, entry.englishItem) : [];
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() => openEntry(entry.key)}
                title={entry.item.name}
                className={cn(
                  "group flex min-h-32 items-start gap-3 overflow-hidden rounded-xl border bg-surface p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-lift",
                  entry.variant === "masterwork" ? "border-orange-400/55 bg-[linear-gradient(180deg,rgba(249,115,22,0.08),transparent_38%)] hover:border-orange-300" : "border-border hover:border-gold/45",
                )}
              >
                <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted/60 p-1.5">
                  <img src={`${DDRAGON}/cdn/${version}/img/item/${entry.item.image.full}`} alt="" loading="lazy" width={56} height={56} className="size-14 object-contain" />
                  {entry.variant === "masterwork" ? (
                    <span className="absolute bottom-0.5 right-0.5 inline-flex items-center gap-0.5 rounded-full border border-orange-300/70 bg-popover px-1.5 py-0.5 text-[0.5rem] font-black uppercase text-orange-500 shadow-lg"><Hammer className="size-2.5" />ORNN</span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{entry.item.name}</p>
                      <p className={cn("mt-0.5 text-[0.6rem] font-bold uppercase tracking-[0.08em]", entry.variant === "masterwork" ? "text-orange-500" : "text-muted-foreground")}>
                        {entry.variant === "masterwork" ? copy("Magistral", "Masterwork", "Magistral") : copy("Item normal", "Base item", "Objeto normal")}
                      </p>
                    </div>
                    {entry.item.gold?.total ? <p className="flex shrink-0 items-center gap-1 text-[0.68rem] font-semibold text-gold-strong"><Coins className="size-3" />{entry.item.gold.total}</p> : null}
                  </div>
                  <div className="mt-2 flex min-h-12 flex-wrap content-start gap-1 text-[0.62rem] leading-4 text-muted-foreground">
                    {entry.variant === "masterwork"
                      ? upgrades.slice(0, 3).map((stat) => (
                          <span key={stat.key} className="max-w-full truncate rounded-md border border-orange-400/20 bg-background/65 px-1.5 py-0.5"><span className="text-foreground">{statLabel(stat.key, locale)}:</span> {formatStat(stat.key, stat.base)} → <span className="font-bold text-orange-500">{formatStat(stat.key, stat.base + stat.bonus)}</span></span>
                        ))
                      : statLines.map((line) => <span key={line} className="max-w-full truncate rounded-md border border-border bg-muted/30 px-1.5 py-0.5">{line}</span>)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-3 rounded-2xl border border-border bg-muted/15 p-4 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-strong" />
        <p>{copy(
          "Dados e imagens vêm do Riot Data Dragon. As versões Magistrais são visualizações calculadas do sistema atual do Ornn: os atributos elegíveis recebem, juntos, aproximadamente 1.000 de ouro em valor adicional; passivas e efeitos do item não mudam.",
          "Data and images come from Riot Data Dragon. Masterwork versions are calculated views of Ornn's current system: eligible stats together receive roughly 1,000 gold of additional stat value; item passives and effects remain unchanged.",
          "Los datos e imágenes provienen de Riot Data Dragon. Las versiones Magistrales son vistas calculadas del sistema actual de Ornn: los atributos elegibles reciben en conjunto aproximadamente 1.000 de oro de valor adicional; las pasivas y efectos no cambian.",
        )}</p>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && closeItem()}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
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

function ItemDetail({ entry, version, locale, allItems, englishItems, canGoBack, onBack, onSelect }: {
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
  const components = item.from?.map((componentId) => [componentId, allItems.get(componentId)] as const).filter((row): row is readonly [string, LeagueItem] => Boolean(row[1])) ?? [];
  const upgrades = item.into?.map((upgradeId) => [upgradeId, allItems.get(upgradeId)] as const).filter((row): row is readonly [string, LeagueItem] => Boolean(row[1]) && Boolean(row[1]?.maps?.["11"])) ?? [];
  const statLines = extractStatLines(item.description);
  const masterwork = variant === "masterwork" ? masterworkStats(item, englishItem) : [];

  return (
    <div>
      {canGoBack ? <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/20 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="size-3.5" />{copy("Voltar na árvore", "Back in tree", "Volver en el árbol")}</button> : null}

      <DialogHeader className="text-left">
        <div className="flex gap-4 pr-8">
          <div className={cn("grid size-20 shrink-0 place-items-center rounded-2xl p-1.5", variant === "masterwork" ? "bg-gradient-to-br from-orange-400 via-amber-200 to-orange-800" : "bg-muted") }>
            <img src={`${DDRAGON}/cdn/${version}/img/item/${item.image.full}`} alt="" width={68} height={68} className="size-[68px] rounded-xl bg-background object-contain p-1" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle className="font-display text-2xl">{item.name}</DialogTitle>
              {variant === "masterwork" ? <span className="inline-flex items-center gap-1 rounded-full border border-orange-400/45 bg-orange-500/10 px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.1em] text-orange-500"><Hammer className="size-3" />{copy("Magistral · Ornn", "Masterwork · Ornn", "Magistral · Ornn")}</span> : null}
            </div>
            <DialogDescription className="mt-1">#{id} {item.tags?.length ? `· ${item.tags.join(" · ")}` : ""}</DialogDescription>
            {item.gold?.total ? <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-gold-strong"><Coins className="size-4" />{item.gold.total}</p> : null}
          </div>
        </div>
      </DialogHeader>

      {variant === "masterwork" ? (
        <section className="mt-5 rounded-2xl border border-orange-400/35 bg-orange-500/[0.06] p-4">
          <div className="flex items-center gap-2 text-orange-500"><Hammer className="size-4" /><h3 className="text-xs font-black uppercase tracking-[0.12em]">{copy("Stats Magistral", "Masterwork stats", "Stats Magistrales")}</h3></div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {masterwork.map((stat) => (
              <div key={stat.key} className="rounded-xl border border-orange-400/20 bg-background/70 p-3">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">{statLabel(stat.key, locale)}</p>
                <p className="mt-1 font-display text-lg font-bold text-foreground">{formatStat(stat.key, stat.base)} <span className="mx-1 text-muted-foreground">→</span> <span className="text-orange-500">{formatStat(stat.key, stat.base + stat.bonus)}</span></p>
                <p className="mt-1 text-[0.65rem] font-semibold text-orange-500">+{formatStat(stat.key, stat.bonus)}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[0.7rem] leading-5 text-muted-foreground">{copy(
            "O aprimoramento distribui cerca de 1.000 de ouro em valor entre os atributos elegíveis que o item já possui. Passivas, ativos e efeitos permanecem os mesmos do item normal.",
            "The upgrade distributes about 1,000 gold of value across eligible stats the item already has. Passives, actives and effects remain the same as the base item.",
            "La mejora distribuye cerca de 1.000 de oro de valor entre los atributos elegibles que el objeto ya posee. Pasivas, activos y efectos permanecen iguales al objeto normal.",
          )}</p>
        </section>
      ) : (
        <section className="mt-5 rounded-2xl border border-border bg-muted/15 p-4">
          <div className="flex items-center gap-2"><Sparkles className="size-4 text-gold-strong" /><h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{copy("Atributos", "Stats", "Atributos")}</h3></div>
          {statLines.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{statLines.map((line) => <div key={line} className="rounded-xl border border-border bg-background/65 px-3 py-2 text-sm font-semibold text-foreground">{line}</div>)}</div> : <p className="mt-3 text-xs text-muted-foreground">{copy("Sem atributos diretos expostos nesta versão do Data Dragon.", "No direct stats exposed in this Data Dragon version.", "Sin atributos directos expuestos en esta versión de Data Dragon.")}</p>}
        </section>
      )}

      <p className="mt-5 text-sm leading-7 text-muted-foreground">{stripMarkup(item.description).replace(statLines.join(" "), "") || item.plaintext}</p>

      {variant === "base" && isOrnnMasterworkCandidate(item, allItems) && masterworkStats(item, englishItems.get(id) ?? englishItem).length ? (
        <button type="button" onClick={() => {}} disabled className="mt-5 flex w-full items-center gap-3 rounded-xl border border-orange-400/25 bg-orange-500/[0.04] p-3 text-left opacity-90">
          <span className="grid size-9 place-items-center rounded-xl bg-orange-500/10 text-orange-500"><Hammer className="size-4" /></span>
          <span><span className="block text-xs font-black uppercase tracking-[0.1em] text-orange-500">{copy("Também existe como Magistral", "Also available as Masterwork", "También existe como Magistral")}</span><span className="mt-1 block text-xs text-muted-foreground">{copy("Volte ao catálogo para abrir a cópia aprimorada do Ornn.", "Return to the catalog to open the Ornn-upgraded copy.", "Vuelve al catálogo para abrir la copia mejorada por Ornn.")}</span></span>
        </button>
      ) : null}

      {components.length ? <ItemLinks title={copy("Componentes", "Components", "Componentes")} entries={components} version={version} onSelect={onSelect} /> : null}
      {upgrades.length ? <ItemLinks title={copy("Pode construir", "Builds into", "Puede construir")} entries={upgrades} version={version} onSelect={onSelect} /> : null}
    </div>
  );
}

function ItemLinks({ title, entries, version, onSelect }: { title: string; entries: Array<readonly [string, LeagueItem]>; version: string; onSelect: (id: string) => void }) {
  return (
    <section className="mt-6">
      <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {entries.map(([id, item]) => (
          <button key={id} type="button" onClick={() => onSelect(id)} className="group flex items-center gap-2 rounded-xl border border-border bg-muted/15 p-2 pr-3 text-left transition-all hover:-translate-y-0.5 hover:border-gold/45 hover:bg-muted/25">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-muted/60 p-1">
              <img src={`${DDRAGON}/cdn/${version}/img/item/${item.image.full}`} alt="" loading="lazy" width={32} height={32} className="size-8 object-contain" />
            </span>
            <span className="max-w-44 text-xs font-semibold text-foreground group-hover:text-gold-strong">{item.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
