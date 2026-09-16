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

/**
 * MGP competitive data is intentionally curated and provenance-tracked.
 * Do not bulk scrape VLR, ProSettings or other third-party databases.
 * Add entries only when a source can be recorded and a verification date is known.
 */
export const ESPORTS_TEAMS: EsportsTeam[] = [];
export const ESPORTS_PLAYERS: EsportsPlayer[] = [];

export function getEsportsTeams(game: EsportsGameSlug) {
  return ESPORTS_TEAMS.filter((team) => team.game === game);
}

export function getEsportsPlayers(game: EsportsGameSlug) {
  return ESPORTS_PLAYERS.filter((player) => player.game === game);
}
