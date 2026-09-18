import type { EsportsPlayer, EsportsSource, EsportsTeam } from "@/data/valorant/types";

export const LEAGUE_VERIFIED_AT = "2026-09-18";

type LeaguePlayerSeed = {
  handle: string;
  role: "Top" | "Jungle" | "Mid" | "Bot" | "Support";
};

type LeagueTeamSeed = {
  id: string;
  name: string;
  shortName: string;
  region: "lck" | "lec" | "lcs" | "cblol";
  countryCode: string;
  sourceUrl: string;
  sourceLabel: string;
  players: LeaguePlayerSeed[];
};

const TEAMS: LeagueTeamSeed[] = [
  {
    id: "lol-t1",
    name: "T1",
    shortName: "T1",
    region: "lck",
    countryCode: "KR",
    sourceUrl: "https://liquipedia.net/leagueoflegends/LCK/2026",
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
    sourceUrl: "https://liquipedia.net/leagueoflegends/LCK/2026",
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
    sourceUrl: "https://liquipedia.net/leagueoflegends/LCK/2026",
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
    sourceUrl: "https://liquipedia.net/leagueoflegends/LCK/2026",
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
    sourceUrl: "https://liquipedia.net/leagueoflegends/G2_Esports",
    sourceLabel: "Liquipedia · G2 Esports",
    players: [
      { handle: "BrokenBlade", role: "Top" },
      { handle: "SkewMond", role: "Jungle" },
      { handle: "Caps", role: "Mid" },
      { handle: "Hans Sama", role: "Bot" },
      { handle: "Labrov", role: "Support" },
    ],
  },
  {
    id: "lol-team-liquid",
    name: "Team Liquid Alienware",
    shortName: "TLAW",
    region: "lcs",
    countryCode: "US",
    sourceUrl: "https://liquipedia.net/leagueoflegends/Team_Liquid",
    sourceLabel: "Liquipedia · Team Liquid",
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
    sourceUrl: "https://liquipedia.net/leagueoflegends/FlyQuest",
    sourceLabel: "Liquipedia · FlyQuest",
    players: [
      { handle: "GaKGoS", role: "Top" },
      { handle: "Gryffinn", role: "Jungle" },
      { handle: "Quad", role: "Mid" },
      { handle: "Massu", role: "Bot" },
      { handle: "Cryogen", role: "Support" },
    ],
  },
  {
    id: "lol-los",
    name: "LOS",
    shortName: "LOS",
    region: "cblol",
    countryCode: "BR",
    sourceUrl: "https://liquipedia.net/leagueoflegends/LOS",
    sourceLabel: "Liquipedia · LOS",
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
  return `${teamId}-${handle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

export const LEAGUE_ESPORTS_PLAYERS: EsportsPlayer[] = TEAMS.flatMap((team) =>
  team.players.map((player) => ({
    id: playerId(team.id, player.handle),
    game: "league-of-legends",
    handle: player.handle,
    role: player.role,
    rosterStatus: "active",
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
  playerIds: team.players.map((player) => playerId(team.id, player.handle)),
  sources: [source(team)],
}));
