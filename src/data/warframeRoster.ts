import type { AppLocale as Locale } from "@/i18n/translations";

type LocalizedText = Record<Locale, string>;

export type WarframeAbilityMedia = {
  videoUrl?: string;
  youtubeId?: string;
  posterUrl?: string;
};

export type WarframeAbility = {
  slot: 1 | 2 | 3 | 4;
  name: LocalizedText;
  description: LocalizedText;
  media?: WarframeAbilityMedia;
};

export type WarframeEntry = {
  slug: string;
  name: string;
  primeName?: string;
  role: LocalizedText;
  summary: LocalizedText;
  officialUrl: string;
  abilities: WarframeAbility[];
};

export type WarframeGuideSeed = {
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  status: "foundation" | "draft";
};

export const WARFRAME_STARTER_ROSTER: WarframeEntry[] = [
  {
    slug: "garuda",
    name: "Garuda",
    primeName: "Garuda Prime",
    role: { "pt-BR": "Dano", en: "Damage", es: "Daño" },
    summary: {
      "pt-BR":
        "Transforma Vida, sangue e efeitos de Corte em pressão ofensiva. O kit recompensa alternar agressão, geração de Energia e execução.",
      en: "Turns Health, blood and Slash effects into offensive pressure. Her kit rewards cycling aggression, Energy generation and execution.",
      es: "Convierte Vida, sangre y efectos de Corte en presión ofensiva. Su kit recompensa alternar agresión, generación de Energía y ejecución.",
    },
    officialUrl: "https://www.warframe.com/pt-br/game/warframes/garuda-prime",
    abilities: [
      {
        slot: 1,
        name: { "pt-BR": "Defesa Instintiva", en: "Dread Mirror", es: "Dread Mirror" },
        description: {
          "pt-BR":
            "Usa a energia vital de um alvo como proteção e pode converter o dano absorvido em um projétil explosivo.",
          en: "Uses an enemy's life force as protection and can convert absorbed damage into an explosive projectile.",
          es: "Usa la fuerza vital de un enemigo como protección y puede convertir el daño absorbido en un proyectil explosivo.",
        },
      },
      {
        slot: 2,
        name: { "pt-BR": "Altar Sanguinário", en: "Blood Altar", es: "Blood Altar" },
        description: {
          "pt-BR":
            "Empala um inimigo e cria uma zona de recuperação de Vida para Garuda e aliados.",
          en: "Impales an enemy and creates a Health recovery zone for Garuda and allies.",
          es: "Empala a un enemigo y crea una zona de recuperación de Vida para Garuda y sus aliados.",
        },
      },
      {
        slot: 3,
        name: { "pt-BR": "Sangria", en: "Bloodletting", es: "Bloodletting" },
        description: {
          "pt-BR": "Sacrifica parte da Vida para gerar Energia e remover efeitos de Status.",
          en: "Sacrifices part of Garuda's Health to generate Energy and clear Status effects.",
          es: "Sacrifica parte de la Vida para generar Energía y eliminar efectos de Estado.",
        },
      },
      {
        slot: 4,
        name: { "pt-BR": "Garras Predadoras", en: "Seeking Talons", es: "Seeking Talons" },
        description: {
          "pt-BR":
            "Carrega uma área de ataque e lança garras contra os alvos, preparando sobreviventes para efeitos de Corte.",
          en: "Charges an attack area and launches talons at targets, priming survivors for Slash effects.",
          es: "Carga un área de ataque y lanza garras contra los objetivos, preparando a los supervivientes para efectos de Corte.",
        },
      },
    ],
  },
  {
    slug: "grendel",
    name: "Grendel",
    primeName: "Grendel Prime",
    role: { "pt-BR": "Sobrevivência", en: "Survival", es: "Supervivencia" },
    summary: {
      "pt-BR":
        "Controla inimigos ao devorá-los, sustenta o esquadrão com Nutrição e converte a própria massa em mobilidade e impacto.",
      en: "Controls enemies by devouring them, sustains the squad with Nourish and turns his mass into mobility and impact.",
      es: "Controla enemigos al devorarlos, sostiene al escuadrón con Nourish y convierte su masa en movilidad e impacto.",
    },
    officialUrl: "https://www.warframe.com/pt-br/game/warframes/grendel",
    abilities: [
      {
        slot: 1,
        name: { "pt-BR": "Banquete", en: "Feast", es: "Feast" },
        description: {
          "pt-BR":
            "Engole inimigos e os armazena nas entranhas; segurar a habilidade os expulsa cobertos por bile tóxica.",
          en: "Swallows enemies and stores them in Grendel's gut; holding the ability expels stored enemies in toxic bile.",
          es: "Engulle enemigos y los almacena; mantener la habilidad los expulsa cubiertos de bilis tóxica.",
        },
      },
      {
        slot: 2,
        name: { "pt-BR": "Nutrição", en: "Nourish", es: "Nourish" },
        description: {
          "pt-BR":
            "Recupera Vida e concede benefícios ligados a Dano Viral e fontes de Energia, estendendo-os ao esquadrão.",
          en: "Restores Health and grants benefits tied to Viral Damage and Energy sources, extending them to squad mates.",
          es: "Recupera Vida y concede beneficios ligados al Daño Viral y a las fuentes de Energía, extendiéndolos al escuadrón.",
        },
      },
      {
        slot: 3,
        name: { "pt-BR": "Pulverizar", en: "Pulverize", es: "Pulverize" },
        description: {
          "pt-BR":
            "Transforma Grendel em uma bola móvel que derruba inimigos, cura ao rolar e gera impacto ao cair.",
          en: "Turns Grendel into a rolling ball that knocks enemies down, heals while moving and creates impact on landing.",
          es: "Convierte a Grendel en una bola móvil que derriba enemigos, se cura al rodar y genera impacto al caer.",
        },
      },
      {
        slot: 4,
        name: { "pt-BR": "Regurgitar", en: "Regurgitate", es: "Regurgitate" },
        description: {
          "pt-BR":
            "Expele um inimigo consumido como projétil tóxico, desacelerando alvos próximos e reduzindo sua Armadura.",
          en: "Launches a consumed enemy as a toxic projectile, slowing nearby targets and stripping Armor.",
          es: "Lanza a un enemigo consumido como proyectil tóxico, ralentizando objetivos cercanos y reduciendo su Armadura.",
        },
      },
    ],
  },
  {
    slug: "nekros",
    name: "Nekros",
    primeName: "Nekros Prime",
    role: { "pt-BR": "Controle de Grupo", en: "Crowd Control", es: "Control de grupo" },
    summary: {
      "pt-BR":
        "Mistura controle, geração extra de recursos e aliados invocados. É uma escolha clássica para farming e manipulação do campo.",
      en: "Blends crowd control, extra resource generation and summoned allies. He is a classic farming and battlefield-control choice.",
      es: "Combina control, generación extra de recursos y aliados invocados. Es una elección clásica para farming y control del campo.",
    },
    officialUrl: "https://www.warframe.com/pt-br/game/warframes/nekros",
    abilities: [
      {
        slot: 1,
        name: { "pt-BR": "Abdução Espiritual", en: "Soul Punch", es: "Soul Punch" },
        description: {
          "pt-BR":
            "Golpeia a alma do alvo e pode marcá-lo para integrar Sombras dos Mortos caso seja eliminado.",
          en: "Strikes a target's soul and can mark it to join Shadows of the Dead if it is killed.",
          es: "Golpea el alma del objetivo y puede marcarlo para unirse a Shadows of the Dead si muere.",
        },
      },
      {
        slot: 2,
        name: { "pt-BR": "Assombração", en: "Terrify", es: "Terrify" },
        description: {
          "pt-BR": "Aterroriza inimigos próximos, força recuo e reduz Armadura.",
          en: "Terrifies nearby enemies, forcing them away and reducing Armor.",
          es: "Aterroriza a enemigos cercanos, los obliga a retroceder y reduce su Armadura.",
        },
      },
      {
        slot: 3,
        name: { "pt-BR": "Vilipêndio", en: "Desecrate", es: "Desecrate" },
        description: {
          "pt-BR": "Força inimigos abatidos na área a gerar oportunidades adicionais de loot.",
          en: "Forces fallen enemies in range to generate additional loot opportunities.",
          es: "Fuerza a los enemigos caídos en el área a generar oportunidades adicionales de botín.",
        },
      },
      {
        slot: 4,
        name: {
          "pt-BR": "Sombras dos Mortos",
          en: "Shadows of the Dead",
          es: "Shadows of the Dead",
        },
        description: {
          "pt-BR":
            "Invoca versões sombrias de inimigos derrotados para lutar temporariamente ao lado de Nekros.",
          en: "Summons shadow versions of defeated enemies to fight alongside Nekros for a limited time.",
          es: "Invoca versiones sombrías de enemigos derrotados para luchar temporalmente junto a Nekros.",
        },
      },
    ],
  },
];

export const WARFRAME_GUIDE_SEEDS: WarframeGuideSeed[] = [
  {
    slug: "returning-tenno",
    title: {
      "pt-BR": "Voltando ao Warframe: por onde continuar",
      en: "Returning to Warframe: where to continue",
      es: "Volviendo a Warframe: por dónde continuar",
    },
    description: {
      "pt-BR":
        "Estrutura para um guia de retorno: mapa estelar, Jornadas, equipamentos, Mods e prioridades sem sobrecarregar quem ficou um tempo longe.",
      en: "Foundation for a returning-player guide covering Star Chart, Quests, gear, Mods and priorities without overwhelming players coming back.",
      es: "Base para una guía de regreso con Mapa Estelar, Misiones, equipo, Mods y prioridades sin abrumar a quien vuelve.",
    },
    status: "foundation",
  },
  {
    slug: "modding-builds",
    title: {
      "pt-BR": "Mods e builds: a lógica por trás dos números",
      en: "Mods and builds: the logic behind the numbers",
      es: "Mods y builds: la lógica detrás de los números",
    },
    description: {
      "pt-BR":
        "Espaço para explicar Força, Duração, Alcance, Eficiência, polaridades, Forma e como cada Warframe muda a prioridade desses atributos.",
      en: "A home for Strength, Duration, Range, Efficiency, polarities, Forma and how each Warframe changes those priorities.",
      es: "Espacio para Fuerza, Duración, Alcance, Eficiencia, polaridades, Forma y cómo cada Warframe cambia esas prioridades.",
    },
    status: "foundation",
  },
  {
    slug: "damage-status",
    title: {
      "pt-BR": "Dano e Status sem confusão",
      en: "Damage and Status without the confusion",
      es: "Daño y Estado sin confusión",
    },
    description: {
      "pt-BR":
        "Base para explicar físico, elemental, combinações, Status e por que builds diferentes funcionam contra conteúdos diferentes.",
      en: "Foundation for physical and elemental damage, combinations, Status and why different builds work in different content.",
      es: "Base para daño físico y elemental, combinaciones, Estado y por qué distintas builds funcionan en contenidos diferentes.",
    },
    status: "draft",
  },
  {
    slug: "farming-roadmap",
    title: {
      "pt-BR": "Roadmap de farming e progressão",
      en: "Farming and progression roadmap",
      es: "Roadmap de farming y progresión",
    },
    description: {
      "pt-BR":
        "Estrutura para organizar recursos, Warframes, armas, Reputação e objetivos de médio prazo sem transformar o jogo numa lista infinita.",
      en: "Structure for organizing resources, Warframes, weapons, Standing and medium-term goals without turning the game into an endless checklist.",
      es: "Estructura para organizar recursos, Warframes, armas, Reputación y objetivos de medio plazo sin convertir el juego en una lista infinita.",
    },
    status: "draft",
  },
];
