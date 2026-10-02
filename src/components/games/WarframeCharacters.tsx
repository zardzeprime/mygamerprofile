import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ExternalLink,
  HeartPulse,
  ImageOff,
  Loader2,
  PlayCircle,
  Search,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { WARFRAME_STARTER_ROSTER } from "@/data/warframeRoster";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

type ApiAbility =
  | string
  | {
      name?: string;
      description?: string;
    };

type WarframePart = {
  name?: string;
  imageName?: string;
  itemCount?: number;
  count?: number;
};

type WarframeApiItem = {
  uniqueName?: string;
  name: string;
  description?: string;
  imageName?: string;
  type?: string;
  masteryReq?: number;
  health?: number;
  shield?: number;
  armor?: number;
  power?: number;
  sprintSpeed?: number;
  abilities?: ApiAbility[];
  passive?: string;
  components?: WarframePart[];
};

type CuratedMedia = {
  youtubeId: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
};

const API_BASE = "https://api.warframestat.us";
const IMAGE_BASE = "https://cdn.warframestat.us/img";
const OFFICIAL_WARFRAMES = "https://www.warframe.com/pt-br/game/warframes";
const OFFICIAL_DROPS = "https://www.warframe.com/droptables";

const CURATED_MEDIA: Record<string, CuratedMedia> = {
  garuda: {
    youtubeId: "hQfZQgZ8Qm4",
    title: {
      "pt-BR": "Mídia oficial com Vena / Garuda",
      en: "Official media featuring Vena / Garuda",
      es: "Contenido oficial con Vena / Garuda",
    },
    description: {
      "pt-BR":
        "Trailer oficial de Jade Shadows: Constellations, com Vena — a Protoframe ligada à Garuda. Não é apresentado como trailer exclusivo da Garuda.",
      en: "Official Jade Shadows: Constellations trailer featuring Vena, the Protoframe tied to Garuda. It is not presented as a Garuda-exclusive trailer.",
      es: "Tráiler oficial de Jade Shadows: Constellations con Vena, la Protoframe vinculada a Garuda. No se presenta como un tráiler exclusivo de Garuda.",
    },
  },
  grendel: {
    youtubeId: "3L56G_0BJuo",
    title: {
      "pt-BR": "Grendel Prime · trailer oficial",
      en: "Grendel Prime · official trailer",
      es: "Grendel Prime · tráiler oficial",
    },
    description: {
      "pt-BR": "Double Feature oficial da Digital Extremes com Grendel Prime e Gauss Prime.",
      en: "Official Digital Extremes Double Feature starring Grendel Prime and Gauss Prime.",
      es: "Double Feature oficial de Digital Extremes con Grendel Prime y Gauss Prime.",
    },
  },
  nekros: {
    youtubeId: "InN07z-8LwE",
    title: {
      "pt-BR": "Nekros Prime · mídia oficial",
      en: "Nekros Prime · official media",
      es: "Nekros Prime · contenido oficial",
    },
    description: {
      "pt-BR": "Vídeo oficial do Nekros Prime publicado pelo canal PlayWarframe.",
      en: "Official Nekros Prime video published by PlayWarframe.",
      es: "Vídeo oficial de Nekros Prime publicado por PlayWarframe.",
    },
  },
};

function apiLanguage(locale: Locale) {
  return locale === "pt-BR" ? "pt" : locale;
}

function itemKey(item: WarframeApiItem) {
  return item.uniqueName || item.name;
}

function imageUrl(item?: WarframeApiItem) {
  return item?.imageName ? `${IMAGE_BASE}/${encodeURIComponent(item.imageName)}` : undefined;
}

function baseName(name: string) {
  return name.replace(/\s+Prime$/i, "").trim();
}

function curatedEntry(item?: WarframeApiItem) {
  if (!item) return undefined;
  const target = baseName(item.name).toLocaleLowerCase("en");
  return WARFRAME_STARTER_ROSTER.find(
    (entry) => entry.name.toLocaleLowerCase("en") === target,
  );
}

function normalizedAbilities(item: WarframeApiItem) {
  if (!Array.isArray(item.abilities)) return [];
  return item.abilities
    .map((ability, index) => {
      if (typeof ability === "string") {
        return { slot: index + 1, name: ability, description: "" };
      }
      return {
        slot: index + 1,
        name: ability?.name?.trim() || `Ability ${index + 1}`,
        description: ability?.description?.trim() || "",
      };
    })
    .filter((ability) => ability.name)
    .slice(0, 4);
}

function formatNumber(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
}

export function WarframeCharacters({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [entries, setEntries] = useState<WarframeApiItem[]>([]);
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [primeFilter, setPrimeFilter] = useState<"all" | "base" | "prime">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      language: apiLanguage(locale),
      remove: "patchlogs",
    });

    setLoading(true);
    setError("");
    fetch(`${API_BASE}/warframes?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`WARFRAME_DATA_${response.status}`);
        return (await response.json()) as unknown;
      })
      .then((raw) => {
        if (!Array.isArray(raw)) throw new Error("WARFRAME_DATA_INVALID");
        const data = raw.filter(
          (candidate): candidate is WarframeApiItem =>
            Boolean(candidate && typeof candidate === "object" && "name" in candidate),
        );
        setEntries(data);
        setSelectedKey((current) =>
          current && data.some((entry) => itemKey(entry) === current)
            ? current
            : data[0]
              ? itemKey(data[0])
              : "",
        );
      })
      .catch((reason) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "WARFRAME_DATA_ERROR");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [locale]);

  const filtered = useMemo(() => {
    let data = entries;
    if (primeFilter !== "all") {
      data = data.filter((item) =>
        primeFilter === "prime" ? /\bprime\b/i.test(item.name) : !/\bprime\b/i.test(item.name),
      );
    }
    const term = query.trim().toLowerCase();
    if (!term) return data;
    return data.filter((item) => {
      const curated = curatedEntry(item);
      return [item.name, item.description, item.type, curated?.role[locale], curated?.summary[locale]]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [entries, locale, primeFilter, query]);

  const selected =
    entries.find((item) => itemKey(item) === selectedKey) ?? filtered[0] ?? entries[0];

  return (
    <div className="space-y-5">
      <section className="surface-panel overflow-hidden">
        <header className="grid gap-5 border-b border-border p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-gold-strong" />
              <span className="section-kicker">ÍMPAR / WARFRAMES</span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
              {copy("Warframes e habilidades", "Warframes and abilities", "Warframes y habilidades")}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {copy(
                "Personagens, atributos e habilidades ficam aqui. Armas e itens agora vivem em módulos próprios para o hub não repetir o mesmo conteúdo.",
                "Characters, stats and abilities live here. Weapons and items now have dedicated modules so the hub no longer repeats the same content.",
                "Personajes, estadísticas y habilidades viven aquí. Armas y objetos ahora tienen módulos propios para evitar contenido duplicado.",
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <span className="rounded-full border border-border bg-muted/20 px-2.5 py-1">
                {copy("Roster atual via WFCD", "Current roster via WFCD", "Roster actual vía WFCD")}
              </span>
              <span className="rounded-full border border-border bg-muted/20 px-2.5 py-1">
                {copy("Conteúdo curado quando disponível", "Curated detail when available", "Detalle curado cuando existe")}
              </span>
            </div>
          </div>

          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background/75 px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-auto border-0 p-0 shadow-none"
              placeholder={copy("Buscar Warframe", "Search Warframe", "Buscar Warframe")}
            />
          </label>
        </header>

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
              {filter === "all" ? copy("Todos", "All", "Todos") : filter === "prime" ? "Prime" : "Base"}
            </button>
          ))}
        </div>

        {error ? (
          <div className="p-6 sm:p-8">
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
              <h3 className="font-display text-lg font-semibold text-foreground">
                {copy("O roster não respondeu", "The roster did not respond", "El roster no respondió")}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {copy(
                  "A lista é carregada da API pública do ecossistema Warframe. Tente novamente em alguns instantes.",
                  "The roster is loaded from the public Warframe ecosystem API. Try again in a moment.",
                  "La lista se carga desde la API pública del ecosistema Warframe. Inténtalo de nuevo en un momento.",
                )}
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="grid min-h-72 place-items-center p-8 text-center">
            <div>
              <Loader2 className="mx-auto size-7 animate-spin text-gold-strong" />
              <p className="mt-3 text-sm font-semibold text-foreground">
                {copy("Sincronizando Warframes...", "Syncing Warframes...", "Sincronizando Warframes...")}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid min-w-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="border-b border-border p-3 lg:max-h-[820px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
              <div className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-3 lg:grid-cols-1">
                {filtered.map((item) => {
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
                      <WarframeThumb item={item} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">{item.name}</span>
                        <span className="mt-0.5 block truncate text-[0.68rem] text-muted-foreground">
                          {curatedEntry(item)?.role[locale] || item.type || "Warframe"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {selected ? <WarframeDetail item={selected} locale={locale} /> : null}
          </div>
        )}
      </section>
    </div>
  );
}

function WarframeDetail({ item, locale }: { item: WarframeApiItem; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const curated = curatedEntry(item);
  const apiSkills = normalizedAbilities(item);
  const curatedSkills = curated?.abilities ?? [];
  const media = curated ? CURATED_MEDIA[curated.slug] : undefined;
  const source = imageUrl(item);
  const parts = Array.isArray(item.components) ? item.components.filter((part) => part?.name) : [];

  const abilities = curatedSkills.length
    ? curatedSkills.map((ability) => ({
        slot: ability.slot,
        name: ability.name[locale],
        description: ability.description[locale],
      }))
    : apiSkills;

  return (
    <article className="min-w-0 p-4 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[15rem_minmax(0,1fr)]">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-muted/15 p-4">
            {source ? (
              <img src={source} alt={item.name} loading="lazy" className="h-full w-full object-contain" />
            ) : (
              <div className="grid h-full place-items-center">
                <ImageOff className="size-10 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.masteryReq !== undefined ? <Badge>MR {item.masteryReq}</Badge> : null}
            {curated ? <Badge>{curated.role[locale]}</Badge> : null}
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-gold-strong">
            {curated ? curated.role[locale] : item.type || "Warframe"}
          </p>
          <h3 className="mt-2 text-balance font-display text-3xl font-bold text-foreground sm:text-4xl">
            {item.name}
          </h3>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground">
            {curated?.summary[locale] ||
              item.description ||
              copy(
                "Dados atuais carregados do ecossistema WFCD.",
                "Current data loaded from the WFCD ecosystem.",
                "Datos actuales cargados desde el ecosistema WFCD.",
              )}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
            <Stat icon={HeartPulse} label={copy("Vida", "Health", "Vida")} value={item.health} />
            <Stat icon={Shield} label={copy("Escudo", "Shield", "Escudo")} value={item.shield} />
            <Stat icon={Activity} label={copy("Armadura", "Armor", "Armadura")} value={item.armor} />
            <Stat icon={Zap} label={copy("Energia", "Energy", "Energía")} value={item.power} />
            <Stat icon={Sparkles} label={copy("Sprint", "Sprint", "Sprint")} value={item.sprintSpeed} />
          </div>

          {item.passive ? (
            <div className="mt-5 rounded-2xl border border-[color:var(--impar-line)] bg-[var(--impar-spectral-soft)] p-4">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--impar-spectral)]">
                {copy("Passiva", "Passive", "Pasiva")}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.passive}</p>
            </div>
          ) : null}
        </div>
      </div>

      <section className="mt-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-kicker">KIT</p>
            <h4 className="mt-1 font-display text-xl font-semibold text-foreground">
              {copy("Habilidades", "Abilities", "Habilidades")}
            </h4>
          </div>
          {curated ? (
            <a
              href={curated.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-strong hover:underline"
            >
              {copy("Ver Warframe oficial", "View official Warframe", "Ver Warframe oficial")}
              <ExternalLink className="size-3.5" />
            </a>
          ) : null}
        </div>

        {abilities.length ? (
          <div className="mt-4 grid grid-cols-2 gap-2.5 xl:grid-cols-4">
            {abilities.map((ability) => (
              <article
                key={`${ability.slot}-${ability.name}`}
                className="min-w-0 rounded-2xl border border-border bg-muted/10 p-3.5 sm:p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="grid size-7 place-items-center rounded-lg bg-[var(--impar-spectral-soft)] font-mono text-xs font-bold text-[var(--impar-spectral)]">
                    {ability.slot}
                  </span>
                  <Sparkles className="size-3.5 text-muted-foreground" />
                </div>
                <h5 className="mt-3 truncate font-display text-sm font-semibold text-foreground sm:text-base">
                  {ability.name}
                </h5>
                {ability.description ? (
                  <p className="mt-2 line-clamp-5 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                    {ability.description}
                  </p>
                ) : (
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {copy(
                      "Descrição detalhada ainda não catalogada no ÍMPAR; o nome vem da base atual do jogo.",
                      "Detailed description is not curated in ÍMPAR yet; the name comes from the current game database.",
                      "La descripción detallada aún no está catalogada en ÍMPAR; el nombre viene de la base actual del juego.",
                    )}
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-border bg-muted/10 p-4 text-sm text-muted-foreground">
            {copy(
              "A API atual não retornou habilidades para esta variante. Use a página oficial do Warframe para confirmar o kit.",
              "The current API did not return abilities for this variant. Use the official Warframe page to confirm its kit.",
              "La API actual no devolvió habilidades para esta variante. Usa la página oficial para confirmar el kit.",
            )}
          </p>
        )}
      </section>

      <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <section className="overflow-hidden rounded-2xl border border-border bg-muted/10">
          {media ? (
            <>
              <div className="aspect-video bg-black">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${media.youtubeId}`}
                  title={media.title[locale]}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 text-gold-strong">
                  <PlayCircle className="size-4" />
                  <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em]">
                    {copy("Mídia oficial", "Official media", "Contenido oficial")}
                  </span>
                </div>
                <h4 className="mt-2 font-display text-lg font-semibold text-foreground">{media.title[locale]}</h4>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{media.description[locale]}</p>
              </div>
            </>
          ) : (
            <div className="grid min-h-56 place-items-center p-6 text-center">
              <div>
                <PlayCircle className="mx-auto size-7 text-muted-foreground" />
                <h4 className="mt-3 font-display text-lg font-semibold text-foreground">
                  {copy(
                    "Mídia oficial ainda não catalogada",
                    "Official media not curated yet",
                    "Contenido oficial aún no catalogado",
                  )}
                </h4>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  {copy(
                    "Preferimos omitir um vídeo a associar mídia genérica ou incorreta a este Warframe.",
                    "We prefer omitting a video over attaching generic or incorrect media to this Warframe.",
                    "Preferimos omitir un vídeo antes que asociar contenido genérico o incorrecto a este Warframe.",
                  )}
                </p>
              </div>
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-border bg-muted/10 p-4 sm:p-5">
          <h4 className="font-display text-lg font-semibold text-foreground">
            {copy("Aquisição e referências", "Acquisition and references", "Obtención y referencias")}
          </h4>
          {parts.length ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {parts.slice(0, 8).map((part, index) => (
                <div key={`${part.name}-${index}`} className="rounded-xl border border-border bg-background/55 p-3">
                  <p className="truncate text-xs font-semibold text-foreground">{part.name}</p>
                  <p className="mt-1 text-[0.68rem] text-muted-foreground">
                    ×{part.itemCount ?? part.count ?? 1}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {copy(
                "A resposta atual não trouxe componentes estruturados para esta variante.",
                "The current response did not include structured components for this variant.",
                "La respuesta actual no incluyó componentes estructurados para esta variante.",
              )}
            </p>
          )}
          <div className="mt-5 flex flex-col gap-2">
            <a
              href={curated?.officialUrl || OFFICIAL_WARFRAMES}
              target="_blank"
              rel="noreferrer"
              className="brand-button-secondary justify-between gap-2"
            >
              {copy("Página oficial", "Official page", "Página oficial")}
              <ExternalLink className="size-4" />
            </a>
            <a
              href={OFFICIAL_DROPS}
              target="_blank"
              rel="noreferrer"
              className="brand-button-secondary justify-between gap-2"
            >
              {copy("Drops oficiais", "Official drops", "Drops oficiales")}
              <ExternalLink className="size-4" />
            </a>
          </div>
        </aside>
      </div>
    </article>
  );
}

function WarframeThumb({ item }: { item: WarframeApiItem }) {
  const source = imageUrl(item);
  return (
    <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-muted/20">
      {source ? (
        <img src={source} alt="" loading="lazy" className="h-full w-full object-contain p-1" />
      ) : (
        <ImageOff className="size-4 text-muted-foreground" />
      )}
    </span>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value?: number }) {
  if (value === undefined) return null;
  return (
    <div className="rounded-xl border border-border bg-muted/15 p-3">
      <div className="flex items-center gap-1.5 text-gold-strong">
        <Icon className="size-3.5" />
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.08em]">{label}</span>
      </div>
      <p className="mt-1.5 text-sm font-semibold text-foreground">{formatNumber(value)}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[0.68rem] font-semibold text-muted-foreground">
      {children}
    </span>
  );
}
