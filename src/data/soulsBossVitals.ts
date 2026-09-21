export type SoulsBossVitals = {
  healthNg: string;
  soulsNg: string;
  note?: string;
};

export const DS3_BOSS_VITALS_SOURCE = {
  label: "Soulsborndle · DS3 boss dataset",
  url: "https://github.com/malthesers/soulsborndle/blob/main/src/bosses/dark-souls-3.ts",
};

export const DARK_SOULS_III_BOSS_VITALS: Record<string, SoulsBossVitals> = {
  "iudex-gundyr": { healthNg: "1,037", soulsNg: "3,000" },
  "vordt-of-the-boreal-valley": { healthNg: "1,328", soulsNg: "3,000" },
  "curse-rotted-greatwood": { healthNg: "5,405", soulsNg: "7,000" },
  "crystal-sage": { healthNg: "2,723", soulsNg: "8,000" },
  "deacons-of-the-deep": { healthNg: "4,099", soulsNg: "13,000" },
  "abyss-watchers": { healthNg: "1,548", soulsNg: "18,000" },
  "high-lord-wolnir": { healthNg: "15,041", soulsNg: "22,000" },
  "old-demon-king": { healthNg: "5,301", soulsNg: "25,000" },
  "pontiff-sulyvahn": { healthNg: "5,106", soulsNg: "28,000" },
  "yhorm-the-giant": { healthNg: "27,822", soulsNg: "36,000" },
  "aldrich-devourer-of-gods": { healthNg: "4,727", soulsNg: "50,000" },
  "dancer-of-the-boreal-valley": { healthNg: "5,111", soulsNg: "60,000" },
  "dragonslayer-armour": { healthNg: "4,581", soulsNg: "48,000" },
  "oceiros-the-consumed-king": { healthNg: "8,087", soulsNg: "58,000" },
  "champion-gundyr": { healthNg: "4,956", soulsNg: "60,000" },
  "lothric-younger-prince-and-lorian-elder-prince": {
    healthNg: "Lorian 3,436 · Lothric 4,294",
    soulsNg: "85,000",
    note: "O encontro usa dois alvos principais em fases diferentes; o MGP mantém os valores separados.",
  },
  "ancient-wyvern": { healthNg: "7,873", soulsNg: "70,000" },
  "the-nameless-king": {
    healthNg: "King of the Storm 4,577 · Nameless King 7,100",
    soulsNg: "80,000",
    note: "HP exibido por fase/alvo.",
  },
  "soul-of-cinder": { healthNg: "10,766", soulsNg: "100,000" },
  "champion-s-gravetender-and-gravetender-greatwolf": {
    healthNg: "Gravetender 2,791 · Greatwolf 2,791",
    soulsNg: "60,000",
  },
  "sister-friede-and-father-ariandel": {
    healthNg: "18,877 (ficha agregada da Sister Friede)",
    soulsNg: "72,000",
    note: "O encontro possui múltiplas fases e dois personagens; o valor de referência é tratado como ficha agregada, não como uma única barra simples.",
  },
  "demon-in-pain-demon-from-below-and-demon-prince": {
    healthNg: "Demon in Pain 7,062 · Demon from Below 7,062 · Demon Prince 7,045",
    soulsNg: "100,000",
  },
  "halflight-spear-of-the-church": { healthNg: "3,350", soulsNg: "80,000" },
  "darkeater-midir": { healthNg: "15,860", soulsNg: "150,000" },
  "slave-knight-gael": { healthNg: "15,037", soulsNg: "120,000" },
};

export function getDs3BossVitals(slug: string) {
  return DARK_SOULS_III_BOSS_VITALS[slug] ?? null;
}
