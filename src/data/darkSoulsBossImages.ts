import type { AppLocale } from "@/i18n/translations";

type LocalizedText = Record<AppLocale, string>;
type ImageFit = "cover" | "contain";

// Route third-party artwork through a dedicated image CDN so Fandom/legacy hosts
// cannot block the browser hotlink. Source/provenance links remain the original pages.
const reliableImageUrl = (url: string) =>
  `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=1200&fit=inside&we`;

const localAsset = <T extends { url: string }>(asset: T, url: string): T => ({
  ...asset,
  url,
});


export type DarkSoulsBossImageAsset = {
  url: string;
  sourceUrl: string;
  sourceLabel: LocalizedText;
  kind: "promotional" | "ptde-screenshot" | "wiki-image" | "concept-art";
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

const remasteredFileUrl = (filename: string) =>
  `https://dark-souls-remastered.fandom.com/wiki/Special:Redirect/file/${encodeURIComponent(filename)}`;

const remasteredFilePage = (filename: string) =>
  `https://dark-souls-remastered.fandom.com/wiki/File:${encodeURIComponent(filename)}`;

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

const wikiImageLabel: LocalizedText = {
  "pt-BR": "Arte de referência · Dark Souls Wiki (Fandom)",
  en: "Reference artwork · Dark Souls Wiki (Fandom)",
  es: "Arte de referencia · Dark Souls Wiki (Fandom)",
};

const conceptLabel: LocalizedText = {
  "pt-BR": "Concept art · Dark Souls Wiki (Fandom)",
  en: "Concept art · Dark Souls Wiki (Fandom)",
  es: "Arte conceptual · Dark Souls Wiki (Fandom)",
};

const remasteredLabel: LocalizedText = {
  "pt-BR": "Artwork de referência · Dark Souls Remastered Wiki (Fandom)",
  en: "Reference artwork · Dark Souls Remastered Wiki (Fandom)",
  es: "Arte de referencia · Dark Souls Remastered Wiki (Fandom)",
};

const creativeUncutLabel: LocalizedText = {
  "pt-BR": "Concept art oficial · catalogado no Creative Uncut",
  en: "Official concept art · catalogued by Creative Uncut",
  es: "Arte conceptual oficial · catalogado en Creative Uncut",
};

const fandomAsset = (
  filename: string,
  options: {
    label?: LocalizedText;
    kind?: DarkSoulsBossImageAsset["kind"];
    cardObjectPosition?: string;
    detailObjectPosition?: string;
    cardScale?: number;
    detailScale?: number;
    cardFit?: ImageFit;
    detailFit?: ImageFit;
  } = {},
): DarkSoulsBossImageAsset => ({
  url: reliableImageUrl(fandomFileUrl(filename)),
  sourceUrl: fandomFilePage(filename),
  sourceLabel: options.label ?? wikiImageLabel,
  kind: options.kind ?? "wiki-image",
  cardObjectPosition: options.cardObjectPosition ?? "50% 34%",
  detailObjectPosition: options.detailObjectPosition ?? "50% 38%",
  cardScale: options.cardScale ?? 1,
  detailScale: options.detailScale ?? 1,
  cardFit: options.cardFit ?? "cover",
  detailFit: options.detailFit ?? "contain",
});

const remasteredAsset = (
  filename: string,
  options: {
    cardObjectPosition?: string;
    detailObjectPosition?: string;
    cardScale?: number;
    detailScale?: number;
    cardFit?: ImageFit;
    detailFit?: ImageFit;
  } = {},
): DarkSoulsBossImageAsset => ({
  url: reliableImageUrl(remasteredFileUrl(filename)),
  sourceUrl: remasteredFilePage(filename),
  sourceLabel: remasteredLabel,
  kind: "wiki-image",
  cardObjectPosition: options.cardObjectPosition ?? "50% 36%",
  detailObjectPosition: options.detailObjectPosition ?? "50% 40%",
  cardScale: options.cardScale ?? 1.05,
  detailScale: options.detailScale ?? 1.08,
  cardFit: options.cardFit ?? "cover",
  detailFit: options.detailFit ?? "cover",
});

const screenshot = (
  filename: string,
  sourceLabel: LocalizedText,
  kind: "promotional" | "ptde-screenshot",
  options: {
    cardObjectPosition?: string;
    detailObjectPosition?: string;
    cardScale?: number;
    detailScale?: number;
  } = {},
): DarkSoulsBossImageAsset => ({
  url: reliableImageUrl(fandomFileUrl(filename)),
  sourceUrl: fandomFilePage(filename),
  sourceLabel,
  kind,
  cardObjectPosition: options.cardObjectPosition ?? "50% 40%",
  detailObjectPosition: options.detailObjectPosition ?? "50% 42%",
  cardScale: options.cardScale ?? 1.08,
  detailScale: options.detailScale ?? 1.16,
  cardFit: "cover",
  detailFit: "cover",
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
): DarkSoulsBossImageAsset => ({
  url: reliableImageUrl(`https://www.creativeuncut.com/gallery-18/art/${slug}.jpg`),
  sourceUrl: `https://www.creativeuncut.com/gallery-18/${slug}.html`,
  sourceLabel: creativeUncutLabel,
  kind: "concept-art",
  cardObjectPosition: options.cardObjectPosition ?? "50% 35%",
  detailObjectPosition: options.detailObjectPosition ?? "50% 39%",
  cardScale: options.cardScale ?? 1.06,
  detailScale: options.detailScale ?? 1.1,
  cardFit: options.cardFit ?? "cover",
  detailFit: options.detailFit ?? "cover",
});

export const DARK_SOULS_BOSS_IMAGES: Record<string, DarkSoulsBossImageAsset> = {
  "asylum-demon": fandomAsset("Asylum Demon.png", {
    cardObjectPosition: "50% 29%",
    detailObjectPosition: "50% 34%",
    cardScale: 1.02,
    detailScale: 1.03,
    detailFit: "contain",
  }),

  // Landscape promotional art: intentionally zoomed toward the Taurus Demon instead
  // of letterboxing the full co-op screenshot in the portrait panel.
  "taurus-demon": screenshot(
    "DS1 promotional screenshot (Taurus Demon co-op).jpg",
    promotionalLabel,
    "promotional",
    {
      cardObjectPosition: "72% 45%",
      detailObjectPosition: "72% 46%",
      cardScale: 1.28,
      detailScale: 1.52,
    },
  ),

  // Creative Uncut's Bell Gargoyle URL proved unstable in the live app.
  // Restore the Fandom promotional still that was already confirmed working.
  "bell-gargoyles": screenshot(
    "DS1 Promotional screenshot (Bell Gargoyle).jpg",
    promotionalLabel,
    "promotional",
    {
      cardObjectPosition: "50% 35%",
      detailObjectPosition: "50% 40%",
      cardScale: 1.08,
      detailScale: 1.18,
    },
  ),

  "capra-demon": fandomAsset("Capra Demon 01.jpg", {
    label: conceptLabel,
    kind: "concept-art",
    cardObjectPosition: "50% 31%",
    detailObjectPosition: "50% 35%",
    cardScale: 1.08,
    detailScale: 1.12,
    detailFit: "cover",
  }),

  // Same fallback policy as Bell Gargoyles: prefer the previously working Fandom
  // screenshot over a higher-quality external asset that fails to render reliably.
  "gaping-dragon": screenshot(
    "DS1 promotional screenshot (Gaping Dragon co-op).jpg",
    promotionalLabel,
    "promotional",
    {
      cardObjectPosition: "50% 42%",
      detailObjectPosition: "50% 44%",
      cardScale: 1.1,
      detailScale: 1.2,
    },
  ),

  "chaos-witch-quelaag": fandomAsset("Quelaag 01.jpg", {
    label: conceptLabel,
    kind: "concept-art",
    cardObjectPosition: "50% 35%",
    detailObjectPosition: "50% 39%",
    cardScale: 1.08,
    detailScale: 1.13,
    detailFit: "cover",
  }),

  "moonlight-butterfly": remasteredAsset("MLBF.jpg", {
    cardObjectPosition: "50% 43%",
    detailObjectPosition: "50% 44%",
    cardScale: 1.08,
    detailScale: 1.16,
  }),

  "great-grey-wolf-sif": screenshot(
    "DS1 promotional screenshot (Great Grey Wolf Sif).jpg",
    promotionalLabel,
    "promotional",
    {
      cardObjectPosition: "56% 42%",
      detailObjectPosition: "56% 44%",
      cardScale: 1.15,
      detailScale: 1.22,
    },
  ),

  "iron-golem": fandomAsset("Iron Golem concept art.jpg", {
    label: conceptLabel,
    kind: "concept-art",
    cardObjectPosition: "50% 25%",
    detailObjectPosition: "50% 32%",
    cardScale: 1.06,
    detailScale: 1.08,
    detailFit: "contain",
  }),

  "ornstein-and-smough": remasteredAsset("Ornstein+smough.jpg", {
    cardObjectPosition: "50% 36%",
    detailObjectPosition: "50% 40%",
    cardScale: 1.1,
    detailScale: 1.2,
  }),

  "dark-sun-gwyndolin": fandomAsset("Gywndolin concept art.jpg", {
    label: conceptLabel,
    kind: "concept-art",
    cardObjectPosition: "50% 22%",
    detailObjectPosition: "50% 30%",
    cardScale: 1.04,
    detailScale: 1.08,
    detailFit: "contain",
  }),

  "crossbreed-priscilla": fandomAsset("Crossbreed.jpg", {
    label: conceptLabel,
    kind: "concept-art",
    cardObjectPosition: "50% 20%",
    detailObjectPosition: "50% 28%",
    cardScale: 1.04,
    detailScale: 1.08,
    detailFit: "contain",
  }),

  "stray-demon": screenshot(
    "DS1 promotional screenshot (Stray Demon).jpg",
    promotionalLabel,
    "promotional",
    {
      cardObjectPosition: "55% 40%",
      detailObjectPosition: "55% 43%",
      cardScale: 1.15,
      detailScale: 1.28,
    },
  ),

  "pinwheel": remasteredAsset("Concept of pinwheel.jpg", {
    cardObjectPosition: "50% 30%",
    detailObjectPosition: "50% 34%",
    cardScale: 1.06,
    detailScale: 1.1,
  }),

  "gravelord-nito": localAsset(creativeUncut("ds-nito", {
    cardObjectPosition: "50% 28%",
    detailObjectPosition: "50% 34%",
    detailScale: 1.1,
  }), "/assets/bosses/ds1/gravelord-nito.jpg"),

  "seath-the-scaleless": localAsset(creativeUncut("ds-crystal-dragon", {
    cardObjectPosition: "50% 39%",
    detailObjectPosition: "50% 42%",
    cardScale: 1.07,
    detailScale: 1.11,
  }), "/assets/bosses/ds1/seath-the-scaleless.jpg"),

  "four-kings": fandomAsset("Four kings.jpg", {
    label: conceptLabel,
    kind: "concept-art",
    cardObjectPosition: "50% 34%",
    detailObjectPosition: "50% 38%",
    cardScale: 1.08,
    detailScale: 1.14,
    detailFit: "cover",
  }),

  "ceaseless-discharge": fandomAsset("Ceaseless Discharge 01.jpg", {
    label: conceptLabel,
    kind: "concept-art",
    cardObjectPosition: "50% 38%",
    detailObjectPosition: "50% 42%",
    cardScale: 1.08,
    detailScale: 1.15,
    detailFit: "cover",
  }),

  "demon-firesage": {
    url: reliableImageUrl("https://images.squarespace-cdn.com/content/v1/647e516c1ebf6d1ac5f8d201/7d2f6e05-3db6-46be-a80c-0ceebf69cbf5/firesage-1200x675.jpg"),
    sourceUrl: "https://www.dvs.news/home/dark-souls-boss-guide",
    sourceLabel: {
      "pt-BR": "Screenshot de combate · DVS Gaming",
      en: "Combat screenshot · DVS Gaming",
      es: "Captura de combate · DVS Gaming",
    },
    kind: "wiki-image",
    cardObjectPosition: "50% 42%",
    detailObjectPosition: "50% 44%",
    cardScale: 1.06,
    detailScale: 1.1,
    cardFit: "cover",
    detailFit: "cover",
  },

  "centipede-demon": fandomAsset("Centipede Demon.jpg", {
    cardObjectPosition: "50% 40%",
    detailObjectPosition: "50% 43%",
    cardScale: 1.1,
    detailScale: 1.16,
    detailFit: "cover",
  }),

  "bed-of-chaos": localAsset(fandomAsset("Bed of Chaos.jpg", {
    cardObjectPosition: "50% 38%",
    detailObjectPosition: "50% 42%",
    cardScale: 1.08,
    detailScale: 1.14,
    detailFit: "cover",
  }), "/assets/bosses/ds1/bed-of-chaos.jpg"),

  "gwyn-lord-of-cinder": localAsset(fandomAsset("Gwyn, Lord of Cinder concept art.jpg", {
    label: conceptLabel,
    kind: "concept-art",
    cardObjectPosition: "50% 21%",
    detailObjectPosition: "50% 28%",
    cardScale: 1.06,
    detailScale: 1.1,
    detailFit: "contain",
  }), "/assets/bosses/ds1/gwyn-lord-of-cinder.jpg"),

  "sanctuary-guardian": remasteredAsset("Sanctuary Guardian.jpg", {
    cardObjectPosition: "58% 42%",
    detailObjectPosition: "58% 44%",
    cardScale: 1.1,
    detailScale: 1.18,
  }),

  "artorias-the-abysswalker": creativeUncut("ds-artorias-the-abysswalker2", {
    cardObjectPosition: "50% 25%",
    detailObjectPosition: "50% 31%",
    detailScale: 1.1,
  }),

  "black-dragon-kalameet": creativeUncut("ds-dragon", {
    cardObjectPosition: "50% 40%",
    detailObjectPosition: "50% 43%",
    cardScale: 1.08,
    detailScale: 1.14,
  }),

  "manus-father-of-the-abyss": screenshot(
    "DS1 PtDE screenshot (Manus).jpg",
    ptdeLabel,
    "ptde-screenshot",
    {
      cardObjectPosition: "58% 38%",
      detailObjectPosition: "58% 42%",
      cardScale: 1.14,
      detailScale: 1.24,
    },
  ),

  // No stable, boss-specific still from the supplied sources was reliable enough for
  // Demon Firesage. The MGP placeholder remains preferable to reusing another demon.
};

export function getDarkSoulsBossImage(slug?: string) {
  if (!slug) return undefined;
  const asset = DARK_SOULS_BOSS_IMAGES[slug];
  if (!asset) return undefined;

  // Boss artwork is vendored under /public so cards and detail views never depend
  // on a third-party hotlink at runtime. sourceUrl/sourceLabel stay intact for credit.
  return {
    ...asset,
    url: `/assets/bosses/ds1/${slug}.jpg`,
  };
}
