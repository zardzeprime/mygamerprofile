import type { AppLocale as Locale } from "@/i18n/translations";
import darkSoulsAtmosphere from "@/assets/dark-souls-atmosphere.jpg";
import valorantAtmosphere from "@/assets/valorant-atmosphere.jpg";

export type GameThemeKey = "dark_souls" | "valorant" | "competitive";

export type GameModuleKey =
  | "overview"
  | "community"
  | "builds"
  | "bosses"
  | "guides"
  | "news"
  | "agents"
  | "champions"
  | "maps"
  | "weapons"
  | "items"
  | "modes"
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

export type GameExpansion = {
  slug: string;
  name: string;
  kind: "dlc" | "expansion" | "content-pack";
  releaseLabel?: string;
};

export type GameConfig = {
  slug: string;
  name: string;
  aliases?: string[];
  description: Record<Locale, string>;
  genre: string;
  platforms: string[];
  ageRating: string;
  themeKey: GameThemeKey;
  modules: GameModuleKey[];
  expansions?: GameExpansion[];
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
  champions: { "pt-BR": "Campeões", en: "Champions", es: "Campeones" },
  maps: { "pt-BR": "Mapas", en: "Maps", es: "Mapas" },
  weapons: { "pt-BR": "Armas", en: "Weapons", es: "Armas" },
  items: { "pt-BR": "Itens", en: "Items", es: "Objetos" },
  modes: { "pt-BR": "Modos", en: "Modes", es: "Modos" },
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

function makeMgpPlaceholder(label: string, subtitle: string, from: string, to: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/><circle cx="1340" cy="130" r="390" fill="white" opacity=".035"/><circle cx="180" cy="820" r="480" fill="white" opacity=".025"/><text x="110" y="650" fill="white" font-family="Arial,sans-serif" font-size="86" font-weight="700">${label}</text><text x="114" y="716" fill="white" opacity=".62" font-family="Arial,sans-serif" font-size="30" letter-spacing="5">${subtitle}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const DS3_PLACEHOLDER = makeMgpPlaceholder("DARK SOULS III", "MGP · GAME HUB", "#120d0a", "#6b2d17");
const ELDEN_RING_PLACEHOLDER = makeMgpPlaceholder("ELDEN RING", "MGP · THE LANDS BETWEEN", "#11120d", "#726021");
const NIGHTREIGN_PLACEHOLDER = makeMgpPlaceholder("ELDEN RING NIGHTREIGN", "MGP · STANDALONE HUB", "#080f18", "#244e73");
const LOL_PLACEHOLDER = makeMgpPlaceholder("LEAGUE OF LEGENDS", "MGP · COMPETITIVE HUB", "#06151d", "#0d6671");
const FC_PLACEHOLDER = makeMgpPlaceholder("EA SPORTS FC", "MGP · FOOTBALL HUB", "#07110c", "#187244");

export const GAMES: GameConfig[] = [
  {
    slug: "dark-souls-remastered",
    name: "Dark Souls Remastered",
    aliases: ["Dark Souls", "DSR", "DS1"],
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
    expansions: [
      { slug: "artorias-of-the-abyss", name: "Artorias of the Abyss", kind: "dlc" },
    ],
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
    slug: "dark-souls-iii",
    name: "Dark Souls III",
    aliases: ["Dark Souls 3", "DS3"],
    description: {
      "pt-BR": "O capítulo final da trilogia Dark Souls: combate preciso, builds profundas e um mundo consumido pelas cinzas.",
      en: "The final Dark Souls trilogy chapter: precise combat, deep builds and a world consumed by ash.",
      es: "El capítulo final de la trilogía Dark Souls: combate preciso, builds profundas y un mundo consumido por las cenizas.",
    },
    genre: "Action RPG",
    platforms: ["PC", "PlayStation 4", "Xbox One"],
    ageRating: "16+",
    themeKey: "dark_souls",
    modules: ["overview", "news", "builds", "bosses", "guides"],
    expansions: [
      { slug: "ashes-of-ariandel", name: "Ashes of Ariandel", kind: "dlc", releaseLabel: "2016" },
      { slug: "the-ringed-city", name: "The Ringed City", kind: "dlc", releaseLabel: "2017" },
    ],
    profileFields: [
      { key: "favorite_weapon", type: "text", maxLength: 60, label: { "pt-BR": "Arma favorita", en: "Favorite weapon", es: "Arma favorita" } },
      { key: "favorite_build", type: "text", maxLength: 60, label: { "pt-BR": "Build favorita", en: "Favorite build", es: "Build favorita" } },
      { key: "favorite_boss", type: "text", maxLength: 60, label: { "pt-BR": "Chefe favorito", en: "Favorite boss", es: "Jefe favorito" } },
      { key: "covenant", type: "text", maxLength: 60, label: { "pt-BR": "Pacto favorito", en: "Favorite covenant", es: "Pacto favorito" } },
      { key: "starting_class", type: "text", maxLength: 40, label: { "pt-BR": "Classe inicial", en: "Starting class", es: "Clase inicial" } },
      { key: "runs_count", type: "number", min: 0, max: 9999, label: { "pt-BR": "Runs concluídas", en: "Completed runs", es: "Runs completadas" } },
      { key: "highest_ng", type: "number", min: 0, max: 99, label: { "pt-BR": "NG+ mais alto", en: "Highest NG+", es: "NG+ más alto" } },
      { key: "personal_notes", type: "textarea", maxLength: 1000, label: { "pt-BR": "Notas pessoais", en: "Personal notes", es: "Notas personales" } },
    ],
    visual: {
      coverImage: DS3_PLACEHOLDER,
      heroImage: DS3_PLACEHOLDER,
      backgroundImage: DS3_PLACEHOLDER,
      fallbackImage: darkSoulsAtmosphere,
      assetSource: "MGP-generated placeholder; official Bandai Namco assets pending production asset review",
      assetLicense: "MGP original placeholder; no third-party game artwork embedded",
    },
  },
  {
    slug: "elden-ring",
    name: "Elden Ring",
    aliases: ["Elden Ring Shadow of the Erdtree", "Shadow of the Erdtree"],
    description: {
      "pt-BR": "Action RPG de mundo aberto da FromSoftware, com exploração livre, builds extensas e a expansão Shadow of the Erdtree no mesmo hub.",
      en: "FromSoftware's open-world action RPG, with free-form exploration, extensive builds and Shadow of the Erdtree inside the same hub.",
      es: "RPG de acción de mundo abierto de FromSoftware, con exploración libre, builds extensas y Shadow of the Erdtree dentro del mismo hub.",
    },
    genre: "Open-world Action RPG",
    platforms: ["PC", "PlayStation", "Xbox"],
    ageRating: "16+",
    themeKey: "dark_souls",
    modules: ["overview", "news", "builds", "bosses", "guides"],
    expansions: [
      { slug: "shadow-of-the-erdtree", name: "Shadow of the Erdtree", kind: "expansion", releaseLabel: "2024" },
      { slug: "tarnished-pack", name: "Tarnished Pack", kind: "content-pack", releaseLabel: "2026" },
    ],
    profileFields: [
      { key: "favorite_weapon", type: "text", maxLength: 60, label: { "pt-BR": "Arma favorita", en: "Favorite weapon", es: "Arma favorita" } },
      { key: "favorite_build", type: "text", maxLength: 60, label: { "pt-BR": "Build favorita", en: "Favorite build", es: "Build favorita" } },
      { key: "favorite_boss", type: "text", maxLength: 60, label: { "pt-BR": "Chefe favorito", en: "Favorite boss", es: "Jefe favorito" } },
      { key: "favorite_spirit_ash", type: "text", maxLength: 60, label: { "pt-BR": "Cinza espiritual favorita", en: "Favorite Spirit Ash", es: "Ceniza espiritual favorita" } },
      { key: "favorite_ending", type: "text", maxLength: 80, label: { "pt-BR": "Final favorito", en: "Favorite ending", es: "Final favorito" } },
      { key: "starting_class", type: "text", maxLength: 40, label: { "pt-BR": "Classe inicial", en: "Starting class", es: "Clase inicial" } },
      { key: "highest_ng", type: "number", min: 0, max: 99, label: { "pt-BR": "NG+ mais alto", en: "Highest NG+", es: "NG+ más alto" } },
      { key: "personal_notes", type: "textarea", maxLength: 1000, label: { "pt-BR": "Notas pessoais", en: "Personal notes", es: "Notas personales" } },
    ],
    visual: {
      coverImage: ELDEN_RING_PLACEHOLDER,
      heroImage: ELDEN_RING_PLACEHOLDER,
      backgroundImage: ELDEN_RING_PLACEHOLDER,
      fallbackImage: darkSoulsAtmosphere,
      assetSource: "MGP-generated placeholder; official Bandai Namco assets pending production asset review",
      assetLicense: "MGP original placeholder; no third-party game artwork embedded",
    },
  },
  {
    slug: "elden-ring-nightreign",
    name: "Elden Ring Nightreign",
    aliases: ["Nightreign", "Night Ring"],
    description: {
      "pt-BR": "Aventura cooperativa standalone no universo de Elden Ring, centrada em Nightfarers, runs e encontros contra Nightlords.",
      en: "A standalone cooperative adventure in the Elden Ring universe focused on Nightfarers, runs and Nightlord encounters.",
      es: "Una aventura cooperativa independiente en el universo de Elden Ring centrada en Nightfarers, runs y enfrentamientos contra Nightlords.",
    },
    genre: "Co-op Action RPG",
    platforms: ["PC", "PlayStation", "Xbox"],
    ageRating: "16+",
    themeKey: "dark_souls",
    modules: ["overview", "news", "builds", "bosses", "guides", "lfg"],
    expansions: [
      { slug: "the-forsaken-hollows", name: "The Forsaken Hollows", kind: "dlc" },
    ],
    profileFields: [
      { key: "favorite_nightfarer", type: "text", maxLength: 60, label: { "pt-BR": "Nightfarer favorito", en: "Favorite Nightfarer", es: "Nightfarer favorito" } },
      { key: "favorite_nightlord", type: "text", maxLength: 60, label: { "pt-BR": "Nightlord favorito", en: "Favorite Nightlord", es: "Nightlord favorito" } },
      { key: "preferred_style", type: "text", maxLength: 60, label: { "pt-BR": "Estilo preferido", en: "Preferred style", es: "Estilo preferido" } },
      { key: "favorite_relic_setup", type: "text", maxLength: 120, label: { "pt-BR": "Setup de relíquias", en: "Relic setup", es: "Configuración de reliquias" } },
      { key: "runs_count", type: "number", min: 0, max: 99999, label: { "pt-BR": "Runs", en: "Runs", es: "Runs" } },
      { key: "wins_count", type: "number", min: 0, max: 99999, label: { "pt-BR": "Vitórias", en: "Wins", es: "Victorias" } },
      { key: "personal_notes", type: "textarea", maxLength: 1000, label: { "pt-BR": "Notas pessoais", en: "Personal notes", es: "Notas personales" } },
    ],
    visual: {
      coverImage: NIGHTREIGN_PLACEHOLDER,
      heroImage: NIGHTREIGN_PLACEHOLDER,
      backgroundImage: NIGHTREIGN_PLACEHOLDER,
      fallbackImage: darkSoulsAtmosphere,
      assetSource: "MGP-generated placeholder; official Bandai Namco assets pending production asset review",
      assetLicense: "MGP original placeholder; no third-party game artwork embedded",
    },
  },
  {
    slug: "valorant",
    name: "Valorant",
    aliases: ["VALORANT"],
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
  {
    slug: "league-of-legends",
    name: "League of Legends",
    aliases: ["LoL", "League"],
    description: {
      "pt-BR": "MOBA competitivo 5v5 da Riot Games. Campeões, rotas, itens, macro e execução convergem na disputa pelo Nexus.",
      en: "Riot Games' competitive 5v5 MOBA. Champions, lanes, items, macro and execution converge in the fight for the Nexus.",
      es: "MOBA competitivo 5v5 de Riot Games. Campeones, líneas, objetos, macro y ejecución convergen en la lucha por el Nexus.",
    },
    genre: "MOBA",
    platforms: ["PC"],
    ageRating: "12+",
    themeKey: "competitive",
    modules: ["overview", "news", "champions", "maps", "items", "skins", "competitive", "guides"],
    profileFields: [
      { key: "favorite_champion", type: "text", maxLength: 50, label: { "pt-BR": "Campeão favorito", en: "Favorite champion", es: "Campeón favorito" } },
      { key: "preferred_role", type: "select", options: ["Top", "Jungle", "Mid", "ADC", "Support", "Fill"], label: { "pt-BR": "Rota preferida", en: "Preferred role", es: "Rol preferido" } },
      { key: "secondary_role", type: "select", options: ["Top", "Jungle", "Mid", "ADC", "Support", "Fill"], label: { "pt-BR": "Rota secundária", en: "Secondary role", es: "Rol secundario" } },
      { key: "server", type: "text", maxLength: 20, label: { "pt-BR": "Servidor", en: "Server", es: "Servidor" } },
      { key: "current_rank_manual", type: "text", maxLength: 40, label: { "pt-BR": "Rank atual (informado)", en: "Current rank (declared)", es: "Rango actual (declarado)" } },
      { key: "peak_rank_manual", type: "text", maxLength: 40, label: { "pt-BR": "Peak (informado)", en: "Peak rank (declared)", es: "Peak (declarado)" } },
      { key: "favorite_skin", type: "text", maxLength: 80, label: { "pt-BR": "Skin favorita", en: "Favorite skin", es: "Skin favorita" } },
      { key: "personal_notes", type: "textarea", maxLength: 1000, label: { "pt-BR": "Notas pessoais", en: "Personal notes", es: "Notas personales" } },
    ],
    visual: {
      coverImage: LOL_PLACEHOLDER,
      heroImage: LOL_PLACEHOLDER,
      backgroundImage: LOL_PLACEHOLDER,
      fallbackImage: valorantAtmosphere,
      assetSource: "MGP-generated placeholder; Riot-approved/public assets pending production asset review",
      assetLicense: "MGP original placeholder; no third-party game artwork embedded",
    },
  },
  {
    slug: "ea-sports-fc",
    name: "EA SPORTS FC",
    aliases: ["FIFA", "EA FC", "FC 26", "EA SPORTS FC 26"],
    description: {
      "pt-BR": "Hub permanente da série de futebol da EA, cobrindo Ultimate Team, Clubs, Carreira e competitivo sem recriar o perfil a cada edição anual.",
      en: "A permanent hub for EA's football series, covering Ultimate Team, Clubs, Career and competitive play without recreating the profile every annual edition.",
      es: "Un hub permanente para la serie de fútbol de EA, cubriendo Ultimate Team, Clubs, Carrera y competitivo sin recrear el perfil en cada edición anual.",
    },
    genre: "Sports",
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    ageRating: "Livre",
    themeKey: "competitive",
    modules: ["overview", "news", "modes", "competitive", "guides"],
    profileFields: [
      { key: "favorite_mode", type: "select", options: ["Ultimate Team", "Clubs", "Career", "Kick-Off", "Seasons", "Other"], label: { "pt-BR": "Modo favorito", en: "Favorite mode", es: "Modo favorito" } },
      { key: "favorite_club", type: "text", maxLength: 80, label: { "pt-BR": "Clube favorito", en: "Favorite club", es: "Club favorito" } },
      { key: "platform", type: "select", options: ["PC", "PlayStation", "Xbox", "Nintendo Switch"], label: { "pt-BR": "Plataforma", en: "Platform", es: "Plataforma" } },
      { key: "division_rank", type: "text", maxLength: 60, label: { "pt-BR": "Divisão / rank", en: "Division / rank", es: "División / rango" } },
      { key: "favorite_formation", type: "text", maxLength: 40, label: { "pt-BR": "Formação favorita", en: "Favorite formation", es: "Formación favorita" } },
      { key: "favorite_player", type: "text", maxLength: 80, label: { "pt-BR": "Jogador favorito", en: "Favorite player", es: "Jugador favorito" } },
      { key: "personal_notes", type: "textarea", maxLength: 1000, label: { "pt-BR": "Notas pessoais", en: "Personal notes", es: "Notas personales" } },
    ],
    visual: {
      coverImage: FC_PLACEHOLDER,
      heroImage: FC_PLACEHOLDER,
      backgroundImage: FC_PLACEHOLDER,
      fallbackImage: valorantAtmosphere,
      assetSource: "MGP-generated placeholder; EA-approved/public assets pending production asset review",
      assetLicense: "MGP original placeholder; no third-party game artwork embedded",
    },
  },
];

export function getGameConfig(slug: string): GameConfig | undefined {
  return GAMES.find((game) => game.slug === slug);
}
