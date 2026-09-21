import {
  BookOpen,
  ExternalLink,
  Loader2,
  Search,
  Shield,
  Sparkles,
  Sword,
  WandSparkles,
  Gem,
  PackageOpen,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import {
  loadSoulsCompendium,
  SOULS_COMPENDIUM_SOURCE,
  type SoulsCompendiumCategory,
  type SoulsCompendiumEntry,
  type SoulsCompendiumGame,
} from "@/lib/souls-compendium";
import { cn } from "@/lib/utils";

const CATEGORIES: Array<{
  key: "all" | SoulsCompendiumCategory;
  icon: typeof Sword;
}> = [
  { key: "all", icon: BookOpen },
  { key: "weapon", icon: Sword },
  { key: "armor", icon: Shield },
  { key: "ring", icon: Gem },
  { key: "magic", icon: WandSparkles },
  { key: "item", icon: PackageOpen },
];

export function SoulsItemCompendium({
  gameSlug,
  locale,
}: {
  gameSlug: SoulsCompendiumGame;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [entries, setEntries] = useState<SoulsCompendiumEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [category, setCategory] = useState<"all" | SoulsCompendiumCategory>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);

    void loadSoulsCompendium(gameSlug)
      .then((data) => {
        if (!active) return;
        setEntries(data);
        setSelectedId(data[0]?.id ?? null);
      })
      .catch((error) => {
        console.warn("[SoulsItemCompendium] load failed", error);
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [gameSlug]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale);
    return entries.filter((entry) => {
      if (category !== "all" && entry.category !== category) return false;
      if (!normalized) return true;
      return `${entry.name} ${entry.description}`
        .toLocaleLowerCase(locale)
        .includes(normalized);
    });
  }, [category, entries, locale, query]);

  const selected =
    entries.find((entry) => entry.id === selectedId) ?? filtered[0] ?? entries[0] ?? null;

  const gameName = gameSlug === "dark-souls-remastered" ? "Dark Souls Remastered" : "Dark Souls III";

  const categoryLabel = (value: "all" | SoulsCompendiumCategory) => {
    const labels = {
      all: copy("Tudo", "All", "Todo"),
      weapon: copy("Armas e escudos", "Weapons & shields", "Armas y escudos"),
      armor: copy("Armaduras", "Armor", "Armaduras"),
      ring: copy("Anéis", "Rings", "Anillos"),
      magic: copy("Magias", "Magic", "Magias"),
      item: copy("Itens", "Items", "Objetos"),
    };
    return labels[value];
  };

  return (
    <div className="space-y-6">
      <section className="surface-panel overflow-hidden">
        <div className="border-b border-border bg-[radial-gradient(circle_at_top_right,hsl(var(--gold)/0.10),transparent_48%)] p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-gold-strong">
            <Sparkles className="size-4" />
            <span className="section-kicker">MGP · SOULS COMPENDIUM</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
            {copy(
              `Compêndio de ${gameName}`,
              `${gameName} compendium`,
              `Compendio de ${gameName}`,
            )}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy(
              "Armas, escudos, armaduras, anéis, magias e itens em um único diretório pesquisável. O beta usa os ícones originais apenas como referência e mantém a procedência visível.",
              "Weapons, shields, armor, rings, magic and items in one searchable directory. The beta uses original icons as reference only and keeps provenance visible.",
              "Armas, escudos, armaduras, anillos, magia y objetos en un único directorio buscable. La beta usa iconos originales solo como referencia y mantiene la procedencia visible.",
            )}
          </p>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-gold/50">
            <Search className="size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              placeholder={copy(
                "Buscar arma, anel, magia, item…",
                "Search weapon, ring, spell, item…",
                "Buscar arma, anillo, magia, objeto…",
              )}
            />
          </label>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map(({ key, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={cn(
                  "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-bold transition",
                  category === key
                    ? "border-gold/45 bg-gold/10 text-foreground"
                    : "border-border bg-muted/10 text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {categoryLabel(key)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 text-[0.66rem] font-semibold text-muted-foreground">
            <span className="rounded-full border border-border px-2.5 py-1">
              {filtered.length} {copy("resultados", "results", "resultados")}
            </span>
            {CATEGORIES.slice(1).map(({ key }) => (
              <span key={key} className="rounded-full border border-border px-2.5 py-1">
                {categoryLabel(key)} · {entries.filter((entry) => entry.category === key).length}
              </span>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <section className="surface-panel p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-gold-strong" />
            {copy("Carregando compêndio…", "Loading compendium…", "Cargando compendio…")}
          </div>
        </section>
      ) : failed ? (
        <section className="surface-panel p-6 text-sm leading-6 text-muted-foreground">
          {copy(
            "A fonte do compêndio não respondeu agora. Os bosses, builds e guias locais continuam disponíveis.",
            "The compendium source is unavailable right now. Local bosses, builds and guides remain available.",
            "La fuente del compendio no respondió ahora. Los jefes, builds y guías locales siguen disponibles.",
          )}
        </section>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <section className="surface-panel p-4 sm:p-5">
            {filtered.length ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setSelectedId(entry.id)}
                    className={cn(
                      "min-w-0 rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:border-gold/30",
                      selected?.id === entry.id
                        ? "border-gold/45 bg-gold/10"
                        : "border-border bg-muted/10",
                    )}
                  >
                    <div className="mx-auto grid aspect-square max-w-24 place-items-center overflow-hidden rounded-xl border border-border bg-black/20">
                      <img
                        src={entry.iconUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-contain p-2"
                      />
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs font-bold leading-5 text-foreground">
                      {entry.name}
                    </p>
                    <p className="mt-1 text-[0.6rem] font-black uppercase tracking-[0.08em] text-muted-foreground">
                      {categoryLabel(entry.category)}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                {copy("Nenhum resultado encontrado.", "No results found.", "No se encontraron resultados.")}
              </div>
            )}
          </section>

          {selected ? (
            <aside className="surface-panel self-start overflow-hidden xl:sticky xl:top-24">
              <div className="border-b border-border p-5">
                <div className="mx-auto grid size-36 place-items-center rounded-2xl border border-border bg-black/20">
                  <img src={selected.iconUrl} alt="" className="size-full object-contain p-3" />
                </div>
                <p className="mt-4 text-[0.62rem] font-black uppercase tracking-[0.1em] text-gold-strong">
                  {categoryLabel(selected.category)}
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold text-foreground">
                  {selected.name}
                </h3>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
                    {copy("Descrição de referência", "Reference description", "Descripción de referencia")}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                    {selected.description || copy("Sem descrição na fonte.", "No source description.", "Sin descripción en la fuente.")}
                  </p>
                </div>

                <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3">
                  <p className="text-xs font-bold text-foreground">
                    {copy("Créditos e direitos", "Credits & rights", "Créditos y derechos")}
                  </p>
                  <p className="mt-1 text-[0.66rem] leading-5 text-muted-foreground">
                    {SOULS_COMPENDIUM_SOURCE.rights}
                  </p>
                  <a
                    href={SOULS_COMPENDIUM_SOURCE.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[0.68rem] font-bold text-gold-strong hover:underline"
                  >
                    {SOULS_COMPENDIUM_SOURCE.label}
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      )}
    </div>
  );
}
