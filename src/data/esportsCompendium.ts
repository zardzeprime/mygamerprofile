import { VCT_2026_OFFICIAL_SOURCE, VCT_2026_TEAMS, type VctRegion } from "@/data/vct2026Teams";

export type EsportsGameSlug = "valorant" | "league-of-legends";

export type EsportsSource = {
  url: string;
  label: string;
  verifiedAt: string;
  note?: string;
};

export type ProPlayerSettings = {
  dpi?: number;
  sensitivity?: number;
  edpi?: number;
  crosshairCode?: string;
  mouse?: string;
  pollingRateHz?: number;
  resolution?: string;
  displayMode?: string;
  graphicsPreset?: string;
};

export type EsportsPlayer = {
  id: string;
  game: EsportsGameSlug;
  handle: string;
  realName?: string;
  countryCode?: string;
  city?: string;
  photoUrl?: string;
  role?: string;
  teamId?: string;
  settings?: ProPlayerSettings;
  sources: EsportsSource[];
};

export type EsportsTeam = {
  id: string;
  game: EsportsGameSlug;
  name: string;
  shortName?: string;
  countryCode?: string;
  region?: VctRegion;
  logoUrl?: string;
  playerIds: string[];
  sources: EsportsSource[];
};

export type CompetitiveSourceLink = {
  id: "vlr" | "prosettings" | "valorant-esports";
  name: string;
  url: string;
  purpose: string;
  verifiedAt: string;
};

const VERIFIED_AT = "2026-09-16";
const CHAMPIONS_SOURCE = "https://www.vlr.gg/event/2766/valorant-champions-2026";
const PROSETTINGS_VALORANT = "https://prosettings.net/games/valorant/";

export const COMPETITIVE_SOURCE_LINKS: CompetitiveSourceLink[] = [
  {
    id: "valorant-esports",
    name: "VALORANT Esports",
    url: VCT_2026_OFFICIAL_SOURCE,
    purpose: "Lista oficial das 48 equipes Tier 1 do VCT 2026 e regiões.",
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "vlr",
    name: "VLR.gg",
    url: "https://www.vlr.gg/",
    purpose: "Elencos, eventos, partidas, resultados e contexto competitivo.",
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "prosettings",
    name: "ProSettings.net",
    url: PROSETTINGS_VALORANT,
    purpose: "DPI, sensibilidade/eDPI, crosshair, vídeo, periféricos e configurações profissionais.",
    verifiedAt: VERIFIED_AT,
  },
];

type ValorantRosterSeed = {
  id: string;
  vlrUrl: string;
  logoUrl?: string;
  countryCode?: string;
  players: string[];
  rosterNote?: string;
};

const VERIFIED_ROSTER_SEEDS: ValorantRosterSeed[] = [
  { id: "100t", vlrUrl: "https://www.vlr.gg/team/120/100-thieves", logoUrl: "https://owcdn.net/img/603c00d5c5a08.png", players: ["Asuna", "bang", "Cryocells", "vora", "Timotino"], rosterNote: "Champions Shanghai 2026 roster." },
  { id: "loud", countryCode: "BR", vlrUrl: "https://www.vlr.gg/team/6961/loud", logoUrl: "https://owcdn.net/img/62bbec8dc1b9f.png", players: ["erde", "lukxo", "DaviH", "Darker", "tkzin", "cauanzin"], rosterNote: "Current VLR roster checked on 2026-09-16." },
  { id: "lev", countryCode: "AR", vlrUrl: "https://www.vlr.gg/team/2359/leviat-n", players: ["kiNgg", "spike", "blowz", "Neon", "Sato"], rosterNote: "Current VLR roster checked on 2026-09-16." },
  { id: "mibr", countryCode: "BR", vlrUrl: "https://www.vlr.gg/team/7386/mibr", players: ["zekken", "tex", "Mazino", "Verno", "aspas"], rosterNote: "Current VLR roster checked on 2026-09-16." },
  { id: "nrg", vlrUrl: "https://www.vlr.gg/team/1034/nrg", logoUrl: "https://owcdn.net/img/6610f026c1a9e.png", players: ["brawk", "mada", "skuba", "Ethan", "keiko"], rosterNote: "Champions Shanghai 2026 roster." },
  { id: "g2", vlrUrl: "https://www.vlr.gg/team/11058/g2-esports", logoUrl: "https://owcdn.net/img/633822848a741.png", players: ["BABYBAY", "valyn", "jawgemo", "leaf", "trent"], rosterNote: "Champions Shanghai 2026 roster." },
  { id: "tyloo", vlrUrl: "https://www.vlr.gg/team/731/tyloo", logoUrl: "https://owcdn.net/img/63eb60fb08390.png", players: ["SiuFatBB", "splash", "Scales", "slowly", "Erv"], rosterNote: "Champions Shanghai 2026 roster." },
  { id: "jdg", vlrUrl: "https://www.vlr.gg/team/13576/jd-gaming", logoUrl: "https://owcdn.net/img/64f9825408326.png", players: ["jkuro", "BerLIN", "Yuicaw", "zhe", "crownfisher"], rosterNote: "Champions Shanghai 2026 roster." },
  { id: "edg", vlrUrl: "https://www.vlr.gg/team/1120/edward-gaming", logoUrl: "https://owcdn.net/img/62c82049253b2.png", players: ["nobody", "ZmjjKK", "CHICHOO", "Smoggy", "Jieni7", "stew", "zjc"], rosterNote: "Current VLR roster checked on 2026-09-16." },
  { id: "xlg", vlrUrl: "https://www.vlr.gg/team/13581/xlg-esports", logoUrl: "https://owcdn.net/img/671742f863b9b.png", players: ["WsLeo", "Sharks", "Lysoar", "NoMan", "Rarga", "happywei"], rosterNote: "Current VLR roster checked on 2026-09-16." },
  { id: "kc", vlrUrl: "https://www.vlr.gg/team/8877/karmine", logoUrl: "https://owcdn.net/img/627403a0d9e48.png", players: ["SUYGETSU", "Avez", "dos9", "LewN", "N4RRATE"], rosterNote: "Champions Shanghai 2026 roster." },
  { id: "tl", vlrUrl: "https://www.vlr.gg/team/474/team-liquid", logoUrl: "https://owcdn.net/img/640c381f0603f.png", players: ["nAts", "trexx", "Kicks", "kamo", "GSR"], rosterNote: "Champions Shanghai 2026 roster." },
  { id: "fut", vlrUrl: "https://www.vlr.gg/team/1184/fut-esports", logoUrl: "https://owcdn.net/img/632be9976b8fe.png", players: ["sociablEE", "yetujey", "xeus", "KROSTALY", "s0pp"], rosterNote: "Champions Shanghai 2026 roster." },
  { id: "vit", vlrUrl: "https://www.vlr.gg/team/2059/team-vitality", logoUrl: "https://owcdn.net/img/6466d79e1ed40.png", players: ["Chronicle", "Derke", "PROFEK", "Jamppi", "Sayonara"], rosterNote: "Champions Shanghai 2026 roster." },
  { id: "ge", vlrUrl: "https://www.vlr.gg/team/918/global-esports", logoUrl: "https://owcdn.net/img/629f316ddd4dd.png", players: ["Autumn", "UdoTan", "Kr1stal", "xavi8k", "PatMen"], rosterNote: "Champions Shanghai 2026 roster." },
  { id: "ns", vlrUrl: "https://www.vlr.gg/team/11060/nongshim-redforce", logoUrl: "https://owcdn.net/img/6399bb707aacb.png", players: ["Rb", "Dambi", "Francis", "Ivy", "Xross"], rosterNote: "Champions Shanghai 2026 roster." },
  { id: "prx", vlrUrl: "https://www.vlr.gg/team/624/paper-rex", logoUrl: "https://owcdn.net/img/62bbeba74d5cb.png", players: ["Jinggg", "invy", "f0rsakeN", "d4v41", "something"], rosterNote: "Champions Shanghai 2026 roster." },
  { id: "t1", vlrUrl: "https://www.vlr.gg/team/14/t1", logoUrl: "https://owcdn.net/img/62fe0b8f6b084.png", players: ["stax", "BuZz", "Munchkin", "Meteor", "iZu"], rosterNote: "Champions Shanghai 2026 roster." },
];

const rosterByTeam = new Map(VERIFIED_ROSTER_SEEDS.map((team) => [team.id, team]));

const VERIFIED_SETTINGS: Record<string, { settings: ProPlayerSettings; source: EsportsSource }> = {
  cryocells: {
    settings: { dpi: 1600, sensitivity: 0.087, edpi: 139.2, pollingRateHz: 8000, mouse: "Logitech G Pro X2 SUPERSTRIKE Lunar Eclipse", resolution: "1280x1024", displayMode: "Fullscreen", crosshairCode: "0;s;1;P;c;5;o;1;0l;3;0o;0;0a;1;0f;0;1b;0" },
    source: { url: "https://prosettings.net/players/cryocells/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  jinggg: {
    settings: { dpi: 1600, sensitivity: 0.175, edpi: 280, pollingRateHz: 2000, mouse: "Pulsar Jinggg-x", resolution: "1920x1080", displayMode: "Fullscreen", crosshairCode: "0;s;1;P;c;5;o;1;f;0;m;1;0t;3;0l;0;0v;1;0g;1;0o;0;0a;1;0f;0;1t;1;1l;4;1g;1;1o;0;1a;1;1m;0;1f;0;S;c;5;o;1" },
    source: { url: "https://prosettings.net/players/jinggg/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  f0rsaken: {
    settings: { dpi: 800, sensitivity: 0.712, edpi: 569.6, pollingRateHz: 4000, mouse: "Pulsar Susanto-X" },
    source: { url: "https://prosettings.net/players/f0rsaken/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  aspas: {
    settings: { dpi: 800, sensitivity: 0.4, edpi: 320, pollingRateHz: 1000, mouse: "Logitech G Pro X Superlight 2 Black", resolution: "1920x1080", displayMode: "Fullscreen", crosshairCode: "0;P;h;0;0l;4;0o;0;0a;1;0f;0;1b;0" },
    source: { url: "https://prosettings.net/players/aspas/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
};

const VERIFIED_ROLES: Record<string, string> = {
  cryocells: "Duelista",
  jinggg: "Duelista",
  f0rsaken: "Flex",
  aspas: "Duelista",
};

function playerId(teamId: string, handle: string) {
  return `${teamId}-${handle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export const ESPORTS_PLAYERS: EsportsPlayer[] = VERIFIED_ROSTER_SEEDS.flatMap((team) =>
  team.players.map((handle) => {
    const normalizedHandle = handle.toLowerCase();
    const verified = VERIFIED_SETTINGS[normalizedHandle];
    return {
      id: playerId(team.id, handle),
      game: "valorant" as const,
      handle,
      teamId: team.id,
      role: VERIFIED_ROLES[normalizedHandle],
      settings: verified?.settings,
      sources: [
        { url: team.vlrUrl, label: "VLR.gg", verifiedAt: VERIFIED_AT, note: team.rosterNote ?? "Roster reference." },
        ...(verified ? [verified.source] : []),
      ],
    };
  }),
);

export const ESPORTS_TEAMS: EsportsTeam[] = VCT_2026_TEAMS.map((officialTeam) => {
  const roster = rosterByTeam.get(officialTeam.id);
  return {
    id: officialTeam.id,
    game: "valorant" as const,
    name: officialTeam.name,
    shortName: officialTeam.shortName,
    region: officialTeam.region,
    countryCode: roster?.countryCode,
    logoUrl: roster?.logoUrl,
    playerIds: roster?.players.map((handle) => playerId(officialTeam.id, handle)) ?? [],
    sources: [
      {
        url: VCT_2026_OFFICIAL_SOURCE,
        label: "VALORANT Esports — official",
        verifiedAt: VERIFIED_AT,
        note: `Official VCT 2026 Tier 1 directory — ${officialTeam.region}.`,
      },
      ...(roster
        ? [
            { url: roster.vlrUrl, label: "VLR.gg", verifiedAt: VERIFIED_AT, note: roster.rosterNote ?? "Team and roster reference." },
            ...(roster.rosterNote?.startsWith("Champions")
              ? [{ url: CHAMPIONS_SOURCE, label: "VLR.gg — Champions Shanghai 2026", verifiedAt: VERIFIED_AT }]
              : []),
          ]
        : []),
    ],
  };
});

/**
 * Team membership comes from Riot's official 2026 Tier 1 handbook. Fast-moving
 * roster/player data is added only after source verification. VLR is used as a
 * roster/event reference and ProSettings as the settings/gear reference.
 */
export function getEsportsTeams(game: EsportsGameSlug) {
  return ESPORTS_TEAMS.filter((team) => team.game === game);
}

export function getEsportsPlayers(game: EsportsGameSlug) {
  return ESPORTS_PLAYERS.filter((player) => player.game === game);
}
