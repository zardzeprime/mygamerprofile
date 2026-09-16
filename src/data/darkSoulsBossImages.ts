import type { AppLocale } from "@/i18n/translations";

type LocalizedText = Record<AppLocale, string>;

export type DarkSoulsBossImageAsset = {
  url: string;
  sourceUrl: string;
  sourceLabel: LocalizedText;
  kind: "promotional" | "ptde-screenshot" | "wiki-image";
  cardObjectPosition?: string;
  detailObjectPosition?: string;
};

const fandomFileUrl = (filename: string) =>
  `https://darksouls.fandom.com/wiki/Special:Redirect/file/${encodeURIComponent(filename)}`;

const fandomFilePage = (filename: string) =>
  `https://darksouls.fandom.com/wiki/File:${encodeURIComponent(filename)}`;

const promotionalLabel: LocalizedText = {
  "pt-BR": "Screenshot promocional · Dark Souls Wiki (Fandom)",
  en: "Promotional screenshot · Dark Souls Wiki (Fandom)",
  es: "Captura promocional · Dark Souls Wiki (Fandom)",
};

const ptdeLabel: LocalizedText = {
  "pt-BR": "Screenshot de Prepare to Die Edition · Dark Souls Wiki (Fandom)",
  en: "Prepare to Die Edition screenshot · Dark Souls Wiki (Fandom)",
  es: "Captura de Prepare to Die Edition · Dark Souls Wiki (Fandom)",
};

const promotionalImageLabel: LocalizedText = {
  "pt-BR": "Imagem promocional · Dark Souls Wiki (Fandom)",
  en: "Promotional image · Dark Souls Wiki (Fandom)",
  es: "Imagen promocional · Dark Souls Wiki (Fandom)",
};

const wikiImageLabel: LocalizedText = {
  "pt-BR": "Imagem de referência · Dark Souls Wiki (Fandom, CC BY-SA)",
  en: "Reference image · Dark Souls Wiki (Fandom, CC BY-SA)",
  es: "Imagen de referencia · Dark Souls Wiki (Fandom, CC BY-SA)",
};

const wikiImage = (
  filename: string,
  cardObjectPosition = "50% 30%",
  detailObjectPosition = "50% 32%",
): DarkSoulsBossImageAsset => ({
  url: fandomFileUrl(filename),
  sourceUrl: fandomFilePage(filename),
  sourceLabel: wikiImageLabel,
  kind: "wiki-image",
  cardObjectPosition,
  detailObjectPosition,
});

const screenshot = (
  filename: string,
  sourceLabel: LocalizedText,
  kind: "promotional" | "ptde-screenshot",
  cardObjectPosition = "50% 38%",
  detailObjectPosition = "50% 42%",
): DarkSoulsBossImageAsset => ({
  url: fandomFileUrl(filename),
  sourceUrl: fandomFilePage(filename),
  sourceLabel,
  kind,
  cardObjectPosition,
  detailObjectPosition,
});

export const DARK_SOULS_BOSS_IMAGES: Record<string, DarkSoulsBossImageAsset> = {
  "asylum-demon": wikiImage("Asylum Demon.png", "50% 29%", "50% 34%"),
  "bell-gargoyles": screenshot(
    "DS1 Promotional screenshot (Bell Gargoyle).jpg",
    promotionalLabel,
    "promotional",
    "50% 35%",
    "50% 40%",
  ),
  "capra-demon": wikiImage("Capra Demon.jpg", "50% 24%", "50% 30%"),
  "ceaseless-discharge": screenshot(
    "DS1 promotional screenshot (Ceaseless Discharge).jpg",
    promotionalLabel,
    "promotional",
    "50% 35%",
    "50% 42%",
  ),
  "centipede-demon": wikiImage("Centipede Demon.jpg", "50% 34%", "50% 38%"),
  "gaping-dragon": screenshot(
    "DS1 promotional screenshot (Gaping Dragon co-op).jpg",
    promotionalLabel,
    "promotional",
    "50% 42%",
    "50% 44%",
  ),
  "great-grey-wolf-sif": screenshot(
    "DS1 promotional screenshot (Great Grey Wolf Sif).jpg",
    promotionalLabel,
    "promotional",
    "50% 33%",
    "50% 38%",
  ),
  "iron-golem": screenshot(
    "DS1 promotional screenshot (Iron Golem).jpg",
    promotionalLabel,
    "promotional",
    "50% 27%",
    "50% 34%",
  ),
  "stray-demon": screenshot(
    "DS1 promotional screenshot (Stray Demon).jpg",
    promotionalLabel,
    "promotional",
    "50% 35%",
    "50% 40%",
  ),
  "taurus-demon": screenshot(
    "DS1 promotional screenshot (Taurus Demon co-op).jpg",
    promotionalLabel,
    "promotional",
    "50% 28%",
    "50% 35%",
  ),
  "bed-of-chaos": wikiImage("Bed of Chaos.jpg", "50% 35%", "50% 38%"),
  "crossbreed-priscilla": wikiImage("Crossbreed-priscilla.jpg", "50% 20%", "50% 28%"),
  "dark-sun-gwyndolin": wikiImage("Dark Sun Gwyndolin.jpg", "50% 19%", "50% 27%"),
  "gravelord-nito": wikiImage("Dark-souls-gravelord-nito.jpg", "50% 24%", "50% 31%"),
  "black-dragon-kalameet": screenshot(
    "DS1 PtDE screenshot (Black Dragon Kalameet 1).jpg",
    ptdeLabel,
    "ptde-screenshot",
    "50% 35%",
    "50% 40%",
  ),
  "artorias-the-abysswalker": screenshot(
    "DSPC Artorias Final.jpg",
    promotionalImageLabel,
    "promotional",
    "50% 22%",
    "50% 30%",
  ),
  "manus-father-of-the-abyss": screenshot(
    "DS1 PtDE screenshot (Manus).jpg",
    ptdeLabel,
    "ptde-screenshot",
    "50% 30%",
    "50% 36%",
  ),
};

export function getDarkSoulsBossImage(slug?: string) {
  return slug ? DARK_SOULS_BOSS_IMAGES[slug] : undefined;
}
