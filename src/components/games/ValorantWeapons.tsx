import { useEffect, useMemo, useRef, useState } from "react";
import { Crosshair, Search, ShieldAlert, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";
import { getValorantWeapons, type ValorantWeapon } from "@/lib/valorant-content.functions";

const CATEGORY_ORDER = ["Sidearms", "SMGs", "Shotguns", "Rifles", "Sniper Rifles", "Machine Guns", "Melee"];

export function ValorantWeapons({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [weapons, setWeapons] = useState<ValorantWeapon[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    void getValorantWeapons({ data: { locale } })
      .then((rows) => {
        if (cancelled) return;
        setWeapons(rows);
        setSelectedId((current) => current && rows.some((weapon) => weapon.uuid === current) ? current : rows.find((weapon) => weapon.name === "Vandal")?.uuid ?? rows[0]?.uuid ?? null);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [locale]);

  const categories = useMemo(() => {
    const available = Array.from(new Set(weapons.map((weapon) => weapon.category)));
    return available.sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b);
    });
  }, [weapons]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return weapons.filter((weapon) => (category === "all" || weapon.category === category) && (!term || weapon.name.toLocaleLowerCase().includes(term)));
  }, [category, query, weapons]);
  const selected = weapons.find((weapon) => weapon.uuid === selectedId) ?? filtered[0] ?? weapons[0];

  const selectWeapon = (weapon: ValorantWeapon) => {
    setSelectedId(weapon.uuid);
    requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      detailRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  };

  if (loading) return <StateCard text={copy("Carregando arsenal…", "Loading arsenal…", "Cargando arsenal…")} />;
  if (error || weapons.length === 0) return <StateCard text={copy("Não foi possível carregar o arsenal agora.", "The arsenal could not be loaded right now.", "No se pudo cargar el arsenal ahora.")} />;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-tactical/25 bg-[radial-gradient(circle_at_top_right,rgba(255,70,85,0.10),transparent_34%),hsl(var(--surface))] p-6 sm:p-8">
        <div className="flex items-center gap-2 text-tactical"><Crosshair className="size-4" /><span className="section-kicker">{copy("ARSENAL", "ARSENAL", "ARSENAL")}</span></div>
        <h2 className="mt-3 font-display text-3xl font-bold">{copy("Armas", "Weapons", "Armas")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          {copy("Compare preço, cadência, pente, penetração de parede e dano por distância. Os valores são uma fotografia dos dados atuais do jogo e podem mudar com patches.", "Compare price, fire rate, magazine size, wall penetration and range-based damage. Values are a snapshot of current game data and can change with patches.", "Compara precio, cadencia, cargador, penetración de paredes y daño por distancia. Los valores son una fotografía de los datos actuales y pueden cambiar con parches.")}
        </p>
      </header>

      <div className="flex flex-col gap-3 border-y border-border py-4 xl:flex-row xl:items-center xl:justify-between">
        <label className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 focus-within:border-tactical/60">
          <Search className="size-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-auto border-0 p-0 shadow-none" placeholder={copy("Buscar arma", "Search weapon", "Buscar arma")} />
        </label>
        <div className="flex flex-wrap gap-2">
          {["all", ...categories].map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={filterClass(category === item)}>{item === "all" ? copy("Todas", "All", "Todas") : translateCategory(item, locale)}</button>)}
        </div>
      </div>

      {selected ? (
        <article ref={detailRef} className="scroll-mt-24 overflow-hidden rounded-2xl border border-tactical/25 bg-surface">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex min-h-[20rem] flex-col justify-between bg-[radial-gradient(circle_at_center,rgba(255,70,85,0.12),transparent_55%),hsl(var(--muted)/0.2)] p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full border border-tactical/25 bg-tactical/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-tactical">{translateCategory(selected.category, locale)}</span>
                <span className="font-display text-lg font-bold text-muted-foreground">{selected.cost != null ? `${selected.cost.toLocaleString()} ¤` : "—"}</span>
              </div>
              {selected.icon ? <img src={selected.icon} alt={selected.name} className="my-8 h-32 w-full object-contain drop-shadow-2xl sm:h-40" /> : null}
              <h3 className="font-display text-4xl font-bold">{selected.name}</h3>
            </div>
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label={copy("Cadência", "Fire rate", "Cadencia")} value={selected.fireRate != null ? `${selected.fireRate}/s` : "—"} icon={Zap} />
                <Stat label={copy("Pente", "Magazine", "Cargador")} value={selected.magazineSize?.toString() ?? "—"} icon={Crosshair} />
                <Stat label={copy("Recarga", "Reload", "Recarga")} value={selected.reloadTime != null ? `${selected.reloadTime}s` : "—"} icon={Zap} />
                <Stat label={copy("Penetração", "Penetration", "Penetración")} value={translatePenetration(selected.wallPenetration, locale)} icon={ShieldAlert} />
              </div>

              <div className="mt-7">
                <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{copy("Dano por distância", "Damage by range", "Daño por distancia")}</p><p className="mt-1 text-xs text-muted-foreground">{copy("Cabeça · corpo · pernas", "Head · body · legs", "Cabeza · cuerpo · piernas")}</p></div></div>
                {selected.damageRanges.length ? (
                  <div className="mt-3 overflow-hidden rounded-xl border border-border">
                    <div className="grid grid-cols-4 bg-muted/30 px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted-foreground"><span>{copy("Distância", "Range", "Distancia")}</span><span className="text-right">{copy("Cabeça", "Head", "Cabeza")}</span><span className="text-right">{copy("Corpo", "Body", "Cuerpo")}</span><span className="text-right">{copy("Pernas", "Legs", "Piernas")}</span></div>
                    {selected.damageRanges.map((range) => <div key={`${range.start}-${range.end}`} className="grid grid-cols-4 border-t border-border px-4 py-3 text-sm"><span className="font-semibold">{range.start}–{range.end}m</span><span className="text-right font-display font-bold text-tactical">{formatDamage(range.head)}</span><span className="text-right font-semibold">{formatDamage(range.body)}</span><span className="text-right text-muted-foreground">{formatDamage(range.legs)}</span></div>)}
                  </div>
                ) : <p className="mt-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">{copy("Esta arma não usa uma tabela convencional de dano balístico.", "This weapon does not use a conventional ballistic damage table.", "Esta arma no usa una tabla convencional de daño balístico.")}</p>}
              </div>
            </div>
          </div>
        </article>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((weapon) => <button key={weapon.uuid} type="button" onClick={() => selectWeapon(weapon)} className={cn("group rounded-xl border bg-surface p-4 text-left transition-all hover:-translate-y-1 hover:border-tactical/40", selected?.uuid === weapon.uuid ? "border-tactical/55 ring-1 ring-tactical/20" : "border-border")}><div className="flex items-center justify-between gap-3"><span className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">{translateCategory(weapon.category, locale)}</span><span className="text-xs font-semibold text-muted-foreground">{weapon.cost != null ? weapon.cost.toLocaleString() : "—"}</span></div>{weapon.icon ? <img src={weapon.icon} alt={weapon.name} loading="lazy" className="my-5 h-20 w-full object-contain transition-transform duration-300 group-hover:scale-105" /> : <div className="my-5 h-20" />}<p className="font-display text-xl font-semibold">{weapon.name}</p><p className="mt-1 text-xs text-muted-foreground">{weapon.magazineSize != null ? `${copy("Pente", "Magazine", "Cargador")}: ${weapon.magazineSize}` : copy("Corpo a corpo", "Melee", "Cuerpo a cuerpo")}</p></button>)}
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Zap }) {
  return <div className="rounded-xl border border-border bg-muted/15 p-3"><Icon className="size-4 text-tactical" /><p className="mt-3 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>;
}

function filterClass(active: boolean) {
  return cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors", active ? "border-tactical/50 bg-tactical/10 text-foreground" : "border-border text-muted-foreground hover:border-tactical/30 hover:text-foreground");
}

function translateCategory(category: string, locale: Locale) {
  const values: Record<string, [string, string, string]> = {
    Sidearms: ["Armas leves", "Sidearms", "Armas de mano"],
    SMGs: ["Submetralhadoras", "SMGs", "Subfusiles"],
    Shotguns: ["Escopetas", "Shotguns", "Escopetas"],
    Rifles: ["Fuzis", "Rifles", "Rifles"],
    "Sniper Rifles": ["Fuzis de precisão", "Sniper Rifles", "Francotiradores"],
    "Machine Guns": ["Metralhadoras", "Machine Guns", "Ametralladoras"],
    Melee: ["Corpo a corpo", "Melee", "Cuerpo a cuerpo"],
  };
  const row = values[category];
  if (!row) return category;
  return locale === "pt-BR" ? row[0] : locale === "es" ? row[2] : row[1];
}

function translatePenetration(value: string | null, locale: Locale) {
  if (!value) return "—";
  const normalized = value.toLowerCase();
  if (normalized.includes("high")) return locale === "pt-BR" ? "Alta" : locale === "es" ? "Alta" : "High";
  if (normalized.includes("medium")) return locale === "pt-BR" ? "Média" : locale === "es" ? "Media" : "Medium";
  if (normalized.includes("low")) return locale === "pt-BR" ? "Baixa" : locale === "es" ? "Baja" : "Low";
  return value;
}

function formatDamage(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function StateCard({ text }: { text: string }) {
  return <div className="surface-panel rounded-2xl p-10 text-center text-sm text-muted-foreground">{text}</div>;
}
