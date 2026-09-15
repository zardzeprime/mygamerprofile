import type { AppLocale as Locale } from "@/i18n/translations";
import darkSoulsAtmosphere from "@/assets/dark-souls-atmosphere.jpg";
import valorantAtmosphere from "@/assets/valorant-atmosphere.jpg";

export type GameThemeKey = "dark_souls" | "valorant";

export type GameModuleKey =
  | "overview"
  | "community"
  | "builds"
  | "bosses"
  | "guides"
  | "news"
  | "agents"
  | "maps"
  | "weapons"
  | "skins"
  | "competitive"
  | "lineups"
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
  visual: {
    coverImage: string;
    heroImage: string;
    backgroundImage: string;
    fallbackImage: string;
    cardObjectPosition?: string;
    heroObjectPosition?: string;
    hoverPreviewVideo?: string;
    hoverAudio?: string;
    ambientAudio?: string;
    trailerYoutubeId?: string;
    trailerUrl?: string;
    assetSource: string;
    assetLicense: string;
  };
};

export const MODULE_LABELS: Record<GameModuleKey, Record<Locale, string>> = {
  overview: { "pt-BR": "Visão geral", en: "Overview", es: "Vista general" },
  community: { "pt-BR": "Comunidade", en: "Community", es: "Comunidad" },
  builds: { "pt-BR": "Builds", en: "Builds", es: "Builds" },
  bosses: { "pt-BR": "Chefes", en: "Bosses", es: "Jefes" },
  guides: { "pt-BR": "Guias", en: "Guides", es: "Guías" },
  news: { "pt-BR": "Novidades", en: "News", es: "Novedades" },
  agents: { "pt-BR": "Agentes", en: "Agents", es: "Agentes" },
  maps: { "pt-BR": "Mapas", en: "Maps", es: "Mapas" },
  weapons: { "pt-BR": "Armas", en: "Weapons", es: "Armas" },
  skins: { "pt-BR": "Skins", en: "Skins", es: "Skins" },
  competitive: { "pt-BR": "Competitivo", en: "Competitive", es: "Competitivo" },
  lineups: { "pt-BR": "Lineups", en: "Lineups", es: "Lineups" },
  clips: { "pt-BR": "Clipes", en: "Clips", es: "Clips" },
  lfg: { "pt-BR": "LFG", en: "LFG", es: "LFG" },
};

const DARK_SOULS_REMASTERED_COVER =
  "https://static.actugaming.net/media/2018/01/dark-souls-remastered-jaquette.jpg";
const VALORANT_COVER =
  "https://images.stopgame.ru/games/logos/19592/c560x560/62PEyFi2MwDpL91qF8_FsA/valorant-square_1.jpg";

export const GAMES: GameConfig[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "dark-souls-remastered",
    name: "Dark Souls Remastered",
    description: {
      "pt-BR": "Um RPG de ação sombrio e implacável, feito de descobertas, atalhos secretos e chefes memoráveis.",
      en: "A dark, unforgiving action RPG built on discovery, secret shortcuts and memorable bosses.",
      es: "Un RPG de acción oscuro e implacable, construido sobre descubrimientos, atajos secretos y jefes memorables.",
    },
    genre: "Action RPG",
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    ageRating: "16+",
    themeKey: "dark_souls",
    modules: ["overview", "builds", "bosses", "guides"],
    profileFields: [
      { key: "favorite_weapon", type: "text", maxLength: 60, label: { "pt-BR": "Arma favorita", en: "Favorite weapon", es: "Arma favorita" } },
      { key: "favorite_build", type: "text", maxLength: 60, label: { "pt-BR": "Build favorita", en: "Favorite build", es: "Build favorita" } },
      { key: "favorite_boss", type: "text", maxLength: 60, label: { "pt-BR": "Chefe favorito", en: "Favorite boss", es: "Jefe favorito" } },
      { key: "hardest_boss", type: "text", maxLength: 60, label: { "pt-BR": "Chefe mais difícil", en: "Hardest boss", es: "Jefe más difícil" } },
      {
        key: "starting_class",
        type: "select",
        options: ["Warrior", "Knight", "Wanderer", "Thief", "Bandit", "Hunter", "Sorcerer", "Pyromancer", "Cleric", "Deprived"],
        label: { "pt-BR": "Classe inicial", en: "Starting class", es: "Clase inicial" },
      },
      { key: "runs_count", type: "number", min: 0, max: 9999, label: { "pt-BR": "Runs concluídas", en: "Completed runs", es: "Runs completadas" } },
      { key: "highest_ng", type: "number", min: 0, max: 99, label: { "pt-BR": "NG+ mais alto", en: "Highest NG+", es: "NG+ más alto" } },
      { key: "personal_notes", type: "textarea", maxLength: 1000, label: { "pt-BR": "Notas pessoais", en: "Personal notes", es: "Notas personales" } },
    ],
    visual: {
      coverImage: DARK_SOULS_REMASTERED_COVER,
      heroImage: DARK_SOULS_REMASTERED_COVER,
      backgroundImage: DARK_SOULS_REMASTERED_COVER,
      fallbackImage: darkSoulsAtmosphere,
      cardObjectPosition: "center 18%",
      heroObjectPosition: "center 20%",
      hoverAudio: "/audio/dark-souls-campfire.mp3",
      trailerYoutubeId: "YWEk9TzLa50",
      trailerUrl: "https://www.youtube.com/watch?v=YWEk9TzLa50",
      assetSource: "Dark Souls Remastered public cover-art reference",
      assetLicense: "Third-party promotional cover art; source attribution tracked by MGP",
    },
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "valorant",
    name: "Valorant",
    description: {
      "pt-BR": "FPS tático 5v5 com agentes, habilidades e economia de rodada. Precisão, informação e coordenação decidem a partida.",
      en: "A 5v5 tactical FPS with agents, abilities and round economy. Aim, information and coordination decide the match.",
      es: "FPS táctico 5v5 con agentes, habilidades y economía por rondas. Precisión, información y coordinación deciden la partida.",
    },
    genre: "Tactical FPS",
    platforms: ["PC", "PlayStation 5", "Xbox Series X|S"],
    ageRating: "16+",
    themeKey: "valorant",
    modules: ["overview", "news", "agents", "maps", "weapons", "skins", "competitive", "lineups"],
    profileFields: [
      { key: "favorite_agent", type: "text", maxLength: 40, label: { "pt-BR": "Agente favorito", en: "Favorite agent", es: "Agente favorito" } },
      { key: "preferred_role", type: "select", options: ["Duelist", "Initiator", "Controller", "Sentinel", "Flex"], label: { "pt-BR": "Função preferida", en: "Preferred role", es: "Rol preferido" } },
      { key: "favorite_map", type: "text", maxLength: 40, label: { "pt-BR": "Mapa favorito", en: "Favorite map", es: "Mapa favorito" } },
      { key: "favorite_weapon", type: "text", maxLength: 40, label: { "pt-BR": "Arma favorita", en: "Favorite weapon", es: "Arma favorita" } },
      { key: "current_rank_manual", type: "text", maxLength: 40, label: { "pt-BR": "Rank atual (informado)", en: "Current rank (declared)", es: "Rango actual (declarado)" } },
      { key: "peak_rank_manual", type: "text", maxLength: 40, label: { "pt-BR": "Rank mais alto (informado)", en: "Peak rank (declared)", es: "Rango máximo (declarado)" } },
      { key: "personal_notes", type: "textarea", maxLength: 1000, label: { "pt-BR": "Notas pessoais", en: "Personal notes", es: "Notas personales" } },
    ],
    visual: {
      coverImage: VALORANT_COVER,
      heroImage: VALORANT_COVER,
      backgroundImage: VALORANT_COVER,
      fallbackImage: valorantAtmosphere,
      cardObjectPosition: "center",
      heroObjectPosition: "center",
      trailerYoutubeId: "e_E9W2vsRbQ",
      trailerUrl: "https://www.youtube.com/watch?v=e_E9W2vsRbQ",
      assetSource: "VALORANT public promotional key art reference",
      assetLicense: "Riot Games promotional artwork; source attribution tracked by MGP",
    },
  },
];

export function getGameConfig(slug: string): GameConfig | undefined {
  return GAMES.find((game) => game.slug === slug);
}
