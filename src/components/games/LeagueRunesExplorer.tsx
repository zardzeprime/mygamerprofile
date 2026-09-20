import { BookOpen, Loader2, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import {
  LEAGUE_DDRAGON,
  LEAGUE_STAT_SHARDS,
  leagueRuneIcon,
  loadLeagueRuneStyles,
  stripLeagueMarkup,
  type LeagueRuneStyle,
} from "@/lib/league-runes";
import { cn } from "@/lib/utils";

const FALLBACK_VERSION = "16.17.1";

export function LeagueRunesExplorer({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [version, setVersion] = useState(FALLBACK_VERSION);
  const [styles, setStyles] = useState<LeagueRuneStyle[]>([]);
  const [activeStyleId, setActiveStyleId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch(`${LEAGUE_DDRAGON}/api/versions.json`)
      .then((response) => response.json() as Promise<string[]>)
      .then((versions) => {
        if (active && versions[0]) setVersion(versions[0]);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);

    void loadLeagueRuneStyles(version, locale)
      .then((nextStyles) => {
        if (!active) return;
        setStyles(nextStyles);
        setActiveStyleId((current) =>
          nextStyles.some((style) => style.id === current)
            ? current
            : nextStyles[0]?.id ?? null,
        );
      })
      .catch((error) => {
        console.warn("[LeagueRunesExplorer] Data Dragon load failed", error);
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [locale, version]);

  const activeStyle =
    styles.find((style) => style.id === activeStyleId) ?? styles[0] ?? null;
  const normalizedQuery = query.trim().toLowerCase();

  const filteredSlots = useMemo(() => {
    if (!activeStyle) return [];
    return activeStyle.slots
      .map((slot, slotIndex) => ({
        slotIndex,
        runes: slot.runes.filter((rune) => {
          if (!normalizedQuery) return true;
          return `${rune.name} ${stripLeagueMarkup(rune.shortDesc)} ${stripLeagueMarkup(rune.longDesc)}`
            .toLowerCase()
            .includes(normalizedQuery);
        }),
      }))
      .filter((slot) => slot.runes.length > 0);
  }, [activeStyle, normalizedQuery]);

  return (
    <div className="space-y-6">
      <section className="surface-panel overflow-hidden">
        <div className="border-b border-border bg-[radial-gradient(circle_at_top_right,hsl(var(--gold)/0.11),transparent_48%)] p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-gold-strong">
              <Sparkles className="size-4" />
              <span className="section-kicker">RUNE COMPENDIUM</span>
            </span>
            <span className="rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Riot Data Dragon · {version}
            </span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
            {copy("Runas de League of Legends", "League of Legends runes", "Runas de League of Legends")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy(
              "Explore as árvores, runas essenciais e opções menores diretamente dos dados estáticos oficiais do jogo. A mesma estrutura é usada no criador de builds do MGP.",
              "Explore rune trees, keystones and minor options directly from the game's official static data. The MGP build creator uses this same structure.",
              "Explora los árboles, runas clave y opciones menores directamente desde los datos estáticos oficiales del juego. El creador de builds de MGP usa esta misma estructura.",
            )}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-gold/50">
            <Search className="size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              placeholder={copy(
                "Buscar runa ou efeito…",
                "Search rune or effect…",
                "Buscar runa o efecto…",
              )}
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            {styles.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setActiveStyleId(style.id)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-bold transition-colors",
                  style.id === activeStyle?.id
                    ? "border-gold/50 bg-gold/10 text-foreground"
                    : "border-border bg-muted/10 text-muted-foreground hover:text-foreground",
                )}
              >
                <img src={leagueRuneIcon(style.icon)} alt="" className="size-6 object-contain" />
                {style.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <section className="surface-panel p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-gold-strong" />
            {copy("Carregando runas…", "Loading runes…", "Cargando runas…")}
          </div>
        </section>
      ) : failed || !activeStyle ? (
        <section className="surface-panel p-6 text-sm text-muted-foreground">
          {copy(
            "Não foi possível carregar as runas do Data Dragon agora.",
            "Could not load Data Dragon runes right now.",
            "No se pudieron cargar las runas de Data Dragon ahora.",
          )}
        </section>
      ) : (
        <section className="surface-panel overflow-hidden">
          <div className="border-b border-border p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="grid size-16 shrink-0 place-items-center rounded-2xl border border-border bg-muted/10">
                <img src={leagueRuneIcon(activeStyle.icon)} alt="" className="size-11 object-contain" />
              </div>
              <div>
                <p className="section-kicker">{activeStyle.key}</p>
                <h3 className="mt-1 font-display text-2xl font-bold text-foreground">
                  {activeStyle.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeStyle.slots.reduce((total, slot) => total + slot.runes.length, 0)}{" "}
                  {copy("runas nesta árvore", "runes in this tree", "runas en este árbol")}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            {filteredSlots.length ? (
              filteredSlots.map(({ slotIndex, runes }) => (
                <div key={slotIndex}>
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-gold-strong" />
                    <h4 className="text-sm font-bold text-foreground">
                      {slotIndex === 0
                        ? copy("Runas essenciais", "Keystones", "Runas clave")
                        : copy(`Linha ${slotIndex}`, `Row ${slotIndex}`, `Fila ${slotIndex}`)}
                    </h4>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {runes.map((rune) => (
                      <article
                        key={rune.id}
                        className="rounded-2xl border border-border bg-muted/10 p-4 transition hover:-translate-y-0.5 hover:border-gold/25"
                      >
                        <div className="flex items-start gap-3">
                          <div className="grid size-12 shrink-0 place-items-center rounded-full border border-border bg-black/20">
                            <img
                              src={leagueRuneIcon(rune.icon)}
                              alt=""
                              loading="lazy"
                              className="size-10 object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground">{rune.name}</p>
                            {slotIndex === 0 ? (
                              <span className="mt-1 inline-flex rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.08em] text-gold-strong">
                                {copy("Essencial", "Keystone", "Clave")}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-muted-foreground">
                          {stripLeagueMarkup(rune.longDesc || rune.shortDesc)}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                {copy(
                  "Nenhuma runa corresponde à busca nesta árvore.",
                  "No rune in this tree matches your search.",
                  "Ninguna runa de este árbol coincide con la búsqueda.",
                )}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="surface-panel p-5 sm:p-6">
        <p className="section-kicker">{copy("FRAGMENTOS", "STAT SHARDS", "FRAGMENTOS")}</p>
        <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
          {copy("Fragmentos de atributos", "Stat shards", "Fragmentos de atributos")}
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {copy(
            "Além das duas árvores, cada página escolhe um fragmento em cada uma das três linhas. Eles também ficam disponíveis no criador de builds.",
            "In addition to the two trees, every page chooses one shard from each of three rows. They are also available in the build creator.",
            "Además de los dos árboles, cada página elige un fragmento en cada una de las tres filas. También están disponibles en el creador de builds.",
          )}
        </p>
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {LEAGUE_STAT_SHARDS.map((row, rowIndex) => (
            <div key={rowIndex} className="rounded-2xl border border-border bg-muted/10 p-4">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
                {copy(`Linha ${rowIndex + 1}`, `Row ${rowIndex + 1}`, `Fila ${rowIndex + 1}`)}
              </p>
              <div className="mt-3 space-y-2">
                {row.map((option) => (
                  <div key={option.key} className="rounded-xl border border-border bg-background/45 p-3">
                    <p className="text-xs font-bold text-foreground">{option.name[locale]}</p>
                    <p className="mt-1 text-[0.68rem] leading-4 text-muted-foreground">
                      {option.description[locale]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
