import type { SoulsCompendiumGame } from "@/lib/souls-compendium";

export type SoulsArmorSlot = "head" | "chest" | "arms" | "legs" | "unknown";

export type SoulsArmorTechnical = {
  game: SoulsCompendiumGame;
  name: string;
  slot: SoulsArmorSlot;
  weight: number;
  poise: number;
  defense: {
    physical: number;
    strike?: number;
    slash?: number;
    thrust?: number;
    magic: number;
    fire: number;
    lightning: number;
    dark?: number;
  };
  resistance: {
    bleed: number;
    poison: number;
    frost?: number;
    curse: number;
  };
  maxUpgrade?: {
    level: number;
    defense: {
      physical: number;
      magic: number;
      fire: number;
      lightning: number;
    };
    resistance: {
      bleed: number;
      poison: number;
      curse: number;
    };
  } | null;
  source: {
    label: string;
    url: string;
    note: string;
  };
};

const DS1_ARMOR_BASE_URL =
  "https://raw.githubusercontent.com/cosmcbun/Dark-Souls-Armor-Optimizer/master/stats%20backup/darksouls-armor-stats-0.csv";
const DS1_ARMOR_MAX_URL =
  "https://raw.githubusercontent.com/cosmcbun/Dark-Souls-Armor-Optimizer/master/stats%20backup/darksouls-armor-stats-10.csv";
const DS1_SOURCE_URL = "https://github.com/cosmcbun/Dark-Souls-Armor-Optimizer";

const DS3_ARMOR_URL = "https://raw.githubusercontent.com/pisto/ds3armor/master/main.cpp";
const DS3_SOURCE_URL = "https://github.com/pisto/ds3armor";

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length || row.length) {
    row.push(cell);
    if (row.some((value) => value.trim())) rows.push(row);
  }

  return rows;
}

const numberValue = (value?: string) => {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

export function normalizeSoulsEquipmentName(value: string) {
  return value
    .replace(/\+\d+\s*$/i, "")
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("en-US");
}

function ds1Slot(position: number): SoulsArmorSlot {
  if (position === 1) return "head";
  if (position === 2) return "chest";
  if (position === 3) return "arms";
  if (position === 4) return "legs";
  return "unknown";
}

function parseDs1ArmorRow(row: string[]) {
  if (row.length < 12) return null;
  const name = String(row[1] ?? "").trim();
  if (!name || /^naked\b/i.test(name)) return null;

  return {
    name,
    slot: ds1Slot(numberValue(row[2])),
    poise: numberValue(row[3]),
    weight: numberValue(row[4]),
    defense: {
      physical: numberValue(row[5]),
      magic: numberValue(row[6]),
      fire: numberValue(row[7]),
      lightning: numberValue(row[8]),
    },
    resistance: {
      bleed: numberValue(row[9]),
      poison: numberValue(row[10]),
      curse: numberValue(row[11]),
    },
  };
}

async function loadDs1Armor() {
  const [baseResponse, maxResponse] = await Promise.all([
    fetch(DS1_ARMOR_BASE_URL),
    fetch(DS1_ARMOR_MAX_URL),
  ]);

  if (!baseResponse.ok) {
    throw new Error(`DS1_ARMOR_${baseResponse.status}`);
  }

  const baseText = await baseResponse.text();
  const maxText = maxResponse.ok ? await maxResponse.text() : "";
  const maxRows = maxText ? parseCsv(maxText).slice(1) : [];
  const maxByName = new Map(
    maxRows
      .map((row) => {
        const parsed = parseDs1ArmorRow(row);
        if (!parsed) return null;
        const levelMatch = parsed.name.match(/\+(\d+)\s*$/);
        return [
          normalizeSoulsEquipmentName(parsed.name),
          {
            level: levelMatch ? Number(levelMatch[1]) : 0,
            ...parsed,
          },
        ] as const;
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
  );

  return parseCsv(baseText)
    .slice(1)
    .map(parseDs1ArmorRow)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .map((entry): SoulsArmorTechnical => {
      const max = maxByName.get(normalizeSoulsEquipmentName(entry.name));
      return {
        game: "dark-souls-remastered",
        ...entry,
        maxUpgrade:
          max && max.level > 0
            ? {
                level: max.level,
                defense: { ...max.defense },
                resistance: { ...max.resistance },
              }
            : null,
        source: {
          label: "Dark Souls Armor Optimizer · community dataset",
          url: DS1_SOURCE_URL,
          note: "Base and reinforced armor values are read from the optimizer dataset; original game names and equipment remain property of their respective rights holders.",
        },
      };
    });
}

function ds3Slot(value: string): SoulsArmorSlot {
  const normalized = value.trim();
  if (normalized === "HEAD") return "head";
  if (normalized === "BODY") return "chest";
  if (normalized === "ARMS") return "arms";
  if (normalized === "LEGS") return "legs";
  return "unknown";
}

async function loadDs3Armor() {
  const response = await fetch(DS3_ARMOR_URL);
  if (!response.ok) throw new Error(`DS3_ARMOR_${response.status}`);
  const text = await response.text();

  const blockStart = text.indexOf("const armor ds3armors[]");
  const source = blockStart >= 0 ? text.slice(blockStart) : text;
  const entries: SoulsArmorTechnical[] = [];

  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^\s*\{\s*\d+\s*,\s*"([^"]+)"\s*,\s*([^}]+)\}\s*,?/);
    if (!match) continue;

    const rawName = match[1];
    const rawParts = match[2];
    if (!rawName || !rawParts) continue;
    const name = rawName.trim();
    const parts = rawParts.split(",").map((part) => part.trim());
    if (parts.length < 14) continue;

    const [
      weightTenths,
      physical,
      strike,
      slash,
      thrust,
      magic,
      fire,
      lightning,
      dark,
      bleed,
      poison,
      frost,
      curse,
      poise,
      slotValue,
    ] = parts;

    entries.push({
      game: "dark-souls-iii",
      name,
      slot: ds3Slot(slotValue ?? ""),
      weight: numberValue(weightTenths) / 10,
      poise: numberValue(poise),
      defense: {
        physical: numberValue(physical),
        strike: numberValue(strike),
        slash: numberValue(slash),
        thrust: numberValue(thrust),
        magic: numberValue(magic),
        fire: numberValue(fire),
        lightning: numberValue(lightning),
        dark: numberValue(dark),
      },
      resistance: {
        bleed: numberValue(bleed),
        poison: numberValue(poison),
        frost: numberValue(frost),
        curse: numberValue(curse),
      },
      maxUpgrade: null,
      source: {
        label: "ds3armor · technical community dataset",
        url: DS3_SOURCE_URL,
        note: "Armor absorption, resistance, weight and poise are read from the ds3armor dataset (credited there to community calculator data). Original game equipment remains property of its respective rights holders.",
      },
    });
  }

  return entries;
}

let ds1ArmorPromise: Promise<SoulsArmorTechnical[]> | null = null;
let ds3ArmorPromise: Promise<SoulsArmorTechnical[]> | null = null;

export function loadSoulsArmorTechnical(game: SoulsCompendiumGame) {
  if (game === "dark-souls-remastered") {
    ds1ArmorPromise ??= loadDs1Armor();
    return ds1ArmorPromise;
  }

  ds3ArmorPromise ??= loadDs3Armor();
  return ds3ArmorPromise;
}
