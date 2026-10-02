import type { AppLocale as Locale } from "@/i18n/translations";
import darkSoulsAtmosphere from "@/assets/dark-souls-atmosphere.jpg";
import valorantAtmosphere from "@/assets/valorant-atmosphere.jpg";

export type GameThemeKey = "dark_souls" | "valorant" | "competitive";

export type GameModuleKey =
  | "overview"
  | "community"
  | "builds"
  | "dps-test"
  | "fashion-test"
  | "bosses"
  | "guides"
  | "warframes"
  | "news"
  | "agents"
  | "champions"
  | "runes"
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
  "dps-test": { "pt-BR": "DPS Test", en: "DPS Test", es: "DPS Test" },
  "fashion-test": { "pt-BR": "Fashion Test", en: "Fashion Test", es: "Fashion Test" },
  bosses: { "pt-BR": "Chefes", en: "Bosses", es: "Jefes" },
  guides: { "pt-BR": "Guias", en: "Guides", es: "Guías" },
  warframes: { "pt-BR": "Warframes", en: "Warframes", es: "Warframes" },
  news: { "pt-BR": "Novidades", en: "News", es: "Novedades" },
  agents: { "pt-BR": "Agentes", en: "Agents", es: "Agentes" },
  champions: { "pt-BR": "Campeões", en: "Champions", es: "Campeones" },
  runes: { "pt-BR": "Runas", en: "Runes", es: "Runas" },
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
const VALORANT_CARD_MARK = "/game-logos/valorant-card.png";

function makeMgpPlaceholder(label: string, subtitle: string, from: string, to: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/><circle cx="1340" cy="130" r="390" fill="white" opacity=".035"/><circle cx="180" cy="820" r="480" fill="white" opacity=".025"/><text x="110" y="650" fill="white" font-family="Arial,sans-serif" font-size="86" font-weight="700">${label}</text><text x="114" y="716" fill="white" opacity=".62" font-family="Arial,sans-serif" font-size="30" letter-spacing="5">${subtitle}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const NIGHTREIGN_PLACEHOLDER = makeMgpPlaceholder(
  "ELDEN RING NIGHTREIGN",
  "ÍMPAR · STANDALONE HUB",
  "#080f18",
  "#244e73",
);
const WARFRAME_PLACEHOLDER = makeMgpPlaceholder(
  "WARFRAME",
  "ÍMPAR · TENNO DATABASE",
  "#061016",
  "#1a5663",
);
const LOL_COVER = "/LoL-Symbol-500x281.png";
const DS3_COVER = "/game-covers/ds3.webp";
const ELDEN_RING_COVER = "/game-covers/elden-ring.webp";
const FC26_COVER = "/game-covers/fc26.webp";

export const GAMES: GameConfig[] = [
  {
    slug: "dark-souls-remastered",
    name: "Dark Souls Remastered",
    aliases: ["Dark Souls", "DSR", "DS1"],
    description: {
      "pt-BR":
        "Um RPG de ação sombrio e implacável, feito de descobertas, atalhos secretos e chefes memoráveis.",
      en: "A dark, unforgiving action RPG built on discovery, secret shortcuts and memorable bosses.",
      es: "Un RPG de acción oscuro e implacable, construido sobre descubrimientos, atajos secretos y jefes memorables.",
    },
    genre: "Action RPG",
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    ageRating: "16+",
    themeKey: "dark_souls",
    modules: ["overview", "builds", "dps-test", "fashion-test", "bosses", "items", "guides"],
    expansions: [{ slug: "artorias-of-the-abyss", name: "Artorias of the Abyss", kind: "dlc" }],
    profileFields: [
      {
        key: "favorite_weapon",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Arma favorita", en: "Favorite weapon", es: "Arma favorita" },
      },
      {
        key: "favorite_build",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Build favorita", en: "Favorite build", es: "Build favorita" },
      },
      {
        key: "favorite_boss",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Chefe favorito", en: "Favorite boss", es: "Jefe favorito" },
      },
      {
        key: "hardest_boss",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Chefe mais difícil", en: "Hardest boss", es: "Jefe más difícil" },
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
        label: { "pt-BR": "Classe inicial", en: "Starting class", es: "Clase inicial" },
      },
      {
        key: "runs_count",
        type: "number",
        min: 0,
        max: 9999,
        label: { "pt-BR": "Runs concluídas", en: "Completed runs", es: "Runs completadas" },
      },
      {
        key: "highest_ng",
        type: "number",
        min: 0,
        max: 99,
        label: { "pt-BR": "NG+ mais alto", en: "Highest NG+", es: "NG+ más alto" },
      },
      {
        key: "personal_notes",
        type: "textarea",
        maxLength: 1000,
        label: { "pt-BR": "Notas pessoais", en: "Personal notes", es: "Notas personales" },
      },
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
      assetLicense: "Third-party promotional cover art; source attribution tracked by ÍMPAR",
    },
  },
  {
    slug: "dark-souls-iii",
    name: "Dark Souls III",
    aliases: ["Dark Souls 3", "DS3"],
    description: {
      "pt-BR":
        "O capítulo final da trilogia Dark Souls: combate preciso, builds profundas e um mundo consumido pelas cinzas.",
      en: "The final Dark Souls trilogy chapter: precise combat, deep builds and a world consumed by ash.",
      es: "El capítulo final de la trilogía Dark Souls: combate preciso, builds profundas y un mundo consumido por las cenizas.",
    },
    genre: "Action RPG",
    platforms: ["PC", "PlayStation 4", "Xbox One"],
    ageRating: "16+",
    themeKey: "dark_souls",
    modules: ["overview", "news", "builds", "dps-test", "fashion-test", "bosses", "items", "guides"],
    expansions: [
      { slug: "ashes-of-ariandel", name: "Ashes of Ariandel", kind: "dlc", releaseLabel: "2016" },
      { slug: "the-ringed-city", name: "The Ringed City", kind: "dlc", releaseLabel: "2017" },
    ],
    profileFields: [
      {
        key: "favorite_weapon",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Arma favorita", en: "Favorite weapon", es: "Arma favorita" },
      },
      {
        key: "favorite_build",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Build favorita", en: "Favorite build", es: "Build favorita" },
      },
      {
        key: "favorite_boss",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Chefe favorito", en: "Favorite boss", es: "Jefe favorito" },
      },
      {
        key: "covenant",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Pacto favorito", en: "Favorite covenant", es: "Pacto favorito" },
      },
      {
        key: "starting_class",
        type: "text",
        maxLength: 40,
        label: { "pt-BR": "Classe inicial", en: "Starting class", es: "Clase inicial" },
      },
      {
        key: "runs_count",
        type: "number",
        min: 0,
        max: 9999,
        label: { "pt-BR": "Runs concluídas", en: "Completed runs", es: "Runs completadas" },
      },
      {
        key: "highest_ng",
        type: "number",
        min: 0,
        max: 99,
        label: { "pt-BR": "NG+ mais alto", en: "Highest NG+", es: "NG+ más alto" },
      },
      {
        key: "personal_notes",
        type: "textarea",
        maxLength: 1000,
        label: { "pt-BR": "Notas pessoais", en: "Personal notes", es: "Notas personales" },
      },
    ],
    visual: {
      coverImage: DS3_COVER,
      heroImage: DS3_COVER,
      backgroundImage: DS3_COVER,
      fallbackImage: darkSoulsAtmosphere,
      cardObjectPosition: "48% 50%",
      heroObjectPosition: "50% 43%",
      assetSource: "User-provided repository artwork",
      assetLicense: "User-provided asset; usage rights managed by project owner",
    },
  },
  {
    slug: "elden-ring",
    name: "Elden Ring",
    aliases: ["Elden Ring Shadow of the Erdtree", "Shadow of the Erdtree"],
    description: {
      "pt-BR":
        "Action RPG de mundo aberto da FromSoftware, com exploração livre, builds extensas e a expansão Shadow of the Erdtree no mesmo hub.",
      en: "FromSoftware's open-world action RPG, with free-form exploration, extensive builds and Shadow of the Erdtree inside the same hub.",
      es: "RPG de acción de mundo abierto de FromSoftware, con exploración libre, builds extensas y Shadow of the Erdtree dentro del mismo hub.",
    },
    genre: "Open-world Action RPG",
    platforms: ["PC", "PlayStation", "Xbox"],
    ageRating: "16+",
    themeKey: "dark_souls",
    modules: ["overview", "news", "builds", "bosses", "guides"],
    expansions: [
      {
        slug: "shadow-of-the-erdtree",
        name: "Shadow of the Erdtree",
        kind: "expansion",
        releaseLabel: "2024",
      },
      {
        slug: "tarnished-pack",
        name: "Tarnished Pack",
        kind: "content-pack",
        releaseLabel: "2026",
      },
    ],
    profileFields: [
      {
        key: "favorite_weapon",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Arma favorita", en: "Favorite weapon", es: "Arma favorita" },
      },
      {
        key: "favorite_build",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Build favorita", en: "Favorite build", es: "Build favorita" },
      },
      {
        key: "favorite_boss",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Chefe favorito", en: "Favorite boss", es: "Jefe favorito" },
      },
      {
        key: "favorite_spirit_ash",
        type: "text",
        maxLength: 60,
        label: {
          "pt-BR": "Cinza espiritual favorita",
          en: "Favorite Spirit Ash",
          es: "Ceniza espiritual favorita",
        },
      },
      {
        key: "favorite_ending",
        type: "text",
        maxLength: 80,
        label: { "pt-BR": "Final favorito", en: "Favorite ending", es: "Final favorito" },
      },
      {
        key: "starting_class",
        type: "text",
        maxLength: 40,
        label: { "pt-BR": "Classe inicial", en: "Starting class", es: "Clase inicial" },
      },
      {
        key: "highest_ng",
        type: "number",
        min: 0,
        max: 99,
        label: { "pt-BR": "NG+ mais alto", en: "Highest NG+", es: "NG+ más alto" },
      },
      {
        key: "personal_notes",
        type: "textarea",
        maxLength: 1000,
        label: { "pt-BR": "Notas pessoais", en: "Personal notes", es: "Notas personales" },
      },
    ],
    visual: {
      coverImage: ELDEN_RING_COVER,
      heroImage: ELDEN_RING_COVER,
      backgroundImage: ELDEN_RING_COVER,
      fallbackImage: darkSoulsAtmosphere,
      cardObjectPosition: "54% 52%",
      heroObjectPosition: "55% 52%",
      assetSource: "User-provided repository artwork",
      assetLicense: "User-provided asset; usage rights managed by project owner",
    },
  },
  {
    slug: "elden-ring-nightreign",
    name: "Elden Ring Nightreign",
    aliases: ["Nightreign", "Night Ring"],
    description: {
      "pt-BR":
        "Aventura cooperativa standalone no universo de Elden Ring, centrada em Nightfarers, runs e encontros contra Nightlords.",
      en: "A standalone cooperative adventure in the Elden Ring universe focused on Nightfarers, runs and Nightlord encounters.",
      es: "Una aventura cooperativa independiente en el universo de Elden Ring centrada en Nightfarers, runs y enfrentamientos contra Nightlords.",
    },
    genre: "Co-op Action RPG",
    platforms: ["PC", "PlayStation", "Xbox"],
    ageRating: "16+",
    themeKey: "dark_souls",
    modules: ["overview", "news", "builds", "bosses", "guides", "lfg"],
    expansions: [{ slug: "the-forsaken-hollows", name: "The Forsaken Hollows", kind: "dlc" }],
    profileFields: [
      {
        key: "favorite_nightfarer",
        type: "text",
        maxLength: 60,
        label: {
          "pt-BR": "Nightfarer favorito",
          en: "Favorite Nightfarer",
          es: "Nightfarer favorito",
        },
      },
      {
        key: "favorite_nightlord",
        type: "text",
        maxLength: 60,
        label: {
          "pt-BR": "Nightlord favorito",
          en: "Favorite Nightlord",
          es: "Nightlord favorito",
        },
      },
      {
        key: "preferred_style",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Estilo preferido", en: "Preferred style", es: "Estilo preferido" },
      },
      {
        key: "favorite_relic_setup",
        type: "text",
        maxLength: 120,
        label: {
          "pt-BR": "Setup de relíquias",
          en: "Relic setup",
          es: "Configuración de reliquias",
        },
      },
      {
        key: "runs_count",
        type: "number",
        min: 0,
        max: 99999,
        label: { "pt-BR": "Runs", en: "Runs", es: "Runs" },
      },
      {
        key: "wins_count",
        type: "number",
        min: 0,
        max: 99999,
        label: { "pt-BR": "Vitórias", en: "Wins", es: "Victorias" },
      },
      {
        key: "personal_notes",
        type: "textarea",
        maxLength: 1000,
        label: { "pt-BR": "Notas pessoais", en: "Personal notes", es: "Notas personales" },
      },
    ],
    visual: {
      coverImage: NIGHTREIGN_PLACEHOLDER,
      heroImage: NIGHTREIGN_PLACEHOLDER,
      backgroundImage: NIGHTREIGN_PLACEHOLDER,
      fallbackImage: darkSoulsAtmosphere,
      assetSource:
        "ÍMPAR-generated placeholder; official Bandai Namco assets pending production asset review",
      assetLicense: "ÍMPAR original placeholder; no third-party game artwork embedded",
    },
  },
  {
    slug: "warframe",
    name: "Warframe",
    aliases: ["War Frame", "Tenno"],
    description: {
      "pt-BR":
        "Ação cooperativa free-to-play com Warframes, armas, Mods, missões e progressão por sistemas que se conectam ao longo do Sistema de Origem.",
      en: "A free-to-play cooperative action game built around Warframes, weapons, Mods, missions and interconnected progression systems across the Origin System.",
      es: "Juego de acción cooperativo free-to-play centrado en Warframes, armas, Mods, misiones y sistemas de progresión conectados en el Sistema Origen.",
    },
    genre: "Action RPG / Looter Shooter",
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
    ageRating: "16+",
    themeKey: "competitive",
    modules: ["overview", "warframes", "builds", "weapons", "guides", "news"],
    profileFields: [
      {
        key: "favorite_warframe",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Warframe favorito", en: "Favorite Warframe", es: "Warframe favorito" },
      },
      {
        key: "mastery_rank",
        type: "number",
        min: 0,
        max: 40,
        label: { "pt-BR": "Nível de Maestria", en: "Mastery Rank", es: "Rango de Maestría" },
      },
      {
        key: "favorite_weapon",
        type: "text",
        maxLength: 80,
        label: { "pt-BR": "Arma favorita", en: "Favorite weapon", es: "Arma favorita" },
      },
      {
        key: "favorite_companion",
        type: "text",
        maxLength: 80,
        label: { "pt-BR": "Companheiro favorito", en: "Favorite companion", es: "Compañero favorito" },
      },
      {
        key: "preferred_activity",
        type: "text",
        maxLength: 80,
        label: { "pt-BR": "Atividade preferida", en: "Preferred activity", es: "Actividad preferida" },
      },
      {
        key: "personal_notes",
        type: "textarea",
        maxLength: 1000,
        label: { "pt-BR": "Notas pessoais", en: "Personal notes", es: "Notas personales" },
      },
    ],
    visual: {
      coverImage: WARFRAME_PLACEHOLDER,
      heroImage: WARFRAME_PLACEHOLDER,
      backgroundImage: WARFRAME_PLACEHOLDER,
      fallbackImage: valorantAtmosphere,
      cardObjectPosition: "center",
      heroObjectPosition: "center",
      assetSource: "ÍMPAR-generated Warframe placeholder; official media can replace it after asset review",
      assetLicense: "ÍMPAR original placeholder; no third-party artwork embedded",
    },
  },
  {
    slug: "valorant",
    name: "Valorant",
    aliases: ["VALORANT"],
    description: {
      "pt-BR":
        "FPS tático 5v5 com agentes, habilidades e economia de rodada. Precisão, informação e coordenação decidem a partida.",
      en: "A 5v5 tactical FPS with agents, abilities and round economy. Aim, information and coordination decide the match.",
      es: "FPS táctico 5v5 con agentes, habilidades y economía por rondas. Precisión, información y coordinación deciden la partida.",
    },
    genre: "Tactical FPS",
    platforms: ["PC", "PlayStation 5", "Xbox Series X|S"],
    ageRating: "16+",
    themeKey: "valorant",
    modules: ["overview", "news", "agents", "maps", "weapons", "skins", "competitive", "lineups"],
    profileFields: [
      {
        key: "favorite_agent",
        type: "text",
        maxLength: 40,
        label: { "pt-BR": "Agente favorito", en: "Favorite agent", es: "Agente favorito" },
      },
      {
        key: "preferred_role",
        type: "select",
        options: ["Duelist", "Initiator", "Controller", "Sentinel", "Flex"],
        label: { "pt-BR": "Função preferida", en: "Preferred role", es: "Rol preferido" },
      },
      {
        key: "favorite_map",
        type: "text",
        maxLength: 40,
        label: { "pt-BR": "Mapa favorito", en: "Favorite map", es: "Mapa favorito" },
      },
      {
        key: "favorite_weapon",
        type: "text",
        maxLength: 40,
        label: { "pt-BR": "Arma favorita", en: "Favorite weapon", es: "Arma favorita" },
      },
      {
        key: "current_rank_manual",
        type: "text",
        maxLength: 40,
        label: {
          "pt-BR": "Rank atual (informado)",
          en: "Current rank (declared)",
          es: "Rango actual (declarado)",
        },
      },
      {
        key: "peak_rank_manual",
        type: "text",
        maxLength: 40,
        label: {
          "pt-BR": "Rank mais alto (informado)",
          en: "Peak rank (declared)",
          es: "Rango máximo (declarado)",
        },
      },
      {
        key: "personal_notes",
        type: "textarea",
        maxLength: 1000,
        label: { "pt-BR": "Notas pessoais", en: "Personal notes", es: "Notas personales" },
      },
    ],
    visual: {
      coverImage: VALORANT_CARD_MARK,
      heroImage: VALORANT_CARD_MARK,
      backgroundImage: VALORANT_COVER,
      fallbackImage: valorantAtmosphere,
      cardObjectPosition: "center",
      heroObjectPosition: "center",
      trailerYoutubeId: "e_E9W2vsRbQ",
      trailerUrl: "https://www.youtube.com/watch?v=e_E9W2vsRbQ",
      assetSource: "User-provided VALORANT card artwork stored locally in the ÍMPAR repository; hub background retains its separately tracked promotional reference",
      assetLicense: "User-provided project asset using the VALORANT brand mark; repository provenance retained",
    },
  },
  {
    slug: "league-of-legends",
    name: "League of Legends",
    aliases: ["LoL", "League"],
    description: {
      "pt-BR":
        "MOBA competitivo 5v5 da Riot Games. Campeões, rotas, itens, macro e execução convergem na disputa pelo Nexus.",
      en: "Riot Games' competitive 5v5 MOBA. Champions, lanes, items, macro and execution converge in the fight for the Nexus.",
      es: "MOBA competitivo 5v5 de Riot Games. Campeones, líneas, objetos, macro y ejecución convergen en la lucha por el Nexus.",
    },
    genre: "MOBA",
    platforms: ["PC"],
    ageRating: "12+",
    themeKey: "competitive",
    modules: ["overview", "news", "champions", "runes", "builds", "maps", "items", "skins", "competitive", "guides"],
    profileFields: [
      {
        key: "favorite_champion",
        type: "text",
        maxLength: 50,
        label: { "pt-BR": "Campeão favorito", en: "Favorite champion", es: "Campeón favorito" },
      },
      {
        key: "preferred_role",
        type: "select",
        options: ["Top", "Jungle", "Mid", "ADC", "Support", "Fill"],
        label: { "pt-BR": "Rota preferida", en: "Preferred role", es: "Rol preferido" },
      },
      {
        key: "secondary_role",
        type: "select",
        options: ["Top", "Jungle", "Mid", "ADC", "Support", "Fill"],
        label: { "pt-BR": "Rota secundária", en: "Secondary role", es: "Rol secundario" },
      },
      {
        key: "server",
        type: "text",
        maxLength: 20,
        label: { "pt-BR": "Servidor", en: "Server", es: "Servidor" },
      },
      {
        key: "current_rank_manual",
        type: "text",
        maxLength: 40,
        label: {
          "pt-BR": "Rank atual (informado)",
          en: "Current rank (declared)",
          es: "Rango actual (declarado)",
        },
      },
      {
        key: "peak_rank_manual",
        type: "text",
        maxLength: 40,
        label: { "pt-BR": "Peak (informado)", en: "Peak rank (declared)", es: "Peak (declarado)" },
      },
      {
        key: "favorite_skin",
        type: "text",
        maxLength: 80,
        label: { "pt-BR": "Skin favorita", en: "Favorite skin", es: "Skin favorita" },
      },
      {
        key: "personal_notes",
        type: "textarea",
        maxLength: 1000,
        label: { "pt-BR": "Notas pessoais", en: "Personal notes", es: "Notas personales" },
      },
    ],
    visual: {
      coverImage: LOL_COVER,
      heroImage: LOL_COVER,
      backgroundImage: LOL_COVER,
      fallbackImage: valorantAtmosphere,
      assetSource: "User-provided League of Legends logo stored in the ÍMPAR repository",
      assetLicense: "User-provided project asset; provenance retained in repository history",
    },
  },
  {
    slug: "ea-sports-fc",
    name: "EA SPORTS FC",
    aliases: ["FIFA", "EA FC", "FC 26", "EA SPORTS FC 26"],
    description: {
      "pt-BR":
        "Hub permanente da série de futebol da EA, cobrindo Ultimate Team, Clubs, Carreira e competitivo sem recriar o perfil a cada edição anual.",
      en: "A permanent hub for EA's football series, covering Ultimate Team, Clubs, Career and competitive play without recreating the profile every annual edition.",
      es: "Un hub permanente para la serie de fútbol de EA, cubriendo Ultimate Team, Clubs, Carrera y competitivo sin recrear el perfil en cada edición anual.",
    },
    genre: "Sports",
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
    ageRating: "Livre",
    themeKey: "competitive",
    modules: ["overview", "news", "modes", "competitive", "guides"],
    profileFields: [
      {
        key: "favorite_mode",
        type: "select",
        options: ["Ultimate Team", "Clubs", "Career", "Kick-Off", "Seasons", "Other"],
        label: { "pt-BR": "Modo favorito", en: "Favorite mode", es: "Modo favorito" },
      },
      {
        key: "favorite_club",
        type: "text",
        maxLength: 80,
        label: { "pt-BR": "Clube favorito", en: "Favorite club", es: "Club favorito" },
      },
      {
        key: "platform",
        type: "select",
        options: ["PC", "PlayStation", "Xbox", "Nintendo Switch"],
        label: { "pt-BR": "Plataforma", en: "Platform", es: "Plataforma" },
      },
      {
        key: "division_rank",
        type: "text",
        maxLength: 60,
        label: { "pt-BR": "Divisão / rank", en: "Division / rank", es: "División / rango" },
      },
      {
        key: "favorite_formation",
        type: "text",
        maxLength: 40,
        label: { "pt-BR": "Formação favorita", en: "Favorite formation", es: "Formación favorita" },
      },
      {
        key: "favorite_player",
        type: "text",
        maxLength: 80,
        label: { "pt-BR": "Jogador favorito", en: "Favorite player", es: "Jugador favorito" },
      },
      {
        key: "personal_notes",
        type: "textarea",
        maxLength: 1000,
        label: { "pt-BR": "Notas pessoais", en: "Personal notes", es: "Notas personales" },
      },
    ],
    visual: {
      coverImage: FC26_COVER,
      heroImage: FC26_COVER,
      backgroundImage: FC26_COVER,
      fallbackImage: valorantAtmosphere,
      cardObjectPosition: "50% 50%",
      heroObjectPosition: "50% 48%",
      assetSource: "User-provided repository artwork",
      assetLicense: "User-provided asset; usage rights managed by project owner",
    },
  },
];

export function getGameConfig(slug: string): GameConfig | undefined {
  return GAMES.find((game) => game.slug === slug);
}
