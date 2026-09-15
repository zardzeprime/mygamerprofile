import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Coins, Hammer, Search, ShieldCheck } from "lucide-react";
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
};

type ItemPayload = { data: Record<string, LeagueItem> };
type ItemEntry = [string, LeagueItem];

function stripMarkup(value: string | undefined) {
  return (value ?? "")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
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
      // Stable tie-breaker: prefer the canonical-looking lower numeric id.
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
  if (item.requiredChampion?.toLocaleLowerCase() === "ornn") return true;
  if (!isVisibleStoreItem(item)) return false;
  if ((item.depth ?? 0) < 3) return false;
  if ((item.gold?.total ?? 0) < 1800) return false;
  if (hasSummonersRiftUpgrade(item, allItems)) return false;
  const excludedTags = new Set(["Boots", "Consumable", "Trinket"]);
  if (item.tags?.some((tag) => excludedTags.has(tag))) return false;
  return Boolean(item.from?.length);
}

export function LeagueItemsExplorer({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [version, setVersion] = useState(FALLBACK_VERSION);
  const [items, setItems] = useState<ItemEntry[]>([]);
  const [allItemEntries, setAllItemEntries] = useState<ItemEntry[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

        const response = await fetch(
          `${DDRAGON}/cdn/${current}/data/${DATA_DRAGON_LOCALE[locale]}/item.json`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`Data Dragon returned ${response.status}`);
        const payload = (await response.json()) as ItemPayload;
        const everyItem = Object.entries(payload.data);
        const summonersRiftItems = dedupeCatalog(everyItem.filter(([, item]) => isVisibleStoreItem(item)));

        setVersion(current);
        setAllItemEntries(everyItem);
        setItems(summonersRiftItems);
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

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter(([, item]) => {
      if (!normalized) return true;
      return (
        item.name.toLowerCase().includes(normalized) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(normalized))
      );
    });
  }, [items, query]);

  const openItem = (id: string, fromId?: string) => {
    if (!allItems.has(id)) return;
    if (fromId && fromId !== id) setHistory((current) => [...current, fromId].slice(-30));
    setSelectedId(id);
  };

  const closeItem = () => {
    setSelectedId(null);
    setHistory([]);
  };

  const goBack = () => {
    setHistory((current) => {
      if (!current.length) return current;
      const next = [...current];
      const previous = next.pop();
      if (previous) setSelectedId(previous);
      return next;
    });
  };

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
              {copy("Itens de Summoner's Rift", "Summoner's Rift items", "Objetos de la Grieta del Invocador")}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {copy(
                "Catálogo do mapa principal com árvore navegável. Abra um item e clique nos componentes ou nos itens que ele constrói para percorrer toda a receita.",
                "Main-map catalog with a navigable build tree. Open an item and select its components or resulting items to walk the entire recipe.",
                "Catálogo del mapa principal con árbol navegable. Abre un objeto y selecciona sus componentes o resultados para recorrer toda la receta.",
              )}
            </p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {loading ? copy("Sincronizando…", "Syncing…", "Sincronizando…") : `${filtered.length} / ${items.length}`}
          </span>
        </div>

        <label className="mt-5 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-gold/50">
          <Search className="size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            placeholder={copy("Buscar item…", "Search item…", "Buscar objeto…")}
          />
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {Array.from({ length: 36 }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-xl border border-border bg-muted/40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {filtered.map(([id, item]) => {
            const masterwork = isOrnnMasterworkCandidate(item, allItems);
            return (
              <button
                key={id}
                type="button"
                onClick={() => openItem(id)}
                title={item.name}
                className={cn(
                  "group overflow-hidden rounded-xl border bg-surface p-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-lift",
                  masterwork ? "border-amber-500/35 hover:border-orange-400/70" : "border-border hover:border-gold/45",
                )}
              >
                <div className="relative">
                  <img
                    src={`${DDRAGON}/cdn/${version}/img/item/${item.image.full}`}
                    alt=""
                    loading="lazy"
                    className="aspect-square w-full rounded-lg bg-black object-cover"
                  />
                  {masterwork ? (
                    <span
                      className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border border-orange-300/70 bg-[#24140b] text-orange-200 shadow-lg"
                      title={copy("Lendário elegível ao sistema Magistral do Ornn", "Legendary item for Ornn's Masterwork system", "Objeto legendario para el sistema Magistral de Ornn")}
                    >
                      <Hammer className="size-3" />
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 truncate text-[0.68rem] font-semibold text-foreground">{item.name}</p>
                {item.gold?.total ? (
                  <p className="mt-1 flex items-center gap-1 text-[0.62rem] text-muted-foreground">
                    <Coins className="size-3" />
                    {item.gold.total}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-3 rounded-2xl border border-border bg-muted/15 p-4 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-strong" />
        <p>
          {copy(
            "Dados e imagens desta seção vêm do Riot Data Dragon. Variantes de outros modos e entradas ocultas da loja são removidas do catálogo principal. O MGP é independente e não é endossado pela Riot Games.",
            "Data and images in this section come from Riot Data Dragon. Other-mode variants and hidden store entries are removed from the main catalog. MGP is independent and is not endorsed by Riot Games.",
            "Los datos e imágenes de esta sección provienen de Riot Data Dragon. Las variantes de otros modos y entradas ocultas se eliminan del catálogo principal. MGP es independiente y no está respaldado por Riot Games.",
          )}
        </p>
      </div>

      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && closeItem()}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          {selectedId && allItems.get(selectedId) ? (
            <ItemDetail
              id={selectedId}
              item={allItems.get(selectedId)!}
              version={version}
              locale={locale}
              allItems={allItems}
              canGoBack={history.length > 0}
              onBack={goBack}
              onSelect={(targetId) => openItem(targetId, selectedId)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ItemDetail({
  id,
  item,
  version,
  locale,
  allItems,
  canGoBack,
  onBack,
  onSelect,
}: {
  id: string;
  item: LeagueItem;
  version: string;
  locale: Locale;
  allItems: Map<string, LeagueItem>;
  canGoBack: boolean;
  onBack: () => void;
  onSelect: (id: string) => void;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const components =
    item.from
      ?.map((componentId) => [componentId, allItems.get(componentId)] as const)
      .filter((entry): entry is readonly [string, LeagueItem] => Boolean(entry[1])) ?? [];
  const upgrades =
    item.into
      ?.map((upgradeId) => [upgradeId, allItems.get(upgradeId)] as const)
      .filter(
        (entry): entry is readonly [string, LeagueItem] =>
          Boolean(entry[1]) && Boolean(entry[1]?.maps?.["11"]),
      ) ?? [];
  const masterwork = isOrnnMasterworkCandidate(item, allItems);

  return (
    <div>
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
              "shrink-0 rounded-2xl p-[1px]",
              masterwork
                ? "bg-gradient-to-br from-orange-400 via-amber-200 to-orange-700"
                : "bg-border",
            )}
          >
            <img
              src={`${DDRAGON}/cdn/${version}/img/item/${item.image.full}`}
              alt=""
              className="size-20 rounded-[calc(1rem-1px)] bg-black object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <DialogTitle className="font-display text-2xl">{item.name}</DialogTitle>
              {masterwork ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-orange-400/45 bg-orange-500/10 px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.1em] text-orange-500">
                  <Hammer className="size-3" />
                  {copy("Magistral · Ornn", "Masterwork · Ornn", "Magistral · Ornn")}
                </span>
              ) : null}
            </div>
            <DialogDescription className="mt-1">
              #{id} {item.tags?.length ? `· ${item.tags.join(" · ")}` : ""}
            </DialogDescription>
            {item.gold?.total ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-gold-strong">
                <Coins className="size-4" />
                {item.gold.total}
              </p>
            ) : null}
          </div>
        </div>
      </DialogHeader>

      <p className="mt-5 text-sm leading-7 text-muted-foreground">
        {stripMarkup(item.description) || item.plaintext}
      </p>

      {masterwork ? <OrnnMasterworkCard item={item} locale={locale} /> : null}

      {components.length ? (
        <ItemLinks
          title={copy("Componentes", "Components", "Componentes")}
          description={copy("Clique para descer na receita.", "Select to go down the recipe.", "Selecciona para bajar en la receta.")}
          entries={components}
          version={version}
          onSelect={onSelect}
        />
      ) : null}

      {upgrades.length ? (
        <ItemLinks
          title={copy("Pode construir", "Builds into", "Puede construir")}
          description={copy("Clique para subir para o próximo item.", "Select to move up to the next item.", "Selecciona para subir al siguiente objeto.")}
          entries={upgrades}
          version={version}
          onSelect={onSelect}
        />
      ) : null}

      {!components.length && !upgrades.length ? (
        <p className="mt-6 rounded-xl border border-border bg-muted/15 p-4 text-xs leading-5 text-muted-foreground">
          {copy(
            "Este item não expõe relações de receita válidas para Summoner's Rift no Data Dragon atual.",
            "This item does not expose valid Summoner's Rift recipe relations in the current Data Dragon data.",
            "Este objeto no expone relaciones de receta válidas para la Grieta del Invocador en los datos actuales de Data Dragon.",
          )}
        </p>
      ) : null}
    </div>
  );
}

function OrnnMasterworkCard({ item, locale }: { item: LeagueItem; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  return (
    <div className="mt-6 rounded-2xl bg-gradient-to-br from-orange-400 via-amber-200 to-orange-800 p-[1px] shadow-[0_0_28px_rgba(249,115,22,0.12)]">
      <div className="rounded-[calc(1rem-1px)] bg-background/95 p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-orange-400/40 bg-orange-500/10 text-orange-500">
            <Hammer className="size-4" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-orange-500">
              {copy("Aprimoramento Magistral do Ornn", "Ornn Masterwork upgrade", "Mejora Magistral de Ornn")}
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-foreground">{item.name}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {copy(
                "No sistema atual do LoL, o item aprimorado pelo Ornn mantém o próprio nome e recebe o estado Magistral com atributos adicionais. O MGP mostra esse estado com a borda do Ornn em vez de criar uma cópia com um nome antigo.",
                "In the current LoL system, an Ornn-upgraded item keeps its own name and gains Masterwork status with additional stats. MGP represents that state with the Ornn border instead of creating a duplicate with an old legacy name.",
                "En el sistema actual de LoL, un objeto mejorado por Ornn conserva su nombre y obtiene el estado Magistral con atributos adicionales. MGP representa ese estado con el borde de Ornn en lugar de crear un duplicado con un nombre antiguo.",
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemLinks({
  title,
  description,
  entries,
  version,
  onSelect,
}: {
  title: string;
  description: string;
  entries: Array<readonly [string, LeagueItem]>;
  version: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="mt-6">
      <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{title}</h3>
      <p className="mt-1 text-[0.7rem] text-muted-foreground">{description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {entries.map(([id, item]) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className="group flex items-center gap-2 rounded-xl border border-border bg-muted/15 p-2 pr-3 text-left transition-all hover:-translate-y-0.5 hover:border-gold/45 hover:bg-muted/25"
          >
            <img
              src={`${DDRAGON}/cdn/${version}/img/item/${item.image.full}`}
              alt=""
              className="size-10 rounded-lg bg-black"
            />
            <span className="max-w-44 text-xs font-semibold text-foreground group-hover:text-gold-strong">
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
