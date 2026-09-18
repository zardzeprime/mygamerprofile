import { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  CheckCircle2,
  CircleHelp,
  PackageOpen,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import {
  getLeagueChampionBuilds,
  type LeagueBuildResponse,
  type LeagueBuildVariant,
} from "@/lib/league-builds";
import { cn } from "@/lib/utils";

const DDRAGON = "https://ddragon.leagueoflegends.com";
const FALLBACK_VERSION = "16.18.1";
const DATA_DRAGON_LOCALE: Record<Locale, string> = {
  "pt-BR": "pt_BR",
  en: "en_US",
  es: "es_ES",
};

type ChampionSummary = {
  id: string;
  key: string;
  name: string;
  tags: string[];
  image: { full: string };
};

type ItemSummary = {
  name: string;
  plaintext?: string;
  description?: string;
  image?: { full?: string };
  gold?: { total?: number };
  maps?: Record<string, boolean>;
  into?: string[];
  from?: string[];
  tags?: string[];
};

type ItemPayload = {
  data: Record<string, ItemSummary>;
};

type SaveBuildRpcClient = {
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

function stripMarkup(value?: string) {
  return (value ?? "")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyChampion(name: string) {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const aliases: Record<string, string> = {
    nunuwillump: "nunu",
    renataglasc: "renata",
  };
  return aliases[normalized] ?? normalized;
}

function itemIcon(version: string, itemId: string, item?: ItemSummary) {
  const file = item?.image?.full || `${itemId}.png`;
  return `${DDRAGON}/cdn/${version}/img/item/${file}`;
}

function championIcon(version: string, champion: ChampionSummary) {
  return `${DDRAGON}/cdn/${version}/img/champion/${champion.image.full}`;
}

export function LeagueBuildLab({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [version, setVersion] = useState(FALLBACK_VERSION);
  const [champions, setChampions] = useState<ChampionSummary[]>([]);
  const [items, setItems] = useState<Record<string, ItemSummary>>({});
  const [selectedId, setSelectedId] = useState("Akali");
  const [buildData, setBuildData] = useState<LeagueBuildResponse | null>(null);
  const [loadingBuilds, setLoadingBuilds] = useState(false);
  const [sourceError, setSourceError] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [coreCount, setCoreCount] = useState<1 | 2>(2);
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [customTitle, setCustomTitle] = useState("");
  const [explanation, setExplanation] = useState("");
  const [savingBuild, setSavingBuild] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "login" | "error">("idle");

  useEffect(() => {
    let active = true;

    void fetch(`${DDRAGON}/api/versions.json`)
      .then((response) => response.json() as Promise<string[]>)
      .then((versions) => {
        const latest = versions[0] || FALLBACK_VERSION;
        if (active) setVersion(latest);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const lang = DATA_DRAGON_LOCALE[locale];

    void Promise.all([
      fetch(`${DDRAGON}/cdn/${version}/data/${lang}/champion.json`).then(
        (response) => response.json() as Promise<{ data: Record<string, ChampionSummary> }>,
      ),
      fetch(`${DDRAGON}/cdn/${version}/data/${lang}/item.json`).then(
        (response) => response.json() as Promise<ItemPayload>,
      ),
    ])
      .then(([championPayload, itemPayload]) => {
        if (!active) return;
        const nextChampions = Object.values(championPayload.data).sort((a, b) =>
          a.name.localeCompare(b.name, locale),
        );
        setChampions(nextChampions);
        setItems(itemPayload.data);
        if (!nextChampions.some((entry) => entry.id === selectedId)) {
          setSelectedId(nextChampions[0]?.id ?? "");
        }
      })
      .catch((error) => {
        console.warn("[LeagueBuildLab] Data Dragon load failed", error);
      });

    return () => {
      active = false;
    };
  }, [locale, version]);

  const selectedChampion =
    champions.find((champion) => champion.id === selectedId) ?? champions[0] ?? null;

  useEffect(() => {
    if (!selectedChampion) return;
    let active = true;
    setLoadingBuilds(true);
    setSourceError(false);
    setBuildData(null);
    setCustomItems([]);

    void getLeagueChampionBuilds(selectedChampion.name)
      .then((data) => {
        if (active) setBuildData(data);
      })
      .catch((error) => {
        console.warn("[LeagueBuildLab] verified build source failed", error);
        if (active) setSourceError(true);
      })
      .finally(() => {
        if (active) setLoadingBuilds(false);
      });

    return () => {
      active = false;
    };
  }, [selectedChampion?.id]);

  const selectableItems = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();
    return Object.entries(items)
      .filter(([, item]) => item.maps?.["11"] !== false)
      .filter(([, item]) => !item.into?.length || Boolean(item.from?.length))
      .filter(([, item]) => {
        if (!query) return true;
        return `${item.name} ${stripMarkup(item.plaintext || item.description)}`
          .toLowerCase()
          .includes(query);
      })
      .sort(([, a], [, b]) => (b.gold?.total ?? 0) - (a.gold?.total ?? 0))
      .slice(0, 36);
  }, [itemSearch, items]);

  const addItem = (itemId: string) => {
    setCustomItems((current) => {
      if (current.includes(itemId) || current.length >= 6) return current;
      return [...current, itemId];
    });
  };

  const removeItem = (itemId: string) => {
    setCustomItems((current) => current.filter((id) => id !== itemId));
  };

  const saveCustomBuild = async () => {
    if (!selectedChampion || customItems.length < coreCount || savingBuild) return;

    setSaveStatus("idle");
    setSavingBuild(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        setSaveStatus("login");
        return;
      }

      const title =
        customTitle.trim() ||
        copy(
          `Build de ${selectedChampion.name}`,
          `${selectedChampion.name} build`,
          `Build de ${selectedChampion.name}`,
        );

      const buildItems = customItems.map((id, index) => ({
        id,
        name: items[id]?.name ?? id,
        slot: index + 1,
        core: index < coreCount,
      }));

      const rpc = supabase as unknown as SaveBuildRpcClient;
      const { error } = await rpc.rpc("save_user_build_v1", {
        p_game_slug: "league-of-legends",
        p_subject_key: selectedChampion.id,
        p_title: title,
        p_build_data: {
          championId: selectedChampion.id,
          championName: selectedChampion.name,
          coreCount,
          items: buildItems,
          explanation: explanation.trim(),
          dataDragonVersion: version,
        },
        p_source_context: {
          verifiedPatch: buildData?.patch ?? null,
          verifiedSource: buildData?.source?.label ?? null,
          verifiedSourceUrl: buildData?.source?.url ?? null,
        },
        p_visibility: "private",
      });

      if (error) throw new Error(error.message || "SAVE_BUILD_FAILED");
      setSaveStatus("saved");
    } catch (error) {
      console.error("[LeagueBuildLab] save build failed", error);
      setSaveStatus("error");
    } finally {
      setSavingBuild(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="surface-panel overflow-hidden">
        <div className="border-b border-border p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-gold-strong">
              <PackageOpen className="size-4" />
              <span className="section-kicker">BUILD LAB</span>
            </span>
            <span className="rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Riot Data Dragon · {version}
            </span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
            {copy("Builds de League of Legends", "League of Legends builds", "Builds de League of Legends")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy(
              "Escolha o campeão, compare caminhos verificados por patch e monte a sua própria versão com 1 ou 2 itens core, variantes e explicação. A NEXUS aparece como guia contextual, sem abrir o chat.",
              "Choose a champion, compare patch-verified paths and create your own version with 1 or 2 core items, variants and notes. NEXUS appears as a contextual guide without opening chat.",
              "Elige un campeón, compara rutas verificadas por parche y crea tu propia versión con 1 o 2 objetos core, variantes y explicación. NEXUS aparece como guía contextual sin abrir el chat.",
            )}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <label>
              <span className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground">
                {copy("Campeão", "Champion", "Campeón")}
              </span>
              <select
                value={selectedChampion?.id ?? ""}
                onChange={(event) => setSelectedId(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-gold/50"
              >
                {champions.map((champion) => (
                  <option key={champion.id} value={champion.id}>
                    {champion.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedChampion ? (
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-muted/10 p-3">
                <img
                  src={championIcon(version, selectedChampion)}
                  alt=""
                  className="size-16 rounded-xl border border-border object-cover"
                />
                <div className="min-w-0">
                  <p className="font-display text-xl font-semibold text-foreground">
                    {selectedChampion.name}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {selectedChampion.tags.join(" · ")}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="surface-panel p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-kicker">{copy("BUILD VERIFICADA", "VERIFIED BUILD", "BUILD VERIFICADA")}</p>
            <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
              {selectedChampion?.name ?? copy("Campeão", "Champion", "Campeón")}
            </h3>
          </div>
          {buildData?.patch ? (
            <span className="rounded-full border border-gold/25 bg-gold/[0.06] px-3 py-1 text-xs font-bold text-gold-strong">
              Patch {buildData.patch}
            </span>
          ) : null}
        </div>

        {loadingBuilds ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="h-56 animate-pulse rounded-2xl border border-border bg-muted/20" />
            <div className="h-56 animate-pulse rounded-2xl border border-border bg-muted/20" />
          </div>
        ) : sourceError || !buildData?.builds.length ? (
          <div className="mt-5 rounded-2xl border border-border bg-muted/10 p-5 text-sm leading-6 text-muted-foreground">
            {copy(
              "A fonte estatística não respondeu agora. O criador continua disponível; o MGP não preenche uma build no chute.",
              "The statistical source is unavailable right now. The builder remains available; MGP will not guess a build.",
              "La fuente estadística no respondió ahora. El creador sigue disponible; MGP no inventará una build.",
            )}
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {buildData.builds.map((build, index) => (
              <VerifiedBuildCard
                key={build.id}
                build={build}
                title={
                  index === 0
                    ? copy("Principal", "Primary", "Principal")
                    : copy("Alternativa", "Alternative", "Alternativa")
                }
                version={version}
                items={items}
              />
            ))}
          </div>
        )}

        <ReferenceLinks championName={selectedChampion?.name ?? ""} source={buildData} locale={locale} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="surface-panel p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="section-kicker">{copy("CRIADOR", "BUILDER", "CREADOR")}</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
                {copy("Crie sua build", "Create your build", "Crea tu build")}
              </h3>
            </div>
            <div className="flex rounded-xl border border-border bg-muted/10 p-1">
              {[1, 2].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setCoreCount(count as 1 | 2)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-bold transition-colors",
                    coreCount === count ? "bg-gold/15 text-gold-strong" : "text-muted-foreground",
                  )}
                >
                  {count} {copy("core", "core", "core")}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-5 block">
            <span className="text-xs font-black uppercase tracking-[0.08em] text-muted-foreground">
              {copy("Nome da build", "Build name", "Nombre de la build")}
            </span>
            <Input
              value={customTitle}
              onChange={(event) => setCustomTitle(event.target.value)}
              maxLength={100}
              className="mt-2"
              placeholder={
                selectedChampion
                  ? copy(
                      `Ex.: ${selectedChampion.name} Burst`,
                      `Example: ${selectedChampion.name} Burst`,
                      `Ej.: ${selectedChampion.name} Burst`,
                    )
                  : undefined
              }
            />
          </label>

          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => {
              const itemId = customItems[index];
              const item = itemId ? items[itemId] : undefined;
              const core = index < coreCount;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => itemId && removeItem(itemId)}
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-2xl border bg-muted/10 transition-all",
                    core ? "border-gold/45" : "border-border",
                    itemId ? "hover:-translate-y-1 hover:shadow-lift" : "border-dashed",
                  )}
                  title={itemId ? copy("Clique para remover", "Click to remove", "Haz clic para quitar") : undefined}
                >
                  {itemId ? (
                    <>
                      <img src={itemIcon(version, itemId, item)} alt="" className="h-full w-full object-cover" />
                      <span className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <X className="size-3.5" />
                      </span>
                    </>
                  ) : (
                    <span className="grid h-full place-items-center">
                      <Plus className="size-5 text-muted-foreground" />
                    </span>
                  )}
                  <span className={cn(
                    "absolute inset-x-1 bottom-1 rounded-md px-1 py-0.5 text-[0.58rem] font-black uppercase",
                    core ? "bg-gold/80 text-black" : "bg-black/65 text-white",
                  )}>
                    {core ? copy("Core", "Core", "Core") : copy("Var.", "Var.", "Var.")}
                  </span>
                </button>
              );
            })}
          </div>

          <label className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-gold/50">
            <Search className="size-4 text-muted-foreground" />
            <Input
              value={itemSearch}
              onChange={(event) => setItemSearch(event.target.value)}
              className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              placeholder={copy("Buscar item para adicionar…", "Search item to add…", "Buscar objeto para añadir…")}
            />
          </label>

          <div className="mgp-media-rail mt-4 grid max-h-[25rem] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-6 lg:grid-cols-8">
            {selectableItems.map(([id, item]) => {
              const selected = customItems.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  disabled={selected || customItems.length >= 6}
                  onClick={() => addItem(id)}
                  className="group min-w-0 rounded-xl border border-border bg-muted/10 p-2 text-center transition-all hover:border-gold/35 disabled:opacity-35"
                  title={stripMarkup(item.description || item.plaintext || item.name)}
                >
                  <img src={itemIcon(version, id, item)} alt="" loading="lazy" className="mx-auto size-12 rounded-lg object-cover" />
                  <p className="mt-2 truncate text-[0.66rem] font-semibold text-foreground">{item.name}</p>
                </button>
              );
            })}
          </div>

          <label className="mt-5 block">
            <span className="text-xs font-black uppercase tracking-[0.08em] text-muted-foreground">
              {copy("Explicação da build", "Build explanation", "Explicación de la build")}
            </span>
            <textarea
              value={explanation}
              onChange={(event) => setExplanation(event.target.value)}
              className="mt-2 min-h-28 w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none transition-colors focus:border-gold/50"
              placeholder={copy(
                "Ex.: dois itens core para burst; Zhonya entra contra dive; Banshee contra pick…",
                "Example: two core items for burst; Zhonya into dive; Banshee into pick…",
                "Ej.: dos objetos core para burst; Zhonya contra dive; Banshee contra pick…",
              )}
            />
          </label>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void saveCustomBuild()}
              disabled={savingBuild || !selectedChampion || customItems.length < coreCount}
              className="inline-flex min-h-11 items-center rounded-xl bg-gold px-4 text-sm font-bold text-gold-foreground transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {savingBuild
                ? copy("Salvando…", "Saving…", "Guardando…")
                : copy("Salvar no meu perfil", "Save to my profile", "Guardar en mi perfil")}
            </button>
            <span className="text-xs leading-5 text-muted-foreground">
              {saveStatus === "saved"
                ? copy("Build salva como privada.", "Build saved as private.", "Build guardada como privada.")
                : saveStatus === "login"
                  ? copy("Entre na sua conta para salvar permanentemente.", "Sign in to save permanently.", "Inicia sesión para guardar permanentemente.")
                  : saveStatus === "error"
                    ? copy("Não foi possível salvar agora.", "Could not save right now.", "No se pudo guardar ahora.")
                    : copy(
                        "Escolha todo o core antes de salvar. Variantes podem ficar vazias.",
                        "Choose the full core before saving. Variant slots may stay empty.",
                        "Elige todo el core antes de guardar. Las variantes pueden quedar vacías.",
                      )}
            </span>
          </div>
        </div>

        <NexusBuildGuide
          champion={selectedChampion}
          buildData={buildData}
          customItems={customItems}
          items={items}
          coreCount={coreCount}
          locale={locale}
        />
      </section>
    </div>
  );
}

function VerifiedBuildCard({
  build,
  title,
  version,
  items,
}: {
  build: LeagueBuildVariant;
  title: string;
  version: string;
  items: Record<string, ItemSummary>;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-muted/10">
      <div className="border-b border-border p-4">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-gold-strong">{title}</p>
      </div>
      <div className="p-4">
        <div className="flex gap-2">
          {build.items.map((entry, index) => {
            const item = items[entry.id];
            return (
              <div key={`${entry.id}-${index}`} className="w-16 shrink-0 text-center">
                <div className="relative overflow-hidden rounded-xl border border-border">
                  <img src={itemIcon(version, entry.id, item)} alt="" className="aspect-square w-full object-cover" />
                  <span className="absolute left-1 top-1 grid size-5 place-items-center rounded-md bg-black/70 text-[0.58rem] font-black text-white">
                    {index + 1}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[0.62rem] leading-4 text-foreground">
                  {item?.name || entry.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function ReferenceLinks({
  championName,
  source,
  locale,
}: {
  championName: string;
  source: LeagueBuildResponse | null;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  if (!championName) return null;
  const slug = slugifyChampion(championName);
  const checks = source?.crossChecks ?? [];
  const fallbackLinks = [
    { id: "riot", label: "Riot", url: `https://www.leagueoflegends.com/en-us/champions/${slug}/` },
    { id: "opgg", label: "OP.GG", url: `https://www.op.gg/champions/${slug}/build` },
    { id: "mobalytics", label: "Mobalytics", url: `https://mobalytics.gg/lol/champions/${slug}/build` },
    { id: "leagueofgraphs", label: "League of Graphs", url: `https://www.leagueofgraphs.com/champions/builds/${slug}` },
  ];
  const links = [
    source?.source.url
      ? {
          id: "lolalytics",
          label: "LoLalytics",
          url: source.source.url,
          status: "confirmed" as const,
          detail: source.patch ? `Patch ${source.patch}` : null,
        }
      : null,
    ...fallbackLinks.map((entry) => {
      const check = checks.find((item) => item.id === entry.id);
      const detail =
        check?.matchedPrimaryItems != null && check.primaryItemsChecked
          ? `${check.matchedPrimaryItems}/${check.primaryItemsChecked} core`
          : check?.patch
            ? `Patch ${check.patch}`
            : null;
      return {
        ...entry,
        status: check?.status ?? ("reachable" as const),
        detail,
      };
    }),
  ].filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return (
    <div className="mt-5 rounded-2xl border border-border bg-background/50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground">
        {copy("Referências para revisão", "Review references", "Referencias para revisión")}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((entry) => (
          <a
            key={entry.id}
            href={entry.url}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
              entry.status === "confirmed"
                ? "border-success/35 bg-success/10 text-foreground hover:border-success/60"
                : entry.status === "blocked"
                  ? "border-border bg-muted/10 text-muted-foreground"
                  : "border-border bg-muted/10 text-foreground hover:border-gold/35 hover:text-gold-strong",
            )}
          >
            {entry.label}
            {entry.status === "confirmed" ? " ✓" : entry.status === "blocked" ? " · manual" : ""}
            {entry.detail ? ` · ${entry.detail}` : ""}
            {" ↗"}
          </a>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {copy(
          "A build-base vem do LoLalytics. Fontes com ✓ responderam à verificação automática; quando aparece “manual”, a fonte bloqueou a consulta automatizada e continua apenas como referência de revisão. O MGP nunca conta uma fonte bloqueada como confirmação.",
          "The base build comes from LoLalytics. Sources with ✓ answered the automatic cross-check; “manual” means the source blocked automated access and remains a review reference only. MGP never counts a blocked source as confirmation.",
          "La build base viene de LoLalytics. Las fuentes con ✓ respondieron al cross-check automático; “manual” significa que la fuente bloqueó el acceso automatizado y queda solo como referencia de revisión. MGP nunca cuenta una fuente bloqueada como confirmación.",
        )}
      </p>
    </div>
  );
}

function NexusBuildGuide({
  champion,
  buildData,
  customItems,
  items,
  coreCount,
  locale,
}: {
  champion: ChampionSummary | null;
  buildData: LeagueBuildResponse | null;
  customItems: string[];
  items: Record<string, ItemSummary>;
  coreCount: 1 | 2;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  const primaryIds = buildData?.builds[0]?.items.map((item) => item.id) ?? [];
  const selectedCore = customItems.slice(0, coreCount);
  const shared = selectedCore.filter((id) => primaryIds.includes(id));
  const tips: Array<{ icon: typeof Sparkles; title: string; text: string }> = [];

  const confirmedChecks = buildData?.crossChecks?.filter((check) => check.status === "confirmed") ?? [];
  const opggCheck = buildData?.crossChecks?.find((check) => check.id === "opgg");
  if (confirmedChecks.length) {
    tips.push({
      icon: ShieldCheck,
      title: copy("Referência cruzada", "Cross-checked reference", "Referencia cruzada"),
      text:
        opggCheck?.matchedPrimaryItems != null && opggCheck.primaryItemsChecked
          ? copy(
              `A build atual foi checada em ${confirmedChecks.length} fonte(s) adicional(is). O OP.GG coincidiu em ${opggCheck.matchedPrimaryItems}/${opggCheck.primaryItemsChecked} itens do core principal nesta verificação.`,
              `The current build was checked against ${confirmedChecks.length} additional source(s). OP.GG matched ${opggCheck.matchedPrimaryItems}/${opggCheck.primaryItemsChecked} primary-core items in this check.`,
              `La build actual fue contrastada con ${confirmedChecks.length} fuente(s) adicional(es). OP.GG coincidió en ${opggCheck.matchedPrimaryItems}/${opggCheck.primaryItemsChecked} objetos del core principal en esta verificación.`,
            )
          : copy(
              `A referência atual respondeu em ${confirmedChecks.length} fonte(s) adicional(is). Fontes bloqueadas ou indisponíveis não entram na contagem de confirmação.`,
              `The current reference responded across ${confirmedChecks.length} additional source(s). Blocked or unavailable sources are not counted as confirmation.`,
              `La referencia actual respondió en ${confirmedChecks.length} fuente(s) adicional(es). Las fuentes bloqueadas o no disponibles no cuentan como confirmación.`,
            ),
    });
  }

  if (!customItems.length) {
    tips.push({
      icon: CircleHelp,
      title: copy("Qual é o plano da build?", "What is the build plan?", "¿Cuál es el plan de la build?"),
      text: copy(
        "Comece escolhendo 1–2 itens core. Eles devem representar o primeiro grande pico de poder, não apenas seis itens fortes jogados juntos.",
        "Start with 1–2 core items. They should represent the first major power spike, not just six strong items thrown together.",
        "Empieza con 1–2 objetos core. Deben representar el primer gran pico de poder, no seis objetos fuertes puestos juntos.",
      ),
    });
  } else if (selectedCore.length < coreCount) {
    tips.push({
      icon: Plus,
      title: copy("Falta fechar o núcleo", "Finish the core", "Falta cerrar el núcleo"),
      text: copy(
        `Você escolheu ${selectedCore.length} de ${coreCount} itens core. O próximo item deve complementar o primeiro: dano, penetração, sobrevivência ou utilidade.`,
        `You selected ${selectedCore.length} of ${coreCount} core items. The next one should complement the first: damage, penetration, survivability or utility.`,
        `Elegiste ${selectedCore.length} de ${coreCount} objetos core. El siguiente debe complementar al primero: daño, penetración, supervivencia o utilidad.`,
      ),
    });
  }

  if (selectedCore.length && primaryIds.length) {
    tips.push({
      icon: shared.length ? CheckCircle2 : BrainCircuit,
      title: shared.length
        ? copy("Você está perto da referência atual", "Close to the current reference", "Cerca de la referencia actual")
        : copy("Sua rota está saindo do padrão", "Your route is diverging", "Tu ruta se está desviando"),
      text: shared.length
        ? copy(
            `${shared.length} item(ns) core também aparecem no caminho principal verificado. Isso não torna a build automaticamente melhor, mas mostra alinhamento com a referência atual.`,
            `${shared.length} core item(s) also appear in the verified primary path. That does not automatically make the build better, but it shows alignment with the current reference.`,
            `${shared.length} objeto(s) core también aparecen en la ruta principal verificada. No hace la build automáticamente mejor, pero muestra alineación con la referencia actual.`,
          )
        : copy(
            "Isso pode ser totalmente intencional. Explique no campo da build qual matchup, composição ou estilo justifica sair do caminho estatístico principal.",
            "That may be completely intentional. Use the explanation field to say which matchup, composition or playstyle justifies leaving the primary statistical path.",
            "Puede ser totalmente intencional. Explica qué matchup, composición o estilo justifica salir de la ruta estadística principal.",
          ),
    });
  }

  if (customItems.length >= coreCount) {
    tips.push({
      icon: ShieldCheck,
      title: copy("Agora pense nas variantes", "Now think about variants", "Ahora piensa en variantes"),
      text: copy(
        "Os slots restantes não precisam ser fixos. Separe respostas para cura, armadura/MR, engage, burst inimigo ou partidas longas.",
        "The remaining slots do not need to be fixed. Separate answers for healing, armor/MR, engage, enemy burst or long games.",
        "Los slots restantes no tienen que ser fijos. Separa respuestas para curación, armadura/MR, engage, burst enemigo o partidas largas.",
      ),
    });
  }

  return (
    <aside className="surface-panel self-start overflow-hidden">
      <div className="border-b border-border bg-[radial-gradient(circle_at_top_right,hsl(var(--gold)/0.12),transparent_55%)] p-5">
        <div className="flex items-center gap-2 text-gold-strong">
          <BrainCircuit className="size-5" />
          <span className="section-kicker">NEXUS BUILD GUIDE</span>
        </div>
        <h3 className="mt-2 font-display text-xl font-bold text-foreground">
          {champion
            ? copy(`Guiando ${champion.name}`, `Guiding ${champion.name}`, `Guiando a ${champion.name}`)
            : copy("Guia contextual", "Contextual guide", "Guía contextual")}
        </h3>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {copy(
            "Sem chat: a NEXUS transforma o contexto da build e das fontes em perguntas curtas para você tomar as decisões.",
            "No chat: NEXUS turns build/source context into short prompts so you make the decisions.",
            "Sin chat: NEXUS convierte el contexto de la build y las fuentes en preguntas cortas para que tú tomes las decisiones.",
          )}
        </p>
      </div>

      <div className="space-y-3 p-4">
        {tips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <div key={`${tip.title}-${index}`} className="rounded-2xl border border-border bg-muted/10 p-4">
              <Icon className="size-4 text-gold-strong" />
              <p className="mt-2 text-sm font-bold text-foreground">{tip.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{tip.text}</p>
            </div>
          );
        })}

        {selectedCore.length ? (
          <div className="rounded-2xl border border-border bg-background/55 p-4">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground">
              {copy("Seu core atual", "Your current core", "Tu core actual")}
            </p>
            <div className="mt-2 space-y-1">
              {selectedCore.map((id) => (
                <p key={id} className="text-sm font-semibold text-foreground">
                  {items[id]?.name ?? id}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
