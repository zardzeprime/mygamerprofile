import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Coins,
  ExternalLink,
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
  kind: "level" | "variant";
  ordinal: number;
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
    return selectedWeapon.skins.filter(
      (skin) => !term || skin.name.toLocaleLowerCase().includes(term),
    );
  }, [selectedWeapon, skinQuery]);
  const selectedSkin =
    selectedWeapon?.skins.find((skin) => skin.uuid === skinId) ??
    skinPool[0] ??
    selectedWeapon?.skins[0];
  const selectedPoolIndex = selectedSkin
    ? skinPool.findIndex((skin) => skin.uuid === selectedSkin.uuid)
    : -1;
  const selectedChroma =
    selectedSkin?.chromas.find((chroma) => chroma.uuid === chromaId) ?? selectedSkin?.chromas[0];
  const previewImage =
    selectedChroma?.fullRender ?? selectedSkin?.icon ?? selectedWeapon?.icon ?? null;
  const previewClips = useMemo(
    () => (selectedSkin ? getSkinPreviewClips(selectedSkin) : []),
    [selectedSkin],
  );
  const wheelItems = useMemo(
    () =>
      selectedSkin && selectedPoolIndex >= 0
        ? getWheelItems(skinPool, selectedPoolIndex, WHEEL_SLOTS)
        : [],
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
      wheelRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  const chooseSkin = useCallback((skin: ValorantSkin) => {
    setSkinId(skin.uuid);
    setChromaId(null);
  }, []);

  const rotate = useCallback(
    (direction: -1 | 1) => {
      if (!skinPool.length) return;
      const current = selectedSkin
        ? skinPool.findIndex((skin) => skin.uuid === selectedSkin.uuid)
        : -1;
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

  if (loading)
    return (
      <StateCard
        text={copy(
          "Carregando coleção de skins…",
          "Loading skin collection…",
          "Cargando colección de skins…",
        )}
      />
    );
  if (error || weapons.length === 0)
    return (
      <StateCard
        text={copy(
          "Não foi possível carregar as skins agora.",
          "Skins could not be loaded right now.",
          "No se pudieron cargar las skins ahora.",
        )}
      />
    );

  return (
    <div className="space-y-7">
      <header className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-gold/25 bg-[radial-gradient(circle_at_top_right,rgba(255,70,85,0.12),transparent_34%),hsl(var(--surface))] p-6 duration-500 sm:p-8">
        <div className="flex items-center gap-2 text-gold-strong">
          <Sparkles className="size-4" />
          <span className="section-kicker">{copy("COLEÇÃO", "COLLECTION", "COLECCIÓN")}</span>
        </div>
        <h2 className="mt-3 font-display text-3xl font-bold">{copy("Skins", "Skins", "Skins")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          {copy(
            "Explore armas, skins, variantes, níveis de evolução e previews disponíveis.",
            "Explore weapons, skins, variants, upgrade levels and available previews.",
            "Explora armas, skins, variantes, niveles de mejora y previews disponibles.",
          )}
        </p>
      </header>

      <a
        href="https://www.youtube.com/watch?v=PoogGcJjsFU"
        target="_blank"
        rel="noreferrer"
        className="group flex flex-col justify-between gap-3 rounded-2xl border border-gold/20 bg-gold/[0.035] p-4 transition-colors hover:border-gold/40 sm:flex-row sm:items-center sm:px-5"
      >
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.12em] text-gold-strong">
            {copy(
              "Destaque oficial · Ato V",
              "Official spotlight · Act V",
              "Destacado oficial · Acto V",
            )}
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-foreground">Aeris</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {copy(
              "A linha Aeris segue em destaque oficial na Temporada 26: Ato V. O catálogo abaixo continua sendo carregado dinamicamente para incorporar novas skins e variantes conforme os dados ficam disponíveis.",
              "Aeris remains Riot's official Season 26: Act V spotlight. The catalog below stays data-driven so new skins and variants can appear as provider data becomes available.",
              "Aeris sigue como destaque oficial de la Temporada 26: Acto V. El catálogo se carga de forma dinámica para incorporar nuevas skins y variantes cuando los datos estén disponibles.",
            )}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-gold-strong">
          {copy("Trailer oficial", "Official trailer", "Tráiler oficial")}
          <ExternalLink className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </a>

      <div className="flex flex-col gap-3 border-y border-border py-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 transition-colors focus-within:border-gold/60">
          <Search className="size-4 text-muted-foreground" />
          <Input
            value={weaponQuery}
            onChange={(event) => setWeaponQuery(event.target.value)}
            className="h-auto border-0 p-0 shadow-none"
            placeholder={copy("Buscar arma", "Search weapon", "Buscar arma")}
          />
        </label>
        <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {copy(
            `${weapons.length} armas com skins`,
            `${weapons.length} weapons with skins`,
            `${weapons.length} armas con skins`,
          )}
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
              "group animate-in fade-in slide-in-from-bottom-2 rounded-xl border bg-surface p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-lift",
              selectedWeapon?.uuid === weapon.uuid
                ? "border-gold/55 ring-1 ring-gold/20"
                : "border-border",
            )}
          >
            <div className="flex h-24 items-center justify-center rounded-lg bg-muted/20 p-3">
              {weapon.icon ? (
                <img
                  src={weapon.icon}
                  alt={weapon.name}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : null}
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold">{weapon.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{weapon.skins.length} skins</p>
              </div>
              {weapon.isMelee ? (
                <span className="rounded-full border border-gold/20 px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.08em] text-gold-strong">
                  Melee
                </span>
              ) : null}
            </div>
          </button>
        ))}
      </div>

      {selectedWeapon && selectedSkin ? (
        <section
          ref={wheelRef}
          className="scroll-mt-24 overflow-hidden rounded-2xl border border-gold/25 bg-surface shadow-soft"
        >
          <div className="border-b border-border px-5 py-4 sm:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-gold-strong">
                  {selectedWeapon.name}
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold">{selectedSkin.name}</h3>
              </div>
              <div className="flex w-full max-w-xl items-center gap-3 lg:justify-end">
                <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-background/65 px-3 py-2 transition-colors focus-within:border-gold/55">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    value={skinQuery}
                    onChange={(event) => setSkinQuery(event.target.value)}
                    className="h-auto border-0 p-0 shadow-none"
                    placeholder={copy(
                      `Buscar skin de ${selectedWeapon.name}`,
                      `Search ${selectedWeapon.name} skin`,
                      `Buscar skin de ${selectedWeapon.name}`,
                    )}
                  />
                </label>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-muted-foreground">
                    {selectedPoolIndex >= 0 ? selectedPoolIndex + 1 : 0} / {skinPool.length}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">
                    {selectedSkin.rarity ?? copy("Sem tier", "No tier", "Sin tier")}
                  </p>
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
                  className="relative mx-auto hidden h-[34rem] max-w-[54rem] select-none overflow-hidden rounded-[2.5rem] border border-gold/15 bg-gold/[0.018] shadow-[inset_0_0_90px_rgba(201,169,93,0.04)] md:block"
                  style={{ overscrollBehavior: "contain" }}
                >
                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-gold/10" />
                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-[18rem] w-[63%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-gold/10" />

                  {wheelItems.map(({ skin, offset }, index) => {
                    const angle =
                      (index / Math.max(1, wheelItems.length)) * Math.PI * 2 - Math.PI / 2;
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
                        className="absolute z-20 w-20 -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-75 rounded-xl border border-border/70 bg-background/82 p-1.5 text-left shadow-md backdrop-blur-md transition-[left,top,opacity,border-color,box-shadow] duration-500 ease-[cubic-bezier(.2,.9,.2,1)] hover:z-30 hover:border-gold/55 hover:opacity-100 hover:shadow-lift motion-reduce:transition-none"
                      >
                        <div
                          style={{ transform: `scale(${scale})` }}
                          className="transition-transform duration-500 ease-[cubic-bezier(.2,.9,.2,1)] group-hover:scale-105"
                        >
                          <div className="flex h-11 items-center justify-center">
                            {skin.icon ? (
                              <img
                                src={skin.icon}
                                alt=""
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : null}
                          </div>
                          <p
                            className="mt-1 truncate text-[0.54rem] font-semibold"
                            title={skin.name}
                          >
                            {skin.name}
                          </p>
                        </div>
                      </button>
                    );
                  })}

                  <div
                    key={selectedSkin.uuid}
                    className="absolute left-1/2 top-1/2 z-10 flex h-72 w-[25rem] -translate-x-1/2 -translate-y-1/2 animate-in flex-col items-center justify-center rounded-[2.25rem] border border-gold/30 bg-background/90 p-6 shadow-2xl backdrop-blur-xl fade-in zoom-in-95 duration-300"
                  >
                    {previewImage ? (
                      <img
                        key={`${selectedSkin.uuid}-${selectedChroma?.uuid ?? "base"}`}
                        src={previewImage}
                        alt={selectedSkin.name}
                        className="h-40 w-full animate-in object-contain drop-shadow-2xl fade-in zoom-in-95 duration-300"
                      />
                    ) : null}
                    <p className="mt-4 max-w-full truncate font-display text-2xl font-bold">
                      {selectedSkin.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedSkin.rarity ?? "—"}
                    </p>
                    {previewClips.length ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewIndex(0);
                          setPreviewOpen(true);
                        }}
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-4 py-2 text-xs font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-gold/60 hover:bg-gold/15"
                      >
                        <Play className="size-3.5 fill-current text-gold-strong" />
                        {copy("Ver preview", "Watch preview", "Ver preview")}
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="hidden min-h-[32rem] items-center justify-center text-center md:flex">
                  <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                    {copy(
                      "Nenhuma skin corresponde à sua busca.",
                      "No skin matches your search.",
                      "Ninguna skin coincide con tu búsqueda.",
                    )}
                  </p>
                </div>
              )}

              <div className="md:hidden">
                <div className="flex min-h-64 items-center justify-center rounded-2xl border border-gold/20 bg-background/70 p-5">
                  {previewImage ? (
                    <img
                      key={`${selectedSkin.uuid}-mobile`}
                      src={previewImage}
                      alt={selectedSkin.name}
                      className="max-h-52 w-full animate-in object-contain fade-in zoom-in-95 duration-300"
                    />
                  ) : null}
                </div>
                {previewClips.length ? (
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="mx-auto mt-3 flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-bold"
                  >
                    <Play className="size-3.5 fill-current text-gold-strong" />
                    {copy("Ver preview", "Watch preview", "Ver preview")}
                  </button>
                ) : null}
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                  {skinPool.map((skin) => (
                    <button
                      key={skin.uuid}
                      type="button"
                      onClick={() => chooseSkin(skin)}
                      className={cn(
                        "w-28 shrink-0 rounded-xl border bg-background/70 p-2 transition-all duration-200 active:scale-95",
                        skin.uuid === selectedSkin.uuid
                          ? "scale-[1.02] border-gold/60 shadow-md"
                          : "border-border",
                      )}
                    >
                      <div className="h-14">
                        {skin.icon ? (
                          <img src={skin.icon} alt="" className="h-full w-full object-contain" />
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-[0.62rem] font-semibold">{skin.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => rotate(-1)}
                  disabled={skinPool.length <= 1}
                  className="grid size-10 place-items-center rounded-full border border-border bg-background/80 transition-all hover:-translate-x-0.5 hover:border-gold/45 hover:text-gold-strong disabled:opacity-40"
                  aria-label={copy("Skin anterior", "Previous skin", "Skin anterior")}
                >
                  <ChevronLeft className="size-5" />
                </button>
                <span className="min-w-14 text-center text-xs font-semibold tabular-nums text-muted-foreground">
                  {selectedPoolIndex >= 0 ? selectedPoolIndex + 1 : 0}/{skinPool.length}
                </span>
                <button
                  type="button"
                  onClick={() => rotate(1)}
                  disabled={skinPool.length <= 1}
                  className="grid size-10 place-items-center rounded-full border border-border bg-background/80 transition-all hover:translate-x-0.5 hover:border-gold/45 hover:text-gold-strong disabled:opacity-40"
                  aria-label={copy("Próxima skin", "Next skin", "Siguiente skin")}
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>

            <aside className="border-t border-border p-5 sm:p-7 xl:border-l xl:border-t-0">
              <SkinInfo
                skin={selectedSkin}
                weapon={selectedWeapon}
                locale={locale}
                previewCount={previewClips.length}
                onPreview={() => setPreviewOpen(true)}
              />
              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <Palette className="size-4 text-gold-strong" />
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {copy("Variantes", "Variants", "Variantes")}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedSkin.chromas.map((chroma, index) => (
                    <button
                      key={chroma.uuid}
                      type="button"
                      onClick={() => setChromaId(chroma.uuid)}
                      title={chroma.name}
                      className={cn(
                        "grid size-10 place-items-center overflow-hidden rounded-full border bg-muted/20 p-1 transition-all hover:scale-105",
                        selectedChroma?.uuid === chroma.uuid
                          ? "border-gold/70 ring-2 ring-gold/20"
                          : "border-border hover:border-gold/35",
                      )}
                    >
                      {chroma.swatch ? (
                        <img
                          src={chroma.swatch}
                          alt=""
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : chroma.fullRender ? (
                        <img
                          src={chroma.fullRender}
                          alt=""
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <Layers3 className="size-4 text-gold-strong" />
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {copy("Níveis de evolução", "Upgrade levels", "Niveles de mejora")}
                  </p>
                </div>
                <div className="mt-3 space-y-2">
                  {selectedSkin.levels.map((level, index) => (
                    <div
                      key={level.uuid}
                      className="rounded-xl border border-border bg-muted/15 px-3 py-2.5 transition-colors hover:bg-muted/25"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold">Lv. {index + 1}</span>
                        <span className="truncate text-[0.68rem] text-muted-foreground">
                          {level.item ?? level.name}
                        </span>
                      </div>
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
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const controls = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), a[href], [tabindex="0"]',
          ) ?? [],
        ).filter((element) => element.getClientRects().length > 0);
        const first = controls?.[0];
        const last = controls?.[controls.length - 1];
        if (
          first &&
          last &&
          event.shiftKey &&
          (document.activeElement === first || document.activeElement === dialogRef.current)
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          first &&
          last &&
          !event.shiftKey &&
          (document.activeElement === last || document.activeElement === dialogRef.current)
        ) {
          event.preventDefault();
          first.focus();
        }
      }
      // Range controls own their arrow keys; do not switch clips while seeking or changing volume.
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)
        return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") event.preventDefault();
      if (event.key === "ArrowRight") onIndex((activeIndex + 1) % clips.length);
      if (event.key === "ArrowLeft") onIndex((activeIndex - 1 + clips.length) % clips.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, clips.length, onClose, onIndex]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-black/90 p-3 animate-in fade-in duration-200 motion-reduce:animate-none sm:p-4"
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`${skin.name} — ${copy("Prévia", "Preview", "Vista previa")}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[94dvh] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-2xl border border-white/15 bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-250 motion-reduce:animate-none">
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-gold-strong">
              {copy("PREVIEW DE SKIN", "SKIN PREVIEW", "PREVIEW DE SKIN")}
            </p>
            <h3 className="mt-1 truncate font-display text-lg font-semibold sm:text-xl">
              {skin.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-border transition-all hover:rotate-90 hover:border-gold/45 hover:text-gold-strong"
            aria-label={copy("Fechar preview", "Close preview", "Cerrar preview")}
          >
            <X className="size-4" />
          </button>
        </div>
        <MinimalVideoPlayer
          key={active.url}
          src={active.url}
          locale={locale}
          autoPlay
          autoPlayOnTouch
          className="aspect-video w-full"
        />
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-semibold text-foreground">{active.label}</p>
            <span className="shrink-0 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {copy("Role para navegar", "Scroll to browse", "Desplaza para navegar")}
            </span>
          </div>
          <PreviewClipRail
            clips={clips}
            activeIndex={activeIndex}
            onIndex={onIndex}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}

function PreviewClipRail({
  clips,
  activeIndex,
  onIndex,
  locale,
}: {
  clips: PreviewClip[];
  activeIndex: number;
  onIndex: (index: number) => void;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const handleWheel = (event: WheelEvent) => {
      if (rail.scrollWidth <= rail.clientWidth) return;
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!delta) return;

      event.preventDefault();
      event.stopPropagation();
      rail.scrollLeft += delta;
    };

    rail.addEventListener("wheel", handleWheel, { passive: false });
    return () => rail.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div
      ref={railRef}
      className="mgp-media-rail mt-3 flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-2"
      style={{ overscrollBehavior: "contain" }}
    >
      {clips.map((clip, index) => (
        <button
          key={clip.id}
          type="button"
          onClick={() => onIndex(index)}
          aria-pressed={index === activeIndex}
          className={cn(
            "min-h-12 min-w-36 shrink-0 rounded-xl border px-3 py-2 text-left transition-all",
            index === activeIndex
              ? "border-gold/55 bg-gold/10 text-foreground shadow-sm"
              : "border-border bg-background/45 text-muted-foreground hover:border-gold/30 hover:text-foreground",
          )}
        >
          <span className="block text-[0.58rem] font-black uppercase tracking-[0.1em] text-gold-strong">
            {clip.kind === "level"
              ? copy(`Nível ${clip.ordinal}`, `Level ${clip.ordinal}`, `Nivel ${clip.ordinal}`)
              : copy(
                  `Variante ${clip.ordinal}`,
                  `Variant ${clip.ordinal}`,
                  `Variante ${clip.ordinal}`,
                )}
          </span>
          <span className="mt-1 block max-w-48 truncate text-xs font-semibold">{clip.label}</span>
        </button>
      ))}
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
        {skin.rarityIcon ? (
          <img src={skin.rarityIcon} alt="" className="size-9 rounded-lg bg-muted/25 p-1.5" />
        ) : (
          <Sparkles className="size-7 text-gold-strong" />
        )}
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {copy("Raridade", "Edition", "Rareza")}
          </p>
          <p className="font-semibold">{skin.rarity ?? "—"}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <InfoBox
          icon={Coins}
          label={copy("VP ref.", "VP ref.", "VP ref.")}
          value={skin.referenceVp != null ? `~${skin.referenceVp.toLocaleString()} VP` : "—"}
        />
        <InfoBox icon={Sparkles} label="RP" value={totalRp ? `~${totalRp} RP` : "0 RP"} />
      </div>

      <p className="mt-3 text-[0.68rem] leading-5 text-muted-foreground">
        {copy(
          `VP aqui é somente uma estimativa de referência pela edição${weapon.isMelee ? " para melee" : ""}, não o preço oficial individual da skin. Coleções limitadas, Battle Pass e linhas especiais podem fugir dessa faixa ou não ter venda individual. RP também é estimado pelo padrão comum de upgrades/variantes.`,
          `VP here is only an edition-based reference estimate${weapon.isMelee ? " for melee" : ""}, not the skin's official individual price. Limited collections, Battle Pass items and special lines can fall outside that range or have no individual sale. RP is also estimated from common upgrade/variant patterns.`,
          `El VP aquí es solo una estimación de referencia basada en la edición${weapon.isMelee ? " para melee" : ""}, no el precio oficial individual de la skin. Colecciones limitadas, Pase de Batalla y líneas especiales pueden quedar fuera de esa referencia o no venderse individualmente. El RP también es estimado según patrones comunes.`,
        )}
      </p>

      <div className="mt-5 rounded-xl border border-border bg-muted/15 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
          {copy("Para upar tudo", "To fully upgrade", "Para mejorar todo")}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">
              {copy("Níveis extras", "Extra levels", "Niveles extra")}
            </p>
            <p className="mt-1 font-semibold">
              {Math.max(0, skin.levels.length - 1)} · ~{upgradeRp} RP
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">
              {copy("Variantes extras", "Extra variants", "Variantes extra")}
            </p>
            <p className="mt-1 font-semibold">
              {Math.max(0, skin.chromas.length - 1)} · ~{variantRp} RP
            </p>
          </div>
        </div>
      </div>

      {previewCount ? (
        <button
          type="button"
          onClick={onPreview}
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-gold/25 bg-gold/[0.06] px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-gold/50 hover:bg-gold/10"
        >
          <span>
            <span className="block text-xs font-bold uppercase tracking-[0.1em] text-gold-strong">
              {copy("Preview disponível", "Preview available", "Preview disponible")}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {copy(
                `${previewCount} clipe(s) detectado(s)`,
                `${previewCount} clip(s) detected`,
                `${previewCount} clip(s) detectado(s)`,
              )}
            </span>
          </span>
          <Play className="size-4 fill-current text-gold-strong" />
        </button>
      ) : null}
    </div>
  );
}

function InfoBox({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Coins;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/15 p-3">
      <Icon className="size-4 text-gold-strong" />
      <p className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-lg font-bold">{value}</p>
    </div>
  );
}

function getSkinPreviewClips(skin: ValorantSkin): PreviewClip[] {
  const clips: PreviewClip[] = [];
  const seen = new Set<string>();
  skin.levels.forEach((level, index) => {
    if (!level.streamedVideo || seen.has(level.streamedVideo)) return;
    seen.add(level.streamedVideo);
    clips.push({
      id: `level-${level.uuid}`,
      label: level.item ?? `Level ${index + 1}`,
      url: level.streamedVideo,
      kind: "level",
      ordinal: index + 1,
    });
  });
  skin.chromas.forEach((chroma, index) => {
    if (!chroma.streamedVideo || seen.has(chroma.streamedVideo)) return;
    seen.add(chroma.streamedVideo);
    clips.push({
      id: `chroma-${chroma.uuid}`,
      label: chroma.name || `Variant ${index + 1}`,
      url: chroma.streamedVideo,
      kind: "variant",
      ordinal: index + 1,
    });
  });
  return clips;
}

function getWheelItems(
  skins: ValorantSkin[],
  selectedIndex: number,
  slots: number,
): Array<{ skin: ValorantSkin; offset: number }> {
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
  return (
    <div className="surface-panel rounded-2xl p-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
