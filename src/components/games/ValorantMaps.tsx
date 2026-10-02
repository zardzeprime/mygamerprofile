import { useEffect, useMemo, useRef, useState } from "react";
import { Crosshair, MapPinned, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";
import { getValorantMaps, type ValorantMap } from "@/lib/valorant-content.functions";

const STANDARD_MAPS = new Set([
  "Abyss", "Ascent", "Bind", "Breeze", "Corrode", "Fracture", "Haven", "Icebox", "Lotus", "Pearl", "Split", "Summit", "Sunset",
]);

const COMPETITIVE_ROTATION_13_04 = new Set(["Abyss", "Ascent", "Haven", "Lotus", "Split", "Summit", "Sunset"]);

type Filter = "all" | "competitive";

export function ValorantMaps({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [maps, setMaps] = useState<ValorantMap[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("competitive");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    void getValorantMaps({ data: { locale } })
      .then((rows) => {
        if (cancelled) return;
        const standard = rows.filter((map) => STANDARD_MAPS.has(map.name));
        setMaps(standard);
        setSelectedId((current) => current && standard.some((map) => map.uuid === current) ? current : standard.find((map) => COMPETITIVE_ROTATION_13_04.has(map.name))?.uuid ?? standard[0]?.uuid ?? null);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [locale]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return maps.filter((map) => {
      const rotation = filter === "all" || COMPETITIVE_ROTATION_13_04.has(map.name);
      const search = !term || `${map.name} ${map.tacticalDescription ?? ""} ${map.narrativeDescription ?? ""}`.toLocaleLowerCase().includes(term);
      return rotation && search;
    });
  }, [filter, maps, query]);
  const selected = maps.find((map) => map.uuid === selectedId) ?? filtered[0] ?? maps[0];

  const selectMap = (map: ValorantMap) => {
    setSelectedId(map.uuid);
    requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      detailRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  };

  if (loading) return <StateCard text={copy("Carregando mapas…", "Loading maps…", "Cargando mapas…")} />;
  if (error || maps.length === 0) return <StateCard text={copy("Não foi possível carregar os mapas agora.", "Maps could not be loaded right now.", "No se pudieron cargar los mapas ahora.")} />;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-gold/25 bg-[radial-gradient(circle_at_top_right,rgba(255,70,85,0.10),transparent_34%),hsl(var(--surface))] p-6 sm:p-8">
        <div className="flex items-center gap-2 text-gold-strong"><MapPinned className="size-4" /><span className="section-kicker">{copy("CAMPO DE BATALHA", "BATTLEFIELD", "CAMPO DE BATALLA")}</span></div>
        <h2 className="mt-3 font-display text-3xl font-bold">{copy("Mapas", "Maps", "Mapas")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          {copy("Conheça a identidade tática de cada mapa, veja o minimapa e acompanhe a rotação competitiva atual do ÍMPAR.", "Learn each map's tactical identity, inspect its minimap and track the current competitive rotation in ÍMPAR.", "Conoce la identidad táctica de cada mapa, revisa el minimapa y sigue la rotación competitiva actual en ÍMPAR.")}
        </p>
        <div className="mt-4 inline-flex rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          {copy("Rotação competitiva atual · Atualização 13.04", "Current competitive rotation · Patch 13.04", "Rotación competitiva actual · versión 13.04")}
        </div>
      </header>

      <div className="flex flex-col gap-3 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 focus-within:border-gold/60">
          <Search className="size-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-auto border-0 p-0 shadow-none" placeholder={copy("Buscar mapa", "Search map", "Buscar mapa")} />
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setFilter("competitive")} className={filterClass(filter === "competitive")}>{copy("Competitivo", "Competitive", "Competitivo")}</button>
          <button type="button" onClick={() => setFilter("all")} className={filterClass(filter === "all")}>{copy("Todos", "All", "Todos")}</button>
        </div>
      </div>

      {selected ? (
        <article ref={detailRef} className="scroll-mt-24 overflow-hidden rounded-2xl border border-gold/25 bg-surface">
          <div className="relative min-h-[22rem] overflow-hidden">
            {selected.splash ? <img src={selected.splash} alt={selected.name} className="absolute inset-0 h-full w-full object-cover" /> : null}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/20" />
            <div className="relative grid min-h-[22rem] items-end gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_17rem]">
              <div className="max-w-2xl text-white">
                <div className="flex flex-wrap gap-2">
                  {COMPETITIVE_ROTATION_13_04.has(selected.name) ? <span className="rounded-full border border-emerald-300/30 bg-emerald-500/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-emerald-200">{copy("Rotação competitiva", "Competitive rotation", "Rotación competitiva")}</span> : null}
                  {selected.coordinates ? <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[0.65rem] font-semibold text-white/70">{selected.coordinates}</span> : null}
                </div>
                <h3 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{selected.name}</h3>
                {selected.tacticalDescription ? <p className="mt-3 text-sm font-semibold leading-6 text-white/85">{selected.tacticalDescription}</p> : null}
                {selected.narrativeDescription ? <p className="mt-3 text-sm leading-7 text-white/65">{selected.narrativeDescription}</p> : null}
              </div>
              {selected.minimap ? <div className="rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur-sm"><img src={selected.minimap} alt={`${selected.name} minimap`} className="aspect-square w-full object-contain opacity-90" /></div> : null}
            </div>
          </div>
        </article>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((map) => (
          <button key={map.uuid} type="button" onClick={() => selectMap(map)} className={cn("group overflow-hidden rounded-xl border bg-surface text-left transition-all hover:-translate-y-1 hover:border-gold/40", selected?.uuid === map.uuid ? "border-gold/55 ring-1 ring-gold/20" : "border-border")}>
            <div className="relative aspect-video overflow-hidden bg-muted/30">
              {map.splash ? <img src={map.splash} alt={map.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              {COMPETITIVE_ROTATION_13_04.has(map.name) ? <span className="absolute right-3 top-3 grid size-7 place-items-center rounded-full border border-white/15 bg-black/45 text-emerald-300" title={copy("Na rotação competitiva", "In competitive rotation", "En la rotación competitiva")}><Crosshair className="size-3.5" /></span> : null}
              <h3 className="absolute bottom-3 left-3 font-display text-2xl font-semibold text-white">{map.name}</h3>
            </div>
            <div className="p-4"><p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{map.tacticalDescription ?? map.narrativeDescription ?? copy("Mapa padrão do VALORANT.", "Standard VALORANT map.", "Mapa estándar de VALORANT.")}</p></div>
          </button>
        ))}
      </div>
    </div>
  );
}

function filterClass(active: boolean) {
  return cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors", active ? "border-gold/50 bg-gold/10 text-foreground" : "border-border text-muted-foreground hover:border-gold/30 hover:text-foreground");
}

function StateCard({ text }: { text: string }) {
  return <div className="surface-panel rounded-2xl p-10 text-center text-sm text-muted-foreground">{text}</div>;
}
