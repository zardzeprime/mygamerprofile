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
  | "mods"
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
  mods: { "pt-BR": "Mods", en: "Mods", es: "Mods" },
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
        "Lordran parece um labirinto até você perceber como suas áreas se encaixam. O combate cobra leitura de animação, controle de stamina e escolha de rota; cada atalho aberto muda o risco de voltar para casa.",
      en: "Lordran feels like a maze until you see how its areas connect. Combat rewards reading enemy animations, managing stamina and choosing your route; every shortcut changes the risk of getting back.",
      es: "Lordran parece un laberinto hasta que descubres cómo se conectan sus zonas. El combate exige leer animaciones, medir la resistencia y elegir la ruta; cada atajo cambia el riesgo del regreso.",
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
        "Lothric acelera o ritmo sem abandonar a cautela: ataques atrasados, combos longos e pressão constante testam sua leitura de espaço e stamina. O hub reúne chefes, builds e guias para entender o que cada arma e atributo muda na luta.",
      en: "Lothric quickens the pace without losing the need for caution: delayed swings, long combos and constant pressure test your spacing and stamina. This hub brings together bosses, builds and guides to explain what each weapon and stat changes in a fight.",
      es: "Lothric acelera el ritmo sin dejar de exigir cautela: golpes retrasados, combos largos y presión constante ponen a prueba tu espacio y resistencia. Este hub reúne jefes, builds y guías para entender qué cambia cada arma y atributo en combate.",
    },
    genre: "Action RPG",
    platforms: ["PC", "PlayStation 4", "Xbox One"],
    ageRating: "16+",
    themeKey: "dark_souls",
    modules: [
      "overview",
      "news",
      "builds",
      "dps-test",
      "fashion-test",
      "bosses",
      "items",
      "guides",
    ],
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
        "As Terras Intermédias raramente apontam um único caminho: uma caverna, um elevador ou um chefe opcional podem mudar seu próximo destino. Explore no próprio ritmo e ajuste a build ao que encontrar; Shadow of the Erdtree fica no mesmo hub para manter tudo no mesmo lugar.",
      en: "The Lands Between rarely offer just one route: a cave, lift or optional boss can change where you head next. Explore at your own pace and adjust your build to what you find; Shadow of the Erdtree stays in the same hub so everything remains together.",
      es: "Las Tierras Intermedias rara vez ofrecen una sola ruta: una cueva, un ascensor o un jefe opcional pueden cambiar tu próximo destino. Explora a tu ritmo y adapta tu build a lo que encuentres; Shadow of the Erdtree está en el mismo hub.",
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
        "Nightreign transforma o universo de Elden Ring em expedições cooperativas para três pessoas. Cada run combina exploração rápida, escolhas de equipamento e confrontos que apertam o cerco ao fim do dia; a coordenação do grupo importa tanto quanto a build.",
      en: "Nightreign turns Elden Ring's universe into three-player expeditions. Each run mixes quick exploration, gear choices and encounters that tighten the pressure at day's end; squad coordination matters as much as the build.",
      es: "Nightreign convierte el universo de Elden Ring en expediciones cooperativas para tres personas. Cada run combina exploración rápida, decisiones de equipo y encuentros que aumentan la presión al final del día; la coordinación importa tanto como la build.",
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
        "Warframe é uma cadeia de sistemas que se alimentam: escolher um Warframe define como você aborda a missão; Mods, armas e companheiros completam a build; e cada atividade abre outro caminho de progressão. Aqui você consulta habilidades, itens e fabricação sem perder de vista onde cada peça entra.",
      en: "Warframe is a chain of systems that feed into each other: your Warframe shapes how you approach a mission; Mods, weapons and companions complete the build; each activity opens another path of progression. Look up abilities, items and crafting here, with context for how each piece fits.",
      es: "Warframe conecta sus sistemas entre sí: el Warframe define cómo afrontas una misión; Mods, armas y compañeros completan la build; cada actividad abre otra ruta de progreso. Consulta habilidades, objetos y fabricación con contexto sobre dónde encaja cada pieza.",
    },
    genre: "Action RPG / Looter Shooter",
    platforms: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"],
    ageRating: "16+",
    themeKey: "competitive",
    modules: ["overview", "warframes", "builds", "mods", "weapons", "guides", "news"],
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
        label: {
          "pt-BR": "Companheiro favorito",
          en: "Favorite companion",
          es: "Compañero favorito",
        },
      },
      {
        key: "preferred_activity",
        type: "text",
        maxLength: 80,
        label: {
          "pt-BR": "Atividade preferida",
          en: "Preferred activity",
          es: "Actividad preferida",
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
      coverImage: WARFRAME_PLACEHOLDER,
      heroImage: WARFRAME_PLACEHOLDER,
      backgroundImage: WARFRAME_PLACEHOLDER,
      fallbackImage: valorantAtmosphere,
      cardObjectPosition: "center",
      heroObjectPosition: "center",
      assetSource:
        "ÍMPAR-generated Warframe placeholder; official media can replace it after asset review",
      assetLicense: "ÍMPAR original placeholder; no third-party artwork embedded",
    },
  },
  {
    slug: "valorant",
    name: "Valorant",
    aliases: ["VALORANT"],
    description: {
      "pt-BR":
        "No VALORANT, ganhar um duelo ajuda; ganhar a rodada exige mais. Comprar bem, guardar créditos quando necessário, trocar informação e combinar habilidades pode virar um ataque antes mesmo do primeiro disparo.",
      en: "Winning a duel helps in VALORANT; winning the round takes more. Smart buys, saving credits when needed, sharing information and layering abilities can turn a site hit before the first shot.",
      es: "Ganar un duelo ayuda en VALORANT; ganar la ronda exige más. Comprar bien, ahorrar créditos cuando toca, compartir información y combinar habilidades puede decidir un ataque antes del primer disparo.",
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
      assetSource:
        "User-provided VALORANT card artwork stored locally in the ÍMPAR repository; hub background retains its separately tracked promotional reference",
      assetLicense:
        "User-provided project asset using the VALORANT brand mark; repository provenance retained",
    },
  },
  {
    slug: "league-of-legends",
    name: "League of Legends",
    aliases: ["LoL", "League"],
    description: {
      "pt-BR":
        "No League, uma vantagem pequena só vale se virar algo no mapa: uma wave bem preparada abre espaço para objetivo, uma rotação muda a luta e a compra certa altera o próximo confronto. O hub aproxima campeões, habilidades, runas, itens e builds para você ligar a escolha ao que acontece na partida.",
      en: "In League, a small lead only matters when it changes the map: a prepared wave creates room for an objective, a rotation reshapes a fight and the right purchase changes the next duel. The hub brings champions, abilities, runes, items and builds together so you can connect a pick to what happens in game.",
      es: "En League, una pequeña ventaja solo importa si cambia el mapa: una oleada preparada abre espacio para un objetivo, una rotación transforma una pelea y la compra correcta cambia el siguiente duelo. El hub reúne campeones, habilidades, runas, objetos y builds para relacionar la elección con lo que pasa en partida.",
    },
    genre: "MOBA",
    platforms: ["PC"],
    ageRating: "12+",
    themeKey: "competitive",
    modules: [
      "overview",
      "news",
      "champions",
      "runes",
      "builds",
      "maps",
      "items",
      "skins",
      "competitive",
      "guides",
    ],
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
        "O futebol muda de um modo para outro: montar um elenco no Ultimate Team é um problema diferente de desenvolver um atleta na Carreira ou encaixar seu papel no Clubs. O hub organiza esses caminhos num lugar só e acompanha a série sem começar tudo do zero a cada edição.",
      en: "Each mode asks for something different: building a squad in Ultimate Team is not the same problem as developing a player in Career or fitting your role in Clubs. This hub keeps those paths together and follows the series without starting over every annual release.",
      es: "Cada modo plantea algo distinto: armar una plantilla en Ultimate Team no es lo mismo que desarrollar un jugador en Carrera o encontrar tu papel en Clubs. El hub reúne esos caminos y acompaña la serie sin empezar desde cero en cada edición.",
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
