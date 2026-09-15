import { useEffect, useMemo, useRef, useState } from "react";
import { Search, ShieldCheck, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";
import { getValorantAgents, type ValorantAgent } from "@/lib/valorant-content.functions";

export function ValorantAgents({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [agents, setAgents] = useState<ValorantAgent[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    void getValorantAgents({ data: { locale } })
      .then((rows) => {
        if (cancelled) return;
        setAgents(rows);
        setSelectedId((current) => current && rows.some((agent) => agent.uuid === current) ? current : rows[0]?.uuid ?? null);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [locale]);

  const roles = useMemo(
    () => Array.from(new Set(agents.map((agent) => agent.role?.name).filter((value): value is string => Boolean(value)))).sort(),
    [agents],
  );
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return agents.filter((agent) => {
      const matchesRole = role === "all" || agent.role?.name === role;
      const matchesQuery = !term || `${agent.name} ${agent.role?.name ?? ""}`.toLocaleLowerCase().includes(term);
      return matchesRole && matchesQuery;
    });
  }, [agents, query, role]);
  const selected = agents.find((agent) => agent.uuid === selectedId) ?? agents[0];

  const selectAgent = (agent: ValorantAgent) => {
    setSelectedId(agent.uuid);
    requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      detailRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  };

  if (loading) return <CollectionSkeleton label={copy("Carregando agentes…", "Loading agents…", "Cargando agentes…")} />;
  if (error || agents.length === 0) return <ProviderError locale={locale} />;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-tactical/25 bg-[radial-gradient(circle_at_top_right,rgba(255,70,85,0.10),transparent_34%),hsl(var(--surface))] p-6 sm:p-8">
        <div className="flex items-center gap-2 text-tactical">
          <Sparkles className="size-4" />
          <span className="section-kicker">{copy("PROTOCOLO VALORANT", "VALORANT PROTOCOL", "PROTOCOLO VALORANT")}</span>
        </div>
        <h2 className="mt-3 font-display text-3xl font-bold">{copy("Agentes", "Agents", "Agentes")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          {copy(
            "Explore o elenco jogável, entenda a função tática de cada Agente e revise suas habilidades antes de montar uma composição.",
            "Explore the playable roster, understand each Agent's tactical role and review their abilities before building a composition.",
            "Explora el plantel jugable, entiende la función táctica de cada Agente y revisa sus habilidades antes de crear una composición.",
          )}
        </p>
      </header>

      <div className="flex flex-col gap-3 border-y border-border py-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 focus-within:border-tactical/60">
          <Search className="size-4 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-auto border-0 p-0 shadow-none" placeholder={copy("Buscar agente", "Search agent", "Buscar agente")} />
        </label>
        <div className="flex flex-wrap gap-2">
          {["all", ...roles].map((item) => (
            <button key={item} type="button" onClick={() => setRole(item)} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors", role === item ? "border-tactical/50 bg-tactical/10 text-foreground" : "border-border text-muted-foreground hover:border-tactical/30 hover:text-foreground")}>
              {item === "all" ? copy("Todos", "All", "Todos") : item}
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <article ref={detailRef} className="scroll-mt-24 overflow-hidden rounded-2xl border border-tactical/25 bg-surface">
          <div className="grid min-h-[24rem] lg:grid-cols-[0.85fr_1.15fr]">
            <div className="relative min-h-[22rem] overflow-hidden bg-[radial-gradient(circle_at_50%_25%,rgba(255,70,85,0.18),transparent_48%),hsl(var(--muted)/0.35)]">
              {selected.background ? <img src={selected.background} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" /> : null}
              {selected.portrait ? <img src={selected.portrait} alt={selected.name} className="absolute inset-x-0 bottom-0 mx-auto h-[96%] w-auto max-w-full object-contain object-bottom" /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-tactical">{selected.role?.name}</p>
                <h3 className="mt-1 font-display text-4xl font-bold">{selected.name}</h3>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-3">
                {selected.role?.icon ? <img src={selected.role.icon} alt="" className="size-10 rounded-lg bg-muted/40 p-2" /> : <ShieldCheck className="size-8 text-tactical" />}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{copy("Função", "Role", "Rol")}</p>
                  <p className="font-semibold">{selected.role?.name ?? "—"}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">{selected.description}</p>
              {selected.role?.description ? <p className="mt-3 rounded-xl border border-border bg-muted/20 p-4 text-xs leading-6 text-muted-foreground">{selected.role.description}</p> : null}

              <h4 className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{copy("Kit de habilidades", "Ability kit", "Kit de habilidades")}</h4>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {selected.abilities.filter((ability) => ability.name).map((ability, index, abilities) => (
                  <div key={`${ability.slot}-${ability.name}`} className="rounded-xl border border-border bg-muted/15 p-4">
                    <div className="flex items-center gap-3">
                      {ability.icon ? <img src={ability.icon} alt="" className="size-9 rounded-lg bg-background/60 p-1.5" /> : null}
                      <div>
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-tactical">{abilityLabel(ability.slot, index, abilities, locale)}</p>
                        <p className="font-semibold">{ability.name}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">{ability.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((agent) => (
          <button key={agent.uuid} type="button" onClick={() => selectAgent(agent)} className={cn("group overflow-hidden rounded-xl border bg-surface text-left transition-all duration-200 hover:-translate-y-1 hover:border-tactical/40", selected?.uuid === agent.uuid ? "border-tactical/55 ring-1 ring-tactical/20" : "border-border")}>
            <div className="relative aspect-[4/3] overflow-hidden bg-muted/25">
              {agent.portrait ? <img src={agent.portrait} alt={agent.name} loading="lazy" className="h-full w-full object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.04]" /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/45 px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white/80">{agent.role?.name ?? "—"}</span>
            </div>
            <div className="p-3.5">
              <p className="font-display text-lg font-semibold">{agent.name}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{agent.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function abilityLabel(slot: string, index: number, abilities: ValorantAgent["abilities"], locale: Locale) {
  if (slot.toLowerCase().includes("ultimate")) return "Ultimate";
  const basicAbilities = abilities.filter((ability) => !ability.slot.toLowerCase().includes("ultimate"));
  const basicIndex = Math.max(0, basicAbilities.findIndex((ability) => ability === abilities[index]));
  if (locale === "pt-BR") return `Habilidade ${basicIndex + 1}`;
  if (locale === "es") return `Habilidad ${basicIndex + 1}`;
  return `Ability ${basicIndex + 1}`;
}

function CollectionSkeleton({ label }: { label: string }) {
  return <div className="surface-panel rounded-2xl p-10 text-center text-sm text-muted-foreground">{label}</div>;
}

function ProviderError({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  return (
    <div className="surface-panel rounded-2xl p-8 text-center">
      <p className="font-display text-xl font-semibold">{copy("Não foi possível carregar a coleção agora.", "The collection could not be loaded right now.", "No se pudo cargar la colección ahora.")}</p>
      <p className="mt-2 text-sm text-muted-foreground">{copy("O MGP mantém a interface disponível e tenta novamente quando você recarregar a página.", "MGP keeps the interface available and retries when you reload the page.", "MGP mantiene la interfaz disponible y vuelve a intentarlo al recargar la página.")}</p>
    </div>
  );
}
