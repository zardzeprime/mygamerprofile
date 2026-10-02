import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Crosshair,
  Flame,
  Gauge,
  Heart,
  Info,
  Shield,
  Sparkles,
  Sun,
  Swords,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import {
  BUILD_DIRECTIONS,
  DARK_SOULS_STATS,
  SCALING_GRADES,
  UPGRADE_PATH_NOTES,
  type DarkSoulsStatId,
} from "@/data/darkSoulsStatsGuide";
import { cn } from "@/lib/utils";

const STAT_ICONS: Record<DarkSoulsStatId, LucideIcon> = {
  vitality: Heart,
  attunement: BookOpen,
  endurance: Gauge,
  strength: Swords,
  dexterity: Crosshair,
  resistance: Shield,
  intelligence: Brain,
  faith: Sun,
};

const SCALING_STAT_ROWS = [
  {
    stat: "STR",
    name: ["Força", "Strength", "Fuerza"] as const,
    role: [
      "Requisitos e dano físico com scaling de Força",
      "Requirements and physical damage from Strength scaling",
      "Requisitos y daño físico con escalado de Fuerza",
    ] as const,
  },
  {
    stat: "DEX",
    name: ["Destreza", "Dexterity", "Destreza"] as const,
    role: [
      "Requisitos, dano DEX e startup de algumas magias",
      "Requirements, DEX damage and startup of some spells",
      "Requisitos, daño DEX e inicio de algunos hechizos",
    ] as const,
  },
  {
    stat: "INT",
    name: ["Inteligência", "Intelligence", "Inteligencia"] as const,
    role: [
      "Feitiçaria, catalisadores e armas mágicas",
      "Sorcery, catalysts and magic weapons",
      "Hechicería, catalizadores y armas mágicas",
    ] as const,
  },
  {
    stat: "FAI",
    name: ["Fé", "Faith", "Fe"] as const,
    role: [
      "Milagres, talismãs, Divine e Occult",
      "Miracles, talismans, Divine and Occult",
      "Milagros, talismanes, Divine y Occult",
    ] as const,
  },
] as const;

export function DarkSoulsStatsGuide({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [selectedStatId, setSelectedStatId] = useState<DarkSoulsStatId>("strength");
  const [selectedBuildId, setSelectedBuildId] = useState("strength");
  const detailRef = useRef<HTMLElement | null>(null);

  const selectedStat = useMemo(
    () => DARK_SOULS_STATS.find((stat) => stat.id === selectedStatId) ?? DARK_SOULS_STATS[0],
    [selectedStatId],
  );
  const selectedBuild =
    BUILD_DIRECTIONS.find((build) => build.id === selectedBuildId) ?? BUILD_DIRECTIONS[0];
  if (!selectedStat || !selectedBuild) return null;
  const SelectedStatIcon = STAT_ICONS[selectedStat.id];

  const selectStat = (id: DarkSoulsStatId) => {
    setSelectedStatId(id);
    requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      detailRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-amber-900/35 bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.15),transparent_32%),linear-gradient(145deg,rgba(20,14,10,0.96),rgba(10,10,10,0.98))] p-6 shadow-2xl sm:p-8">
        <div
          className="absolute -right-16 -top-16 size-44 rounded-full bg-orange-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-700/35 bg-amber-950/35 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-amber-300">
              ÍMPAR Editorial · Guia 01
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-stone-400">
              Dark Souls Remastered
            </span>
          </div>
          <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-stone-50 sm:text-4xl">
            {copy(
              "Stats: tudo que você precisa saber",
              "Stats: everything you need to know",
              "Stats: todo lo que necesitas saber",
            )}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-300 sm:text-base">
            {copy(
              "Do primeiro level até uma build planejada: entenda cada atributo, soft caps, requisitos, scaling, duas mãos, Magic Adjustment, rotas de upgrade e por que nem toda letra S conta a história inteira.",
              "From your first level to a planned build: understand every stat, soft caps, requirements, scaling, two-handing, Magic Adjustment, upgrade paths and why even an S grade never tells the whole story.",
              "Desde tu primer nivel hasta una build planificada: entiende cada atributo, soft caps, requisitos, escalado, dos manos, Ajuste Mágico, rutas de mejora y por qué ni una letra S cuenta toda la historia.",
            )}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ConceptCard
          eyebrow={copy("CONCEITO 01", "CONCEPT 01", "CONCEPTO 01")}
          title={copy(
            "Requisito não é scaling",
            "Requirement is not scaling",
            "Requisito no es escalado",
          )}
          body={copy(
            "Os números de STR, DEX, INT e FAI mostram o mínimo necessário para usar corretamente a arma ou ferramenta. As letras mostram quanto determinado atributo pode contribuir para dano adicional.",
            "STR, DEX, INT and FAI numbers show the minimum needed to use a weapon or tool correctly. The letters describe how strongly a stat can contribute extra damage.",
            "Los números de STR, DEX, INT y FAI muestran el mínimo para usar correctamente un arma o herramienta. Las letras indican cuánto puede aportar un atributo al daño adicional.",
          )}
        />
        <ConceptCard
          eyebrow={copy("CONCEITO 02", "CONCEPT 02", "CONCEPTO 02")}
          title={copy(
            "Soft cap não é hard cap",
            "Soft cap is not a hard cap",
            "Soft cap no es hard cap",
          )}
          body={copy(
            "Depois de um soft cap você ainda pode ganhar efeito, mas cada ponto tende a render menos. Um hard cap é um limite real: por exemplo, END deixa de dar Stamina depois de 40, embora continue aumentando carga.",
            "After a soft cap you can still gain an effect, but each point tends to give less. A hard cap is a real limit: for example, END stops granting Stamina after 40 even though equip burden keeps rising.",
            "Después de un soft cap aún puedes ganar efecto, pero cada punto suele rendir menos. Un hard cap es un límite real: por ejemplo, END deja de dar aguante después de 40 aunque la carga siga aumentando.",
          )}
        />
        <ConceptCard
          eyebrow={copy("CONCEITO 03", "CONCEPT 03", "CONCEPTO 03")}
          title={copy("Duas mãos = 1,5× STR", "Two hands = 1.5× STR", "Dos manos = 1,5× STR")}
          body={copy(
            "Segurar uma arma com as duas mãos aumenta em 50% a Força usada para requisito e scaling. Por isso 18 STR cumpre um requisito de 26, e 27 STR alcança aproximadamente o soft cap físico de 40.",
            "Two-handing increases Strength used for requirements and scaling by 50%. That is why 18 STR satisfies a 26 requirement and 27 STR reaches roughly the 40 physical soft cap.",
            "Usar un arma a dos manos aumenta un 50% la Fuerza usada para requisitos y escalado. Por eso 18 STR cumple un requisito de 26 y 27 STR alcanza aproximadamente el soft cap físico de 40.",
          )}
        />
      </section>

      <section className="surface-panel overflow-hidden rounded-2xl">
        <div className="border-b border-border px-5 py-5 sm:px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-gold-strong" />
            <span className="section-kicker">
              {copy("LETRAS DE SCALING", "SCALING GRADES", "LETRAS DE ESCALADO")}
            </span>
          </div>
          <h3 className="mt-2 font-display text-2xl font-semibold">
            {copy(
              "S é melhor que A — mas a letra representa uma faixa",
              "S is better than A — but the letter represents a range",
              "S es mejor que A — pero la letra representa un rango",
            )}
          </h3>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
            {copy(
              "O jogo converte valores internos de scaling em S, A, B, C, D ou E. Duas armas com A ainda podem ter coeficientes diferentes; uma pode estar no começo da faixa e outra quase em S. A letra é uma leitura rápida, não uma porcentagem exata de dano.",
              "The game converts internal scaling values into S, A, B, C, D or E. Two A-grade weapons can still have different coefficients; one may sit at the start of the range and another almost at S. The letter is a quick read, not an exact damage percentage.",
              "El juego convierte valores internos de escalado en S, A, B, C, D o E. Dos armas con A aún pueden tener coeficientes distintos; una puede estar al inicio del rango y otra casi en S. La letra es una lectura rápida, no un porcentaje exacto de daño.",
            )}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4 lg:grid-cols-7">
          {SCALING_GRADES.map(({ grade, range }) => (
            <div
              key={grade}
              className="group bg-background px-4 py-5 text-center transition-colors hover:bg-amber-950/20"
            >
              <div
                className={cn(
                  "mx-auto grid size-12 place-items-center rounded-xl border text-xl font-black transition-transform group-hover:-translate-y-0.5",
                  grade === "S" || grade === "A"
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                    : grade === "—"
                      ? "border-border bg-muted/30 text-muted-foreground"
                      : "border-border bg-muted/20 text-foreground",
                )}
              >
                {grade}
              </div>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">{range}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-px bg-border lg:grid-cols-4">
          {SCALING_STAT_ROWS.map((row) => (
            <div key={row.stat} className="bg-background p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg border border-gold/25 bg-gold-soft/25 font-display text-sm font-bold text-gold-strong">
                  {row.stat}
                </span>
                <div>
                  <p className="font-semibold">{copy(row.name[0], row.name[1], row.name[2])}</p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    {copy(row.role[0], row.role[1], row.role[2])}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <span className="section-kicker">
            {copy("OS 8 ATRIBUTOS", "THE 8 STATS", "LOS 8 ATRIBUTOS")}
          </span>
          <h3 className="mt-2 font-display text-2xl font-semibold">
            {copy(
              "Escolha um atributo para abrir a explicação completa",
              "Choose a stat to open the full explanation",
              "Elige un atributo para abrir la explicación completa",
            )}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy(
              "Ao clicar, a página leva você diretamente ao painel detalhado — sem precisar procurar onde a informação mudou.",
              "When you click, the page takes you directly to the detailed panel so you never have to hunt for what changed.",
              "Al hacer clic, la página te lleva directamente al panel detallado para que no tengas que buscar dónde cambió la información.",
            )}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {DARK_SOULS_STATS.map((stat) => {
            const Icon = STAT_ICONS[stat.id];
            const active = stat.id === selectedStat.id;
            return (
              <button
                key={stat.id}
                type="button"
                aria-pressed={active}
                onClick={() => selectStat(stat.id)}
                className={cn(
                  "group rounded-xl border p-4 text-left transition-all duration-200",
                  active
                    ? "border-amber-500/45 bg-amber-950/20 shadow-[0_0_0_1px_rgba(217,119,6,0.08),0_14px_40px_rgba(0,0,0,0.18)]"
                    : "border-border bg-surface hover:-translate-y-0.5 hover:border-amber-700/35 hover:bg-amber-950/10",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-lg border",
                      active
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                        : "border-border bg-muted/30 text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="text-[0.65rem] font-bold tracking-[0.16em] text-muted-foreground">
                    {stat.abbreviation}
                  </span>
                </div>
                <p className="mt-3 font-semibold">{stat.name[locale]}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {stat.summary[locale]}
                </p>
              </button>
            );
          })}
        </div>

        <article
          ref={detailRef}
          tabIndex={-1}
          className="scroll-mt-24 overflow-hidden rounded-2xl border border-amber-900/25 bg-[linear-gradient(135deg,rgba(217,119,6,0.06),transparent_36%),hsl(var(--surface))] outline-none"
        >
          <div className="border-b border-border p-6 sm:p-7">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <SelectedStatIcon className="size-5" />
                </span>
                <div>
                  <span className="text-xs font-bold tracking-[0.16em] text-muted-foreground">
                    {selectedStat.abbreviation}
                  </span>
                  <h4 className="font-display text-2xl font-semibold">
                    {selectedStat.name[locale]}
                  </h4>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedStat.favors.map((item) => (
                  <span
                    key={item[locale]}
                    className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-semibold"
                  >
                    {item[locale]}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground">
              {selectedStat.summary[locale]}
            </p>
          </div>

          <div className="grid gap-px bg-border lg:grid-cols-2">
            <div className="bg-background p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-strong">
                {copy("Se você está começando", "If you are starting out", "Si estás empezando")}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {selectedStat.beginner[locale]}
              </p>
            </div>
            <div className="bg-background p-6 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-strong">
                {copy("Leitura avançada", "Advanced reading", "Lectura avanzada")}
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {selectedStat.advanced[locale]}
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:p-7 lg:grid-cols-[1fr_1.2fr]">
            <div className="space-y-5">
              <MiniList
                title={copy("O que afeta", "What it affects", "Qué afecta")}
                items={selectedStat.affects.map((item) => item[locale])}
                positive
              />
              <MiniList
                title={copy(
                  "O que não afeta diretamente",
                  "What it does not directly affect",
                  "Qué no afecta directamente",
                )}
                items={selectedStat.doesNotAffect.map((item) => item[locale])}
              />
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 size-4 shrink-0 text-gold-strong" />
                  <div>
                    <p className="text-sm font-semibold">
                      {copy("Na prática", "In practice", "En la práctica")}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {selectedStat.practicalTip[locale]}
                    </p>
                  </div>
                </div>
              </div>
              {selectedStat.caution && (
                <div className="rounded-xl border border-amber-700/30 bg-amber-950/15 p-4">
                  <div className="flex items-start gap-3">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-400" />
                    <p className="text-sm leading-6 text-muted-foreground">
                      {selectedStat.caution[locale]}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {copy(
                  "Soft caps, hard caps e marcos",
                  "Soft caps, hard caps and breakpoints",
                  "Soft caps, hard caps e hitos",
                )}
              </p>
              <div className="mt-3 space-y-3">
                {selectedStat.breakpoints.map((point) => (
                  <div
                    key={`${selectedStat.id}-${point.level}`}
                    className="rounded-xl border border-border bg-background p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="min-w-16 rounded-lg border border-amber-700/30 bg-amber-950/20 px-3 py-1.5 text-center font-display text-sm font-bold text-amber-400">
                        {point.level}
                      </span>
                      <p className="text-sm font-semibold">{point.label[locale]}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {point.description[locale]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="surface-panel overflow-hidden rounded-2xl">
        <div className="border-b border-border p-6 sm:p-7">
          <span className="section-kicker">
            {copy("ROTAS DE UPGRADE", "UPGRADE PATHS", "RUTAS DE MEJORA")}
          </span>
          <h3 className="mt-2 font-display text-2xl font-semibold">
            {copy(
              "Por que a letra de scaling muda quando você evolui a arma?",
              "Why does the scaling letter change when you upgrade a weapon?",
              "¿Por qué cambia la letra de escalado al mejorar un arma?",
            )}
          </h3>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
            {copy(
              "A rota muda dano base, tipos de dano e coeficientes. Não existe uma rota universalmente melhor: a distribuição do personagem e as defesas do inimigo importam.",
              "Upgrade paths change base damage, damage types and coefficients. There is no universally best path: your stat spread and the enemy's defenses matter.",
              "Las rutas cambian daño base, tipos de daño y coeficientes. No existe una ruta universalmente mejor: importan tu distribución y las defensas del enemigo.",
            )}
          </p>
        </div>
        <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {UPGRADE_PATH_NOTES.map((path) => (
            <div key={path.name} className="bg-background p-5">
              <p className="font-display font-semibold text-foreground">{path.name}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{path.text[locale]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ConceptCard
          eyebrow={copy("EXCEÇÃO IMPORTANTE", "IMPORTANT EXCEPTION", "EXCEPCIÓN IMPORTANTE")}
          title="Pyromancy Flame"
          body={copy(
            "A chama pode exibir scaling de INT na interface, mas INT e FAI não aumentam o Magic Adjustment usado pelas piromancias. Para aumentar a potência, evolua a Pyromancy Flame. ATT continua útil para abrir slots.",
            "The flame may display INT scaling in the interface, but INT and FAI do not increase the Magic Adjustment used by pyromancies. To raise power, upgrade the Pyromancy Flame. ATT still matters for slots.",
            "La llama puede mostrar escalado INT en la interfaz, pero INT y FAI no aumentan el Ajuste Mágico usado por las piromancias. Para aumentar la potencia, mejora la Pyromancy Flame. ATT sigue siendo útil para espacios.",
          )}
        />
        <ConceptCard
          eyebrow={copy("STAT RELACIONADO", "RELATED STAT", "STAT RELACIONADO")}
          title="Humanity"
          body={copy(
            "Humanity não é um dos oito atributos que você sobe no level up, mas funciona como stat enquanto está no contador. Até 10 Humanity aumenta Item Discovery e o bônus de dano de armas Chaos; Curse Resistance continua aumentando até 30.",
            "Humanity is not one of the eight attributes you level, but it acts as a stat while held in the counter. Up to 10 Humanity raises Item Discovery and Chaos weapon bonus damage; Curse Resistance continues increasing up to 30.",
            "Humanity no es uno de los ocho atributos que subes de nivel, pero funciona como stat mientras está en el contador. Hasta 10 aumenta Item Discovery y el bono de armas Chaos; Curse Resistance sigue aumentando hasta 30.",
          )}
        />
      </section>

      <section className="space-y-4">
        <div>
          <span className="section-kicker">
            {copy(
              "QUAL CAMINHO COMBINA COMIGO?",
              "WHICH PATH FITS ME?",
              "¿QUÉ CAMINO ENCAJA CONMIGO?",
            )}
          </span>
          <h3 className="mt-2 font-display text-2xl font-semibold">
            {copy(
              "Use a intenção da build para escolher onde investir",
              "Use your build goal to choose where to invest",
              "Usa el objetivo de tu build para elegir dónde invertir",
            )}
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BUILD_DIRECTIONS.map((build) => {
            const active = build.id === selectedBuild.id;
            return (
              <button
                key={build.id}
                type="button"
                onClick={() => setSelectedBuildId(build.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  active
                    ? "border-gold/45 bg-gold-soft/20"
                    : "border-border bg-surface hover:border-gold/30 hover:bg-muted/30",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{build.label[locale]}</p>
                  <ArrowRight
                    className={cn(
                      "size-4 transition-transform",
                      active && "translate-x-0.5 text-gold-strong",
                    )}
                  />
                </div>
                <p className="mt-2 text-xs font-bold tracking-[0.12em] text-muted-foreground">
                  {build.stats}
                </p>
              </button>
            );
          })}
        </div>
        <div className="rounded-2xl border border-gold/25 bg-gold-soft/10 p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-gold/30 bg-gold-soft/30 text-gold-strong">
              <Flame className="size-5" />
            </span>
            <div>
              <p className="font-display text-xl font-semibold">{selectedBuild.title[locale]}</p>
              <p className="mt-1 text-xs font-bold tracking-[0.14em] text-muted-foreground">
                {selectedBuild.stats}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                {selectedBuild.description[locale]}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs leading-6 text-muted-foreground">
        <strong className="text-foreground">
          {copy("Nota editorial:", "Editorial note:", "Nota editorial:")}
        </strong>{" "}
        {copy(
          "valores de soft cap descrevem retorno decrescente e podem variar conforme arma, ferramenta e rota de upgrade. Para dano real, compare Attack Rating, Magic Adjustment e o equipamento no seu personagem.",
          "soft-cap values describe diminishing returns and can vary by weapon, tool and upgrade path. For real damage, compare Attack Rating, Magic Adjustment and the actual equipment on your character.",
          "los valores de soft cap describen rendimientos decrecientes y pueden variar según arma, herramienta y ruta. Para daño real, compara Attack Rating, Ajuste Mágico y el equipo en tu personaje.",
        )}
      </div>
    </div>
  );
}

function ConceptCard({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <article className="surface-panel rounded-2xl p-5 sm:p-6">
      <span className="section-kicker">{eyebrow}</span>
      <h3 className="mt-2 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{body}</p>
    </article>
  );
}

function MiniList({
  title,
  items,
  positive = false,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-semibold",
              positive
                ? "border-gold/25 bg-gold-soft/20 text-foreground"
                : "border-border bg-muted/20 text-muted-foreground",
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
