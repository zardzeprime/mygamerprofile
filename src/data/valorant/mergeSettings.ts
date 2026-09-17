import type { EsportsSource, ProPlayerSettings } from "./types";

type Entry = { settings: ProPlayerSettings; source: EsportsSource };

/** Newer observations win; input order resolves same-day conflicts per field. */
export function mergeSettings(...layers: Record<string, Entry>[]) {
  const result: Record<string, { settings: ProPlayerSettings; sources: EsportsSource[] }> = {};
  for (const handle of new Set(layers.flatMap((layer) => Object.keys(layer)))) {
    const entries = layers.flatMap((layer) => layer[handle] ? [layer[handle]] : [])
      .sort((a, b) => a.source.verifiedAt.localeCompare(b.source.verifiedAt));
    const settings: ProPlayerSettings = {};
    const provenance = new Map<string, EsportsSource>();
    for (const entry of entries) {
      for (const [key, value] of Object.entries(entry.settings)) {
        if (value === undefined || value === null || value === "") continue;
        Object.assign(settings, { [key]: value });
        provenance.set(key, entry.source);
      }
    }
    if (settings.dpi !== undefined && settings.sensitivity !== undefined) {
      settings.edpi = Math.round(settings.dpi * settings.sensitivity * 1000) / 1000;
      provenance.delete("edpi");
    }
    result[handle] = { settings, sources: [...new Map([...provenance.values()].map((source) => [source.url, source])).values()] };
  }
  return result;
}
