export type SoulsCompendiumGame = "dark-souls-remastered" | "dark-souls-iii";
export type SoulsCompendiumCategory = "weapon" | "armor" | "ring" | "magic" | "item";

export type SoulsCompendiumEntry = {
  id: string;
  game: SoulsCompendiumGame;
  category: SoulsCompendiumCategory;
  index: number;
  name: string;
  description: string;
  iconUrl: string;
  sourceUrl: string;
};

const SOURCE_REPO = "https://raw.githubusercontent.com/LeMinerva/Dark-Souls-Documents/master";
const SOURCE_PAGE = "https://github.com/LeMinerva/Dark-Souls-Documents";

const gameNumber = (game: SoulsCompendiumGame) =>
  game === "dark-souls-remastered" ? 1 : 3;

function parseTextNodes(xmlText: string) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  return Array.from(doc.getElementsByTagName("text")).map((node) =>
    (node.textContent ?? "")
      .replace(/^##/, "")
      .replace(/#\d/g, "")
      .trim(),
  );
}

export async function loadSoulsCompendiumCategory(
  game: SoulsCompendiumGame,
  category: SoulsCompendiumCategory,
): Promise<SoulsCompendiumEntry[]> {
  const gameNo = gameNumber(game);
  const [namesResponse, descriptionsResponse] = await Promise.all([
    fetch(`${SOURCE_REPO}/text/eng${gameNo}/${category}_name.xml`),
    fetch(`${SOURCE_REPO}/text/eng${gameNo}/${category}_desc.xml`),
  ]);

  if (!namesResponse.ok || !descriptionsResponse.ok) {
    throw new Error(`SOULS_COMPENDIUM_${category.toUpperCase()}_UNAVAILABLE`);
  }

  const [namesXml, descriptionsXml] = await Promise.all([
    namesResponse.text(),
    descriptionsResponse.text(),
  ]);
  const names = parseTextNodes(namesXml);
  const descriptions = parseTextNodes(descriptionsXml);

  return names
    .map((name, index) => ({
      id: `${game}:${category}:${index}`,
      game,
      category,
      index,
      name,
      description: descriptions[index] ?? "",
      iconUrl: `${SOURCE_REPO}/icons/${category}${gameNo}/${index}.webp`,
      sourceUrl: SOURCE_PAGE,
    }))
    .filter(
      (entry) =>
        entry.name &&
        !/^(unused|dummy|test)/i.test(entry.name) &&
        !entry.name.includes("UNUSED"),
    );
}

export async function loadSoulsCompendium(game: SoulsCompendiumGame) {
  const categories: SoulsCompendiumCategory[] = [
    "weapon",
    "armor",
    "ring",
    "magic",
    "item",
  ];
  const groups = await Promise.all(
    categories.map((category) => loadSoulsCompendiumCategory(game, category)),
  );
  return groups.flat();
}

export const SOULS_COMPENDIUM_SOURCE = {
  label: "Dark Souls Documents · LeMinerva",
  url: SOURCE_PAGE,
  rights:
    "Ícones e textos de referência pertencem aos respectivos detentores de direitos da franquia Dark Souls, incluindo FromSoftware/Bandai Namco. O MGP os exibe no beta como referência com procedência registrada.",
};
