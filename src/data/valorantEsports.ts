export type ValorantEsportsFilter = "all" | "champions" | "americas" | "emea" | "pacific" | "china";

export type ValorantEsportsMatch = {
  id: string;
  competition: string;
  circuit: Exclude<ValorantEsportsFilter, "all">;
  stage: string;
  bestOf: number;
  scheduledAt: string;
  teamA: { name: string; short: string };
  teamB: { name: string; short: string };
  status: "upcoming" | "live" | "completed";
  broadcastUrl?: string;
};

// Seeded from the official VALORANT Esports schedule for Champions Shanghai.
// This is intentionally a small editorial snapshot; a provider sync will replace
// manual status/broadcast updates when official live data credentials are wired.
export const VALORANT_ESPORTS_MATCHES: ValorantEsportsMatch[] = [
  {
    id: "champs-2026-groups-tl-prx",
    competition: "Champions Shanghai",
    circuit: "champions",
    stage: "Groups",
    bestOf: 3,
    scheduledAt: "2026-09-24T09:00:00Z",
    teamA: { name: "Team Liquid", short: "TL" },
    teamB: { name: "Paper Rex", short: "PRX" },
    status: "upcoming",
  },
  {
    id: "champs-2026-groups-tyl-g2",
    competition: "Champions Shanghai",
    circuit: "champions",
    stage: "Groups",
    bestOf: 3,
    scheduledAt: "2026-09-24T12:00:00Z",
    teamA: { name: "TYLOO Gaming", short: "TYL" },
    teamB: { name: "G2 Esports", short: "G2" },
    status: "upcoming",
  },
  {
    id: "champs-2026-groups-ns-nrg",
    competition: "Champions Shanghai",
    circuit: "champions",
    stage: "Groups",
    bestOf: 3,
    scheduledAt: "2026-09-25T09:00:00Z",
    teamA: { name: "NONGSHIM REDFORCE", short: "NS" },
    teamB: { name: "NRG", short: "NRG" },
    status: "upcoming",
  },
  {
    id: "champs-2026-groups-kc-xlg",
    competition: "Champions Shanghai",
    circuit: "champions",
    stage: "Groups",
    bestOf: 3,
    scheduledAt: "2026-09-25T12:00:00Z",
    teamA: { name: "Karmine Corp", short: "KC" },
    teamB: { name: "Xi Lai Gaming", short: "XLG" },
    status: "upcoming",
  },
  {
    id: "champs-2026-groups-ge-vit",
    competition: "Champions Shanghai",
    circuit: "champions",
    stage: "Groups",
    bestOf: 3,
    scheduledAt: "2026-09-26T09:00:00Z",
    teamA: { name: "Global Esports", short: "GE" },
    teamB: { name: "Team Vitality", short: "VIT" },
    status: "upcoming",
  },
  {
    id: "champs-2026-groups-loud-edg",
    competition: "Champions Shanghai",
    circuit: "champions",
    stage: "Groups",
    bestOf: 3,
    scheduledAt: "2026-09-26T12:00:00Z",
    teamA: { name: "LOUD", short: "LOUD" },
    teamB: { name: "EDward Gaming", short: "EDG" },
    status: "upcoming",
  },
  {
    id: "champs-2026-groups-100t-t1",
    competition: "Champions Shanghai",
    circuit: "champions",
    stage: "Groups",
    bestOf: 3,
    scheduledAt: "2026-09-27T09:00:00Z",
    teamA: { name: "100 Thieves", short: "100T" },
    teamB: { name: "T1", short: "T1" },
    status: "upcoming",
  },
  {
    id: "champs-2026-groups-jdg-fut",
    competition: "Champions Shanghai",
    circuit: "champions",
    stage: "Groups",
    bestOf: 3,
    scheduledAt: "2026-09-27T12:00:00Z",
    teamA: { name: "JD Gaming", short: "JDG" },
    teamB: { name: "FUT Esports", short: "FUT" },
    status: "upcoming",
  },
];
