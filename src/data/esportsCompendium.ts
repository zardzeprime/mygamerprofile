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
  logoUrl?: string;
  playerIds: string[];
  sources: EsportsSource[];
};

export type CompetitiveSourceLink = {
  id: "vlr" | "prosettings";
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
    id: "vlr",
    name: "VLR.gg",
    url: "https://www.vlr.gg/",
    purpose: "Times, elencos, eventos, partidas, resultados e contexto competitivo.",
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
  name: string;
  shortName: string;
  vlrUrl: string;
  logoUrl: string;
  players: string[];
};

const VALORANT_CHAMPIONS_2026: ValorantRosterSeed[] = [
  { id: "100t", name: "100 Thieves", shortName: "100T", vlrUrl: "https://www.vlr.gg/team/120/100-thieves", logoUrl: "https://owcdn.net/img/603c00d5c5a08.png", players: ["Asuna", "bang", "Cryocells", "vora", "Timotino"] },
  { id: "loud", name: "LOUD", shortName: "LOUD", vlrUrl: "https://www.vlr.gg/team/6961/loud", logoUrl: "https://owcdn.net/img/62bbec8dc1b9f.png", players: ["Darker", "DaviH", "lukxo", "erde", "tkzin"] },
  { id: "nrg", name: "NRG", shortName: "NRG", vlrUrl: "https://www.vlr.gg/team/1034/nrg", logoUrl: "https://owcdn.net/img/6610f026c1a9e.png", players: ["brawk", "mada", "skuba", "Ethan", "keiko"] },
  { id: "g2", name: "G2 Esports", shortName: "G2", vlrUrl: "https://www.vlr.gg/team/11058/g2-esports", logoUrl: "https://owcdn.net/img/633822848a741.png", players: ["BABYBAY", "valyn", "jawgemo", "leaf", "trent"] },
  { id: "tyloo", name: "TYLOO", shortName: "TYL", vlrUrl: "https://www.vlr.gg/team/731/tyloo", logoUrl: "https://owcdn.net/img/63eb60fb08390.png", players: ["SiuFatBB", "splash", "Scales", "slowly", "Erv"] },
  { id: "jdg", name: "JD Gaming", shortName: "JDG", vlrUrl: "https://www.vlr.gg/team/13576/jd-gaming", logoUrl: "https://owcdn.net/img/64f9825408326.png", players: ["jkuro", "BerLIN", "Yuicaw", "zhe", "crownfisher"] },
  { id: "edg", name: "EDward Gaming", shortName: "EDG", vlrUrl: "https://www.vlr.gg/team/1120/edward-gaming", logoUrl: "https://owcdn.net/img/62c82049253b2.png", players: ["nobody", "ZmjjKK", "Smoggy", "CHICHOO", "Jieni7"] },
  { id: "xlg", name: "Xi Lai Gaming", shortName: "XLG", vlrUrl: "https://www.vlr.gg/team/13581/xi-lai-gaming", logoUrl: "https://owcdn.net/img/671742f863b9b.png", players: ["NoMan", "Rarga", "WsLeo", "Lysoar", "happywei"] },
  { id: "kc", name: "Karmine Corp", shortName: "KC", vlrUrl: "https://www.vlr.gg/team/8877/karmine-corp", logoUrl: "https://owcdn.net/img/627403a0d9e48.png", players: ["SUYGETSU", "Avez", "dos9", "LewN", "N4RRATE"] },
  { id: "tl", name: "Team Liquid", shortName: "TL", vlrUrl: "https://www.vlr.gg/team/474/team-liquid", logoUrl: "https://owcdn.net/img/640c381f0603f.png", players: ["nAts", "trexx", "Kicks", "kamo", "GSR"] },
  { id: "fut", name: "FUT Esports", shortName: "FUT", vlrUrl: "https://www.vlr.gg/team/1184/fut-esports", logoUrl: "https://owcdn.net/img/632be9976b8fe.png", players: ["sociablEE", "yetujey", "xeus", "KROSTALY", "s0pp"] },
  { id: "vit", name: "Team Vitality", shortName: "VIT", vlrUrl: "https://www.vlr.gg/team/2059/team-vitality", logoUrl: "https://owcdn.net/img/6466d79e1ed40.png", players: ["Chronicle", "Derke", "PROFEK", "Jamppi", "Sayonara"] },
  { id: "ge", name: "Global Esports", shortName: "GE", vlrUrl: "https://www.vlr.gg/team/918/global-esports", logoUrl: "https://owcdn.net/img/629f316ddd4dd.png", players: ["Autumn", "UdoTan", "Kr1stal", "xavi8k", "PatMen"] },
  { id: "ns", name: "Nongshim RedForce", shortName: "NS", vlrUrl: "https://www.vlr.gg/team/11060/nongshim-redforce", logoUrl: "https://owcdn.net/img/6399bb707aacb.png", players: ["Rb", "Dambi", "Francis", "Ivy", "Xross"] },
  { id: "prx", name: "Paper Rex", shortName: "PRX", vlrUrl: "https://www.vlr.gg/team/624/paper-rex", logoUrl: "https://owcdn.net/img/62bbeba74d5cb.png", players: ["Jinggg", "invy", "f0rsakeN", "d4v41", "something"] },
  { id: "t1", name: "T1", shortName: "T1", vlrUrl: "https://www.vlr.gg/team/14/t1", logoUrl: "https://owcdn.net/img/62fe0b8f6b084.png", players: ["stax", "BuZz", "Munchkin", "Meteor", "iZu"] },
];

const VERIFIED_SETTINGS: Record<string, { settings: ProPlayerSettings; source: EsportsSource }> = {
  cryocells: {
    settings: { dpi: 1600, sensitivity: 0.087, edpi: 139.2, pollingRateHz: 8000, mouse: "Logitech G Pro X2 SUPERSTRIKE Lunar Eclipse", resolution: "1280x1024", displayMode: "Fullscreen", crosshairCode: "0;s;1;P;c;5;o;1;0l;3;0o;0;0a;1;0f;0;1b;0" },
    source: { url: "https://prosettings.net/players/cryocells/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Settings page checked for v0.1.9." },
  },
  jinggg: {
    settings: { dpi: 1600, sensitivity: 0.175, edpi: 280, pollingRateHz: 2000, mouse: "Pulsar Jinggg-x", resolution: "1920x1080", displayMode: "Fullscreen", crosshairCode: "0;s;1;P;c;5;o;1;f;0;m;1;0t;3;0l;0;0v;1;0g;1;0o;0;0a;1;0f;0;1t;1;1l;4;1g;1;1o;0;1a;1;1m;0;1f;0;S;c;5;o;1" },
    source: { url: "https://prosettings.net/players/jinggg/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Settings page checked for v0.1.9." },
  },
  f0rsaken: {
    settings: { dpi: 800, sensitivity: 0.712, edpi: 569.6, pollingRateHz: 4000, mouse: "Pulsar Susanto-X" },
    source: { url: "https://prosettings.net/players/f0rsaken/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Settings page checked for v0.1.9." },
  },
};

function playerId(teamId: string, handle: string) {
  return `${teamId}-${handle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export const ESPORTS_PLAYERS: EsportsPlayer[] = VALORANT_CHAMPIONS_2026.flatMap((team) =>
  team.players.map((handle) => {
    const verified = VERIFIED_SETTINGS[handle.toLowerCase()];
    return {
      id: playerId(team.id, handle),
      game: "valorant" as const,
      handle,
      teamId: team.id,
      settings: verified?.settings,
      sources: [
        { url: CHAMPIONS_SOURCE, label: "VLR.gg", verifiedAt: VERIFIED_AT, note: `Champions Shanghai 2026 roster — ${team.name}.` },
        ...(verified
          ? [verified.source]
          : [{ url: PROSETTINGS_VALORANT, label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Live VALORANT settings directory; individual settings are added only after verification." }]),
      ],
    };
  }),
);

export const ESPORTS_TEAMS: EsportsTeam[] = VALORANT_CHAMPIONS_2026.map((team) => ({
  id: team.id,
  game: "valorant",
  name: team.name,
  shortName: team.shortName,
  logoUrl: team.logoUrl,
  playerIds: team.players.map((handle) => playerId(team.id, handle)),
  sources: [
    { url: team.vlrUrl, label: "VLR.gg", verifiedAt: VERIFIED_AT, note: "Team and roster reference." },
    { url: CHAMPIONS_SOURCE, label: "VLR.gg — Champions Shanghai 2026", verifiedAt: VERIFIED_AT },
  ],
}));

/**
 * MGP competitive data is curated and provenance-tracked. VLR is the roster/event
 * reference and ProSettings is the live settings/gear reference. Fast-changing pro
 * settings are only copied into MGP when individually verified; otherwise the live
 * canonical source is linked so MGP never presents guessed or stale numbers as fact.
 */
export function getEsportsTeams(game: EsportsGameSlug) {
  return ESPORTS_TEAMS.filter((team) => team.game === game);
}

export function getEsportsPlayers(game: EsportsGameSlug) {
  return ESPORTS_PLAYERS.filter((player) => player.game === game);
}
