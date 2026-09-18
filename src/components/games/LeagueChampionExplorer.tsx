import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Clock3, Droplets, Gauge, Search, ShieldCheck, Sparkles, Swords, WandSparkles } from "lucide-react";
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
const ABILITY_MEDIA = "https://d28xe8vt774jo5.cloudfront.net/champion-abilities";
const FALLBACK_VERSION = "16.17.1";

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
  cooldownBurn?: string;
  costBurn?: string;
  rangeBurn?: string;
  effectBurn?: Array<string | null>;
};

type ChampionDetail = ChampionSummary & {
  lore: string;
  blurb: string;
  skins: ChampionSkin[];
  passive: { name: string; description: string; image: { full: string } };
  spells: ChampionSpell[];
};

type ChampionPayload<T> = { data: Record<string, T> };

type AbilityView = {
  key: string;
  name: string;
  description: string;
  tooltip?: string;
  image: string;
  cooldown?: string;
  cost?: string;
  range?: string;
  values?: string[];
};

function stripMarkup(value: string | undefined) {
  return (value ?? "")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\{\{[^}]+\}\}/g, "—")
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
  return skins.filter((skin) => skin.parentSkin === undefined || skin.parentSkin === null);
}

function roleLabel(role: string, locale: Locale) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const labels: Record<string, string> = {
    Fighter: copy("Lutador", "Fighter", "Luchador"),
    Tank: copy("Tanque", "Tank", "Tanque"),
    Mage: copy("Mago", "Mage", "Mago"),
    Assassin: copy("Assassino", "Assassin", "Asesino"),
    Marksman: copy("Atirador", "Marksman", "Tirador"),
    Support: copy("Suporte", "Support", "Soporte"),
  };
  return labels[role] ?? role;
}

function abilityVideoBase(championKey: string, abilityKey: string) {
  const padded = championKey.padStart(4, "0");
  return `${ABILITY_MEDIA}/${padded}/ability_${padded}_${abilityKey}1`;
}

function cleanEffectValues(effectBurn: Array<string | null> | undefined) {
  if (!effectBurn) return [];
  return Array.from(
    new Set(
      effectBurn
        .filter((value): value is string => Boolean(value && value !== "0"))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ).slice(0, 4);
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

    const championId = selectedId;
    const controller = new AbortController();

    async function loadDetail() {
      setDetailLoading(true);
      try {
        const response = await fetch(
          `${DDRAGON}/cdn/${version}/data/${DATA_DRAGON_LOCALE[locale]}/champion/${championId}.json`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`Data Dragon returned ${response.status}`);
        const payload = (await response.json()) as ChampionPayload<ChampionDetail>;
        setDetail(payload.data[championId] ?? Object.values(payload.data)[0] ?? null);
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
                ? copy("Galeria de skins", "Skin gallery", "Galería de skins")
                : copy("Campeões", "Champions", "Campeones")}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {mode === "skins"
                ? copy(
                    "Escolha um campeão e abra qualquer splash art em tela grande. Cromas continuam agrupados na skin principal.",
                    "Choose a champion and open any splash art in a large viewer. Chromas remain grouped under their main skin.",
                    "Elige un campeón y abre cualquier splash art en grande. Los chromas siguen agrupados bajo su skin principal.",
                  )
                : copy(
                    "Filtre por classe ou pesquise pelo nome. A ficha do campeão mostra splash, lore e o kit completo; os vídeos das habilidades carregam somente no hover.",
                    "Filter by class or search by name. Champion profiles show splash, lore and the full kit; ability videos load only on hover.",
                    "Filtra por clase o busca por nombre. La ficha muestra splash, historia y el kit completo; los videos cargan solo al pasar el cursor.",
                  )}
            </p>
          </div>
          <div className="text-xs font-semibold text-muted-foreground">
            {loading ? copy("Sincronizando…", "Syncing…", "Sincronizando…") : `${filtered.length} / ${champions.length}`}
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-gold/50">
            <Search className="size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              placeholder={copy("Buscar campeão pelo nome…", "Search champion by name…", "Buscar campeón por nombre…")}
            />
          </label>
          <div className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterButton active={role === "all"} onClick={() => setRole("all")}>
              {copy("Todos", "All", "Todos")}
            </FilterButton>
            {roles.map((entry) => (
              <FilterButton key={entry} active={role === entry} onClick={() => setRole(entry)}>
                {roleLabel(entry, locale)}
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
              className="group overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/45 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={championIcon(version, champion)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="min-w-0 p-2.5">
                <p className="truncate text-xs font-bold text-foreground sm:text-sm">{champion.name}</p>
                <p className="mt-0.5 truncate text-[0.65rem] text-muted-foreground">
                  {champion.tags.map((tag) => roleLabel(tag, locale)).join(" · ")}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <RiotNotice locale={locale} />

      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-h-[94vh] max-w-6xl overflow-y-auto p-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          {detailLoading || !detail ? (
            <div className="grid min-h-[28rem] place-items-center p-8">
              <div className="text-sm font-semibold text-muted-foreground">
                {copy("Carregando ficha oficial…", "Loading official profile…", "Cargando ficha oficial…")}
              </div>
            </div>
          ) : mode === "skins" ? (
            <SkinCollectionView detail={detail} locale={locale} />
          ) : (
            <ChampionDetailView detail={detail} version={version} locale={locale} />
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
}: {
  detail: ChampionDetail;
  version: string;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  const abilities: AbilityView[] = [
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
      tooltip: spell.tooltip,
      image: spellIcon(version, spell.image.full),
      cooldown: spell.cooldownBurn,
      cost: spell.costBurn,
      range: spell.rangeBurn,
      values: cleanEffectValues(spell.effectBurn),
    })),
  ];

  const splash = skinSplash(detail.id, 0);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] overflow-hidden" aria-hidden="true">
        <img
          src={splash}
          alt=""
          className="h-full w-full scale-110 object-cover opacity-20 blur-3xl saturate-125 motion-safe:animate-pulse"
        />
      </div>

      <section className="relative h-[58vh] min-h-[30rem] max-h-[44rem] overflow-hidden border-b border-border bg-black">
        <img
          src={splash}
          alt={detail.name}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/5" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/95 via-black/65 to-transparent" />

        <div className="relative flex h-full items-end p-6 sm:p-8">
          <div className="max-w-3xl text-white">
            <div className="flex flex-wrap items-center gap-2">
              {detail.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-white/85 backdrop-blur"
                >
                  {roleLabel(tag, locale)}
                </span>
              ))}
            </div>
            <DialogHeader className="mt-3 text-left">
              <DialogTitle className="font-display text-4xl text-white sm:text-6xl">{detail.name}</DialogTitle>
              <DialogDescription className="text-sm font-semibold text-white/75 sm:text-base">
                {detail.title}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>
      </section>

      <div className="relative border-b border-border bg-background/96 px-4 py-4 sm:px-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <WandSparkles className="size-4 text-gold-strong" />
            <h3 className="font-display text-lg font-semibold text-foreground">
              {copy("Habilidades", "Abilities", "Habilidades")}
            </h3>
          </div>
          <span className="hidden text-[0.65rem] font-semibold text-muted-foreground sm:block">
            {copy(
              "Passe o mouse para ampliar a prévia",
              "Hover to enlarge the preview",
              "Pasa el cursor para ampliar la vista previa",
            )}
          </span>
        </div>

        <AbilityRail
          abilities={abilities}
          championKey={detail.key}
          partype={detail.partype}
          locale={locale}
        />
      </div>

      <div className="relative p-6 sm:p-8">
        <section>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-gold-strong" />
            <h3 className="font-display text-xl font-semibold text-foreground">
              {copy("Sobre", "About", "Acerca de")}
            </h3>
          </div>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            {stripMarkup(detail.lore || detail.blurb)}
          </p>
        </section>
      </div>
    </div>
  );
}

type AbilityPreviewState = {
  ability: AbilityView;
  left: number;
  top: number;
  width: number;
  maxHeight: number;
  placement: "above" | "below";
};

function AbilityRail({
  abilities,
  championKey,
  partype,
  locale,
}: {
  abilities: AbilityView[];
  championKey: string;
  partype: string;
  locale: Locale;
}) {
  const [preview, setPreview] = useState<AbilityPreviewState | null>(null);

  const openPreview = (ability: AbilityView, element: HTMLElement) => {
    if (typeof window === "undefined") return;
    const rect = element.getBoundingClientRect();
    const viewportPadding = 16;
    const gap = 12;
    const width = Math.min(560, Math.max(300, window.innerWidth - viewportPadding * 2));
    const left = Math.min(
      Math.max(viewportPadding, rect.left + rect.width / 2 - width / 2),
      Math.max(viewportPadding, window.innerWidth - width - viewportPadding),
    );

    const desiredHeight = Math.min(560, window.innerHeight - viewportPadding * 2);
    const roomAbove = rect.top - viewportPadding - gap;
    const roomBelow = window.innerHeight - rect.bottom - viewportPadding - gap;
    const placement: "above" | "below" =
      roomAbove >= Math.min(420, desiredHeight) || roomAbove >= roomBelow ? "above" : "below";
    const availableHeight = Math.max(
      300,
      Math.min(desiredHeight, placement === "above" ? roomAbove : roomBelow),
    );
    const top =
      placement === "above"
        ? Math.max(viewportPadding, rect.top - gap - availableHeight)
        : Math.min(
            rect.bottom + gap,
            Math.max(viewportPadding, window.innerHeight - availableHeight - viewportPadding),
          );

    setPreview({ ability, left, top, width, maxHeight: availableHeight, placement });
  };

  return (
    <>
      <div className="mgp-media-rail flex gap-3 overflow-x-auto overscroll-x-contain pb-2 pt-1">
        {abilities.map((ability) => {
          const description = stripMarkup(ability.description);
          return (
            <button
              key={`${ability.key}-${ability.name}`}
              type="button"
              onMouseEnter={(event) => openPreview(ability, event.currentTarget)}
              onMouseLeave={() => setPreview(null)}
              onFocus={(event) => openPreview(ability, event.currentTarget)}
              onBlur={() => setPreview(null)}
              onClick={(event) => {
                if (preview?.ability.key === ability.key) setPreview(null);
                else openPreview(ability, event.currentTarget);
              }}
              className="group min-h-32 w-[13rem] shrink-0 rounded-2xl border border-border bg-muted/10 p-3 text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-muted/20 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
            >
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <img
                    src={ability.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-14 rounded-xl border border-border bg-black object-cover shadow-sm"
                  />
                  <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-lg border border-gold/35 bg-background text-[0.65rem] font-black text-gold-strong">
                    {ability.key}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-semibold text-foreground">{ability.name}</p>
                  <p className="mt-1 line-clamp-3 text-[0.68rem] leading-4 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {preview && typeof document !== "undefined"
        ? createPortal(
            <AbilityPreviewPopover
              key={`${preview.ability.key}-${preview.ability.name}`}
              preview={preview}
              championKey={championKey}
              partype={partype}
              locale={locale}
            />,
            document.body,
          )
        : null}
    </>
  );
}

function AbilityPreviewPopover({
  preview,
  championKey,
  partype,
  locale,
}: {
  preview: AbilityPreviewState;
  championKey: string;
  partype: string;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [videoExt, setVideoExt] = useState<"webm" | "mp4" | null>("webm");
  const ability = preview.ability;
  const base = abilityVideoBase(championKey, ability.key);
  const description = stripMarkup(ability.tooltip || ability.description);

  return (
    <aside
      className={cn(
        "pointer-events-none fixed z-[220] flex flex-col overflow-hidden rounded-[1.4rem] border border-gold/30 bg-background/95 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200",
        preview.placement === "above" ? "slide-in-from-bottom-2" : "slide-in-from-top-2",
      )}
      style={{
        left: preview.left,
        top: preview.top,
        width: preview.width,
        maxHeight: preview.maxHeight,
      }}
      aria-hidden="true"
    >
      <div className="relative aspect-video shrink-0 overflow-hidden bg-black">
        {videoExt ? (
          <video
            key={`${base}.${videoExt}`}
            src={`${base}.${videoExt}`}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoExt((current) => (current === "webm" ? "mp4" : null))}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_center,hsl(var(--gold)/0.1),transparent_70%),black]">
            <img src={ability.image} alt="" className="size-24 rounded-2xl border border-white/10 object-cover" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-14 text-white">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg border border-white/20 bg-black/45 text-[0.68rem] font-black">
              {ability.key}
            </span>
            <h4 className="font-display text-lg font-semibold">{ability.name}</h4>
          </div>
        </div>
      </div>

      <div className="mgp-media-rail min-h-0 overflow-y-auto overscroll-contain">
        <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <div className="min-w-0">
            <p className="text-xs leading-5 text-muted-foreground">{description}</p>
            {ability.values?.length ? (
              <div className="mt-3">
                <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
                  {copy("Valores por nível", "Values by rank", "Valores por nivel")}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ability.values.map((value, index) => (
                    <span
                      key={`${ability.key}-value-${index}`}
                      className="rounded-lg border border-border bg-muted/15 px-2 py-1 font-mono text-[0.68rem] font-semibold text-foreground"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {ability.key !== "P" ? (
            <div className="self-start divide-y divide-border overflow-hidden rounded-xl border border-border bg-muted/10">
              {ability.cooldown ? (
                <AbilityStatRow
                  icon={Clock3}
                  label={copy("Recarga", "Cooldown", "Enfriamiento")}
                  value={ability.cooldown}
                />
              ) : null}
              {ability.cost ? (
                <AbilityStatRow
                  icon={Droplets}
                  label={partype || copy("Recurso", "Resource", "Recurso")}
                  value={ability.cost}
                />
              ) : null}
              {ability.range && ability.range !== "0" ? (
                <AbilityStatRow
                  icon={Gauge}
                  label={copy("Alcance", "Range", "Alcance")}
                  value={ability.range}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function AbilityStatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5">
      <span className="flex items-center gap-2 text-[0.68rem] font-semibold text-muted-foreground">
        <Icon className="size-3.5 text-gold-strong" />
        {label}
      </span>
      <span className="font-mono text-[0.72rem] font-bold text-foreground">{value}</span>
    </div>
  );
}

function SkinCollectionView({ detail, locale }: { detail: ChampionDetail; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const skins = useMemo(() => baseSkinsOnly(detail.skins), [detail.skins]);
  const [previewSkin, setPreviewSkin] = useState<ChampionSkin | null>(null);
  const baseSplash = skinSplash(detail.id, 0);

  return (
    <div>
      <div className="relative min-h-64 overflow-hidden border-b border-border bg-black">
        <img src={baseSplash} alt="" className="absolute inset-0 h-full w-full object-cover object-top opacity-65" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
        <div className="relative flex min-h-64 items-end p-6 sm:p-8">
          <div className="text-white">
            <DialogHeader className="text-left">
              <DialogTitle className="font-display text-4xl text-white sm:text-5xl">{detail.name}</DialogTitle>
              <DialogDescription className="text-white/65">
                {skins.length} {copy("splashes principais", "main splashes", "splashes principales")}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Swords className="size-4 text-gold-strong" />
          <h3 className="font-display text-xl font-semibold text-foreground">
            {copy("Coleção de skins", "Skin collection", "Colección de skins")}
          </h3>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {skins.map((entry) => (
            <button
              key={`${entry.id}-${entry.num}`}
              type="button"
              onClick={() => setPreviewSkin(entry)}
              className="group overflow-hidden rounded-2xl border border-border bg-surface text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lift"
            >
              <div className="aspect-[16/9] overflow-hidden bg-muted">
                <img
                  src={skinSplash(detail.id, entry.num)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
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
      </div>

      <Dialog open={Boolean(previewSkin)} onOpenChange={(open) => !open && setPreviewSkin(null)}>
        <DialogContent className="h-[min(88vh,900px)] w-[calc(100vw-1rem)] max-w-[1500px] overflow-hidden border-white/10 bg-black/90 p-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          {previewSkin ? (
            <SkinSplashPreview
              championName={detail.name}
              championId={detail.id}
              skins={skins}
              skin={previewSkin}
              onSkin={setPreviewSkin}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SkinSplashPreview({
  championName,
  championId,
  skins,
  skin,
  onSkin,
}: {
  championName: string;
  championId: string;
  skins: ChampionSkin[];
  skin: ChampionSkin;
  onSkin: (skin: ChampionSkin) => void;
}) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const wheelAccumulatorRef = useRef(0);
  const lastWheelStepRef = useRef(0);
  const currentIndex = Math.max(0, skins.findIndex((entry) => entry.num === skin.num));
  const label = skin.name === "default" ? championName : skin.name;
  const image = skinSplash(championId, skin.num);

  const move = useCallback((direction: -1 | 1) => {
    if (skins.length <= 1) return;
    const nextIndex = (currentIndex + direction + skins.length) % skins.length;
    const nextSkin = skins[nextIndex];
    if (nextSkin) onSkin(nextSkin);
  }, [currentIndex, onSkin, skins]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || skins.length <= 1) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      wheelAccumulatorRef.current += event.deltaY || event.deltaX;
      const now = performance.now();
      if (Math.abs(wheelAccumulatorRef.current) < 28 || now - lastWheelStepRef.current < 120) return;

      const direction: -1 | 1 = wheelAccumulatorRef.current > 0 ? 1 : -1;
      wheelAccumulatorRef.current = 0;
      lastWheelStepRef.current = now;
      move(direction);
    };

    viewer.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewer.removeEventListener("wheel", handleWheel);
  }, [move, skins.length]);

  return (
    <div
      ref={viewerRef}
      onPointerLeave={() => {
        wheelAccumulatorRef.current = 0;
      }}
      className="relative flex h-full min-h-0 items-center justify-center overflow-hidden bg-black"
      style={{ overscrollBehavior: "contain" }}
    >
      <img
        key={`ambient-${skin.num}`}
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 animate-in object-cover opacity-45 blur-3xl saturate-150 fade-in duration-500 motion-safe:animate-pulse"
      />
      <div className="absolute inset-0 bg-black/45" />
      <img
        key={`splash-${skin.num}`}
        src={image}
        alt={`${championName} — ${label}`}
        className="relative z-10 max-h-full max-w-full animate-in object-contain drop-shadow-2xl fade-in zoom-in-95 duration-350"
      />

      {skins.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => move(-1)}
            className="absolute left-3 top-1/2 z-30 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white/85 backdrop-blur transition-all hover:border-gold/50 hover:bg-black/65 hover:text-white"
            aria-label="Skin anterior"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            className="absolute right-3 top-1/2 z-30 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white/85 backdrop-blur transition-all hover:border-gold/50 hover:bg-black/65 hover:text-white"
            aria-label="Próxima skin"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-6 pt-20">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate font-display text-xl font-semibold text-white sm:text-2xl">{label}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-white/60">{championName}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-bold tabular-nums text-white/85">
              {currentIndex + 1} / {skins.length}
            </p>
            <p className="mt-1 hidden text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-white/55 sm:block">
              Scroll ↑ ↓
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-10 shrink-0 rounded-full border px-3 text-xs font-semibold transition-all",
        active
          ? "border-gold/50 bg-gold-soft/45 text-gold-strong"
          : "border-border bg-surface text-muted-foreground hover:border-gold/25 hover:text-foreground",
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
          "Dados, ícones e splash arts vêm do Riot Data Dragon. As prévias de habilidade usam o CDN de mídia utilizado pelas páginas oficiais de campeões e só são requisitadas no hover. MGP é independente e não é endossado pela Riot Games.",
          "Data, icons and splash arts come from Riot Data Dragon. Ability previews use the media CDN used by official champion pages and are requested only on hover. MGP is independent and is not endorsed by Riot Games.",
          "Datos, iconos y splash arts provienen de Riot Data Dragon. Las vistas previas usan el CDN de medios utilizado por las páginas oficiales de campeones y solo se solicitan al pasar el cursor. MGP es independiente y no está respaldado por Riot Games.",
        )}
      </p>
    </div>
  );
}
