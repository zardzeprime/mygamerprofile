export type EsportsGameSlug = "valorant" | "league-of-legends";
export type ValorantRegion = "americas" | "emea" | "pacific" | "china";
export type RosterStatus = "active" | "sub" | "inactive" | "stand-in" | "loan";
export type TeamStaffRole = "manager" | "head-coach" | "assistant-coach" | "performance-coach" | "analyst" | "other";

export type EsportsSource = {
  url: string;
  label: string;
  verifiedAt: string;
  note?: string;
};

export type TeamStaffMember = {
  handle: string;
  realName?: string;
  role: TeamStaffRole;
  sources: EsportsSource[];
};

export type TeamOrganization = {
  foundedYear?: number;
  headquarters?: string;
  ownerName?: string;
  founderNames?: string[];
  websiteUrl?: string;
  sources: EsportsSource[];
};

export type ProPlayerSettings = {
  dpi?: number;
  sensitivity?: number;
  edpi?: number;
  crosshairCode?: string;
  mouse?: string;
  keyboard?: string;
  monitor?: string;
  headset?: string;
  mousepad?: string;
  earphones?: string;
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
  observation?: PlayerObservation;
  rosterStatus?: RosterStatus;
  teamId?: string;
  settings?: ProPlayerSettings;
  sources: EsportsSource[];
};

export type PlayerObservation = {
  agents: { agent: string; maps: number; usage: number }[];
  source: EsportsSource;
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
  staff?: TeamStaffMember[];
  organization?: TeamOrganization;
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
