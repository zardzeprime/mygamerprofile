import type { Locale } from "@/i18n";
import type { SoulsGameSlug } from "@/data/soulsBossResearch";

type LocalizedText = Record<Locale, string>;

export type SoulsBossImageAsset = {
  url: string;
  sourceUrl: string;
  sourceLabel: LocalizedText;
  cardObjectPosition?: string;
  detailObjectPosition?: string;
};

const fandomFileUrl = (filename: string) =>
  `https://darksouls.fandom.com/wiki/Special:Redirect/file/${encodeURIComponent(filename)}`;

const fandomFilePage = (filename: string) =>
  `https://darksouls.fandom.com/wiki/File:${encodeURIComponent(filename)}`;

const fandomLabel: LocalizedText = {
  "pt-BR": "Arte de referência · Dark Souls Wiki (Fandom, CC BY-SA)",
  en: "Reference artwork · Dark Souls Wiki (Fandom, CC BY-SA)",
  es: "Arte de referencia · Dark Souls Wiki (Fandom, CC BY-SA)",
};

const ds3 = (
  filename: string,
  cardObjectPosition = "50% 28%",
  detailObjectPosition = "50% 28%",
): SoulsBossImageAsset => ({
  url: fandomFileUrl(filename),
  sourceUrl: fandomFilePage(filename),
  sourceLabel: fandomLabel,
  cardObjectPosition,
  detailObjectPosition,
});

export const DARK_SOULS_III_BOSS_IMAGES: Record<string, SoulsBossImageAsset> = {
  "iudex-gundyr": ds3("Gundyr concept.png", "50% 25%", "50% 30%"),
  "vordt-of-the-boreal-valley": ds3("Vordt concept.png", "50% 42%", "50% 38%"),
  "curse-rotted-greatwood": ds3("Curse rotted greatwood concept.png", "50% 34%", "50% 35%"),
  "crystal-sage": ds3("Crystal sage concept.png", "50% 23%", "50% 28%"),
  "deacons-of-the-deep": ds3("Deacons concept.png", "50% 31%", "50% 32%"),
  "abyss-watchers": ds3("Abyss Watcher (DS3 Design Works).png", "50% 22%", "50% 28%"),
  "high-lord-wolnir": ds3("Wolnir concept.png", "50% 34%", "50% 36%"),
  "old-demon-king": ds3("Old demon king concept.png", "50% 30%", "50% 34%"),
  "pontiff-sulyvahn": ds3("Pontiff sulyvahn concept.png", "50% 20%", "50% 27%"),
  "aldrich-devourer-of-gods": ds3("Aldrich concept art.png", "50% 31%", "50% 32%"),
  "yhorm-the-giant": ds3("Yhorm concept.png", "50% 20%", "50% 28%"),
  "oceiros-the-consumed-king": ds3("Oceiros concept.png", "50% 31%", "50% 34%"),
  "champion-gundyr": ds3("Gundyr concept.png", "50% 25%", "50% 30%"),
  "dragonslayer-armour": ds3("Dragonslayer armour concept.png", "50% 22%", "50% 29%"),
  "twin-princes": ds3("Twin princes concept.png", "50% 21%", "50% 30%"),
  "lorian-elder-prince-and-lothric-younger-prince": ds3("Twin princes concept.png", "50% 21%", "50% 30%"),
  "ancient-wyvern": ds3("Ancient wyvern concept.png", "50% 37%", "50% 38%"),
  "the-nameless-king": ds3("Nameless king concept.png", "50% 20%", "50% 28%"),
  "nameless-king": ds3("Nameless king concept.png", "50% 20%", "50% 28%"),
  "sister-friede": ds3("Friede concept.png", "50% 18%", "50% 27%"),
  "demon-prince": ds3("Demon Prince artwork.png", "50% 33%", "50% 35%"),
  "halflight-spear-of-the-church": ds3("Halflight concept.png", "50% 20%", "50% 28%"),
  "darkeater-midir": ds3("MidirConcept.png", "50% 36%", "50% 36%"),
  "slave-knight-gael": ds3("Gael phase1 concept.png", "50% 22%", "50% 29%"),
};

export function getSoulsBossImage(gameSlug: SoulsGameSlug, bossSlug?: string) {
  if (!bossSlug || gameSlug !== "dark-souls-iii") return undefined;
  return DARK_SOULS_III_BOSS_IMAGES[bossSlug];
}
