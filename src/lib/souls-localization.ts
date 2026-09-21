import type { Locale } from "@/i18n";
import type { SoulsCompendiumEntry } from "@/lib/souls-compendium";
import { translateNexusSoulsCopy } from "@/lib/nexus.functions";

const CACHE_PREFIX = "mgp:souls-copy:v1:";
const memoryCache = new Map<string, string>();

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function cacheKey(entry: SoulsCompendiumEntry, locale: Locale) {
  return [
    CACHE_PREFIX,
    locale,
    entry.game,
    entry.category,
    entry.id,
    hashText(entry.description),
  ].join(":");
}

function readLocal(key: string) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Memory cache still prevents duplicate translation work in this session.
  }
}

export async function localizeSoulsDescription(
  entry: SoulsCompendiumEntry,
  locale: Locale,
): Promise<string> {
  const source = entry.description.trim();
  if (!source || locale === "en") return source;

  const key = cacheKey(entry, locale);
  const memory = memoryCache.get(key);
  if (memory) return memory;

  const stored = readLocal(key);
  if (stored) {
    memoryCache.set(key, stored);
    return stored;
  }

  const response = await translateNexusSoulsCopy({
    data: { locale, text: source },
  });
  const translated = response.text?.trim();
  if (!translated) throw new Error("SOULS_TRANSLATION_EMPTY");

  memoryCache.set(key, translated);
  writeLocal(key, translated);
  return translated;
}
