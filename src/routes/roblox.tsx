import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Boxes,
  ChevronRight,
  ClipboardList,
  Code2,
  Gamepad2,
  Search,
  Sparkles,
  Swords,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AdReadyLayout, AdSlot } from "@/components/common/AdSlot";
import {
  getRobloxExperience,
  ROBLOX_EXPERIENCES,
  ROBLOX_HUB_TABS,
  type RobloxHubTab,
} from "@/data/robloxExperiences";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roblox")({
  validateSearch: (search: Record<string, unknown>) => ({
    experience: typeof search["experience"] === "string" ? search["experience"].slice(0, 80) : "blox-fruits",
    tab:
      search["tab"] === "codes" ||
      search["tab"] === "tier-list" ||
      search["tab"] === "guides" ||
      search["tab"] === "builds"
        ? (search["tab"] as RobloxHubTab)
        : "overview",
  }),
  head: () => ({
    meta: [
      { title: "Roblox Anime Experiences — MGP" },
      {
        name: "description",
        content:
          "Área do MGP para experiências de Roblox com foco em anime: códigos, tier lists, guias, builds e progressão.",
      },
      { property: "og:title", content: "Roblox Anime Experiences — MGP" },
    ],
  }),
  component: RobloxHub,
});

function RobloxHub() {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const navigate = useNavigate({ from: "/roblox" });
  const search = Route.useSearch();
  const [filter, setFilter] = useState("");
  const active = getRobloxExperience(search.experience) ?? ROBLOX_EXPERIENCES[0]!;
  const tab = search.tab;

  const filtered = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return ROBLOX_EXPERIENCES;
    return ROBLOX_EXPERIENCES.filter((experience) =>
      [experience.name, experience.category, ...experience.aliases]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [filter]);

  const setExperience = (slug: string) => {
    void navigate({
      search: (current) => ({ ...current, experience: slug, tab: "overview" }),
      replace: false,
    });
  };

  const setTab = (nextTab: RobloxHubTab) => {
    void navigate({
      search: (current) => ({ ...current, tab: nextTab }),
      replace: false,
    });
  };

  return (
    <div className="pb-12">
      <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_top_right,hsl(var(--gold)/0.14),transparent_38%),linear-gradient(135deg,hsl(var(--background)),hsl(var(--surface)))]">
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-24 sm:px-6 sm:pb-14">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-gold-strong">
              <Gamepad2 className="size-3.5" />
              Roblox Experiences
            </span>
            <span className="rounded-full border border-border bg-background/50 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {copy("Anime-first", "Anime-first", "Anime-first")}
            </span>
          </div>
          <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-tight text-foreground sm:text-6xl">
            {copy(
              "Uma área para os jogos dentro do Roblox — não para o Roblox em si.",
              "A home for games inside Roblox — not Roblox itself.",
              "Un área para los juegos dentro de Roblox — no para Roblox en sí.",
            )}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            {copy(
              "O foco inicial são experiências de anime com conteúdo que muda rápido: códigos, tier lists, builds, progressão, itens, unidades e guias. Cada experiência ganha seu próprio mini-hub dentro do MGP.",
              "The initial focus is anime experiences with fast-changing content: codes, tier lists, builds, progression, items, units and guides. Each experience gets its own mini-hub inside MGP.",
              "El foco inicial son experiencias de anime con contenido que cambia rápido: códigos, tier lists, builds, progresión, objetos, unidades y guías. Cada experiencia tiene su propio mini-hub dentro de MGP.",
            )}
          </p>
        </div>
      </section>

      <AdReadyLayout
        className="mx-auto w-full max-w-[92rem] px-4 sm:px-6"
        rail={<AdSlot id="roblox-hub-rail" format="rail" />}
      >
        <div className="grid gap-6 py-7 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="surface-panel p-4">
              <label className="flex items-center gap-2 rounded-xl border border-border bg-background/55 px-3 py-2.5 focus-within:border-gold/45">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder={copy("Buscar experiência", "Search experience", "Buscar experiencia")}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </label>

              <div className="mt-3 space-y-1.5">
                {filtered.map((experience) => {
                  const selected = experience.slug === active.slug;
                  return (
                    <button
                      key={experience.slug}
                      type="button"
                      onClick={() => setExperience(experience.slug)}
                      className={cn(
                        "w-full rounded-xl border px-3 py-3 text-left transition",
                        selected
                          ? "border-gold/40 bg-gold/[0.08]"
                          : "border-transparent hover:border-border hover:bg-muted/20",
                      )}
                    >
                      <span className="block text-sm font-semibold text-foreground">{experience.name}</span>
                      <span className="mt-0.5 block text-[0.68rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                        {experience.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-gold/20 bg-gold/[0.045] p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-gold-strong" />
                <p className="text-xs font-black uppercase tracking-[0.1em] text-gold-strong">
                  {copy("Primeira leva", "First wave", "Primera ola")}
                </p>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {copy(
                  "Blox Fruits e Project Slayers 2 entram como prioridades. Anime Vanguards, Anime Last Stand e King Legacy já ficam preparados na mesma fundação.",
                  "Blox Fruits and Project Slayers 2 are the priorities. Anime Vanguards, Anime Last Stand and King Legacy are already prepared on the same foundation.",
                  "Blox Fruits y Project Slayers 2 son las prioridades. Anime Vanguards, Anime Last Stand y King Legacy ya quedan preparados sobre la misma base.",
                )}
              </p>
            </section>
          </aside>

          <main className="min-w-0 space-y-5">
            <section className="surface-panel overflow-hidden">
              <div className="border-b border-border p-5 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="section-kicker">ROBLOX / {active.category.toUpperCase()}</p>
                    <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">{active.name}</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                      {active.summary[locale]}
                    </p>
                  </div>
                  <a
                    href={active.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-border bg-muted/15 px-4 text-sm font-semibold text-foreground transition hover:border-gold/35"
                  >
                    Roblox
                    <ArrowUpRight className="size-4" />
                  </a>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {active.focusAreas[locale].map((area) => (
                    <span key={area} className="rounded-full border border-border bg-muted/20 px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto border-b border-border px-3 sm:px-5">
                <div className="flex min-w-max gap-1 py-2">
                  {ROBLOX_HUB_TABS.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setTab(entry.id)}
                      className={cn(
                        "rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                        tab === entry.id
                          ? "bg-gold/10 text-foreground"
                          : "text-muted-foreground hover:bg-muted/20 hover:text-foreground",
                      )}
                    >
                      {entry.label[locale]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 sm:p-7">
                {tab === "overview" ? <OverviewPanel experience={active} locale={locale} /> : null}
                {tab === "codes" ? <CodesPanel locale={locale} /> : null}
                {tab === "tier-list" ? (
                  <TopicPanel
                    icon={Trophy}
                    title={copy("Tier Lists", "Tier Lists", "Tier Lists")}
                    description={copy(
                      "A estrutura já separa tier lists por finalidade, evitando misturar PvE, PvP, farm e bossing numa única lista.",
                      "The structure already separates tier lists by purpose instead of mixing PvE, PvP, farming and bossing into one list.",
                      "La estructura ya separa tier lists por objetivo para no mezclar PvE, PvP, farm y bossing en una sola lista.",
                    )}
                    topics={active.tierScopes[locale]}
                  />
                ) : null}
                {tab === "guides" ? (
                  <TopicPanel
                    icon={BookOpen}
                    title={copy("Guias", "Guides", "Guías")}
                    description={copy(
                      "Guias curtos e acionáveis entram aqui, organizados por progressão e objetivo.",
                      "Short, actionable guides live here, organized by progression and goal.",
                      "Aquí viven guías cortas y accionables, organizadas por progresión y objetivo.",
                    )}
                    topics={active.guideTopics[locale]}
                  />
                ) : null}
                {tab === "builds" ? (
                  <TopicPanel
                    icon={Swords}
                    title={copy("Builds e presets", "Builds and presets", "Builds y presets")}
                    description={copy(
                      "Essa área foi preparada para presets compartilháveis e, depois, integração direta com a NEXUS para montar e aplicar builds.",
                      "This area is ready for shareable presets and later direct NEXUS integration to create and apply builds.",
                      "Esta área queda preparada para presets compartibles y, después, integración directa con NEXUS para crear y aplicar builds.",
                    )}
                    topics={active.buildTopics[locale]}
                  />
                ) : null}
              </div>
            </section>

            <AdSlot id="roblox-hub-after-content" format="leaderboard" />
          </main>
        </div>
      </AdReadyLayout>
    </div>
  );
}

function OverviewPanel({
  experience,
  locale,
}: {
  experience: (typeof ROBLOX_EXPERIENCES)[number];
  locale: "pt-BR" | "en" | "es";
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  const cards = [
    {
      icon: Code2,
      title: copy("Códigos", "Codes", "Códigos"),
      body: copy(
        "Ativos, expirados, recompensa e data da última checagem.",
        "Active, expired, reward and last verification date.",
        "Activos, expirados, recompensa y fecha de última verificación.",
      ),
    },
    {
      icon: Trophy,
      title: "Tier Lists",
      body: copy(
        "Separadas por modo e objetivo, com contexto de patch/update.",
        "Separated by mode and goal, with patch/update context.",
        "Separadas por modo y objetivo, con contexto de patch/update.",
      ),
    },
    {
      icon: ClipboardList,
      title: copy("Guias", "Guides", "Guías"),
      body: copy(
        "Progressão, farm, bosses, itens e sistemas importantes.",
        "Progression, farming, bosses, items and important systems.",
        "Progresión, farm, jefes, objetos y sistemas importantes.",
      ),
    },
    {
      icon: Boxes,
      title: copy("Builds", "Builds", "Builds"),
      body: copy(
        "Presets por objetivo, com espaço para a NEXUS ajudar a montar depois.",
        "Goal-based presets, ready for NEXUS-assisted creation later.",
        "Presets por objetivo, listos para creación asistida por NEXUS después.",
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ icon: Icon, title, body }) => (
          <article key={title} className="rounded-2xl border border-border bg-muted/10 p-4">
            <Icon className="size-5 text-gold-strong" />
            <h3 className="mt-3 font-display text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-background/45 p-5">
        <div className="flex items-center gap-2">
          <BadgeCheck className="size-4 text-gold-strong" />
          <h3 className="font-display text-base font-semibold text-foreground">
            {copy("Regra editorial do MGP", "MGP editorial rule", "Regla editorial de MGP")}
          </h3>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {copy(
            "Conteúdo que muda rápido precisa carregar data de verificação e fonte. Códigos não entram como ativos só porque aparecem em uma lista antiga; tier lists também precisam indicar o contexto em que foram montadas.",
            "Fast-changing content needs a verification date and source. Codes are not marked active just because they appear on an old list; tier lists also need to state the context they were built for.",
            "El contenido que cambia rápido necesita fecha de verificación y fuente. Los códigos no se marcan activos solo porque aparezcan en una lista antigua; las tier lists también deben indicar su contexto.",
          )}
        </p>
        <p className="mt-3 text-xs font-semibold text-muted-foreground">
          {copy("Experiência checada em", "Experience checked on", "Experiencia revisada el")}: {experience.verifiedAt}
        </p>
      </div>
    </div>
  );
}

function CodesPanel({ locale }: { locale: "pt-BR" | "en" | "es" }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gold/25 bg-gold/[0.045] p-5">
        <div className="flex items-center gap-2">
          <Code2 className="size-5 text-gold-strong" />
          <h3 className="font-display text-xl font-semibold text-foreground">
            {copy("Central de códigos", "Code center", "Centro de códigos")}
          </h3>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {copy(
            "A página já está pronta para separar códigos ativos, expirados, recompensa e data da última validação. Não vou preencher códigos antigos só para a área parecer cheia: a primeira carga entra depois de checagem por experiência.",
            "The page is ready to separate active and expired codes, rewards and last verification date. We will not fill it with stale codes just to make it look populated; the first batch comes after per-experience verification.",
            "La página ya está lista para separar códigos activos, expirados, recompensa y fecha de última validación. No se llenará con códigos viejos solo para parecer completa; la primera carga entra después de verificar cada experiencia.",
          )}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatusCard label={copy("Ativos verificados", "Verified active", "Activos verificados")} value="0" />
        <StatusCard label={copy("Expirados catalogados", "Catalogued expired", "Expirados catalogados")} value="0" />
        <StatusCard label={copy("Fila de revisão", "Review queue", "Cola de revisión")} value={copy("Pronta", "Ready", "Lista")} />
      </div>
    </div>
  );
}

function TopicPanel({
  icon: Icon,
  title,
  description,
  topics,
}: {
  icon: typeof Trophy;
  title: string;
  description: string;
  topics: string[];
}) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-gold/25 bg-gold/10">
          <Icon className="size-5 text-gold-strong" />
        </span>
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => (
          <article key={topic} className="group rounded-2xl border border-border bg-muted/10 p-4 transition hover:border-gold/30">
            <div className="flex items-center justify-between gap-3">
              <span className="font-display text-base font-semibold text-foreground">{topic}</span>
              <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-gold-strong" />
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              MGP · {topic}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/10 p-4">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
