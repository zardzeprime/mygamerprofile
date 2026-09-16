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
  "iudex-gundyr": creativeUncut("ds3-gunda", {
    cardObjectPosition: "50% 28%",
    detailObjectPosition: "50% 34%",
    detailScale: 1.08,
  }),
  "vordt-of-the-boreal-valley": creativeUncut("ds3-vordt-of-the-boreal-valley", {
    cardObjectPosition: "50% 42%",
    detailObjectPosition: "50% 43%",
    detailScale: 1.08,
  }),
  "curse-rotted-greatwood": creativeUncut("ds3-curse-rotted-greatwood", {
    cardObjectPosition: "50% 38%",
    detailObjectPosition: "50% 40%",
    detailScale: 1.08,
  }),
  "crystal-sage": creativeUncut("ds3-crystal-sage", {
    cardObjectPosition: "50% 24%",
    detailObjectPosition: "50% 30%",
    detailScale: 1.08,
  }),
  "deacons-of-the-deep": creativeUncut("ds3-deacons-of-the-deep", {
    cardObjectPosition: "50% 35%",
    detailObjectPosition: "50% 38%",
    detailScale: 1.1,
  }),
  "abyss-watchers": creativeUncut("ds3-the-abyss-watchers", {
    cardObjectPosition: "50% 26%",
    detailObjectPosition: "50% 31%",
    detailScale: 1.08,
  }),
  "high-lord-wolnir": creativeUncut("ds3-high-lord-wolnir", {
    cardObjectPosition: "50% 36%",
    detailObjectPosition: "50% 39%",
    detailScale: 1.08,
  }),
  "old-demon-king": creativeUncut("ds3-old-demon-king", {
    cardObjectPosition: "50% 36%",
    detailObjectPosition: "50% 40%",
    detailScale: 1.1,
  }),
  "pontiff-sulyvahn": creativeUncut("ds3-pontiff-sulyvahn", {
    cardObjectPosition: "50% 24%",
    detailObjectPosition: "50% 30%",
    detailScale: 1.08,
  }),
  "aldrich-devourer-of-gods": creativeUncut("ds3-aldrich-devourer-of-gods", {
    cardObjectPosition: "50% 34%",
    detailObjectPosition: "50% 38%",
    detailScale: 1.08,
  }),
  "yhorm-the-giant": creativeUncut("ds3-yhorm-the-giant", {
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
  "champion-gundyr": creativeUncut("ds3-gunda", {
    cardObjectPosition: "50% 28%",
    detailObjectPosition: "50% 34%",
    detailScale: 1.1,
  }),
  "dragonslayer-armour": creativeUncut("ds3-dragonslayer-armor", {
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
  "ancient-wyvern": creativeUncut("ds3-ancient-wyvern", {
    cardObjectPosition: "50% 42%",
    detailObjectPosition: "50% 44%",
    detailScale: 1.1,
  }),
  "the-nameless-king": creativeUncut("ds3-the-nameless-king", {
    cardObjectPosition: "50% 25%",
    detailObjectPosition: "50% 31%",
    detailScale: 1.08,
  }),
  "nameless-king": creativeUncut("ds3-the-nameless-king", {
    cardObjectPosition: "50% 25%",
    detailObjectPosition: "50% 31%",
    detailScale: 1.08,
  }),
  "soul-of-cinder": creativeUncut("ds3-soul-of-cinder", {
    cardObjectPosition: "50% 27%",
    detailObjectPosition: "50% 33%",
    detailScale: 1.08,
  }),
  "sister-friede-and-father-ariandel": creativeUncut("ds3-sister-friede", {
    cardObjectPosition: "50% 24%",
    detailObjectPosition: "50% 30%",
    detailScale: 1.07,
  }),
  "sister-friede": creativeUncut("ds3-sister-friede", {
    cardObjectPosition: "50% 24%",
    detailObjectPosition: "50% 30%",
    detailScale: 1.07,
  }),
  "demon-in-pain-demon-from-below-and-demon-prince": creativeUncut("ds3-demon-prince", {
    cardObjectPosition: "50% 40%",
    detailObjectPosition: "50% 42%",
    detailScale: 1.12,
  }),
  "demon-prince": creativeUncut("ds3-demon-prince", {
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
  "darkeater-midir": creativeUncut("ds3-darkeater-midir", {
    cardObjectPosition: "50% 40%",
    detailObjectPosition: "50% 42%",
    detailScale: 1.1,
  }),
  "slave-knight-gael": creativeUncut("ds3-slave-knight-gael", {
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
