import type {
  EsportsPlayer,
  EsportsSource,
  EsportsTeam,
  RosterStatus,
} from "@/data/valorant/types";

export const LEAGUE_VERIFIED_AT = "2026-09-21";

type LeaguePlayerSeed = {
  handle: string;
  role: "Top" | "Jungle" | "Mid" | "Bot" | "Support";
  status?: RosterStatus;
};

type LeagueTeamSeed = {
  id: string;
  name: string;
  shortName: string;
  region: "lck" | "lec" | "lcs" | "lpl" | "cblol";
  countryCode: string;
  sourceUrl: string;
  sourceLabel: string;
  logoDomain?: string;
  players: LeaguePlayerSeed[];
};

const leagueLogo = (domain?: string) =>
  domain ? `https://www.google.com/s2/favicons?domain_url=https://${domain}&sz=128` : undefined;

const LCK_SOURCE = "https://liquipedia.net/leagueoflegends/LCK/2026";
const LEC_SOURCE = "https://liquipedia.net/leagueoflegends/LEC/2026/Summer";
const LCS_SOURCE = "https://liquipedia.net/leagueoflegends/LCS/2026/Summer";
const LPL_SOURCE = "https://liquipedia.net/leagueoflegends/LPL/2026/Split_3";
const CBLOL_SOURCE = "https://liquipedia.net/leagueoflegends/CBLOL/2026/Split_2";

const TEAMS: LeagueTeamSeed[] = [
  {
    id: "lol-t1",
    name: "T1",
    shortName: "T1",
    region: "lck",
    countryCode: "KR",
    logoDomain: "t1.gg",
    sourceUrl: LCK_SOURCE,
    sourceLabel: "Liquipedia · LCK 2026",
    players: [
      { handle: "Doran", role: "Top" },
      { handle: "Oner", role: "Jungle" },
      { handle: "Faker", role: "Mid" },
      { handle: "Peyz", role: "Bot" },
      { handle: "Keria", role: "Support" },
    ],
  },
  {
    id: "lol-geng",
    name: "Gen.G Esports",
    shortName: "GEN",
    region: "lck",
    countryCode: "KR",
    logoDomain: "geng.gg",
    sourceUrl: LCK_SOURCE,
    sourceLabel: "Liquipedia · LCK 2026",
    players: [
      { handle: "Kiin", role: "Top" },
      { handle: "Canyon", role: "Jungle" },
      { handle: "Chovy", role: "Mid" },
      { handle: "Ruler", role: "Bot" },
      { handle: "Duro", role: "Support" },
    ],
  },
  {
    id: "lol-hle",
    name: "Hanwha Life Esports",
    shortName: "HLE",
    region: "lck",
    countryCode: "KR",
    logoDomain: "hle.kr",
    sourceUrl: LCK_SOURCE,
    sourceLabel: "Liquipedia · LCK 2026",
    players: [
      { handle: "Zeus", role: "Top" },
      { handle: "Kanavi", role: "Jungle" },
      { handle: "Zeka", role: "Mid" },
      { handle: "Gumayusi", role: "Bot" },
      { handle: "Delight", role: "Support" },
    ],
  },
  {
    id: "lol-dplus",
    name: "Dplus",
    shortName: "DK",
    region: "lck",
    countryCode: "KR",
    logoDomain: "dpluskia.gg",
    sourceUrl: LCK_SOURCE,
    sourceLabel: "Liquipedia · LCK 2026",
    players: [
      { handle: "Siwoo", role: "Top" },
      { handle: "Lucid", role: "Jungle" },
      { handle: "ShowMaker", role: "Mid" },
      { handle: "Smash", role: "Bot" },
      { handle: "Career", role: "Support" },
    ],
  },

  {
    id: "lol-g2",
    name: "G2 Esports",
    shortName: "G2",
    region: "lec",
    countryCode: "EU",
    logoDomain: "g2esports.com",
    sourceUrl: LEC_SOURCE,
    sourceLabel: "Liquipedia · LEC 2026 Summer",
    players: [
      { handle: "BrokenBlade", role: "Top" },
      { handle: "SkewMond", role: "Jungle" },
      { handle: "Caps", role: "Mid" },
      { handle: "Hans Sama", role: "Bot" },
      { handle: "Labrov", role: "Support" },
    ],
  },
  {
    id: "lol-fnatic",
    name: "Fnatic",
    shortName: "FNC",
    region: "lec",
    countryCode: "EU",
    logoDomain: "fnatic.com",
    sourceUrl: LEC_SOURCE,
    sourceLabel: "Liquipedia · LEC 2026 Summer",
    players: [
      { handle: "Soboro", role: "Top" },
      { handle: "Razork", role: "Jungle" },
      { handle: "Vladi", role: "Mid" },
      { handle: "Upset", role: "Bot" },
      { handle: "Lospa", role: "Support" },
    ],
  },
  {
    id: "lol-giantx",
    name: "GIANTX",
    shortName: "GX",
    region: "lec",
    countryCode: "EU",
    logoDomain: "giantx.gg",
    sourceUrl: LEC_SOURCE,
    sourceLabel: "Liquipedia · LEC 2026 Summer",
    players: [
      { handle: "Oscarinin", role: "Top" },
      { handle: "Isma", role: "Jungle" },
      { handle: "Jackies", role: "Mid" },
      { handle: "Flakked", role: "Bot" },
      { handle: "Jun", role: "Support" },
    ],
  },
  {
    id: "lol-karmine",
    name: "Karmine Corp",
    shortName: "KC",
    region: "lec",
    countryCode: "FR",
    logoDomain: "karminecorp.fr",
    sourceUrl: LEC_SOURCE,
    sourceLabel: "Liquipedia · LEC 2026 Summer",
    players: [
      { handle: "Canna", role: "Top" },
      { handle: "Yike", role: "Jungle" },
      { handle: "kyeahoo", role: "Mid" },
      { handle: "Caliste", role: "Bot" },
      { handle: "Busio", role: "Support" },
    ],
  },
  {
    id: "lol-movistar-koi",
    name: "Movistar KOI",
    shortName: "MKOI",
    region: "lec",
    countryCode: "ES",
    logoDomain: "movistarkoi.com",
    sourceUrl: LEC_SOURCE,
    sourceLabel: "Liquipedia · LEC 2026 Summer",
    players: [
      { handle: "Myrwn", role: "Top" },
      { handle: "Elyoya", role: "Jungle" },
      { handle: "Jojopyun", role: "Mid" },
      { handle: "Supa", role: "Bot" },
      { handle: "Alvaro", role: "Support" },
    ],
  },
  {
    id: "lol-navi",
    name: "Natus Vincere",
    shortName: "NAVI",
    region: "lec",
    countryCode: "EU",
    logoDomain: "navi.gg",
    sourceUrl: LEC_SOURCE,
    sourceLabel: "Liquipedia · LEC 2026 Summer",
    players: [
      { handle: "Maynter", role: "Top" },
      { handle: "Rhilech", role: "Jungle" },
      { handle: "Poby", role: "Mid" },
      { handle: "SamD", role: "Bot" },
      { handle: "Parus", role: "Support" },
    ],
  },

  {
    id: "lol-team-liquid",
    name: "Team Liquid",
    shortName: "TL",
    region: "lcs",
    countryCode: "US",
    logoDomain: "teamliquid.com",
    sourceUrl: LCS_SOURCE,
    sourceLabel: "Liquipedia · LCS 2026 Summer",
    players: [
      { handle: "Morgan", role: "Top" },
      { handle: "Josedeodo", role: "Jungle" },
      { handle: "Quid", role: "Mid" },
      { handle: "Yeon", role: "Bot" },
      { handle: "CoreJJ", role: "Support" },
    ],
  },
  {
    id: "lol-flyquest",
    name: "FlyQuest",
    shortName: "FLY",
    region: "lcs",
    countryCode: "US",
    logoDomain: "flyquest.gg",
    sourceUrl: LCS_SOURCE,
    sourceLabel: "Liquipedia · LCS 2026 Summer",
    players: [
      { handle: "GaKGoS", role: "Top" },
      { handle: "Gryffinn", role: "Jungle" },
      { handle: "Quad", role: "Mid" },
      { handle: "Massu", role: "Bot" },
      { handle: "Cryogen", role: "Support" },
    ],
  },
  {
    id: "lol-cloud9",
    name: "Cloud9",
    shortName: "C9",
    region: "lcs",
    countryCode: "US",
    logoDomain: "cloud9.gg",
    sourceUrl: LCS_SOURCE,
    sourceLabel: "Liquipedia · LCS 2026 Summer",
    players: [
      { handle: "Thanatos", role: "Top" },
      { handle: "Blaber", role: "Jungle" },
      { handle: "Loki", role: "Mid" },
      { handle: "Tactical", role: "Bot" },
      { handle: "Vulcan", role: "Support" },
    ],
  },
  {
    id: "lol-sentinels",
    name: "Sentinels",
    shortName: "SEN",
    region: "lcs",
    countryCode: "US",
    logoDomain: "sentinels.gg",
    sourceUrl: LCS_SOURCE,
    sourceLabel: "Liquipedia · LCS 2026 Summer",
    players: [
      { handle: "Impact", role: "Top" },
      { handle: "HamBak", role: "Jungle" },
      { handle: "DARKWINGS", role: "Mid" },
      { handle: "Rahel", role: "Bot" },
      { handle: "huhi", role: "Support" },
    ],
  },
  {
    id: "lol-shopify",
    name: "Shopify Rebellion",
    shortName: "SR",
    region: "lcs",
    countryCode: "CA",
    logoDomain: "shopifyrebellion.gg",
    sourceUrl: LCS_SOURCE,
    sourceLabel: "Liquipedia · LCS 2026 Summer",
    players: [
      { handle: "Fudge", role: "Top" },
      { handle: "Contractz", role: "Jungle" },
      { handle: "Zinie", role: "Mid" },
      { handle: "Bvoy", role: "Bot" },
      { handle: "Zeyzal", role: "Support" },
    ],
  },

  {
    id: "lol-blg",
    name: "Bilibili Gaming",
    shortName: "BLG",
    region: "lpl",
    countryCode: "CN",
    logoDomain: "bilibili.com",
    sourceUrl: LPL_SOURCE,
    sourceLabel: "Liquipedia · LPL 2026 Split 3",
    players: [
      { handle: "Bin", role: "Top" },
      { handle: "Xun", role: "Jungle" },
      { handle: "knight", role: "Mid" },
      { handle: "Viper", role: "Bot" },
      { handle: "ON", role: "Support" },
    ],
  },
  {
    id: "lol-tes",
    name: "Top Esports",
    shortName: "TES",
    region: "lpl",
    countryCode: "CN",
    sourceUrl: LPL_SOURCE,
    sourceLabel: "Liquipedia · LPL 2026 Split 3",
    players: [
      { handle: "ZUIAN", role: "Top" },
      { handle: "Tian", role: "Jungle" },
      { handle: "Creme", role: "Mid" },
      { handle: "JackeyLove", role: "Bot" },
      { handle: "Zhuo", role: "Support" },
    ],
  },
  {
    id: "lol-al",
    name: "Anyone's Legend",
    shortName: "AL",
    region: "lpl",
    countryCode: "CN",
    sourceUrl: LPL_SOURCE,
    sourceLabel: "Liquipedia · LPL 2026 Split 3",
    players: [
      { handle: "Breathe", role: "Top" },
      { handle: "Tarzan", role: "Jungle" },
      { handle: "Shanks", role: "Mid" },
      { handle: "Hope", role: "Bot" },
      { handle: "Kael", role: "Support" },
    ],
  },
  {
    id: "lol-team-we",
    name: "Team WE",
    shortName: "WE",
    region: "lpl",
    countryCode: "CN",
    sourceUrl: LPL_SOURCE,
    sourceLabel: "Liquipedia · LPL 2026 Split 3",
    players: [
      { handle: "Cube", role: "Top" },
      { handle: "Monki", role: "Jungle" },
      { handle: "Karis", role: "Mid" },
      { handle: "About", role: "Bot" },
      { handle: "Erha", role: "Support" },
    ],
  },

  {
    id: "lol-fluxo-w7m",
    name: "Fluxo W7M",
    shortName: "FXW7M",
    region: "cblol",
    countryCode: "BR",
    logoDomain: "fluxo.gg",
    sourceUrl: CBLOL_SOURCE,
    sourceLabel: "Liquipedia · CBLOL 2026 Split 2",
    players: [
      { handle: "Zothve", role: "Top" },
      { handle: "Peach", role: "Jungle" },
      { handle: "cody", role: "Mid" },
      { handle: "BAO", role: "Bot" },
      { handle: "Momochi", role: "Support" },
    ],
  },
  {
    id: "lol-furia",
    name: "FURIA",
    shortName: "FUR",
    region: "cblol",
    countryCode: "BR",
    logoDomain: "furia.gg",
    sourceUrl: CBLOL_SOURCE,
    sourceLabel: "Liquipedia · CBLOL 2026 Split 2",
    players: [
      { handle: "Guigo", role: "Top" },
      { handle: "Tatu", role: "Jungle" },
      { handle: "Tutsz", role: "Mid" },
      { handle: "Ayu", role: "Bot" },
      { handle: "Jojo", role: "Support" },
      { handle: "Shini", role: "Jungle", status: "sub" },
    ],
  },
  {
    id: "lol-keyd",
    name: "Keyd Stars",
    shortName: "VKS",
    region: "cblol",
    countryCode: "BR",
    logoDomain: "keydstars.com.br",
    sourceUrl: CBLOL_SOURCE,
    sourceLabel: "Liquipedia · CBLOL 2026 Split 2",
    players: [
      { handle: "Zekas", role: "Top" },
      { handle: "Disamis", role: "Jungle" },
      { handle: "Mireu", role: "Mid" },
      { handle: "Jeskla", role: "Bot" },
      { handle: "scamber", role: "Support" },
    ],
  },
  {
    id: "lol-loud",
    name: "LOUD",
    shortName: "LLL",
    region: "cblol",
    countryCode: "BR",
    logoDomain: "loud.gg",
    sourceUrl: CBLOL_SOURCE,
    sourceLabel: "Liquipedia · CBLOL 2026 Split 2",
    players: [
      { handle: "Xyno", role: "Top" },
      { handle: "Sinatra", role: "Jungle" },
      { handle: "Kaze", role: "Mid" },
      { handle: "Rabelo", role: "Bot" },
      { handle: "uZent", role: "Support" },
    ],
  },
  {
    id: "lol-pain",
    name: "paiN Gaming",
    shortName: "PNG",
    region: "cblol",
    countryCode: "BR",
    logoDomain: "pain.gg",
    sourceUrl: CBLOL_SOURCE,
    sourceLabel: "Liquipedia · CBLOL 2026 Split 2",
    players: [
      { handle: "Boal", role: "Top" },
      { handle: "CarioK", role: "Jungle" },
      { handle: "Namiru", role: "Mid" },
      { handle: "Hena", role: "Bot" },
      { handle: "Ceos", role: "Support" },
    ],
  },
  {
    id: "lol-red",
    name: "RED Canids",
    shortName: "RED",
    region: "cblol",
    countryCode: "BR",
    logoDomain: "redcanids.com.br",
    sourceUrl: CBLOL_SOURCE,
    sourceLabel: "Liquipedia · CBLOL 2026 Split 2",
    players: [
      { handle: "zynts", role: "Top" },
      { handle: "STEPZ", role: "Jungle" },
      { handle: "Fuuu", role: "Mid" },
      { handle: "Morttheus", role: "Bot" },
    ],
  },
  {
    id: "lol-leviatan",
    name: "Leviatán",
    shortName: "LEV",
    region: "cblol",
    countryCode: "AR",
    logoDomain: "leviatan.gg",
    sourceUrl: CBLOL_SOURCE,
    sourceLabel: "Liquipedia · CBLOL 2026 Split 2",
    players: [
      { handle: "Devost", role: "Top" },
      { handle: "Booki", role: "Jungle" },
      { handle: "Enga", role: "Mid" },
      { handle: "Strensh", role: "Bot" },
      { handle: "Shiku", role: "Support" },
    ],
  },
  {
    id: "lol-los",
    name: "LOS",
    shortName: "LOS",
    region: "cblol",
    countryCode: "BR",
    logoDomain: "losgrandes.gg",
    sourceUrl: CBLOL_SOURCE,
    sourceLabel: "Liquipedia · CBLOL 2026 Split 2",
    players: [
      { handle: "Zest", role: "Top" },
      { handle: "Curse", role: "Jungle" },
      { handle: "Feisty", role: "Mid" },
      { handle: "Duduhh", role: "Bot" },
      { handle: "Ackerman", role: "Support" },
    ],
  },
];

function source(team: LeagueTeamSeed): EsportsSource {
  return {
    url: team.sourceUrl,
    label: team.sourceLabel,
    verifiedAt: LEAGUE_VERIFIED_AT,
    note: `League of Legends 2026 roster/role snapshot — ${team.name}.`,
  };
}

function playerId(teamId: string, handle: string) {
  return `${teamId}-${handle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

export const LEAGUE_ESPORTS_PLAYERS: EsportsPlayer[] = TEAMS.flatMap((team) =>
  team.players.map((player) => ({
    id: playerId(team.id, player.handle),
    game: "league-of-legends",
    handle: player.handle,
    role: player.role,
    rosterStatus: player.status ?? "active",
    teamId: team.id,
    sources: [source(team)],
  })),
);

export const LEAGUE_ESPORTS_TEAMS: EsportsTeam[] = TEAMS.map((team) => ({
  id: team.id,
  game: "league-of-legends",
  name: team.name,
  shortName: team.shortName,
  countryCode: team.countryCode,
  region: team.region,
  ...(team.logoDomain
    ? { logoUrl: `https://www.google.com/s2/favicons?domain_url=https://${team.logoDomain}&sz=128` }
    : {}),
  playerIds: team.players.map((player) => playerId(team.id, player.handle)),
  sources: [source(team)],
}));
