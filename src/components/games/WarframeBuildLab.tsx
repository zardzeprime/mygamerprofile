import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, Loader2, LockKeyhole, Plus, Search, Share2, Shield, Trash2, WandSparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { NoctisBuildAssistant, type NoctisBuildSuggestion } from "@/components/noctis/NoctisBuildAssistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

type WarframeMod = {
  uniqueName: string;
  name: string;
  description?: string;
  imageName?: string;
  type?: string;
  polarity?: string;
  baseDrain?: number;
  fusionLimit?: number;
  compatName?: string;
  rarity?: string;
};

type SavedBuild = {
  id: string;
  title: string;
  subject_key: string | null;
  build_data: Record<string, unknown>;
  visibility: "private" | "public";
  updated_at: string;
};

const API = "https://api.warframestat.us";
const IMAGE = "https://cdn.warframestat.us/img";
const MOD_CACHE = new Map<string, Promise<WarframeMod[]>>();

function getMods(locale: Locale) {
  const language = locale === "pt-BR" ? "pt" : locale;
  const cached = MOD_CACHE.get(language);
  if (cached) return cached;
  const request = fetch(`${API}/mods?language=${language}&only=name,uniqueName,description,imageName,type,polarity,baseDrain,fusionLimit,compatName&remove=patchlogs`, {
    headers: { Accept: "application/json" },
  }).then(async (response) => {
    if (!response.ok) throw new Error(`WARFRAME_MODS_${response.status}`);
    const raw: unknown = await response.json();
    if (!Array.isArray(raw)) return [];
    return raw.filter((item): item is WarframeMod => Boolean(
      item && typeof item === "object" && "name" in item && "uniqueName" in item,
    ));
  }).catch((error) => {
    MOD_CACHE.delete(language);
    throw error;
  });
  MOD_CACHE.set(language, request);
  return request;
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

export function WarframeBuildLab({ locale, mode }: { locale: Locale; mode: "builds" | "mods" }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const { user } = useAuth();
  const [mods, setMods] = useState<WarframeMod[]>([]);
  const [modsLoading, setModsLoading] = useState(true);
  const [modsError, setModsError] = useState(false);
  const [query, setQuery] = useState("");
  const [equipment, setEquipment] = useState("Warframe");
  const [equipmentType, setEquipmentType] = useState<"warframe" | "weapon">("warframe");
  const [slots, setSlots] = useState<Array<WarframeMod | null>>(() => Array(8).fill(null));
  const [saved, setSaved] = useState<SavedBuild[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;
    setModsLoading(true);
    setModsError(false);
    getMods(locale).then((items) => {
      if (active) setMods(items);
    }).catch(() => {
      if (active) setModsError(true);
    }).finally(() => {
      if (active) setModsLoading(false);
    });
    return () => { active = false; };
  }, [locale]);

  const refreshSaved = useCallback(async () => {
    if (mode !== "builds" || !user) { setSaved([]); return; }
    setSavedLoading(true);
    const { data, error } = await supabase
      .from("user_builds")
      .select("id,title,subject_key,build_data,visibility,updated_at")
      .eq("game_slug", "warframe")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(30);
    if (!error && data) setSaved(data as SavedBuild[]);
    setSavedLoading(false);
  }, [user, mode]);

  useEffect(() => { void refreshSaved(); }, [refreshSaved]);

  const visibleMods = useMemo(() => {
    const term = normalize(query.trim());
    return mods.filter((mod) => !term || normalize(`${mod.name} ${mod.description ?? ""} ${mod.type ?? ""} ${mod.compatName ?? ""}`).includes(term)).slice(0, 100);
  }, [mods, query]);

  const addMod = (mod: WarframeMod) => {
    setSlots((current) => {
      const existing = current.findIndex((entry) => entry?.uniqueName === mod.uniqueName);
      if (existing >= 0) return current.map((entry, index) => index === existing ? null : entry);
      const empty = current.findIndex((entry) => !entry);
      if (empty < 0) return current;
      return current.map((entry, index) => index === empty ? mod : entry);
    });
  };

  const persistBuild = async (title: string, chosen: WarframeMod[], source: "manual" | "noctis", rationale?: string) => {
    if (!user || mode !== "builds") throw new Error("AUTH_REQUIRED");
    const buildData = {
      schemaVersion: 1,
      equipmentType,
      equipmentName: equipment.trim() || (equipmentType === "warframe" ? "Warframe" : "Arma"),
      rationale: rationale?.slice(0, 1200) || null,
      mods: chosen.map((mod, index) => ({
        uniqueName: mod.uniqueName,
        name: mod.name,
        description: mod.description ?? "",
        polarity: mod.polarity ?? null,
        baseDrain: mod.baseDrain ?? null,
        slot: index + 1,
      })),
    };
    const { error } = await supabase.rpc("save_user_build_v1", {
      p_game_slug: "warframe",
      p_subject_key: `${equipmentType}:${equipment.trim()}`,
      p_title: title.slice(0, 100),
      p_build_data: buildData,
      p_source_context: { source, locale, createdBy: source === "noctis" ? "noctis" : "player" },
      p_visibility: "private",
    });
    if (error) throw error;
    await refreshSaved();
  };

  const handleGenerated = async (suggestion: NoctisBuildSuggestion) => {
    const suggestions = Array.isArray(suggestion.mods) ? suggestion.mods : [];
    const chosen = suggestions.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const key = String((entry as Record<string, unknown>).uniqueName ?? "");
      const name = String((entry as Record<string, unknown>).name ?? "");
      const match = mods.find((mod) => mod.uniqueName === key || (name && mod.name === name));
      return match ? [match] : [];
    }).slice(0, 8);
    if (!chosen.length) throw new Error("NOCTIS_BUILD_HAS_NO_VALID_MODS");
    setSlots([...chosen, ...Array(Math.max(0, 8 - chosen.length)).fill(null)]);
    await persistBuild(String(suggestion.title ?? `Build do Noctis · ${equipment}`), chosen, "noctis", String(suggestion.summary ?? suggestion.reason ?? ""));
    setFeedback(copy("Build salva em Minhas Builds como privada.", "Build saved to My Builds as private.", "Build guardada en Mis Builds como privada."));
  };

  const handleApply = (suggestion: NoctisBuildSuggestion) => {
    const suggestions = Array.isArray(suggestion.mods) ? suggestion.mods : [];
    const chosen = suggestions.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const item = entry as Record<string, unknown>;
      const match = mods.find((mod) => mod.uniqueName === String(item.uniqueName ?? "") || mod.name === String(item.name ?? ""));
      return match ? [match] : [];
    }).slice(0, 8);
    if (chosen.length) setSlots([...chosen, ...Array(Math.max(0, 8 - chosen.length)).fill(null)]);
  };

  const saveManual = async () => {
    const chosen = slots.filter((mod): mod is WarframeMod => Boolean(mod));
    if (!chosen.length) return;
    setSaving(true); setFeedback("");
    try {
      await persistBuild(`${equipment.trim() || "Warframe"} · Build personalizada`, chosen, "manual");
      setFeedback(copy("Build salva como privada.", "Build saved as private.", "Build guardada como privada."));
    } catch {
      setFeedback(copy("Não consegui salvar. Entre na conta e confira se seu perfil já foi criado.", "Could not save. Sign in and make sure your profile is set up.", "No se pudo guardar. Inicia sesión y verifica que tu perfil esté creado."));
    } finally { setSaving(false); }
  };

  const publish = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("user_builds").update({ visibility: "public" }).eq("id", id).eq("user_id", user?.id ?? "");
    if (error) { setFeedback(copy("Não foi possível publicar esta build.", "Could not publish this build.", "No se pudo publicar esta build.")); return; }
    setFeedback(copy("Build publicada no seu perfil.", "Build published to your profile.", "Build publicada en tu perfil."));
    await refreshSaved();
  };

  if (mode === "mods") return (
    <section className="surface-panel overflow-hidden rounded-2xl">
      <header className="border-b border-border p-5 sm:p-7">
        <p className="section-kicker">ÍMPAR / LABORATÓRIO TENNO</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">{copy("Biblioteca de Mods", "Mod library", "Biblioteca de Mods")}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{copy("Consulte o efeito, a polaridade, a drenagem e os equipamentos compatíveis. Os dados vêm do catálogo do WarframeStat e são carregados só ao abrir esta aba.", "Check each Mod's effect, polarity, drain and compatible equipment. Data comes from the WarframeStat catalog and loads only when you open this tab.", "Consulta el efecto, polaridad, drenaje y equipo compatible. Los datos vienen del catálogo WarframeStat y se cargan al abrir esta pestaña.")}</p>
        <label className="mt-5 flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background/70 px-3"><Search className="size-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy("Buscar mod, efeito ou tipo...", "Search Mod, effect or type...", "Buscar Mod, efecto o tipo...")} className="h-auto border-0 bg-transparent p-0 shadow-none" /></label>
      </header>
      {modsLoading ? <div className="grid min-h-56 place-items-center"><Loader2 className="size-6 animate-spin text-[var(--impar-spectral)]" /></div> : modsError ? <p className="p-6 text-sm text-muted-foreground">{copy("O catálogo de Mods não respondeu. Tente novamente em instantes.", "The Mod catalog did not respond. Try again shortly.", "El catálogo de Mods no respondió. Inténtalo de nuevo en unos instantes.")}</p> : (
        <div className="grid grid-cols-1 gap-3 p-4 min-[560px]:grid-cols-2 xl:grid-cols-3 sm:p-6">
          {visibleMods.map((mod) => <article key={mod.uniqueName} className="rounded-xl border border-border bg-background/45 p-4">
            <div className="flex items-start gap-3">{mod.imageName ? <img src={`${IMAGE}/${encodeURIComponent(mod.imageName)}`} alt="" loading="lazy" className="size-12 shrink-0 object-contain" /> : <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-muted/30"><Shield className="size-5 text-[var(--impar-spectral)]" /></span>}
              <div className="min-w-0"><h3 className="font-semibold text-foreground">{mod.name}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{mod.description || copy("Descrição ainda não disponível no catálogo.", "Description not available in the catalog yet.", "Descripción aún no disponible en el catálogo.")}</p></div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[0.68rem]">{mod.type ? <span className="rounded-full border border-border px-2 py-1 text-muted-foreground">{mod.type}</span> : null}{mod.polarity ? <span className="rounded-full border border-[var(--impar-line)] bg-[var(--impar-spectral-soft)] px-2 py-1 text-[var(--impar-spectral)]">Polaridade: {mod.polarity}</span> : null}{mod.baseDrain !== undefined ? <span className="rounded-full border border-border px-2 py-1 text-muted-foreground">Drenagem {mod.baseDrain}{mod.fusionLimit ? ` · ${mod.fusionLimit} ranks` : ""}</span> : null}</div>
          </article>)}
          {!visibleMods.length ? <p className="col-span-full py-8 text-center text-sm text-muted-foreground">{copy("Nenhum Mod encontrado.", "No Mods found.", "No se encontraron Mods.")}</p> : null}
        </div>
      )}
      <div className="border-t border-border px-5 py-4"><a href="https://docs.warframestat.us/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--impar-spectral)] hover:underline">{copy("Fonte dos dados", "Data source", "Fuente de datos")}<ExternalLink className="size-3.5" /></a></div>
    </section>
  );

  const commonMods = equipmentType === "warframe"
    ? /intensify|continuity|flow|streamline|stretch|adaptation|vitality|steel fiber|rolling guard|augur|brief respite/i
    : /serration|split chamber|point strike|vital sense|hunter munitions|galvanized|multishot|critical delay|rime rounds|toxic barrage/i;
  const selectedMods = slots.filter((mod): mod is WarframeMod => Boolean(mod));
  const modContext = [...selectedMods, ...mods.filter((mod) => commonMods.test(mod.name)), ...visibleMods]
    .filter((mod, index, all) => all.findIndex((candidate) => candidate.uniqueName === mod.uniqueName) === index)
    .slice(0, 40)
    .map(({ uniqueName, name, description, type, polarity, baseDrain, compatName }) => ({ uniqueName, name, description, type, polarity, baseDrain, compatName }));
  return <div className="space-y-6">
    <section className="surface-panel rounded-2xl p-5 sm:p-7">
      <div className="flex items-center gap-2 text-[var(--impar-spectral)]"><WandSparkles className="size-4" /><span className="section-kicker">ÍMPAR / OFICINA TENNO</span></div>
      <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">{copy("Monte e salve sua build", "Build and save your loadout", "Crea y guarda tu build")}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{copy("Escolha o equipamento, encaixe Mods e peça ao Noctis uma proposta com base no catálogo. O resultado entra em Minhas Builds como privado; publicar fica sempre nas suas mãos.", "Choose equipment, slot Mods and ask Noctis for a catalog-grounded build. Results are saved under My Builds as private; publishing is always your choice.", "Elige el equipo, coloca Mods y pide al Noctis una propuesta basada en el catálogo. El resultado se guarda en Mis Builds como privado; publicar siempre es tu decisión.")}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">{copy("Equipamento", "Equipment", "Equipo")}<select value={equipmentType} onChange={(event) => setEquipmentType(event.target.value as "warframe" | "weapon")} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground"><option value="warframe">Warframe</option><option value="weapon">{copy("Arma", "Weapon", "Arma")}</option></select></label>
        <label className="space-y-1.5 text-xs font-semibold text-muted-foreground">{copy("Nome do equipamento", "Equipment name", "Nombre del equipo")}<Input value={equipment} onChange={(event) => setEquipment(event.target.value.slice(0, 80))} placeholder={copy("Ex.: Garuda Prime", "e.g. Garuda Prime", "Ej.: Garuda Prime")} className="h-11 bg-background" /></label>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)]">
        <div className="rounded-xl border border-border bg-background/35 p-4">
          <div className="flex items-center justify-between gap-2"><h3 className="font-display text-base font-semibold">{copy("Slots da build", "Build slots", "Espacios de build")}</h3><span className="text-xs text-muted-foreground">{slots.filter(Boolean).length}/8</span></div>
          <div className="mt-3 grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">{slots.map((mod, index) => <div key={index} className="flex min-h-12 items-center justify-between gap-2 rounded-lg border border-border/80 px-3 py-2"><span className="min-w-0 truncate text-sm">{mod ? mod.name : `${copy("Slot", "Slot", "Espacio")} ${index + 1} · ${copy("vazio", "empty", "vacío")}`}</span>{mod ? <button type="button" aria-label={`${copy("Remover", "Remove", "Quitar")} ${mod.name}`} onClick={() => setSlots((current) => current.map((entry, slot) => slot === index ? null : entry))} className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button> : null}</div>)}</div>
          {modsError ? <p className="mt-3 text-xs text-destructive">{copy("O catálogo de Mods não carregou.", "Mod catalog failed to load.", "No cargó el catálogo de Mods.")}</p> : null}
        </div>
        <div className="rounded-xl border border-border bg-background/35 p-4">
          <div className="flex items-center justify-between gap-2"><h3 className="font-display text-base font-semibold">{copy("Adicionar Mods", "Add Mods", "Añadir Mods")}</h3><Link to="/games/$slug" params={{ slug: "warframe" }} search={{ module: "mods" }} className="text-xs font-semibold text-[var(--impar-spectral)] hover:underline">{copy("Abrir biblioteca", "Open library", "Abrir biblioteca")}</Link></div>
          <label className="mt-3 flex min-h-10 items-center gap-2 rounded-lg border border-border bg-background px-3"><Search className="size-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy("Filtrar Mods...", "Filter Mods...", "Filtrar Mods...")} className="h-auto border-0 bg-transparent p-0 shadow-none" /></label>
          <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto">{modsLoading ? <div className="grid min-h-24 place-items-center"><Loader2 className="size-5 animate-spin" /></div> : visibleMods.slice(0, 12).map((mod) => <button key={mod.uniqueName} type="button" onClick={() => addMod(mod)} disabled={!slots.some((slot) => !slot) && !slots.some((slot) => slot?.uniqueName === mod.uniqueName)} className="flex w-full items-center justify-between gap-2 rounded-lg border border-transparent px-2.5 py-2 text-left hover:border-border hover:bg-muted/20 disabled:opacity-45"><span className="min-w-0"><span className="block truncate text-sm font-semibold">{mod.name}</span><span className="block truncate text-xs text-muted-foreground">{mod.type || mod.compatName || mod.description || "Warframe"}</span></span><Plus className="size-4 shrink-0 text-[var(--impar-spectral)]" /></button>)}</div>
        </div>
      </div>
      {user ? <div className="mt-4 flex flex-wrap items-center gap-3"><Button type="button" onClick={() => void saveManual()} disabled={saving || !slots.some(Boolean)}>{saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <LockKeyhole className="mr-2 size-4" />}{copy("Salvar como privada", "Save as private", "Guardar como privada")}</Button>{feedback ? <p role="status" className="text-sm text-muted-foreground">{feedback}</p> : null}</div> : <p className="mt-4 text-sm text-muted-foreground">{copy("Entre na conta para salvar builds.", "Sign in to save builds.", "Inicia sesión para guardar builds.")} <Link to="/login" className="font-semibold text-[var(--impar-spectral)] hover:underline">{copy("Entrar", "Sign in", "Iniciar sesión")}</Link></p>}
    </section>

    {user ? <NoctisBuildAssistant gameSlug="warframe" locale={locale} context={{ equipmentType, equipmentName: equipment, slots: 8, selectedModIds: slots.filter(Boolean).map((mod) => mod?.uniqueName), availableMods: modContext }} quickPrompts={[copy("Quero sobreviver no Steel Path", "Build for Steel Path survival", "Quiero sobrevivir en Steel Path"), copy("Quero limpar grupos rápido", "I want fast crowd clear", "Quiero limpiar grupos rápido"), copy("Faz uma build confortável para solo", "Make a comfortable solo build", "Haz una build cómoda para solo")]} onApply={handleApply} onGenerated={handleGenerated} /> : null}

    <section className="surface-panel rounded-2xl p-5 sm:p-7"><div className="flex items-center gap-2"><LockKeyhole className="size-4 text-[var(--impar-spectral)]" /><h3 className="font-display text-xl font-semibold">{copy("Minhas Builds", "My Builds", "Mis Builds")}</h3></div><p className="mt-1 text-sm text-muted-foreground">{copy("Só você vê builds privadas. Use Publicar quando quiser colocá-las no seu perfil.", "Only you can see private builds. Choose Publish when you want them on your profile.", "Solo tú ves las builds privadas. Elige Publicar para mostrarlas en tu perfil.")}</p>
      {!user ? <p className="mt-4 text-sm text-muted-foreground">{copy("Entre para ver as builds salvas.", "Sign in to view saved builds.", "Inicia sesión para ver las builds guardadas.")}</p> : savedLoading ? <div className="grid min-h-24 place-items-center"><Loader2 className="size-5 animate-spin" /></div> : saved.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{saved.map((build) => <article key={build.id} className="rounded-xl border border-border bg-background/45 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h4 className="truncate font-semibold">{build.title}</h4><p className="mt-1 text-xs text-muted-foreground">{build.subject_key || "Warframe"} · {build.visibility === "private" ? copy("Privada", "Private", "Privada") : copy("Pública", "Public", "Pública")}</p></div>{build.visibility === "private" ? <LockKeyhole className="size-4 shrink-0 text-muted-foreground" /> : <Share2 className="size-4 shrink-0 text-[var(--impar-spectral)]" />}</div>{typeof build.build_data?.rationale === "string" && build.build_data.rationale ? <p className="mt-3 text-xs leading-5 text-muted-foreground">{build.build_data.rationale}</p> : null}<div className="mt-3 flex flex-wrap gap-1.5">{Array.isArray(build.build_data?.mods) ? build.build_data.mods.slice(0, 8).map((rawMod, index) => { const mod = rawMod && typeof rawMod === "object" ? rawMod as Record<string, unknown> : {}; return <span key={`${build.id}-mod-${index}`} className="rounded-full border border-border bg-background/65 px-2.5 py-1 text-xs text-muted-foreground">{String(mod.name ?? "Mod")}</span>; }) : null}</div><div className="mt-3 flex flex-wrap gap-2">{build.visibility === "private" ? <Button size="sm" variant="outline" onClick={() => void publish(build.id)}><Share2 className="mr-2 size-3.5" />{copy("Publicar", "Publish", "Publicar")}</Button> : <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--impar-line)] bg-[var(--impar-spectral-soft)] px-2.5 py-1 text-xs text-[var(--impar-spectral)]"><Check className="size-3.5" />{copy("No perfil", "On profile", "En el perfil")}</span>}</div></article>)}</div> : <p className="mt-4 text-sm text-muted-foreground">{copy("Suas builds privadas e públicas aparecerão aqui.", "Your private and public builds will appear here.", "Tus builds privadas y públicas aparecerán aquí.")}</p>}
      {feedback ? <p role="status" className="mt-3 text-sm text-muted-foreground">{feedback}</p> : null}
    </section>
  </div>;
}
