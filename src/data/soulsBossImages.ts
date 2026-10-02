import type { Locale } from "@/i18n";
import type { SoulsGameSlug } from "@/data/soulsBossResearch";

type LocalizedText = Record<Locale, string>;
type ImageFit = "cover" | "contain";

// Route third-party artwork through a dedicated image CDN so Fandom/legacy hosts
// cannot block the browser hotlink. Source/provenance links remain the original pages.
const reliableImageUrl = (url: string) =>
  `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=1200&fit=inside&we`;

export type SoulsBossImageAsset = {
  url: string;
  sourceUrl: string;
  sourceLabel: LocalizedText;
  assetSourceUrl?: string;
  assetSourceLabel?: LocalizedText;
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
  url: reliableImageUrl(fandomFileUrl(filename)),
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
  url: reliableImageUrl(`https://www.creativeuncut.com/gallery-30/art/${slug}.jpg`),
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
  "iudex-gundyr": ds3("Gundyr concept.png", "50% 28%", "50% 34%", 1, 1.08),
  "vordt-of-the-boreal-valley": ds3("Vordt concept.png", "50% 42%", "50% 43%", 1, 1.08),
  "curse-rotted-greatwood": ds3(
    "Curse rotted greatwood concept.png",
    "50% 38%",
    "50% 40%",
    1,
    1.08,
  ),
  "crystal-sage": ds3("Crystal sage concept.png", "50% 24%", "50% 30%", 1, 1.08),
  "deacons-of-the-deep": ds3("Deacons concept.png", "50% 35%", "50% 38%", 1, 1.1),
  "abyss-watchers": ds3("Abyss Watcher (DS3 Design Works).png", "50% 26%", "50% 31%", 1, 1.08),
  "high-lord-wolnir": ds3("Wolnir concept.png", "50% 36%", "50% 39%", 1, 1.08),
  "old-demon-king": ds3("Old demon king concept.png", "50% 36%", "50% 40%", 1, 1.1),
  "pontiff-sulyvahn": ds3("Pontiff sulyvahn concept.png", "50% 24%", "50% 30%", 1, 1.08),
  "aldrich-devourer-of-gods": ds3("Aldrich concept art.png", "50% 34%", "50% 38%", 1, 1.08),
  "yhorm-the-giant": ds3("Yhorm concept.png", "31% 34%", "30% 40%", 1.08, 1.14),
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
  "champion-gundyr": ds3("Gundyr concept.png", "50% 28%", "50% 34%", 1, 1.1),
  "dragonslayer-armour": ds3("Dragonslayer armour concept.png", "50% 24%", "50% 31%", 1, 1.08),
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
  "ancient-wyvern": ds3("Ancient wyvern concept.png", "50% 42%", "50% 44%", 1, 1.1),
  "the-nameless-king": ds3("Nameless king concept.png", "50% 25%", "50% 31%", 1, 1.08),
  "nameless-king": ds3("Nameless king concept.png", "50% 25%", "50% 31%", 1, 1.08),
  "soul-of-cinder": creativeUncut("ds3-soul-of-cinder", {
    cardObjectPosition: "50% 27%",
    detailObjectPosition: "50% 33%",
    detailScale: 1.08,
  }),
  "champion-s-gravetender-and-gravetender-greatwolf": {
    url: reliableImageUrl("https://i.imgur.com/XW5GFIp.jpg"),
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

  "sister-friede-and-father-ariandel": ds3("Friede concept.png", "50% 24%", "50% 30%", 1, 1.07),
  "sister-friede": ds3("Friede concept.png", "50% 24%", "50% 30%", 1, 1.07),
  "demon-in-pain-demon-from-below-and-demon-prince": ds3(
    "Demon Prince artwork.png",
    "50% 40%",
    "50% 42%",
    1,
    1.12,
  ),
  "demon-prince": ds3("Demon Prince artwork.png", "50% 40%", "50% 42%", 1, 1.12),
  "halflight-spear-of-the-church": ds3(
    "Halflight concept.png",
    "50% 22%",
    "50% 30%",
    1.05,
    1.04,
    "contain",
  ),
  "darkeater-midir": ds3("MidirConcept.png", "50% 40%", "50% 42%", 1, 1.1),
  "slave-knight-gael": ds3("Gael phase1 concept.png", "50% 27%", "50% 33%", 1, 1.08),

  // No reliable, boss-specific concept art was found for the Gravetender duo in the
  // sources currently wired into ÍMPAR. Its game-cover fallback is intentionally kept.
};

const localMirrorLabel: LocalizedText = {
  "pt-BR": "Fonte técnica do arquivo local",
  en: "Technical source for local file",
  es: "Fuente técnica del archivo local",
};

const DARK_SOULS_III_LOCAL_IMAGE_SLUGS: Record<string, string> = {
  "nameless-king": "the-nameless-king",
  "twin-princes": "lothric-younger-prince-and-lorian-elder-prince",
  "lorian-elder-prince-and-lothric-younger-prince":
    "lothric-younger-prince-and-lorian-elder-prince",
  "sister-friede": "sister-friede-and-father-ariandel",
  "demon-prince": "demon-in-pain-demon-from-below-and-demon-prince",
};

const DS3_MIRROR_FILENAMES: Record<string, string> = {
  "vordt-of-the-boreal-valley": "vordt.jpg",
  "curse-rotted-greatwood": "greatwood.jpg",
  "deacons-of-the-deep": "deacons.jpg",
  "high-lord-wolnir": "wolnir.jpg",
  "pontiff-sulyvahn": "pontiff.jpg",
  "aldrich-devourer-of-gods": "aldrich.jpg",
  "dancer-of-the-boreal-valley": "dancer.jpg",
  "dragonslayer-armour": "dragonslayer.jpg",
  "oceiros-the-consumed-king": "oceiros.jpg",
  "lothric-younger-prince-and-lorian-elder-prince": "lothric.jpg",
  "the-nameless-king": "nameless_king.jpg",
  "champion-s-gravetender-and-gravetender-greatwolf": "champions_gravetender.jpg",
  "sister-friede-and-father-ariandel": "sister_friede.jpg",
  "demon-in-pain-demon-from-below-and-demon-prince": "demon_prince.jpg",
  "halflight-spear-of-the-church": "halflight.jpg",
  "darkeater-midir": "midir.jpg",
  "slave-knight-gael": "gael.jpg",
  "yhorm-the-giant": "yhorm.jpg",
};

function getDs3MirrorSourceUrl(bossSlug: string) {
  const canonicalSlug = DARK_SOULS_III_LOCAL_IMAGE_SLUGS[bossSlug] ?? bossSlug;
  if (canonicalSlug === "soul-of-cinder") {
    return "https://github.com/lcasort/DEWS_LCO/blob/master/DarkSouls/public/img/bosses/soul-of-cinder.jpg";
  }

  const filename =
    DS3_MIRROR_FILENAMES[canonicalSlug] ?? `${canonicalSlug.replaceAll("-", "_")}.jpg`;
  return `https://github.com/joshuamooredev/boss-tracker-collection/blob/main/src/assets/images/DarkSoulsIII/${filename}`;
}

export function getSoulsBossImage(gameSlug: SoulsGameSlug, bossSlug?: string) {
  if (!bossSlug || gameSlug !== "dark-souls-iii") return undefined;
  const asset = DARK_SOULS_III_BOSS_IMAGES[bossSlug];
  if (!asset) return undefined;

  // Keep every DS3 boss card/detail on a first-party static path. The binary mirror
  // provenance is kept separate from the original reference/rights link.
  const localSlug = DARK_SOULS_III_LOCAL_IMAGE_SLUGS[bossSlug] ?? bossSlug;
  return {
    ...asset,
    url: `/assets/bosses/ds3/${localSlug}.jpg`,
    assetSourceUrl: getDs3MirrorSourceUrl(bossSlug),
    assetSourceLabel: localMirrorLabel,
  };
}
