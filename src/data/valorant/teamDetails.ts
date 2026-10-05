import type { EsportsSource, TeamOrganization, TeamStaffMember } from "./types";

type TeamDetailSeed = {
  staff: TeamStaffMember[];
  organization?: TeamOrganization;
};

const VERIFIED_AT = "2026-09-17";

function vlrSource(url: string, note: string): EsportsSource {
  return { url, label: "VLR.gg", verifiedAt: VERIFIED_AT, note };
}

function staff(
  handle: string,
  realName: string | undefined,
  role: TeamStaffMember["role"],
  teamUrl: string,
): TeamStaffMember {
  return {
    handle,
    ...(realName ? { realName } : {}),
    role,
    sources: [vlrSource(teamUrl, "Current staff listing checked for ÍMPAR.")],
  };
}

/**
 * Staff is included only after the current VLR team page is checked.
 * Ownership/founder fields stay absent until an institutional source confirms them.
 */
export const VALORANT_TEAM_DETAILS: Record<string, TeamDetailSeed> = {
  loud: {
    staff: [
      staff("Wenty", "Carlos Lira Portela", "manager", "https://www.vlr.gg/team/6961/loud"),
      staff("Romanilly", "Gonzalo Manzano", "head-coach", "https://www.vlr.gg/team/6961/loud"),
      staff("Bati", "Miguel Batista", "assistant-coach", "https://www.vlr.gg/team/6961/loud"),
      staff(
        "bajerski",
        "Lucas Bajerski Pereira",
        "performance-coach",
        "https://www.vlr.gg/team/6961/loud",
      ),
    ],
    organization: {
      websiteUrl: "https://loud.gg/",
      sources: [
        vlrSource(
          "https://www.vlr.gg/team/6961/loud",
          "Official website linked by the team profile.",
        ),
      ],
    },
  },
  lev: {
    staff: [
      staff("Onur", "Rodrigo Dalmagro", "head-coach", "https://www.vlr.gg/team/2359/leviat-n"),
    ],
  },
  mibr: {
    staff: [
      staff("Nandinnn", undefined, "manager", "https://www.vlr.gg/team/7386/mibr"),
      staff("fRoD", "Daniel Montaner", "head-coach", "https://www.vlr.gg/team/7386/mibr"),
      staff(
        "Happy",
        "Vincent Schopenhauer",
        "assistant-coach",
        "https://www.vlr.gg/team/7386/mibr",
      ),
    ],
  },
  sen: {
    staff: [
      staff("Zyto", "Bryan Ybanez", "manager", "https://www.vlr.gg/team/2/sentinels"),
      staff(
        "Ewok",
        "Marthinus Jacobus Van Der Walt",
        "head-coach",
        "https://www.vlr.gg/team/2/sentinels",
      ),
      staff("GUNTER", "Luke Clives", "assistant-coach", "https://www.vlr.gg/team/2/sentinels"),
    ],
  },
};
