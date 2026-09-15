import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, Sparkles, Swords, WandSparkles } from "lucide-react";
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

type ChampionSummary = {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  partype: string;
  image: { full: string };
  info?: { attack: number; defense: number; magic: number; difficulty: number };
};

type ChampionSkin = {
  id: string;
  num: number;
  name: string;
  chromas: boolean;
  parentSkin?: number | string | null;
};

type ChampionSpell = {
  id: string;
  name: string;
  description: string;
  tooltip?: string;
  image: { full: string };
};

type ChampionDetail = ChampionSummary & {
  lore: string;
  blurb: string;
  skins: ChampionSkin[];
  passive: { name: string; description: string; image: { full: string } };
  spells: ChampionSpell[];
};

type ChampionPayload<T> = { data: Record<string, T> };

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

function championIcon(version: string, champion: ChampionSummary) {
  return `${DDRAGON}/cdn/${version}/img/champion/${champion.image.full}`;
}

function spellIcon(version: string, fileName: string) {
  return `${DDRAGON}/cdn/${version}/img/spell/${fileName}`;
}

function passiveIcon(version: string, fileName: string) {
  return `${DDRAGON}/cdn/${version}/img/passive/${fileName}`;
}

function skinSplash(championId: string, skinNumber: number) {
  return `${DDRAGON}/cdn/img/champion/splash/${championId}_${skinNumber}.jpg`;
}

function baseSkinsOnly(skins: ChampionSkin[]) {
  // Data Dragon can flag chroma variants as children of a parent skin. The MGP
  // deliberately exposes one card per actual skin and never one per chroma.
  return skins.filter((skin) => skin.parentSkin === undefined || skin.parentSkin === null);
}

export function LeagueChampionExplorer({
  locale,
  mode = "champions",
}: {
  locale: Locale;
  mode?: "champions" | "skins";
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [version, setVersion] = useState(FALLBACK_VERSION);
  const [champions, setChampions] = useState<ChampionSummary[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ChampionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadChampions() {
      setLoading(true);
      setError("");
      try {
        let currentVersion = FALLBACK_VERSION;
        try {
          const versionsResponse = await fetch(`${DDRAGON}/api/versions.json`, {
            signal: controller.signal,
          });
          if (versionsResponse.ok) {
            const versions = (await versionsResponse.json()) as string[];
            currentVersion = versions[0] || FALLBACK_VERSION;
          }
        } catch (versionError) {
          if (!controller.signal.aborted) {
            console.warn("[League] Could not resolve latest Data Dragon version; using fallback.", versionError);
          }
        }

        const response = await fetch(
          `${DDRAGON}/cdn/${currentVersion}/data/${DATA_DRAGON_LOCALE[locale]}/champion.json`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`Data Dragon returned ${response.status}`);
        const payload = (await response.json()) as ChampionPayload<ChampionSummary>;
        setVersion(currentVersion);
        setChampions(Object.values(payload.data).sort((a, b) => a.name.localeCompare(b.name)));
      } catch (loadError) {
        if (controller.signal.aborted) return;
        console.error("[League] Champion collection failed.", loadError);
        setError(
          copy(
            "Não foi possível carregar o catálogo oficial da Riot agora.",
            "The official Riot catalog could not be loaded right now.",
            "No se pudo cargar el catálogo oficial de Riot en este momento.",
          ),
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadChampions();
    return () => controller.abort();
  }, [locale]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    const controller = new AbortController();
    async function loadDetail() {
      setDetailLoading(true);
      setSelectedSkin(0);
      try {
        const response = await fetch(
          `${DDRAGON}/cdn/${version}/data/${DATA_DRAGON_LOCALE[locale]}/champion/${selectedId}.json`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`Data Dragon returned ${response.status}`);
        const payload = (await response.json()) as ChampionPayload<ChampionDetail>;
        setDetail(payload.data[selectedId] ?? Object.values(payload.data)[0] ?? null);
      } catch (loadError) {
        if (!controller.signal.aborted) console.error("[League] Champion detail failed.", loadError);
      } finally {
        if (!controller.signal.aborted) setDetailLoading(false);
      }
    }

    void loadDetail();
    return () => controller.abort();
  }, [locale, selectedId, version]);

  const roles = useMemo(
    () => Array.from(new Set(champions.flatMap((champion) => champion.tags))).sort(),
    [champions],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale === "pt-BR" ? "pt-BR" : locale);
    return champions.filter((champion) => {
      const roleMatch = role === "all" || champion.tags.includes(role);
      const textMatch =
        !normalized ||
        champion.name.toLocaleLowerCase().includes(normalized) ||
        champion.title.toLocaleLowerCase().includes(normalized);
      return roleMatch && textMatch;
    });
  }, [champions, locale, query, role]);

  return (
    <section className="space-y-6">
      <div className="surface-panel overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <DataSourceIndicator source="verified" />
              <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                Riot Data Dragon · {version}
              </span>
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">
              {mode === "skins"
                ? copy("Skins por campeão", "Skins by champion", "Skins por campeón")
                : copy("Campeões de League of Legends", "League of Legends champions", "Campeones de League of Legends")}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {mode === "skins"
                ? copy(
                    "Escolha um campeão para abrir as skins principais. Cromas não são exibidos como skins separadas.",
                    "Choose a champion to browse their main skins. Chromas are not shown as separate skins.",
                    "Elige un campeón para ver sus skins principales. Los chromas no aparecen como skins separadas.",
                  )
                : copy(
                    "Clique em um campeão para abrir a ficha completa com função, lore, passiva, Q/W/E/R e galeria de skins.",
                    "Select a champion to open the full profile with role, lore, passive, Q/W/E/R and skin gallery.",
                    "Selecciona un campeón para abrir la ficha completa con rol, historia, pasiva, Q/W/E/R y galería de skins.",
                  )}
            </p>
          </div>
          <div className="text-xs font-semibold text-muted-foreground">
            {loading ? copy("Sincronizando…", "Syncing…", "Sincronizando…") : `${filtered.length} / ${champions.length}`}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-gold/50">
            <Search className="size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              placeholder={copy("Buscar campeão…", "Search champion…", "Buscar campeón…")}
            />
          </label>
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
            <FilterButton active={role === "all"} onClick={() => setRole("all")}>
              {copy("Todos", "All", "Todos")}
            </FilterButton>
            {roles.map((entry) => (
              <FilterButton key={entry} active={role === entry} onClick={() => setRole(entry)}>
                {entry}
              </FilterButton>
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
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
          {Array.from({ length: 30 }).map((_, index) => (
            <div key={index} className="aspect-[0.78] animate-pulse rounded-xl border border-border bg-muted/40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
          {filtered.map((champion) => (
            <button
              key={champion.id}
              type="button"
              onClick={() => setSelectedId(champion.id)}
              className="group overflow-hidden rounded-xl border border-border bg-surface text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gold/45 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={championIcon(version, champion)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0 p-2.5">
                <p className="truncate text-xs font-bold text-foreground sm:text-sm">{champion.name}</p>
                <p className="mt-0.5 truncate text-[0.65rem] text-muted-foreground">{champion.tags.join(" · ")}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <RiotNotice locale={locale} />

      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto p-0">
          {detailLoading || !detail ? (
            <div className="grid min-h-[28rem] place-items-center p-8">
              <div className="text-sm font-semibold text-muted-foreground">
                {copy("Carregando ficha oficial…", "Loading official profile…", "Cargando ficha oficial…")}
              </div>
            </div>
          ) : (
            <ChampionDetailView
              detail={detail}
              version={version}
              locale={locale}
              selectedSkin={selectedSkin}
              setSelectedSkin={setSelectedSkin}
              skinsFirst={mode === "skins"}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ChampionDetailView({
  detail,
  version,
  locale,
  selectedSkin,
  setSelectedSkin,
  skinsFirst,
}: {
  detail: ChampionDetail;
  version: string;
  locale: Locale;
  selectedSkin: number;
  setSelectedSkin: (index: number) => void;
  skinsFirst: boolean;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const skins = useMemo(() => baseSkinsOnly(detail.skins), [detail.skins]);
  const safeSkinIndex = selectedSkin < skins.length ? selectedSkin : 0;
  const skin = skins[safeSkinIndex] ?? skins[0];
  const abilities = [
    {
      key: "P",
      name: detail.passive.name,
      description: detail.passive.description,
      image: passiveIcon(version, detail.passive.image.full),
    },
    ...detail.spells.map((spell, index) => ({
      key: ["Q", "W", "E", "R"][index] ?? String(index + 1),
      name: spell.name,
      description: spell.description,
      image: spellIcon(version, spell.image.full),
    })),
  ];

  return (
    <div>
      <div className="relative min-h-[22rem] overflow-hidden border-b border-border bg-black">
        {skin ? (
          <img
            src={skinSplash(detail.id, skin.num)}
            alt={skin.name ? `${detail.name} — ${skin.name}` : detail.name}
            className="absolute inset-0 h-full w-full object-cover object-top opacity-75"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
        <div className="relative flex min-h-[22rem] items-end p-6 sm:p-8">
          <div className="max-w-3xl text-white">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/70">
              {detail.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
            <DialogHeader className="mt-2 text-left">
              <DialogTitle className="font-display text-4xl text-white sm:text-5xl">{detail.name}</DialogTitle>
              <DialogDescription className="text-sm font-semibold text-white/70">{detail.title}</DialogDescription>
            </DialogHeader>
            {skin ? (
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-white/65">
                {copy("Skin selecionada", "Selected skin", "Skin seleccionada")}: {skin.name === "default" ? detail.name : skin.name}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        {!skinsFirst ? (
          <>
            <section>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-gold-strong" />
                <h3 className="font-display text-xl font-semibold text-foreground">{copy("Sobre", "About", "Acerca de")}</h3>
              </div>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
                {stripMarkup(detail.lore || detail.blurb)}
              </p>
            </section>

            <AbilityGrid abilities={abilities} locale={locale} />
          </>
        ) : null}

        <section>
          <div className="flex items-center gap-2">
            <Swords className="size-4 text-gold-strong" />
            <h3 className="font-display text-xl font-semibold text-foreground">
              {copy("Coleção de skins", "Skin collection", "Colección de skins")}
            </h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {skins.length} {copy("skins principais", "main skins", "skins principales")}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skins.map((entry, index) => (
              <button
                key={`${entry.id}-${entry.num}`}
                type="button"
                onClick={() => setSelectedSkin(index)}
                className={cn(
                  "group overflow-hidden rounded-xl border bg-surface text-left transition-all hover:-translate-y-0.5",
                  index === safeSkinIndex
                    ? "border-gold/70 ring-1 ring-gold/30"
                    : "border-border hover:border-gold/35",
                )}
              >
                <div className="aspect-[16/9] overflow-hidden bg-muted">
                  <img
                    src={skinSplash(detail.id, entry.num)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {entry.name === "default" ? detail.name : entry.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {skinsFirst ? <AbilityGrid abilities={abilities} locale={locale} compact /> : null}
      </div>
    </div>
  );
}

function AbilityGrid({
  abilities,
  locale,
  compact = false,
}: {
  abilities: Array<{ key: string; name: string; description: string; image: string }>;
  locale: Locale;
  compact?: boolean;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  return (
    <section>
      <div className="flex items-center gap-2">
        <WandSparkles className="size-4 text-gold-strong" />
        <h3 className="font-display text-xl font-semibold text-foreground">
          {compact ? copy("Kit do campeão", "Champion kit", "Kit del campeón") : copy("Habilidades", "Abilities", "Habilidades")}
        </h3>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {abilities.map((ability) => (
          <article key={`${ability.key}-${ability.name}`} className="rounded-2xl border border-border bg-muted/15 p-4">
            <div className="flex gap-3">
              <img src={ability.image} alt="" loading="lazy" className="size-14 rounded-xl border border-border bg-black object-cover" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="grid size-6 shrink-0 place-items-center rounded-md border border-gold/30 bg-gold-soft/30 text-[0.68rem] font-black text-gold-strong">
                    {ability.key}
                  </span>
                  <h4 className="font-semibold text-foreground">{ability.name}</h4>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{stripMarkup(ability.description)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
        active
          ? "border-gold/50 bg-gold-soft/45 text-gold-strong"
          : "border-border bg-surface text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function RiotNotice({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-muted/15 p-4 text-xs leading-5 text-muted-foreground">
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-strong" />
      <p>
        {copy(
          "Dados e artes desta seção vêm do Riot Data Dragon. O MGP é um projeto independente e não é endossado pela Riot Games.",
          "Data and artwork in this section come from Riot Data Dragon. MGP is an independent project and is not endorsed by Riot Games.",
          "Los datos y artes de esta sección provienen de Riot Data Dragon. MGP es un proyecto independiente y no está respaldado por Riot Games.",
        )}
      </p>
    </div>
  );
}
