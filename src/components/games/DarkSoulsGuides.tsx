import { useRef, useState } from "react";
import {
  BadgeCheck,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Compass,
  ExternalLink,
  Flame,
  Gem,
  Library,
  Shield,
  Swords,
  UsersRound,
} from "lucide-react";

import { DarkSoulsStatsGuide } from "@/components/games/DarkSoulsStatsGuide";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

type QuickGuide = {
  id: string;
  icon: typeof BookOpen;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  points: Record<Locale, string[]>;
  sourceUrl: string;
};

const QUICK_GUIDES: QuickGuide[] = [
  {
    id: "upgrades",
    icon: Gem,
    title: {
      "pt-BR": "Upgrades, Embers e ferreiros",
      en: "Upgrades, Embers and blacksmiths",
      es: "Mejoras, Embers y herreros",
    },
    description: {
      "pt-BR": "Como as rotas Normal, Raw, Divine, Occult, Magic, Enchanted, Fire, Chaos, Lightning e Crystal se conectam.",
      en: "How Normal, Raw, Divine, Occult, Magic, Enchanted, Fire, Chaos, Lightning and Crystal paths connect.",
      es: "Cómo se conectan las rutas Normal, Raw, Divine, Occult, Magic, Enchanted, Fire, Chaos, Lightning y Crystal.",
    },
    points: {
      "pt-BR": [
        "Normal chega a +15 com Large Ember e Very Large Ember entregues a Andre.",
        "Rickert cuida da rota Magic/Enchanted; Vamos da rota Fire/Chaos; o Giant Blacksmith de Lightning/Crystal e armas de boss.",
        "Armas especiais, de demônio, dragão e boss normalmente seguem materiais e limites próprios, em geral até +5.",
      ],
      en: [
        "Normal reaches +15 after giving the Large Ember and Very Large Ember to Andre.",
        "Rickert handles Magic/Enchanted; Vamos Fire/Chaos; the Giant Blacksmith Lightning/Crystal and boss weapons.",
        "Special, demon, dragon and boss weapons generally follow their own materials and +5-style limits.",
      ],
      es: [
        "Normal llega a +15 entregando Large Ember y Very Large Ember a Andre.",
        "Rickert gestiona Magic/Enchanted; Vamos Fire/Chaos; Giant Blacksmith Lightning/Crystal y armas de jefe.",
        "Las armas especiales, de demonio, dragón y jefe suelen seguir materiales y límites propios, normalmente hasta +5.",
      ],
    },
    sourceUrl: "https://darksouls.wikidot.com/upgrade",
  },
  {
    id: "humanity",
    icon: Flame,
    title: {
      "pt-BR": "Humanity, fogueiras e Estus",
      en: "Humanity, bonfires and Estus",
      es: "Humanity, hogueras y Estus",
    },
    description: {
      "pt-BR": "O ciclo que conecta forma humana, kindling, Estus e parte do multiplayer.",
      en: "The loop connecting human form, kindling, Estus and part of multiplayer.",
      es: "El ciclo que conecta forma humana, kindling, Estus y parte del multijugador.",
    },
    points: {
      "pt-BR": [
        "Humanity pode reverter Hollowing e é usada para fazer Kindle em fogueiras.",
        "Cada nível de Kindling adiciona 5 usos de Estus; com Rite of Kindling uma fogueira pode chegar a 20.",
        "O nível de Kindling da fogueira permanece mesmo em NG+.",
      ],
      en: [
        "Humanity can reverse Hollowing and is spent to Kindle bonfires.",
        "Each Kindling level adds 5 Estus uses; with the Rite of Kindling a bonfire can reach 20.",
        "Bonfire Kindling level persists into NG+.",
      ],
      es: [
        "Humanity puede revertir Hollowing y se usa para Kindle en las hogueras.",
        "Cada nivel de Kindling añade 5 usos de Estus; con Rite of Kindling una hoguera puede llegar a 20.",
        "El nivel de Kindling permanece incluso en NG+.",
      ],
    },
    sourceUrl: "https://darksouls.wikidot.com/bonfires",
  },
  {
    id: "covenants",
    icon: UsersRound,
    title: {
      "pt-BR": "Covenants, ranks e consequências",
      en: "Covenants, ranks and consequences",
      es: "Covenants, rangos y consecuencias",
    },
    description: {
      "pt-BR": "As nove facções, recompensas, oferendas e o que muda ao abandonar ou quebrar um pacto.",
      en: "The nine factions, rewards, offerings and what changes when leaving or breaking a covenant.",
      es: "Las nueve facciones, recompensas, ofrendas y lo que cambia al abandonar o romper un pacto.",
    },
    points: {
      "pt-BR": [
        "Covenants afetam PvE, co-op, invasões e recompensas específicas.",
        "Rank costuma depender de oferendas próprias do pacto; sair pode reduzir progresso acumulado.",
        "Algumas quebras contam como Sin e podem mudar interações online ou com NPCs.",
      ],
      en: [
        "Covenants affect PvE, co-op, invasions and specific rewards.",
        "Rank commonly depends on covenant-specific offerings; leaving can reduce accumulated progress.",
        "Some betrayals count as Sin and may affect online or NPC interactions.",
      ],
      es: [
        "Los Covenants afectan PvE, cooperativo, invasiones y recompensas específicas.",
        "El rango suele depender de ofrendas propias; abandonar puede reducir el progreso acumulado.",
        "Algunas traiciones cuentan como Sin y pueden afectar interacciones online o con NPCs.",
      ],
    },
    sourceUrl: "https://darksouls.wikidot.com/covenants",
  },
  {
    id: "combat",
    icon: Shield,
    title: {
      "pt-BR": "Poise, stamina, equip load e defesa",
      en: "Poise, stamina, equip load and defense",
      es: "Poise, stamina, carga y defensa",
    },
    description: {
      "pt-BR": "Como sobrevivência e mobilidade mudam quando você troca armadura, escudo e peso da build.",
      en: "How survivability and mobility change as armor, shields and build weight change.",
      es: "Cómo cambian supervivencia y movilidad al modificar armadura, escudo y peso de la build.",
    },
    points: {
      "pt-BR": [
        "Equip load define a velocidade do roll e faz anéis como Havel's Ring e Ring of Favor terem grande impacto.",
        "Poise permite absorver certos impactos sem interrupção, mas não substitui defesa e posicionamento.",
        "Stability do escudo afeta quanto de stamina é gasto ao bloquear.",
      ],
      en: [
        "Equip load defines roll behavior and makes rings such as Havel's Ring and Ring of Favor highly impactful.",
        "Poise lets you absorb some hits without interruption but does not replace defense and positioning.",
        "Shield stability affects how much stamina blocking consumes.",
      ],
      es: [
        "La carga determina el roll y hace que anillos como Havel's Ring y Ring of Favor sean muy importantes.",
        "Poise permite soportar ciertos golpes sin interrupción, pero no sustituye defensa y posicionamiento.",
        "La estabilidad del escudo afecta cuánto stamina consume bloquear.",
      ],
    },
    sourceUrl: "https://darksouls.wikidot.com/stats",
  },
  {
    id: "dlc",
    icon: Compass,
    title: {
      "pt-BR": "Artorias of the Abyss e rota de endgame",
      en: "Artorias of the Abyss and endgame route",
      es: "Artorias of the Abyss y ruta de endgame",
    },
    description: {
      "pt-BR": "Como liberar Oolacile sem perder o fio da campanha principal.",
      en: "How to unlock Oolacile without losing track of the main campaign.",
      es: "Cómo desbloquear Oolacile sin perder el hilo de la campaña principal.",
    },
    points: {
      "pt-BR": [
        "O acesso envolve Dusk of Oolacile e o Broken Pendant obtido de um Crystal Golem em Duke's Archives.",
        "O portal do DLC aparece na área de Darkroot Basin associada ao encontro com Dusk.",
        "Artorias, Kalameet e Manus são opcionais para concluir o jogo base, mas formam o núcleo do conteúdo adicional.",
      ],
      en: [
        "Access involves Dusk of Oolacile and the Broken Pendant obtained from a Crystal Golem in Duke's Archives.",
        "The DLC portal appears in the Darkroot Basin area tied to Dusk.",
        "Artorias, Kalameet and Manus are optional for the base-game ending but define the expansion's core.",
      ],
      es: [
        "El acceso involucra a Dusk of Oolacile y el Broken Pendant obtenido de un Crystal Golem en Duke's Archives.",
        "El portal del DLC aparece en la zona de Darkroot Basin vinculada a Dusk.",
        "Artorias, Kalameet y Manus son opcionales para terminar el juego base, pero forman el núcleo del contenido adicional.",
      ],
    },
    sourceUrl: "https://darksouls.wikidot.com/broken-pendant",
  },
];

export function DarkSoulsGuides({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [statsOpen, setStatsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const toggleStats = () => {
    const willOpen = !statsOpen;
    setStatsOpen(willOpen);
    if (willOpen) {
      requestAnimationFrame(() => {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        contentRef.current?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    }
  };

  return (
    <div className="space-y-6">
      <section className="surface-panel rounded-2xl p-6 sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <Library className="size-4 text-gold-strong" />
              <span className="section-kicker">
                {copy("BIBLIOTECA DE GUIAS", "GUIDE LIBRARY", "BIBLIOTECA DE GUÍAS")}
              </span>
            </div>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              {copy(
                "Lordran: sistemas, progressão e builds",
                "Lordran: systems, progression and builds",
                "Lordran: sistemas, progresión y builds",
              )}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {copy(
                "A biblioteca agora cobre atributos, upgrades, Humanity, Covenants, combate e acesso ao DLC. O texto é editorial do ÍMPAR e as fontes de referência ficam visíveis.",
                "The library now covers stats, upgrades, Humanity, Covenants, combat and DLC access. Copy is ÍMPAR editorial content with visible reference sources.",
                "La biblioteca ahora cubre atributos, mejoras, Humanity, Covenants, combate y acceso al DLC. El texto es editorial de ÍMPAR con fuentes visibles.",
              )}
            </p>
          </div>
          <div className="rounded-full border border-gold/25 bg-gold-soft/20 px-3 py-1.5 text-xs font-bold text-gold-strong">
            {QUICK_GUIDES.length + 1} {copy("guias", "guides", "guías")}
          </div>
        </div>
      </section>

      <article
        className={cn(
          "overflow-hidden rounded-2xl border transition-colors",
          statsOpen
            ? "border-amber-600/35 bg-amber-950/10"
            : "border-border bg-surface hover:border-amber-700/30",
        )}
      >
        <button
          type="button"
          onClick={toggleStats}
          aria-expanded={statsOpen}
          aria-controls="dark-souls-guide-stats"
          className="group flex w-full items-center gap-4 p-5 text-left sm:p-6"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-amber-600/30 bg-amber-500/10 text-amber-400">
            <Swords className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-amber-400">
                {copy("GUIA PRINCIPAL", "CORE GUIDE", "GUÍA PRINCIPAL")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-700/25 bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-emerald-400">
                <BadgeCheck className="size-3" />
                {copy("Revisado", "Reviewed", "Revisado")}
              </span>
            </div>
            <h3 className="mt-1 font-display text-xl font-semibold sm:text-2xl">
              {copy(
                "Stats: tudo que você precisa saber",
                "Stats: everything you need to know",
                "Stats: todo lo que necesitas saber",
              )}
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {copy(
                "Os oito atributos, soft caps, scaling S–E, duas mãos, Magic Adjustment, Humanity e rotas de upgrade — do básico ao avançado.",
                "All eight stats, soft caps, S–E scaling, two-handing, Magic Adjustment, Humanity and upgrade paths—from basics to advanced concepts.",
                "Los ocho atributos, soft caps, escalado S–E, dos manos, Ajuste Mágico, Humanity y rutas de mejora.",
              )}
            </p>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-muted/20 text-muted-foreground transition-colors group-hover:border-amber-700/30 group-hover:text-amber-400">
            {statsOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </span>
        </button>

        {statsOpen ? (
          <div
            ref={contentRef}
            id="dark-souls-guide-stats"
            className="scroll-mt-24 border-t border-border px-4 py-6 sm:px-6 sm:py-8"
          >
            <DarkSoulsStatsGuide locale={locale} />
          </div>
        ) : null}
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        {QUICK_GUIDES.map((guide) => {
          const Icon = guide.icon;
          return (
            <article
              key={guide.id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-lift sm:p-6"
            >
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-gold/25 bg-gold-soft/30 text-gold-strong">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {guide.title[locale]}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {guide.description[locale]}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2">
                {guide.points[locale].map((point) => (
                  <li key={point} className="flex gap-2 text-xs leading-5 text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-strong" />
                    {point}
                  </li>
                ))}
              </ul>

              <a
                href={guide.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-gold-strong hover:underline"
              >
                {copy("Fonte de referência", "Reference source", "Fuente de referencia")}
                <ExternalLink className="size-3" />
              </a>
            </article>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-muted/15 p-4 text-xs leading-5 text-muted-foreground">
        {copy(
          "Conteúdo editorial ÍMPAR. Mecânicas são checadas contra documentação comunitária consolidada e o compêndio de itens mantém a procedência dos assets exibidos no beta.",
          "ÍMPAR editorial content. Mechanics are checked against established community documentation and the item compendium keeps provenance for assets shown during beta.",
          "Contenido editorial ÍMPAR. Las mecánicas se contrastan con documentación comunitaria consolidada y el compendio mantiene la procedencia de los assets usados en beta.",
        )}
      </div>
    </div>
  );
}
