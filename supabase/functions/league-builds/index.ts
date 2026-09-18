const PROJECT_PUBLISHABLE_KEY = "sb_publishable_JXVaM-rr7Yu59l3x7WyHEg_qlR-uDMX";

type BuildItem = {
  id: string;
  name: string;
};

type BuildVariant = {
  id: string;
  label: "primary" | "alternative";
  startingItems: BuildItem[];
  items: BuildItem[];
};

type SourceCrossCheck = {
  id: "riot" | "opgg" | "mobalytics" | "leagueofgraphs";
  label: string;
  url: string;
  status: "confirmed" | "reachable" | "blocked" | "unavailable";
  patch?: string | null;
  role?: string | null;
  items?: BuildItem[];
  note?: string;
};

type BuildPayload = {
  champion: string;
  slug: string;
  role: string | null;
  patch: string | null;
  source: {
    label: string;
    url: string;
    verifiedAt: string;
  };
  builds: BuildVariant[];
  crossChecks: SourceCrossCheck[];
};

const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE = new Map<string, { expiresAt: number; value: BuildPayload }>();
const RATE = new Map<string, { count: number; resetAt: number }>();

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "apikey, authorization, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "public, max-age=300",
  };
}

function reply(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), "Content-Type": "application/json" },
  });
}

function env(name: string) {
  return Deno.env.get(name)?.trim() || undefined;
}

function validProjectKey(req: Request) {
  const supplied = req.headers.get("apikey")?.trim();
  if (!supplied) return false;
  return (
    supplied === PROJECT_PUBLISHABLE_KEY ||
    supplied === env("SUPABASE_ANON_KEY") ||
    supplied === env("SUPABASE_PUBLISHABLE_KEY")
  );
}

function clientIp(req: Request) {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function withinRateLimit(req: Request) {
  const key = clientIp(req);
  const now = Date.now();
  const current = RATE.get(key);
  if (!current || current.resetAt <= now) {
    RATE.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (current.count >= 40) return false;
  current.count += 1;
  return true;
}

function decodeHtml(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim();
}

function stripHtml(value: string) {
  return decodeHtml(
    value
      .replace(/<!--.*?-->/gs, " ")
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " "),
  );
}

async function fetchSourceHtml(url: string, timeoutMs = 7000) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MGProfileGuideBot/1.0; +https://mgprofile.online)",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  const html = await response.text();
  return { response, html };
}

function slugifyChampion(name: string) {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const aliases: Record<string, string> = {
    nunuwillump: "nunu",
    renataglasc: "renata",
  };

  return aliases[normalized] ?? normalized;
}

function headingMarker(label: string) {
  return `>${label}<!`;
}

function section(html: string, label: string, nextLabels: string[]) {
  const start = html.indexOf(headingMarker(label));
  if (start < 0) return "";

  let end = html.length;
  for (const next of nextLabels) {
    const candidate = html.indexOf(headingMarker(next), start + label.length + 3);
    if (candidate >= 0 && candidate < end) end = candidate;
  }
  return html.slice(start, end);
}

function extractItems(html: string): BuildItem[] {
  const rows: BuildItem[] = [];
  const seen = new Set<string>();
  const regex = /<img\b[^>]*(?:src|srcset)="[^"]*item64\/(\d+)\.webp[^"]*"[^>]*alt="([^"]+)"[^>]*>/gi;

  for (const match of html.matchAll(regex)) {
    const id = match[1];
    const name = decodeHtml(match[2]);
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);
    rows.push({ id, name });
  }

  return rows;
}

function uniqueItems(items: BuildItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function buildVariants(html: string): BuildVariant[] {
  const startingItems = extractItems(
    section(html, "Starting Items", ["Core Build", "Item 4"]),
  );
  const core = extractItems(section(html, "Core Build", ["Item 4", "Item 5"]));
  const item4 = extractItems(section(html, "Item 4", ["Item 5", "Item 6"]));
  const item5 = extractItems(section(html, "Item 5", ["Item 6", "Popular"]));
  const item6 = extractItems(section(html, "Item 6", ["Popular", "Items", "Win Rate"]));

  if (!core.length) return [];

  const pick = (rows: BuildItem[], index: number) => rows[index] ?? rows[0];
  const primary = uniqueItems([
    ...core,
    ...(pick(item4, 0) ? [pick(item4, 0)!] : []),
    ...(pick(item5, 0) ? [pick(item5, 0)!] : []),
    ...(pick(item6, 0) ? [pick(item6, 0)!] : []),
  ]).slice(0, 6);

  const alternate = uniqueItems([
    ...core,
    ...(pick(item4, 1) ? [pick(item4, 1)!] : []),
    ...(pick(item5, 1) ? [pick(item5, 1)!] : []),
    ...(pick(item6, 1) ? [pick(item6, 1)!] : []),
  ]).slice(0, 6);

  const variants: BuildVariant[] = [];
  if (primary.length) {
    variants.push({
      id: "primary",
      label: "primary",
      startingItems,
      items: primary,
    });
  }

  if (
    alternate.length &&
    alternate.map((item) => item.id).join(",") !== primary.map((item) => item.id).join(",")
  ) {
    variants.push({
      id: "alternative",
      label: "alternative",
      startingItems,
      items: alternate,
    });
  }

  return variants.slice(0, 2);
}

function pageMeta(html: string) {
  const title = decodeHtml(
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "",
  );
  const description = decodeHtml(
    html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1] ?? "",
  );
  const combined = `${title} ${description}`;

  const patch =
    combined.match(/(?:Patch|LoL Patch)\s+(\d+\.\d+)/i)?.[1] ?? null;
  const role = title.match(/Guide for\s+([a-z]+)\s+/i)?.[1] ?? null;

  return { patch, role };
}

async function fetchBuilds(champion: string): Promise<BuildPayload> {
  const slug = slugifyChampion(champion);
  const sourceUrl = `https://lolalytics.com/lol/${slug}/build/`;
  const response = await fetch(sourceUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MGProfileBuildBot/1.0; +https://mgprofile.online)",
      "Accept-Language": "en-US,en;q=0.9",
    },
    signal: AbortSignal.timeout(14_000),
  });

  if (!response.ok) throw new Error(`BUILD_SOURCE_HTTP_${response.status}`);
  const html = await response.text();
  const meta = pageMeta(html);
  const builds = buildVariants(html);

  return {
    champion,
    slug,
    role: meta.role,
    patch: meta.patch,
    source: {
      label: "LoLalytics",
      url: sourceUrl,
      verifiedAt: new Date().toISOString(),
    },
    builds,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });
  if (req.method !== "POST") return reply({ error: "METHOD_NOT_ALLOWED" }, 405);
  if (!validProjectKey(req)) return reply({ error: "PROJECT_KEY_INVALID" }, 401);
  if (!withinRateLimit(req)) return reply({ error: "RATE_LIMIT" }, 429);

  try {
    const body = await req.json() as { champion?: unknown };
    const champion = typeof body.champion === "string" ? body.champion.trim() : "";
    if (!champion || champion.length > 80) return reply({ error: "INVALID_CHAMPION" }, 400);

    const cacheKey = slugifyChampion(champion);
    const cached = CACHE.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return reply(cached.value);

    const value = await fetchBuilds(champion);
    CACHE.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, value });
    return reply(value);
  } catch (error) {
    console.error("[league-builds]", error instanceof Error ? error.message : String(error));
    return reply({ error: "BUILD_SOURCE_UNAVAILABLE" }, 502);
  }
});
