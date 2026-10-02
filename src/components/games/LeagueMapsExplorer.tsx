import { useEffect, useState } from "react";
import { Map, ShieldCheck } from "lucide-react";
import { DataSourceIndicator } from "@/components/common/DataSourceIndicator";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

const DDRAGON = "https://ddragon.leagueoflegends.com";
const FALLBACK_VERSION = "16.18.1";
const DATA_DRAGON_LOCALE: Record<Locale, string> = { "pt-BR": "pt_BR", en: "en_US", es: "es_ES" };

type LeagueMap = {
  MapName?: string;
  MapId?: string;
  mapName?: string;
  mapId?: string;
  notes?: string;
  image?: { full: string };
};

type MapPayload = { data: Record<string, LeagueMap> };

export function LeagueMapsExplorer({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [version, setVersion] = useState(FALLBACK_VERSION);
  const [maps, setMaps] = useState<Array<[string, LeagueMap]>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        let current = FALLBACK_VERSION;
        try {
          const versionsResponse = await fetch(`${DDRAGON}/api/versions.json`, {
            signal: controller.signal,
          });
          if (versionsResponse.ok) {
            const versions = (await versionsResponse.json()) as string[];
            current = versions[0] || FALLBACK_VERSION;
          }
        } catch (versionError) {
          if (!controller.signal.aborted)
            console.warn("[League] Using fallback Data Dragon version.", versionError);
        }

        const response = await fetch(
          `${DDRAGON}/cdn/${current}/data/${DATA_DRAGON_LOCALE[locale]}/map.json`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`Data Dragon returned ${response.status}`);
        const payload = (await response.json()) as MapPayload;
        setVersion(current);
        setMaps(
          Object.entries(payload.data).sort(([, a], [, b]) =>
            (a.MapName ?? a.mapName ?? "").localeCompare(b.MapName ?? b.mapName ?? ""),
          ),
        );
      } catch (loadError) {
        if (controller.signal.aborted) return;
        console.error("[League] Map collection failed.", loadError);
        setError(
          copy(
            "Não foi possível carregar os mapas oficiais agora.",
            "Official maps could not be loaded right now.",
            "No se pudieron cargar los mapas oficiales en este momento.",
          ),
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [locale]);

  return (
    <section className="space-y-6">
      <div className="surface-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <DataSourceIndicator source="verified" />
          <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Riot Data Dragon · {version}
          </span>
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {copy(
            "Mapas de League of Legends",
            "League of Legends maps",
            "Mapas de League of Legends",
          )}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {copy(
            "Coleção carregada diretamente do Data Dragon para acompanhar os mapas descritos pela Riot no patch atual.",
            "Collection loaded directly from Data Dragon to follow the maps described by Riot in the current patch.",
            "Colección cargada directamente desde Data Dragon para seguir los mapas descritos por Riot en el parche actual.",
          )}
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-2xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {maps.map(([key, map]) => {
            const name = map.MapName ?? map.mapName ?? `Map ${key}`;
            const id = map.MapId ?? map.mapId ?? key;
            return (
              <article
                key={key}
                className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
              >
                <div className="grid min-h-40 place-items-center bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.14),transparent_68%),hsl(var(--muted)/0.22)] p-6">
                  {map.image?.full ? (
                    <img
                      src={`${DDRAGON}/cdn/${version}/img/map/${map.image.full}`}
                      alt=""
                      loading="lazy"
                      className="max-h-32 max-w-full object-contain drop-shadow-xl"
                    />
                  ) : (
                    <Map className="size-12 text-gold-strong" />
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Map ID · {id}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
                    {name}
                  </h3>
                  {map.notes ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{map.notes}</p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="flex gap-3 rounded-2xl border border-border bg-muted/15 p-4 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-strong" />
        <p>
          {copy(
            "Dados e imagens desta seção vêm do Riot Data Dragon. O ÍMPAR é independente e não é endossado pela Riot Games.",
            "Data and images in this section come from Riot Data Dragon. ÍMPAR is independent and is not endorsed by Riot Games.",
            "Los datos e imágenes de esta sección provienen de Riot Data Dragon. ÍMPAR es independiente y no está respaldado por Riot Games.",
          )}
        </p>
      </div>
    </section>
  );
}
