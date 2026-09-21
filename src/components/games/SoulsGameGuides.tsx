import { BookOpen, Compass, Flame, Gem, Shield, Sparkles, Swords, WandSparkles } from "lucide-react";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

type SoulsGameSlug = "dark-souls-iii" | "elden-ring";

type GuideEntry = {
  icon: typeof BookOpen;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  points: Record<Locale, string[]>;
};

const DS3_GUIDES: GuideEntry[] = [
  {
    icon: Flame,
    title: { "pt-BR": "Estus, fogueira e progressão", en: "Estus, bonfires and progression", es: "Estus, hogueras y progresión" },
    description: { "pt-BR": "Os sistemas básicos que controlam cura, checkpoints e força da Estus Flask.", en: "The core systems that govern healing, checkpoints and Estus Flask strength.", es: "Los sistemas básicos que gobiernan la curación, los puntos de control y la fuerza del Frasco de Estus." },
    points: {
      "pt-BR": ["Estus Shards aumentam o número total de usos.", "Undead Bone Shards aumentam a potência da Estus na Firelink Shrine.", "Alocar usos entre Estus e Ashen Estus faz parte da construção da build."],
      en: ["Estus Shards increase the total number of uses.", "Undead Bone Shards increase Estus strength at Firelink Shrine.", "Splitting charges between Estus and Ashen Estus is part of build planning."],
      es: ["Los Estus Shards aumentan el número total de usos.", "Los Undead Bone Shards aumentan la potencia del Estus en Firelink Shrine.", "Distribuir cargas entre Estus y Ashen Estus forma parte de la build."],
    },
  },
  {
    icon: Gem,
    title: { "pt-BR": "Infusões, scaling e atributos", en: "Infusions, scaling and stats", es: "Infusiones, escalado y atributos" },
    description: { "pt-BR": "Como armas mudam de afinidade e aproveitam Strength, Dexterity, Intelligence e Faith.", en: "How weapons change affinity and scale from Strength, Dexterity, Intelligence and Faith.", es: "Cómo las armas cambian de afinidad y escalan con Strength, Dexterity, Intelligence y Faith." },
    points: {
      "pt-BR": ["Heavy favorece Strength; Sharp favorece Dexterity.", "Refined divide scaling entre Strength e Dexterity.", "Crystal, Lightning, Chaos e Dark servem builds híbridas/especializadas diferentes."],
      en: ["Heavy favors Strength; Sharp favors Dexterity.", "Refined splits scaling between Strength and Dexterity.", "Crystal, Lightning, Chaos and Dark support different hybrid/specialized builds."],
      es: ["Heavy favorece Strength; Sharp favorece Dexterity.", "Refined reparte el escalado entre Strength y Dexterity.", "Crystal, Lightning, Chaos y Dark sirven a distintas builds híbridas/especializadas."],
    },
  },
  {
    icon: Shield,
    title: { "pt-BR": "Defesa, stamina e equip load", en: "Defense, stamina and equip load", es: "Defensa, stamina y carga" },
    description: { "pt-BR": "O trio que define quantos erros você suporta e quão móvel sua build consegue ser.", en: "The trio that defines how many mistakes you can absorb and how mobile your build can stay.", es: "El trío que define cuántos errores puedes soportar y qué tan móvil puede ser tu build." },
    points: {
      "pt-BR": ["Vigor aumenta HP e costuma ser prioridade em builds novas.", "Endurance controla stamina e também ajuda no gerenciamento de equipamento.", "Equip load abaixo de 70% evita o fat roll padrão."],
      en: ["Vigor increases HP and is commonly an early priority.", "Endurance controls stamina and helps equipment management.", "Keeping equip load below 70% avoids the standard fat roll."],
      es: ["Vigor aumenta HP y suele ser prioridad al inicio.", "Endurance controla stamina y ayuda a gestionar el equipo.", "Mantener la carga por debajo de 70% evita el fat roll estándar."],
    },
  },
  {
    icon: Compass,
    title: { "pt-BR": "DLCs e rota de endgame", en: "DLC and endgame route", es: "DLC y ruta de endgame" },
    description: { "pt-BR": "Onde Ashes of Ariandel e The Ringed City entram na jornada sem bagunçar a progressão.", en: "Where Ashes of Ariandel and The Ringed City fit into the journey without scrambling progression.", es: "Dónde encajan Ashes of Ariandel y The Ringed City sin romper la progresión." },
    points: {
      "pt-BR": ["Ashes of Ariandel é acessada pela Cathedral of the Deep.", "The Ringed City pode ser acessada no fim de Ariandel ou próximo ao Kiln of the First Flame.", "Os chefes de DLC estão entre os encontros mais exigentes do jogo."],
      en: ["Ashes of Ariandel is entered from the Cathedral of the Deep.", "The Ringed City can be entered after Ariandel or near the Kiln of the First Flame.", "DLC bosses are among the game's most demanding encounters."],
      es: ["Ashes of Ariandel se accede desde Cathedral of the Deep.", "The Ringed City se puede acceder al final de Ariandel o cerca de Kiln of the First Flame.", "Los jefes de DLC están entre los encuentros más exigentes del juego."],
    },
  },
  {
    icon: WandSparkles,
    title: { "pt-BR": "Weapon Arts, FP e Ashen Estus", en: "Weapon Arts, FP and Ashen Estus", es: "Weapon Arts, FP y Ashen Estus" },
    description: { "pt-BR": "Como Skills de armas, Focus Points e o segundo Estus entram no ritmo de uma build.", en: "How weapon Skills, Focus Points and the second Estus flask shape a build.", es: "Cómo las Skills de armas, Focus Points y el segundo Estus influyen en una build." },
    points: {
      "pt-BR": ["Weapon Arts consomem FP em quantidades diferentes e algumas exigem stance ou duas mãos.", "Ashen Estus recupera FP e divide o total de cargas com a Estus comum.", "Attunement aumenta FP e slots de magia em faixas específicas."],
      en: ["Weapon Arts consume different amounts of FP and some require a stance or two-handing.", "Ashen Estus restores FP and shares the total flask allocation with regular Estus.", "Attunement raises FP and spell slots at specific breakpoints."],
      es: ["Las Weapon Arts consumen distintas cantidades de FP y algunas requieren stance o dos manos.", "Ashen Estus recupera FP y comparte el total de cargas con Estus normal.", "Attunement aumenta FP y slots de magia en ciertos puntos."],
    },
  },
  {
    icon: Sparkles,
    title: { "pt-BR": "Titanite, armas especiais e transposição", en: "Titanite, special weapons and transposition", es: "Titanite, armas especiales y transposición" },
    description: { "pt-BR": "A diferença entre armas normais +10, armas especiais +5 e equipamentos feitos com Boss Souls.", en: "The difference between normal +10 weapons, special +5 weapons and equipment made from Boss Souls.", es: "La diferencia entre armas normales +10, armas especiales +5 y equipo creado con Boss Souls." },
    points: {
      "pt-BR": ["Armas normais usam Titanite Shards, Large Shards, Chunks e Slab até +10.", "Armas especiais usam Twinkling Titanite ou Titanite Scale e normalmente terminam em +5.", "Ludleth permite transpor Boss Souls em armas, feitiços e anéis quando o jogador possui o Transposing Kiln."],
      en: ["Normal weapons use Titanite Shards, Large Shards, Chunks and a Slab up to +10.", "Special weapons use Twinkling Titanite or Titanite Scale and normally end at +5.", "Ludleth can transpose Boss Souls into weapons, spells and rings once the player has the Transposing Kiln."],
      es: ["Las armas normales usan Titanite Shards, Large Shards, Chunks y Slab hasta +10.", "Las armas especiales usan Twinkling Titanite o Titanite Scale y normalmente terminan en +5.", "Ludleth puede transponer Boss Souls en armas, hechizos y anillos cuando el jugador tiene el Transposing Kiln."],
    },
  },
];

const ELDEN_GUIDES: GuideEntry[] = [
  {
    icon: Compass,
    title: { "pt-BR": "Exploração e mapa", en: "Exploration and map", es: "Exploración y mapa" },
    description: { "pt-BR": "Como ler Sites of Grace, fragmentos de mapa, Legacy Dungeons e regiões sem transformar a exploração em checklist.", en: "How to read Sites of Grace, map fragments, Legacy Dungeons and regions without turning exploration into a checklist.", es: "Cómo leer Sites of Grace, fragmentos de mapa, Legacy Dungeons y regiones sin convertir la exploración en una lista de tareas." },
    points: {
      "pt-BR": ["Fragmentos de mapa revelam o terreno, não os segredos.", "As linhas de Grace sugerem direção, mas não são obrigação.", "Legacy Dungeons concentram progressão e encontros mais densos."],
      en: ["Map fragments reveal terrain, not secrets.", "Grace guidance suggests direction but is not mandatory.", "Legacy Dungeons concentrate progression and denser encounters."],
      es: ["Los fragmentos de mapa revelan el terreno, no los secretos.", "Las líneas de Grace sugieren dirección, pero no son obligatorias.", "Los Legacy Dungeons concentran progresión y encuentros más densos."],
    },
  },
  {
    icon: Swords,
    title: { "pt-BR": "Ashes of War e afinidades", en: "Ashes of War and affinities", es: "Ashes of War y afinidades" },
    description: { "pt-BR": "O sistema que separa moveset, habilidade e scaling em boa parte das armas comuns.", en: "The system that separates moveset, skill and scaling for many standard weapons.", es: "El sistema que separa moveset, habilidad y escalado en muchas armas estándar." },
    points: {
      "pt-BR": ["Ashes of War alteram a skill e podem alterar afinidade.", "Whetblades ampliam quais afinidades podem ser aplicadas.", "Somber weapons normalmente têm skill fixa e upgrade próprio."],
      en: ["Ashes of War change the skill and can change affinity.", "Whetblades expand the affinities you can apply.", "Somber weapons generally have fixed skills and a separate upgrade path."],
      es: ["Ashes of War cambian la habilidad y pueden cambiar la afinidad.", "Whetblades amplían las afinidades disponibles.", "Las armas Somber suelen tener habilidad fija y una ruta de mejora propia."],
    },
  },
  {
    icon: WandSparkles,
    title: { "pt-BR": "Spirit Ashes e invocações", en: "Spirit Ashes and summons", es: "Spirit Ashes e invocaciones" },
    description: { "pt-BR": "Quando o jogo permite Spirit Ashes e como o upgrade delas muda o ritmo das lutas.", en: "When the game permits Spirit Ashes and how upgrades change the rhythm of fights.", es: "Cuándo permite el juego Spirit Ashes y cómo sus mejoras cambian el ritmo de los combates." },
    points: {
      "pt-BR": ["O ícone de monumento indica áreas onde Spirit Ashes podem ser usadas.", "Grave Glovewort e Ghost Glovewort seguem linhas de upgrade diferentes.", "Invocações são parte do sandbox do jogo, não uma exigência de build."],
      en: ["The monument icon marks areas where Spirit Ashes can be used.", "Grave Glovewort and Ghost Glovewort follow different upgrade lines.", "Summons are part of the game's sandbox, not a build requirement."],
      es: ["El icono de monumento marca zonas donde pueden usarse Spirit Ashes.", "Grave Glovewort y Ghost Glovewort siguen líneas de mejora distintas.", "Las invocaciones forman parte del sandbox del juego, no son un requisito de build."],
    },
  },
  {
    icon: Sparkles,
    title: { "pt-BR": "Shadow of the Erdtree", en: "Shadow of the Erdtree", es: "Shadow of the Erdtree" },
    description: { "pt-BR": "A progressão da expansão adiciona uma camada própria de força por meio dos Scadutree Fragments.", en: "The expansion adds its own progression layer through Scadutree Fragments.", es: "La expansión añade su propia capa de progresión mediante los Scadutree Fragments." },
    points: {
      "pt-BR": ["Scadutree Blessing aumenta ataque e mitigação dentro do Land of Shadow.", "Revered Spirit Ash Blessing fortalece invocações e Torrent na expansão.", "Explorar e coletar fragmentos é parte central do balanceamento da DLC."],
      en: ["Scadutree Blessing raises attack and damage negation in the Land of Shadow.", "Revered Spirit Ash Blessing strengthens summons and Torrent in the expansion.", "Exploration and fragment collection are central to DLC balance."],
      es: ["Scadutree Blessing aumenta ataque y mitigación en Land of Shadow.", "Revered Spirit Ash Blessing fortalece invocaciones y Torrent en la expansión.", "Explorar y recoger fragmentos es central para el balance de la DLC."],
    },
  },
];

export function SoulsGameGuides({ gameSlug, locale }: { gameSlug: SoulsGameSlug; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const guides = gameSlug === "dark-souls-iii" ? DS3_GUIDES : ELDEN_GUIDES;
  const title = gameSlug === "dark-souls-iii" ? "Dark Souls III" : "Elden Ring";

  return (
    <section className="space-y-6">
      <div className="surface-panel p-5 sm:p-6">
        <div className="flex items-center gap-2 text-gold-strong"><BookOpen className="size-4" /><span className="section-kicker">MGP · GUIDES</span></div>
        <h2 className="mt-3 font-display text-2xl font-semibold text-foreground sm:text-3xl">{copy(`Fundamentos de ${title}`, `${title} fundamentals`, `Fundamentos de ${title}`)}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{copy("Guias editoriais próprios do MGP, escritos para explicar sistemas do jogo sem copiar texto de wiki. A ideia é evoluir isso depois para guias da comunidade com autoria.", "Original MGP editorial guides explaining game systems without copying wiki text. Later this can evolve into attributed community guides.", "Guías editoriales propias de MGP para explicar sistemas sin copiar texto de wikis. Más adelante podrán evolucionar a guías de la comunidad con autoría.")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {guides.map((guide) => {
          const Icon = guide.icon;
          return (
            <article key={guide.title.en} className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold/30 hover:shadow-lift sm:p-6">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl border border-gold/25 bg-gold-soft/30 text-gold-strong"><Icon className="size-5" /></div>
                <h3 className="font-display text-xl font-semibold text-foreground">{guide.title[locale]}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{guide.description[locale]}</p>
              <ul className="mt-4 space-y-2">
                {guide.points[locale].map((point) => <li key={point} className="flex gap-2 text-xs leading-5 text-muted-foreground"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-strong" />{point}</li>)}
              </ul>
            </article>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-muted/15 p-4 text-xs leading-5 text-muted-foreground">
        {copy("Conteúdo editorial MGP. Para artes e vídeos promocionais dos jogos, o MGP usa apenas material oficial incorporável ou conteúdo com licença claramente documentada.", "MGP editorial content. For promotional game artwork and video, MGP only uses official embeddable material or content with clearly documented licensing.", "Contenido editorial de MGP. Para arte y vídeo promocional, MGP solo usa material oficial insertable o contenido con licencia claramente documentada.")}
      </div>
    </section>
  );
}
