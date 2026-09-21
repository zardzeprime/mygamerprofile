import type { SoulsCompendiumGame } from "@/lib/souls-compendium";
import { normalizeSoulsEquipmentName } from "@/lib/souls-armor";

export type SoulsItemMetadata = {
  name: string;
  category: string;
  subcategory: string;
  referenceDescription: string;
  skill?: string;
  source: {
    label: string;
    url: string;
  };
};

const ROOT =
  "https://raw.githubusercontent.com/ephemer1s/Dark-Souls-Items-Dataset/main";
const SOURCE = "https://github.com/ephemer1s/Dark-Souls-Items-Dataset";

function parseTsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === "\t" && !quoted) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
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

function extractSkill(description: string) {
  const cleaned = description.replace(/\s+/g, " ").trim();
  const match = cleaned.match(/\bSkill:\s*([^.!?]+?)(?=(?:\s{2,}|Repel|Raise|Assume|Without|$))/i);
  if (match?.[1]?.trim()) return match[1].trim();

  const simpler = cleaned.match(/\bSkill:\s*([A-Za-z][A-Za-z '\-]+)/i);
  return simpler?.[1]?.trim();
}

async function fetchMetadataFile(path: string, label: string) {
  const response = await fetch(`${ROOT}/${path}`);
  if (!response.ok) return [] as SoulsItemMetadata[];

  const rows = parseTsv(await response.text());
  return rows.slice(1).flatMap((row) => {
    const name = row[0]?.trim();
    if (!name) return [];

    const description = row.slice(4).join("\t").trim();
    const skill = extractSkill(description);
    return [{
      name,
      category: row[2]?.trim() || label,
      subcategory: row[3]?.trim() || label,
      referenceDescription: description,
      ...(skill ? { skill } : {}),
      source: {
        label: `Dark Souls Items Dataset · ${label}`,
        url: SOURCE,
      },
    } satisfies SoulsItemMetadata];
  });
}

let ds1Promise: Promise<SoulsItemMetadata[]> | null = null;
let ds3Promise: Promise<SoulsItemMetadata[]> | null = null;

export function loadSoulsItemMetadata(game: SoulsCompendiumGame) {
  if (game === "dark-souls-remastered") {
    const request = ds1Promise ?? Promise.all([
      fetchMetadataFile("data/shield/darksouls1_shield.tsv", "Shields"),
      fetchMetadataFile("data/ring/darksouls1_ring.tsv", "Rings"),
    ]).then((groups) => groups.flat());
    ds1Promise = request;
    return request;
  }

  const request = ds3Promise ?? Promise.all([
    fetchMetadataFile("data/shield/darksouls3_shield.tsv", "Shields"),
    fetchMetadataFile("data/ring/darksouls3_ring.tsv", "Rings"),
    fetchMetadataFile("data/item/darksouls3_item.tsv", "Items"),
  ]).then((groups) => groups.flat());
  ds3Promise = request;
  return request;
}

export function findSoulsItemMetadata(
  metadata: SoulsItemMetadata[],
  name: string,
) {
  const target = normalizeSoulsEquipmentName(name);
  return (
    metadata.find(
      (entry) => normalizeSoulsEquipmentName(entry.name) === target,
    ) ?? null
  );
}
