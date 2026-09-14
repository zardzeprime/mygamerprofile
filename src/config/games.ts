import type { Locale } from "@/i18n/translations";

export type GameThemeKey = "dark_souls" | "valorant";

export type GameModuleKey =
  | "overview"
  | "community"
  | "builds"
  | "bosses"
  | "guides"
  | "agents"
  | "competitive"
  | "clips"
  | "lfg";

export type GameProfileFieldType = "text" | "textarea" | "number" | "select";

export type GameProfileField = {
  key: string;
  type: GameProfileFieldType;
  label: Record<Locale, string>;
  options?: string[];
  maxLength?: number;
  min?: number;
  max?: number;
};

export type GameConfig = {
  id: string;
  slug: string;
  name: string;
  description: Record<Locale, string>;
  genre: string;
  platforms: string[];
  ageRating: string;
  themeKey: GameThemeKey;
  modules: GameModuleKey[];
  profileFields: GameProfileField[];
};

export const MODULE_LABELS: Record<GameModuleKey, Record<Locale, string>> = {
  overview: { "pt-BR": "Visão geral", en: "Overview" },
  community: { "pt-BR": "Comunidade", en: "Community" },
  builds: { "pt-BR": "Builds", en: "Builds" },
  bosses: { "pt-BR": "Chefes", en: "Bosses" },
  guides: { "pt-BR": "Guias", en: "Guides" },
  agents: { "pt-BR": "Agentes", en: "Agents" },
  competitive: { "pt-BR": "Competitivo", en: "Competitive" },
  clips: { "pt-BR": "Clipes", en: "Clips" },
  lfg: { "pt-BR": "LFG", en: "LFG" },
};

export const GAMES: GameConfig[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "dark-souls-remastered",
    name: "Dark Souls Remastered",
    description: {
      "pt-BR":
        "Um RPG de ação sombrio e implacável, feito de descobertas, atalhos secretos e chefes memoráveis.",
      en: "A dark, unforgiving action RPG built on discovery, secret shortcuts and memorable bosses.",
    },
    genre: "Action RPG",
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    ageRating: "16+",
    themeKey: "dark_souls",
    modules: ["overview", "community", "builds", "bosses", "guides", "lfg"],
    profileFields: [
      {
        key: "favorite_weapon",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Arma favorita", en: "Favorite weapon" },
      },
      {
        key: "favorite_build",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Build favorita", en: "Favorite build" },
      },
      {
        key: "favorite_boss",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Chefe favorito", en: "Favorite boss" },
      },
      {
        key: "hardest_boss",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Chefe mais difícil", en: "Hardest boss" },
      },
      {
        key: "starting_class",
        type: "select",
        options: [
          "Warrior",
          "Knight",
          "Wanderer",
          "Thief",
          "Bandit",
          "Hunter",
          "Sorcerer",
          "Pyromancer",
          "Cleric",
          "Deprived",
        ],
        label: { "pt-BR": "Classe inicial", en: "Starting class" },
      },
      {
        key: "runs_count",
        type: "number",
        min: 0,
        max: 9999,
        label: { "pt-BR": "Runs concluídas", en: "Completed runs" },
      },
      {
        key: "highest_ng",
        type: "number",
        min: 0,
        max: 99,
        label: { "pt-BR": "NG+ mais alto", en: "Highest NG+" },
      },
      {
        key: "personal_notes",
        type: "textarea",
        maxLength: 1000,
        label: { "pt-BR": "Notas pessoais", en: "Personal notes" },
      },
    ],
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "valorant",
    name: "Valorant",
    description: {
      "pt-BR":
        "FPS tático 5v5 com agentes, habilidades e economia de rodada. Precisão e coordenação decidem a partida.",
      en: "A 5v5 tactical FPS with agents, abilities and round economy. Aim and coordination decide the match.",
    },
    genre: "Tactical FPS",
    platforms: ["PC"],
    ageRating: "16+",
    themeKey: "valorant",
    modules: ["overview", "community", "agents", "competitive", "guides", "clips", "lfg"],
    profileFields: [
      {
        key: "favorite_agent",
        type: "text",
        maxLength: 40,
        label: { "pt-BR": "Agente favorito", en: "Favorite agent" },
      },
      {
        key: "preferred_role",
        type: "select",
        options: ["Duelist", "Initiator", "Controller", "Sentinel", "Flex"],
        label: { "pt-BR": "Função preferida", en: "Preferred role" },
      },
      {
        key: "favorite_map",
        type: "text",
        maxLength: 40,
        label: { "pt-BR": "Mapa favorito", en: "Favorite map" },
      },
      {
        key: "favorite_weapon",
        type: "text",
        maxLength: 40,
        label: { "pt-BR": "Arma favorita", en: "Favorite weapon" },
      },
      {
        key: "current_rank_manual",
        type: "text",
        maxLength: 40,
        label: { "pt-BR": "Rank atual (informado)", en: "Current rank (declared)" },
      },
      {
        key: "peak_rank_manual",
        type: "text",
        maxLength: 40,
        label: { "pt-BR": "Rank mais alto (informado)", en: "Peak rank (declared)" },
      },
      {
        key: "personal_notes",
        type: "textarea",
        maxLength: 1000,
        label: { "pt-BR": "Notas pessoais", en: "Personal notes" },
      },
    ],
  },
];

export function getGameConfig(slug: string): GameConfig | undefined {
  return GAMES.find((game) => game.slug === slug);
}
