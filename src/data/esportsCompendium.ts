import { VALORANT_AMERICAS_2026 } from "@/data/valorant/americas";
import { VALORANT_CHINA_2026 } from "@/data/valorant/china";
import { VALORANT_EMEA_2026 } from "@/data/valorant/emea";
import { VALORANT_PACIFIC_2026 } from "@/data/valorant/pacific";
import { VERIFIED_AT, VERIFIED_ROLES, VERIFIED_SETTINGS } from "@/data/valorant/settings";
import { EXTRA_VERIFIED_SETTINGS } from "@/data/valorant/settingsExtended";
import { INDIVIDUAL_EXTRA_SETTINGS } from "@/data/valorant/settingsIndividualExtra";
import { SETTINGS_SNAPSHOT } from "@/data/valorant/settingsSnapshot";
import { mergeSettings } from "@/data/valorant/mergeSettings";
import { PLAYER_OBSERVATIONS } from "@/data/valorant/playerObservations";
import { observedRole } from "@/data/valorant/observedRole";
import { VALORANT_TEAM_DETAILS } from "@/data/valorant/teamDetails";
import type {
  CompetitiveSourceLink,
  EsportsGameSlug,
  EsportsPlayer,
  EsportsTeam,
  PlayerSeed,
  ValorantRosterSeed,
} from "@/data/valorant/types";

export type {
  CompetitiveSourceLink,
  EsportsGameSlug,
  EsportsPlayer,
  EsportsSource,
  EsportsTeam,
  ProPlayerSettings,
  RosterStatus,
  TeamOrganization,
  TeamStaffMember,
  TeamStaffRole,
  ValorantRegion,
} from "@/data/valorant/types";

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

const VALORANT_TEAMS_2026: ValorantRosterSeed[] = [
  ...VALORANT_AMERICAS_2026,
  ...VALORANT_EMEA_2026,
  ...VALORANT_PACIFIC_2026,
  ...VALORANT_CHINA_2026,
];

// Priority order: consolidated list < newer individual pass < original hand-verified records.
const VERIFIED_PLAYER_SETTINGS = mergeSettings(
  EXTRA_VERIFIED_SETTINGS,
  SETTINGS_SNAPSHOT,
  INDIVIDUAL_EXTRA_SETTINGS,
  VERIFIED_SETTINGS,
);

function normalizeHandle(handle: string) {
  return handle.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function playerId(teamId: string, handle: string) {
  return `${teamId}-${handle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

function playerFromSeed(team: ValorantRosterSeed, seed: PlayerSeed): EsportsPlayer {
  const normalized = normalizeHandle(seed.handle);
  const verified = VERIFIED_PLAYER_SETTINGS[normalized];
  const observation = PLAYER_OBSERVATIONS[playerId(team.id, seed.handle)];
  const role = observedRole(observation) ?? VERIFIED_ROLES[normalized];

  return {
    id: playerId(team.id, seed.handle),
    game: "valorant",
    handle: seed.handle,
    ...(seed.realName ? { realName: seed.realName } : {}),
    ...(role ? { role } : {}),
    ...(observation ? { observation } : {}),
    rosterStatus: seed.status ?? "active",
    teamId: team.id,
    ...(verified ? { settings: verified.settings } : {}),
    sources: [
      {
        url: team.vlrUrl,
        label: "VLR.gg",
        verifiedAt: VERIFIED_AT,
        note: `Roster snapshot — ${team.name}.`,
      },
      ...(verified?.sources ?? []),
      ...(observation ? [observation.source] : []),
    ],
  };
}

export const ESPORTS_PLAYERS: EsportsPlayer[] = VALORANT_TEAMS_2026.flatMap((team) =>
  team.players.map((player) => playerFromSeed(team, player)),
);

export const ESPORTS_TEAMS: EsportsTeam[] = VALORANT_TEAMS_2026.map((team) => ({
  id: team.id,
  game: "valorant",
  name: team.name,
  shortName: team.shortName,
  ...(team.countryCode ? { countryCode: team.countryCode } : {}),
  region: team.region,
  ...(team.logoUrl ? { logoUrl: team.logoUrl } : {}),
  playerIds: team.players.map((player) => playerId(team.id, player.handle)),
  ...VALORANT_TEAM_DETAILS[team.id],
  sources: [
    {
      url: team.vlrUrl,
      label: "VLR.gg",
      verifiedAt: VERIFIED_AT,
      note: team.entryStage === "play-ins" ? "VCT 2026 play-ins roster snapshot." : "VCT 2026 regional roster snapshot.",
    },
  ],
}));

/**
 * The competitive directory is a dated, provenance-tracked snapshot. VLR is the
 * roster/event reference and ProSettings is the settings/gear reference. Values
 * without a verified source remain hidden instead of being inferred.
 */
export function getEsportsTeams(game: EsportsGameSlug) {
  return ESPORTS_TEAMS.filter((team) => team.game === game);
}

export function getEsportsPlayers(game: EsportsGameSlug) {
  return ESPORTS_PLAYERS.filter((player) => player.game === game);
}
