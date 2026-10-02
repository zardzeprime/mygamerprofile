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
type AbilityRole = "damage" | "survival" | "control" | "mobility" | "support" | "stealth";

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

function detectRoles(description: string): AbilityRole[] {
  const text = normalizeForSearch(description);
  const roles: AbilityRole[] = [];
  const add = (role: AbilityRole) => {
    if (!roles.includes(role)) roles.push(role);
  };

  if (/dano|damage|daño|corte|slash|toxic|viral|heat|fogo|impact|explod|burst|projétil|projectile/.test(text)) add("damage");
  if (/cura|heal|vida|health|escudo|shield|armor|armadura|protec|defen|invulner|reduz.*dano|damage reduction/.test(text)) add("survival");
  if (/controle|control|stun|slow|lent|derrub|knock|fear|terror|puxa|pull|ragdoll|suspende|lift/.test(text)) add("control");
  if (/movimento|movement|speed|veloc|teleport|dash|salto|jump|avan[cç]|leap/.test(text)) add("mobility");
  if (/energia|energy|buff|aliad|ally|squad|equipe|support|suporte|aumenta|increase/.test(text)) add("support");
  if (/invis|stealth|furtiv|cloak/.test(text)) add("stealth");

  return roles.length ? roles.slice(0, 3) : ["damage"];
}

function roleLabel(role: AbilityRole, locale: Locale) {
  const labels: Record<AbilityRole, [string, string, string]> = {
    damage: ["Dano", "Damage", "Daño"],
    survival: ["Sobrevivência", "Survival", "Supervivencia"],
    control: ["Controle", "Control", "Control"],
    mobility: ["Mobilidade", "Mobility", "Movilidad"],
    support: ["Suporte", "Support", "Apoyo"],
    stealth: ["Furtividade", "Stealth", "Sigilo"],
  };
  const [pt, en, es] = labels[role];
  return localeCopy(locale, pt, en, es);
}

function practicalTip(roles: AbilityRole[], locale: Locale) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  if (roles.includes("control") && roles.includes("damage")) {
    return copy(
      "Use para travar ou agrupar inimigos e já converter essa abertura em dano. Funciona melhor quando você prepara o alvo antes de descarregar arma ou outra habilidade.",
      "Use it to lock down or group enemies, then immediately convert that opening into damage. It works best when you prepare targets before committing a weapon or another ability.",
      "Úsala para controlar o agrupar enemigos y convertir esa apertura en daño. Funciona mejor si preparas el objetivo antes de gastar otra habilidad o el arma.",
    );
  }
  if (roles.includes("survival")) {
    return copy(
      "Pense nela como ferramenta de sustentação: use antes de entrar numa troca longa ou assim que sua defesa começar a cair, em vez de guardar só para o último segundo.",
      "Treat it as a sustain tool: use it before a long engagement or as soon as your defenses start dropping instead of saving it only for emergencies.",
      "Piénsala como una herramienta de aguante: úsala antes de un combate largo o cuando empiece a caer tu defensa, no solo como último recurso.",
    );
  }
  if (roles.includes("mobility")) {
    return copy(
      "Serve tanto para reposicionar quanto para acelerar o ritmo do kit. Tente usá-la para entrar ou sair de alcance sem interromper o ciclo das outras habilidades.",
      "It is both a repositioning tool and a way to speed up the kit. Use it to enter or leave range without breaking the rest of your ability cycle.",
      "Sirve para reposicionarte y acelerar el ritmo del kit. Úsala para entrar o salir de alcance sin romper el ciclo de las otras habilidades.",
    );
  }
  if (roles.includes("support")) {
    return copy(
      "O valor cresce quando você mantém o efeito ativo no momento certo. Observe duração, alcance e quem realmente recebe o benefício antes de recastar.",
      "Its value grows when the effect is active at the right time. Watch duration, range and who actually receives the benefit before recasting.",
      "Su valor aumenta cuando el efecto está activo en el momento correcto. Vigila duración, alcance y quién recibe el beneficio antes de volver a lanzarla.",
    );
  }
  if (roles.includes("stealth")) {
    return copy(
      "Use a janela de furtividade para reposicionar, preparar dano ou quebrar pressão. O ganho não é só ficar invisível: é escolher quando a luta volta a começar.",
      "Use the stealth window to reposition, prepare damage or reset pressure. The value is not only being unseen: it lets you decide when the fight resumes.",
      "Usa la ventana de sigilo para reposicionarte, preparar daño o reiniciar la presión. No se trata solo de ser invisible: eliges cuándo vuelve a empezar la pelea.",
    );
  }
  return copy(
    "É uma peça de pressão do kit. Procure usar depois de preparar o alvo com controle, debuff ou posicionamento, em vez de apertar isoladamente sempre que sair do cooldown.",
    "It is a pressure piece in the kit. Try to use it after preparing the target with control, a debuff or positioning instead of pressing it in isolation whenever it is available.",
    "Es una pieza de presión del kit. Intenta usarla después de preparar el objetivo con control, debuff o posicionamiento, en vez de lanzarla sola cada vez que esté disponible.",
  );
}

function synergyTip(current: AbilityView, abilities: AbilityView[], locale: Locale) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const currentRoles = detectRoles(current.description);
  const candidates = abilities.filter((ability) => ability.slot !== current.slot);

  const preferred = currentRoles.includes("damage")
    ? candidates.find((ability) => detectRoles(ability.description).includes("control"))
    : currentRoles.includes("control")
      ? candidates.find((ability) => detectRoles(ability.description).includes("damage"))
      : currentRoles.includes("survival")
        ? candidates.find((ability) => detectRoles(ability.description).includes("damage"))
        : candidates.find((ability) => detectRoles(ability.description).includes("control")) || candidates[0];

  if (!preferred) {
    return copy(
      "Leia esta habilidade junto da passiva e dos atributos do Warframe; algumas habilidades ganham muito valor pela forma como sustentam o restante do kit.",
      "Read this ability together with the passive and the Warframe's base stats; some abilities gain most of their value from how they sustain the rest of the kit.",
      "Léela junto con la pasiva y los atributos del Warframe; algunas habilidades ganan valor por cómo sostienen el resto del kit.",
    );
  }

  return copy(
    `Teste a sequência ${preferred.name} → ${current.name} e também o caminho inverso. O primeiro costuma preparar espaço; o segundo mostra se ${current.name} funciona melhor como abertura ou como conversão de dano.`,
    `Test ${preferred.name} → ${current.name}, then try the reverse order. The first sequence often creates space; the reverse shows whether ${current.name} works better as an opener or as damage conversion.`,
    `Prueba la secuencia ${preferred.name} → ${current.name} y después el orden inverso. La primera suele preparar espacio; la segunda muestra si ${current.name} funciona mejor para abrir o para convertir en daño.`,
  );
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
        setEntries(
          raw
            .filter(
              (candidate): candidate is WarframeApiItem =>
                Boolean(candidate && typeof candidate === "object" && "name" in candidate),
            )
            .sort((a, b) => a.name.localeCompare(b.name, locale)),
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

  const selected = visibleEntries.find((item) => itemKey(item) === selectedKey) ?? visibleEntries[0];

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
    setSelectedKey(counterpart ? itemKey(counterpart) : "");
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
              {copy("Warframes para aprender, não só consultar", "Warframes to learn, not only browse", "Warframes para aprender, no solo consultar")}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
              {copy(
                "A descrição do jogo fica inteira. Embaixo dela, o ÍMPAR separa função, uso prático e uma sinergia para você testar sem misturar orientação editorial com o texto original.",
                "The game description stays intact. Under it, ÍMPAR separates role, practical use and a synergy to test without mixing editorial guidance with the original text.",
                "La descripción del juego se mantiene completa. Debajo, ÍMPAR separa función, uso práctico y una sinergia para probar sin mezclar la guía editorial con el texto original.",
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
          <div className="p-6 sm:p-8 text-sm text-muted-foreground">
            {copy("Não consegui abrir o Códice agora. O restante do hub continua disponível.", "The Codex could not load right now. The rest of the hub remains available.", "No se pudo abrir el Códice ahora. El resto del hub sigue disponible.")}
          </div>
        ) : loading ? (
          <div className="grid min-h-72 place-items-center p-8 text-center">
            <div><Loader2 className="mx-auto size-6 animate-spin text-[var(--impar-spectral)]" /><p className="mt-3 text-sm font-semibold text-foreground">{copy("Abrindo o Códice...", "Opening the Codex...", "Abriendo el Códice...")}</p></div>
          </div>
        ) : visibleEntries.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-sm text-muted-foreground">{copy("Nenhum Warframe encontrado neste modo.", "No Warframe found in this mode.", "No se encontró ningún Warframe en este modo.")}</div>
        ) : (
          <div className="grid min-w-0 lg:grid-cols-[17rem_minmax(0,1fr)]">
            <aside className="wf-roster border-b border-border p-3 lg:max-h-[900px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
              <div className="grid grid-cols-2 gap-2 min-[560px]:grid-cols-3 lg:grid-cols-1">
                {visibleEntries.map((item) => {
                  const active = selected ? itemKey(selected) === itemKey(item) : false;
                  const curated = curatedEntry(item);
                  return (
                    <button key={itemKey(item)} type="button" onClick={() => setSelectedKey(itemKey(item))} className={cn("wf-roster-item", active && "wf-roster-item--active")}>
                      <WarframeThumb item={item} />
                      <span className="min-w-0 text-left"><span className="block truncate text-sm font-semibold text-foreground">{item.name}</span><span className="mt-0.5 block truncate text-[0.68rem] text-muted-foreground">{curated?.role[locale] || copy("Warframe", "Warframe", "Warframe")}</span></span>
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
        <button type="button" onClick={switchVariant} className="wf-variant-toggle pointer-events-auto" aria-label={variantMode === "base" ? copy("Mostrar versões Prime", "Show Prime versions", "Mostrar versiones Prime") : copy("Mostrar versões normais", "Show base versions", "Mostrar versiones normales")}>
          <Orbit className="wf-variant-toggle__icon size-4" />
          <span>{variantMode === "base" ? copy("Ver Prime", "View Prime", "Ver Prime") : copy("Voltar ao normal", "Back to base", "Volver a normal")}</span>
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
    ? curatedSkills.map((ability) => ({ slot: ability.slot, name: ability.name[locale], description: ability.description[locale] }))
    : apiSkills;

  const durabilityScore = (item.health ?? 0) + (item.shield ?? 0) + (item.armor ?? 0) * 0.75;
  const durabilityClass = classify(durabilityScore, [550, 950]);
  const energyClass = classify(item.power, [150, 250]);
  const mobilityClass = classify(item.sprintSpeed, [1, 1.2]);
  const scaleLabel = [copy("Baixa", "Low", "Baja"), copy("Equilibrada", "Balanced", "Equilibrada"), copy("Alta", "High", "Alta")];
  const kitRoles = Array.from(new Set(abilities.flatMap((ability) => detectRoles(ability.description)))).slice(0, 4);

  return (
    <article className="min-w-0 p-4 sm:p-6 lg:p-7">
      <div className="grid gap-6 xl:grid-cols-[14rem_minmax(0,1fr)] xl:gap-8">
        <div className="xl:sticky xl:top-24 xl:self-start">
          <div className="wf-portrait aspect-square overflow-hidden rounded-2xl border border-border p-4">
            {source ? <img src={source} alt={item.name} loading="lazy" className="h-full w-full object-contain" /> : <div className="grid h-full place-items-center"><ImageOff className="size-10 text-muted-foreground" /></div>}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.masteryReq !== undefined ? <Badge>{copy("Maestria", "Mastery", "Maestría")} {item.masteryReq}</Badge> : null}
            <Badge>{isPrime(item.name) ? "Prime" : copy("Normal", "Base", "Normal")}</Badge>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[0.67rem] font-bold uppercase tracking-[0.1em] text-[var(--impar-spectral)]">{curated?.role[locale] || copy("Perfil do Warframe", "Warframe profile", "Perfil del Warframe")}</p>
          <h3 className="mt-2 text-balance font-display text-3xl font-bold text-foreground sm:text-4xl">{item.name}</h3>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">{curated?.summary[locale] || item.description || copy("Dados atuais do Warframe.", "Current Warframe data.", "Datos actuales del Warframe.")}</p>

          <section className="wf-learn-strip mt-6" aria-label={copy("Leitura rápida", "Quick read", "Lectura rápida")}>
            <div className="wf-learn-strip__intro"><Gauge className="size-4" /><div><p className="text-xs font-bold text-foreground">{copy("Entenda em 15 segundos", "Understand it in 15 seconds", "Entiéndelo en 15 segundos")}</p><p className="mt-0.5 text-[0.7rem] text-muted-foreground">{kitRoles.map((role) => roleLabel(role, locale)).join(" · ") || copy("Kit híbrido", "Hybrid kit", "Kit híbrido")}</p></div></div>
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

          {item.passive ? <div className="wf-passive mt-5"><p className="text-[0.67rem] font-bold uppercase tracking-[0.1em] text-[var(--impar-spectral)]">{copy("Passiva — sempre ativa", "Passive — always active", "Pasiva — siempre activa")}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.passive}</p></div> : null}
        </div>
      </div>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="section-kicker">{copy("KIT COMPLETO", "FULL KIT", "KIT COMPLETO")}</p><h4 className="mt-1 font-display text-xl font-semibold text-foreground sm:text-2xl">{copy("Habilidades com contexto", "Abilities with context", "Habilidades con contexto")}</h4></div>
          <a href={curated?.officialUrl || OFFICIAL_WARFRAMES} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-[var(--impar-spectral)] hover:underline">{copy("Página oficial", "Official page", "Página oficial")}<ExternalLink className="size-3.5" /></a>
        </div>

        {abilities.length ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {abilities.map((ability) => {
              const roles = detectRoles(ability.description);
              return (
                <article key={`${ability.slot}-${ability.name}`} className="wf-ability-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3"><span className="wf-ability-card__slot">{ability.slot}</span><h5 className="font-display text-lg font-semibold text-foreground">{ability.name}</h5></div>
                    <div className="flex flex-wrap justify-end gap-1">{roles.map((role) => <span key={role} className="wf-skill-tag">{roleLabel(role, locale)}</span>)}</div>
                  </div>

                  <div className="mt-4 border-t border-border/60 pt-4">
                    <p className="text-[0.64rem] font-bold uppercase tracking-[0.09em] text-muted-foreground">{copy("Descrição do jogo", "Game description", "Descripción del juego")}</p>
                    <p className="mt-2 text-sm leading-6 text-foreground/90">{ability.description || copy("A fonte localizada ainda não retornou uma descrição completa para esta habilidade.", "The localized source has not returned a full description for this ability yet.", "La fuente localizada todavía no devolvió una descripción completa para esta habilidad.")}</p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="wf-learning-note !p-3"><p className="text-[0.63rem] font-bold uppercase tracking-[0.08em] text-[var(--impar-spectral)]">{copy("Como usar", "How to use it", "Cómo usarla")}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{practicalTip(roles, locale)}</p></div>
                    <div className="wf-learning-note !p-3"><p className="text-[0.63rem] font-bold uppercase tracking-[0.08em] text-[var(--impar-spectral)]">{copy("Sinergia para testar", "Synergy to test", "Sinergia para probar")}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{synergyTip(ability, abilities, locale)}</p></div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : <p className="mt-4 rounded-xl border border-border bg-muted/10 p-4 text-sm text-muted-foreground">{copy("A fonte atual não retornou o kit desta variante.", "The current source did not return this variant's kit.", "La fuente actual no devolvió el kit de esta variante.")}</p>}
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="wf-learning-note"><div className="flex items-center gap-2 text-[var(--impar-spectral)]"><Sparkles className="size-4" /><span className="text-xs font-bold">{copy("Como aprender o kit", "How to learn the kit", "Cómo aprender el kit")}</span></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy("Faça três testes: primeiro use cada habilidade sozinha; depois combine controle → dano; por último teste a mesma sequência em movimento. Isso separa o que a skill faz do que o kit inteiro faz junto.", "Run three tests: first use every ability alone; then combine control → damage; finally repeat the same sequence while moving. This separates what each skill does from what the whole kit does together.", "Haz tres pruebas: primero usa cada habilidad sola; después combina control → daño; por último repite la secuencia en movimiento. Así separas lo que hace cada skill de lo que hace todo el kit junto.")}</p></section>

        <aside className="wf-acquisition"><div className="flex items-center gap-2"><Boxes className="size-4 text-[var(--impar-spectral)]" /><h4 className="font-display text-base font-semibold text-foreground">{copy("Como conseguir", "How to get it", "Cómo conseguirlo")}</h4></div>{parts.length ? <div className="mt-3 space-y-2">{parts.slice(0, 7).map((part, index) => <div key={`${part.name}-${index}`} className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 text-xs last:border-0 last:pb-0"><span className="min-w-0 truncate text-foreground">{part.name}</span><span className="shrink-0 text-muted-foreground">×{part.itemCount ?? part.count ?? 1}</span></div>)}</div> : <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy("Sem componentes estruturados nesta resposta.", "No structured components in this response.", "Sin componentes estructurados en esta respuesta.")}</p>}<a href={OFFICIAL_DROPS} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--impar-spectral)] hover:underline">{copy("Confirmar drops oficiais", "Check official drops", "Ver drops oficiales")}<ExternalLink className="size-3.5" /></a></aside>
      </div>
    </article>
  );
}

function WarframeThumb({ item }: { item: WarframeApiItem }) {
  const source = imageUrl(item);
  return <span className="wf-thumb">{source ? <img src={source} alt="" loading="lazy" className="h-full w-full object-contain p-1" /> : <ImageOff className="size-4 text-muted-foreground" />}</span>;
}

function QuickRead({ icon: Icon, label, value }: { icon: typeof Shield; label: string; value: string }) {
  return <div className="wf-quick-read"><Icon className="size-3.5" /><div><p className="text-[0.62rem] uppercase tracking-[0.08em] text-muted-foreground">{label}</p><p className="mt-0.5 text-xs font-semibold text-foreground">{value}</p></div></div>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value?: number }) {
  if (value === undefined) return null;
  return <div className="wf-stat"><div className="flex items-center gap-1.5 text-muted-foreground"><Icon className="size-3.5" /><span className="text-[0.62rem] font-bold uppercase tracking-[0.07em]">{label}</span></div><p className="mt-1.5 text-sm font-semibold text-foreground">{formatNumber(value)}</p></div>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="wf-badge">{children}</span>;
}
