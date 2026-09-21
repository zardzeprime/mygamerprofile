import type { SoulsCompendiumGame } from "@/lib/souls-compendium";
import { normalizeSoulsEquipmentName } from "@/lib/souls-armor";

export type SoulsSpellSchool = "sorcery" | "pyromancy" | "miracle" | "unknown";

export type SoulsSpellMetadata = {
  name: string;
  school: SoulsSpellSchool;
  sourceId: string | number;
  source: {
    label: string;
    url: string;
  };
};

const ROOT =
  "https://raw.githubusercontent.com/darthdemono/sl2-analyzer/main";
const SOURCE = "https://github.com/darthdemono/sl2-analyzer";

function stripDs1SchoolPrefix(name: string) {
  return name.replace(/^(Sorcery|Pyromancy|Miracle):\s*/i, "").trim();
}

function ds1School(name: string): SoulsSpellSchool {
  if (/^Sorcery:/i.test(name)) return "sorcery";
  if (/^Pyromancy:/i.test(name)) return "pyromancy";
  if (/^Miracle:/i.test(name)) return "miracle";
  return "unknown";
}

function ds3School(id: number): SoulsSpellSchool {
  if (id >= 1077000000) return "miracle";
  if (id >= 1076000000) return "pyromancy";
  if (id >= 1074000000) return "sorcery";
  return "unknown";
}

async function load(game: SoulsCompendiumGame): Promise<SoulsSpellMetadata[]> {
  const path =
    game === "dark-souls-remastered"
      ? "db_ds1/Spells.json"
      : "db_ds3/spells.json";
  const response = await fetch(`${ROOT}/${path}`);
  if (!response.ok) throw new Error(`SOULS_SPELL_METADATA_${response.status}`);

  const payload = (await response.json()) as Record<string, string | number>;
  return Object.entries(payload).map(([rawName, id]) => ({
    name: game === "dark-souls-remastered" ? stripDs1SchoolPrefix(rawName) : rawName,
    school:
      game === "dark-souls-remastered"
        ? ds1School(rawName)
        : ds3School(Number(id)),
    sourceId: id,
    source: {
      label: "sl2-analyzer · spell registry",
      url: `${SOURCE}/blob/main/${path}`,
    },
  }));
}

let ds1Promise: Promise<SoulsSpellMetadata[]> | null = null;
let ds3Promise: Promise<SoulsSpellMetadata[]> | null = null;

export function loadSoulsSpellMetadata(game: SoulsCompendiumGame) {
  if (game === "dark-souls-remastered") {
    ds1Promise ??= load(game);
    return ds1Promise;
  }
  ds3Promise ??= load(game);
  return ds3Promise;
}

export function findSoulsSpellMetadata(
  entries: SoulsSpellMetadata[],
  name: string,
) {
  const target = normalizeSoulsEquipmentName(name);
  return (
    entries.find(
      (entry) => normalizeSoulsEquipmentName(entry.name) === target,
    ) ?? null
  );
}
