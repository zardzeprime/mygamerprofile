import type { Locale } from "@/i18n/translations";

type LocalizedText = Record<Locale, string>;

export type DarkSoulsBossImageAsset = {
  url: string;
  sourceUrl: string;
  sourceLabel: LocalizedText;
  kind: "promotional" | "ptde-screenshot";
};

const fandomFileUrl = (filename: string) =>
  `https://darksouls.fandom.com/wiki/Special:Redirect/file/${encodeURIComponent(filename)}`;

const fandomFilePage = (filename: string) =>
  `https://darksouls.fandom.com/wiki/File:${encodeURIComponent(filename)}`;

export const DARK_SOULS_BOSS_IMAGES: Record<string, DarkSoulsBossImageAsset> = {
  "bell-gargoyles": {
    url: fandomFileUrl("DS1 Promotional screenshot (Bell Gargoyle).jpg"),
    sourceUrl: fandomFilePage("DS1 Promotional screenshot (Bell Gargoyle).jpg"),
    sourceLabel: {
      "pt-BR": "Screenshot promocional · Dark Souls Wiki (Fandom)",
      en: "Promotional screenshot · Dark Souls Wiki (Fandom)",
    },
    kind: "promotional",
  },
  "ceaseless-discharge": {
    url: fandomFileUrl("DS1 promotional screenshot (Ceaseless Discharge).jpg"),
    sourceUrl: fandomFilePage("DS1 promotional screenshot (Ceaseless Discharge).jpg"),
    sourceLabel: {
      "pt-BR": "Screenshot promocional · Dark Souls Wiki (Fandom)",
      en: "Promotional screenshot · Dark Souls Wiki (Fandom)",
    },
    kind: "promotional",
  },
  "gaping-dragon": {
    url: fandomFileUrl("DS1 promotional screenshot (Gaping Dragon co-op).jpg"),
    sourceUrl: fandomFilePage("DS1 promotional screenshot (Gaping Dragon co-op).jpg"),
    sourceLabel: {
      "pt-BR": "Screenshot promocional · Dark Souls Wiki (Fandom)",
      en: "Promotional screenshot · Dark Souls Wiki (Fandom)",
    },
    kind: "promotional",
  },
  "great-grey-wolf-sif": {
    url: fandomFileUrl("DS1 promotional screenshot (Great Grey Wolf Sif).jpg"),
    sourceUrl: fandomFilePage("DS1 promotional screenshot (Great Grey Wolf Sif).jpg"),
    sourceLabel: {
      "pt-BR": "Screenshot promocional · Dark Souls Wiki (Fandom)",
      en: "Promotional screenshot · Dark Souls Wiki (Fandom)",
    },
    kind: "promotional",
  },
  "iron-golem": {
    url: fandomFileUrl("DS1 promotional screenshot (Iron Golem).jpg"),
    sourceUrl: fandomFilePage("DS1 promotional screenshot (Iron Golem).jpg"),
    sourceLabel: {
      "pt-BR": "Screenshot promocional · Dark Souls Wiki (Fandom)",
      en: "Promotional screenshot · Dark Souls Wiki (Fandom)",
    },
    kind: "promotional",
  },
  "stray-demon": {
    url: fandomFileUrl("DS1 promotional screenshot (Stray Demon).jpg"),
    sourceUrl: fandomFilePage("DS1 promotional screenshot (Stray Demon).jpg"),
    sourceLabel: {
      "pt-BR": "Screenshot promocional · Dark Souls Wiki (Fandom)",
      en: "Promotional screenshot · Dark Souls Wiki (Fandom)",
    },
    kind: "promotional",
  },
  "taurus-demon": {
    url: fandomFileUrl("DS1 promotional screenshot (Taurus Demon co-op).jpg"),
    sourceUrl: fandomFilePage("DS1 promotional screenshot (Taurus Demon co-op).jpg"),
    sourceLabel: {
      "pt-BR": "Screenshot promocional · Dark Souls Wiki (Fandom)",
      en: "Promotional screenshot · Dark Souls Wiki (Fandom)",
    },
    kind: "promotional",
  },
  "black-dragon-kalameet": {
    url: fandomFileUrl("DS1 PtDE screenshot (Black Dragon Kalameet 1).jpg"),
    sourceUrl: fandomFilePage("DS1 PtDE screenshot (Black Dragon Kalameet 1).jpg"),
    sourceLabel: {
      "pt-BR": "Screenshot de Prepare to Die Edition · Dark Souls Wiki (Fandom)",
      en: "Prepare to Die Edition screenshot · Dark Souls Wiki (Fandom)",
    },
    kind: "ptde-screenshot",
  },
  "artorias-the-abysswalker": {
    url: fandomFileUrl("DSPC Artorias Final.jpg"),
    sourceUrl: fandomFilePage("DSPC Artorias Final.jpg"),
    sourceLabel: {
      "pt-BR": "Imagem promocional · Dark Souls Wiki (Fandom)",
      en: "Promotional image · Dark Souls Wiki (Fandom)",
    },
    kind: "promotional",
  },
  "manus-father-of-the-abyss": {
    url: fandomFileUrl("DS1 PtDE screenshot (Manus).jpg"),
    sourceUrl: fandomFilePage("DS1 PtDE screenshot (Manus).jpg"),
    sourceLabel: {
      "pt-BR": "Screenshot de Prepare to Die Edition · Dark Souls Wiki (Fandom)",
      en: "Prepare to Die Edition screenshot · Dark Souls Wiki (Fandom)",
    },
    kind: "ptde-screenshot",
  },
};

export function getDarkSoulsBossImage(slug?: string) {
  return slug ? DARK_SOULS_BOSS_IMAGES[slug] : undefined;
}
