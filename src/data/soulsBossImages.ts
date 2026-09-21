import type { Locale } from "@/i18n";
import type { SoulsGameSlug } from "@/data/soulsBossResearch";

type LocalizedText = Record<Locale, string>;
type ImageFit = "cover" | "contain";

export type SoulsBossImageAsset = {
  url: string;
  sourceUrl: string;
  sourceLabel: LocalizedText;
  cardObjectPosition?: string;
  detailObjectPosition?: string;
  cardScale?: number;
  detailScale?: number;
  cardFit?: ImageFit;
  detailFit?: ImageFit;
};

const fandomFileUrl = (filename: string) =>
  `https://darksouls.fandom.com/wiki/Special:Redirect/file/${encodeURIComponent(filename)}`;

const fandomFilePage = (filename: string) =>
  `https://darksouls.fandom.com/wiki/File:${encodeURIComponent(filename)}`;

const fandomLabel: LocalizedText = {
  "pt-BR": "Concept art · Dark Souls Wiki (Fandom)",
  en: "Concept art · Dark Souls Wiki (Fandom)",
  es: "Arte conceptual · Dark Souls Wiki (Fandom)",
};

const creativeUncutLabel: LocalizedText = {
  "pt-BR": "Concept art oficial · catalogado no Creative Uncut",
  en: "Official concept art · catalogued by Creative Uncut",
  es: "Arte conceptual oficial · catalogado en Creative Uncut",
};

const ds3 = (
  filename: string,
  cardObjectPosition = "50% 28%",
  detailObjectPosition = "50% 30%",
  cardScale = 1,
  detailScale = 1,
  detailFit: ImageFit = "contain",
): SoulsBossImageAsset => ({
  url: fandomFileUrl(filename),
  sourceUrl: fandomFilePage(filename),
  sourceLabel: fandomLabel,
  cardObjectPosition,
  detailObjectPosition,
  cardScale,
  detailScale,
  cardFit: "cover",
  detailFit,
});

const creativeUncut = (
  slug: string,
  options: {
    cardObjectPosition?: string;
    detailObjectPosition?: string;
    cardScale?: number;
    detailScale?: number;
    cardFit?: ImageFit;
    detailFit?: ImageFit;
  } = {},
): SoulsBossImageAsset => ({
  url: `https://www.creativeuncut.com/gallery-30/art/${slug}.jpg`,
  sourceUrl: `https://www.creativeuncut.com/gallery-30/${slug}.html`,
  sourceLabel: creativeUncutLabel,
  cardObjectPosition: options.cardObjectPosition ?? "50% 32%",
  detailObjectPosition: options.detailObjectPosition ?? "50% 36%",
  cardScale: options.cardScale ?? 1.04,
  detailScale: options.detailScale ?? 1.06,
  cardFit: options.cardFit ?? "cover",
  detailFit: options.detailFit ?? "cover",
});

export const DARK_SOULS_III_BOSS_IMAGES: Record<string, SoulsBossImageAsset> = {
  "iudex-gundyr": ds3("Gundyr concept.png",
    cardObjectPosition: "50% 28%",
    detailObjectPosition: "50% 34%",
    detailScale: 1.08,
  }),
  "vordt-of-the-boreal-valley": ds3("Vordt concept.png",
    cardObjectPosition: "50% 42%",
    detailObjectPosition: "50% 43%",
    detailScale: 1.08,
  }),
  "curse-rotted-greatwood": ds3("Curse rotted greatwood concept.png",
    cardObjectPosition: "50% 38%",
    detailObjectPosition: "50% 40%",
    detailScale: 1.08,
  }),
  "crystal-sage": ds3("Crystal sage concept.png",
    cardObjectPosition: "50% 24%",
    detailObjectPosition: "50% 30%",
    detailScale: 1.08,
  }),
  "deacons-of-the-deep": ds3("Deacons concept.png",
    cardObjectPosition: "50% 35%",
    detailObjectPosition: "50% 38%",
    detailScale: 1.1,
  }),
  "abyss-watchers": ds3("Abyss Watcher (DS3 Design Works).png",
    cardObjectPosition: "50% 26%",
    detailObjectPosition: "50% 31%",
    detailScale: 1.08,
  }),
  "high-lord-wolnir": ds3("Wolnir concept.png",
    cardObjectPosition: "50% 36%",
    detailObjectPosition: "50% 39%",
    detailScale: 1.08,
  }),
  "old-demon-king": ds3("Old demon king concept.png",
    cardObjectPosition: "50% 36%",
    detailObjectPosition: "50% 40%",
    detailScale: 1.1,
  }),
  "pontiff-sulyvahn": ds3("Pontiff sulyvahn concept.png",
    cardObjectPosition: "50% 24%",
    detailObjectPosition: "50% 30%",
    detailScale: 1.08,
  }),
  "aldrich-devourer-of-gods": ds3("Aldrich concept art.png",
    cardObjectPosition: "50% 34%",
    detailObjectPosition: "50% 38%",
    detailScale: 1.08,
  }),
  "yhorm-the-giant": ds3("Yhorm concept.png",
    cardObjectPosition: "31% 34%",
    detailObjectPosition: "30% 40%",
    cardScale: 1.08,
    detailScale: 1.14,
  }),
  "dancer-of-the-boreal-valley": creativeUncut("ds3-dancer-of-the-boreal-valley", {
    cardObjectPosition: "43% 44%",
    detailObjectPosition: "43% 48%",
    cardScale: 1.08,
    detailScale: 1.12,
  }),
  "oceiros-the-consumed-king": creativeUncut("ds3-oceiros-the-consumed-king", {
    cardObjectPosition: "50% 36%",
    detailObjectPosition: "50% 40%",
    detailScale: 1.08,
  }),
  "champion-gundyr": ds3("Gundyr concept.png",
    cardObjectPosition: "50% 28%",
    detailObjectPosition: "50% 34%",
    detailScale: 1.1,
  }),
  "dragonslayer-armour": ds3("Dragonslayer armour concept.png",
    cardObjectPosition: "50% 24%",
    detailObjectPosition: "50% 31%",
    detailScale: 1.08,
  }),
  "lothric-younger-prince-and-lorian-elder-prince": creativeUncut(
    "ds3-lothric-and-lorian-twin-princes",
    {
      cardObjectPosition: "50% 27%",
      detailObjectPosition: "50% 33%",
      detailScale: 1.08,
    },
  ),
  "twin-princes": creativeUncut("ds3-lothric-and-lorian-twin-princes", {
    cardObjectPosition: "50% 27%",
    detailObjectPosition: "50% 33%",
    detailScale: 1.08,
  }),
  "lorian-elder-prince-and-lothric-younger-prince": creativeUncut(
    "ds3-lothric-and-lorian-twin-princes",
    {
      cardObjectPosition: "50% 27%",
      detailObjectPosition: "50% 33%",
      detailScale: 1.08,
    },
  ),
  "ancient-wyvern": ds3("Ancient wyvern concept.png",
    cardObjectPosition: "50% 42%",
    detailObjectPosition: "50% 44%",
    detailScale: 1.1,
  }),
  "the-nameless-king": ds3("Nameless king concept.png",
    cardObjectPosition: "50% 25%",
    detailObjectPosition: "50% 31%",
    detailScale: 1.08,
  }),
  "nameless-king": ds3("Nameless king concept.png",
    cardObjectPosition: "50% 25%",
    detailObjectPosition: "50% 31%",
    detailScale: 1.08,
  }),
  "soul-of-cinder": creativeUncut("ds3-soul-of-cinder", {
    cardObjectPosition: "50% 27%",
    detailObjectPosition: "50% 33%",
    detailScale: 1.08,
  }),
  "champion-s-gravetender-and-gravetender-greatwolf": {
    url: "https://i.imgur.com/XW5GFIp.jpg",
    sourceUrl: "https://darksouls3.wikidot.com/bosses:champion-s-gravetender-gravetender-greatwolf",
    sourceLabel: {
      "pt-BR": "Screenshot do encontro · Dark Souls III Wikidot",
      en: "Encounter screenshot · Dark Souls III Wikidot",
      es: "Captura del encuentro · Dark Souls III Wikidot",
    },
    cardObjectPosition: "50% 46%",
    detailObjectPosition: "50% 48%",
    cardScale: 1.05,
    detailScale: 1.08,
    cardFit: "cover",
    detailFit: "cover",
  },

  "sister-friede-and-father-ariandel": ds3("Friede concept.png",
    cardObjectPosition: "50% 24%",
    detailObjectPosition: "50% 30%",
    detailScale: 1.07,
  }),
  "sister-friede": ds3("Friede concept.png",
    cardObjectPosition: "50% 24%",
    detailObjectPosition: "50% 30%",
    detailScale: 1.07,
  }),
  "demon-in-pain-demon-from-below-and-demon-prince": ds3("Demon Prince artwork.png",
    cardObjectPosition: "50% 40%",
    detailObjectPosition: "50% 42%",
    detailScale: 1.12,
  }),
  "demon-prince": ds3("Demon Prince artwork.png",
    cardObjectPosition: "50% 40%",
    detailObjectPosition: "50% 42%",
    detailScale: 1.12,
  }),
  "halflight-spear-of-the-church": ds3(
    "Halflight concept.png",
    "50% 22%",
    "50% 30%",
    1.05,
    1.04,
    "contain",
  ),
  "darkeater-midir": ds3("MidirConcept.png",
    cardObjectPosition: "50% 40%",
    detailObjectPosition: "50% 42%",
    detailScale: 1.1,
  }),
  "slave-knight-gael": ds3("Gael phase1 concept.png",
    cardObjectPosition: "50% 27%",
    detailObjectPosition: "50% 33%",
    detailScale: 1.08,
  }),

  // No reliable, boss-specific concept art was found for the Gravetender duo in the
  // sources currently wired into MGP. Its game-cover fallback is intentionally kept.
};

export function getSoulsBossImage(gameSlug: SoulsGameSlug, bossSlug?: string) {
  if (!bossSlug || gameSlug !== "dark-souls-iii") return undefined;
  return DARK_SOULS_III_BOSS_IMAGES[bossSlug];
}
