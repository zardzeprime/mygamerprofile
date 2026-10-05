import {
  Calculator,
  ChevronDown,
  ExternalLink,
  Gauge,
  Loader2,
  Minus,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Sword,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import {
  calculateDs1Estimate,
  calculateDs3Ar,
  DS1_UPGRADE_PATHS,
  explainSoulsSynergy,
  getDs1UpgradePathOptions,
  loadDs1Weapons,
  loadDs3WeaponLevel,
  loadDs3Weapons,
  SOULS_DPS_SOURCES,
  SOULS_RATING_COLORS,
  SOULS_RATING_LABELS,
  type Ds1UpgradePath,
  type Ds3WeaponLevel,
  type SoulsDpsResult,
  type SoulsDpsStat,
  type SoulsDpsWeapon,
  type SoulsStats,
} from "@/lib/souls-dps";
import type { SoulsCompendiumGame } from "@/lib/souls-compendium";
import { cn } from "@/lib/utils";

type Mode = "casual" | "advanced";

const DEFAULT_STATS: SoulsStats = {
  str: 20,
  dex: 20,
  int: 10,
  fth: 10,
  lck: 10,
};

const STAT_LABELS: Record<SoulsDpsStat, string> = {
  str: "STR",
  dex: "DEX",
  int: "INT",
  fth: "FTH",
  lck: "LCK",
};

export function SoulsDpsTest({
  gameSlug,
  locale,
}: {
  gameSlug: SoulsCompendiumGame;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [mode, setMode] = useState<Mode>("casual");
  const [weapons, setWeapons] = useState<SoulsDpsWeapon[]>([]);
  const [weaponName, setWeaponName] = useState("");
  const [infusion, setInfusion] = useState("-");
  const [ds1Path, setDs1Path] = useState<Ds1UpgradePath>("regular");
  const [humanity, setHumanity] = useState(0);
  const [upgrade, setUpgrade] = useState(0);
  const [stats, setStats] = useState<SoulsStats>(DEFAULT_STATS);
  const [twoHanded, setTwoHanded] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [levelWeapon, setLevelWeapon] = useState<Ds3WeaponLevel | null>(null);
  const [result, setResult] = useState<SoulsDpsResult | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [iconFailed, setIconFailed] = useState(false);

  const isDs3 = gameSlug === "dark-souls-iii";

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    const loader = isDs3 ? loadDs3Weapons() : loadDs1Weapons();

    void loader
      .then((data) => {
        if (!active) return;
        setWeapons(data);
        const first = data[0];
        setWeaponName(first?.name ?? "");
        setInfusion(first?.infusions?.includes("-") ? "-" : (first?.infusions?.[0] ?? "-"));
        setDs1Path("regular");
        setHumanity(0);
        setQuery("");
        setUpgrade(0);
      })
      .catch((error) => {
        console.warn("[SoulsDpsTest] weapon data load failed", error);
        if (active) setLoadFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isDs3]);

  const selectedWeapon = useMemo(
    () => weapons.find((weapon) => weapon.name === weaponName) ?? weapons[0] ?? null,
    [weaponName, weapons],
  );

  const ds1PathOptions = useMemo(
    () =>
      selectedWeapon && !isDs3
        ? getDs1UpgradePathOptions(selectedWeapon)
        : (["regular"] as Ds1UpgradePath[]),
    [isDs3, selectedWeapon],
  );
  const maxUpgrade = selectedWeapon
    ? isDs3 || ds1Path === "regular"
      ? selectedWeapon.maxUpgrade
      : DS1_UPGRADE_PATHS[ds1Path].maxUpgrade
    : 0;

  const chooseWeapon = (name: string) => {
    setWeaponName(name);
    setQuery("");
    setUpgrade(0);
    setDs1Path("regular");
    setHumanity(0);
    setIconFailed(false);
  };

  useEffect(() => {
    if (!selectedWeapon) return;
    setUpgrade((current) => Math.min(current, maxUpgrade));
    if (!isDs3 && !ds1PathOptions.includes(ds1Path)) {
      setDs1Path("regular");
    }
    if (isDs3) {
      const nextInfusion = selectedWeapon.infusions?.includes(infusion)
        ? infusion
        : selectedWeapon.infusions?.includes("-")
          ? "-"
          : (selectedWeapon.infusions?.[0] ?? "-");
      if (nextInfusion !== infusion) setInfusion(nextInfusion);
    }
  }, [ds1Path, ds1PathOptions, infusion, isDs3, maxUpgrade, selectedWeapon]);

  useEffect(() => {
    if (!selectedWeapon) {
      setResult(null);
      return;
    }

    if (!isDs3) {
      setLevelWeapon(null);
      setResult(calculateDs1Estimate(selectedWeapon, stats, upgrade, twoHanded, ds1Path, humanity));
      return;
    }

    let active = true;
    setCalculating(true);
    void loadDs3WeaponLevel(selectedWeapon.name, infusion, upgrade)
      .then(async (levelData) => {
        if (!active) return;
        setLevelWeapon(levelData);
        if (!levelData) {
          setResult(null);
          return;
        }
        const nextResult = await calculateDs3Ar(levelData, stats, twoHanded);
        if (active) setResult(nextResult);
      })
      .catch((error) => {
        console.warn("[SoulsDpsTest] calculation failed", error);
        if (active) setResult(null);
      })
      .finally(() => {
        if (active) setCalculating(false);
      });

    return () => {
      active = false;
    };
  }, [ds1Path, humanity, infusion, isDs3, selectedWeapon, stats, twoHanded, upgrade]);

  const filteredWeapons = useMemo(() => {
    const normalize = (value: string) =>
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase(locale)
        .trim();
    const normalized = normalize(query);
    if (!normalized) return weapons;

    return weapons
      .map((weapon) => {
        const name = normalize(weapon.name);
        const haystack = normalize(`${weapon.name} ${weapon.weaponClass ?? ""}`);
        const score =
          name === normalized
            ? 0
            : name.startsWith(normalized)
              ? 1
              : haystack.includes(normalized)
                ? 2
                : 9;
        return { weapon, score };
      })
      .filter(({ score }) => score < 9)
      .sort((a, b) => a.score - b.score || a.weapon.name.localeCompare(b.weapon.name, locale))
      .map(({ weapon }) => weapon);
  }, [locale, query, weapons]);

  const searchResults = query.trim() ? filteredWeapons.slice(0, 8) : [];

  const currentWeapon = levelWeapon ?? selectedWeapon;
  const naturalSynergy = currentWeapon ? explainSoulsSynergy(currentWeapon, stats, twoHanded) : [];
  const synergy =
    !isDs3 && ds1Path !== "regular"
      ? [
          DS1_UPGRADE_PATHS[ds1Path].description,
          ...(ds1Path === "chaos" ? [`Humanidade segurada: ${humanity}/10.`] : []),
        ]
      : naturalSynergy;
  const source = isDs3 ? SOULS_DPS_SOURCES.ds3 : SOULS_DPS_SOURCES.ds1;

  if (loading) {
    return (
      <section className="surface-panel p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-gold-strong" />
          {copy("Carregando arsenal…", "Loading arsenal…", "Cargando arsenal…")}
        </div>
      </section>
    );
  }

  if (loadFailed || !selectedWeapon) {
    return (
      <section className="surface-panel p-6 text-sm leading-6 text-muted-foreground">
        {copy(
          "Os dados técnicos das armas não responderam agora. O restante do compêndio continua disponível.",
          "Technical weapon data is unavailable right now. The rest of the compendium remains available.",
          "Los datos técnicos de armas no respondieron ahora. El resto del compendio sigue disponible.",
        )}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel overflow-hidden">
        <div className="border-b border-border bg-[radial-gradient(circle_at_top_right,hsl(var(--gold)/0.12),transparent_48%)] p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-gold-strong">
              <Gauge className="size-4" />
              <span className="section-kicker">ÍMPAR · DPS TEST</span>
            </span>
            <span className="rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
              {isDs3 ? "Dark Souls III" : "Dark Souls Remastered"}
            </span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
            {copy(
              "Teste sua arma antes de montar a build",
              "Test your weapon before building",
              "Prueba tu arma antes de montar la build",
            )}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy(
              "Escolha arma, upgrade e atributos. O modo Casual traduz scaling e investimento em uma leitura de 10 níveis; o Avançado mostra AR técnico e canais de dano.",
              "Choose weapon, upgrade and attributes. Casual mode translates scaling and investment into a 10-level readout; Advanced shows technical AR and damage channels.",
              "Elige arma, mejora y atributos. El modo Casual traduce escalado e inversión en una lectura de 10 niveles; Avanzado muestra AR técnico y canales de daño.",
            )}
          </p>
        </div>

        <div className="flex gap-2 p-4 sm:p-5">
          {(["casual", "advanced"] as Mode[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={cn(
                "min-h-10 rounded-xl border px-4 text-sm font-bold transition",
                mode === value
                  ? "border-gold/45 bg-gold/10 text-foreground"
                  : "border-border bg-muted/10 text-muted-foreground hover:text-foreground",
              )}
            >
              {value === "casual"
                ? copy("Casual", "Casual", "Casual")
                : copy("Avançado", "Advanced", "Avanzado")}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-6">
          <section className="surface-panel p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
              <div>
                <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl border border-border bg-black/25 p-4">
                  {(currentWeapon?.iconUrl ?? selectedWeapon.iconUrl) && !iconFailed ? (
                    <img
                      key={`${selectedWeapon.id}:${currentWeapon?.iconUrl ?? selectedWeapon.iconUrl}`}
                      src={currentWeapon?.iconUrl ?? selectedWeapon.iconUrl}
                      alt={selectedWeapon.name}
                      onError={() => setIconFailed(true)}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Sword className="size-12 text-muted-foreground" />
                  )}
                </div>
                <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                  {copy(
                    "Ícone de referência do jogo · direitos dos respectivos detentores.",
                    "Game reference icon · rights belong to the respective holders.",
                    "Icono de referencia del juego · derechos de sus respectivos titulares.",
                  )}
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative z-20">
                  <label className="text-xs font-black uppercase tracking-[0.09em] text-muted-foreground">
                    {copy("Buscar arma", "Search weapon", "Buscar arma")}
                  </label>
                  <div className="relative mt-2">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && searchResults[0]) {
                          event.preventDefault();
                          chooseWeapon(searchResults[0].name);
                        }
                        if (event.key === "Escape") setQuery("");
                      }}
                      className="pl-9"
                      placeholder={copy(
                        "Digite nome ou classe da arma…",
                        "Type weapon name or class…",
                        "Escribe nombre o clase del arma…",
                      )}
                    />
                  </div>

                  {query.trim() ? (
                    <div className="absolute left-0 right-0 top-full mt-2 max-h-80 overflow-y-auto rounded-2xl border border-border bg-background/98 p-1.5 shadow-2xl backdrop-blur">
                      {searchResults.length ? (
                        searchResults.map((weapon) => (
                          <button
                            key={weapon.id}
                            type="button"
                            onClick={() => chooseWeapon(weapon.name)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-muted/50",
                              weapon.name === selectedWeapon.name && "bg-gold/[0.08]",
                            )}
                          >
                            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-black/20 p-1">
                              {weapon.iconUrl ? (
                                <img
                                  src={weapon.iconUrl}
                                  alt=""
                                  className="max-h-full max-w-full object-contain"
                                />
                              ) : (
                                <Sword className="size-4 text-muted-foreground" />
                              )}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold text-foreground">
                                {weapon.name}
                              </span>
                              {weapon.weaponClass ? (
                                <span className="block truncate text-[0.66rem] text-muted-foreground">
                                  {weapon.weaponClass}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-4 text-xs text-muted-foreground">
                          {copy(
                            "Nenhuma arma encontrada.",
                            "No weapon found.",
                            "No se encontró ningún arma.",
                          )}
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.09em] text-muted-foreground">
                    {copy("Arma", "Weapon", "Arma")}
                  </span>
                  <div className="relative mt-2">
                    <select
                      value={selectedWeapon.name}
                      onChange={(event) => chooseWeapon(event.target.value)}
                      className="h-11 w-full appearance-none rounded-xl border border-border bg-background px-3 pr-10 text-sm font-semibold text-foreground outline-none focus:border-gold/50"
                    >
                      {weapons.map((weapon) => (
                        <option key={weapon.id} value={weapon.name}>
                          {weapon.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </label>

                {isDs3 ? (
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-[0.09em] text-muted-foreground">
                      {copy("Infusão", "Infusion", "Infusión")}
                    </span>
                    <select
                      value={infusion}
                      onChange={(event) => setInfusion(event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-gold/50"
                    >
                      {(selectedWeapon.infusions ?? ["-"]).map((value) => (
                        <option key={value} value={value}>
                          {value === "-"
                            ? copy("Sem infusão", "No infusion", "Sin infusión")
                            : value}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {!isDs3 ? (
                  <div>
                    <label className="block">
                      <span className="text-xs font-black uppercase tracking-[0.09em] text-muted-foreground">
                        {copy(
                          "Caminho de reforço / elemento",
                          "Upgrade path / element",
                          "Ruta de mejora / elemento",
                        )}
                      </span>
                      <select
                        value={ds1Path}
                        onChange={(event) => {
                          const next = event.target.value as Ds1UpgradePath;
                          setDs1Path(next);
                          setUpgrade(0);
                        }}
                        className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-gold/50"
                      >
                        {ds1PathOptions.map((value) => (
                          <option key={value} value={value}>
                            {DS1_UPGRADE_PATHS[value].label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="mt-2 text-[0.66rem] leading-5 text-muted-foreground">
                      {DS1_UPGRADE_PATHS[ds1Path].description}
                    </p>
                    {ds1PathOptions.length === 1 ? (
                      <p className="mt-1 text-[0.64rem] leading-5 text-amber-300/80">
                        {copy(
                          "Arma única/especial: o ÍMPAR mantém apenas a rota própria para não mostrar ascensões incompatíveis.",
                          "Unique/special weapon: ÍMPAR keeps only its native route to avoid showing incompatible ascensions.",
                          "Arma única/especial: ÍMPAR mantiene solo su ruta propia para no mostrar ascensos incompatibles.",
                        )}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {!isDs3 && ds1Path === "chaos" ? (
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-black uppercase tracking-[0.09em] text-muted-foreground">
                        {copy("Humanidade segurada", "Held Humanity", "Humanidad acumulada")}
                      </span>
                      <span className="text-sm font-black text-gold-strong">{humanity}/10</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={humanity}
                      onChange={(event) => setHumanity(Number(event.target.value))}
                      className="mt-3 w-full accent-[hsl(var(--gold))]"
                    />
                  </div>
                ) : null}

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-black uppercase tracking-[0.09em] text-muted-foreground">
                      {copy("Upgrade", "Upgrade", "Mejora")}
                    </span>
                    <span className="rounded-lg border border-gold/25 bg-gold/10 px-2 py-1 text-xs font-black text-gold-strong">
                      +{upgrade}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxUpgrade}
                    value={upgrade}
                    onChange={(event) => setUpgrade(Number(event.target.value))}
                    className="mt-3 w-full accent-[hsl(var(--gold))]"
                  />
                  <div className="mt-1 flex justify-between text-[0.62rem] text-muted-foreground">
                    <span>+0</span>
                    <span>+{maxUpgrade}</span>
                  </div>
                  {!isDs3 ? (
                    <p className="mt-2 text-[0.66rem] leading-5 text-muted-foreground">
                      {ds1Path === "regular"
                        ? copy(
                            "Rota Normal: o modo Avançado usa a estimativa de AR do ÍMPAR até o limite real da arma.",
                            "Normal path: Advanced mode uses ÍMPAR's AR estimate up to the weapon's real limit.",
                            "Ruta Normal: el modo Avanzado usa la estimación de AR de ÍMPAR hasta el límite real del arma.",
                          )
                        : copy(
                            "Rotas especiais mudam elemento/scaling. O Casual já reage à rota; AR numérico fica oculto até termos a curva exata por arma.",
                            "Special paths change element/scaling. Casual mode already reacts to the path; numeric AR stays hidden until per-weapon curves are validated.",
                            "Las rutas especiales cambian elemento/escalado. Casual ya reacciona a la ruta; el AR numérico queda oculto hasta validar curvas por arma.",
                          )}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section className="surface-panel p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-kicker">{copy("ATRIBUTOS", "ATTRIBUTES", "ATRIBUTOS")}</p>
                <h3 className="mt-2 font-display text-xl font-bold text-foreground">
                  {copy("Ajuste seus stats", "Tune your stats", "Ajusta tus stats")}
                </h3>
              </div>
              <label className="flex items-center gap-2 rounded-xl border border-border bg-muted/10 px-3 py-2 text-xs font-bold text-muted-foreground">
                <input
                  type="checkbox"
                  checked={twoHanded}
                  onChange={(event) => setTwoHanded(event.target.checked)}
                />
                {copy("Duas mãos", "Two-handed", "Dos manos")}
              </label>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(isDs3
                ? (["str", "dex", "int", "fth", "lck"] as SoulsDpsStat[])
                : (["str", "dex", "int", "fth"] as SoulsDpsStat[])
              ).map((stat) => (
                <StatControl
                  key={stat}
                  stat={stat}
                  value={stats[stat]}
                  onChange={(next) => setStats((current) => ({ ...current, [stat]: next }))}
                />
              ))}
            </div>
          </section>

          {mode === "casual" ? (
            <CasualResult
              locale={locale}
              weapon={currentWeapon}
              result={result}
              synergy={synergy}
              calculating={calculating}
            />
          ) : (
            <AdvancedResult
              locale={locale}
              weapon={currentWeapon}
              result={result}
              calculating={calculating}
              isDs3={isDs3}
            />
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <section className="surface-panel p-5">
            <p className="section-kicker">{copy("ARMA", "WEAPON", "ARMA")}</p>
            <h3 className="mt-2 font-display text-xl font-bold text-foreground">
              {selectedWeapon.name}
            </h3>
            {!isDs3 ? (
              <span className="mt-2 inline-flex rounded-full border border-gold/25 bg-gold/[0.07] px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.08em] text-gold-strong">
                {DS1_UPGRADE_PATHS[ds1Path].label} · +{upgrade}
              </span>
            ) : null}
            {selectedWeapon.weaponClass ? (
              <p className="mt-1 text-xs text-muted-foreground">{selectedWeapon.weaponClass}</p>
            ) : null}

            {currentWeapon?.weaponSkill ? (
              <div className="mt-3 rounded-xl border border-gold/25 bg-gold/[0.06] p-3">
                <p className="text-[0.58rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
                  {copy("Skill / Weapon Art", "Skill / Weapon Art", "Skill / Weapon Art")}
                </p>
                <p className="mt-1 text-sm font-bold text-foreground">
                  {currentWeapon.weaponSkill}
                </p>
              </div>
            ) : null}

            {currentWeapon?.attackTypes?.length ? (
              <p className="mt-3 text-[0.68rem] leading-5 text-muted-foreground">
                <strong className="text-foreground">
                  {copy("Tipos de ataque:", "Attack types:", "Tipos de ataque:")}
                </strong>{" "}
                {currentWeapon.attackTypes.join(" · ")}
              </p>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <InfoCell label="STR" value={selectedWeapon.requirements.str} />
              <InfoCell label="DEX" value={selectedWeapon.requirements.dex} />
              <InfoCell label="INT" value={selectedWeapon.requirements.int} />
              <InfoCell label="FTH" value={selectedWeapon.requirements.fth} />
            </div>

            <div className="mt-4">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
                Scaling
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Object.keys(STAT_LABELS) as SoulsDpsStat[]).map((stat) => {
                  const grade =
                    !isDs3 && ds1Path !== "regular"
                      ? result?.scalingGrades?.[stat]
                      : currentWeapon?.scalingLetters?.[stat];
                  if (!grade || grade === "-") return null;
                  return (
                    <span
                      key={stat}
                      className="rounded-lg border border-border bg-muted/10 px-2 py-1.5 text-xs font-bold text-foreground"
                    >
                      {STAT_LABELS[stat]} · {grade}
                    </span>
                  );
                })}
                {!isDs3 && ["fire", "lightning"].includes(ds1Path) ? (
                  <span className="rounded-lg border border-border bg-muted/10 px-2 py-1.5 text-xs font-bold text-muted-foreground">
                    {copy("Sem scaling de stats", "No stat scaling", "Sin escalado de stats")}
                  </span>
                ) : null}
                {!isDs3 && ds1Path === "chaos" ? (
                  <span className="rounded-lg border border-border bg-muted/10 px-2 py-1.5 text-xs font-bold text-foreground">
                    HUM · {humanity}/10
                  </span>
                ) : null}
              </div>
            </div>
          </section>

          <section className="surface-panel p-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-300" />
              <div>
                <p className="text-xs font-bold text-foreground">
                  {copy("O que este teste mede", "What this test measures", "Qué mide esta prueba")}
                </p>
                <p className="mt-1 text-[0.66rem] leading-5 text-muted-foreground">
                  {copy(
                    "AR é poder de ataque antes das defesas e resistências do inimigo. Dano real por golpe também depende do alvo, buffs, moveset, counter damage e outros modificadores.",
                    "AR is attack power before enemy defense and absorption. Real hit damage also depends on the target, buffs, moveset, counter damage and other modifiers.",
                    "AR es poder de ataque antes de defensas y absorción del enemigo. El daño real también depende del objetivo, buffs, moveset, counter damage y otros modificadores.",
                  )}
                </p>
              </div>
            </div>
          </section>

          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="surface-panel flex items-center justify-between gap-3 p-4 text-xs font-bold text-gold-strong transition hover:border-gold/35"
          >
            <span>{source.label}</span>
            <ExternalLink className="size-3.5 shrink-0" />
          </a>
        </aside>
      </div>
    </div>
  );
}

function StatControl({
  stat,
  value,
  onChange,
}: {
  stat: SoulsDpsStat;
  value: number;
  onChange: (value: number) => void;
}) {
  const next = (delta: number) => onChange(Math.max(1, Math.min(99, value + delta)));

  return (
    <div className="rounded-2xl border border-border bg-muted/10 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-black text-foreground">{STAT_LABELS[stat]}</span>
        <span className="text-lg font-black text-gold-strong">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={99}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-[hsl(var(--gold))]"
      />
      <div className="mt-2 grid grid-cols-[2.5rem_1fr_2.5rem] gap-2">
        <button
          type="button"
          onClick={() => next(-1)}
          className="grid min-h-9 place-items-center rounded-lg border border-border bg-background/50 text-muted-foreground hover:text-foreground"
        >
          <Minus className="size-3.5" />
        </button>
        <input
          type="number"
          min={1}
          max={99}
          value={value}
          onChange={(event) => onChange(Math.max(1, Math.min(99, Number(event.target.value) || 1)))}
          className="h-9 rounded-lg border border-border bg-background px-2 text-center text-sm font-bold text-foreground outline-none focus:border-gold/50"
        />
        <button
          type="button"
          onClick={() => next(1)}
          className="grid min-h-9 place-items-center rounded-lg border border-border bg-background/50 text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function CasualResult({
  locale,
  weapon,
  result,
  synergy,
  calculating,
}: {
  locale: Locale;
  weapon: SoulsDpsWeapon | null;
  result: SoulsDpsResult | null;
  synergy: string[];
  calculating: boolean;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const rating = result?.rating ?? 1;

  return (
    <section className="surface-panel overflow-hidden">
      <div className="border-b border-border p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-gold-strong" />
          <h3 className="font-display text-xl font-bold text-foreground">
            {copy("Leitura Casual", "Casual readout", "Lectura Casual")}
          </h3>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {copy(
            "Sem exigir que você saiba interpretar AR: o ÍMPAR combina requisitos, scaling, seus atributos e o nível da arma.",
            "No AR knowledge required: ÍMPAR combines requirements, scaling, your attributes and weapon level.",
            "Sin exigir que interpretes AR: ÍMPAR combina requisitos, escalado, tus atributos y el nivel del arma.",
          )}
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
              {copy(
                "Compatibilidade da build",
                "Build compatibility",
                "Compatibilidad de la build",
              )}
            </p>
            <p className="mt-1 font-display text-3xl font-black text-foreground">
              {calculating ? "…" : (result?.ratingLabel ?? "—")}
            </p>
          </div>
          <span className="text-sm font-black text-gold-strong">{rating}/10</span>
        </div>

        <div className="mt-5 grid grid-cols-10 gap-1">
          {SOULS_RATING_COLORS.map((color, index) => (
            <div key={color} className="text-center">
              <div
                className={cn(
                  "h-3 rounded-full transition-all",
                  color,
                  index + 1 === rating ? "scale-y-150 ring-2 ring-foreground/60" : "opacity-65",
                )}
              />
              <span className="mt-1 block text-[0.52rem] font-bold text-muted-foreground">
                {index + 1}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {SOULS_RATING_LABELS.map((label, index) => (
            <div
              key={label}
              className={cn(
                "rounded-xl border p-2 text-center text-[0.6rem] font-bold",
                index + 1 === rating
                  ? "border-gold/40 bg-gold/10 text-foreground"
                  : "border-border bg-muted/10 text-muted-foreground",
              )}
            >
              {index + 1}. {label}
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-muted/10 p-4">
            <p className="text-xs font-bold text-foreground">
              {copy("Por que ficou assim?", "Why this result?", "¿Por qué este resultado?")}
            </p>
            <div className="mt-3 space-y-2">
              {result?.requirementsMet ? (
                <p className="text-xs leading-5 text-muted-foreground">
                  ✓{" "}
                  {copy(
                    "Você cumpre os requisitos da arma.",
                    "You meet the weapon requirements.",
                    "Cumples los requisitos del arma.",
                  )}
                </p>
              ) : (
                <p className="text-xs leading-5 text-red-300">
                  !{" "}
                  {copy(
                    "Faltam requisitos; isso derruba muito o desempenho.",
                    "Requirements are missing; performance drops sharply.",
                    "Faltan requisitos; el rendimiento cae mucho.",
                  )}
                </p>
              )}
              {synergy.length ? (
                synergy.map((note) => (
                  <p key={note} className="text-xs leading-5 text-muted-foreground">
                    • {note}
                  </p>
                ))
              ) : (
                <p className="text-xs leading-5 text-muted-foreground">
                  {copy(
                    "Esta arma depende pouco de scaling ou os atributos relevantes ainda estão baixos.",
                    "This weapon relies little on scaling or the relevant attributes are still low.",
                    "Esta arma depende poco del escalado o los atributos relevantes siguen bajos.",
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/10 p-4">
            <p className="text-xs font-bold text-foreground">
              {copy("Scaling atual", "Current scaling", "Escalado actual")}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(Object.keys(STAT_LABELS) as SoulsDpsStat[]).map((stat) => {
                const grade = weapon?.scalingLetters?.[stat];
                if (!grade || grade === "-") return null;
                return <InfoCell key={stat} label={STAT_LABELS[stat]} value={grade} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdvancedResult({
  locale,
  weapon,
  result,
  calculating,
  isDs3,
}: {
  locale: Locale;
  weapon: SoulsDpsWeapon | null;
  result: SoulsDpsResult | null;
  calculating: boolean;
  isDs3: boolean;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const damageRows = result
    ? [
        ["Físico", result.damage.physical],
        ["Mágico", result.damage.magic],
        ["Fogo", result.damage.fire],
        ["Raio", result.damage.lightning],
        ["Dark", result.damage.dark],
      ].filter(([, value]) => Number(value) > 0)
    : [];

  return (
    <section className="surface-panel overflow-hidden">
      <div className="border-b border-border p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Calculator className="size-4 text-gold-strong" />
          <h3 className="font-display text-xl font-bold text-foreground">
            {copy("Leitura Avançada", "Advanced readout", "Lectura Avanzada")}
          </h3>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {isDs3
            ? copy(
                "DS3 usa dados por upgrade/infusão e curvas de saturação do dataset técnico. Alguns casos especiais ainda podem diferir levemente do jogo.",
                "DS3 uses per-upgrade/infusion data and saturation curves from the technical dataset. A few special-case weapons may still differ slightly from the game.",
                "DS3 usa datos por mejora/infusión y curvas de saturación del dataset técnico. Algunos casos especiales pueden variar ligeramente del juego.",
              )
            : copy(
                "No DS1, o AR abaixo é uma estimativa de beta baseada em dano base, scaling, stats e upgrade; não deve ser tratado como calculadora frame-perfect.",
                "In DS1, the AR below is a beta estimate based on base damage, scaling, stats and upgrade; it is not a frame-perfect calculator.",
                "En DS1, el AR mostrado es una estimación beta basada en daño base, escalado, stats y mejora; no es una calculadora exacta.",
              )}
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="rounded-2xl border border-gold/30 bg-gold/[0.06] p-5">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
            {isDs3 ? "Attack Rating" : copy("AR estimado", "Estimated AR", "AR estimado")}
          </p>
          <p className="mt-1 font-display text-4xl font-black text-foreground">
            {calculating
              ? "…"
              : result?.numericAvailable === false
                ? copy("Qualitativo", "Qualitative", "Cualitativo")
                : result
                  ? Math.round(result.totalAr)
                  : "—"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {result?.numericAvailable === false
              ? copy(
                  "Esta rota altera a arma, mas o ÍMPAR não exibe um AR inventado: use o Casual para a leitura de compatibilidade enquanto a curva exata por arma não está validada.",
                  "This path changes the weapon, but ÍMPAR does not display invented AR: use Casual for compatibility until exact per-weapon curves are validated.",
                  "Esta ruta altera el arma, pero ÍMPAR no muestra un AR inventado: usa Casual hasta validar la curva exacta por arma.",
                )
              : copy(
                  "Antes de defesa/absorção do inimigo.",
                  "Before enemy defense/absorption.",
                  "Antes de defensa/absorción del enemigo.",
                )}
          </p>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {damageRows.map(([label, value]) => (
            <InfoCell key={String(label)} label={String(label)} value={Math.round(Number(value))} />
          ))}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-muted/10 p-4">
            <p className="text-xs font-bold text-foreground">
              {copy("Requisitos", "Requirements", "Requisitos")}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <InfoCell label="STR" value={weapon?.requirements.str ?? 0} />
              <InfoCell label="DEX" value={weapon?.requirements.dex ?? 0} />
              <InfoCell label="INT" value={weapon?.requirements.int ?? 0} />
              <InfoCell label="FTH" value={weapon?.requirements.fth ?? 0} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/10 p-4">
            <p className="text-xs font-bold text-foreground">
              {copy("Scaling", "Scaling", "Escalado")}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(Object.keys(STAT_LABELS) as SoulsDpsStat[]).map((stat) => {
                const grade = result?.scalingGrades?.[stat];
                if (!grade || grade === "-") return null;
                return <InfoCell key={stat} label={STAT_LABELS[stat]} value={grade} />;
              })}
            </div>
          </div>
        </div>

        {result?.notes.length ? (
          <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3">
            {result.notes.map((note) => (
              <p key={note} className="text-[0.68rem] leading-5 text-muted-foreground">
                • {note}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function InfoCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-background/45 p-2.5">
      <p className="text-[0.58rem] font-black uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-foreground">{value}</p>
    </div>
  );
}
