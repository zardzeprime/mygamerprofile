const FALLBACK_PROJECT_PUBLISHABLE_KEY =
  "sb_publishable_JXVaM-rr7Yu59l3x7WyHEg_qlR-uDMX";

function env(name: string) {
  return Deno.env.get(name)?.trim() || undefined;
}

function parseNamedPublishableKeys() {
  const raw = env("SUPABASE_PUBLISHABLE_KEYS");
  if (!raw) return [] as string[];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];
    return Object.values(parsed as Record<string, unknown>)
      .filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
      .map((value) => value.trim());
  } catch {
    console.warn("[NEXUS] could not parse SUPABASE_PUBLISHABLE_KEYS");
    return [];
  }
}

export function projectPublishableKeys() {
  return [
    ...new Set(
      [
        ...parseNamedPublishableKeys(),
        env("SUPABASE_PUBLISHABLE_KEY"),
        env("SUPABASE_ANON_KEY"),
        FALLBACK_PROJECT_PUBLISHABLE_KEY,
      ].filter((value): value is string => Boolean(value)),
    ),
  ];
}

export function isProjectPublishableKey(value: string | null | undefined) {
  const normalized = value?.trim();
  return Boolean(normalized && projectPublishableKeys().includes(normalized));
}

export function preferredProjectPublishableKey() {
  return projectPublishableKeys()[0];
}
