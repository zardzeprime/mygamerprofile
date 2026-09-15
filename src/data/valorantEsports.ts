export type ValorantEsportsFilter = "all" | "champions" | "americas" | "emea" | "pacific" | "china";

export type ValorantEsportsTeam = {
  name: string;
  short: string;
  logoUrl?: string;
  sourceUrl?: string;
};

export type ValorantEsportsMatch = {
  id: string;
  competition: string;
  competitionLogoUrl?: string;
  competitionSourceUrl?: string;
  circuit: Exclude<ValorantEsportsFilter, "all">;
  stage: string;
  bestOf: number;
  scheduledAt: string;
  teamA: ValorantEsportsTeam;
  teamB: ValorantEsportsTeam;
  status: "upcoming" | "live" | "completed";
  broadcastUrl?: string;
};

const CHAMPIONS_2026 = {
  logoUrl: "https://owcdn.net/img/692fc60a022bb.png",
  sourceUrl: "https://www.vlr.gg/event/2766/valorant-champions-2026",
};

// External team mark references from VLR/owcdn. The UI always keeps the
// team name/initials as a fallback, so an unavailable image never breaks a match card.
const TEAMS = {
  TL: { name: "Team Liquid", short: "TL", logoUrl: "https://owcdn.net/img/640c381f0603f.png", sourceUrl: "https://www.vlr.gg/team/474/team-liquid" },
  PRX: { name: "Paper Rex", short: "PRX", logoUrl: "https://owcdn.net/img/62bbeba74d5cb.png", sourceUrl: "https://www.vlr.gg/team/624/paper-rex" },
  TYL: { name: "TYLOO", short: "TYL", logoUrl: "https://owcdn.net/img/63eb60fb08390.png", sourceUrl: "https://www.vlr.gg/team/731/tyloo" },
  G2: { name: "G2 Esports", short: "G2", logoUrl: "https://owcdn.net/img/633822848a741.png", sourceUrl: "https://www.vlr.gg/team/11058/g2-esports" },
  NS: { name: "Nongshim RedForce", short: "NS", logoUrl: "https://owcdn.net/img/6399bb707aacb.png", sourceUrl: "https://www.vlr.gg/team/11060/nongshim-redforce" },
  NRG: { name: "NRG", short: "NRG", logoUrl: "https://owcdn.net/img/6610f026c1a9e.png", sourceUrl: "https://www.vlr.gg/team/1034/nrg" },
  KC: { name: "Karmine Corp", short: "KC", logoUrl: "https://owcdn.net/img/627403a0d9e48.png", sourceUrl: "https://www.vlr.gg/team/8877/karmine-corp" },
  XLG: { name: "Xi Lai Gaming", short: "XLG", logoUrl: "https://owcdn.net/img/671742f863b9b.png", sourceUrl: "https://www.vlr.gg/team/13581/xi-lai-gaming" },
  GE: { name: "Global Esports", short: "GE", logoUrl: "https://owcdn.net/img/629f316ddd4dd.png", sourceUrl: "https://www.vlr.gg/team/918/global-esports" },
  VIT: { name: "Team Vitality", short: "VIT", logoUrl: "https://owcdn.net/img/6466d79e1ed40.png", sourceUrl: "https://www.vlr.gg/team/2059/team-vitality" },
  LOUD: { name: "LOUD", short: "LOUD", logoUrl: "https://owcdn.net/img/62bbec8dc1b9f.png", sourceUrl: "https://www.vlr.gg/team/6961/loud" },
  EDG: { name: "EDward Gaming", short: "EDG", logoUrl: "https://owcdn.net/img/62c82049253b2.png", sourceUrl: "https://www.vlr.gg/team/1120/edward-gaming" },
  "100T": { name: "100 Thieves", short: "100T", logoUrl: "https://owcdn.net/img/603c00d5c5a08.png", sourceUrl: "https://www.vlr.gg/team/120/100-thieves" },
  T1: { name: "T1", short: "T1", logoUrl: "https://owcdn.net/img/62fe0b8f6b084.png", sourceUrl: "https://www.vlr.gg/team/14/t1" },
  JDG: { name: "JD Gaming", short: "JDG", logoUrl: "https://owcdn.net/img/64f9825408326.png", sourceUrl: "https://www.vlr.gg/team/13576/jd-gaming" },
  FUT: { name: "FUT Esports", short: "FUT", logoUrl: "https://owcdn.net/img/632be9976b8fe.png", sourceUrl: "https://www.vlr.gg/team/1184/fut-esports" },
} satisfies Record<string, ValorantEsportsTeam>;

function championsMatch(
  id: string,
  scheduledAt: string,
  teamA: ValorantEsportsTeam,
  teamB: ValorantEsportsTeam,
): ValorantEsportsMatch {
  return {
    id,
    competition: "Champions Shanghai",
    competitionLogoUrl: CHAMPIONS_2026.logoUrl,
    competitionSourceUrl: CHAMPIONS_2026.sourceUrl,
    circuit: "champions",
    stage: "Groups",
    bestOf: 3,
    scheduledAt,
    teamA,
    teamB,
    status: "upcoming",
  };
}

// Seeded from the 2026 Champions Shanghai group-stage schedule. A provider sync
// can replace status/broadcast fields later without changing the UI contract.
export const VALORANT_ESPORTS_MATCHES: ValorantEsportsMatch[] = [
  championsMatch("champs-2026-groups-tl-prx", "2026-09-24T09:00:00Z", TEAMS.TL, TEAMS.PRX),
  championsMatch("champs-2026-groups-tyl-g2", "2026-09-24T12:00:00Z", TEAMS.TYL, TEAMS.G2),
  championsMatch("champs-2026-groups-ns-nrg", "2026-09-25T09:00:00Z", TEAMS.NS, TEAMS.NRG),
  championsMatch("champs-2026-groups-kc-xlg", "2026-09-25T12:00:00Z", TEAMS.KC, TEAMS.XLG),
  championsMatch("champs-2026-groups-ge-vit", "2026-09-26T09:00:00Z", TEAMS.GE, TEAMS.VIT),
  championsMatch("champs-2026-groups-loud-edg", "2026-09-26T12:00:00Z", TEAMS.LOUD, TEAMS.EDG),
  championsMatch("champs-2026-groups-100t-t1", "2026-09-27T09:00:00Z", TEAMS["100T"], TEAMS.T1),
  championsMatch("champs-2026-groups-jdg-fut", "2026-09-27T12:00:00Z", TEAMS.JDG, TEAMS.FUT),
];
