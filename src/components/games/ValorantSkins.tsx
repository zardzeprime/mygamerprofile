import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Coins,
  Layers3,
  Palette,
  Play,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { MinimalVideoPlayer } from "@/components/common/MinimalMediaPlayer";
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

type PreviewClip = {
  id: string;
  label: string;
  url: string;
};

export function ValorantSkins({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [weapons, setWeapons] = useState<ValorantSkinWeapon[]>([]);
  const [weaponId, setWeaponId] = useState<string | null>(null);
  const [skinId, setSkinId] = useState<string | null>(null);
  const [chromaId, setChromaId] = useState<string | null>(null);
  const [weaponQuery, setWeaponQuery] = useState("");
  const [skinQuery, setSkinQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const wheelRef = useRef<HTMLElement>(null);
  const wheelInteractionRef = useRef<HTMLDivElement>(null);
  const wheelAccumulatorRef = useRef(0);
  const lastWheelStepRef = useRef(0);

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
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const filteredWeapons = useMemo(() => {
    const term = weaponQuery.trim().toLocaleLowerCase();
    return weapons.filter((weapon) => !term || weapon.name.toLocaleLowerCase().includes(term));
  }, [weaponQuery, weapons]);

  const selectedWeapon = weapons.find((weapon) => weapon.uuid === weaponId) ?? weapons[0];
  const skinPool = useMemo(() => {
    if (!selectedWeapon) return [];
    const term = skinQuery.trim().toLocaleLowerCase();
    return selectedWeapon.skins.filter((skin) => !term || skin.name.toLocaleLowerCase().includes(term));
  }, [selectedWeapon, skinQuery]);
  const selectedSkin = selectedWeapon?.skins.find((skin) => skin.uuid === skinId) ?? skinPool[0] ?? selectedWeapon?.skins[0];
  const selectedPoolIndex = selectedSkin ? skinPool.findIndex((skin) => skin.uuid === selectedSkin.uuid) : -1;
  const selectedChroma = selectedSkin?.chromas.find((chroma) => chroma.uuid === chromaId) ?? selectedSkin?.chromas[0];
  const previewImage = selectedChroma?.fullRender ?? selectedSkin?.icon ?? selectedWeapon?.icon ?? null;
  const previewClips = useMemo(() => (selectedSkin ? getSkinPreviewClips(selectedSkin) : []), [selectedSkin]);
  const wheelItems = useMemo(
    () => selectedSkin && selectedPoolIndex >= 0 ? getWheelItems(skinPool, selectedPoolIndex, WHEEL_SLOTS) : [],
    [selectedPoolIndex, selectedSkin, skinPool],
  );

  useEffect(() => {
    if (!skinPool.length) return;
    if (skinId && skinPool.some((skin) => skin.uuid === skinId)) return;
    setSkinId(skinPool[0]?.uuid ?? null);
    setChromaId(null);
  }, [skinId, skinPool]);

  useEffect(() => {
    setPreviewIndex(0);
    setPreviewOpen(false);
  }, [selectedSkin?.uuid]);

  const chooseWeapon = (weapon: ValorantSkinWeapon) => {
    setWeaponId(weapon.uuid);
    setSkinId(weapon.skins[0]?.uuid ?? null);
    setChromaId(null);
    setSkinQuery("");
    setPreviewOpen(false);
    requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      wheelRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  };

  const chooseSkin = useCallback((skin: ValorantSkin) => {
    setSkinId(skin.uuid);
    setChromaId(null);
  }, []);

  const rotate = useCallback(
    (direction: -1 | 1) => {
      if (!skinPool.length) return;
      const current = selectedSkin ? skinPool.findIndex((skin) => skin.uuid === selectedSkin.uuid) : -1;
      const safeCurrent = current >= 0 ? current : 0;
      const next = (safeCurrent + direction + skinPool.length) % skinPool.length;
      const nextSkin = skinPool[next];
      if (nextSkin) chooseSkin(nextSkin);
    },
    [chooseSkin, selectedSkin, skinPool],
  );

  useEffect(() => {
    const node = wheelInteractionRef.current;
    if (!node) return;

    const handleWheel = (event: WheelEvent) => {
      if (!node.matches(":hover")) return;
      event.preventDefault();
      event.stopPropagation();
      if (skinPool.length <= 1) return;

      wheelAccumulatorRef.current += event.deltaY || event.deltaX;
      const now = performance.now();
      if (Math.abs(wheelAccumulatorRef.current) < 22 || now - lastWheelStepRef.current < 90) return;

      const direction = wheelAccumulatorRef.current > 0 ? 1 : -1;
      wheelAccumulatorRef.current = 0;
      lastWheelStepRef.current = now;
      rotate(direction);
    };

    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => node.removeEventListener("wheel", handleWheel);
  }, [rotate, skinPool.length]);

  if (loading) return <StateCard text={copy("Carregando coleção de skins…", "Loading skin collection…", "Cargando colección de skins…")} />;
  if (error || weapons.length === 0) return <StateCard text={copy("Não foi possível carregar as skins agora.", "Skins could not be loaded right now.", "No se pudieron cargar las skins ahora.")} />;

  return (
    <div className="space-y-7">
      <header className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-tactical/25 bg-[radial-gradient(circle_at_top_right,rgba(255,70,85,0.12),transparent_34%),hsl(var(--surface))] p-6 duration-500 sm:p-8">
        <div className="flex items-center gap-2 text-tactical"><Sparkles className="size-4" /><span className="section-kicker">{copy("COLEÇÃO", "COLLECTION", "COLECCIÓN")}</span></div>
        <h2 className="mt-3 font-display text-3xl font-bold">{copy("Skins", "Skins", "Skins")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          {copy(
            "Explore armas, skins, variantes, níveis de evolução e previews disponíveis.",
            "Explore weapons, skins, variants, upgrade levels and available previews.",
            "Explora armas, skins, variantes, niveles de mejora y previews disponibles.",
          )}
        </p>
      </header>

      <div className="flex flex-col gap-3 border-y border-border py-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 transition-colors focus-within:border-tactical/60">
          <Search className="size-4 text-muted-foreground" />
          <Input value={weaponQuery} onChange={(event) => setWeaponQuery(event.target.value)} className="h-auto border-0 p-0 shadow-none" placeholder={copy("Buscar arma", "Search weapon", "Buscar arma")} />
        </label>
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {copy(`${weapons.length} armas com skins`, `${weapons.length} weapons with skins`, `${weapons.length} armas con skins`)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {filteredWeapons.map((weapon, index) => (
          <button
            key={weapon.uuid}
            type="button"
            onClick={() => chooseWeapon(weapon)}
            style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
            className={cn(
              "group animate-in fade-in slide-in-from-bottom-2 rounded-xl border bg-surface p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-tactical/40 hover:shadow-lift",
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
        <section ref={wheelRef} className="scroll-mt-24 overflow-hidden rounded-2xl border border-tactical/25 bg-surface shadow-soft">
          <div className="border-b border-border px-5 py-4 sm:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-tactical">{selectedWeapon.name}</p>
                <h3 className="mt-1 font-display text-2xl font-semibold">{selectedSkin.name}</h3>
              </div>
              <div className="flex w-full max-w-xl items-center gap-3 lg:justify-end">
                <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-background/65 px-3 py-2 transition-colors focus-within:border-tactical/55">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    value={skinQuery}
                    onChange={(event) => setSkinQuery(event.target.value)}
                    className="h-auto border-0 p-0 shadow-none"
                    placeholder={copy(`Buscar skin de ${selectedWeapon.name}`, `Search ${selectedWeapon.name} skin`, `Buscar skin de ${selectedWeapon.name}`)}
                  />
                </label>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">{selectedPoolIndex >= 0 ? selectedPoolIndex + 1 : 0} / {skinPool.length}</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">{selectedSkin.rarity ?? copy("Sem tier", "No tier", "Sin tier")}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[minmax(0,1.35fr)_24rem]">
            <div className="relative min-h-[37rem] overflow-hidden bg-[radial-gradient(circle_at_center,rgba(255,70,85,0.11),transparent_45%),linear-gradient(180deg,hsl(var(--muted)/0.16),transparent)] p-4 sm:p-7">
              {skinPool.length ? (
                <div
                  ref={wheelInteractionRef}
                  onPointerLeave={() => {
                    wheelAccumulatorRef.current = 0;
                  }}
                  className="relative mx-auto hidden h-[34rem] max-w-[54rem] select-none overflow-hidden rounded-[2.5rem] border border-tactical/15 bg-tactical/[0.018] shadow-[inset_0_0_90px_rgba(80,150,255,0.025)] md:block"
                  style={{ overscrollBehavior: "contain" }}
                >
                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-tactical/10" />
                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-[18rem] w-[63%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-tactical/10" />

                  {wheelItems.map(({ skin, offset }, index) => {
                    const angle = (index / Math.max(1, wheelItems.length)) * Math.PI * 2 - Math.PI / 2;
                    const left = 50 + Math.cos(angle) * 44;
                    const top = 50 + Math.sin(angle) * 39;
                    const distance = Math.min(4, Math.abs(offset));
                    const scale = 1 - distance * 0.045;
                    const opacity = 0.94 - distance * 0.08;
                    return (
                      <button
                        key={skin.uuid}
                        type="button"
                        onClick={() => chooseSkin(skin)}
                        style={{ left: `${left}%`, top: `${top}%`, opacity }}
                        className="absolute z-20 w-20 -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-75 rounded-xl border border-border/70 bg-background/82 p-1.5 text-left shadow-md backdrop-blur-md transition-[left,top,opacity,border-color,box-shadow] duration-500 ease-[cubic-bezier(.2,.9,.2,1)] hover:z-30 hover:border-tactical/55 hover:opacity-100 hover:shadow-lift motion-reduce:transition-none"
                      >
                        <div style={{ transform: `scale(${scale})` }} className="transition-transform duration-500 ease-[cubic-bezier(.2,.9,.2,1)] group-hover:scale-105">
                          <div className="flex h-11 items-center justify-center">{skin.icon ? <img src={skin.icon} alt="" className="max-h-full max-w-full object-contain" /> : null}</div>
                          <p className="mt-1 truncate text-[0.54rem] font-semibold" title={skin.name}>{skin.name}</p>
                        </div>
                      </button>
                    );
                  })}

                  <div key={selectedSkin.uuid} className="absolute left-1/2 top-1/2 z-10 flex h-72 w-[25rem] -translate-x-1/2 -translate-y-1/2 animate-in flex-col items-center justify-center rounded-[2.25rem] border border-tactical/30 bg-background/90 p-6 shadow-2xl backdrop-blur-xl fade-in zoom-in-95 duration-300">
                    {previewImage ? <img key={`${selectedSkin.uuid}-${selectedChroma?.uuid ?? "base"}`} src={previewImage} alt={selectedSkin.name} className="h-40 w-full animate-in object-contain drop-shadow-2xl fade-in zoom-in-95 duration-300" /> : null}
                    <p className="mt-4 max-w-full truncate font-display text-2xl font-bold">{selectedSkin.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{selectedSkin.rarity ?? "—"}</p>
                    {previewClips.length ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewIndex(0);
                          setPreviewOpen(true);
                        }}
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-tactical/35 bg-tactical/10 px-4 py-2 text-xs font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-tactical/60 hover:bg-tactical/15"
                      >
                        <Play className="size-3.5 fill-current text-tactical" />
                        {copy("Ver preview", "Watch preview", "Ver preview")}
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="hidden min-h-[32rem] items-center justify-center text-center md:flex">
                  <p className="max-w-sm text-sm leading-6 text-muted-foreground">{copy("Nenhuma skin corresponde à sua busca.", "No skin matches your search.", "Ninguna skin coincide con tu búsqueda.")}</p>
                </div>
              )}

              <div className="md:hidden">
                <div className="flex min-h-64 items-center justify-center rounded-2xl border border-tactical/20 bg-background/70 p-5">
                  {previewImage ? <img key={`${selectedSkin.uuid}-mobile`} src={previewImage} alt={selectedSkin.name} className="max-h-52 w-full animate-in object-contain fade-in zoom-in-95 duration-300" /> : null}
                </div>
                {previewClips.length ? (
                  <button type="button" onClick={() => setPreviewOpen(true)} className="mx-auto mt-3 flex items-center gap-2 rounded-full border border-tactical/30 bg-tactical/10 px-4 py-2 text-xs font-bold">
                    <Play className="size-3.5 fill-current text-tactical" />{copy("Ver preview", "Watch preview", "Ver preview")}
                  </button>
                ) : null}
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                  {skinPool.map((skin) => (
                    <button key={skin.uuid} type="button" onClick={() => chooseSkin(skin)} className={cn("w-28 shrink-0 rounded-xl border bg-background/70 p-2 transition-all duration-200 active:scale-95", skin.uuid === selectedSkin.uuid ? "scale-[1.02] border-tactical/60 shadow-md" : "border-border")}>
                      <div className="h-14">{skin.icon ? <img src={skin.icon} alt="" className="h-full w-full object-contain" /> : null}</div><p className="mt-1 truncate text-[0.62rem] font-semibold">{skin.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-center gap-3">
                <button type="button" onClick={() => rotate(-1)} disabled={skinPool.length <= 1} className="grid size-10 place-items-center rounded-full border border-border bg-background/80 transition-all hover:-translate-x-0.5 hover:border-tactical/45 hover:text-tactical disabled:opacity-40" aria-label={copy("Skin anterior", "Previous skin", "Skin anterior")}><ChevronLeft className="size-5" /></button>
                <span className="min-w-14 text-center text-xs font-semibold tabular-nums text-muted-foreground">{selectedPoolIndex >= 0 ? selectedPoolIndex + 1 : 0}/{skinPool.length}</span>
                <button type="button" onClick={() => rotate(1)} disabled={skinPool.length <= 1} className="grid size-10 place-items-center rounded-full border border-border bg-background/80 transition-all hover:translate-x-0.5 hover:border-tactical/45 hover:text-tactical disabled:opacity-40" aria-label={copy("Próxima skin", "Next skin", "Siguiente skin")}><ChevronRight className="size-5" /></button>
              </div>
            </div>

            <aside className="border-t border-border p-5 sm:p-7 xl:border-l xl:border-t-0">
              <SkinInfo skin={selectedSkin} weapon={selectedWeapon} locale={locale} previewCount={previewClips.length} onPreview={() => setPreviewOpen(true)} />
              <div className="mt-6">
                <div className="flex items-center gap-2"><Palette className="size-4 text-tactical" /><p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{copy("Variantes", "Variants", "Variantes")}</p></div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSkin.chromas.map((chroma, index) => (
                    <button
                      key={chroma.uuid}
                      type="button"
                      onClick={() => setChromaId(chroma.uuid)}
                      title={chroma.name}
                      className={cn("grid size-10 place-items-center overflow-hidden rounded-full border bg-muted/20 p-1 transition-all hover:scale-105", selectedChroma?.uuid === chroma.uuid ? "border-tactical/70 ring-2 ring-tactical/20" : "border-border hover:border-tactical/35")}
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
                    <div key={level.uuid} className="rounded-xl border border-border bg-muted/15 px-3 py-2.5 transition-colors hover:bg-muted/25">
                      <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold">Lv. {index + 1}</span><span className="truncate text-[0.68rem] text-muted-foreground">{level.item ?? level.name}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      ) : null}

      {previewOpen && selectedSkin && previewClips.length ? (
        <SkinPreviewModal
          skin={selectedSkin}
          clips={previewClips}
          activeIndex={Math.min(previewIndex, previewClips.length - 1)}
          onIndex={setPreviewIndex}
          onClose={() => setPreviewOpen(false)}
          locale={locale}
        />
      ) : null}
    </div>
  );
}

function SkinPreviewModal({
  skin,
  clips,
  activeIndex,
  onIndex,
  onClose,
  locale,
}: {
  skin: ValorantSkin;
  clips: PreviewClip[];
  activeIndex: number;
  onIndex: (index: number) => void;
  onClose: () => void;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const active = clips[activeIndex] ?? clips[0];

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onIndex((activeIndex + 1) % clips.length);
      if (event.key === "ArrowLeft") onIndex((activeIndex - 1 + clips.length) % clips.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, clips.length, onClose, onIndex]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-black/75 p-3 backdrop-blur-md animate-in fade-in duration-200 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${skin.name} preview`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[94dvh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-white/15 bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-250">
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0"><p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-tactical">{copy("PREVIEW DE SKIN", "SKIN PREVIEW", "PREVIEW DE SKIN")}</p><h3 className="mt-1 truncate font-display text-lg font-semibold sm:text-xl">{skin.name}</h3></div>
          <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full border border-border transition-all hover:rotate-90 hover:border-tactical/45 hover:text-tactical" aria-label={copy("Fechar preview", "Close preview", "Cerrar preview")}><X className="size-4" /></button>
        </div>
        <MinimalVideoPlayer key={active.url} src={active.url} locale={locale} autoPlay className="aspect-video w-full" />
        <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="truncate text-sm font-semibold text-foreground">{active.label}</p>
          <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {clips.map((clip, index) => (
              <button key={clip.id} type="button" onClick={() => onIndex(index)} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all", index === activeIndex ? "border-tactical/55 bg-tactical/10 text-foreground" : "border-border text-muted-foreground hover:border-tactical/30 hover:text-foreground")}>{index + 1}. {clip.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkinInfo({
  skin,
  weapon,
  locale,
  previewCount,
  onPreview,
}: {
  skin: ValorantSkin;
  weapon: ValorantSkinWeapon;
  locale: Locale;
  previewCount: number;
  onPreview: () => void;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const upgradeRp = Math.max(0, skin.levels.length - 1) * 10;
  const variantRp = Math.max(0, skin.chromas.length - 1) * 15;
  const totalRp = upgradeRp + variantRp;

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

      {previewCount ? (
        <button type="button" onClick={onPreview} className="mt-4 flex w-full items-center justify-between rounded-xl border border-tactical/25 bg-tactical/[0.06] px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-tactical/50 hover:bg-tactical/10">
          <span><span className="block text-xs font-bold uppercase tracking-[0.1em] text-tactical">{copy("Preview disponível", "Preview available", "Preview disponible")}</span><span className="mt-1 block text-xs text-muted-foreground">{copy(`${previewCount} clipe(s) detectado(s)`, `${previewCount} clip(s) detected`, `${previewCount} clip(s) detectado(s)`)}</span></span>
          <Play className="size-4 fill-current text-tactical" />
        </button>
      ) : null}
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }: { icon: typeof Coins; label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-muted/15 p-3"><Icon className="size-4 text-tactical" /><p className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</p><p className="mt-1 font-display text-lg font-bold">{value}</p></div>;
}

function getSkinPreviewClips(skin: ValorantSkin): PreviewClip[] {
  const clips: PreviewClip[] = [];
  const seen = new Set<string>();
  skin.levels.forEach((level, index) => {
    if (!level.streamedVideo || seen.has(level.streamedVideo)) return;
    seen.add(level.streamedVideo);
    clips.push({ id: `level-${level.uuid}`, label: level.item ?? `Level ${index + 1}`, url: level.streamedVideo });
  });
  skin.chromas.forEach((chroma, index) => {
    if (!chroma.streamedVideo || seen.has(chroma.streamedVideo)) return;
    seen.add(chroma.streamedVideo);
    clips.push({ id: `chroma-${chroma.uuid}`, label: chroma.name || `Variant ${index + 1}`, url: chroma.streamedVideo });
  });
  return clips;
}

function getWheelItems(skins: ValorantSkin[], selectedIndex: number, slots: number): Array<{ skin: ValorantSkin; offset: number }> {
  if (skins.length <= 1 || selectedIndex < 0) return [];
  const count = Math.min(slots, skins.length - 1);
  const offsets: number[] = [];
  for (let distance = 1; offsets.length < count; distance += 1) {
    offsets.push(-distance);
    if (offsets.length < count) offsets.push(distance);
  }
  offsets.sort((left, right) => left - right);
  return offsets.flatMap((offset) => {
    const index = (selectedIndex + offset + skins.length * 10) % skins.length;
    const skin = skins[index];
    return skin ? [{ skin, offset }] : [];
  });
}

function StateCard({ text }: { text: string }) {
  return <div className="surface-panel rounded-2xl p-10 text-center text-sm text-muted-foreground">{text}</div>;
}
