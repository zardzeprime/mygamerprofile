import type { AppLocale as Locale } from "@/i18n/translations";

export type RobloxHubTab = "overview" | "codes" | "tier-list" | "guides" | "builds";

export type RobloxSectionStatus = "ready" | "in-progress";

export type RobloxExperienceSection = {
  slug: string;
  label: Record<Locale, string>;
  description: Record<Locale, string>;
  status: RobloxSectionStatus;
};

export type RobloxExperience = {
  slug: string;
  name: string;
  aliases: string[];
  placeId: string;
  officialUrl: string;
  category: string;
  summary: Record<Locale, string>;
  focusAreas: Record<Locale, string[]>;
  tierScopes: Record<Locale, string[]>;
  guideTopics: Record<Locale, string[]>;
  buildTopics: Record<Locale, string[]>;
  sections: RobloxExperienceSection[];
  hubStatus: {
    structure: RobloxSectionStatus;
    editorial: RobloxSectionStatus;
  };
  verifiedAt: string;
  visual: {
    coverImage: string;
    heroImage: string;
  };
};

function makeRobloxPlaceholder(label: string, subtitle: string, from: string, to: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/><circle cx="1360" cy="120" r="360" fill="white" opacity=".05"/><circle cx="170" cy="850" r="500" fill="white" opacity=".035"/><text x="110" y="645" fill="white" font-family="Arial,sans-serif" font-size="88" font-weight="700">${label}</text><text x="114" y="715" fill="white" opacity=".65" font-family="Arial,sans-serif" font-size="28" letter-spacing="5">${subtitle}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const BLOX_FRUITS_ART = makeRobloxPlaceholder("BLOX FRUITS", "ROBLOX EXPERIENCE · MGP", "#071a2e", "#0a6385");
const PROJECT_SLAYERS_2_ART = makeRobloxPlaceholder("PROJECT SLAYERS 2", "ROBLOX EXPERIENCE · MGP", "#160d1d", "#6f2437");
const ANIME_VANGUARDS_ART = makeRobloxPlaceholder("ANIME VANGUARDS", "ROBLOX EXPERIENCE · MGP", "#0f1027", "#4f2f87");
const ANIME_LAST_STAND_ART = makeRobloxPlaceholder("ANIME LAST STAND", "ROBLOX EXPERIENCE · MGP", "#16120e", "#84592e");
const KING_LEGACY_ART = makeRobloxPlaceholder("KING LEGACY", "ROBLOX EXPERIENCE · MGP", "#071d1a", "#156a58");

export const ROBLOX_HUB_TABS: Array<{
  id: RobloxHubTab;
  label: Record<Locale, string>;
}> = [
  { id: "overview", label: { "pt-BR": "Visão geral", en: "Overview", es: "Vista general" } },
  { id: "codes", label: { "pt-BR": "Códigos", en: "Codes", es: "Códigos" } },
  { id: "tier-list", label: { "pt-BR": "Tier Lists", en: "Tier Lists", es: "Tier Lists" } },
  { id: "guides", label: { "pt-BR": "Guias", en: "Guides", es: "Guías" } },
  { id: "builds", label: { "pt-BR": "Builds / Presets", en: "Builds / Presets", es: "Builds / Presets" } },
];

export const ROBLOX_EXPERIENCES: RobloxExperience[] = [
  {
    slug: "blox-fruits",
    name: "Blox Fruits",
    aliases: ["Blox Fruit", "Bloxfruits"],
    placeId: "2753915549",
    officialUrl: "https://www.roblox.com/games/2753915549/Blox-Fruits",
    category: "Anime Action RPG",
    summary: {
      "pt-BR": "Hub dedicado a progressão, frutas, espadas, estilos de luta, raças, chefes, códigos e rotas de evolução.",
      en: "Dedicated hub for progression, fruits, swords, fighting styles, races, bosses, codes and progression routes.",
      es: "Hub dedicado a progresión, frutas, espadas, estilos de lucha, razas, jefes, códigos y rutas de progreso.",
    },
    focusAreas: {
      "pt-BR": ["Frutas", "Espadas", "Estilos de luta", "Raças", "Bosses", "Progressão"],
      en: ["Fruits", "Swords", "Fighting styles", "Races", "Bosses", "Progression"],
      es: ["Frutas", "Espadas", "Estilos de lucha", "Razas", "Jefes", "Progresión"],
    },
    tierScopes: {
      "pt-BR": ["Frutas PvE", "Frutas PvP", "Espadas", "Estilos de luta", "Raças"],
      en: ["PvE Fruits", "PvP Fruits", "Swords", "Fighting styles", "Races"],
      es: ["Frutas PvE", "Frutas PvP", "Espadas", "Estilos de lucha", "Razas"],
    },
    guideTopics: {
      "pt-BR": ["Leveling", "Second Sea", "Third Sea", "Raids", "Bosses", "Obtenção de espadas"],
      en: ["Leveling", "Second Sea", "Third Sea", "Raids", "Bosses", "Sword acquisition"],
      es: ["Leveling", "Second Sea", "Third Sea", "Raids", "Jefes", "Obtención de espadas"],
    },
    buildTopics: {
      "pt-BR": ["Build de espada", "Build de fruta", "Híbrida", "PvP", "Farm / PvE"],
      en: ["Sword build", "Fruit build", "Hybrid", "PvP", "Farm / PvE"],
      es: ["Build de espada", "Build de fruta", "Híbrida", "PvP", "Farm / PvE"],
    },
    sections: [
      {
        slug: "frutas",
        label: { "pt-BR": "Frutas", en: "Fruits", es: "Frutas" },
        description: {
          "pt-BR": "Catálogo de frutas, raridade, obtenção, awakenings, uso em PvE/PvP e comparações.",
          en: "Fruit catalog with rarity, acquisition, awakenings, PvE/PvP use and comparisons.",
          es: "Catálogo de frutas con rareza, obtención, awakenings, uso PvE/PvP y comparaciones.",
        },
        status: "in-progress",
      },
      {
        slug: "espadas",
        label: { "pt-BR": "Espadas", en: "Swords", es: "Espadas" },
        description: {
          "pt-BR": "Espadas, requisitos, obtenção, upgrades, combos e recomendações por progressão.",
          en: "Swords, requirements, acquisition, upgrades, combos and progression recommendations.",
          es: "Espadas, requisitos, obtención, mejoras, combos y recomendaciones por progresión.",
        },
        status: "in-progress",
      },
      {
        slug: "estilos-de-luta",
        label: { "pt-BR": "Estilos de luta", en: "Fighting styles", es: "Estilos de lucha" },
        description: {
          "pt-BR": "Estilos, requisitos, custos, evolução e uso em builds de fruta, espada e híbridas.",
          en: "Styles, requirements, costs, progression and use in fruit, sword and hybrid builds.",
          es: "Estilos, requisitos, costos, progresión y uso en builds de fruta, espada e híbridas.",
        },
        status: "in-progress",
      },
      {
        slug: "racas",
        label: { "pt-BR": "Raças", en: "Races", es: "Razas" },
        description: {
          "pt-BR": "Raças e versões, bônus, obtenção, evolução e sinergias com builds.",
          en: "Races and versions, bonuses, acquisition, progression and build synergies.",
          es: "Razas y versiones, bonos, obtención, progresión y sinergias con builds.",
        },
        status: "in-progress",
      },
      {
        slug: "bosses",
        label: { "pt-BR": "Bosses", en: "Bosses", es: "Jefes" },
        description: {
          "pt-BR": "Chefes, localizações, requisitos, drops e rotas de farm.",
          en: "Bosses, locations, requirements, drops and farming routes.",
          es: "Jefes, ubicaciones, requisitos, drops y rutas de farm.",
        },
        status: "in-progress",
      },
      {
        slug: "progressao",
        label: { "pt-BR": "Progressão", en: "Progression", es: "Progresión" },
        description: {
          "pt-BR": "Rotas de level, Sea 1, Sea 2, Sea 3, raids e prioridades de evolução.",
          en: "Level routes, Sea 1, Sea 2, Sea 3, raids and progression priorities.",
          es: "Rutas de nivel, Sea 1, Sea 2, Sea 3, raids y prioridades de progresión.",
        },
        status: "in-progress",
      },
    ],
    hubStatus: { structure: "ready", editorial: "in-progress" },
    verifiedAt: "2026-09-22",
    visual: { coverImage: BLOX_FRUITS_ART, heroImage: BLOX_FRUITS_ART },
  },
  {
    slug: "project-slayers-2",
    name: "Project Slayers 2",
    aliases: ["Project Slayer 2", "PS2 Roblox", "Project Slayers"],
    placeId: "9093954913",
    officialUrl: "https://www.roblox.com/games/9093954913/Project-slayer-2",
    category: "Anime Action RPG",
    summary: {
      "pt-BR": "Área para estilos de respiração, artes demoníacas, clãs, progressão, bosses, códigos e presets de personagem.",
      en: "Area for breathing styles, demon arts, clans, progression, bosses, codes and character presets.",
      es: "Área para estilos de respiración, artes demoníacas, clanes, progresión, jefes, códigos y presets de personaje.",
    },
    focusAreas: {
      "pt-BR": ["Respirações", "Artes demoníacas", "Clãs", "Raças", "Bosses", "Progressão"],
      en: ["Breathing styles", "Demon arts", "Clans", "Races", "Bosses", "Progression"],
      es: ["Respiraciones", "Artes demoníacas", "Clanes", "Razas", "Jefes", "Progresión"],
    },
    tierScopes: {
      "pt-BR": ["Respirações", "Artes demoníacas", "Clãs", "Armas"],
      en: ["Breathing styles", "Demon arts", "Clans", "Weapons"],
      es: ["Respiraciones", "Artes demoníacas", "Clanes", "Armas"],
    },
    guideTopics: {
      "pt-BR": ["Começando do zero", "Escolha Slayer/Demon", "Bosses", "Farm", "Progressão de habilidades"],
      en: ["Starting from zero", "Slayer/Demon path", "Bosses", "Farm", "Skill progression"],
      es: ["Empezar desde cero", "Ruta Slayer/Demon", "Jefes", "Farm", "Progresión de habilidades"],
    },
    buildTopics: {
      "pt-BR": ["Slayer", "Demon", "PvE", "PvP", "Bossing"],
      en: ["Slayer", "Demon", "PvE", "PvP", "Bossing"],
      es: ["Slayer", "Demon", "PvE", "PvP", "Bossing"],
    },
    sections: [
      {
        slug: "respiracoes",
        label: { "pt-BR": "Respirações", en: "Breathing styles", es: "Respiraciones" },
        description: {
          "pt-BR": "Respirações, obtenção, progressão, habilidades e usos em PvE/PvP.",
          en: "Breathing styles, acquisition, progression, skills and PvE/PvP use.",
          es: "Respiraciones, obtención, progresión, habilidades y uso PvE/PvP.",
        },
        status: "in-progress",
      },
      {
        slug: "artes-demoniacas",
        label: { "pt-BR": "Artes demoníacas", en: "Demon arts", es: "Artes demoníacas" },
        description: {
          "pt-BR": "Artes demoníacas, requisitos, habilidades, sinergias e comparação.",
          en: "Demon arts, requirements, abilities, synergies and comparisons.",
          es: "Artes demoníacas, requisitos, habilidades, sinergias y comparaciones.",
        },
        status: "in-progress",
      },
      {
        slug: "clas",
        label: { "pt-BR": "Clãs", en: "Clans", es: "Clanes" },
        description: {
          "pt-BR": "Clãs, raridade, bônus e impacto em builds.",
          en: "Clans, rarity, bonuses and build impact.",
          es: "Clanes, rareza, bonos e impacto en builds.",
        },
        status: "in-progress",
      },
      {
        slug: "bosses",
        label: { "pt-BR": "Bosses", en: "Bosses", es: "Jefes" },
        description: {
          "pt-BR": "Bosses, requisitos, drops e rotas de farm.",
          en: "Bosses, requirements, drops and farming routes.",
          es: "Jefes, requisitos, drops y rutas de farm.",
        },
        status: "in-progress",
      },
      {
        slug: "progressao",
        label: { "pt-BR": "Progressão", en: "Progression", es: "Progresión" },
        description: {
          "pt-BR": "Caminho inicial, Slayer/Demon, evolução de habilidades e farm.",
          en: "Starting route, Slayer/Demon path, skill progression and farming.",
          es: "Ruta inicial, camino Slayer/Demon, progresión de habilidades y farm.",
        },
        status: "in-progress",
      },
    ],
    hubStatus: { structure: "ready", editorial: "in-progress" },
    verifiedAt: "2026-09-22",
    visual: { coverImage: PROJECT_SLAYERS_2_ART, heroImage: PROJECT_SLAYERS_2_ART },
  },
  {
    slug: "anime-vanguards",
    name: "Anime Vanguards",
    aliases: ["Vanguards de Anime", "AV"],
    placeId: "16146832113",
    officialUrl: "https://www.roblox.com/games/16146832113/Anime-Vanguards-Extermination-Event-Pt-1",
    category: "Anime Tower Defense",
    summary: {
      "pt-BR": "Hub para unidades, traits, evoluções, times, códigos, modos e tier lists voltadas para conteúdo PvE.",
      en: "Hub for units, traits, evolutions, teams, codes, modes and PvE-focused tier lists.",
      es: "Hub para unidades, traits, evoluciones, equipos, códigos, modos y tier lists enfocadas en PvE.",
    },
    focusAreas: {
      "pt-BR": ["Unidades", "Traits", "Evoluções", "Times", "Modos", "Farm"],
      en: ["Units", "Traits", "Evolutions", "Teams", "Modes", "Farm"],
      es: ["Unidades", "Traits", "Evoluciones", "Equipos", "Modos", "Farm"],
    },
    tierScopes: {
      "pt-BR": ["Unidades", "Traits", "Suporte", "Farm", "Boss / Raid"],
      en: ["Units", "Traits", "Support", "Farm", "Boss / Raid"],
      es: ["Unidades", "Traits", "Soporte", "Farm", "Boss / Raid"],
    },
    guideTopics: {
      "pt-BR": ["Progressão", "Evoluções", "Traits", "Composição de time", "Farm de recursos"],
      en: ["Progression", "Evolutions", "Traits", "Team composition", "Resource farm"],
      es: ["Progresión", "Evoluciones", "Traits", "Composición de equipo", "Farm de recursos"],
    },
    buildTopics: {
      "pt-BR": ["Time geral", "Bossing", "Farm", "Suporte", "Endgame"],
      en: ["General team", "Bossing", "Farm", "Support", "Endgame"],
      es: ["Equipo general", "Bossing", "Farm", "Soporte", "Endgame"],
    },
    sections: [
      {
        slug: "unidades",
        label: { "pt-BR": "Unidades", en: "Units", es: "Unidades" },
        description: {
          "pt-BR": "Unidades, raridade, funções, evolução e uso em modos diferentes.",
          en: "Units, rarity, roles, evolution and use across modes.",
          es: "Unidades, rareza, roles, evolución y uso en distintos modos.",
        },
        status: "in-progress",
      },
      {
        slug: "traits",
        label: { "pt-BR": "Traits", en: "Traits", es: "Traits" },
        description: {
          "pt-BR": "Traits, efeitos, raridade e melhores usos.",
          en: "Traits, effects, rarity and best uses.",
          es: "Traits, efectos, rareza y mejores usos.",
        },
        status: "in-progress",
      },
      {
        slug: "evolucoes",
        label: { "pt-BR": "Evoluções", en: "Evolutions", es: "Evoluciones" },
        description: {
          "pt-BR": "Materiais, requisitos e rotas de evolução.",
          en: "Materials, requirements and evolution routes.",
          es: "Materiales, requisitos y rutas de evolución.",
        },
        status: "in-progress",
      },
      {
        slug: "times",
        label: { "pt-BR": "Times", en: "Teams", es: "Equipos" },
        description: {
          "pt-BR": "Composições para farm, bossing, suporte e endgame.",
          en: "Team comps for farming, bossing, support and endgame.",
          es: "Composiciones para farm, bossing, soporte y endgame.",
        },
        status: "in-progress",
      },
    ],
    hubStatus: { structure: "ready", editorial: "in-progress" },
    verifiedAt: "2026-09-22",
    visual: { coverImage: ANIME_VANGUARDS_ART, heroImage: ANIME_VANGUARDS_ART },
  },
  {
    slug: "anime-last-stand",
    name: "Anime Last Stand",
    aliases: ["ALS"],
    placeId: "12886143095",
    officialUrl: "https://www.roblox.com/games/12886143095/Anime-Last-Stand",
    category: "Anime Tower Defense",
    summary: {
      "pt-BR": "Centro para unidades, traits, evoluções, composições, códigos e guias de farm do Anime Last Stand.",
      en: "Center for units, traits, evolutions, team comps, codes and Anime Last Stand farming guides.",
      es: "Centro para unidades, traits, evoluciones, composiciones, códigos y guías de farm de Anime Last Stand.",
    },
    focusAreas: {
      "pt-BR": ["Unidades", "Traits", "Evoluções", "Times", "Farm", "Eventos"],
      en: ["Units", "Traits", "Evolutions", "Teams", "Farm", "Events"],
      es: ["Unidades", "Traits", "Evoluciones", "Equipos", "Farm", "Eventos"],
    },
    tierScopes: {
      "pt-BR": ["Unidades", "Traits", "Suporte", "Farm", "Endgame"],
      en: ["Units", "Traits", "Support", "Farm", "Endgame"],
      es: ["Unidades", "Traits", "Soporte", "Farm", "Endgame"],
    },
    guideTopics: {
      "pt-BR": ["Início rápido", "Evoluções", "Traits", "Farm", "Composições"],
      en: ["Quick start", "Evolutions", "Traits", "Farm", "Team comps"],
      es: ["Inicio rápido", "Evoluciones", "Traits", "Farm", "Composiciones"],
    },
    buildTopics: {
      "pt-BR": ["Time barato", "Time meta", "Boss", "Farm", "Suporte"],
      en: ["Budget team", "Meta team", "Boss", "Farm", "Support"],
      es: ["Equipo barato", "Equipo meta", "Boss", "Farm", "Soporte"],
    },
    sections: [
      {
        slug: "unidades",
        label: { "pt-BR": "Unidades", en: "Units", es: "Unidades" },
        description: {
          "pt-BR": "Unidades, funções, raridade e desempenho por modo.",
          en: "Units, roles, rarity and performance by mode.",
          es: "Unidades, roles, rareza y rendimiento por modo.",
        },
        status: "in-progress",
      },
      {
        slug: "traits",
        label: { "pt-BR": "Traits", en: "Traits", es: "Traits" },
        description: {
          "pt-BR": "Traits, efeitos e recomendações por unidade.",
          en: "Traits, effects and recommendations by unit.",
          es: "Traits, efectos y recomendaciones por unidad.",
        },
        status: "in-progress",
      },
      {
        slug: "evolucoes",
        label: { "pt-BR": "Evoluções", en: "Evolutions", es: "Evoluciones" },
        description: {
          "pt-BR": "Evoluções, materiais e prioridades.",
          en: "Evolutions, materials and priorities.",
          es: "Evoluciones, materiales y prioridades.",
        },
        status: "in-progress",
      },
      {
        slug: "times",
        label: { "pt-BR": "Times", en: "Teams", es: "Equipos" },
        description: {
          "pt-BR": "Composições baratas, meta, boss e farm.",
          en: "Budget, meta, boss and farming team comps.",
          es: "Composiciones baratas, meta, boss y farm.",
        },
        status: "in-progress",
      },
    ],
    hubStatus: { structure: "ready", editorial: "in-progress" },
    verifiedAt: "2026-09-22",
    visual: { coverImage: ANIME_LAST_STAND_ART, heroImage: ANIME_LAST_STAND_ART },
  },
  {
    slug: "king-legacy",
    name: "King Legacy",
    aliases: ["King Piece"],
    placeId: "4520749081",
    officialUrl: "https://www.roblox.com/games/4520749081/King-Legacy",
    category: "Anime Action RPG",
    summary: {
      "pt-BR": "Área para frutas, espadas, acessórios, progressão, raids, códigos e builds de King Legacy.",
      en: "Area for fruits, swords, accessories, progression, raids, codes and King Legacy builds.",
      es: "Área para frutas, espadas, accesorios, progresión, raids, códigos y builds de King Legacy.",
    },
    focusAreas: {
      "pt-BR": ["Frutas", "Espadas", "Acessórios", "Haki", "Raids", "Progressão"],
      en: ["Fruits", "Swords", "Accessories", "Haki", "Raids", "Progression"],
      es: ["Frutas", "Espadas", "Accesorios", "Haki", "Raids", "Progresión"],
    },
    tierScopes: {
      "pt-BR": ["Frutas PvE", "Frutas PvP", "Espadas", "Acessórios"],
      en: ["PvE Fruits", "PvP Fruits", "Swords", "Accessories"],
      es: ["Frutas PvE", "Frutas PvP", "Espadas", "Accesorios"],
    },
    guideTopics: {
      "pt-BR": ["Leveling", "Seas", "Raids", "Bosses", "Farm de gems", "Obtenção de espadas"],
      en: ["Leveling", "Seas", "Raids", "Bosses", "Gem farm", "Sword acquisition"],
      es: ["Leveling", "Seas", "Raids", "Jefes", "Farm de gems", "Obtención de espadas"],
    },
    buildTopics: {
      "pt-BR": ["Fruta", "Espada", "Híbrida", "PvP", "Farm"],
      en: ["Fruit", "Sword", "Hybrid", "PvP", "Farm"],
      es: ["Fruta", "Espada", "Híbrida", "PvP", "Farm"],
    },
    sections: [
      {
        slug: "frutas",
        label: { "pt-BR": "Frutas", en: "Fruits", es: "Frutas" },
        description: {
          "pt-BR": "Frutas, raridade, uso em PvE/PvP e comparação.",
          en: "Fruits, rarity, PvE/PvP use and comparisons.",
          es: "Frutas, rareza, uso PvE/PvP y comparaciones.",
        },
        status: "in-progress",
      },
      {
        slug: "espadas",
        label: { "pt-BR": "Espadas", en: "Swords", es: "Espadas" },
        description: {
          "pt-BR": "Espadas, obtenção, upgrades e recomendações.",
          en: "Swords, acquisition, upgrades and recommendations.",
          es: "Espadas, obtención, mejoras y recomendaciones.",
        },
        status: "in-progress",
      },
      {
        slug: "acessorios",
        label: { "pt-BR": "Acessórios", en: "Accessories", es: "Accesorios" },
        description: {
          "pt-BR": "Acessórios, bônus, fontes e sinergias.",
          en: "Accessories, bonuses, sources and synergies.",
          es: "Accesorios, bonos, fuentes y sinergias.",
        },
        status: "in-progress",
      },
      {
        slug: "haki",
        label: { "pt-BR": "Haki", en: "Haki", es: "Haki" },
        description: {
          "pt-BR": "Tipos, progressão e usos em combate.",
          en: "Types, progression and combat uses.",
          es: "Tipos, progresión y usos en combate.",
        },
        status: "in-progress",
      },
      {
        slug: "progressao",
        label: { "pt-BR": "Progressão", en: "Progression", es: "Progresión" },
        description: {
          "pt-BR": "Leveling, seas, raids, bosses e farm.",
          en: "Leveling, seas, raids, bosses and farming.",
          es: "Leveling, seas, raids, jefes y farm.",
        },
        status: "in-progress",
      },
    ],
    hubStatus: { structure: "ready", editorial: "in-progress" },
    verifiedAt: "2026-09-22",
    visual: { coverImage: KING_LEGACY_ART, heroImage: KING_LEGACY_ART },
  },
];

export function getRobloxExperience(slug: string | undefined) {
  if (!slug) return ROBLOX_EXPERIENCES[0] ?? null;
  return ROBLOX_EXPERIENCES.find((experience) => experience.slug === slug) ?? null;
}
