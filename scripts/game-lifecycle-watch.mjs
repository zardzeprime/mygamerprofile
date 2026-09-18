import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const root = new URL("../", import.meta.url);
const statePath = new URL("docs/editorial/game-lifecycle-candidates.json", root);
const state = JSON.parse(await readFile(statePath, "utf8"));

const USER_AGENT = "MGProfile-LifeWatch/1.0 (+https://mgprofile.online; official-source review bot)";
const TIMEOUT = 15000;

const fetchText = async (url) => {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      "accept-language": "pt-BR,pt;q=0.9,en;q=0.7",
    },
    signal: AbortSignal.timeout(TIMEOUT),
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
};

const decodeHtml = (value = "") =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();

const stripHtml = (html = "") =>
  decodeHtml(
    html
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );

const meta = (html, key) => {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const attrs = {};
    for (const match of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*["']([^"']*)["']/g)) {
      attrs[match[1].toLowerCase()] = match[2];
    }
    if (
      (attrs.property?.toLowerCase() === key.toLowerCase() ||
        attrs.name?.toLowerCase() === key.toLowerCase()) &&
      attrs.content
    ) return decodeHtml(attrs.content);
  }
  return "";
};

const articleDate = (html) =>
  meta(html, "article:published_time") ||
  html.match(/20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z/)?.[0] ||
  "";

const stableId = (url) => createHash("sha1").update(url).digest("hex").slice(0, 12);

const links = (html, base, matcher) => {
  const urls = [];
  for (const match of html.matchAll(/href=["']([^"']+)["']/gi)) {
    try {
      const url = new URL(decodeHtml(match[1]), base);
      url.hash = "";
      const href = url.toString();
      if (!matcher(href)) continue;
      if (!urls.includes(href)) urls.push(href);
    } catch {}
  }
  return urls;
};

const versionTuple = (value) =>
  String(value)
    .split(".")
    .map((part) => Number.parseInt(part, 10) || 0);

const newerThan = (candidate, current) => {
  const a = versionTuple(candidate);
  const b = versionTuple(current);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] ?? 0) > (b[i] ?? 0)) return true;
    if ((a[i] ?? 0) < (b[i] ?? 0)) return false;
  }
  return false;
};

const signals = (text, game) => {
  const normalized = text.toLowerCase();
  const result = [];
  const add = (id, label, pattern) => {
    if (pattern.test(normalized)) result.push({ id, label });
  };

  if (game === "valorant") {
    add("maps", "map rotation / maps", /map pool|rota[cç][aã]o de mapas|map rotation|competitive.*map/);
    add("agents", "agents", /agent updates|atualiza[cç][oõ]es de agentes|agentes/);
    add("weapons", "weapons", /weapons updates|atualiza[cç][oõ]es de armas|weapon/);
    add("skins", "skins / cosmetics", /skin|cosmetic|cosm[eé]tic/);
    add("modes", "game modes", /modes updates|mode reveal|modo|retake|gauntlet|skirmish/);
    add("competitive", "competitive / ranked", /competitive updates|ranque|ranked|premier/);
  } else {
    add("champions", "champions", /## campe[oõ]es|## champions|champion/);
    add("items", "items", /## itens|## items|item/);
    add("skins", "skins / chromas", /skin|croma|chroma/);
    add("modes", "modes", /arena|aram|classic|modo|mode/);
    add("systems", "systems / gameplay", /system|sistema|summoner's rift|grieta|rift/);
  }

  return result;
};

async function latestPatch({ game, listUrl, matcher, versionRegex }) {
  const listHtml = await fetchText(listUrl);
  const urls = links(listHtml, listUrl, matcher).slice(0, 10);
  const candidates = [];

  for (const url of urls) {
    const match = url.match(versionRegex);
    if (!match) continue;
    const version = match[1].replace(/-/g, ".");
    candidates.push({ url, version });
  }

  candidates.sort((a, b) => (newerThan(a.version, b.version) ? -1 : newerThan(b.version, a.version) ? 1 : 0));
  const latest = candidates[0];
  if (!latest) return null;

  const html = await fetchText(latest.url);
  const title =
    meta(html, "og:title") ||
    decodeHtml(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "");
  const description = meta(html, "og:description") || meta(html, "description");
  const body = stripHtml(html);

  return {
    id: `${game}-patch-${stableId(latest.url)}`,
    game,
    kind: "patch",
    version: latest.version,
    publishedAt: articleDate(html),
    title,
    summary: description,
    url: latest.url,
    signals: signals(body, game),
    source: game === "valorant" ? "Riot Games · VALORANT" : "Riot Games · League of Legends",
  };
}

const discovered = [];

try {
  const latest = await latestPatch({
    game: "valorant",
    listUrl: "https://playvalorant.com/pt-br/news/game-updates/",
    matcher: (url) => /playvalorant\.com\/.*\/news\/game-updates\/valorant-patch-notes-/i.test(url),
    versionRegex: /valorant-patch-notes-(\d+-\d+)/i,
  });
  if (latest && newerThan(latest.version, state.lastSeen.valorant.patch)) discovered.push(latest);
} catch (error) {
  console.warn("[game-life-watch] VALORANT source failed", String(error));
}

try {
  const latest = await latestPatch({
    game: "league",
    listUrl: "https://www.leagueoflegends.com/pt-br/news/game-updates/",
    matcher: (url) => /leagueoflegends\.com\/.*\/news\/game-updates\/league-of-legends-patch-/i.test(url),
    versionRegex: /league-of-legends-patch-(\d+-\d+)/i,
  });
  if (latest && newerThan(latest.version, state.lastSeen.league.patch)) discovered.push(latest);
} catch (error) {
  console.warn("[game-life-watch] League source failed", String(error));
}

try {
  const versions = JSON.parse(await fetchText("https://ddragon.leagueoflegends.com/api/versions.json"));
  const latest = versions?.[0];
  if (latest && latest !== state.lastSeen.league.dataDragon) {
    discovered.push({
      id: `league-ddragon-${latest}`,
      game: "league",
      kind: "data-dragon",
      version: latest,
      publishedAt: new Date().toISOString(),
      title: `Riot Data Dragon ${latest}`,
      summary: "A new Data Dragon version is available; champion/item/map payloads and image paths should be regression-checked.",
      url: "https://ddragon.leagueoflegends.com/api/versions.json",
      signals: [
        { id: "champions", label: "champions" },
        { id: "items", label: "items" },
        { id: "assets", label: "official assets" },
      ],
      source: "Riot Data Dragon",
    });
  }
} catch (error) {
  console.warn("[game-life-watch] Data Dragon source failed", String(error));
}

const existingIds = new Set((state.candidates ?? []).map((item) => item.id));
const merged = [
  ...(state.candidates ?? []),
  ...discovered.filter((item) => !existingIds.has(item.id)),
].slice(-80);

if (merged.length === (state.candidates ?? []).length) {
  console.log("[game-life-watch] no new lifecycle candidates");
  process.exit(0);
}

const next = {
  ...state,
  candidates: merged,
};

await writeFile(statePath, JSON.stringify(next, null, 2) + "\n", "utf8");
console.log("[game-life-watch] new lifecycle candidates:", discovered.length);
