import { useMemo, useState } from "react";
import {
  Anvil,
  BookOpen,
  Flame,
  Hammer,
  Plus,
  ShieldCheck,
  Sparkles,
  Sword,
  WandSparkles,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

type BuildPreset = {
  id: string;
  title: Record<Locale, string>;
  archetype: Record<Locale, string>;
  summary: Record<Locale, string>;
  startingClass: string;
  stats: string[];
  core: string[];
  secondary: string[];
  rings: string[];
  spells: string[];
  variants: Record<Locale, string>[];
  sources: Array<{ label: string; url: string }>;
  icon: typeof Sword;
};

const PRESETS: BuildPreset[] = [
  {
    id: "quality-claymore",
    title: {
      "pt-BR": "Quality Claymore",
      en: "Quality Claymore",
      es: "Quality Claymore",
    },
    archetype: {
      "pt-BR": "Versátil · PvE",
      en: "Versatile · PvE",
      es: "Versátil · PvE",
    },
    summary: {
      "pt-BR": "Uma rota segura para aprender o jogo: Claymore +15, boa vida, stamina alta e investimento equilibrado em Força/Destreza. Ao usar a arma com duas mãos, 27 STR aproveita o bônus de 1,5× de Força.",
      en: "A safe learning route: Claymore +15, healthy vitality/endurance and balanced Strength/Dexterity. Two-handing lets 27 STR benefit from the 1.5× Strength modifier.",
      es: "Una ruta segura para aprender: Claymore +15, buena vitalidad/resistencia y Fuerza/Destreza equilibradas. A dos manos, 27 STR aprovecha el modificador de 1,5×.",
    },
    startingClass: "Warrior",
    stats: ["VIT 30–40", "END 30–40", "STR 27", "DEX 40"],
    core: ["Claymore +15"],
    secondary: ["Zweihander +15", "Gargoyle Halberd +15", "Longsword +15"],
    rings: ["Ring of Favor and Protection", "Havel's Ring / Wolf Ring"],
    spells: [],
    variants: [
      {
        "pt-BR": "Mais tanque: suba VIT antes de fechar DEX 40.",
        en: "Tankier: raise VIT before finishing 40 DEX.",
        es: "Más resistente: sube VIT antes de cerrar 40 DEX.",
      },
      {
        "pt-BR": "Mais flexível em uma mão: leve STR até 40 no NG+.",
        en: "More one-handed flexibility: push STR toward 40 in NG+.",
        es: "Más flexibilidad a una mano: lleva STR hacia 40 en NG+.",
      },
    ],
    sources: [
      { label: "Dark Souls community · Quality discussion", url: "https://steamcommunity.com/app/211420/discussions/0/624074858707394642/" },
      { label: "GameFAQs · Claymore scaling discussion", url: "https://gamefaqs.gamespot.com/boards/230462-dark-souls-remastered/76646160" },
    ],
    icon: Sword,
  },
  {
    id: "strength-great-club",
    title: {
      "pt-BR": "Força · Great Club",
      en: "Strength · Great Club",
      es: "Fuerza · Great Club",
    },
    archetype: {
      "pt-BR": "Impacto pesado · PvE",
      en: "Heavy impact · PvE",
      es: "Impacto pesado · PvE",
    },
    summary: {
      "pt-BR": "Build de dano físico alto e stagger. O Great Club +15 possui forte escalamento de Força e funciona muito bem com 27 STR quando usado em duas mãos; sobra nível para Vida, Stamina e carga.",
      en: "High physical damage and stagger. Great Club +15 scales strongly with Strength and works well at 27 STR when two-handed, leaving levels for vitality, stamina and equip load.",
      es: "Alto daño físico y stagger. Great Club +15 escala fuerte con Fuerza y funciona bien con 27 STR a dos manos, dejando niveles para vida, stamina y carga.",
    },
    startingClass: "Bandit",
    stats: ["VIT 35–40", "END 35–40", "STR 27–40", "DEX mínimo"],
    core: ["Great Club +15"],
    secondary: ["Man-Serpent Greatsword +15", "Large Club +15"],
    rings: ["Ring of Favor and Protection", "Havel's Ring"],
    spells: ["Power Within (opcional)"],
    variants: [
      {
        "pt-BR": "27 STR: foco em duas mãos e melhor economia de níveis.",
        en: "27 STR: two-hand focus with better level efficiency.",
        es: "27 STR: enfoque a dos manos y mejor eficiencia de niveles.",
      },
      {
        "pt-BR": "40 STR: melhor para alternar uma mão + escudo.",
        en: "40 STR: better for one-hand + shield flexibility.",
        es: "40 STR: mejor para alternar una mano + escudo.",
      },
    ],
    sources: [
      { label: "Dark Souls Wiki · Great Club", url: "https://darksouls.fandom.com/wiki/Great_Club" },
      { label: "Community build reference · Great Club", url: "https://www.youtube.com/watch?v=oYaH5GpDKDQ" },
    ],
    icon: Hammer,
  },
  {
    id: "dex-pyro",
    title: {
      "pt-BR": "Destreza + Piromancia",
      en: "Dexterity + Pyromancy",
      es: "Destreza + Piromancia",
    },
    archetype: {
      "pt-BR": "Mobilidade · Burst",
      en: "Mobility · Burst",
      es: "Movilidad · Burst",
    },
    summary: {
      "pt-BR": "DEX fornece o dano da arma e acelera a conjuração em níveis altos, enquanto o dano da piromancia vem da própria Pyromancy Flame. É uma build rápida, agressiva e ótima para variar entre melee e burst.",
      en: "DEX powers the weapon and improves casting speed at high values, while pyromancy damage comes from the Pyromancy Flame itself. Fast, aggressive and flexible between melee and burst.",
      es: "DEX potencia el arma y mejora la velocidad de casteo a valores altos, mientras el daño de piromancia viene de la Pyromancy Flame. Rápida, agresiva y flexible.",
    },
    startingClass: "Pyromancer",
    stats: ["VIT 25–35", "END 30–40", "DEX 40–45", "ATT 16–19"],
    core: ["Uchigatana +15 / Great Scythe +15", "Ascended Pyromancy Flame +5"],
    secondary: ["Balder Side Sword +15", "Quelaag's Furysword"],
    rings: ["Ring of Favor and Protection", "Bellowing Dragoncrest Ring"],
    spells: ["Great Combustion", "Power Within", "Black Flame (DLC)"],
    variants: [
      {
        "pt-BR": "DEX 40 para arma; 45 só se você quiser maximizar a velocidade de conjuração.",
        en: "40 DEX for weapon damage; 45 only if you want maximum cast-speed benefit.",
        es: "40 DEX para el arma; 45 solo si quieres maximizar la velocidad de casteo.",
      },
      {
        "pt-BR": "Troque o segundo anel por Havel's Ring quando quiser mais armadura.",
        en: "Swap the second ring for Havel's Ring when you want heavier armor.",
        es: "Cambia el segundo anillo por Havel's Ring cuando quieras más armadura.",
      },
    ],
    sources: [
      { label: "Dark Souls Wiki · Great Combustion", url: "https://darksouls.wikidot.com/great-combustion" },
      { label: "Dark Souls Wiki · Power Within", url: "https://darksouls.wikidot.com/power-within" },
    ],
    icon: Flame,
  },
];

export function DarkSoulsBuildLab({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [selected, setSelected] = useState(PRESETS[0]?.id ?? "");
  const [customName, setCustomName] = useState(copy("Minha build", "My build", "Mi build"));
  const [coreOne, setCoreOne] = useState("");
  const [coreTwo, setCoreTwo] = useState("");
  const [variant, setVariant] = useState("");
  const [notes, setNotes] = useState("");

  const active = useMemo(
    () => PRESETS.find((build) => build.id === selected) ?? PRESETS[0],
    [selected],
  );

  if (!active) return null;
  const ActiveIcon = active.icon;

  return (
    <div className="space-y-6">
      <section className="surface-panel overflow-hidden">
        <div className="border-b border-border p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <Anvil className="size-4 text-gold-strong" />
            <span className="section-kicker">{copy("LABORATÓRIO MGP", "MGP BUILD LAB", "LABORATORIO MGP")}</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
            {copy("Builds de Dark Souls Remastered", "Dark Souls Remastered builds", "Builds de Dark Souls Remastered")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy(
              "Três pontos de partida pensados para PvE, com núcleos claros, variações e fontes. Não são uma tier list: servem como rotas de progressão que você pode adaptar.",
              "Three PvE-oriented starting points with clear cores, variants and sources. They are not a tier list; use them as progression routes you can adapt.",
              "Tres puntos de partida para PvE con núcleos claros, variantes y fuentes. No son una tier list; son rutas de progresión que puedes adaptar.",
            )}
          </p>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
          {PRESETS.map((build) => {
            const Icon = build.icon;
            const isActive = build.id === active.id;
            return (
              <button
                key={build.id}
                type="button"
                onClick={() => setSelected(build.id)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all hover:-translate-y-1 hover:shadow-lift",
                  isActive
                    ? "border-gold/55 bg-gold/[0.08]"
                    : "border-border bg-muted/10 hover:border-gold/30",
                )}
              >
                <Icon className="size-5 text-gold-strong" />
                <p className="mt-3 font-display text-lg font-semibold text-foreground">{build.title[locale]}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  {build.archetype[locale]}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="surface-panel overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
          <article className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.08] px-3 py-1 text-xs font-bold text-gold-strong">
                <ShieldCheck className="size-3.5" />
                {copy("MGP Verificada", "MGP Verified", "MGP Verificada")}
              </span>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                {active.startingClass}
              </span>
            </div>
            <div className="mt-5 flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-muted/20">
                <ActiveIcon className="size-5 text-gold-strong" />
              </span>
              <div>
                <h3 className="font-display text-3xl font-bold text-foreground">{active.title[locale]}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">{active.summary[locale]}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <BuildPanel title={copy("Stats alvo", "Target stats", "Stats objetivo")} rows={active.stats} />
              <BuildPanel title={copy("Núcleo", "Core", "Núcleo")} rows={active.core} highlighted />
              <BuildPanel title={copy("Opções secundárias", "Secondary options", "Opciones secundarias")} rows={active.secondary} />
              <BuildPanel title={copy("Anéis", "Rings", "Anillos")} rows={active.rings} />
              {active.spells.length ? (
                <BuildPanel title={copy("Magias / piromancias", "Spells / pyromancies", "Magias / piromancias")} rows={active.spells} />
              ) : null}
              <BuildPanel title={copy("Variantes", "Variants", "Variantes")} rows={active.variants.map((entry) => entry[locale])} />
            </div>
          </article>

          <aside className="border-t border-border bg-muted/10 p-5 lg:border-l lg:border-t-0 sm:p-6">
            <p className="section-kicker">{copy("FONTES", "SOURCES", "FUENTES")}</p>
            <div className="mt-4 space-y-2">
              {active.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-border bg-background/60 p-3 text-sm font-semibold text-foreground transition-colors hover:border-gold/35"
                >
                  {source.label} ↗
                </a>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              {copy(
                "Os presets misturam dados do jogo e consenso de comunidade. O MGP mantém as explicações próprias e deixa a procedência visível.",
                "Presets combine game data and community consensus. MGP keeps the explanations original and provenance visible.",
                "Los presets combinan datos del juego y consenso de comunidad. MGP mantiene explicaciones propias y procedencia visible.",
              )}
            </p>
          </aside>
        </div>
      </section>

      <section className="surface-panel p-5 sm:p-7">
        <div className="flex items-center gap-2">
          <WandSparkles className="size-4 text-gold-strong" />
          <span className="section-kicker">{copy("CRIADOR", "BUILDER", "CREADOR")}</span>
        </div>
        <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
          {copy("Monte sua própria build", "Create your own build", "Crea tu propia build")}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {copy(
            "Defina um ou dois itens core e deixe o resto como variantes/situacionais. Esse mesmo padrão vai ser usado no LoL.",
            "Define one or two core items and keep the rest as variants/situational picks. The same pattern is used in LoL.",
            "Define uno o dos objetos core y deja el resto como variantes/situacionales. El mismo patrón se usa en LoL.",
          )}
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <BuilderField label={copy("Nome", "Name", "Nombre")}>
            <Input value={customName} onChange={(event) => setCustomName(event.target.value)} />
          </BuilderField>
          <BuilderField label={copy("Core 1", "Core 1", "Core 1")}>
            <Input value={coreOne} onChange={(event) => setCoreOne(event.target.value)} placeholder="Ex.: Claymore +15" />
          </BuilderField>
          <BuilderField label={copy("Core 2 (opcional)", "Core 2 (optional)", "Core 2 (opcional)")}>
            <Input value={coreTwo} onChange={(event) => setCoreTwo(event.target.value)} placeholder="Ex.: Pyromancy Flame" />
          </BuilderField>
          <BuilderField label={copy("Variante / situacional", "Variant / situational", "Variante / situacional")}>
            <Input value={variant} onChange={(event) => setVariant(event.target.value)} placeholder="Ex.: Havel's Ring" />
          </BuilderField>
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
            {copy("Explicação", "Explanation", "Explicación")}
          </span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-2 min-h-28 w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors focus:border-gold/50"
            placeholder={copy(
              "Explique quando usar a variante, quais stats priorizar e o que a build tenta resolver.",
              "Explain when to use the variant, which stats to prioritize and what the build is trying to solve.",
              "Explica cuándo usar la variante, qué stats priorizar y qué intenta resolver la build.",
            )}
          />
        </label>

        <div className="mt-5 rounded-2xl border border-gold/25 bg-gold/[0.05] p-4">
          <p className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <Sparkles className="size-4 text-gold-strong" />
            {customName || copy("Minha build", "My build", "Mi build")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[coreOne, coreTwo, variant].filter(Boolean).map((value, index) => (
              <span key={`${value}-${index}`} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground">
                {index < 2 ? copy("Core", "Core", "Core") : copy("Variante", "Variant", "Variante")}: {value}
              </span>
            ))}
          </div>
          {notes ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{notes}</p> : null}
        </div>
      </section>
    </div>
  );
}

function BuildPanel({
  title,
  rows,
  highlighted = false,
}: {
  title: string;
  rows: string[];
  highlighted?: boolean;
}) {
  return (
    <section className={cn("rounded-2xl border p-4", highlighted ? "border-gold/35 bg-gold/[0.06]" : "border-border bg-muted/10")}>
      <h4 className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground">{title}</h4>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row} className="flex gap-2 text-sm leading-6 text-foreground">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-strong" />
            <span>{row}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BuilderField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
