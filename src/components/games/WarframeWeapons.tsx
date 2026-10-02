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
type WeaponIdentity = "critical" | "status" | "hybrid" | "raw";

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

function normalizedChance(value?: number) {
  if (value === undefined || Number.isNaN(value)) return 0;
  return value <= 1 ? value : value / 100;
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
  const normalized = normalizedChance(value);
  if (normalized < thresholds[0]) return 0;
  if (normalized >= thresholds[1]) return 2;
  return 1;
}

function weaponIdentity(item: Weapon): WeaponIdentity {
  const crit = normalizedChance(item.criticalChance);
  const status = normalizedChance(item.procChance);
  const strongCrit = crit >= 0.22;
  const strongStatus = status >= 0.22;

  if (strongCrit && strongStatus) return "hybrid";
  if (strongCrit) return "critical";
  if (strongStatus) return "status";
  return "raw";
}

function identityLabel(identity: WeaponIdentity, locale: Locale) {
  const labels: Record<WeaponIdentity, [string, string, string]> = {
    critical: ["Tendência crítica", "Critical leaning", "Enfoque crítico"],
    status: ["Tendência a status", "Status leaning", "Enfoque de estado"],
    hybrid: ["Perfil híbrido", "Hybrid profile", "Perfil híbrido"],
    raw: ["Dano/base e conforto", "Base damage / comfort", "Daño base / comodidad"],
  };
  const [pt, en, es] = labels[identity];
  return localeCopy(locale, pt, en, es);
}

function identityExplanation(item: Weapon, locale: Locale) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const identity = weaponIdentity(item);
  if (identity === "hybrid") {
    return copy(
      "Crítico e status já têm base suficiente para crescer juntos. Em vez de forçar só um lado, vale testar uma estrutura híbrida e observar qual parte realmente melhora o tempo para matar no conteúdo que você joga.",
      "Critical and Status both have enough base value to scale together. Instead of forcing only one side, test a hybrid structure and watch which part actually improves time-to-kill in the content you play.",
      "Crítico y estado tienen una base suficiente para crecer juntos. En vez de forzar un solo lado, prueba una estructura híbrida y observa qué parte mejora de verdad el tiempo para matar.",
    );
  }
  if (identity === "critical") {
    return copy(
      "A arma tende a transformar melhor investimento em chance crítica e multiplicador crítico. Depois disso, dano base, multishot e elementos costumam ser o próximo eixo de teste.",
      "The weapon tends to convert investment in critical chance and critical multiplier more efficiently. After that, base damage, multishot and elements are the next things to test.",
      "El arma suele aprovechar mejor la probabilidad y el multiplicador crítico. Después, conviene probar daño base, multidisparo y elementos.",
    );
  }
  if (identity === "status") {
    return copy(
      "O ponto forte é aplicar efeitos com consistência. Vale comparar mais status/multishot com elementos que façam sentido para o inimigo, sem assumir que um único elemento serve para todo conteúdo.",
      "Its strength is applying effects consistently. Compare more Status/multishot with elements that fit the enemy instead of assuming one element works for every activity.",
      "Su fuerte es aplicar efectos con constancia. Compara más estado/multidisparo con elementos adecuados al enemigo, sin asumir que un solo elemento sirve para todo.",
    );
  }
  return copy(
    "Os números de crítico e status não apontam para um caminho dominante. Aqui o ganho pode vir mais de dano base, multishot, velocidade, alcance ou conforto — depende bastante do comportamento real da arma.",
    "Critical and Status values do not point to one dominant path. Gains may come more from base damage, multishot, speed, range or comfort, depending heavily on how the weapon actually behaves.",
    "Los valores de crítico y estado no señalan un camino dominante. La mejora puede venir más de daño base, multidisparo, velocidad, alcance o comodidad, según cómo se comporte el arma.",
  );
}

function handlingExplanation(item: Weapon, locale: Locale) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const rate = item.fireRate ?? 0;
  const magazine = item.magazineSize ?? 0;

  if (rate >= 8 && magazine > 0 && magazine <= 30) {
    return copy(
      "Cadência alta com carregador curto pode transformar recarga e economia de munição em gargalos. Teste primeiro como a arma se sente antes de gastar slots só em dano.",
      "High fire rate with a small magazine can make reload and ammo economy the bottleneck. Test how the weapon feels before spending every slot only on damage.",
      "Cadencia alta con cargador corto puede volver la recarga y la munición el verdadero cuello de botella. Prueba la sensación del arma antes de dedicar todos los espacios solo a daño.",
    );
  }
  if (rate > 0 && rate < 3) {
    return copy(
      "Cadência baixa costuma tornar cada disparo mais importante. Precisão, velocidade de ataque/disparo e o tempo entre alvos podem mudar mais a experiência do que um pequeno ganho numérico de dano.",
      "Low fire rate makes each shot matter more. Accuracy, attack/fire speed and target-to-target timing can change the experience more than a small numerical damage gain.",
      "La cadencia baja hace que cada disparo importe más. Precisión, velocidad y el tiempo entre objetivos pueden cambiar más la experiencia que una pequeña mejora de daño.",
    );
  }
  return copy(
    "A cadência não parece um extremo por si só. Use uma missão curta para sentir recarga, munição, recuo e ritmo antes de decidir se a build precisa de conforto ou só de dano.",
    "Fire rate is not an extreme by itself. Use a short mission to feel reload, ammo, recoil and pacing before deciding whether the build needs comfort or just damage.",
    "La cadencia no parece extrema por sí sola. Usa una misión corta para sentir recarga, munición, retroceso y ritmo antes de decidir si necesitas comodidad o solo daño.",
  );
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
              {copy("Entenda a arma antes de montar a build", "Understand the weapon before building it", "Entiende el arma antes de crear la build")}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
              {copy(
                "A descrição original fica visível e os números viram uma leitura prática: identidade de dano, gargalos de manuseio e um roteiro simples para testar Mods sem copiar uma build às cegas.",
                "The original description stays visible and the numbers become a practical read: damage identity, handling bottlenecks and a simple path for testing Mods instead of copying a build blindly.",
                "La descripción original permanece visible y los números se convierten en una lectura práctica: identidad de daño, límites de manejo y una ruta sencilla para probar Mods sin copiar una build a ciegas.",
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
            <aside className="wf-roster border-b border-border p-3 lg:max-h-[900px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
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
        <button type="button" onClick={switchMode} className="wf-variant-toggle pointer-events-auto" aria-label={arsenalMode === "base" ? copy("Mostrar variantes", "Show variants", "Mostrar variantes") : copy("Mostrar versões normais", "Show base versions", "Mostrar versiones normales")}>
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
  const fireRateValue = item.fireRate ?? 0;
  const fireClass = fireRateValue < 3 ? 0 : fireRateValue >= 8 ? 2 : 1;
  const identity = weaponIdentity(item);

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
            <Badge>{identityLabel(identity, locale)}</Badge>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[0.67rem] font-bold uppercase tracking-[0.1em] text-[var(--impar-spectral)]">{localizedType(item, locale)}</p>
          <h3 className="mt-2 text-balance font-display text-3xl font-bold text-foreground sm:text-4xl">{item.name}</h3>

          <div className="mt-4 border-l-2 border-[var(--impar-line)] pl-4">
            <p className="text-[0.63rem] font-bold uppercase tracking-[0.09em] text-muted-foreground">{copy("Descrição da base do jogo", "Game database description", "Descripción de la base del juego")}</p>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-foreground/90 sm:text-[0.95rem]">{item.description || copy("A base localizada não retornou uma descrição textual para esta arma.", "The localized database did not return a text description for this weapon.", "La base localizada no devolvió una descripción textual para esta arma.")}</p>
          </div>

          <section className="wf-learn-strip mt-6">
            <div className="wf-learn-strip__intro"><Gauge className="size-4" /><div><p className="text-xs font-bold text-foreground">{identityLabel(identity, locale)}</p><p className="mt-0.5 text-[0.7rem] text-muted-foreground">{copy("Uma pista de por onde começar — não uma build pronta.", "A clue for where to start — not a finished build.", "Una pista para empezar, no una build terminada.")}</p></div></div>
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

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="wf-learning-note">
          <div className="flex items-center gap-2 text-[var(--impar-spectral)]"><Crosshair className="size-4" /><span className="text-xs font-bold">{copy("Direção de build para testar", "Build direction to test", "Dirección de build para probar")}</span></div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{identityExplanation(item, locale)}</p>
          <p className="mt-3 text-[0.7rem] leading-5 text-muted-foreground/80">{copy("Isto é leitura editorial a partir dos atributos mostrados acima. Não substitui testes com Mods, inimigos e modos de disparo específicos.", "This is editorial guidance based on the stats above. It does not replace testing with Mods, enemies and specific firing modes.", "Esta es una lectura editorial basada en los atributos anteriores. No sustituye pruebas con Mods, enemigos y modos de disparo específicos.")}</p>
        </div>

        <div className="wf-learning-note">
          <div className="flex items-center gap-2 text-[var(--impar-spectral)]"><Timer className="size-4" /><span className="text-xs font-bold">{copy("Conforto e ritmo", "Handling and pacing", "Manejo y ritmo")}</span></div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{handlingExplanation(item, locale)}</p>
        </div>
      </section>

      <section className="wf-learning-note mt-4">
        <div className="flex items-center gap-2 text-[var(--impar-spectral)]"><Sparkles className="size-4" /><span className="text-xs font-bold">{copy("Aprenda a arma em três testes", "Learn the weapon in three tests", "Aprende el arma en tres pruebas")}</span></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <LearningStep number="1" title={copy("Sinta a base", "Feel the base", "Siente la base")} body={copy("Entre numa missão curta e observe recarga, precisão, recuo, alcance e consumo de munição antes de encher a arma de Mods.", "Run a short mission and observe reload, accuracy, recoil, range and ammo consumption before filling the weapon with Mods.", "Haz una misión corta y observa recarga, precisión, retroceso, alcance y consumo de munición antes de llenarla de Mods.")} />
          <LearningStep number="2" title={copy("Teste a identidade", "Test the identity", "Prueba la identidad")} body={copy("Compare um núcleo crítico, de status ou híbrido conforme os números acima. Troque poucas peças por vez para saber o que realmente mudou.", "Compare a critical, Status or hybrid core based on the stats above. Change only a few pieces at a time so you know what actually changed.", "Compara un núcleo crítico, de estado o híbrido según los números anteriores. Cambia pocas piezas a la vez para saber qué cambió de verdad.")} />
          <LearningStep number="3" title={copy("Corrija o gargalo", "Fix the bottleneck", "Corrige el cuello de botella")} body={copy("Só depois ajuste cadência, recarga, alcance ou munição. Se a arma já mata bem mas é desconfortável, conforto pode render mais que outro Mod de dano.", "Only then adjust fire rate, reload, range or ammo. If the weapon already kills well but feels awkward, comfort can be worth more than another damage Mod.", "Solo después ajusta cadencia, recarga, alcance o munición. Si el arma ya mata bien pero es incómoda, la comodidad puede valer más que otro Mod de daño.")} />
        </div>
      </section>

      <section className="wf-acquisition mt-4">
        <div className="flex items-center gap-2"><Boxes className="size-4 text-[var(--impar-spectral)]" /><h4 className="font-display text-base font-semibold text-foreground">{copy("Fundição e componentes", "Foundry and components", "Fundición y componentes")}</h4></div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {item.buildTime !== undefined ? <MiniFact icon={Timer} label={copy("Tempo", "Time", "Tiempo")} value={formatDuration(item.buildTime)} /> : null}
          {item.buildPrice !== undefined ? <MiniFact icon={Coins} label={copy("Créditos", "Credits", "Créditos")} value={formatNumber(item.buildPrice)} /> : null}
          {item.skipBuildTimePrice !== undefined ? <MiniFact icon={Zap} label={copy("Rush", "Rush", "Rush")} value={`${formatNumber(item.skipBuildTimePrice)} PL`} /> : null}
        </div>
        {components.length ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{components.slice(0, 8).map((part, index) => <div key={`${part.name}-${index}`} className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 text-xs"><span className="truncate text-foreground">{part.name}</span><span className="shrink-0 text-muted-foreground">×{part.itemCount ?? part.count ?? 1}</span></div>)}</div> : <p className="mt-3 text-sm text-muted-foreground">{copy("A resposta atual não trouxe componentes estruturados para esta arma.", "The current response did not include structured components for this weapon.", "La respuesta actual no incluyó componentes estructurados para esta arma.")}</p>}
        <a href={OFFICIAL_DROPS} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--impar-spectral)] hover:underline">{copy("Confirmar fontes oficiais", "Check official sources", "Ver fuentes oficiales")}<ExternalLink className="size-3.5" /></a>
      </section>
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

function LearningStep({ number, title, body }: { number: string; title: string; body: string }) {
  return <div className="rounded-xl border border-border/70 bg-background/25 p-3"><span className="text-[0.62rem] font-bold text-[var(--impar-spectral)]">{number.padStart(2, "0")}</span><h5 className="mt-2 text-sm font-semibold text-foreground">{title}</h5><p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p></div>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="wf-badge">{children}</span>;
}
