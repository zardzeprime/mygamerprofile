import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const root = new URL("../", import.meta.url);
const newsPath = new URL("src/data/valorantNews.ts", root);
const candidatesPath = new URL("docs/editorial/valorant-news-candidates.json", root);

const existingNews = await readFile(newsPath, "utf8");
const currentCandidates = JSON.parse(await readFile(candidatesPath, "utf8"));

const USER_AGENT =
  "MGProfile-Editorial-Watch/1.0 (+https://mygamerprofile.lovable.app; official-source metadata only)";
const MAX_ARTICLES_PER_SOURCE = 18;
const MAX_CANDIDATES = 60;

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      "accept-language": "pt-BR,pt;q=0.9,en;q=0.7",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(String(response.status) + " " + url);
  return response.text();
};

const decodeHtml = (value = "") =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();

const meta = (html, key) => {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const attributes = {};
    for (const match of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*["']([^"']*)["']/g)) {
      attributes[match[1].toLowerCase()] = match[2];
    }
    if (
      (attributes.property?.toLowerCase() === key.toLowerCase() ||
        attributes.name?.toLowerCase() === key.toLowerCase()) &&
      attributes.content
    ) {
      return decodeHtml(attributes.content);
    }
  }
  return "";
};

const firstIsoDate = (html) =>
  meta(html, "article:published_time") ||
  meta(html, "date") ||
  html.match(/20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z/)?.[0] ||
  "";

const normalizeUrl = (href, base) => {
  try {
    const url = new URL(decodeHtml(href), base);
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
};

const articleLinks = (html, base, localePath) => {
  const hrefs = [];
  for (const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
    const url = normalizeUrl(match[1], base);
    if (!url) continue;
    const parsed = new URL(url);
    if (!parsed.pathname.toLowerCase().includes(localePath.toLowerCase())) continue;
    if (/\/news\/?$/i.test(parsed.pathname)) continue;
    if (/\/news\/(tags|category|categories)\//i.test(parsed.pathname)) continue;
    if (!hrefs.includes(url)) hrefs.push(url);
  }
  return hrefs.slice(0, MAX_ARTICLES_PER_SOURCE);
};

const categoryFor = (url, fallback = "announcement") => {
  const path = new URL(url).pathname.toLowerCase();
  if (path.includes("/game-updates/") || /patch|update/.test(path)) return "patch";
  if (path.includes("/dev/")) return "dev";
  if (path.includes("/esports/") || new URL(url).hostname.includes("valorantesports")) return "esports";
  if (/trailer|cinematic|music|skin|video/.test(path)) return "media";
  return fallback;
};

const stableId = (url) =>
  "auto-" + createHash("sha1").update(url).digest("hex").slice(0, 12);

const knownUrl = (url) =>
  existingNews.includes(url) ||
  currentCandidates.items.some((item) => item.url === url);

const discoverArticlePage = async ({ listUrl, localePath, sourceLabel, fallbackCategory }) => {
  const listHtml = await fetchText(listUrl);
  const links = articleLinks(listHtml, listUrl, localePath);
  const items = [];

  for (const url of links) {
    if (knownUrl(url)) continue;
    try {
      const html = await fetchText(url);
      const title =
        meta(html, "og:title") ||
        meta(html, "twitter:title") ||
        decodeHtml(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "");
      const summary =
        meta(html, "og:description") ||
        meta(html, "description") ||
        meta(html, "twitter:description");
      const publishedAt = firstIsoDate(html);

      if (!title || !publishedAt) continue;

      items.push({
        id: stableId(url),
        category: categoryFor(url, fallbackCategory),
        publishedAt,
        titlePtBr: title,
        summaryPtBr: summary,
        url,
        sourceLabel,
        sourceKind: "official-web",
      });
    } catch (error) {
      console.warn("[valorant-news-watch] article skipped", url, String(error));
    }
  }

  return items;
};

const discoverYouTubeBr = async () => {
  const channelPage = "https://www.youtube.com/@valorantbrasil";
  const html = await fetchText(channelPage);
  const channelId =
    html.match(/"channelId":"(UC[^"]+)"/)?.[1] ||
    html.match(/<meta itemprop="channelId" content="([^"]+)"/i)?.[1];

  if (!channelId) {
    console.warn("[valorant-news-watch] YouTube channel id not found");
    return [];
  }

  const feedUrl = "https://www.youtube.com/feeds/videos.xml?channel_id=" + channelId;
  const feed = await fetchText(feedUrl);
  const items = [];

  for (const entry of feed.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const xml = entry[1];
    const videoId = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = decodeHtml(xml.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
    const publishedAt = xml.match(/<published>([^<]+)<\/published>/)?.[1];
    const mediaDescription = decodeHtml(
      xml.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] ?? "",
    );
    if (!videoId || !title || !publishedAt) continue;

    const url = "https://www.youtube.com/watch?v=" + videoId;
    if (knownUrl(url)) continue;

    items.push({
      id: stableId(url),
      category: "media",
      publishedAt,
      titlePtBr: title,
      summaryPtBr: mediaDescription.slice(0, 360),
      url,
      sourceLabel: "VALORANT // Brasil · YouTube",
      sourceKind: "official-youtube",
    });
  }

  return items.slice(0, 12);
};

const discovered = [];
const jobs = [
  {
    listUrl: "https://playvalorant.com/pt-br/news/",
    localePath: "/pt-br/news/",
    sourceLabel: "VALORANT Brasil · Riot Games",
    fallbackCategory: "announcement",
  },
  {
    listUrl: "https://valorantesports.com/pt-BR/news",
    localePath: "/pt-BR/news/",
    sourceLabel: "VALORANT Esports · Brasil",
    fallbackCategory: "esports",
  },
];

for (const job of jobs) {
  try {
    discovered.push(...(await discoverArticlePage(job)));
  } catch (error) {
    console.warn("[valorant-news-watch] source skipped", job.listUrl, String(error));
  }
}

try {
  discovered.push(...(await discoverYouTubeBr()));
} catch (error) {
  console.warn("[valorant-news-watch] YouTube source skipped", String(error));
}

const merged = [...currentCandidates.items, ...discovered]
  .filter((item, index, all) => all.findIndex((candidate) => candidate.url === item.url) === index)
  .filter((item) => !existingNews.includes(item.url))
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  .slice(0, MAX_CANDIDATES);

const output = {
  schemaVersion: 1,
  sourcePolicy: "official-only",
  items: merged,
};

const next = JSON.stringify(output, null, 2) + "\n";
const previous = JSON.stringify(currentCandidates, null, 2) + "\n";

if (next === previous) {
  console.log("[valorant-news-watch] no new official candidates");
  process.exit(0);
}

await writeFile(candidatesPath, next, "utf8");
console.log("[valorant-news-watch] candidates updated:", merged.length);
