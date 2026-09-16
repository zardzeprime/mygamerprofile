import type { AppLocale } from "@/i18n/translations";

type LocalizedText = Record<AppLocale, string>;

export type DarkSoulsBossImageAsset = {
  url: string;
  sourceUrl: string;
  sourceLabel: LocalizedText;
  kind: "promotional" | "ptde-screenshot" | "wiki-image";
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

const wikiImage = (filename: string): DarkSoulsBossImageAsset => ({
  url: fandomFileUrl(filename),
  sourceUrl: fandomFilePage(filename),
  sourceLabel: wikiImageLabel,
  kind: "wiki-image",
});

export const DARK_SOULS_BOSS_IMAGES: Record<string, DarkSoulsBossImageAsset> = {
  "asylum-demon": wikiImage("Asylum Demon.png"),
  "bell-gargoyles": {
    url: fandomFileUrl("DS1 Promotional screenshot (Bell Gargoyle).jpg"),
    sourceUrl: fandomFilePage("DS1 Promotional screenshot (Bell Gargoyle).jpg"),
    sourceLabel: promotionalLabel,
    kind: "promotional",
  },
  "capra-demon": wikiImage("Capra Demon.jpg"),
  "ceaseless-discharge": {
    url: fandomFileUrl("DS1 promotional screenshot (Ceaseless Discharge).jpg"),
    sourceUrl: fandomFilePage("DS1 promotional screenshot (Ceaseless Discharge).jpg"),
    sourceLabel: promotionalLabel,
    kind: "promotional",
  },
  "centipede-demon": wikiImage("Centipede Demon.jpg"),
  "gaping-dragon": {
    url: fandomFileUrl("DS1 promotional screenshot (Gaping Dragon co-op).jpg"),
    sourceUrl: fandomFilePage("DS1 promotional screenshot (Gaping Dragon co-op).jpg"),
    sourceLabel: promotionalLabel,
    kind: "promotional",
  },
  "great-grey-wolf-sif": {
    url: fandomFileUrl("DS1 promotional screenshot (Great Grey Wolf Sif).jpg"),
    sourceUrl: fandomFilePage("DS1 promotional screenshot (Great Grey Wolf Sif).jpg"),
    sourceLabel: promotionalLabel,
    kind: "promotional",
  },
  "iron-golem": {
    url: fandomFileUrl("DS1 promotional screenshot (Iron Golem).jpg"),
    sourceUrl: fandomFilePage("DS1 promotional screenshot (Iron Golem).jpg"),
    sourceLabel: promotionalLabel,
    kind: "promotional",
  },
  "stray-demon": {
    url: fandomFileUrl("DS1 promotional screenshot (Stray Demon).jpg"),
    sourceUrl: fandomFilePage("DS1 promotional screenshot (Stray Demon).jpg"),
    sourceLabel: promotionalLabel,
    kind: "promotional",
  },
  "taurus-demon": {
    url: fandomFileUrl("DS1 promotional screenshot (Taurus Demon co-op).jpg"),
    sourceUrl: fandomFilePage("DS1 promotional screenshot (Taurus Demon co-op).jpg"),
    sourceLabel: promotionalLabel,
    kind: "promotional",
  },
  "bed-of-chaos": wikiImage("Bed of Chaos.jpg"),
  "crossbreed-priscilla": wikiImage("Crossbreed-priscilla.jpg"),
  "dark-sun-gwyndolin": wikiImage("Dark Sun Gwyndolin.jpg"),
  "gravelord-nito": wikiImage("Dark-souls-gravelord-nito.jpg"),
  "black-dragon-kalameet": {
    url: fandomFileUrl("DS1 PtDE screenshot (Black Dragon Kalameet 1).jpg"),
    sourceUrl: fandomFilePage("DS1 PtDE screenshot (Black Dragon Kalameet 1).jpg"),
    sourceLabel: ptdeLabel,
    kind: "ptde-screenshot",
  },
  "artorias-the-abysswalker": {
    url: fandomFileUrl("DSPC Artorias Final.jpg"),
    sourceUrl: fandomFilePage("DSPC Artorias Final.jpg"),
    sourceLabel: promotionalImageLabel,
    kind: "promotional",
  },
  "manus-father-of-the-abyss": {
    url: fandomFileUrl("DS1 PtDE screenshot (Manus).jpg"),
    sourceUrl: fandomFilePage("DS1 PtDE screenshot (Manus).jpg"),
    sourceLabel: ptdeLabel,
    kind: "ptde-screenshot",
  },
};

export function getDarkSoulsBossImage(slug?: string) {
  return slug ? DARK_SOULS_BOSS_IMAGES[slug] : undefined;
}
