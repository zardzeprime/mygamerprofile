import { loadSoulsCompendiumCategory } from "@/lib/souls-compendium";

export type SoulsDpsGame = "dark-souls-remastered" | "dark-souls-iii";
export type SoulsDpsStat = "str" | "dex" | "int" | "fth" | "lck";

export type SoulsStats = {
  str: number;
  dex: number;
  int: number;
  fth: number;
  lck: number;
};

export type SoulsDamage = {
  physical: number;
  magic: number;
  fire: number;
  lightning: number;
  dark: number;
};

export type SoulsRequirements = Pick<SoulsStats, "str" | "dex" | "int" | "fth">;
export type SoulsScaling = SoulsStats;

export type SoulsDpsWeapon = {
  id: string;
  game: SoulsDpsGame;
  name: string;
  weaponClass?: string;
  iconUrl?: string;
  weight?: number;
  requirements: SoulsRequirements;
  baseDamage: SoulsDamage;
  maxDamage?: SoulsDamage;
  durability?: number;
  enchantable?: boolean;
  scalingLetters?: Partial<Record<SoulsDpsStat, string | null>>;
  scalingNumeric?: SoulsScaling;
  infusions?: string[];
  maxUpgrade: number;
  sourceUrl: string;
  obtained?: string[];
  attackTypes?: string[];
};

export type Ds3WeaponLevel = SoulsDpsWeapon & {
  infusion: string;
  level: number;
  saturation: {
    physical: number;
    magic: number;
    fire: number;
    lightning: number;
    dark: number;
    bleed: number;
    poison: number;
  };
  weaponId: number;
  buffable: boolean;
};

export type SoulsDpsResult = {
  damage: SoulsDamage;
  totalAr: number;
  requirementsMet: boolean;
  rating: number;
  ratingLabel: string;
  scalingGrades: Partial<Record<SoulsDpsStat, string>>;
  notes: string[];
};

const DS1_WEAPONS_URL =
  "https://gist.githubusercontent.com/BonsaiDen/4096890/raw/DarkSoulsWeapons.js";
const DS1_SOURCE_URL = "https://gist.github.com/BonsaiDen/4096890";
const DS1_REINFORCEMENT_URL =
  "https://raw.githubusercontent.com/Sezergumus/Dark-Souls-API/main/src/weapons.json";
const DS1_REINFORCEMENT_SOURCE =
  "https://github.com/Sezergumus/Dark-Souls-API";
const DS3_BASE =
  "https://raw.githubusercontent.com/Phil25/DS3InventoryBuilder/master/DataGenerator/Raw";
const DS3_SOURCE_URL = "https://github.com/Phil25/DS3InventoryBuilder";

const emptyDamage = (): SoulsDamage => ({
  physical: 0,
  magic: 0,
  fire: 0,
  lightning: 0,
  dark: 0,
});

const clampStat = (value: number) => Math.max(1, Math.min(99, Math.round(value)));

const parseCsvLine = (line: string) => {
  const out: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      out.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  out.push(current);
  return out;
};

const numberAt = (row: string[], index: number) => Number(row[index] ?? 0) || 0;

const scalingLetterFromCoefficient = (value: number) => {
  if (value >= 141) return "S";
  if (value >= 101) return "A";
  if (value >= 81) return "B";
  if (value >= 51) return "C";
  if (value >= 21) return "D";
  if (value > 0) return "E";
  return "-";
};

const gradeWeight = (grade?: string | null) => {
  switch (grade) {
    case "S":
      return 1;
    case "A":
      return 0.9;
    case "B":
      return 0.75;
    case "C":
      return 0.55;
    case "D":
      return 0.35;
    case "E":
      return 0.18;
    default:
      return 0;
  }
};

export const SOULS_RATING_LABELS = [
  "Inviável",
  "Muito fraco",
  "Fraco",
  "Limitado",
  "Regular",
  "Bom",
  "Muito bom",
  "Excelente",
  "Excepcional",
  "Overpower",
] as const;

export const SOULS_RATING_COLORS = [
  "bg-red-950",
  "bg-red-700",
  "bg-orange-700",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-400",
  "bg-lime-400",
  "bg-emerald-400",
  "bg-cyan-400",
  "bg-violet-500",
] as const;

function ds1StatCurve(stat: number) {
  const value = clampStat(stat);
  if (value <= 10) return value / 10 * 0.2;
  if (value <= 20) return 0.2 + ((value - 10) / 10) * 0.25;
  if (value <= 40) return 0.45 + ((value - 20) / 20) * 0.4;
  if (value <= 60) return 0.85 + ((value - 40) / 20) * 0.1;
  return 0.95 + ((value - 60) / 39) * 0.05;
}

function requirementMet(
  stats: SoulsStats,
  req: SoulsRequirements,
  twoHanded: boolean,
) {
  const effectiveStr = Math.min(99, stats.str * (twoHanded ? 1.5 : 1));
  return (
    effectiveStr >= req.str &&
    stats.dex >= req.dex &&
    stats.int >= req.int &&
    stats.fth >= req.fth
  );
}

type Ds1RawWeapon = {
  name: string;
  atk: {
    physical: number;
    magic: number;
    fire: number;
    lightning: number;
  };
  req: {
    strength: number;
    dexterity: number;
    intelligence: number;
    faith: number;
  };
  scale: {
    strength: string | null;
    dexterity: string | null;
    intelligence: string | null;
    faith: string | null;
  };
  durability?: number;
  weight?: number;
  attackTypes?: string[];
  obtained?: string[];
  aotaOnly?: boolean;
};

type Ds1ReinforcementRow = {
  name?: string;
  weight?: number;
  durability?: number;
  attack_type?: string;
  enchantable?: boolean;
  requirements?: { str?: number; dex?: number; int?: number; faith?: number };
  regular_phy_dmg?: number;
  regular_magic_dmg?: number;
  regular_fire_dmg?: number;
  regular_lightning_dmg?: number;
  regular15_phy_dmg?: number;
  regular15_magic_dmg?: number;
  regular15_fire_dmg?: number;
  regular15_lightning_dmg?: number;
  regular5_phy_dmg?: number;
  regular5_magic_dmg?: number;
  regular5_fire_dmg?: number;
  regular5_lightning_dmg?: number;
};

function flattenDs1ReinforcementRows(payload: unknown) {
  if (!Array.isArray(payload)) return [] as Array<Ds1ReinforcementRow & { category?: string }>;
  const rows: Array<Ds1ReinforcementRow & { category?: string }> = [];
  payload.forEach((group) => {
    if (!group || typeof group !== "object") return;
    const category = typeof (group as { category?: unknown }).category === "string"
      ? (group as { category: string }).category
      : undefined;
    Object.entries(group as Record<string, unknown>).forEach(([key, value]) => {
      if (key === "category" || !Array.isArray(value)) return;
      value.forEach((entry) => {
        if (entry && typeof entry === "object") {
          rows.push({ ...(entry as Ds1ReinforcementRow), category });
        }
      });
    });
  });
  return rows;
}

function ds1Endpoint(row?: Ds1ReinforcementRow) {
  if (!row) return null;
  const maxUpgrade =
    row.regular15_phy_dmg != null ||
    row.regular15_magic_dmg != null ||
    row.regular15_fire_dmg != null ||
    row.regular15_lightning_dmg != null
      ? 15
      : row.regular5_phy_dmg != null ||
          row.regular5_magic_dmg != null ||
          row.regular5_fire_dmg != null ||
          row.regular5_lightning_dmg != null
        ? 5
        : 0;
  if (!maxUpgrade) return null;
  const prefix = maxUpgrade === 15 ? "regular15" : "regular5";
  return {
    maxUpgrade,
    damage: {
      physical: Number(row[`${prefix}_phy_dmg` as keyof Ds1ReinforcementRow]) || 0,
      magic: Number(row[`${prefix}_magic_dmg` as keyof Ds1ReinforcementRow]) || 0,
      fire: Number(row[`${prefix}_fire_dmg` as keyof Ds1ReinforcementRow]) || 0,
      lightning: Number(row[`${prefix}_lightning_dmg` as keyof Ds1ReinforcementRow]) || 0,
      dark: 0,
    } satisfies SoulsDamage,
  };
}

let ds1Cache: Promise<SoulsDpsWeapon[]> | null = null;

export async function loadDs1Weapons() {
  if (ds1Cache) return ds1Cache;
  ds1Cache = Promise.all([
    fetch(DS1_WEAPONS_URL).then(async (response) => {
      if (!response.ok) throw new Error("DS1_WEAPONS_UNAVAILABLE");
      return (await response.json()) as Ds1RawWeapon[];
    }),
    loadSoulsCompendiumCategory("dark-souls-remastered", "weapon").catch(() => []),
    fetch(DS1_REINFORCEMENT_URL)
      .then(async (response) => {
        if (!response.ok) return [] as Array<Ds1ReinforcementRow & { category?: string }>;
        return flattenDs1ReinforcementRows(await response.json());
      })
      .catch(() => [] as Array<Ds1ReinforcementRow & { category?: string }>),
  ]).then(([weapons, icons, reinforcementRows]) => {
    const iconByName = new Map(
      icons.map((entry) => [entry.name.toLocaleLowerCase(), entry.iconUrl]),
    );
    const reinforcementByName = new Map(
      reinforcementRows
        .filter((row) => row.name)
        .map((row) => [row.name!.toLocaleLowerCase(), row] as const),
    );

    return weapons
      .filter((weapon) => weapon.atk && weapon.req && weapon.scale)
      .map<SoulsDpsWeapon>((weapon) => {
        const supplemental = reinforcementByName.get(weapon.name.toLocaleLowerCase());
        const endpoint = ds1Endpoint(supplemental);
        return {
          id: `ds1:${weapon.name}`,
          game: "dark-souls-remastered",
          name: weapon.name,
          weaponClass: supplemental?.category,
          iconUrl: iconByName.get(weapon.name.toLocaleLowerCase()),
          weight: supplemental?.weight ?? weapon.weight,
          durability: supplemental?.durability ?? weapon.durability,
          enchantable: supplemental?.enchantable,
          requirements: {
            str: supplemental?.requirements?.str ?? weapon.req.strength ?? 0,
            dex: supplemental?.requirements?.dex ?? weapon.req.dexterity ?? 0,
            int: supplemental?.requirements?.int ?? weapon.req.intelligence ?? 0,
            fth: supplemental?.requirements?.faith ?? weapon.req.faith ?? 0,
          },
          baseDamage: {
            physical: supplemental?.regular_phy_dmg ?? weapon.atk.physical ?? 0,
            magic: supplemental?.regular_magic_dmg ?? weapon.atk.magic ?? 0,
            fire: supplemental?.regular_fire_dmg ?? weapon.atk.fire ?? 0,
            lightning: supplemental?.regular_lightning_dmg ?? weapon.atk.lightning ?? 0,
            dark: 0,
          },
          maxDamage: endpoint?.damage,
          scalingLetters: {
            str: weapon.scale.strength,
            dex: weapon.scale.dexterity,
            int: weapon.scale.intelligence,
            fth: weapon.scale.faith,
            lck: null,
          },
          maxUpgrade: endpoint?.maxUpgrade ?? 15,
          sourceUrl: endpoint ? DS1_REINFORCEMENT_SOURCE : DS1_SOURCE_URL,
          obtained: weapon.obtained,
          attackTypes:
            supplemental?.attack_type?.split("/").map((entry) => entry.trim()).filter(Boolean) ??
            weapon.attackTypes,
        };
      });
  });
  return ds1Cache;
}

type Ds3ParsedRow = {
  id: number;
  groupId: number;
  displayName: string;
  weaponClass: string;
  infusion: string;
  buffable: boolean;
  weight: number;
  requirements: SoulsRequirements;
  damage: SoulsDamage;
  scaling: SoulsScaling;
  saturation: Ds3WeaponLevel["saturation"];
};

function parseDs3Row(row: string[]): Ds3ParsedRow {
  return {
    id: numberAt(row, 0),
    groupId: Math.floor(numberAt(row, 0) / 10000),
    displayName: row[1] ?? "",
    weaponClass: row[2] ?? "",
    infusion: row[3] || "-",
    buffable: (row[4] ?? "") === "TRUE",
    weight: numberAt(row, 7),
    requirements: {
      str: numberAt(row, 8),
      dex: numberAt(row, 9),
      int: numberAt(row, 10),
      fth: numberAt(row, 11),
    },
    damage: {
      physical: numberAt(row, 178),
      magic: numberAt(row, 179),
      fire: numberAt(row, 180),
      lightning: numberAt(row, 181),
      dark: numberAt(row, 182),
    },
    scaling: {
      str: numberAt(row, 194),
      dex: numberAt(row, 195),
      int: numberAt(row, 196),
      fth: numberAt(row, 197),
      lck: numberAt(row, 198),
    },
    saturation: {
      physical: numberAt(row, 23),
      magic: numberAt(row, 24),
      fire: numberAt(row, 25),
      lightning: numberAt(row, 26),
      dark: numberAt(row, 27),
      bleed: numberAt(row, 28),
      poison: numberAt(row, 29),
    },
  };
}

const ds3LevelCache = new Map<number, Promise<Ds3ParsedRow[]>>();
let ds3CatalogCache: Promise<SoulsDpsWeapon[]> | null = null;
let ds3UniqueCache: Promise<Map<string, number>> | null = null;
let saturationCache: Promise<number[][]> | null = null;

async function loadDs3LevelRows(level: number) {
  const normalized = Math.max(0, Math.min(10, Math.round(level)));
  const existing = ds3LevelCache.get(normalized);
  if (existing) return existing;
  const promise = fetch(`${DS3_BASE}/weapons_${normalized}.csv`)
    .then(async (response) => {
      if (!response.ok) throw new Error("DS3_WEAPONS_UNAVAILABLE");
      const text = await response.text();
      return text
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => parseDs3Row(parseCsvLine(line)));
    });
  ds3LevelCache.set(normalized, promise);
  return promise;
}

async function loadDs3UpgradeLimits() {
  if (ds3UniqueCache) return ds3UniqueCache;
  ds3UniqueCache = fetch(`${DS3_BASE}/uniqueness.tsv`)
    .then(async (response) => {
      if (!response.ok) return new Map<string, number>();
      const text = await response.text();
      const map = new Map<string, number>();
      text.split(/\r?\n/).forEach((line) => {
        const [fullName] = line.split("\t");
        if (!fullName) return;
        const match = fullName.match(/^(.*?)\s*\+(\d+)\s*$/);
        if (!match) return;
        map.set(match[1].trim(), Number(match[2]) || 10);
      });
      return map;
    })
    .catch(() => new Map<string, number>());
  return ds3UniqueCache;
}

export async function loadDs3Weapons() {
  if (ds3CatalogCache) return ds3CatalogCache;
  ds3CatalogCache = Promise.all([
    loadDs3LevelRows(0),
    loadDs3UpgradeLimits(),
    fetch(`${DS3_BASE}/order.json`).then(async (response) => {
      if (!response.ok) return [] as string[];
      return (await response.json()) as string[];
    }),
  ]).then(([rows, limits, order]) => {
    const grouped = new Map<number, Ds3ParsedRow[]>();
    rows.forEach((row) => {
      const list = grouped.get(row.groupId) ?? [];
      list.push(row);
      grouped.set(row.groupId, list);
    });

    const byName = new Map<string, Ds3ParsedRow[]>();
    grouped.forEach((variants) => {
      const base = variants.find((row) => row.infusion === "-") ?? variants[0];
      if (base?.displayName) byName.set(base.displayName, variants);
    });

    const names = order.length ? order : Array.from(byName.keys());
    return names
      .map((name) => {
        const variants = byName.get(name);
        if (!variants?.length) return null;
        const base = variants.find((row) => row.infusion === "-") ?? variants[0];
        const infusions = variants.map((row) => row.infusion);
        return {
          id: `ds3:${name}`,
          game: "dark-souls-iii" as const,
          name,
          weaponClass: base.weaponClass,
          iconUrl: `${DS3_BASE}/Image/${encodeURIComponent(name)}.png`,
          weight: base.weight,
          requirements: base.requirements,
          baseDamage: base.damage,
          scalingNumeric: base.scaling,
          scalingLetters: {
            str: scalingLetterFromCoefficient(base.scaling.str),
            dex: scalingLetterFromCoefficient(base.scaling.dex),
            int: scalingLetterFromCoefficient(base.scaling.int),
            fth: scalingLetterFromCoefficient(base.scaling.fth),
            lck: scalingLetterFromCoefficient(base.scaling.lck),
          },
          infusions,
          maxUpgrade: limits.get(name) ?? 10,
          sourceUrl: DS3_SOURCE_URL,
        } satisfies SoulsDpsWeapon;
      })
      .filter((entry): entry is SoulsDpsWeapon => Boolean(entry));
  });
  return ds3CatalogCache;
}

async function loadDs3Saturations() {
  if (saturationCache) return saturationCache;
  saturationCache = fetch(`${DS3_BASE}/saturations.csv`).then(async (response) => {
    if (!response.ok) throw new Error("DS3_SATURATIONS_UNAVAILABLE");
    const text = await response.text();
    const rows = text.split(/\r?\n/).filter(Boolean).map(parseCsvLine);
    const output: number[][] = [];
    for (const row of rows) {
      const index = numberAt(row, 1);
      if (index > 16) break;
      output[index] = [0];
      for (let stat = 1; stat <= 99; stat += 1) {
        output[index][stat] = numberAt(row, 318 + stat);
      }
    }
    return output;
  });
  return saturationCache;
}

export async function loadDs3WeaponLevel(
  name: string,
  infusion: string,
  level: number,
): Promise<Ds3WeaponLevel | null> {
  const [rows, catalog] = await Promise.all([
    loadDs3LevelRows(level),
    loadDs3Weapons(),
  ]);
  const baseRow = rows.find(
    (row) => row.infusion === "-" && row.displayName === name,
  );
  const selected = baseRow
    ? rows.find(
        (row) => row.groupId === baseRow.groupId && row.infusion === infusion,
      )
    : null;
  const weapon = catalog.find((entry) => entry.name === name);
  if (!selected || !weapon) return null;
  return {
    ...weapon,
    weaponId: selected.id,
    infusion,
    level: Math.max(0, Math.min(weapon.maxUpgrade, level)),
    buffable: selected.buffable,
    requirements: selected.requirements,
    baseDamage: selected.damage,
    scalingNumeric: selected.scaling,
    scalingLetters: {
      str: scalingLetterFromCoefficient(selected.scaling.str),
      dex: scalingLetterFromCoefficient(selected.scaling.dex),
      int: scalingLetterFromCoefficient(selected.scaling.int),
      fth: scalingLetterFromCoefficient(selected.scaling.fth),
      lck: scalingLetterFromCoefficient(selected.scaling.lck),
    },
    saturation: selected.saturation,
  };
}

function ds3Sat(saturations: number[][], index: number, stat: number) {
  const curve = saturations[index] ?? [];
  return curve[clampStat(stat)] ?? 0;
}

export async function calculateDs3Ar(
  weapon: Ds3WeaponLevel,
  stats: SoulsStats,
  twoHanded: boolean,
): Promise<SoulsDpsResult> {
  const saturations = await loadDs3Saturations();
  const effectiveStats = {
    ...stats,
    str: Math.min(99, stats.str * (twoHanded ? 1.5 : 1)),
  };
  const reqMet = requirementMet(stats, weapon.requirements, twoHanded);
  const scaling = weapon.scalingNumeric ?? { str: 0, dex: 0, int: 0, fth: 0, lck: 0 };
  const sat = weapon.saturation;
  const base = weapon.baseDamage;

  const scaleValue = (
    stat: SoulsDpsStat,
    curveIndex: number,
    damageBase: number,
  ) =>
    damageBase *
    ((scaling[stat] ?? 0) / 100) *
    (ds3Sat(saturations, curveIndex, effectiveStats[stat]) / 100);

  const damage: SoulsDamage = {
    physical:
      base.physical *
      (reqMet
        ? 1 +
          scaleValue("str", sat.physical, 1) +
          scaleValue("dex", sat.physical, 1) +
          scaleValue("lck", sat.physical, 1)
        : 0.6),
    magic:
      base.magic *
      (reqMet ? 1 + scaleValue("int", sat.magic, 1) : 0.6),
    fire:
      base.fire *
      (reqMet
        ? 1 +
          scaleValue("int", sat.fire, 1) +
          scaleValue("fth", sat.fire, 1)
        : 0.6),
    lightning:
      base.lightning *
      (reqMet ? 1 + scaleValue("fth", sat.lightning, 1) : 0.6),
    dark:
      base.dark *
      (reqMet
        ? 1 +
          scaleValue("int", sat.dark, 1) +
          scaleValue("fth", sat.dark, 1)
        : 0.6),
  };

  const totalAr = Object.values(damage).reduce((sum, value) => sum + value, 0);
  const rating = casualRating(
    weapon,
    stats,
    weapon.level,
    weapon.maxUpgrade,
    twoHanded,
  );

  return {
    damage,
    totalAr,
    requirementsMet: reqMet,
    rating,
    ratingLabel: SOULS_RATING_LABELS[rating - 1],
    scalingGrades: {
      str: scalingLetterFromCoefficient(scaling.str),
      dex: scalingLetterFromCoefficient(scaling.dex),
      int: scalingLetterFromCoefficient(scaling.int),
      fth: scalingLetterFromCoefficient(scaling.fth),
      lck: scalingLetterFromCoefficient(scaling.lck),
    },
    notes: reqMet
      ? []
      : ["Você ainda não cumpre todos os requisitos da arma; o desempenho cai drasticamente."],
  };
}

function casualRating(
  weapon: SoulsDpsWeapon,
  stats: SoulsStats,
  upgrade: number,
  maxUpgrade: number,
  twoHanded: boolean,
) {
  if (!requirementMet(stats, weapon.requirements, twoHanded)) return 1;

  const effectiveStats = {
    ...stats,
    str: Math.min(99, stats.str * (twoHanded ? 1.5 : 1)),
  };
  const relevant: number[] = [];

  (["str", "dex", "int", "fth", "lck"] as SoulsDpsStat[]).forEach((stat) => {
    const grade = weapon.scalingLetters?.[stat];
    const weight =
      weapon.scalingNumeric && weapon.scalingNumeric[stat] > 0
        ? Math.min(1, weapon.scalingNumeric[stat] / 141)
        : gradeWeight(grade);
    if (weight <= 0) return;

    relevant.push(weight * ds1StatCurve(effectiveStats[stat]));
  });

  const bestFit = relevant.length ? Math.max(...relevant) : 0.15;
  const upgradeFit = maxUpgrade > 0 ? Math.min(1, upgrade / maxUpgrade) : 0;

  // Calibrado para leitura humana: B + ~40 no atributo principal chega a
  // "Excelente" com a arma bem melhorada; A/S com investimento alto alcança
  // "Excepcional/Overpower". O score não pretende substituir AR real.
  const rawScore = 2 + bestFit * 8 + upgradeFit;
  return Math.max(1, Math.min(10, Math.round(rawScore)));
}

export function calculateDs1Estimate(
  weapon: SoulsDpsWeapon,
  stats: SoulsStats,
  upgrade: number,
  twoHanded: boolean,
): SoulsDpsResult {
  const reqMet = requirementMet(stats, weapon.requirements, twoHanded);
  const effectiveStats = {
    ...stats,
    str: Math.min(99, stats.str * (twoHanded ? 1.5 : 1)),
  };
  const safeUpgrade = Math.max(0, Math.min(weapon.maxUpgrade, upgrade));
  const upgradeRatio = weapon.maxUpgrade > 0 ? safeUpgrade / weapon.maxUpgrade : 0;
  const scaling = weapon.scalingLetters ?? {};
  const statsByDamage: Array<[keyof SoulsDamage, SoulsDpsStat[]]> = [
    ["physical", ["str", "dex"]],
    ["magic", ["int", "fth"]],
    ["fire", ["int", "fth"]],
    ["lightning", ["fth"]],
    ["dark", ["int", "fth"]],
  ];

  const damage = emptyDamage();
  statsByDamage.forEach(([damageType, contributors]) => {
    const start = weapon.baseDamage[damageType];
    const end = weapon.maxDamage?.[damageType] ?? start * (1 + weapon.maxUpgrade * 0.1);
    const base = start + (end - start) * upgradeRatio;
    const bonus = contributors.reduce((sum, stat) => {
      const grade = scaling[stat];
      return sum + base * gradeWeight(grade) * ds1StatCurve(effectiveStats[stat]) * 0.55;
    }, 0);
    damage[damageType] = reqMet ? base + bonus : base * 0.6;
  });

  const totalAr = Object.values(damage).reduce((sum, value) => sum + value, 0);
  const rating = casualRating(weapon, stats, upgrade, weapon.maxUpgrade, twoHanded);

  return {
    damage,
    totalAr,
    requirementsMet: reqMet,
    rating,
    ratingLabel: SOULS_RATING_LABELS[rating - 1],
    scalingGrades: Object.fromEntries(
      Object.entries(scaling)
        .filter(([, grade]) => Boolean(grade))
        .map(([stat, grade]) => [stat, grade ?? "-"]),
    ),
    notes: [
      "Dark Souls 1 usa uma estimativa de AR no beta; o modo Casual prioriza compatibilidade de stats, scaling e upgrade.",
      ...(reqMet
        ? []
        : ["Você ainda não cumpre todos os requisitos da arma; o desempenho cai drasticamente."]),
    ],
  };
}

export function explainSoulsSynergy(
  weapon: SoulsDpsWeapon,
  stats: SoulsStats,
  twoHanded: boolean,
) {
  const notes: string[] = [];
  const effectiveStr = Math.min(99, stats.str * (twoHanded ? 1.5 : 1));
  const values: Array<[SoulsDpsStat, string]> = [
    ["str", "Força"],
    ["dex", "Destreza"],
    ["int", "Inteligência"],
    ["fth", "Fé"],
    ["lck", "Sorte"],
  ];

  values.forEach(([stat, label]) => {
    const grade = weapon.scalingLetters?.[stat];
    if (!grade || grade === "-") return;
    const statValue = stat === "str" ? effectiveStr : stats[stat];
    if (grade === "S" || grade === "A") {
      notes.push(
        statValue >= 40
          ? `${label} está aproveitando muito bem o scaling ${grade}.`
          : `${label} tem scaling ${grade}; subir esse atributo ainda traz bastante valor.`,
      );
    } else if (grade === "B" || grade === "C") {
      notes.push(
        statValue >= 40
          ? `${label} já está numa faixa forte para o scaling ${grade}.`
          : `${label} contribui de forma relevante e ainda pode melhorar.`,
      );
    }
  });

  return notes.slice(0, 3);
}

export const SOULS_DPS_SOURCES = {
  ds1: {
    label: "Dark Souls weapon dataset · BonsaiDen",
    url: DS1_SOURCE_URL,
  },
  ds3: {
    label: "DS3InventoryBuilder · Phil25",
    url: DS3_SOURCE_URL,
  },
};
