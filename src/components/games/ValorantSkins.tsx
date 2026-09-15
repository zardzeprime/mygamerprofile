import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Coins, Layers3, Palette, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";
import {
  getValorantSkins,
  type ValorantSkin,
  type ValorantSkinWeapon,
} from "@/lib/valorant-content.functions";

const WHEEL_SLOTS = 8;

export function ValorantSkins({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [weapons, setWeapons] = useState<ValorantSkinWeapon[]>([]);
  const [weaponId, setWeaponId] = useState<string | null>(null);
  const [skinId, setSkinId] = useState<string | null>(null);
  const [chromaId, setChromaId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    void getValorantSkins({ data: { locale } })
      .then((rows) => {
        if (cancelled) return;
        setWeapons(rows);
        const preferred = rows.find((weapon) => weapon.name === "Vandal") ?? rows[0];
        setWeaponId(preferred?.uuid ?? null);
        setSkinId(preferred?.skins[0]?.uuid ?? null);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [locale]);

  const filteredWeapons = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return weapons.filter((weapon) => !term || weapon.name.toLocaleLowerCase().includes(term));
  }, [query, weapons]);

  const selectedWeapon = weapons.find((weapon) => weapon.uuid === weaponId) ?? weapons[0];
  const selectedSkin = selectedWeapon?.skins.find((skin) => skin.uuid === skinId) ?? selectedWeapon?.skins[0];
  const selectedIndex = selectedWeapon && selectedSkin ? selectedWeapon.skins.findIndex((skin) => skin.uuid === selectedSkin.uuid) : 0;
  const selectedChroma = selectedSkin?.chromas.find((chroma) => chroma.uuid === chromaId) ?? selectedSkin?.chromas[0];
  const preview = selectedChroma?.fullRender ?? selectedSkin?.icon ?? selectedWeapon?.icon ?? null;
  const wheelItems = useMemo(
    () => selectedWeapon ? getWheelItems(selectedWeapon.skins, selectedIndex, WHEEL_SLOTS) : [],
    [selectedIndex, selectedWeapon],
  );

  const chooseWeapon = (weapon: ValorantSkinWeapon) => {
    setWeaponId(weapon.uuid);
    setSkinId(weapon.skins[0]?.uuid ?? null);
    setChromaId(null);
    requestAnimationFrame(() => wheelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const chooseSkin = (skin: ValorantSkin) => {
    setSkinId(skin.uuid);
    setChromaId(null);
  };

  const rotate = (direction: -1 | 1) => {
    if (!selectedWeapon?.skins.length || !selectedSkin) return;
    const current = selectedWeapon.skins.findIndex((skin) => skin.uuid === selectedSkin.uuid);
    const next = (current + direction + selectedWeapon.skins.length) % selectedWeapon.skins.length;
    chooseSkin(selectedWeapon.skins[next]);
  };

  if (loading) return <StateCard text={copy("Carregando coleção de skins…", "Loading skin collection…", "Cargando colección de skins…")} />;
  if (error || weapons.length === 0) return <StateCard text={copy("Não foi possível carregar as skins agora.", "Skins could not be loaded right now.", "No se pudieron cargar las skins ahora.")} />;

  return (
    <div className="space-y-7">
      <header className="rounded-2xl border border-tactical/25 bg-[radial-gradient(circle_at_top_right,rgba(255,70,85,0.12),transparent_34%),hsl(var(--surface))] p-6 sm:p-8">
        <div className="flex items-center gap-2 text-tactical"><Sparkles className="size-4" /><span className="section-kicker">{copy("COLEÇÃO", "COLLECTION", "COLECCIÓN")}</span></div>
        <h2 className="mt-3 font-display text-3xl font-bold">{copy("Skins", "Skins", "Skins")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          {copy(
            "Escolha uma arma e gire a coleção para comparar skins, raridade, variantes, níveis e uma referência de preço em VP. A estrutura já preserva os previews de animação disponíveis para uma etapa futura.",
            "Choose a weapon and rotate through its collection to compare skins, rarity, variants, levels and a VP price reference. The structure already preserves available animation previews for a future step.",
            "Elige un arma y gira su colección para comparar skins, rareza, variantes, niveles y una referencia de precio en VP. La estructura ya conserva las vistas previas de animación disponibles para una etapa futura.",
          )}
        </p>
      </header>

      <div className="flex flex-col gap-3 border-y border-border py-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 focus-within:border-tactical/60">
          <Search className="size-4 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-auto border-0 p-0 shadow-none" placeholder={copy("Buscar arma", "Search weapon", "Buscar arma")} />
        </label>
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {copy(`${weapons.length} armas com skins`, `${weapons.length} weapons with skins`, `${weapons.length} armas con skins`)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {filteredWeapons.map((weapon) => (
          <button
            key={weapon.uuid}
            type="button"
            onClick={() => chooseWeapon(weapon)}
            className={cn(
              "group rounded-xl border bg-surface p-4 text-left transition-all hover:-translate-y-1 hover:border-tactical/40",
              selectedWeapon?.uuid === weapon.uuid ? "border-tactical/55 ring-1 ring-tactical/20" : "border-border",
            )}
          >
            <div className="flex h-24 items-center justify-center rounded-lg bg-muted/20 p-3">
              {weapon.icon ? <img src={weapon.icon} alt={weapon.name} loading="lazy" className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" /> : null}
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div><p className="font-display text-lg font-semibold">{weapon.name}</p><p className="mt-1 text-xs text-muted-foreground">{weapon.skins.length} skins</p></div>
              {weapon.isMelee ? <span className="rounded-full border border-tactical/20 px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-tactical">Melee</span> : null}
            </div>
          </button>
        ))}
      </div>

      {selectedWeapon && selectedSkin ? (
        <section ref={wheelRef} className="scroll-mt-24 overflow-hidden rounded-2xl border border-tactical/25 bg-surface">
          <div className="border-b border-border px-5 py-4 sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-tactical">{selectedWeapon.name}</p><h3 className="mt-1 font-display text-2xl font-semibold">{selectedSkin.name}</h3></div>
              <div className="text-right"><p className="text-xs text-muted-foreground">{selectedIndex + 1} / {selectedWeapon.skins.length}</p><p className="mt-1 text-xs font-semibold text-muted-foreground">{selectedSkin.rarity ?? copy("Sem tier", "No tier", "Sin tier")}</p></div>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[minmax(0,1.35fr)_24rem]">
            <div className="relative min-h-[34rem] overflow-hidden bg-[radial-gradient(circle_at_center,rgba(255,70,85,0.10),transparent_48%),linear-gradient(180deg,hsl(var(--muted)/0.16),transparent)] p-4 sm:p-7">
              <div
                className="relative mx-auto hidden h-[31rem] max-w-[46rem] md:block"
                onWheel={(event) => {
                  event.preventDefault();
                  rotate(event.deltaY > 0 ? 1 : -1);
                }}
              >
                {wheelItems.map(({ skin, position }, index) => {
                  const angle = (index / wheelItems.length) * Math.PI * 2 - Math.PI / 2;
                  const left = 50 + Math.cos(angle) * 42;
                  const top = 50 + Math.sin(angle) * 38;
                  return (
                    <button
                      key={`${skin.uuid}-${position}`}
                      type="button"
                      onClick={() => chooseSkin(skin)}
                      style={{ left: `${left}%`, top: `${top}%` }}
                      className={cn(
                        "absolute z-20 w-28 -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background/90 p-2 text-left shadow-lg backdrop-blur transition-all duration-300 hover:z-30 hover:scale-110 hover:border-tactical/50",
                        skin.uuid === selectedSkin.uuid ? "border-tactical/60 ring-2 ring-tactical/20" : "border-border/80",
                      )}
                    >
                      <div className="flex h-16 items-center justify-center">{skin.icon ? <img src={skin.icon} alt="" className="max-h-full max-w-full object-contain" /> : null}</div>
                      <p className="mt-1 truncate text-[0.62rem] font-semibold" title={skin.name}>{skin.name}</p>
                    </button>
                  );
                })}

                <div className="absolute left-1/2 top-1/2 z-10 flex h-64 w-[22rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[2rem] border border-tactical/20 bg-background/80 p-5 shadow-2xl backdrop-blur-xl">
                  {preview ? <img src={preview} alt={selectedSkin.name} className="h-36 w-full object-contain drop-shadow-2xl" /> : null}
                  <p className="mt-3 max-w-full truncate font-display text-xl font-bold">{selectedSkin.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{selectedSkin.rarity ?? "—"}</p>
                </div>
              </div>

              <div className="md:hidden">
                <div className="flex min-h-64 items-center justify-center rounded-2xl border border-tactical/20 bg-background/70 p-5">
                  {preview ? <img src={preview} alt={selectedSkin.name} className="max-h-52 w-full object-contain" /> : null}
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                  {selectedWeapon.skins.map((skin) => <button key={skin.uuid} type="button" onClick={() => chooseSkin(skin)} className={cn("w-28 shrink-0 rounded-xl border bg-background/70 p-2", skin.uuid === selectedSkin.uuid ? "border-tactical/60" : "border-border")}><div className="h-14">{skin.icon ? <img src={skin.icon} alt="" className="h-full w-full object-contain" /> : null}</div><p className="mt-1 truncate text-[0.62rem] font-semibold">{skin.name}</p></button>)}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-center gap-3">
                <button type="button" onClick={() => rotate(-1)} className="grid size-10 place-items-center rounded-full border border-border bg-background/80 transition-colors hover:border-tactical/45 hover:text-tactical" aria-label={copy("Skin anterior", "Previous skin", "Skin anterior")}><ChevronLeft className="size-5" /></button>
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{copy("Role para girar", "Scroll to rotate", "Desplaza para girar")}</span>
                <button type="button" onClick={() => rotate(1)} className="grid size-10 place-items-center rounded-full border border-border bg-background/80 transition-colors hover:border-tactical/45 hover:text-tactical" aria-label={copy("Próxima skin", "Next skin", "Siguiente skin")}><ChevronRight className="size-5" /></button>
              </div>
            </div>

            <aside className="border-t border-border p-5 sm:p-7 xl:border-l xl:border-t-0">
              <SkinInfo skin={selectedSkin} weapon={selectedWeapon} locale={locale} />
              <div className="mt-6">
                <div className="flex items-center gap-2"><Palette className="size-4 text-tactical" /><p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{copy("Variantes", "Variants", "Variantes")}</p></div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSkin.chromas.map((chroma, index) => (
                    <button
                      key={chroma.uuid}
                      type="button"
                      onClick={() => setChromaId(chroma.uuid)}
                      title={chroma.name}
                      className={cn("grid size-10 place-items-center overflow-hidden rounded-full border bg-muted/20 p-1 transition-all", selectedChroma?.uuid === chroma.uuid ? "border-tactical/70 ring-2 ring-tactical/20" : "border-border hover:border-tactical/35")}
                    >
                      {chroma.swatch ? <img src={chroma.swatch} alt="" className="h-full w-full rounded-full object-cover" /> : chroma.fullRender ? <img src={chroma.fullRender} alt="" className="h-full w-full object-contain" /> : <span className="text-xs font-bold">{index + 1}</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-2"><Layers3 className="size-4 text-tactical" /><p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{copy("Níveis de evolução", "Upgrade levels", "Niveles de mejora")}</p></div>
                <div className="mt-3 space-y-2">
                  {selectedSkin.levels.map((level, index) => (
                    <div key={level.uuid} className="rounded-xl border border-border bg-muted/15 px-3 py-2.5">
                      <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold">Lv. {index + 1}</span><span className="truncate text-[0.68rem] text-muted-foreground">{level.item ?? level.name}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SkinInfo({ skin, weapon, locale }: { skin: ValorantSkin; weapon: ValorantSkinWeapon; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const upgradeRp = Math.max(0, skin.levels.length - 1) * 10;
  const variantRp = Math.max(0, skin.chromas.length - 1) * 15;
  const totalRp = upgradeRp + variantRp;
  const animationCount = skin.levels.filter((level) => level.streamedVideo).length + skin.chromas.filter((chroma) => chroma.streamedVideo).length;

  return (
    <div>
      <div className="flex items-center gap-3">
        {skin.rarityIcon ? <img src={skin.rarityIcon} alt="" className="size-9 rounded-lg bg-muted/25 p-1.5" /> : <Sparkles className="size-7 text-tactical" />}
        <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">{copy("Raridade", "Edition", "Rareza")}</p><p className="font-semibold">{skin.rarity ?? "—"}</p></div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <InfoBox icon={Coins} label="VP" value={skin.referenceVp != null ? `${skin.referenceVp.toLocaleString()} VP` : "—"} />
        <InfoBox icon={Sparkles} label="RP" value={totalRp ? `~${totalRp} RP` : "0 RP"} />
      </div>

      <p className="mt-3 text-[0.68rem] leading-5 text-muted-foreground">
        {copy(
          `VP é uma referência pela edição${weapon.isMelee ? " para melee" : ""}; coleções limitadas, Battle Pass e linhas especiais podem ter preço diferente ou não ter venda individual. RP usa o padrão comum de 10 por nível e 15 por variante; exceções existem.`,
          `VP is an edition-based reference${weapon.isMelee ? " for melee" : ""}; limited collections, Battle Pass items and special lines can use a different price or have no individual sale. RP uses the common 10-per-level and 15-per-variant pattern; exceptions exist.`,
          `VP es una referencia basada en la edición${weapon.isMelee ? " para melee" : ""}; colecciones limitadas, Pase de Batalla y líneas especiales pueden tener otro precio o no venderse por separado. RP usa el patrón común de 10 por nivel y 15 por variante; existen excepciones.`,
        )}
      </p>

      <div className="mt-5 rounded-xl border border-border bg-muted/15 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">{copy("Para upar tudo", "To fully upgrade", "Para mejorar todo")}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs"><div><p className="text-muted-foreground">{copy("Níveis extras", "Extra levels", "Niveles extra")}</p><p className="mt-1 font-semibold">{Math.max(0, skin.levels.length - 1)} · ~{upgradeRp} RP</p></div><div><p className="text-muted-foreground">{copy("Variantes extras", "Extra variants", "Variantes extra")}</p><p className="mt-1 font-semibold">{Math.max(0, skin.chromas.length - 1)} · ~{variantRp} RP</p></div></div>
      </div>

      {animationCount ? <p className="mt-4 text-xs font-semibold text-tactical">{copy(`${animationCount} preview(s) de animação detectado(s) — reservado para a próxima etapa.`, `${animationCount} animation preview(s) detected — reserved for the next step.`, `${animationCount} vista(s) previa(s) de animación detectada(s) — reservadas para la siguiente etapa.`)}</p> : null}
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }: { icon: typeof Coins; label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-muted/15 p-3"><Icon className="size-4 text-tactical" /><p className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</p><p className="mt-1 font-display text-lg font-bold">{value}</p></div>;
}

function getWheelItems(skins: ValorantSkin[], selectedIndex: number, slots: number) {
  if (!skins.length) return [];
  const count = Math.min(slots, skins.length);
  const half = Math.floor(count / 2);
  return Array.from({ length: count }, (_, position) => {
    const raw = selectedIndex + position - half;
    const index = (raw + skins.length * 10) % skins.length;
    return { skin: skins[index], position };
  });
}

function StateCard({ text }: { text: string }) {
  return <div className="surface-panel rounded-2xl p-10 text-center text-sm text-muted-foreground">{text}</div>;
}
