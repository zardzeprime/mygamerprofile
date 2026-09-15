import type { Locale } from "@/i18n";

export type LocalizedGuideText = Record<Locale, string>;

export type DarkSoulsStatId =
  | "vitality"
  | "attunement"
  | "endurance"
  | "strength"
  | "dexterity"
  | "resistance"
  | "intelligence"
  | "faith";

export type DarkSoulsStatGuideEntry = {
  id: DarkSoulsStatId;
  abbreviation: string;
  name: LocalizedGuideText;
  summary: LocalizedGuideText;
  favors: LocalizedGuideText[];
  softCaps: string[];
  capNote: LocalizedGuideText;
  practicalTip: LocalizedGuideText;
  caution?: LocalizedGuideText;
};

export const DARK_SOULS_STATS: DarkSoulsStatGuideEntry[] = [
  {
    id: "vitality",
    abbreviation: "VIT",
    name: { "pt-BR": "Vitalidade", en: "Vitality", es: "Vitalidad" },
    summary: {
      "pt-BR": "Aumenta seu HP máximo. É um dos investimentos mais universais para sobreviver a erros e golpes fortes.",
      en: "Raises maximum HP. It is one of the most universal investments for surviving mistakes and heavy hits.",
      es: "Aumenta los PS máximos. Es una de las inversiones más universales para sobrevivir errores y golpes fuertes.",
    },
    favors: [
      { "pt-BR": "Sobrevivência", en: "Survivability", es: "Supervivencia" },
      { "pt-BR": "PvE e PvP", en: "PvE and PvP", es: "PvE y PvP" },
    ],
    softCaps: ["30", "50"],
    capNote: {
      "pt-BR": "Os ganhos de HP diminuem depois de 30 e caem novamente a partir de 50.",
      en: "HP gains become smaller after 30 and drop again from 50 onward.",
      es: "Las ganancias de PS disminuyen después de 30 y vuelven a caer a partir de 50.",
    },
    practicalTip: {
      "pt-BR": "Se você ainda morre em poucos golpes, Vitalidade costuma render mais do que espremer alguns pontos extras de dano.",
      en: "If you still die in only a few hits, Vitality often gives more value than squeezing out a few extra damage points.",
      es: "Si todavía mueres en pocos golpes, Vitalidad suele aportar más que exprimir unos pocos puntos extra de daño.",
    },
  },
  {
    id: "attunement",
    abbreviation: "ATT",
    name: { "pt-BR": "Sintonia", en: "Attunement", es: "Sintonización" },
    summary: {
      "pt-BR": "Libera espaços para equipar feitiços, milagres e piromancias. Não aumenta diretamente o dano das magias.",
      en: "Unlocks slots for sorceries, miracles and pyromancies. It does not directly increase spell damage.",
      es: "Desbloquea espacios para hechizos, milagros y piromancias. No aumenta directamente el daño mágico.",
    },
    favors: [
      { "pt-BR": "Conjuradores", en: "Casters", es: "Lanzadores" },
      { "pt-BR": "Builds híbridas", en: "Hybrid builds", es: "Builds híbridas" },
    ],
    softCaps: ["10", "12", "14", "16", "19", "23", "28", "34", "41", "50"],
    capNote: {
      "pt-BR": "Cada marco libera um slot; 50 concede o décimo slot e níveis acima disso não liberam novos espaços.",
      en: "Each breakpoint unlocks a slot; 50 grants the tenth slot and further levels do not add more.",
      es: "Cada punto de corte desbloquea un espacio; 50 concede el décimo y niveles superiores no añaden más.",
    },
    practicalTip: {
      "pt-BR": "Pare no número de slots que sua build realmente usa. Sintonia é melhor tratada como um atributo de marcos.",
      en: "Stop at the number of slots your build actually uses. Attunement is best treated as a breakpoint stat.",
      es: "Detente en la cantidad de espacios que tu build realmente usa. Sintonización funciona mejor por puntos de corte.",
    },
  },
  {
    id: "endurance",
    abbreviation: "END",
    name: { "pt-BR": "Resistência física", en: "Endurance", es: "Aguante" },
    summary: {
      "pt-BR": "Aumenta Stamina, carga máxima de equipamento e resistência a sangramento.",
      en: "Raises Stamina, maximum equipment load and bleed resistance.",
      es: "Aumenta la resistencia, la carga máxima de equipo y la resistencia al sangrado.",
    },
    favors: [
      { "pt-BR": "Todas as builds corpo a corpo", en: "All melee builds", es: "Todas las builds cuerpo a cuerpo" },
      { "pt-BR": "Armadura pesada", en: "Heavy armor", es: "Armadura pesada" },
    ],
    softCaps: ["40"],
    capNote: {
      "pt-BR": "A Stamina para de aumentar em 40, chegando a 160. A carga de equipamento continua aumentando depois disso.",
      en: "Stamina stops increasing at 40, reaching 160. Equipment load continues to rise beyond that point.",
      es: "La resistencia deja de aumentar en 40, llegando a 160. La carga de equipo sigue aumentando después.",
    },
    practicalTip: {
      "pt-BR": "Ataque, esquiva e bloqueio disputam a mesma barra. Em Dark Souls, Stamina é parte do seu dano e da sua defesa.",
      en: "Attacking, rolling and blocking all compete for the same bar. In Dark Souls, Stamina is part of both offense and defense.",
      es: "Atacar, rodar y bloquear compiten por la misma barra. En Dark Souls, la resistencia es parte de tu ataque y tu defensa.",
    },
  },
  {
    id: "strength",
    abbreviation: "STR",
    name: { "pt-BR": "Força", en: "Strength", es: "Fuerza" },
    summary: {
      "pt-BR": "Cumpre requisitos de armas pesadas e aumenta o dano de equipamentos que possuem scaling de Força.",
      en: "Meets heavy-weapon requirements and raises damage on equipment with Strength scaling.",
      es: "Cumple requisitos de armas pesadas y aumenta el daño de equipos con escalado de Fuerza.",
    },
    favors: [
      { "pt-BR": "Martelos e armas pesadas", en: "Hammers and heavy weapons", es: "Martillos y armas pesadas" },
      { "pt-BR": "Scaling STR", en: "STR scaling", es: "Escalado STR" },
    ],
    softCaps: ["20", "40"],
    capNote: {
      "pt-BR": "O retorno de dano desacelera após 20 e cai fortemente depois de 40 nas rotas físicas comuns.",
      en: "Damage returns slow after 20 and drop sharply after 40 on common physical upgrade paths.",
      es: "El rendimiento de daño baja después de 20 y cae con fuerza después de 40 en rutas físicas comunes.",
    },
    practicalTip: {
      "pt-BR": "Empunhar com duas mãos multiplica sua Força efetiva por 1,5 para requisitos e scaling. 27 STR vira 40 de Força efetiva para esses cálculos.",
      en: "Two-handing multiplies effective Strength by 1.5 for requirements and scaling. 27 STR becomes 40 effective Strength for those calculations.",
      es: "Usar un arma a dos manos multiplica la Fuerza efectiva por 1,5 para requisitos y escalado. 27 STR se convierte en 40 efectivos.",
    },
  },
  {
    id: "dexterity",
    abbreviation: "DEX",
    name: { "pt-BR": "Destreza", en: "Dexterity", es: "Destreza" },
    summary: {
      "pt-BR": "Cumpre requisitos e aumenta o dano de armas com scaling de Destreza. Também pode encurtar a animação inicial de algumas magias ofensivas.",
      en: "Meets requirements and raises damage on Dexterity-scaling weapons. It can also shorten the startup of some offensive spells.",
      es: "Cumple requisitos y aumenta el daño de armas con escalado de Destreza. También puede acortar el inicio de algunas magias ofensivas.",
    },
    favors: [
      { "pt-BR": "Armas rápidas e técnicas", en: "Fast and technical weapons", es: "Armas rápidas y técnicas" },
      { "pt-BR": "Scaling DEX", en: "DEX scaling", es: "Escalado DEX" },
    ],
    softCaps: ["20", "40", "45"],
    capNote: {
      "pt-BR": "O scaling físico cai fortemente após 40. O benefício de velocidade de conjuração termina em 45 DEX.",
      en: "Physical scaling drops sharply after 40. The casting-speed benefit ends at 45 DEX.",
      es: "El escalado físico cae con fuerza después de 40. El beneficio de velocidad de lanzamiento termina en 45 DEX.",
    },
    practicalTip: {
      "pt-BR": "DEX não aumenta a velocidade dos ataques das armas. O bônus de velocidade se aplica apenas ao início de determinadas conjurações.",
      en: "DEX does not make weapon attacks faster. Its speed benefit only applies to the startup of specific spells.",
      es: "DEX no hace que las armas ataquen más rápido. Su beneficio de velocidad solo afecta el inicio de ciertos hechizos.",
    },
  },
  {
    id: "resistance",
    abbreviation: "RES",
    name: { "pt-BR": "Resistência", en: "Resistance", es: "Resistencia" },
    summary: {
      "pt-BR": "Aumenta defesa física, defesa contra fogo e resistência a veneno.",
      en: "Raises physical defense, fire defense and poison resistance.",
      es: "Aumenta la defensa física, la defensa contra fuego y la resistencia al veneno.",
    },
    favors: [
      { "pt-BR": "Defesas específicas", en: "Specific defenses", es: "Defensas específicas" },
    ],
    softCaps: ["15", "30"],
    capNote: {
      "pt-BR": "Os ganhos diminuem bastante depois de 15 e novamente depois de 30.",
      en: "Returns are reduced substantially after 15 and again after 30.",
      es: "Las ganancias disminuyen bastante después de 15 y otra vez después de 30.",
    },
    practicalTip: {
      "pt-BR": "Na maioria das builds, Vitalidade e Resistência física (END) entregam benefícios mais úteis por nível.",
      en: "For most builds, Vitality and Endurance provide more broadly useful benefits per level.",
      es: "Para la mayoría de builds, Vitalidad y Aguante ofrecen beneficios más útiles por nivel.",
    },
    caution: {
      "pt-BR": "É o atributo mais famoso por ser um investimento fraco. Subir níveis também aumenta algumas defesas naturalmente, o que reduz ainda mais o valor de investir diretamente em RES.",
      en: "This is the stat most famous for being a weak investment. Leveling also raises some defenses naturally, further reducing the value of direct RES investment.",
      es: "Es el atributo más famoso por ser una inversión débil. Subir de nivel también aumenta algunas defensas de forma natural, reduciendo aún más su valor.",
    },
  },
  {
    id: "intelligence",
    abbreviation: "INT",
    name: { "pt-BR": "Inteligência", en: "Intelligence", es: "Inteligencia" },
    summary: {
      "pt-BR": "Cumpre requisitos de feitiços e equipamentos, melhora armas com scaling de INT e o Magic Adjustment da maioria dos catalisadores.",
      en: "Meets sorcery and equipment requirements, improves INT-scaling weapons and the Magic Adjustment of most catalysts.",
      es: "Cumple requisitos de hechizos y equipo, mejora armas con escalado de INT y el Ajuste Mágico de la mayoría de catalizadores.",
    },
    favors: [
      { "pt-BR": "Feitiçaria", en: "Sorcery", es: "Hechicería" },
      { "pt-BR": "Magic / Enchanted", en: "Magic / Enchanted", es: "Magic / Enchanted" },
    ],
    softCaps: ["40", "45", "50"],
    capNote: {
      "pt-BR": "Os pontos de retorno dependem do catalisador e da rota de upgrade: 40 é um marco comum para armas; alguns catalisadores têm marcos importantes em 45 ou 50.",
      en: "Return breakpoints depend on catalyst and upgrade path: 40 is common for weapons; some catalysts have important breakpoints at 45 or 50.",
      es: "Los puntos de rendimiento dependen del catalizador y la ruta de mejora: 40 es común para armas; algunos catalizadores tienen hitos en 45 o 50.",
    },
    practicalTip: {
      "pt-BR": "Não escolha o catalisador só pela letra. O Magic Adjustment real no seu nível de INT é o que determina a potência da maioria das feitiçarias.",
      en: "Do not choose a catalyst by its letter alone. Its actual Magic Adjustment at your INT level is what drives most sorcery power.",
      es: "No elijas un catalizador solo por la letra. El Ajuste Mágico real a tu nivel de INT es lo que determina la potencia de la mayoría de hechicerías.",
    },
  },
  {
    id: "faith",
    abbreviation: "FAI",
    name: { "pt-BR": "Fé", en: "Faith", es: "Fe" },
    summary: {
      "pt-BR": "Cumpre requisitos de milagres e equipamentos, melhora armas com scaling de Fé e o Magic Adjustment da maioria dos talismãs.",
      en: "Meets miracle and equipment requirements, improves Faith-scaling weapons and the Magic Adjustment of most talismans.",
      es: "Cumple requisitos de milagros y equipo, mejora armas con escalado de Fe y el Ajuste Mágico de la mayoría de talismanes.",
    },
    favors: [
      { "pt-BR": "Milagres", en: "Miracles", es: "Milagros" },
      { "pt-BR": "Divine / Occult", en: "Divine / Occult", es: "Divine / Occult" },
    ],
    softCaps: ["30", "50"],
    capNote: {
      "pt-BR": "30 cobre muitos requisitos importantes; talismãs continuam ganhando MagAdjust até 50, mas com retorno bem menor depois disso.",
      en: "30 covers many major requirements; talismans can keep gaining MagAdjust up to 50, with much weaker returns beyond it.",
      es: "30 cubre muchos requisitos importantes; los talismanes pueden seguir ganando Ajuste Mágico hasta 50, con rendimientos mucho menores después.",
    },
    practicalTip: {
      "pt-BR": "A melhor escolha de talismã muda conforme sua Fé. Compare o Magic Adjustment, não apenas a letra de scaling.",
      en: "The best talisman changes with your Faith level. Compare Magic Adjustment, not just the scaling letter.",
      es: "El mejor talismán cambia según tu nivel de Fe. Compara el Ajuste Mágico, no solo la letra de escalado.",
    },
  },
];

export const SCALING_GRADES = [
  { grade: "S", range: "140+" },
  { grade: "A", range: "100–139" },
  { grade: "B", range: "80–99" },
  { grade: "C", range: "52–79" },
  { grade: "D", range: "22–51" },
  { grade: "E", range: "1–21" },
  { grade: "—", range: "0" },
] as const;

export const BUILD_DIRECTIONS = [
  {
    id: "strength",
    label: { "pt-BR": "Quero armas gigantes", en: "I want huge weapons", es: "Quiero armas gigantes" },
    title: { "pt-BR": "Força", en: "Strength", es: "Fuerza" },
    priorities: ["STR", "VIT", "END"],
    note: {
      "pt-BR": "Priorize o requisito da arma e o scaling de STR. Duas mãos podem reduzir bastante a Força necessária para usar a arma corretamente.",
      en: "Prioritize the weapon requirement and STR scaling. Two-handing can greatly reduce the Strength needed to wield it properly.",
      es: "Prioriza el requisito del arma y el escalado STR. Usarla a dos manos puede reducir bastante la Fuerza necesaria.",
    },
  },
  {
    id: "dexterity",
    label: { "pt-BR": "Quero armas rápidas", en: "I want fast weapons", es: "Quiero armas rápidas" },
    title: { "pt-BR": "Destreza", en: "Dexterity", es: "Destreza" },
    priorities: ["DEX", "VIT", "END"],
    note: {
      "pt-BR": "Procure armas com bom scaling DEX e pare de investir em dano quando o retorno após 40 começar a ficar pequeno.",
      en: "Look for weapons with strong DEX scaling and reconsider damage investment once returns past 40 become small.",
      es: "Busca armas con buen escalado DEX y reconsidera seguir invirtiendo en daño cuando el rendimiento después de 40 sea pequeño.",
    },
  },
  {
    id: "quality",
    label: { "pt-BR": "Quero usar de tudo", en: "I want weapon variety", es: "Quiero variedad de armas" },
    title: { "pt-BR": "Quality (STR + DEX)", en: "Quality (STR + DEX)", es: "Quality (STR + DEX)" },
    priorities: ["STR", "DEX", "VIT", "END"],
    note: {
      "pt-BR": "Builds Quality aproveitam armas que recebem bônus relevantes dos dois atributos. Se você luta quase sempre com duas mãos, 27 STR já equivale a 40 de Força efetiva.",
      en: "Quality builds favor weapons that benefit meaningfully from both stats. If you fight mostly two-handed, 27 STR already equals 40 effective Strength.",
      es: "Las builds Quality aprovechan armas que reciben bonificación relevante de ambos atributos. A dos manos, 27 STR ya equivale a 40 de Fuerza efectiva.",
    },
  },
  {
    id: "sorcery",
    label: { "pt-BR": "Quero usar feitiços", en: "I want sorcery", es: "Quiero hechicería" },
    title: { "pt-BR": "Feiticeiro", en: "Sorcerer", es: "Hechicero" },
    priorities: ["INT", "ATT", "VIT"],
    note: {
      "pt-BR": "INT alimenta a maior parte da feitiçaria; ATT define quantas magias você consegue levar. O melhor catalisador depende do seu nível de INT.",
      en: "INT powers most sorcery; ATT determines how many spells you can carry. The best catalyst depends on your INT level.",
      es: "INT potencia la mayoría de hechicerías; ATT define cuántos hechizos puedes llevar. El mejor catalizador depende de tu INT.",
    },
  },
  {
    id: "faith",
    label: { "pt-BR": "Quero milagres", en: "I want miracles", es: "Quiero milagros" },
    title: { "pt-BR": "Fé", en: "Faith", es: "Fe" },
    priorities: ["FAI", "ATT", "VIT"],
    note: {
      "pt-BR": "FAI atende requisitos e aumenta o MagAdjust dos talismãs. Divine e Occult também transformam Fé em dano mágico de arma.",
      en: "FAI meets requirements and raises talisman MagAdjust. Divine and Occult also convert Faith investment into magic weapon damage.",
      es: "FAI cumple requisitos y aumenta el Ajuste Mágico de los talismanes. Divine y Occult también convierten Fe en daño mágico de arma.",
    },
  },
  {
    id: "pyromancy",
    label: { "pt-BR": "Quero piromancia", en: "I want pyromancy", es: "Quiero piromancia" },
    title: { "pt-BR": "Piromante / híbrido", en: "Pyromancer / hybrid", es: "Piromante / híbrido" },
    priorities: ["ATT", "VIT", "END"],
    note: {
      "pt-BR": "O dano da Piromancia vem do upgrade da Pyromancy Flame, não de INT ou FAI. DEX alta pode acelerar algumas conjurações, mas é um investimento opcional e tardio.",
      en: "Pyromancy damage comes from upgrading the Pyromancy Flame, not from INT or FAI. High DEX can speed up some casts, but it is an optional late investment.",
      es: "El daño de Piromancia viene de mejorar la Pyromancy Flame, no de INT o FAI. DEX alta puede acelerar algunos lanzamientos, pero es una inversión opcional y tardía.",
    },
  },
] as const;
