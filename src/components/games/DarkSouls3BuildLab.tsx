import { useMemo, useState } from "react";
import {
  Anvil,
  Flame,
  Hammer,
  ShieldCheck,
  Sparkles,
  Loader2,
  Save,
  Swords,
  WandSparkles,
} from "lucide-react";
import {
  NoctisBuildAssistant,
  type NoctisBuildSuggestion,
} from "@/components/noctis/NoctisBuildAssistant";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

type SaveUserBuildRpcClient = {
  rpc: (
    fn: "save_user_build_v1",
    args: {
      p_game_slug: string;
      p_subject_key: string;
      p_title: string;
      p_build_data: Record<string, unknown>;
      p_source_context: Record<string, unknown>;
      p_visibility: "public" | "private";
    },
  ) => Promise<{ data: string | null; error: { message?: string } | null }>;
};

type VerifiedBuild = {
  id: string;
  title: Record<Locale, string>;
  archetype: Record<Locale, string>;
  summary: Record<Locale, string>;
  startingClass: string;
  stats: string[];
  core: string[];
  secondary: string[];
  rings: string[];
  spells: string[];
  variants: Record<Locale, string>[];
  sources: Array<{ label: string; url: string }>;
  icon: typeof Swords;
};

const BUILDS: VerifiedBuild[] = [
  {
    id: "sellsword-dex",
    title: {
      "pt-BR": "DEX · Sellsword Twinblades",
      en: "DEX · Sellsword Twinblades",
      es: "DEX · Sellsword Twinblades",
    },
    archetype: {
      "pt-BR": "DPS rápido · PvE",
      en: "Fast DPS · PvE",
      es: "DPS rápido · PvE",
    },
    summary: {
      "pt-BR":
        "Um dos caminhos PvE mais consolidados pela comunidade: Sharp Sellsword Twinblades, Destreza alta e foco em ataques L1 de duas mãos. É simples, muito rápido e derrete chefes quando você mantém stamina e posicionamento.",
      en:
        "One of the community's most established PvE routes: Sharp Sellsword Twinblades, high Dexterity and two-handed L1 pressure. It is simple, extremely fast and melts bosses when stamina and positioning are managed well.",
      es:
        "Una de las rutas PvE más consolidadas por la comunidad: Sharp Sellsword Twinblades, Destreza alta y presión con L1 a dos manos. Es simple, muy rápida y derrite jefes si gestionas bien stamina y posición.",
    },
    startingClass: "Mercenary",
    stats: ["VIG 27–40", "END 25–35", "DEX 40–60", "STR só requisito"],
    core: ["Sharp Sellsword Twinblades +10"],
    secondary: ["Old Wolf Curved Sword no off-hand", "Arma Sharp secundária para alcance"],
    rings: ["Pontiff's Right Eye", "Chloranthy Ring", "Ring of Favor", "Lloyd's Sword Ring"],
    spells: ["Lightning Blade opcional em híbrido DEX/FTH"],
    variants: [
      {
        "pt-BR": "DEX puro: priorize 40–60 DEX e mantenha o resto em Vigor/Endurance.",
        en: "Pure DEX: prioritize 40–60 DEX and spend the rest on Vigor/Endurance.",
        es: "DEX puro: prioriza 40–60 DEX y el resto en Vigor/Endurance.",
      },
      {
        "pt-BR": "DEX/FTH: sacrifique parte da DEX tardia para usar Lightning Blade.",
        en: "DEX/FTH: trade some late Dexterity for Lightning Blade.",
        es: "DEX/FTH: sacrifica parte de la Destreza tardía para Lightning Blade.",
      },
    ],
    sources: [
      {
        label: "Reddit · consenso PvE Sellsword Twinblades",
        url: "https://www.reddit.com/r/darksouls3/comments/1j3xrb3/which_build_is_the_most_op_in_dark_souls_3/",
      },
      {
        label: "Steam · discussão de builds PvE",
        url: "https://steamcommunity.com/app/374320/discussions/0/597391905481821844/",
      },
    ],
    icon: Swords,
  },
  {
    id: "strength-vordt",
    title: {
      "pt-BR": "Força · Vordt / Great Hammer",
      en: "Strength · Vordt / Great Hammer",
      es: "Fuerza · Vordt / Great Hammer",
    },
    archetype: {
      "pt-BR": "Stagger · dano pesado",
      en: "Stagger · heavy damage",
      es: "Stagger · daño pesado",
    },
    summary: {
      "pt-BR":
        "Build direta e robusta para quem quer aprender DS3 sem dividir muitos atributos. Vordt's Great Hammer é acessível cedo e o Frostbite ajuda bastante; depois você pode migrar para Great Club, Fume UGS ou outros pesados conforme preferência.",
      en:
        "A direct and robust route for learning DS3 without spreading stats too thin. Vordt's Great Hammer is available early and Frostbite adds strong pressure; later you can move into Great Club, Fume UGS or other heavy weapons.",
      es:
        "Ruta directa y robusta para aprender DS3 sin repartir demasiados atributos. Vordt's Great Hammer llega temprano y Frostbite ayuda mucho; luego puedes pasar a Great Club, Fume UGS u otras armas pesadas.",
    },
    startingClass: "Knight / Warrior",
    stats: ["VIG 35–40", "END 30–35", "VIT conforme armadura", "STR 40–66"],
    core: ["Vordt's Great Hammer +5"],
    secondary: ["Heavy Great Club +10", "Fume Ultra Greatsword +5", "Heavy Claymore +10"],
    rings: ["Ring of Favor", "Chloranthy Ring", "Havel's Ring", "Prisoner's Chain"],
    spells: [],
    variants: [
      {
        "pt-BR": "40 STR é suficiente para uma rota mais equilibrada; 60–66 favorece armas pesadas e duas mãos.",
        en: "40 STR is enough for a balanced route; 60–66 favors heavy weapons and two-handing.",
        es: "40 STR basta para una ruta equilibrada; 60–66 favorece armas pesadas y dos manos.",
      },
      {
        "pt-BR": "Troque Vordt por Heavy Great Club quando quiser dano físico puro sem depender de Frostbite.",
        en: "Swap Vordt for Heavy Great Club when you want pure physical damage without Frostbite.",
        es: "Cambia Vordt por Heavy Great Club si quieres daño físico puro sin depender de Frostbite.",
      },
    ],
    sources: [
      {
        label: "Reddit · recomendação recente de Vordt/STR",
        url: "https://www.reddit.com/r/darksouls3/comments/1uuyem2/ds3_build/",
      },
      {
        label: "Steam · STR como rota amigável para iniciantes",
        url: "https://steamcommunity.com/app/374320/discussions/0/1636410430552520259/",
      },
    ],
    icon: Hammer,
  },
  {
    id: "pyromancer-4040",
    title: {
      "pt-BR": "Piromancia · 40 INT / 40 FTH",
      en: "Pyromancy · 40 INT / 40 FTH",
      es: "Piromancia · 40 INT / 40 FTH",
    },
    archetype: {
      "pt-BR": "Caster híbrido · burst",
      en: "Hybrid caster · burst",
      es: "Caster híbrido · burst",
    },
    summary: {
      "pt-BR":
        "A rota clássica de piromancia de DS3 escala Inteligência e Fé juntas. Com Pyromancy Flame +10, Witch's Ring e Great Swamp Ring, Chaos Bed Vestiges e Black Flame viram o núcleo do dano; uma arma Dark/Chaos cobre combate corpo a corpo.",
      en:
        "The classic DS3 pyromancy route scales Intelligence and Faith together. With Pyromancy Flame +10, Witch's Ring and Great Swamp Ring, Chaos Bed Vestiges and Black Flame become the damage core while a Dark/Chaos weapon covers melee.",
      es:
        "La ruta clásica de piromancia de DS3 escala Inteligencia y Fe juntas. Con Pyromancy Flame +10, Witch's Ring y Great Swamp Ring, Chaos Bed Vestiges y Black Flame forman el núcleo de daño y un arma Dark/Chaos cubre melee.",
    },
    startingClass: "Pyromancer",
    stats: ["VIG 30–40", "ATT 24–30", "END 18–25", "INT 40", "FTH 40"],
    core: ["Pyromancy Flame +10", "Dark/Chaos Astora Greatsword ou Lothric Knight Sword"],
    secondary: ["Demon's Scar", "Onyx Blade", "Dark-infused backup weapon"],
    rings: ["Witch's Ring", "Great Swamp Ring", "Sage Ring", "Ring of Favor"],
    spells: ["Chaos Bed Vestiges", "Black Flame", "Black Fire Orb", "Great Combustion"],
    variants: [
      {
        "pt-BR": "Caster puro: use catalyst forte e mantenha arma só como segurança.",
        en: "Pure caster: use the strongest catalyst and keep the weapon mainly as backup.",
        es: "Caster puro: usa el mejor catalizador y deja el arma como respaldo.",
      },
      {
        "pt-BR": "Battle pyro: reserve STR/DEX apenas para a arma e mantenha INT/FTH em 40/40.",
        en: "Battle pyro: spend only weapon requirements on STR/DEX and keep INT/FTH at 40/40.",
        es: "Battle pyro: invierte solo requisitos de arma en STR/DEX y mantén INT/FTH en 40/40.",
      },
    ],
    sources: [
      {
        label: "Steam · build SL120 40/40 detalhada",
        url: "https://steamcommunity.com/app/374320/discussions/0/2574319296484433317/",
      },
      {
        label: "Steam · guia de criação de piromante",
        url: "https://steamcommunity.com/app/374320/discussions/0/2296220207947067032/",
      },
      {
        label: "Reddit · consenso moderno sobre Pyromancy PvE",
        url: "https://www.reddit.com/r/darksouls3/comments/1j3xrb3/which_build_is_the_most_op_in_dark_souls_3/",
      },
    ],
    icon: Flame,
  },
];

export function DarkSouls3BuildLab({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [selected, setSelected] = useState(BUILDS[0]?.id ?? "");
  const [customName, setCustomName] = useState(copy("Minha build DS3", "My DS3 build", "Mi build DS3"));
  const [coreOne, setCoreOne] = useState("");
  const [coreTwo, setCoreTwo] = useState("");
  const [variant, setVariant] = useState("");
  const [notes, setNotes] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "login" | "error">("idle");
  const [nexusApplied, setNexusApplied] = useState(false);

  const active = useMemo(
    () => BUILDS.find((build) => build.id === selected) ?? BUILDS[0],
    [selected],
  );
  if (!active) return null;
  const ActiveIcon = active.icon;

  const nexusContext = {
    game: "dark-souls-iii",
    activePreset: {
      id: active.id,
      title: active.title[locale],
      archetype: active.archetype[locale],
      summary: active.summary[locale],
      startingClass: active.startingClass,
      stats: active.stats,
      core: active.core,
      secondary: active.secondary,
      rings: active.rings,
      spells: active.spells,
      variants: active.variants.map((entry) => entry[locale]),
      sources: active.sources,
    },
    currentBuild: {
      title: customName,
      core: [coreOne, coreTwo].filter(Boolean),
      situational: variant || null,
      notes,
    },
  };

  const applyNexusPreset = (suggestion: NoctisBuildSuggestion) => {
    if (typeof suggestion.title === "string") {
      setCustomName(suggestion.title.slice(0, 100));
    }

    const suggestedCore = Array.isArray(suggestion["core"])
      ? suggestion["core"].filter((value): value is string => typeof value === "string").slice(0, 2)
      : [];
    if (suggestedCore[0]) setCoreOne(suggestedCore[0].slice(0, 140));
    if (suggestedCore[1]) setCoreTwo(suggestedCore[1].slice(0, 140));
    else if (suggestedCore.length === 1) setCoreTwo("");

    if (typeof suggestion["situational"] === "string") {
      setVariant(suggestion["situational"].slice(0, 180));
    } else {
      setVariant("");
    }

    if (typeof suggestion["notes"] === "string") {
      setNotes(suggestion["notes"].slice(0, 1600));
    } else if (typeof suggestion.reason === "string") {
      setNotes(suggestion.reason.slice(0, 1600));
    }

    setNexusApplied(true);
    setSaveStatus("idle");
  };

  const saveCustomBuild = async () => {
    if (!coreOne.trim() || saving) return;
    setSaving(true);
    setSaveStatus("idle");

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setSaveStatus("login");
        return;
      }

      const rpc = supabase as unknown as SaveUserBuildRpcClient;
      const { error } = await rpc.rpc("save_user_build_v1", {
        p_game_slug: "dark-souls-iii",
        p_subject_key: active.id,
        p_title: customName.trim() || copy("Minha build DS3", "My DS3 build", "Mi build DS3"),
        p_build_data: {
          schemaVersion: 2,
          game: "dark-souls-iii",
          basePreset: active.id,
          startingClass: active.startingClass,
          customName: customName.trim(),
          core: [coreOne.trim(), coreTwo.trim()].filter(Boolean),
          situational: variant.trim() || null,
          notes: notes.trim(),
          referenceStats: active.stats,
        },
        p_source_context: {
          createdWith: nexusApplied ? "mgp-souls-builder-v2+nexus" : "mgp-souls-builder-v2",
          nexusAssisted: nexusApplied,
          presetSources: active.sources.map((source) => ({
            label: source.label,
            url: source.url,
          })),
        },
        p_visibility: visibility,
      });

      if (error) throw new Error(error.message || "SAVE_BUILD_FAILED");
      setSaveStatus("saved");
    } catch (error) {
      console.error("[SoulsBuildLab] save build failed", error);
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="surface-panel overflow-hidden">
        <div className="border-b border-border p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <Anvil className="size-4 text-gold-strong" />
            <span className="section-kicker">MGP VERIFIED BUILDS</span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
            {copy("Builds de Dark Souls III", "Dark Souls III builds", "Builds de Dark Souls III")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy(
              "Presets baseados em rotas repetidas por jogadores e discussões comunitárias. O selo MGP Verificada significa que cruzamos a lógica da build com múltiplas referências e não encontramos conflito material; não significa que exista uma única build correta.",
              "Presets based on routes repeatedly used by players and community discussions. MGP Verified means the build logic was cross-checked across multiple references without a material conflict; it does not mean there is only one correct build.",
              "Presets basados en rutas repetidas por jugadores y discusiones comunitarias. MGP Verificada significa que cruzamos la lógica con varias referencias sin conflicto material; no significa que exista una única build correcta.",
            )}
          </p>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
          {BUILDS.map((build) => {
            const Icon = build.icon;
            const activeCard = build.id === active.id;
            return (
              <button
                key={build.id}
                type="button"
                onClick={() => setSelected(build.id)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all hover:-translate-y-1 hover:shadow-lift",
                  activeCard ? "border-gold/55 bg-gold/[0.08]" : "border-border bg-muted/10 hover:border-gold/30",
                )}
              >
                <Icon className="size-5 text-gold-strong" />
                <p className="mt-3 font-display text-lg font-semibold text-foreground">{build.title[locale]}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  {build.archetype[locale]}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="surface-panel overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem]">
          <article className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.08] px-3 py-1 text-xs font-bold text-gold-strong">
                <ShieldCheck className="size-3.5" />
                {copy("MGP Verificada", "MGP Verified", "MGP Verificada")}
              </span>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                {active.startingClass}
              </span>
            </div>

            <div className="mt-5 flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-muted/20">
                <ActiveIcon className="size-5 text-gold-strong" />
              </span>
              <div>
                <h3 className="font-display text-3xl font-bold text-foreground">{active.title[locale]}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">{active.summary[locale]}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <BuildPanel title={copy("Stats alvo", "Target stats", "Stats objetivo")} rows={active.stats} />
              <BuildPanel title={copy("Núcleo", "Core", "Núcleo")} rows={active.core} highlighted />
              <BuildPanel title={copy("Opções secundárias", "Secondary options", "Opciones secundarias")} rows={active.secondary} />
              <BuildPanel title={copy("Anéis", "Rings", "Anillos")} rows={active.rings} />
              {active.spells.length ? (
                <BuildPanel title={copy("Magias", "Spells", "Magias")} rows={active.spells} />
              ) : null}
              <BuildPanel title={copy("Variantes", "Variants", "Variantes")} rows={active.variants.map((entry) => entry[locale])} />
            </div>
          </article>

          <aside className="border-t border-border bg-muted/10 p-5 lg:border-l lg:border-t-0 sm:p-6">
            <p className="section-kicker">{copy("FONTES DA VERIFICAÇÃO", "VERIFICATION SOURCES", "FUENTES DE VERIFICACIÓN")}</p>
            <div className="mt-4 space-y-2">
              {active.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-border bg-background/60 p-3 text-sm font-semibold text-foreground transition-colors hover:border-gold/35"
                >
                  {source.label} ↗
                </a>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              {copy(
                "As fontes refletem experiência de jogadores e discussões recorrentes. O MGP resume, compara e sinaliza variações; valores podem ser adaptados ao seu nível e ao NG.",
                "Sources reflect player experience and recurring community discussions. MGP summarizes, compares and flags variants; values can be adapted to your level and NG cycle.",
                "Las fuentes reflejan experiencia de jugadores y discusiones recurrentes. MGP resume, compara y señala variantes; los valores pueden adaptarse a tu nivel y ciclo NG.",
              )}
            </p>
          </aside>
        </div>
      </section>

      <section className="surface-panel p-5 sm:p-7">
        <div className="flex items-center gap-2">
          <WandSparkles className="size-4 text-gold-strong" />
          <span className="section-kicker">{copy("CRIADOR", "BUILDER", "CREADOR")}</span>
        </div>
        <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
          {copy("Monte sua própria build de DS3", "Create your own DS3 build", "Crea tu propia build de DS3")}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {copy(
            "Defina um ou dois núcleos e separe o resto como alternativa. Isso mantém a build legível em vez de tratar seis peças como igualmente obrigatórias.",
            "Define one or two core pieces and keep the rest as alternatives. This keeps the build readable instead of treating six pieces as equally mandatory.",
            "Define uno o dos núcleos y deja el resto como alternativas. Así la build sigue legible sin tratar seis piezas como igualmente obligatorias.",
          )}
        </p>

        <div className="mt-5">
          <NoctisBuildAssistant
            gameSlug="dark-souls-iii"
            locale={locale}
            context={nexusContext}
            quickPrompts={[
              copy("PvE para primeira run", "PvE for a first run", "PvE para primera run"),
              copy("Mais agressiva", "More aggressive", "Más agresiva"),
              copy("Mais segura contra bosses", "Safer for bosses", "Más segura contra jefes"),
            ]}
            onApply={applyNexusPreset}
          />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <BuilderField label={copy("Nome", "Name", "Nombre")}>
            <Input value={customName} onChange={(event) => setCustomName(event.target.value)} />
          </BuilderField>
          <BuilderField label="Core 1">
            <Input value={coreOne} onChange={(event) => setCoreOne(event.target.value)} placeholder="Ex.: Sharp Sellsword Twinblades +10" />
          </BuilderField>
          <BuilderField label={copy("Core 2 (opcional)", "Core 2 (optional)", "Core 2 (opcional)")}>
            <Input value={coreTwo} onChange={(event) => setCoreTwo(event.target.value)} placeholder="Ex.: Pontiff's Right Eye" />
          </BuilderField>
          <BuilderField label={copy("Variante / situacional", "Variant / situational", "Variante / situacional")}>
            <Input value={variant} onChange={(event) => setVariant(event.target.value)} placeholder="Ex.: Prisoner's Chain" />
          </BuilderField>
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
            {copy("Explicação", "Explanation", "Explicación")}
          </span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-2 min-h-28 w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors focus:border-gold/50"
            placeholder={copy(
              "Explique o objetivo, breakpoint de atributos e quando trocar para a variante.",
              "Explain the goal, stat breakpoints and when to switch to the variant.",
              "Explica el objetivo, breakpoints de atributos y cuándo cambiar a la variante.",
            )}
          />
        </label>

        <div className="mt-5 rounded-2xl border border-gold/25 bg-gold/[0.05] p-4">
          <p className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <Sparkles className="size-4 text-gold-strong" />
            {customName || copy("Minha build DS3", "My DS3 build", "Mi build DS3")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[coreOne, coreTwo, variant].filter(Boolean).map((value, index) => (
              <span key={`${value}-${index}`} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground">
                {index < 2 ? "Core" : copy("Variante", "Variant", "Variante")}: {value}
              </span>
            ))}
          </div>
          {notes ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{notes}</p> : null}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-xl border border-border bg-muted/10 p-1">
            {(["private", "public"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setVisibility(value)}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-bold transition-colors",
                  visibility === value
                    ? "bg-gold/15 text-gold-strong"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {value === "private"
                  ? copy("Privada", "Private", "Privada")
                  : copy("Pública", "Public", "Pública")}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs text-muted-foreground">
              {saveStatus === "saved"
                ? copy("Build salva no seu perfil.", "Build saved to your profile.", "Build guardada en tu perfil.")
                : saveStatus === "login"
                  ? copy("Entre na sua conta para salvar.", "Sign in to save.", "Inicia sesión para guardar.")
                  : saveStatus === "error"
                    ? copy("Não foi possível salvar agora.", "Could not save right now.", "No se pudo guardar ahora.")
                    : !coreOne.trim()
                      ? copy("Adicione pelo menos um item core.", "Add at least one core item.", "Añade al menos un objeto core.")
                      : copy("Pronta para salvar.", "Ready to save.", "Lista para guardar.")}
            </p>
            <button
              type="button"
              disabled={!coreOne.trim() || saving}
              onClick={() => void saveCustomBuild()}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold px-4 text-sm font-bold text-gold-foreground transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving
                ? copy("Salvando…", "Saving…", "Guardando…")
                : copy("Salvar build", "Save build", "Guardar build")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function BuildPanel({
  title,
  rows,
  highlighted = false,
}: {
  title: string;
  rows: string[];
  highlighted?: boolean;
}) {
  return (
    <section className={cn("rounded-2xl border p-4", highlighted ? "border-gold/35 bg-gold/[0.06]" : "border-border bg-muted/10")}>
      <h4 className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground">{title}</h4>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row} className="flex gap-2 text-sm leading-6 text-foreground">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold-strong" />
            <span>{row}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BuilderField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
