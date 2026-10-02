import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Coins,
  Crosshair,
  ExternalLink,
  Gauge,
  ImageOff,
  Loader2,
  Orbit,
  Search,
  Sparkles,
  Swords,
  Timer,
  Zap,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

type WeaponPart = {
  uniqueName?: string;
  name?: string;
  imageName?: string;
  itemCount?: number;
  count?: number;
  buildPrice?: number;
};

type Weapon = {
  uniqueName?: string;
  name: string;
  description?: string;
  imageName?: string;
  type?: string;
  category?: string;
  productCategory?: string;
  masteryReq?: number;
  tradable?: boolean;
  buildPrice?: number;
  buildTime?: number;
  skipBuildTimePrice?: number;
  components?: WeaponPart[];
  totalDamage?: number;
  criticalChance?: number;
  criticalMultiplier?: number;
  procChance?: number;
  fireRate?: number;
  magazineSize?: number;
};

type ArsenalMode = "base" | "variants";

const API_BASE = "https://api.warframestat.us";
const IMAGE_BASE = "https://cdn.warframestat.us/img";
const OFFICIAL_DROPS = "https://www.warframe.com/droptables";

const VARIANT_PATTERN = /^(kuva|tenet|prisma|dex|ceti|secura|synoid|sancti|rakta|vaykor|telos|mara|mk1|carmine)\b|\b(prime|wraith|vandal)\b/i;
const VARIANT_PREFIX = /^(kuva|tenet|prisma|dex|ceti|secura|synoid|sancti|rakta|vaykor|telos|mara|mk1|carmine)\s+/i;
const VARIANT_SUFFIX = /\s+(prime|wraith|vandal)$/i;

function apiLanguage(locale: Locale) {
  return locale === "pt-BR" ? "pt" : locale;
}

function itemKey(item: Weapon) {
  return item.uniqueName || item.name;
}

function imageUrl(item?: Weapon | WeaponPart) {
  return item?.imageName ? `${IMAGE_BASE}/${encodeURIComponent(item.imageName)}` : undefined;
}

function isVariant(name: string) {
  return VARIANT_PATTERN.test(name);
}

function canonicalName(name: string) {
  return name.replace(VARIANT_PREFIX, "").replace(VARIANT_SUFFIX, "").trim().toLocaleLowerCase("en");
}

function normalize(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function formatNumber(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
}

function formatPercent(value?: number) {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  const normalized = value <= 1 ? value * 100 : value;
  return `${normalized < 1 ? normalized.toFixed(2) : normalized.toFixed(1)}%`;
}

function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) return "—";
  const hours = seconds / 3600;
  if (hours >= 24) return `${Number.isInteger(hours / 24) ? hours / 24 : (hours / 24).toFixed(1)} d`;
  if (hours >= 1) return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} h`;
  return `${Math.round(seconds / 60)} min`;
}

function localizedType(item: Weapon, locale: Locale) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const raw = normalize(item.type || item.category || item.productCategory);
  if (/melee|corpo|espada|sword/.test(raw)) return copy("Corpo a corpo", "Melee", "Cuerpo a cuerpo");
  if (/secondary|pistol|secund/.test(raw)) return copy("Secundária", "Secondary", "Secundaria");
  if (/shotgun|escop/.test(raw)) return copy("Escopeta", "Shotgun", "Escopeta");
  if (/sniper|precision|precisao/.test(raw)) return copy("Precisão", "Sniper", "Precisión");
  if (/bow|arco/.test(raw)) return copy("Arco", "Bow", "Arco");
  if (/primary|rifle|primar/.test(raw)) return copy("Primária", "Primary", "Primaria");
  return item.type || item.category || item.productCategory || copy("Arma", "Weapon", "Arma");
}

function classify(value: number | undefined, thresholds: [number, number]) {
  if (value === undefined) return 1;
  if (value < thresholds[0]) return 0;
  if (value >= thresholds[1]) return 2;
  return 1;
}

export function WarframeWeapons({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [entries, setEntries] = useState<Weapon[]>([]);
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [arsenalMode, setArsenalMode] = useState<ArsenalMode>("base");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ language: apiLanguage(locale), remove: "patchlogs" });
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/weapons?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`WARFRAME_WEAPONS_${response.status}`);
        return (await response.json()) as unknown;
      })
      .then((raw) => {
        if (!Array.isArray(raw)) throw new Error("WARFRAME_WEAPONS_INVALID");
        setEntries(
          raw
            .filter(
              (candidate): candidate is Weapon =>
                Boolean(candidate && typeof candidate === "object" && "name" in candidate),
            )
            .sort((a, b) => a.name.localeCompare(b.name, locale)),
        );
      })
      .catch((reason) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : "WARFRAME_WEAPONS_ERROR");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [locale]);

  const visibleEntries = useMemo(() => {
    let data = entries.filter((item) => (arsenalMode === "variants" ? isVariant(item.name) : !isVariant(item.name)));
    const term = normalize(query.trim());
    if (term) {
      data = data.filter((item) =>
        normalize([item.name, item.description, localizedType(item, locale)].filter(Boolean).join(" ")).includes(term),
      );
    }
    return data;
  }, [arsenalMode, entries, locale, query]);

  const selected = visibleEntries.find((item) => itemKey(item) === selectedKey) ?? visibleEntries[0];

  useEffect(() => {
    if (!selected) return;
    if (selectedKey !== itemKey(selected)) setSelectedKey(itemKey(selected));
  }, [selected, selectedKey]);

  const switchMode = () => {
    const next: ArsenalMode = arsenalMode === "base" ? "variants" : "base";
    const family = selected ? canonicalName(selected.name) : "";
    const counterpart = entries.find(
      (item) => canonicalName(item.name) === family && (next === "variants" ? isVariant(item.name) : !isVariant(item.name)),
    );
    setArsenalMode(next);
    setSelectedKey(counterpart ? itemKey(counterpart) : "");
  };

  return (
    <div className="wf-codex relative space-y-5">
      <section className="surface-panel overflow-hidden">
        <header className="wf-section-head grid gap-5 border-b border-border p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-[var(--impar-spectral)]">
              <Swords className="size-4" />
              <span className="section-kicker">ÍMPAR / ARSENAL</span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
              {copy("Armas que dá para entender de relance", "Weapons you can read at a glance", "Armas fáciles de entender")}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
              {copy(
                "O Arsenal abre limpo, mostrando as versões normais. Use o controle flutuante para trocar para Prime, Kuva, Tenet, Prisma, Wraith, Vandal e outras variantes sem misturar tudo na mesma lista.",
                "The Arsenal opens cleanly with base weapons. Use the floating control to switch to Prime, Kuva, Tenet, Prisma, Wraith, Vandal and other variants without mixing everything together.",
                "El Arsenal abre limpio con las armas normales. Usa el control flotante para cambiar a Prime, Kuva, Tenet, Prisma, Wraith, Vandal y otras variantes sin mezclar todo.",
              )}
            </p>
          </div>
          <label className="wf-search flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background/70 px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-auto border-0 bg-transparent p-0 shadow-none" placeholder={copy("Buscar arma", "Search weapon", "Buscar arma")} />
          </label>
        </header>

        {error ? (
          <div className="p-6"><p className="text-sm text-muted-foreground">{copy("O Arsenal não respondeu agora. Tente novamente em instantes.", "The Arsenal did not respond. Try again shortly.", "El Arsenal no respondió. Inténtalo de nuevo en unos instantes.")}</p></div>
        ) : loading ? (
          <div className="grid min-h-72 place-items-center p-8"><Loader2 className="size-6 animate-spin text-[var(--impar-spectral)]" /></div>
        ) : visibleEntries.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-sm text-muted-foreground">{copy("Nenhuma arma encontrada neste modo.", "No weapon found in this mode.", "No se encontró ningún arma en este modo.")}</div>
        ) : (
          <div className="grid min-w-0 lg:grid-cols-[17rem_minmax(0,1fr)]">
            <aside className="wf-roster border-b border-border p-3 lg:max-h-[860px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
              <div className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-3 lg:grid-cols-1">
                {visibleEntries.map((item) => {
                  const active = selected ? itemKey(selected) === itemKey(item) : false;
                  return (
                    <button key={itemKey(item)} type="button" onClick={() => setSelectedKey(itemKey(item))} className={cn("wf-roster-item", active && "wf-roster-item--active")}>
                      <WeaponThumb item={item} />
                      <span className="min-w-0 text-left"><span className="block truncate text-sm font-semibold text-foreground">{item.name}</span><span className="mt-0.5 block truncate text-[0.68rem] text-muted-foreground">{localizedType(item, locale)}</span></span>
                    </button>
                  );
                })}
              </div>
            </aside>
            {selected ? <WeaponDetail item={selected} locale={locale} /> : null}
          </div>
        )}
      </section>

      <div className="pointer-events-none sticky bottom-4 z-30 flex justify-end px-3 sm:px-5">
        <button type="button" onClick={switchMode} className="wf-variant-toggle pointer-events-auto">
          <Orbit className="wf-variant-toggle__icon size-4" />
          <span>{arsenalMode === "base" ? copy("Ver variantes", "View variants", "Ver variantes") : copy("Voltar às normais", "Back to base", "Volver a normales")}</span>
          <span className="wf-variant-toggle__dot" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function WeaponDetail({ item, locale }: { item: Weapon; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const source = imageUrl(item);
  const components = Array.isArray(item.components) ? item.components.filter((part) => part?.name) : [];
  const level = [copy("Baixo", "Low", "Bajo"), copy("Médio", "Medium", "Medio"), copy("Alto", "High", "Alto")];
  const critClass = classify(item.criticalChance, [0.15, 0.28]);
  const statusClass = classify(item.procChance, [0.15, 0.28]);
  const fireClass = classify(item.fireRate, [3, 8]);

  return (
    <article className="min-w-0 p-4 sm:p-6 lg:p-7">
      <div className="grid gap-6 xl:grid-cols-[14rem_minmax(0,1fr)] xl:gap-8">
        <div className="xl:sticky xl:top-24 xl:self-start">
          <div className="wf-portrait aspect-square overflow-hidden rounded-2xl border border-border p-4">
            {source ? <img src={source} alt={item.name} loading="lazy" className="h-full w-full object-contain" /> : <div className="grid h-full place-items-center"><ImageOff className="size-10 text-muted-foreground" /></div>}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.masteryReq !== undefined ? <Badge>{copy("Maestria", "Mastery", "Maestría")} {item.masteryReq}</Badge> : null}
            <Badge>{localizedType(item, locale)}</Badge>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[0.67rem] font-bold uppercase tracking-[0.1em] text-[var(--impar-spectral)]">{localizedType(item, locale)}</p>
          <h3 className="mt-2 text-balance font-display text-3xl font-bold text-foreground sm:text-4xl">{item.name}</h3>
          {item.description ? <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">{item.description}</p> : null}

          <section className="wf-learn-strip mt-6">
            <div className="wf-learn-strip__intro"><Gauge className="size-4" /><div><p className="text-xs font-bold text-foreground">{copy("Como ler esta arma", "How to read this weapon", "Cómo leer esta arma")}</p><p className="mt-0.5 text-[0.7rem] text-muted-foreground">{copy("Três sinais rápidos antes da build.", "Three quick signals before the build.", "Tres señales rápidas antes de la build.")}</p></div></div>
            <QuickRead icon={Crosshair} label={copy("Chance crítica", "Critical chance", "Prob. crítica")} value={level[critClass]} />
            <QuickRead icon={Sparkles} label={copy("Status", "Status", "Estado")} value={level[statusClass]} />
            <QuickRead icon={Timer} label={copy("Cadência", "Fire rate", "Cadencia")} value={level[fireClass]} />
          </section>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            <Stat label={copy("Dano", "Damage", "Daño")} value={formatNumber(item.totalDamage)} />
            <Stat label={copy("Crítico", "Critical", "Crítico")} value={formatPercent(item.criticalChance)} />
            <Stat label={copy("Multiplicador", "Multiplier", "Multiplicador")} value={item.criticalMultiplier !== undefined ? `${item.criticalMultiplier.toFixed(1)}×` : "—"} />
            <Stat label={copy("Status", "Status", "Estado")} value={formatPercent(item.procChance)} />
            <Stat label={copy("Cadência", "Fire rate", "Cadencia")} value={formatNumber(item.fireRate)} />
            <Stat label={copy("Carregador", "Magazine", "Cargador")} value={formatNumber(item.magazineSize)} />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="wf-learning-note">
          <div className="flex items-center gap-2 text-[var(--impar-spectral)]"><Zap className="size-4" /><span className="text-xs font-bold">{copy("Leitura prática", "Practical read", "Lectura práctica")}</span></div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {copy(
              "Crítico alto favorece Mods de chance e dano crítico. Status alto favorece aplicar efeitos com frequência. Uma arma pode ser híbrida quando os dois números são bons — a build final ainda depende do tipo de disparo e do conteúdo.",
              "High critical chance favors critical chance and critical damage Mods. High Status favors frequent effects. A weapon can be hybrid when both are strong — the final build still depends on firing behavior and content.",
              "Un crítico alto favorece Mods de probabilidad y daño crítico. Un Estado alto favorece aplicar efectos con frecuencia. Un arma puede ser híbrida cuando ambos son buenos; la build final depende del disparo y del contenido.",
            )}
          </p>
        </section>

        <section className="wf-acquisition">
          <div className="flex items-center gap-2"><Boxes className="size-4 text-[var(--impar-spectral)]" /><h4 className="font-display text-base font-semibold text-foreground">{copy("Fundição", "Foundry", "Fundición")}</h4></div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {item.buildTime !== undefined ? <MiniFact icon={Timer} label={copy("Tempo", "Time", "Tiempo")} value={formatDuration(item.buildTime)} /> : null}
            {item.buildPrice !== undefined ? <MiniFact icon={Coins} label={copy("Créditos", "Credits", "Créditos")} value={formatNumber(item.buildPrice)} /> : null}
            {item.skipBuildTimePrice !== undefined ? <MiniFact icon={Zap} label={copy("Rush", "Rush", "Rush")} value={`${formatNumber(item.skipBuildTimePrice)} PL`} /> : null}
          </div>
          {components.length ? <div className="mt-4 space-y-2">{components.slice(0, 6).map((part, index) => <div key={`${part.name}-${index}`} className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 text-xs last:border-0"><span className="truncate text-foreground">{part.name}</span><span className="shrink-0 text-muted-foreground">×{part.itemCount ?? part.count ?? 1}</span></div>)}</div> : null}
          <a href={OFFICIAL_DROPS} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--impar-spectral)] hover:underline">{copy("Confirmar fontes oficiais", "Check official sources", "Ver fuentes oficiales")}<ExternalLink className="size-3.5" /></a>
        </section>
      </div>
    </article>
  );
}

function WeaponThumb({ item }: { item: Weapon }) {
  const source = imageUrl(item);
  return <span className="wf-thumb">{source ? <img src={source} alt="" loading="lazy" className="h-full w-full object-contain p-1" /> : <ImageOff className="size-4 text-muted-foreground" />}</span>;
}

function QuickRead({ icon: Icon, label, value }: { icon: typeof Crosshair; label: string; value: string }) {
  return <div className="wf-quick-read"><Icon className="size-3.5" /><div><p className="text-[0.62rem] uppercase tracking-[0.08em] text-muted-foreground">{label}</p><p className="mt-0.5 text-xs font-semibold text-foreground">{value}</p></div></div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="wf-stat"><p className="text-[0.62rem] font-bold uppercase tracking-[0.07em] text-muted-foreground">{label}</p><p className="mt-1.5 text-sm font-semibold text-foreground">{value}</p></div>;
}

function MiniFact({ icon: Icon, label, value }: { icon: typeof Timer; label: string; value: string }) {
  return <div className="rounded-lg border border-border/70 bg-background/40 p-2.5"><div className="flex items-center gap-1.5 text-muted-foreground"><Icon className="size-3.5" /><span className="text-[0.6rem] font-bold uppercase tracking-[0.06em]">{label}</span></div><p className="mt-1 text-xs font-semibold text-foreground">{value}</p></div>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="wf-badge">{children}</span>;
}
