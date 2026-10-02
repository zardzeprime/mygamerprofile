import { Loader2, Scale, Shield, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { supabase } from "@/integrations/supabase/client";
import {
  getNexusGuestStatus,
  sendNexusGuestMessage,
  sendNexusMessage,
} from "@/lib/nexus.functions";
import {
  loadSoulsArmorTechnical,
  type SoulsArmorSlot,
  type SoulsArmorTechnical,
} from "@/lib/souls-armor";
import type { SoulsCompendiumGame } from "@/lib/souls-compendium";
import { cn } from "@/lib/utils";

type Mode = "casual" | "advanced";
type Selection = Record<Exclude<SoulsArmorSlot, "unknown">, string>;

const EMPTY_SELECTION: Selection = { head: "", chest: "", arms: "", legs: "" };
const SLOT_ORDER: Array<Exclude<SoulsArmorSlot, "unknown">> = ["head", "chest", "arms", "legs"];
const FASHION_GUEST_KEY = "mgp:nexus:fashion-session";

function sum(values: number[]) {
  return values.reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0);
}

function combineDs3Absorption(values: number[]) {
  const multiplier = values.reduce(
    (remaining, value) => remaining * (1 - Math.max(-100, Math.min(100, value)) / 100),
    1,
  );
  return (1 - multiplier) * 100;
}

function formatNumber(value: number, digits = 1) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function loadBand(game: SoulsCompendiumGame, ratio: number) {
  if (!Number.isFinite(ratio) || ratio > 1) return "over";
  if (game === "dark-souls-remastered") {
    if (ratio <= 0.25) return "light";
    if (ratio <= 0.5) return "normal";
    return "heavy";
  }
  if (ratio < 0.3) return "light";
  if (ratio < 0.7) return "normal";
  return "heavy";
}

export function SoulsFashionTest({
  gameSlug,
  locale,
}: {
  gameSlug: SoulsCompendiumGame;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("casual");
  const [armor, setArmor] = useState<SoulsArmorTechnical[]>([]);
  const [selection, setSelection] = useState<Selection>(EMPTY_SELECTION);
  const [maxEquipLoad, setMaxEquipLoad] = useState(gameSlug === "dark-souls-iii" ? 60 : 50);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [noctisLoading, setNoctisLoading] = useState(false);
  const [noctisText, setNoctisText] = useState("");
  const [noctisError, setNoctisError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    setSelection(EMPTY_SELECTION);
    setNoctisText("");
    void loadSoulsArmorTechnical(gameSlug)
      .then((entries) => {
        if (!active) return;
        setArmor(entries.filter((entry) => entry.slot !== "unknown"));
      })
      .catch((error) => {
        console.warn("[SoulsFashionTest] armor data load failed", error);
        if (active) setLoadFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [gameSlug]);

  const bySlot = useMemo(
    () =>
      Object.fromEntries(
        SLOT_ORDER.map((slot) => [
          slot,
          armor
            .filter((entry) => entry.slot === slot)
            .sort((a, b) => a.name.localeCompare(b.name, "en")),
        ]),
      ) as Record<Exclude<SoulsArmorSlot, "unknown">, SoulsArmorTechnical[]>,
    [armor],
  );

  const pieces = useMemo(
    () =>
      SLOT_ORDER.map((slot) => armor.find((entry) => entry.name === selection[slot]) ?? null).filter(
        (entry): entry is SoulsArmorTechnical => Boolean(entry),
      ),
    [armor, selection],
  );

  const totals = useMemo(() => {
    const weight = sum(pieces.map((piece) => piece.weight));
    const poise = sum(pieces.map((piece) => piece.poise));
    const defenseKeys = ["physical", "strike", "slash", "thrust", "magic", "fire", "lightning", "dark"] as const;
    const resistanceKeys = ["bleed", "poison", "frost", "curse"] as const;
    const defense = Object.fromEntries(
      defenseKeys.map((key) => {
        const values = pieces.map((piece) => Number(piece.defense[key] ?? 0));
        return [key, gameSlug === "dark-souls-iii" ? combineDs3Absorption(values) : sum(values)];
      }),
    ) as Record<(typeof defenseKeys)[number], number>;
    const resistance = Object.fromEntries(
      resistanceKeys.map((key) => [
        key,
        sum(pieces.map((piece) => Number(piece.resistance[key] ?? 0))),
      ]),
    ) as Record<(typeof resistanceKeys)[number], number>;
    return { weight, poise, defense, resistance };
  }, [gameSlug, pieces]);

  const loadRatio = maxEquipLoad > 0 ? totals.weight / maxEquipLoad : Infinity;
  const band = loadBand(gameSlug, loadRatio);
  const complete = pieces.length === 4;

  const strongest = useMemo(
    () =>
      Object.entries(totals.defense)
        .filter(([, value]) => value > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([key]) => key),
    [totals.defense],
  );

  const bandLabel =
    band === "light"
      ? copy("Leve", "Light", "Ligera")
      : band === "normal"
        ? copy("Equilibrada", "Balanced", "Equilibrada")
        : band === "heavy"
          ? copy("Pesada", "Heavy", "Pesada")
          : copy("Sobrecarregada", "Overloaded", "Sobrecargada");

  const casualSummary =
    band === "over"
      ? copy(
          "A combinação ultrapassa sua carga máxima. Troque uma ou mais peças antes de considerar a defesa extra.",
          "This combination exceeds your maximum equip load. Swap one or more pieces before valuing the extra defense.",
          "La combinación supera tu carga máxima. Cambia una o más piezas antes de valorar la defensa extra.",
        )
      : band === "heavy"
        ? copy(
            "A proteção é utilizável, mas a mobilidade fica comprometida. Vale testar peças mais leves no peito ou nas pernas.",
            "The protection is usable, but mobility is compromised. Try lighter chest or leg pieces.",
            "La protección es utilizable, pero la movilidad queda comprometida. Prueba piezas más ligeras en torso o piernas.",
          )
        : band === "light"
          ? copy(
              "A combinação prioriza mobilidade e deixa bastante margem de carga para arma, escudo e anéis.",
              "This combination prioritizes mobility and leaves plenty of load room for weapons, shields and rings.",
              "La combinación prioriza movilidad y deja bastante margen para armas, escudos y anillos.",
            )
          : copy(
              "A combinação está numa faixa equilibrada entre mobilidade e proteção. Compare resistências conforme a área ou o boss.",
              "This combination sits in a balanced range between mobility and protection. Compare resistances for the area or boss.",
              "La combinación está en un rango equilibrado entre movilidad y protección. Compara resistencias según la zona o el jefe.",
            );

  const askNoctis = async () => {
    if (!complete || noctisLoading || mode !== "casual") return;
    setNoctisLoading(true);
    setNoctisError("");
    const selected = pieces.map((piece) => `${piece.slot}: ${piece.name}`).join(", ");
    const prompt = [
      "Você é Noctis, a IA do ÍMPAR. Analise esta combinação de armadura de forma curta, prática e sem inventar dados.",
      `Jogo: ${gameSlug === "dark-souls-iii" ? "Dark Souls III" : "Dark Souls Remastered"}.`,
      `Peças: ${selected}.`,
      `Peso: ${totals.weight.toFixed(2)} / ${maxEquipLoad.toFixed(2)} (${(loadRatio * 100).toFixed(1)}%).`,
      `Poise: ${totals.poise.toFixed(2)}.`,
      `Defesas/absorções: ${JSON.stringify(totals.defense)}.`,
      `Resistências: ${JSON.stringify(totals.resistance)}.`,
      "Diga em 3 a 5 frases se a combinação está funcional, se está pesada e qual peça/slot valeria revisar. Não trate estética como objetiva e não afirme que uma troca é melhor sem justificar pelo peso ou proteção informados.",
    ].join(" ");

    try {
      if (user) {
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;
        if (!accessToken) throw new Error("NEXUS_AUTH_SESSION_MISSING");
        const response = await sendNexusMessage({
          data: { accessToken, mode: "gaming", locale, message: prompt },
        });
        setNoctisText(String(response?.message?.content ?? ""));
      } else {
        const guestId =
          typeof window !== "undefined" ? window.localStorage.getItem(FASHION_GUEST_KEY) ?? undefined : undefined;
        const status = await getNexusGuestStatus({ data: guestId ? { guestId } : {} });
        if (typeof window !== "undefined" && status?.guestId) {
          window.localStorage.setItem(FASHION_GUEST_KEY, status.guestId);
        }
        if (status?.locked) throw new Error("NEXUS_GUEST_LIMIT");
        const response = await sendNexusGuestMessage({
          data: { guestId: status?.guestId, locale, message: prompt },
        });
        if (typeof window !== "undefined" && response?.guestId) {
          window.localStorage.setItem(FASHION_GUEST_KEY, response.guestId);
        }
        setNoctisText(String(response?.message?.content ?? ""));
      }
    } catch (error) {
      console.warn("[SoulsFashionTest] Noctis analysis failed", error);
      setNoctisError(
        copy(
          "Noctis não conseguiu analisar agora. Os cálculos locais continuam disponíveis.",
          "Noctis could not analyze this right now. Local calculations remain available.",
          "Noctis no pudo analizar esto ahora. Los cálculos locales siguen disponibles.",
        ),
      );
    } finally {
      setNoctisLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="surface-panel p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-gold-strong" />
          {copy("Carregando armaduras…", "Loading armor…", "Cargando armaduras…")}
        </div>
      </section>
    );
  }

  if (loadFailed || !armor.length) {
    return (
      <section className="surface-panel p-6 text-sm leading-6 text-muted-foreground">
        {copy(
          "Os dados técnicos de armadura não responderam agora.",
          "Technical armor data is unavailable right now.",
          "Los datos técnicos de armadura no están disponibles ahora.",
        )}
      </section>
    );
  }

  const slotLabel = (slot: Exclude<SoulsArmorSlot, "unknown">) =>
    slot === "head"
      ? copy("Capacete", "Head", "Casco")
      : slot === "chest"
        ? copy("Peitoral", "Chest", "Pecho")
        : slot === "arms"
          ? copy("Luvas", "Arms", "Guantes")
          : copy("Pernas", "Legs", "Piernas");

  const statLabel = (key: string) => {
    const labels: Record<string, [string, string, string]> = {
      physical: ["Físico", "Physical", "Físico"],
      strike: ["Impacto", "Strike", "Golpe"],
      slash: ["Corte", "Slash", "Corte"],
      thrust: ["Perfuração", "Thrust", "Perforación"],
      magic: ["Magia", "Magic", "Magia"],
      fire: ["Fogo", "Fire", "Fuego"],
      lightning: ["Raio", "Lightning", "Rayo"],
      dark: ["Sombrio", "Dark", "Oscuro"],
      bleed: ["Sangramento", "Bleed", "Sangrado"],
      poison: ["Veneno", "Poison", "Veneno"],
      frost: ["Gelo", "Frost", "Hielo"],
      curse: ["Maldição", "Curse", "Maldición"],
    };
    const localized = labels[key] ?? ([key, key, key] as [string, string, string]);
    return localeCopy(locale, localized[0], localized[1], localized[2]);
  };

  return (
    <div className="space-y-6">
      <section className="surface-panel overflow-hidden">
        <div className="border-b border-border bg-[radial-gradient(circle_at_top_right,hsl(var(--gold)/0.12),transparent_48%)] p-5 sm:p-7">
          <div className="flex items-center gap-2 text-gold-strong">
            <Shield className="size-4" />
            <span className="section-kicker">ÍMPAR · FASHION TEST</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
            {copy(
              "Monte o set antes de vestir",
              "Build the set before wearing it",
              "Monta el set antes de equiparlo",
            )}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy(
              "Escolha capacete, peitoral, luvas e pernas. O Casual traduz peso e proteção e pode chamar o Noctis; o Avançado mostra os números completos sem assistência.",
              "Choose head, chest, arms and legs. Casual translates load and protection and can call Noctis; Advanced shows full numbers without assistance.",
              "Elige casco, pecho, guantes y piernas. Casual traduce carga y protección y puede llamar a Noctis; Avanzado muestra todos los números sin asistencia.",
            )}
          </p>
        </div>
        <div className="flex gap-2 p-4 sm:p-5">
          {(["casual", "advanced"] as Mode[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value);
                setNoctisText("");
                setNoctisError("");
              }}
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="surface-panel p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {SLOT_ORDER.map((slot) => (
              <label key={slot} className="block">
                <span className="text-xs font-black uppercase tracking-[0.09em] text-muted-foreground">
                  {slotLabel(slot)}
                </span>
                <select
                  value={selection[slot]}
                  onChange={(event) => {
                    setSelection((current) => ({ ...current, [slot]: event.target.value }));
                    setNoctisText("");
                    setNoctisError("");
                  }}
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-gold/50"
                >
                  <option value="">{copy("Sem peça", "No piece", "Sin pieza")}</option>
                  {bySlot[slot].map((piece) => (
                    <option key={piece.name} value={piece.name}>
                      {piece.name} · {formatNumber(piece.weight)}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-muted/10 p-4">
            <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>
                <span className="block text-xs font-black uppercase tracking-[0.09em] text-muted-foreground">
                  {copy("Carga máxima do personagem", "Maximum equip load", "Carga máxima del personaje")}
                </span>
                <span className="mt-1 block text-[0.68rem] leading-5 text-muted-foreground">
                  {copy(
                    "Informe o valor exibido no jogo; arma, escudo e anéis também consomem essa carga.",
                    "Enter the value shown in game; weapons, shields and rings also consume this load.",
                    "Indica el valor mostrado en el juego; armas, escudos y anillos también consumen esta carga.",
                  )}
                </span>
              </span>
              <Input
                type="number"
                min="1"
                step="0.1"
                value={maxEquipLoad}
                onChange={(event) => setMaxEquipLoad(Math.max(1, Number(event.target.value) || 1))}
                className="w-full sm:w-28"
              />
            </label>
          </div>

          {mode === "advanced" ? (
            <div className="mt-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label={copy("Peso do set", "Set weight", "Peso del set")} value={formatNumber(totals.weight, 2)} />
                <Metric label={copy("Carga usada", "Load used", "Carga usada")} value={Number.isFinite(loadRatio) ? `${formatNumber(loadRatio * 100)}%` : "—"} />
                <Metric label="Poise" value={formatNumber(totals.poise, 2)} />
              </div>
              <StatGrid
                title={copy(
                  gameSlug === "dark-souls-iii" ? "Absorção combinada" : "Defesa total",
                  gameSlug === "dark-souls-iii" ? "Combined absorption" : "Total defense",
                  gameSlug === "dark-souls-iii" ? "Absorción combinada" : "Defensa total",
                )}
                values={totals.defense}
                label={statLabel}
                suffix={gameSlug === "dark-souls-iii" ? "%" : ""}
              />
              <StatGrid
                title={copy("Resistências", "Resistances", "Resistencias")}
                values={totals.resistance}
                label={statLabel}
              />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-gold/20 bg-gold/[0.05] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted-foreground">
                      {copy("Leitura rápida", "Quick read", "Lectura rápida")}
                    </p>
                    <p className="mt-1 font-display text-2xl font-bold text-foreground">{bandLabel}</p>
                  </div>
                  <div className="flex items-center gap-2 text-gold-strong">
                    <Scale className="size-5" />
                    <span className="font-black">
                      {formatNumber(totals.weight, 2)} / {formatNumber(maxEquipLoad, 1)}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{casualSummary}</p>
                {strongest.length ? (
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    {copy("Pontos fortes atuais", "Current strengths", "Puntos fuertes actuales")}:{" "}
                    <span className="font-bold text-foreground">
                      {strongest.map(statLabel).join(" · ")}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-border bg-muted/10 p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-gold-strong" />
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {copy("Análise do Noctis", "Noctis analysis", "Análisis de Noctis")}
                  </h3>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {copy(
                    "Noctis recebe somente os números desta combinação para sugerir ajustes. A análise é opcional e só aparece no modo Casual.",
                    "Noctis receives only the numbers from this combination to suggest adjustments. Analysis is optional and appears only in Casual mode.",
                    "Noctis recibe solo los números de esta combinación para sugerir ajustes. El análisis es opcional y solo aparece en modo Casual.",
                  )}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  disabled={!complete || noctisLoading}
                  onClick={() => void askNoctis()}
                >
                  {noctisLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                  {copy("Analisar combinação", "Analyze combination", "Analizar combinación")}
                </Button>
                {!complete ? (
                  <p className="mt-2 text-[0.68rem] text-muted-foreground">
                    {copy(
                      "Selecione as quatro peças para liberar a análise.",
                      "Select all four pieces to unlock analysis.",
                      "Selecciona las cuatro piezas para habilitar el análisis.",
                    )}
                  </p>
                ) : null}
                {noctisText ? (
                  <div className="mt-4 rounded-xl border border-gold/20 bg-background/55 p-4 text-sm leading-6 text-muted-foreground">
                    {noctisText}
                  </div>
                ) : null}
                {noctisError ? <p className="mt-3 text-xs text-destructive">{noctisError}</p> : null}
              </div>
            </div>
          )}
        </section>

        <aside className="surface-panel h-fit p-5">
          <h3 className="font-display text-lg font-bold text-foreground">
            {copy("Set atual", "Current set", "Set actual")}
          </h3>
          <div className="mt-4 space-y-3">
            {SLOT_ORDER.map((slot) => {
              const piece = pieces.find((entry) => entry.slot === slot);
              return (
                <div key={slot} className="rounded-xl border border-border bg-muted/10 p-3">
                  <p className="text-[0.6rem] font-black uppercase tracking-[0.09em] text-muted-foreground">
                    {slotLabel(slot)}
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">
                    {piece?.name ?? copy("Vazio", "Empty", "Vacío")}
                  </p>
                  {piece ? (
                    <p className="mt-1 text-[0.68rem] text-muted-foreground">
                      {copy("Peso", "Weight", "Peso")}: {formatNumber(piece.weight, 2)} · Poise: {formatNumber(piece.poise, 2)}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-[0.66rem] leading-5 text-muted-foreground">
            {copy(
              "Os cálculos usam datasets técnicos comunitários já documentados pelo ÍMPAR. Valores de carga dependem do personagem e devem ser conferidos no jogo.",
              "Calculations use technical community datasets already documented by ÍMPAR. Equip-load values depend on the character and should be checked in game.",
              "Los cálculos usan datasets técnicos comunitarios ya documentados por ÍMPAR. Los valores de carga dependen del personaje y deben verificarse en el juego.",
            )}
          </p>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/10 p-4">
      <p className="text-[0.6rem] font-black uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-black text-foreground">{value}</p>
    </div>
  );
}

function StatGrid({
  title,
  values,
  label,
  suffix = "",
}: {
  title: string;
  values: Record<string, number>;
  label: (key: string) => string;
  suffix?: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-muted/10 p-4">
      <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Object.entries(values).map(([key, value]) => (
          <div key={key} className="rounded-lg border border-border bg-background/45 p-3">
            <p className="text-[0.55rem] font-black uppercase tracking-[0.08em] text-muted-foreground">{label(key)}</p>
            <p className="mt-1 text-sm font-black text-foreground">
              {formatNumber(value, 1)}{suffix}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
