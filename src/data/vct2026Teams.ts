export type VctRegion = "Americas" | "EMEA" | "Pacific" | "China";

export type Vct2026Team = {
  id: string;
  name: string;
  shortName: string;
  region: VctRegion;
};

export const VCT_2026_OFFICIAL_SOURCE =
  "https://valorantesports.com/en-US/season/115571062868511862/handbook";

/**
 * Official Tier 1 VCT 2026 field. Riot's league handbook lists 48 teams,
 * split evenly across Americas, EMEA, Pacific and China.
 *
 * This file is intentionally team-directory data only. Rosters, player photos,
 * roles and settings remain provenance-tracked separately because they change
 * far more frequently during the season.
 */
export const VCT_2026_TEAMS: Vct2026Team[] = [
  { id: "envy", name: "ENVY", shortName: "ENVY", region: "Americas" },
  { id: "eg", name: "Evil Geniuses", shortName: "EG", region: "Americas" },
  { id: "loud", name: "LOUD", shortName: "LOUD", region: "Americas" },
  { id: "c9", name: "Cloud9", shortName: "C9", region: "Americas" },
  { id: "kru", name: "KRÜ Visa", shortName: "KRU", region: "Americas" },
  { id: "furia", name: "FURIA", shortName: "FUR", region: "Americas" },
  { id: "100t", name: "100 Thieves", shortName: "100T", region: "Americas" },
  { id: "lev", name: "Leviatán Esports", shortName: "LEV", region: "Americas" },
  { id: "nrg", name: "NRG", shortName: "NRG", region: "Americas" },
  { id: "mibr", name: "MIBR", shortName: "MIBR", region: "Americas" },
  { id: "sen", name: "Sentinels", shortName: "SEN", region: "Americas" },
  { id: "g2", name: "G2 Esports", shortName: "G2", region: "Americas" },

  { id: "navi", name: "NAVI", shortName: "NAVI", region: "EMEA" },
  { id: "kc", name: "Karmine Corp", shortName: "KC", region: "EMEA" },
  { id: "fut", name: "FUT Esports", shortName: "FUT", region: "EMEA" },
  { id: "m8", name: "Gentle Mates", shortName: "M8", region: "EMEA" },
  { id: "pcf", name: "PCIFIC Esports", shortName: "PCF", region: "EMEA" },
  { id: "bbl", name: "BBL Esports", shortName: "BBL", region: "EMEA" },
  { id: "ulf", name: "ULF Esports", shortName: "ULF", region: "EMEA" },
  { id: "vit", name: "Team Vitality", shortName: "VIT", region: "EMEA" },
  { id: "th", name: "Team Heretics", shortName: "TH", region: "EMEA" },
  { id: "gx", name: "GIANTX", shortName: "GX", region: "EMEA" },
  { id: "fnc", name: "FNATIC", shortName: "FNC", region: "EMEA" },
  { id: "tl", name: "Team Liquid", shortName: "TL", region: "EMEA" },

  { id: "dfm", name: "DetonatioN FocusMe", shortName: "DFM", region: "Pacific" },
  { id: "krx", name: "Kiwoom DRX", shortName: "KRX", region: "Pacific" },
  { id: "fs", name: "FULL SENSE", shortName: "FS", region: "Pacific" },
  { id: "gen", name: "Gen.G", shortName: "GEN", region: "Pacific" },
  { id: "ge", name: "GLOBAL ESPORTS", shortName: "GE", region: "Pacific" },
  { id: "ns", name: "NONGSHIM REDFORCE", shortName: "NS", region: "Pacific" },
  { id: "prx", name: "Paper Rex", shortName: "PRX", region: "Pacific" },
  { id: "rrq", name: "Rex Regum Qeon", shortName: "RRQ", region: "Pacific" },
  { id: "t1", name: "T1", shortName: "T1", region: "Pacific" },
  { id: "ts", name: "Team Secret", shortName: "TS", region: "Pacific" },
  { id: "zeta", name: "ZETA DIVISION", shortName: "ZETA", region: "Pacific" },
  { id: "vl", name: "VARREL", shortName: "VL", region: "Pacific" },

  { id: "te", name: "Trace Esports", shortName: "TE", region: "China" },
  { id: "wol", name: "WOLVES ESPORTS", shortName: "WOL", region: "China" },
  { id: "fpx", name: "FunPlus Phoenix", shortName: "FPX", region: "China" },
  { id: "tyloo", name: "TYLOO GAMING", shortName: "TYL", region: "China" },
  { id: "ag", name: "ALL GAMERS", shortName: "AG", region: "China" },
  { id: "nova", name: "NOVA ESPORTS", shortName: "NOVA", region: "China" },
  { id: "jdg", name: "JD GAMING", shortName: "JDG", region: "China" },
  { id: "tec", name: "TITAN ESPORTS CLUB", shortName: "TEC", region: "China" },
  { id: "xlg", name: "Xi Lai Gaming", shortName: "XLG", region: "China" },
  { id: "edg", name: "EDWARD Gaming", shortName: "EDG", region: "China" },
  { id: "blg", name: "Bilibili Gaming", shortName: "BLG", region: "China" },
  { id: "drg", name: "DRAGON RANGER GAMING", shortName: "DRG", region: "China" },
];
