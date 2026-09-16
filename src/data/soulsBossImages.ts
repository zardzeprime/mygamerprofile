import type { Locale } from "@/i18n";
import type { SoulsGameSlug } from "@/data/soulsBossResearch";

type LocalizedText = Record<Locale, string>;

export type SoulsBossImageAsset = {
  url: string;
  sourceUrl: string;
  sourceLabel: LocalizedText;
  objectPosition?: string;
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

const ds3 = (filename: string, objectPosition?: string): SoulsBossImageAsset => ({
  url: fandomFileUrl(filename),
  sourceUrl: fandomFilePage(filename),
  sourceLabel: fandomLabel,
  objectPosition,
});

export const DARK_SOULS_III_BOSS_IMAGES: Record<string, SoulsBossImageAsset> = {
  "iudex-gundyr": ds3("Gundyr concept.png", "50% 35%"),
  "vordt-of-the-boreal-valley": ds3("Vordt concept.png"),
  "curse-rotted-greatwood": ds3("Curse rotted greatwood concept.png"),
  "crystal-sage": ds3("Crystal sage concept.png"),
  "deacons-of-the-deep": ds3("Deacons concept.png"),
  "abyss-watchers": ds3("Abyss Watcher (DS3 Design Works).png"),
  "high-lord-wolnir": ds3("Wolnir concept.png"),
  "old-demon-king": ds3("Old demon king concept.png"),
  "pontiff-sulyvahn": ds3("Pontiff sulyvahn concept.png"),
  "aldrich-devourer-of-gods": ds3("Aldrich concept art.png"),
  "yhorm-the-giant": ds3("Yhorm concept.png"),
  "oceiros-the-consumed-king": ds3("Oceiros concept.png"),
  "champion-gundyr": ds3("Gundyr concept.png", "50% 35%"),
  "dragonslayer-armour": ds3("Dragonslayer armour concept.png"),
  "twin-princes": ds3("Twin princes concept.png"),
  "lorian-elder-prince-and-lothric-younger-prince": ds3("Twin princes concept.png"),
  "ancient-wyvern": ds3("Ancient wyvern concept.png"),
  "the-nameless-king": ds3("Nameless king concept.png"),
  "nameless-king": ds3("Nameless king concept.png"),
  "sister-friede": ds3("Friede concept.png"),
  "demon-prince": ds3("Demon Prince artwork.png"),
  "halflight-spear-of-the-church": ds3("Halflight concept.png"),
  "darkeater-midir": ds3("MidirConcept.png"),
  "slave-knight-gael": ds3("Gael phase1 concept.png"),
};

export function getSoulsBossImage(gameSlug: SoulsGameSlug, bossSlug?: string) {
  if (!bossSlug || gameSlug !== "dark-souls-iii") return undefined;
  return DARK_SOULS_III_BOSS_IMAGES[bossSlug];
}
