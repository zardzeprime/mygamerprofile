export type EsportsGameSlug = "valorant" | "league-of-legends";
export type ValorantRegion = "americas" | "emea" | "pacific" | "china";
export type RosterStatus = "active" | "sub" | "inactive" | "stand-in" | "loan";

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
  rosterStatus?: RosterStatus;
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
  region?: ValorantRegion;
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

export type PlayerSeed = {
  handle: string;
  realName?: string;
  status?: Exclude<RosterStatus, "active">;
};

export type ValorantRosterSeed = {
  id: string;
  name: string;
  shortName: string;
  region: ValorantRegion;
  countryCode?: string;
  vlrUrl: string;
  logoUrl?: string;
  entryStage?: "group-stage" | "play-ins";
  players: PlayerSeed[];
};
