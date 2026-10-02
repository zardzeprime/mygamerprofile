import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BookOpenCheck,
  Boxes,
  ExternalLink,
  Gauge,
  HeartPulse,
  ImageOff,
  Loader2,
  Orbit,
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

type ApiAbility = string | { name?: string; description?: string };

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

type VariantMode = "base" | "prime";

type AbilityView = {
  slot: number;
  name: string;
  description: string;
};

const API_BASE = "https://api.warframestat.us";
const IMAGE_BASE = "https://cdn.warframestat.us/img";
const OFFICIAL_WARFRAMES = "https://www.warframe.com/pt-br/game/warframes";
const OFFICIAL_DROPS = "https://www.warframe.com/droptables";

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

function isPrime(name: string) {
  return /\bPrime$/i.test(name);
}

function curatedEntry(item?: WarframeApiItem) {
  if (!item) return undefined;
  const target = baseName(item.name).toLocaleLowerCase("en");
  return WARFRAME_STARTER_ROSTER.find(
    (entry) => entry.name.toLocaleLowerCase("en") === target,
  );
}

function normalizedAbilities(item: WarframeApiItem): AbilityView[] {
  if (!Array.isArray(item.abilities)) return [];
  return item.abilities
    .map((ability, index) => {
      if (typeof ability === "string") {
        return { slot: index + 1, name: ability, description: "" };
      }
      return {
        slot: index + 1,
        name: ability?.name?.trim() || `Habilidade ${index + 1}`,
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

function normalizeForSearch(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function abilityTags(description: string, locale: Locale) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const text = normalizeForSearch(description);
  const tags: string[] = [];
  const add = (label: string) => {
    if (!tags.includes(label)) tags.push(label);
  };

  if (/dano|damage|daño|corte|slash|toxic|viral|heat|fogo|impact/.test(text))
    add(copy("Dano", "Damage", "Daño"));
  if (/cura|heal|vida|health|escudo|shield|armor|armadura|protec|defen/.test(text))
    add(copy("Sobrevivência", "Survival", "Supervivencia"));
  if (/controle|control|stun|slow|lent|derrub|knock|fear|terror|puxa|pull/.test(text))
    add(copy("Controle", "Control", "Control"));
  if (/movimento|movement|speed|veloc|teleport|dash|salto|jump/.test(text))
    add(copy("Mobilidade", "Mobility", "Movilidad"));
  if (/energia|energy|buff|aliad|ally|squad|equipe|support|suporte/.test(text))
    add(copy("Suporte", "Support", "Apoyo"));
  if (/invis|stealth|furtiv|cloak/.test(text)) add(copy("Furtividade", "Stealth", "Sigilo"));

  return tags.slice(0, 3);
}

function classify(value: number | undefined, thresholds: [number, number]) {
  if (value === undefined) return 1;
  if (value < thresholds[0]) return 0;
  if (value >= thresholds[1]) return 2;
  return 1;
}

export function WarframeCodex({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [entries, setEntries] = useState<WarframeApiItem[]>([]);
  const [query, setQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [variantMode, setVariantMode] = useState<VariantMode>("base");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ language: apiLanguage(locale), remove: "patchlogs" });

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
        const data = raw
          .filter(
            (candidate): candidate is WarframeApiItem =>
              Boolean(candidate && typeof candidate === "object" && "name" in candidate),
          )
          .sort((a, b) => a.name.localeCompare(b.name, locale));
        setEntries(data);
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

  const visibleEntries = useMemo(() => {
    const modeEntries = entries.filter((item) =>
      variantMode === "prime" ? isPrime(item.name) : !isPrime(item.name),
    );
    const term = normalizeForSearch(query.trim());
    if (!term) return modeEntries;
    return modeEntries.filter((item) => {
      const curated = curatedEntry(item);
      return normalizeForSearch(
        [item.name, item.description, item.type, curated?.role[locale], curated?.summary[locale]]
          .filter(Boolean)
          .join(" "),
      ).includes(term);
    });
  }, [entries, locale, query, variantMode]);

  const selected =
    visibleEntries.find((item) => itemKey(item) === selectedKey) ?? visibleEntries[0];

  useEffect(() => {
    if (!selected) return;
    if (selectedKey !== itemKey(selected)) setSelectedKey(itemKey(selected));
  }, [selected, selectedKey]);

  const switchVariant = () => {
    const nextMode: VariantMode = variantMode === "base" ? "prime" : "base";
    const family = selected ? baseName(selected.name) : "";
    const counterpart = entries.find(
      (entry) => baseName(entry.name) === family && (nextMode === "prime" ? isPrime(entry.name) : !isPrime(entry.name)),
    );
    setVariantMode(nextMode);
    if (counterpart) setSelectedKey(itemKey(counterpart));
    else setSelectedKey("");
  };

  return (
    <div className="wf-codex relative space-y-5">
      <section className="surface-panel overflow-hidden">
        <header className="wf-section-head grid gap-5 border-b border-border p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-[var(--impar-spectral)]">
              <BookOpenCheck className="size-4" />
              <span className="section-kicker">ÍMPAR / TENNO CODEX</span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
              {copy("Warframes, sem complicação", "Warframes, made simple", "Warframes, sin complicaciones")}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
              {copy(
                "Abra um Warframe e entenda primeiro o essencial: função, resistência, energia, mobilidade, passiva e o papel de cada habilidade. Os termos da interface ficam em português e o texto do jogo é solicitado à base localizada do Warframe.",
                "Open a Warframe and learn the essentials first: role, durability, energy, mobility, passive and what each ability is for. Interface terms stay localized and game text is requested from Warframe's localized data source.",
                "Abre un Warframe y entiende primero lo esencial: función, resistencia, energía, movilidad, pasiva y el papel de cada habilidad. La interfaz se mantiene localizada y los textos se solicitan a la fuente localizada de Warframe.",
              )}
            </p>
          </div>

          <label className="wf-search flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background/70 px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-auto border-0 bg-transparent p-0 shadow-none"
              placeholder={copy("Buscar Warframe", "Search Warframe", "Buscar Warframe")}
            />
          </label>
        </header>

        {error ? (
          <div className="p-6 sm:p-8">
            <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-5">
              <h3 className="font-display text-lg font-semibold text-foreground">
                {copy("Não consegui abrir o Códice agora", "The Codex could not load", "No se pudo abrir el Códice")}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {copy(
                  "A lista vem da base pública do ecossistema Warframe. O restante do hub continua funcionando.",
                  "The list comes from the public Warframe ecosystem database. The rest of the hub remains available.",
                  "La lista viene de la base pública del ecosistema Warframe. El resto del hub sigue disponible.",
                )}
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="grid min-h-72 place-items-center p-8 text-center">
            <div>
              <Loader2 className="mx-auto size-6 animate-spin text-[var(--impar-spectral)]" />
              <p className="mt-3 text-sm font-semibold text-foreground">
                {copy("Abrindo o Códice...", "Opening the Codex...", "Abriendo el Códice...")}
              </p>
            </div>
          </div>
        ) : visibleEntries.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {copy("Nenhum Warframe encontrado neste modo.", "No Warframe found in this mode.", "No se encontró ningún Warframe en este modo.")}
            </p>
          </div>
        ) : (
          <div className="grid min-w-0 lg:grid-cols-[17rem_minmax(0,1fr)]">
            <aside className="wf-roster border-b border-border p-3 lg:max-h-[860px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
              <div className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-3 lg:grid-cols-1">
                {visibleEntries.map((item) => {
                  const active = selected ? itemKey(selected) === itemKey(item) : false;
                  const curated = curatedEntry(item);
                  return (
                    <button
                      key={itemKey(item)}
                      type="button"
                      onClick={() => setSelectedKey(itemKey(item))}
                      className={cn("wf-roster-item", active && "wf-roster-item--active")}
                    >
                      <WarframeThumb item={item} />
                      <span className="min-w-0 text-left">
                        <span className="block truncate text-sm font-semibold text-foreground">{item.name}</span>
                        <span className="mt-0.5 block truncate text-[0.68rem] text-muted-foreground">
                          {curated?.role[locale] || copy("Warframe", "Warframe", "Warframe")}
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

      <div className="pointer-events-none sticky bottom-4 z-30 flex justify-end px-3 sm:px-5">
        <button
          type="button"
          onClick={switchVariant}
          className="wf-variant-toggle pointer-events-auto"
          aria-label={variantMode === "base" ? copy("Mostrar versões Prime", "Show Prime versions", "Mostrar versiones Prime") : copy("Mostrar versões normais", "Show base versions", "Mostrar versiones normales")}
        >
          <Orbit className="wf-variant-toggle__icon size-4" />
          <span>
            {variantMode === "base"
              ? copy("Ver Prime", "View Prime", "Ver Prime")
              : copy("Voltar ao normal", "Back to base", "Volver a normal")}
          </span>
          <span className="wf-variant-toggle__dot" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function WarframeDetail({ item, locale }: { item: WarframeApiItem; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const curated = curatedEntry(item);
  const apiSkills = normalizedAbilities(item);
  const curatedSkills = curated?.abilities ?? [];
  const source = imageUrl(item);
  const parts = Array.isArray(item.components) ? item.components.filter((part) => part?.name) : [];

  const abilities: AbilityView[] = curatedSkills.length
    ? curatedSkills.map((ability) => ({
        slot: ability.slot,
        name: ability.name[locale],
        description: ability.description[locale],
      }))
    : apiSkills;

  const durabilityScore = (item.health ?? 0) + (item.shield ?? 0) + (item.armor ?? 0) * 0.75;
  const durabilityClass = classify(durabilityScore, [550, 950]);
  const energyClass = classify(item.power, [150, 250]);
  const mobilityClass = classify(item.sprintSpeed, [1, 1.2]);
  const scaleLabel = [
    copy("Baixa", "Low", "Baja"),
    copy("Equilibrada", "Balanced", "Equilibrada"),
    copy("Alta", "High", "Alta"),
  ];

  return (
    <article className="min-w-0 p-4 sm:p-6 lg:p-7">
      <div className="grid gap-6 xl:grid-cols-[14rem_minmax(0,1fr)] xl:gap-8">
        <div className="xl:sticky xl:top-24 xl:self-start">
          <div className="wf-portrait aspect-square overflow-hidden rounded-2xl border border-border p-4">
            {source ? (
              <img src={source} alt={item.name} loading="lazy" className="h-full w-full object-contain" />
            ) : (
              <div className="grid h-full place-items-center"><ImageOff className="size-10 text-muted-foreground" /></div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.masteryReq !== undefined ? <Badge>{copy("Maestria", "Mastery", "Maestría")} {item.masteryReq}</Badge> : null}
            {isPrime(item.name) ? <Badge>Prime</Badge> : <Badge>{copy("Normal", "Base", "Normal")}</Badge>}
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[0.67rem] font-bold uppercase tracking-[0.1em] text-[var(--impar-spectral)]">
            {curated?.role[locale] || copy("Perfil do Warframe", "Warframe profile", "Perfil del Warframe")}
          </p>
          <h3 className="mt-2 text-balance font-display text-3xl font-bold text-foreground sm:text-4xl">
            {item.name}
          </h3>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
            {curated?.summary[locale] || item.description || copy("Dados atuais do Warframe.", "Current Warframe data.", "Datos actuales del Warframe.")}
          </p>

          <section className="wf-learn-strip mt-6" aria-label={copy("Leitura rápida", "Quick read", "Lectura rápida")}>
            <div className="wf-learn-strip__intro">
              <Gauge className="size-4" />
              <div>
                <p className="text-xs font-bold text-foreground">{copy("Entenda em 15 segundos", "Understand it in 15 seconds", "Entiéndelo en 15 segundos")}</p>
                <p className="mt-0.5 text-[0.7rem] text-muted-foreground">{copy("Uma leitura prática, não uma tier list.", "A practical read, not a tier list.", "Una lectura práctica, no una tier list.")}</p>
              </div>
            </div>
            <QuickRead icon={Shield} label={copy("Resistência", "Durability", "Resistencia")} value={scaleLabel[durabilityClass]} />
            <QuickRead icon={Zap} label={copy("Reserva de energia", "Energy pool", "Reserva de energía")} value={scaleLabel[energyClass]} />
            <QuickRead icon={Activity} label={copy("Mobilidade base", "Base mobility", "Movilidad base")} value={scaleLabel[mobilityClass]} />
          </section>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Stat icon={HeartPulse} label={copy("Vida", "Health", "Vida")} value={item.health} />
            <Stat icon={Shield} label={copy("Escudo", "Shield", "Escudo")} value={item.shield} />
            <Stat icon={Activity} label={copy("Armadura", "Armor", "Armadura")} value={item.armor} />
            <Stat icon={Zap} label={copy("Energia", "Energy", "Energía")} value={item.power} />
            <Stat icon={Sparkles} label={copy("Corrida", "Sprint", "Sprint")} value={item.sprintSpeed} />
          </div>

          {item.passive ? (
            <div className="wf-passive mt-5">
              <p className="text-[0.67rem] font-bold uppercase tracking-[0.1em] text-[var(--impar-spectral)]">
                {copy("Passiva — sempre ativa", "Passive — always active", "Pasiva — siempre activa")}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.passive}</p>
            </div>
          ) : null}
        </div>
      </div>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-kicker">{copy("COMO O KIT FUNCIONA", "HOW THE KIT WORKS", "CÓMO FUNCIONA EL KIT")}</p>
            <h4 className="mt-1 font-display text-xl font-semibold text-foreground sm:text-2xl">
              {copy("Habilidades explicadas", "Abilities explained", "Habilidades explicadas")}
            </h4>
          </div>
          <a
            href={curated?.officialUrl || OFFICIAL_WARFRAMES}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-[var(--impar-spectral)] hover:underline"
          >
            {copy("Página oficial", "Official page", "Página oficial")}
            <ExternalLink className="size-3.5" />
          </a>
        </div>

        {abilities.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {abilities.map((ability) => {
              const tags = abilityTags(ability.description, locale);
              return (
                <article key={`${ability.slot}-${ability.name}`} className="wf-ability-card">
                  <div className="flex items-center justify-between gap-3">
                    <span className="wf-ability-card__slot">{ability.slot}</span>
                    <div className="flex flex-wrap justify-end gap-1">
                      {tags.map((tag) => <span key={tag} className="wf-skill-tag">{tag}</span>)}
                    </div>
                  </div>
                  <h5 className="mt-4 font-display text-base font-semibold text-foreground">{ability.name}</h5>
                  <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                    {copy("O que faz", "What it does", "Qué hace")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {ability.description || copy("Descrição ainda não disponível na resposta localizada da base.", "Description is not available in the localized response yet.", "La descripción aún no está disponible en la respuesta localizada.")}
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-border bg-muted/10 p-4 text-sm text-muted-foreground">
            {copy("A fonte atual não retornou o kit desta variante.", "The current source did not return this variant's kit.", "La fuente actual no devolvió el kit de esta variante.")}
          </p>
        )}
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="wf-learning-note">
          <div className="flex items-center gap-2 text-[var(--impar-spectral)]"><Sparkles className="size-4" /><span className="text-xs font-bold">{copy("Dica de leitura", "Reading tip", "Consejo de lectura")}</span></div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {copy(
              "Comece pela passiva e pelas tags das habilidades. Depois olhe os números. Assim você entende primeiro o que o Warframe quer fazer, antes de pensar em Mods e builds.",
              "Start with the passive and ability tags, then look at the numbers. This shows what the Warframe wants to do before you think about Mods and builds.",
              "Empieza por la pasiva y las etiquetas de habilidades, y después mira los números. Así entiendes qué quiere hacer el Warframe antes de pensar en Mods y builds.",
            )}
          </p>
        </section>

        <aside className="wf-acquisition">
          <div className="flex items-center gap-2"><Boxes className="size-4 text-[var(--impar-spectral)]" /><h4 className="font-display text-base font-semibold text-foreground">{copy("Como conseguir", "How to get it", "Cómo conseguirlo")}</h4></div>
          {parts.length ? (
            <div className="mt-3 space-y-2">
              {parts.slice(0, 7).map((part, index) => (
                <div key={`${part.name}-${index}`} className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 text-xs last:border-0 last:pb-0">
                  <span className="min-w-0 truncate text-foreground">{part.name}</span>
                  <span className="shrink-0 text-muted-foreground">×{part.itemCount ?? part.count ?? 1}</span>
                </div>
              ))}
            </div>
          ) : <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy("Sem componentes estruturados nesta resposta.", "No structured components in this response.", "Sin componentes estructurados en esta respuesta.")}</p>}
          <a href={OFFICIAL_DROPS} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--impar-spectral)] hover:underline">
            {copy("Confirmar drops oficiais", "Check official drops", "Ver drops oficiales")}<ExternalLink className="size-3.5" />
          </a>
        </aside>
      </div>
    </article>
  );
}

function WarframeThumb({ item }: { item: WarframeApiItem }) {
  const source = imageUrl(item);
  return (
    <span className="wf-thumb">
      {source ? <img src={source} alt="" loading="lazy" className="h-full w-full object-contain p-1" /> : <ImageOff className="size-4 text-muted-foreground" />}
    </span>
  );
}

function QuickRead({ icon: Icon, label, value }: { icon: typeof Shield; label: string; value: string }) {
  return (
    <div className="wf-quick-read">
      <Icon className="size-3.5" />
      <div><p className="text-[0.62rem] uppercase tracking-[0.08em] text-muted-foreground">{label}</p><p className="mt-0.5 text-xs font-semibold text-foreground">{value}</p></div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value?: number }) {
  if (value === undefined) return null;
  return (
    <div className="wf-stat">
      <div className="flex items-center gap-1.5 text-muted-foreground"><Icon className="size-3.5" /><span className="text-[0.62rem] font-bold uppercase tracking-[0.07em]">{label}</span></div>
      <p className="mt-1.5 text-sm font-semibold text-foreground">{formatNumber(value)}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="wf-badge">{children}</span>;
}
