export type SoulsDamageChannel =
  "physical" | "strike" | "slash" | "thrust" | "magic" | "fire" | "lightning" | "dark";

export type SoulsStatusChannel = "bleed" | "poison" | "frost";

export type SoulsBossDefenseVariant = {
  label: string;
  absorption: Partial<Record<SoulsDamageChannel, number>>;
  status?: Partial<Record<SoulsStatusChannel, number | "immune">>;
  note?: string;
};

export type SoulsBossDefenseProfile = {
  variants: SoulsBossDefenseVariant[];
  note?: string;
};

export const DS3_BOSS_DEFENSE_SOURCE = {
  label: "DS3 Boss Defenses · community technical sheet",
  url: "https://docs.google.com/spreadsheets/d/1TI7Hi3IcBSiSJ5RjIEvaTX8t70Q5HaNY-TxOoR_4qOQ/edit",
  note: "Absorption values and status thresholds are a technical community reference. Negative absorption indicates a damage vulnerability; immunity is shown explicitly instead of being converted into a fake numeric score.",
};

const base = (
  absorption: SoulsBossDefenseVariant["absorption"],
  status?: SoulsBossDefenseVariant["status"],
  note?: string,
): SoulsBossDefenseProfile => ({
  variants: [
    {
      label: "Boss",
      absorption,
      ...(status ? { status } : {}),
      ...(note ? { note } : {}),
    },
  ],
});

export const DARK_SOULS_III_BOSS_DEFENSES: Record<string, SoulsBossDefenseProfile> = {
  "iudex-gundyr": base(
    {
      physical: 15,
      strike: 12,
      slash: 18,
      thrust: 16,
      magic: 5,
      fire: 2,
      lightning: -14,
      dark: 38,
    },
    { bleed: 239, poison: "immune", frost: 75 },
  ),
  "vordt-of-the-boreal-valley": base(
    {
      physical: 35,
      strike: 18,
      slash: 38,
      thrust: 36,
      magic: 24,
      fire: 18,
      lightning: 15,
      dark: -27,
    },
    { bleed: "immune", poison: "immune", frost: "immune" },
  ),
  "curse-rotted-greatwood": {
    variants: [
      {
        label: "Sacos vulneráveis",
        absorption: { fire: -110 },
        status: { bleed: "immune", poison: "immune", frost: "immune" },
        note: "A luta é baseada nos sacos vulneráveis; o valor de fogo abaixo representa essas regiões, não o corpo inteiro.",
      },
    ],
    note: "Boss com hitzones muito diferentes. O ÍMPAR evita exibir um único número global que esconderia a mecânica do encontro.",
  },
  "crystal-sage": base(
    {
      physical: -20,
      strike: -19,
      slash: -22,
      thrust: -20,
      magic: 40,
      fire: 0,
      lightning: 2,
      dark: 0,
    },
    { bleed: 137, poison: 102, frost: 188 },
  ),
  "deacons-of-the-deep": base(
    {
      physical: -20,
      strike: -19,
      slash: -23,
      thrust: -21,
      magic: 46,
      fire: 0,
      lightning: -2,
      dark: 44,
    },
    { bleed: 137, poison: 137, frost: 137 },
  ),
  "abyss-watchers": base(
    {
      physical: 15,
      strike: 14,
      slash: 18,
      thrust: 16,
      magic: 10,
      fire: 8,
      lightning: -12,
      dark: 35,
    },
    { bleed: 673, poison: "immune", frost: 139 },
  ),
  "high-lord-wolnir": base(
    {
      physical: 32,
      strike: 9,
      slash: 34,
      thrust: 36,
      magic: 24,
      fire: 28,
      lightning: 40,
      dark: 70,
    },
    { bleed: "immune", poison: "immune", frost: "immune" },
    "Os braceletes são o alvo central da mecânica; a leitura de absorção não substitui essa prioridade.",
  ),
  "old-demon-king": base(
    { physical: 0, strike: -2, slash: 2, thrust: 0, magic: 5, fire: 78, lightning: 4, dark: 0 },
    { bleed: "immune", poison: 692, frost: "immune" },
  ),
  "pontiff-sulyvahn": base(
    { physical: 0, strike: 2, slash: -3, thrust: -20, magic: 12, fire: 8, lightning: 5, dark: 5 },
    { bleed: 317, poison: 317, frost: 317 },
  ),
  "yhorm-the-giant": {
    variants: [
      {
        label: "Cabeça",
        absorption: { lightning: -79.2 },
        status: { bleed: "immune", poison: "immune", frost: "immune" },
        note: "A cabeça recebe uma vulnerabilidade extrema a raio em comparação às demais zonas.",
      },
      {
        label: "Corpo / membros",
        absorption: {},
        status: { bleed: "immune", poison: "immune", frost: "immune" },
        note: "Hitzones variam; Storm Ruler continua sendo a mecânica intencional do encontro.",
      },
    ],
  },
  "aldrich-devourer-of-gods": {
    variants: [
      {
        label: "Cabeça",
        absorption: { fire: -68, lightning: -50 },
        status: { poison: "immune" },
        note: "A cabeça é muito mais vulnerável do que o restante do corpo.",
      },
      {
        label: "Corpo / cauda",
        absorption: {},
        status: { poison: "immune" },
        note: "Absorções variam por hitzone; o ÍMPAR não mistura essas regiões em uma média artificial.",
      },
    ],
  },
  "dancer-of-the-boreal-valley": base(
    {
      physical: 20,
      strike: 19,
      slash: 22,
      thrust: 20,
      magic: 19,
      fire: 18,
      lightning: 17,
      dark: -26,
    },
    { bleed: 324, poison: "immune", frost: "immune" },
  ),
  "dragonslayer-armour": base(
    {
      physical: 32,
      strike: 25,
      slash: 35,
      thrust: 35,
      magic: 24,
      fire: 20,
      lightning: 72,
      dark: 68,
    },
    { bleed: "immune", poison: "immune", frost: 110 },
  ),
  "oceiros-the-consumed-king": base(
    {
      physical: 20,
      strike: 18,
      slash: 22,
      thrust: 15,
      magic: 40,
      fire: 20,
      lightning: -40,
      dark: 22,
    },
    { bleed: 331, poison: "immune", frost: 137 },
  ),
  "champion-gundyr": base(
    {
      physical: 18,
      strike: 15,
      slash: 21,
      thrust: 19,
      magic: 12,
      fire: 10,
      lightning: -12,
      dark: 5,
    },
    { bleed: 328, poison: 328, frost: 148 },
  ),
  "lothric-younger-prince-and-lorian-elder-prince": {
    variants: [
      {
        label: "Lorian",
        absorption: {
          physical: 20,
          strike: 18,
          slash: 22,
          thrust: 20,
          magic: 5,
          fire: 2,
          lightning: -20,
          dark: 70,
        },
        status: { bleed: 333, poison: "immune", frost: 111 },
      },
      {
        label: "Lothric",
        absorption: {
          physical: -20,
          strike: -18,
          slash: -22,
          thrust: -20,
          magic: 47,
          fire: 2,
          lightning: 4,
          dark: 73,
        },
        status: { bleed: 333, poison: "immune", frost: 333 },
      },
    ],
  },
  "ancient-wyvern": {
    variants: [
      {
        label: "Corpo",
        absorption: {},
        status: { frost: 84 },
        note: "Encontro de gimmick com hitzones distintos; o ataque de queda continua sendo a solução principal.",
      },
    ],
  },
  "the-nameless-king": {
    variants: [
      {
        label: "King of the Storm · cabeça",
        absorption: { lightning: -70.3 },
        status: { bleed: 336, poison: 336, frost: 205 },
        note: "A cabeça do drake é a hitzone de maior retorno.",
      },
      {
        label: "Nameless King",
        absorption: {
          physical: 21,
          strike: 19,
          slash: 22,
          thrust: 20,
          magic: 24,
          fire: 23,
          lightning: 83,
          dark: -8,
        },
        status: { bleed: 336, poison: "immune", frost: 336 },
      },
    ],
  },
  "soul-of-cinder": base(
    {
      physical: 15,
      strike: 12,
      slash: 17,
      thrust: 17,
      magic: 19,
      fire: 35,
      lightning: 5,
      dark: 15,
    },
    { bleed: 337, poison: "immune", frost: 725 },
  ),
  "champion-s-gravetender-and-gravetender-greatwolf": {
    variants: [
      {
        label: "Champion's Gravetender",
        absorption: {
          physical: 42.4,
          strike: 38.85,
          slash: 43.52,
          thrust: 41.14,
          magic: 42.52,
          fire: 40.65,
          lightning: 38.83,
          dark: 42.96,
        },
        status: { bleed: 317, poison: 305, frost: 318 },
      },
      {
        label: "Gravetender Greatwolf",
        absorption: {
          physical: 5,
          strike: 10,
          slash: 2,
          thrust: -2,
          magic: 5,
          fire: -16,
          lightning: 7,
          dark: 7,
        },
        status: { bleed: 149, poison: 205, frost: 336 },
      },
    ],
  },
  "sister-friede-and-father-ariandel": {
    variants: [
      {
        label: "Sister Friede",
        absorption: {
          physical: -5,
          strike: -2,
          slash: -8,
          thrust: -8,
          magic: 39,
          fire: 16,
          lightning: 3,
          dark: 5,
        },
        status: { bleed: 336, poison: 723, frost: "immune" },
      },
      {
        label: "Father Ariandel",
        absorption: {
          physical: -28,
          strike: -26,
          slash: -30,
          thrust: -34,
          magic: 2,
          fire: -19,
          lightning: -27,
          dark: -27,
        },
        status: { bleed: 205, poison: 149, frost: 205 },
      },
    ],
  },
  "demon-in-pain-demon-from-below-and-demon-prince": {
    variants: [
      {
        label: "Demon in Pain / Demon from Below",
        absorption: {
          physical: 0,
          strike: 1,
          slash: -18,
          thrust: -2,
          magic: 20,
          fire: 78,
          lightning: 22,
          dark: 17,
        },
        status: { bleed: 349, poison: "immune", frost: "immune" },
      },
      {
        label: "Demon Prince",
        absorption: {
          physical: 53,
          strike: 53.47,
          slash: 44.54,
          thrust: 52.06,
          magic: 62,
          fire: 89.66,
          lightning: 63.34,
          dark: 61,
        },
        status: { bleed: 349, poison: "immune", frost: "immune" },
      },
    ],
  },
  "halflight-spear-of-the-church": base(
    {
      physical: 31.15,
      strike: 30.58,
      slash: 30.22,
      thrust: 30,
      magic: 39.03,
      fire: 37.59,
      lightning: 38.55,
      dark: 38.69,
    },
    { bleed: 301, poison: 285, frost: 301 },
  ),
  "darkeater-midir": {
    variants: [
      {
        label: "Cabeça",
        absorption: {
          physical: 4,
          strike: 4,
          slash: 6,
          thrust: -10,
          magic: 50,
          fire: 52,
          lightning: 22,
          dark: 78,
        },
        status: { bleed: "immune", poison: "immune", frost: "immune" },
      },
      {
        label: "Garras / corpo",
        absorption: {
          physical: 52,
          strike: 52,
          slash: 53,
          thrust: 45,
          magic: 75,
          fire: 76,
          lightning: 61,
          dark: 89,
        },
        status: { bleed: "immune", poison: "immune", frost: "immune" },
        note: "A cabeça é a hitzone preferencial; atacar corpo e garras sofre absorção muito maior.",
      },
    ],
  },
  "slave-knight-gael": {
    variants: [
      {
        label: "Fase 1",
        absorption: {
          physical: 35,
          strike: 34,
          slash: 38,
          thrust: 34,
          magic: 44,
          fire: 42,
          lightning: 41,
          dark: 46,
        },
        status: { bleed: 366, poison: 366, frost: 224 },
      },
      {
        label: "Fases 2–3",
        absorption: {
          physical: 35,
          strike: 34,
          slash: 38,
          thrust: 34,
          magic: 44,
          fire: 42,
          lightning: 41,
          dark: 72,
        },
        status: { bleed: 366, poison: 366, frost: 224 },
      },
    ],
  },
};

export function getDs3BossDefenseProfile(slug: string) {
  return DARK_SOULS_III_BOSS_DEFENSES[slug] ?? null;
}
