import { useEffect, useMemo, useState } from "react";
import { Coins, Search, ShieldCheck } from "lucide-react";
import { DataSourceIndicator } from "@/components/common/DataSourceIndicator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

const DDRAGON = "https://ddragon.leagueoflegends.com";
const FALLBACK_VERSION = "16.18.1";
const DATA_DRAGON_LOCALE: Record<Locale, string> = { "pt-BR": "pt_BR", en: "en_US", es: "es_ES" };

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
};

type ItemPayload = { data: Record<string, LeagueItem> };

function stripMarkup(value: string | undefined) {
  return (value ?? "")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function LeagueItemsExplorer({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [version, setVersion] = useState(FALLBACK_VERSION);
  const [items, setItems] = useState<Array<[string, LeagueItem]>>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<[string, LeagueItem] | null>(null);
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
        const response = await fetch(`${DDRAGON}/cdn/${current}/data/${DATA_DRAGON_LOCALE[locale]}/item.json`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Data Dragon returned ${response.status}`);
        const payload = (await response.json()) as ItemPayload;
        const summonersRiftItems = Object.entries(payload.data)
          .filter(([, item]) => item.maps?.["11"] !== false && item.gold?.purchasable !== false)
          .sort(([, a], [, b]) => a.name.localeCompare(b.name));
        setVersion(current);
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

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter(([, item]) => {
      if (!normalized) return true;
      return item.name.toLowerCase().includes(normalized) || item.tags?.some((tag) => tag.toLowerCase().includes(normalized));
    });
  }, [items, query]);

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
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{copy("Catálogo oficial com nome, descrição, custo, tags e árvore de componentes. Clique em um item para abrir os detalhes.", "Official catalog with names, descriptions, costs, tags and component trees. Select an item for details.", "Catálogo oficial con nombre, descripción, coste, etiquetas y árbol de componentes. Selecciona un objeto para ver los detalles.")}</p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{loading ? copy("Sincronizando…", "Syncing…", "Sincronizando…") : `${filtered.length} / ${items.length}`}</span>
        </div>
        <label className="mt-5 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-gold/50">
          <Search className="size-4 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" placeholder={copy("Buscar item…", "Search item…", "Buscar objeto…")} />
        </label>
      </div>

      {error ? <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">{error}</div> : null}

      {loading ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {Array.from({ length: 36 }).map((_, index) => <div key={index} className="aspect-square animate-pulse rounded-xl border border-border bg-muted/40" />)}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {filtered.map(([id, item]) => (
            <button key={id} type="button" onClick={() => setSelected([id, item])} title={item.name} className="group overflow-hidden rounded-xl border border-border bg-surface p-2 text-left transition-all hover:-translate-y-0.5 hover:border-gold/45 hover:shadow-lift">
              <img src={`${DDRAGON}/cdn/${version}/img/item/${item.image.full}`} alt="" loading="lazy" className="aspect-square w-full rounded-lg bg-black object-cover" />
              <p className="mt-2 truncate text-[0.68rem] font-semibold text-foreground">{item.name}</p>
              {item.gold?.total ? <p className="mt-1 flex items-center gap-1 text-[0.62rem] text-muted-foreground"><Coins className="size-3" />{item.gold.total}</p> : null}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 rounded-2xl border border-border bg-muted/15 p-4 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-strong" />
        <p>{copy("Dados e imagens desta seção vêm do Riot Data Dragon. O MGP é independente e não é endossado pela Riot Games.", "Data and images in this section come from Riot Data Dragon. MGP is independent and is not endorsed by Riot Games.", "Los datos e imágenes de esta sección provienen de Riot Data Dragon. MGP es independiente y no está respaldado por Riot Games.")}</p>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected ? <ItemDetail id={selected[0]} item={selected[1]} version={version} locale={locale} items={items} /> : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ItemDetail({ id, item, version, locale, items }: { id: string; item: LeagueItem; version: string; locale: Locale; items: Array<[string, LeagueItem]> }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const itemMap = useMemo(() => new Map(items), [items]);
  const components = item.from?.map((componentId) => [componentId, itemMap.get(componentId)] as const).filter((entry) => Boolean(entry[1])) ?? [];
  const upgrades = item.into?.map((upgradeId) => [upgradeId, itemMap.get(upgradeId)] as const).filter((entry) => Boolean(entry[1])) ?? [];

  return (
    <div>
      <DialogHeader className="text-left">
        <div className="flex gap-4 pr-8">
          <img src={`${DDRAGON}/cdn/${version}/img/item/${item.image.full}`} alt="" className="size-20 rounded-xl border border-border bg-black object-cover" />
          <div className="min-w-0">
            <DialogTitle className="font-display text-2xl">{item.name}</DialogTitle>
            <DialogDescription className="mt-1">#{id} {item.tags?.length ? `· ${item.tags.join(" · ")}` : ""}</DialogDescription>
            {item.gold?.total ? <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-gold-strong"><Coins className="size-4" />{item.gold.total}</p> : null}
          </div>
        </div>
      </DialogHeader>
      <p className="mt-5 text-sm leading-7 text-muted-foreground">{stripMarkup(item.description) || item.plaintext}</p>
      {components.length ? <ItemLinks title={copy("Componentes", "Components", "Componentes")} entries={components} version={version} /> : null}
      {upgrades.length ? <ItemLinks title={copy("Evolui para", "Builds into", "Evoluciona a")} entries={upgrades} version={version} /> : null}
    </div>
  );
}

function ItemLinks({ title, entries, version }: { title: string; entries: Array<readonly [string, LeagueItem | undefined]>; version: string }) {
  return (
    <section className="mt-6">
      <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {entries.map(([id, item]) => item ? (
          <div key={id} className="flex items-center gap-2 rounded-xl border border-border bg-muted/15 p-2 pr-3">
            <img src={`${DDRAGON}/cdn/${version}/img/item/${item.image.full}`} alt="" className="size-9 rounded-lg bg-black" />
            <span className="text-xs font-semibold text-foreground">{item.name}</span>
          </div>
        ) : null)}
      </div>
    </section>
  );
}
