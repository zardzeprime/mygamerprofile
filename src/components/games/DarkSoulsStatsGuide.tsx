import { useMemo, useState, type LucideIcon } from "react";
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
} from "lucide-react";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import {
  BUILD_DIRECTIONS,
  DARK_SOULS_STATS,
  SCALING_GRADES,
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
  { stat: "STR", name: ["Força", "Strength", "Fuerza"] as const, role: ["Dano físico e requisitos de armas pesadas", "Physical damage and heavy-weapon requirements", "Daño físico y requisitos de armas pesadas"] as const },
  { stat: "DEX", name: ["Destreza", "Dexterity", "Destreza"] as const, role: ["Dano físico de armas técnicas e requisitos", "Physical damage for technical weapons and requirements", "Daño físico de armas técnicas y requisitos"] as const },
  { stat: "INT", name: ["Inteligência", "Intelligence", "Inteligencia"] as const, role: ["Feitiçaria, catalisadores e armas mágicas", "Sorcery, catalysts and magic weapons", "Hechicería, catalizadores y armas mágicas"] as const },
  { stat: "FAI", name: ["Fé", "Faith", "Fe"] as const, role: ["Milagres, talismãs, Divine e Occult", "Miracles, talismans, Divine and Occult", "Milagros, talismanes, Divine y Occult"] as const },
] as const;

export function DarkSoulsStatsGuide({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [selectedStatId, setSelectedStatId] = useState<DarkSoulsStatId>("strength");
  const [selectedBuildId, setSelectedBuildId] = useState("strength");

  const selectedStat = useMemo(
    () => DARK_SOULS_STATS.find((stat) => stat.id === selectedStatId) ?? DARK_SOULS_STATS[0],
    [selectedStatId],
  );
  const selectedBuild = BUILD_DIRECTIONS.find((build) => build.id === selectedBuildId) ?? BUILD_DIRECTIONS[0];
  const SelectedStatIcon = STAT_ICONS[selectedStat.id];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-amber-900/35 bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.15),transparent_32%),linear-gradient(145deg,rgba(20,14,10,0.96),rgba(10,10,10,0.98))] p-6 shadow-2xl sm:p-8">
        <div className="absolute -right-16 -top-16 size-44 rounded-full bg-orange-500/10 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-700/35 bg-amber-950/35 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-amber-300">
              MGP Editorial · v0.1.2B
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-stone-400">
              Dark Souls Remastered
            </span>
          </div>
          <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-stone-50 sm:text-4xl">
            {copy("Atributos, scaling e a base de uma build", "Stats, scaling and the foundation of a build", "Atributos, escalado y la base de una build")}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-300 sm:text-base">
            {copy(
              "Antes de copiar uma build pronta, entenda por que ela funciona. Este guia mostra o que cada atributo realmente muda, como ler as letras de scaling e onde os retornos começam a diminuir.",
              "Before copying a finished build, understand why it works. This guide shows what every stat changes, how to read scaling letters and where returns begin to diminish.",
              "Antes de copiar una build terminada, entiende por qué funciona. Esta guía muestra qué cambia cada atributo, cómo leer las letras de escalado y dónde empiezan a disminuir los rendimientos.",
            )}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ConceptCard
          eyebrow={copy("PRIMEIRO CONCEITO", "FIRST CONCEPT", "PRIMER CONCEPTO")}
          title={copy("Requisito não é scaling", "Requirement is not scaling", "Requisito no es escalado")}
          body={copy(
            "Os números de STR, DEX, INT e FAI na arma dizem o mínimo necessário para usá-la corretamente. As letras ao lado dizem quanto aquela arma transforma seus atributos em dano adicional.",
            "The STR, DEX, INT and FAI numbers on a weapon are minimum requirements. The letters beside them describe how strongly that weapon converts your stats into extra damage.",
            "Los números de STR, DEX, INT y FAI del arma son requisitos mínimos. Las letras indican cuánto convierte esa arma tus atributos en daño adicional.",
          )}
        />
        <ConceptCard
          eyebrow={copy("REGRA DE OURO", "GOLDEN RULE", "REGLA DE ORO")}
          title={copy("Duas mãos = 1,5× Força efetiva", "Two hands = 1.5× effective Strength", "Dos manos = 1,5× Fuerza efectiva")}
          body={copy(
            "Segurar uma arma com as duas mãos aumenta em 50% a Força usada para requisito e scaling. Por isso 18 STR consegue atender um requisito de 26, e 27 STR alcança 40 de Força efetiva.",
            "Two-handing increases the Strength used for requirements and scaling by 50%. That is why 18 STR can satisfy a 26 requirement, and 27 STR reaches 40 effective Strength.",
            "Usar un arma a dos manos aumenta un 50% la Fuerza usada para requisitos y escalado. Por eso 18 STR puede cumplir un requisito de 26, y 27 STR llega a 40 de Fuerza efectiva.",
          )}
        />
      </section>

      <section className="surface-panel overflow-hidden rounded-2xl">
        <div className="border-b border-border px-5 py-5 sm:px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-gold-strong" />
            <span className="section-kicker">{copy("LETRAS DE SCALING", "SCALING GRADES", "LETRAS DE ESCALADO")}</span>
          </div>
          <h3 className="mt-2 font-display text-2xl font-semibold">
            {copy("S é melhor que A — mas a letra é só uma faixa", "S is better than A — but the letter is only a range", "S es mejor que A — pero la letra solo representa un rango")}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy(
              "O jogo esconde o valor interno e mostra S, A, B, C, D ou E. Duas armas com A podem ter scalings diferentes; uma pode estar perto de 100 e outra perto de 139. Portanto, a letra serve para leitura rápida, não como porcentagem exata.",
              "The game hides the internal value and displays S, A, B, C, D or E. Two A-grade weapons can still scale differently; one may sit near 100 and another near 139. The letter is a quick guide, not an exact percentage.",
              "El juego oculta el valor interno y muestra S, A, B, C, D o E. Dos armas con A todavía pueden escalar distinto; una puede estar cerca de 100 y otra de 139. La letra es una guía rápida, no un porcentaje exacto.",
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4 lg:grid-cols-7">
          {SCALING_GRADES.map(({ grade, range }) => (
            <div key={grade} className="group bg-background px-4 py-5 text-center transition-colors hover:bg-amber-950/20">
              <div className={cn(
                "mx-auto grid size-12 place-items-center rounded-xl border text-xl font-black transition-transform group-hover:-translate-y-0.5",
                grade === "S" || grade === "A"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                  : grade === "—"
                    ? "border-border bg-muted/30 text-muted-foreground"
                    : "border-border bg-muted/20 text-foreground",
              )}>
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
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{copy(row.role[0], row.role[1], row.role[2])}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <span className="section-kicker">{copy("OS 8 ATRIBUTOS", "THE 8 STATS", "LOS 8 ATRIBUTOS")}</span>
          <h3 className="mt-2 font-display text-2xl font-semibold">
            {copy("Clique em um atributo para entender onde investir", "Pick a stat to understand where to invest", "Elige un atributo para entender dónde invertir")}
          </h3>
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
                onClick={() => setSelectedStatId(stat.id)}
                className={cn(
                  "group rounded-xl border p-4 text-left transition-all duration-200",
                  active
                    ? "border-amber-500/45 bg-amber-950/20 shadow-[0_0_0_1px_rgba(217,119,6,0.08),0_14px_40px_rgba(0,0,0,0.18)]"
                    : "border-border bg-surface hover:-translate-y-0.5 hover:border-amber-700/35 hover:bg-amber-950/10",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={cn("grid size-9 place-items-center rounded-lg border", active ? "border-amber-500/30 bg-amber-500/10 text-amber-400" : "border-border bg-muted/30 text-muted-foreground")}>
                    <Icon className="size-4" />
                  </span>
                  <span className="text-[0.65rem] font-bold tracking-[0.16em] text-muted-foreground">{stat.abbreviation}</span>
                </div>
                <p className="mt-3 font-semibold">{stat.name[locale]}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{stat.summary[locale]}</p>
              </button>
            );
          })}
        </div>

        <article className="overflow-hidden rounded-2xl border border-amber-900/25 bg-[linear-gradient(135deg,rgba(217,119,6,0.06),transparent_36%),hsl(var(--surface))]">
          <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="border-b border-border p-6 lg:border-b-0 lg:border-r sm:p-7">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <SelectedStatIcon className="size-5" />
                </span>
                <div>
                  <span className="text-xs font-bold tracking-[0.16em] text-muted-foreground">{selectedStat.abbreviation}</span>
                  <h4 className="font-display text-2xl font-semibold">{selectedStat.name[locale]}</h4>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{selectedStat.summary[locale]}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedStat.favors.map((item) => (
                  <span key={item[locale]} className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-semibold">
                    {item[locale]}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-5 p-6 sm:p-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{copy("Soft caps / marcos", "Soft caps / breakpoints", "Soft caps / hitos")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedStat.softCaps.map((cap) => (
                    <span key={cap} className="rounded-lg border border-amber-700/30 bg-amber-950/20 px-3 py-1.5 font-display text-sm font-bold text-amber-400">
                      {cap}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{selectedStat.capNote[locale]}</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 size-4 shrink-0 text-gold-strong" />
                  <div>
                    <p className="text-sm font-semibold">{copy("Na prática", "In practice", "En la práctica")}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{selectedStat.practicalTip[locale]}</p>
                  </div>
                </div>
              </div>

              {selectedStat.caution && (
                <div className="rounded-xl border border-orange-700/30 bg-orange-950/15 p-4">
                  <div className="flex items-start gap-3">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-orange-400" />
                    <div>
                      <p className="text-sm font-semibold text-orange-300">{copy("Cuidado com o investimento", "Investment warning", "Cuidado con la inversión")}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{selectedStat.caution[locale]}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-panel rounded-2xl p-6 sm:p-7">
          <span className="section-kicker">{copy("EXEMPLO DE LEITURA", "READING EXAMPLE", "EJEMPLO DE LECTURA")}</span>
          <h3 className="mt-2 font-display text-2xl font-semibold">{copy("Uma arma hipotética com B em STR e D em DEX", "A hypothetical weapon with B STR and D DEX", "Un arma hipotética con B en STR y D en DEX")}</h3>
          <div className="mt-5 grid grid-cols-4 gap-2">
            <ScaleCell label="STR" grade="B" strong />
            <ScaleCell label="DEX" grade="D" />
            <ScaleCell label="INT" grade="—" />
            <ScaleCell label="FAI" grade="—" />
          </div>
          <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
            <strong className="text-foreground">{copy("Leitura:", "Reading:", "Lectura:")}</strong>{" "}
            {copy(
              "a arma favorece claramente Força. Destreza ainda contribui, mas em uma faixa menor. Se você quer extrair dano dessa arma, STR tende a render mais por ponto até os principais soft caps.",
              "the weapon clearly favors Strength. Dexterity still contributes, but in a smaller range. If you want to extract damage from this weapon, STR will generally return more per point until its major soft caps.",
              "el arma favorece claramente Fuerza. Destreza todavía contribuye, pero en un rango menor. Si quieres sacar daño de esta arma, STR suele rendir más por punto hasta sus principales soft caps.",
            )}
          </div>
        </article>

        <article className="surface-panel rounded-2xl p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <Flame className="size-4 text-orange-400" />
            <span className="section-kicker">{copy("PIROMANCIA", "PYROMANCY", "PIROMANCIA")}</span>
          </div>
          <h3 className="mt-2 font-display text-2xl font-semibold">{copy("A exceção que confunde iniciantes", "The exception that confuses beginners", "La excepción que confunde a principiantes")}</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {copy(
              "Piromancias não ficam mais fortes ao subir INT ou FAI. O dano vem do nível de reforço da Pyromancy Flame. A chama até pode exibir scaling de INT em certas telas, mas isso não aumenta o Magic Adjustment usado pelas piromancias.",
              "Pyromancies do not become stronger by leveling INT or FAI. Their damage comes from reinforcing the Pyromancy Flame. The flame may display INT scaling in some views, but it does not raise the Magic Adjustment used by pyromancies.",
              "Las piromancias no se vuelven más fuertes al subir INT o FAI. Su daño viene de reforzar la Pyromancy Flame. La llama puede mostrar escalado de INT, pero eso no aumenta el Ajuste Mágico usado por las piromancias.",
            )}
          </p>
        </article>
      </section>

      <section className="surface-panel rounded-2xl p-6 sm:p-7">
        <span className="section-kicker">{copy("ROTAS DE UPGRADE", "UPGRADE PATHS", "RUTAS DE MEJORA")}</span>
        <h3 className="mt-2 font-display text-2xl font-semibold">{copy("Por que a letra da sua arma mudou?", "Why did your weapon's letter change?", "¿Por qué cambió la letra de tu arma?")}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {copy(
            "A rota de reforço altera dano base e scalings. Antes de evoluir uma arma, confirme se a rota combina com os atributos da sua build.",
            "An upgrade path changes base damage and scaling. Before committing to a weapon path, confirm that it matches your build's stats.",
            "La ruta de mejora cambia el daño base y los escalados. Antes de comprometer un arma, confirma que la ruta combina con los atributos de tu build.",
          )}
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <UpgradeCard title="Normal / Crystal" text={copy("Mantêm o foco principal em scaling físico de STR/DEX. Crystal sacrifica reparabilidade em troca de mais poder.", "Keep the main focus on physical STR/DEX scaling. Crystal trades repairability for more power.", "Mantienen el foco en escalado físico STR/DEX. Crystal sacrifica reparabilidad a cambio de más poder.")} />
          <UpgradeCard title="Raw" text={copy("Aumenta dano base e reduz a importância do scaling. Costuma favorecer personagens com atributos ofensivos ainda baixos.", "Raises base damage and reduces the importance of scaling. It tends to favor characters with low offensive stats.", "Aumenta el daño base y reduce la importancia del escalado. Suele favorecer personajes con atributos ofensivos bajos.")} />
          <UpgradeCard title="Magic / Enchanted" text={copy("Adicionam dano mágico e scaling de INT, com Enchanted empurrando ainda mais a arma para Inteligência.", "Add magic damage and INT scaling, with Enchanted pushing the weapon even further toward Intelligence.", "Añaden daño mágico y escalado INT; Enchanted empuja todavía más el arma hacia Inteligencia.")} />
          <UpgradeCard title="Divine / Occult" text={copy("Adicionam dano mágico e scaling de FAI. Occult enfatiza ainda mais Fé em comparação com Divine.", "Add magic damage and FAI scaling. Occult emphasizes Faith even more than Divine.", "Añaden daño mágico y escalado FAI. Occult enfatiza aún más la Fe que Divine.")} />
          <UpgradeCard title="Fire / Lightning" text={copy("Removem os bônus normais de atributos. O dano passa a depender muito mais da arma e do nível de reforço do que de STR/DEX/INT/FAI.", "Remove normal stat bonuses. Damage depends far more on the weapon and upgrade level than on STR/DEX/INT/FAI.", "Eliminan las bonificaciones normales de atributos. El daño depende mucho más del arma y su mejora que de STR/DEX/INT/FAI.")} />
          <UpgradeCard title="Chaos" text={copy("Não usa o scaling normal de STR/DEX/INT/FAI, mas recebe bônus da Humanidade carregada, atingindo o principal limite em 10 Humanity.", "Does not use normal STR/DEX/INT/FAI scaling, but gains a bonus from held Humanity, reaching its main limit at 10 Humanity.", "No usa el escalado normal STR/DEX/INT/FAI, pero recibe bonificación de la Humanidad cargada, con su límite principal en 10 Humanity.")} />
        </div>
      </section>

      <section className="surface-panel rounded-2xl p-6 sm:p-7">
        <span className="section-kicker">{copy("QUAL CAMINHO COMBINA COMIGO?", "WHICH PATH FITS ME?", "¿QUÉ CAMINO ME CONVIENE?")}</span>
        <div className="mt-4 flex flex-wrap gap-2">
          {BUILD_DIRECTIONS.map((build) => {
            const active = build.id === selectedBuild.id;
            return (
              <button
                key={build.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedBuildId(build.id)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-xs font-semibold transition-all",
                  active
                    ? "border-amber-500/45 bg-amber-500/10 text-amber-300"
                    : "border-border bg-muted/20 text-muted-foreground hover:border-amber-700/35 hover:text-foreground",
                )}
              >
                {build.label[locale]}
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl border border-border bg-muted/20 p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-xl font-semibold">{selectedBuild.title[locale]}</p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{selectedBuild.note[locale]}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {selectedBuild.priorities.map((priority, index) => (
                <div key={priority} className="flex items-center gap-2">
                  <span className={cn("rounded-lg border px-3 py-2 text-sm font-bold", index === 0 ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-border bg-background")}>{priority}</span>
                  {index < selectedBuild.priorities.length - 1 && <ArrowRight className="size-3 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="rounded-xl border border-border bg-muted/20 px-5 py-4 text-xs leading-5 text-muted-foreground">
        {copy(
          "Nota editorial: soft caps são pontos de retorno decrescente, não travas absolutas. Scaling depende também da arma, do nível de reforço e da rota escolhida; letras iguais podem esconder valores internos diferentes.",
          "Editorial note: soft caps are diminishing-return points, not absolute locks. Scaling also depends on weapon, reinforcement level and upgrade path; identical letters can hide different internal values.",
          "Nota editorial: los soft caps son puntos de rendimiento decreciente, no límites absolutos. El escalado también depende del arma, su nivel de mejora y la ruta elegida; letras iguales pueden ocultar valores internos distintos.",
        )}
      </footer>
    </div>
  );
}

function ConceptCard({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <article className="surface-panel rounded-2xl p-5 sm:p-6">
      <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-gold-strong">{eyebrow}</span>
      <h3 className="mt-2 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </article>
  );
}

function ScaleCell({ label, grade, strong = false }: { label: string; grade: string; strong?: boolean }) {
  return (
    <div className={cn("rounded-xl border p-3 text-center", strong ? "border-amber-500/35 bg-amber-500/10" : "border-border bg-muted/20")}>
      <p className="text-[0.65rem] font-bold tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-display text-2xl font-black", strong ? "text-amber-400" : "text-foreground")}>{grade}</p>
    </div>
  );
}

function UpgradeCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:border-amber-700/30 hover:bg-amber-950/10">
      <p className="font-semibold">{title}</p>
      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{text}</p>
    </article>
  );
}
