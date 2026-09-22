import type { AppLocale as Locale } from "@/i18n/translations";

export type RobloxHubTab = "overview" | "codes" | "tier-list" | "guides" | "builds";

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
  verifiedAt: string;
};

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
    verifiedAt: "2026-09-22",
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
    verifiedAt: "2026-09-22",
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
    verifiedAt: "2026-09-22",
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
    verifiedAt: "2026-09-22",
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
    verifiedAt: "2026-09-22",
  },
];

export function getRobloxExperience(slug: string | undefined) {
  if (!slug) return ROBLOX_EXPERIENCES[0] ?? null;
  return ROBLOX_EXPERIENCES.find((experience) => experience.slug === slug) ?? null;
}
