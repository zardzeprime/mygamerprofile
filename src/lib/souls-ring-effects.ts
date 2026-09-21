import type { SoulsCompendiumGame } from "@/lib/souls-compendium";
import { normalizeSoulsEquipmentName } from "@/lib/souls-armor";

export type SoulsRingEffect = {
  name: string;
  effects: string[];
  source: {
    label: string;
    url: string;
  };
};

const REPO_ROOT = "https://raw.githubusercontent.com/darthdemono/sl2-analyzer/main";
const SOURCE_URL = "https://github.com/darthdemono/sl2-analyzer";

function sourcePath(game: SoulsCompendiumGame) {
  return game === "dark-souls-remastered"
    ? "db_ds1/ring_effects.json"
    : "db_ds3/ring_effects.json";
}

function candidateNames(name: string) {
  const normalized = normalizeSoulsEquipmentName(name);
  const withoutVariant = normalized
    .replace(/\s*\+\s*\d+\s*$/i, "")
    .replace(/\+\d+\s*$/i, "")
    .trim();
  return new Set([normalized, withoutVariant]);
}

async function loadRingEffects(game: SoulsCompendiumGame): Promise<SoulsRingEffect[]> {
  const path = sourcePath(game);
  const response = await fetch(`${REPO_ROOT}/${path}`);
  if (!response.ok) throw new Error(`SOULS_RING_EFFECTS_${response.status}`);

  const payload = (await response.json()) as Record<
    string,
    { effect?: string[] | string; mods?: Record<string, unknown> }
  >;

  return Object.entries(payload).map(([name, value]) => ({
    name,
    effects: Array.isArray(value.effect)
      ? value.effect.filter(Boolean)
      : value.effect
        ? [value.effect]
        : [],
    source: {
      label: "sl2-analyzer · ring effects",
      url: `${SOURCE_URL}/blob/main/${path}`,
    },
  }));
}

let ds1Promise: Promise<SoulsRingEffect[]> | null = null;
let ds3Promise: Promise<SoulsRingEffect[]> | null = null;

export function loadSoulsRingEffects(game: SoulsCompendiumGame) {
  if (game === "dark-souls-remastered") {
    ds1Promise ??= loadRingEffects(game);
    return ds1Promise;
  }
  ds3Promise ??= loadRingEffects(game);
  return ds3Promise;
}

export function findSoulsRingEffect(effects: SoulsRingEffect[], name: string) {
  const candidates = candidateNames(name);
  return (
    effects.find((entry) => candidates.has(normalizeSoulsEquipmentName(entry.name))) ??
    null
  );
}
