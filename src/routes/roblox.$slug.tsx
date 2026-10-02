import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Code2,
  Gamepad2,
  Menu,
  Sparkles,
  Swords,
  Trophy,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AdReadyLayout, AdSlot } from "@/components/common/AdSlot";
import {
  getRobloxExperience,
  ROBLOX_HUB_TABS,
  type RobloxExperience,
  type RobloxHubTab,
} from "@/data/robloxExperiences";
import { useI18n, type Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/roblox/$slug")({
  loader: ({ params }) => {
    const experience = getRobloxExperience(params.slug);
    if (!experience) throw notFound();
    return { experience };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Roblox Experience não encontrada — ÍMPAR" },
          { name: "robots", content: "noindex" },
        ],
      };
    }

    const title = `${loaderData.experience.name} — ÍMPAR`;
    const description = `Códigos, tier lists, guias, builds e progressão de ${loaderData.experience.name} no ÍMPAR.`;
    return buildSeo({
      title,
      description,
      path: `/roblox/${loaderData.experience.slug}`,
    });
  },
  component: RobloxExperienceHub,
  notFoundComponent: RobloxHubMissing,
});

function RobloxHubMissing() {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <div className="surface-panel rounded-2xl p-8 text-center">
        <h1 className="font-display text-2xl font-bold">
          {copy("Experiência não encontrada", "Experience not found", "Experiencia no encontrada")}
        </h1>
        <Link
          to="/roblox"
          className="mt-5 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          {copy("Voltar para Roblox", "Back to Roblox", "Volver a Roblox")}
        </Link>
      </div>
    </div>
  );
}

function RobloxExperienceHub() {
  const { experience } = Route.useLoaderData();
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const panelRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<RobloxHubTab>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setActive("overview");
    setMobileMenuOpen(false);
  }, [experience.slug]);

  const handleTab = (tab: RobloxHubTab, scroll = false) => {
    setActive(tab);
    if (!scroll) return;

    requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panelRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  return (
    <div className="game-hub game-hub-tactical overflow-x-clip pb-10">
      <section className="game-hub-hero relative isolate overflow-hidden border-b border-border">
        <img
          src={experience.visual.heroImage}
          alt=""
          className="game-hub-artwork absolute inset-0 h-full w-full object-cover"
        />
        <div className="game-hub-scrim absolute inset-0" />
        <div className="game-hub-grain absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto grid min-h-[26rem] w-full max-w-7xl items-end gap-7 px-4 pb-7 pt-20 sm:min-h-[32rem] sm:px-6 sm:pb-10 sm:pt-24 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <div className="group hidden aspect-[3/4] overflow-hidden rounded-lg border border-hero-border bg-hero-surface shadow-lift lg:block">
            <img
              src={experience.visual.coverImage}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-hero-muted">
              <Link to="/roblox" className="transition hover:text-white">
                Roblox Experiences
              </Link>
              <ChevronRight className="size-3" />
              <span>{experience.category}</span>
            </div>

            <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-hero-foreground sm:text-6xl">
              {experience.name}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-hero-muted sm:text-base">
              {experience.summary[locale]}
            </p>

            <ul className="mt-5 flex flex-wrap gap-1.5">
              <li className="rounded-full border border-hero-border bg-hero-surface px-3 py-1 text-xs font-semibold text-hero-muted backdrop-blur">
                Roblox
              </li>
              {experience.focusAreas[locale].slice(0, 5).map((area) => (
                <li
                  key={area}
                  className="rounded-full border border-hero-border bg-hero-surface px-3 py-1 text-xs font-medium text-hero-muted backdrop-blur"
                >
                  {area}
                </li>
              ))}
            </ul>

            <a
              href={experience.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-hero-border bg-hero-surface px-4 py-2.5 text-sm font-semibold text-hero-foreground backdrop-blur transition hover:border-gold/40"
            >
              {copy("Abrir no Roblox", "Open on Roblox", "Abrir en Roblox")}
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <AdReadyLayout
        className="mx-auto min-w-0 w-full max-w-[92rem] px-4 sm:px-6"
        rail={<AdSlot id={`roblox-${experience.slug}-rail`} format="rail" />}
      >
        <div className="min-w-0">
          <div className="sticky top-[4.25rem] z-30 -mx-2 py-2 md:hidden">
            <div className="max-h-[calc(100dvh-5.25rem)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-background/96 p-2 shadow-lift backdrop-blur-lg">
              <button
                type="button"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-roblox-hub-navigation"
                onClick={() => setMobileMenuOpen((value) => !value)}
                className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gold/10 text-gold-strong">
                    <Menu className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {copy("Navegar no hub", "Browse hub", "Navegar por el hub")}
                    </span>
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {tabLabel(active, locale)}
                    </span>
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform",
                    mobileMenuOpen && "rotate-180",
                  )}
                />
              </button>

              {mobileMenuOpen ? (
                <div
                  id="mobile-roblox-hub-navigation"
                  className="mt-1 grid grid-cols-2 gap-1 border-t border-border pt-2"
                >
                  {ROBLOX_HUB_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      aria-pressed={active === tab.id}
                      onClick={() => {
                        handleTab(tab.id, true);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "min-h-11 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition-colors",
                        active === tab.id
                          ? "bg-gold/10 text-foreground"
                          : "text-muted-foreground hover:bg-muted/35 hover:text-foreground",
                      )}
                    >
                      {tab.label[locale]}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div
            role="tablist"
            aria-label={experience.name}
            className="hub-tablist hidden gap-1 overflow-x-auto border-b border-border py-3 md:flex"
          >
            {ROBLOX_HUB_TABS.map((tab) => {
              const selected = active === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`roblox-hub-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="roblox-hub-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => handleTab(tab.id)}
                  className={cn(
                    "hub-tab shrink-0 px-3.5 py-3 text-sm font-semibold",
                    selected ? "hub-tab-active text-foreground" : "text-muted-foreground",
                  )}
                >
                  {tab.label[locale]}
                </button>
              );
            })}
          </div>

          <div
            ref={panelRef}
            id="roblox-hub-panel"
            role="tabpanel"
            aria-label={tabLabel(active, locale)}
            tabIndex={0}
            className="min-w-0 scroll-mt-36 py-5 outline-none sm:scroll-mt-24 sm:py-8"
          >
            <div
              key={active}
              className="animate-in fade-in slide-in-from-bottom-2 duration-200 motion-reduce:animate-none"
            >
              {active === "overview" ? <OverviewPanel experience={experience} locale={locale} /> : null}
              {active === "codes" ? <CodesPanel experience={experience} locale={locale} /> : null}
              {active === "tier-list" ? (
                <TopicPanel
                  icon={Trophy}
                  kicker="ÍMPAR / TIER LISTS"
                  title="Tier Lists"
                  description={copy(
                    "Listas separadas por finalidade para não misturar PvE, PvP, farm e bossing sem contexto.",
                    "Lists are separated by purpose so PvE, PvP, farming and bossing are not mixed without context.",
                    "Las listas se separan por objetivo para no mezclar PvE, PvP, farm y bossing sin contexto.",
                  )}
                  topics={experience.tierScopes[locale]}
                  locale={locale}
                />
              ) : null}
              {active === "guides" ? (
                <TopicPanel
                  icon={BookOpen}
                  kicker="ÍMPAR / GUIDES"
                  title={copy("Guias", "Guides", "Guías")}
                  description={copy(
                    "Rotas de progressão, farm, bosses, desbloqueios e sistemas importantes da experiência.",
                    "Progression routes, farming, bosses, unlocks and important systems for the experience.",
                    "Rutas de progresión, farm, jefes, desbloqueos y sistemas importantes de la experiencia.",
                  )}
                  topics={experience.guideTopics[locale]}
                  locale={locale}
                />
              ) : null}
              {active === "builds" ? (
                <TopicPanel
                  icon={Swords}
                  kicker="ÍMPAR / BUILDS"
                  title={copy("Builds e presets", "Builds and presets", "Builds y presets")}
                  description={copy(
                    "Presets organizados por objetivo. Essa área pode receber o mesmo fluxo do Noctis usado nos outros criadores do ÍMPAR.",
                    "Goal-based presets. This area can use the same Noctis flow as the other ÍMPAR builders.",
                    "Presets organizados por objetivo. Esta área puede usar el mismo flujo NEXUS que los otros creadores de ÍMPAR.",
                  )}
                  topics={experience.buildTopics[locale]}
                  locale={locale}
                />
              ) : null}
            </div>
          </div>

          <AdSlot id={`roblox-${experience.slug}-after-panel`} format="leaderboard" />
        </div>
      </AdReadyLayout>
    </div>
  );
}

function OverviewPanel({
  experience,
  locale,
}: {
  experience: RobloxExperience;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <div className="space-y-6">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <article className="surface-panel min-w-0 overflow-hidden p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-gold-strong" />
            <span className="section-kicker">
              {copy("FICHA DA EXPERIÊNCIA", "EXPERIENCE PROFILE", "FICHA DE LA EXPERIENCIA")}
            </span>
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold text-foreground">
            {copy("Sobre", "About", "Sobre")} {experience.name}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
            {experience.summary[locale]}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {experience.sections.map((section) => (
              <Link
                key={section.slug}
                to="/roblox/$slug/$section"
                params={{ slug: experience.slug, section: section.slug }}
                className="group rounded-xl border border-border bg-muted/10 p-4 transition hover:border-gold/30 hover:bg-gold/[0.035]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
                      {copy("Área do hub", "Hub area", "Área del hub")}
                    </p>
                    <p className="mt-1 font-semibold text-foreground">{section.label[locale]}</p>
                  </div>
                  <ProgressBadge locale={locale} compact />
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {section.description[locale]}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-gold-strong">
                  {copy("Abrir página", "Open page", "Abrir página")}
                  <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </article>

        <aside className="space-y-4">
          <section className="surface-panel rounded-2xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-gold-strong" />
                <h3 className="font-display text-base font-semibold text-foreground">
                  {copy("Status do hub", "Hub status", "Estado del hub")}
                </h3>
              </div>
              <ProgressBadge locale={locale} />
            </div>
            <div className="mt-4 space-y-3">
              <HubStatusRow
                label={copy("Estrutura e navegação", "Structure and navigation", "Estructura y navegación")}
                ready={experience.hubStatus.structure === "ready"}
                locale={locale}
              />
              <HubStatusRow
                label={copy("Conteúdo editorial", "Editorial content", "Contenido editorial")}
                ready={experience.hubStatus.editorial === "ready"}
                locale={locale}
              />
              <HubStatusRow
                label={copy("Conteúdo das páginas", "Page content", "Contenido de las páginas")}
                ready={false}
                locale={locale}
              />
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              {copy(
                "A fundação do hub está pronta. As páginas de conteúdo, códigos verificados, tier lists e guias estão sendo populadas por experiência.",
                "The hub foundation is ready. Content pages, verified codes, tier lists and guides are being populated per experience.",
                "La base del hub está lista. Las páginas de contenido, códigos verificados, tier lists y guías se están poblando por experiencia.",
              )}
            </p>
            <p className="mt-3 text-xs font-semibold text-foreground">
              {copy("Última checagem da experiência", "Experience last checked", "Última revisión de la experiencia")}:{" "}
              {experience.verifiedAt}
            </p>
          </section>

          <section className="surface-panel rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <Gamepad2 className="size-4 text-gold-strong" />
              <h3 className="font-display text-base font-semibold text-foreground">Roblox</h3>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Place ID: {experience.placeId}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function CodesPanel({
  experience,
  locale,
}: {
  experience: RobloxExperience;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <div className="space-y-6">
      <section className="surface-panel p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Code2 className="size-5 text-gold-strong" />
          <span className="section-kicker">ÍMPAR / CODES</span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-semibold text-foreground">
          {copy("Códigos de", "Codes for", "Códigos de")} {experience.name}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          {copy(
            "O hub separa códigos ativos e expirados, registra recompensa, fonte e a última validação. Enquanto a primeira checagem não for feita, nenhum código é marcado como ativo.",
            "The hub separates active and expired codes and records reward, source and last verification. Until the first validation is complete, no code is marked active.",
            "El hub separa códigos activos y expirados y registra recompensa, fuente y última validación. Hasta completar la primera verificación, ningún código se marca como activo.",
          )}
        </p>

        <div className="mt-5">
          <ProgressBadge locale={locale} />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <StatusCard label={copy("Ativos verificados", "Verified active", "Activos verificados")} value="—" />
          <StatusCard label={copy("Expirados catalogados", "Catalogued expired", "Expirados catalogados")} value="—" />
          <StatusCard label={copy("Carga editorial", "Editorial load", "Carga editorial")} value={copy("Em andamento", "In progress", "En curso")} />
        </div>
      </section>
    </div>
  );
}

function TopicPanel({
  icon: Icon,
  kicker,
  title,
  description,
  topics,
  locale,
}: {
  icon: typeof Trophy;
  kicker: string;
  title: string;
  description: string;
  topics: string[];
  locale: Locale;
}) {
  return (
    <section className="surface-panel p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-gold-strong" />
        <span className="section-kicker">{kicker}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
        <ProgressBadge locale={locale} />
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{description}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {topics.map((topic) => (
          <article
            key={topic}
            className="group rounded-2xl border border-border bg-muted/10 p-4 transition hover:border-gold/30"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-display text-base font-semibold text-foreground">{topic}</span>
              <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-gold-strong" />
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              ÍMPAR · {topic}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProgressBadge({
  locale,
  compact = false,
}: {
  locale: Locale;
  compact?: boolean;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-amber-400/25 bg-amber-400/10 font-bold uppercase tracking-[0.09em] text-amber-200",
        compact ? "px-2 py-0.5 text-[0.56rem]" : "px-2.5 py-1 text-[0.62rem]",
      )}
    >
      {copy("Em andamento", "In progress", "En curso")}
    </span>
  );
}

function HubStatusRow({
  label,
  ready,
  locale,
}: {
  label: string;
  ready: boolean;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/10 px-3 py-2.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <span
        className={cn(
          "rounded-full border px-2 py-0.5 text-[0.56rem] font-black uppercase tracking-[0.08em]",
          ready
            ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
            : "border-amber-400/25 bg-amber-400/10 text-amber-200",
        )}
      >
        {ready
          ? copy("Pronto", "Ready", "Listo")
          : copy("Em andamento", "In progress", "En curso")}
      </span>
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/10 p-4">
      <p className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function tabLabel(tab: RobloxHubTab, locale: Locale) {
  return ROBLOX_HUB_TABS.find((entry) => entry.id === tab)?.label[locale] ?? tab;
}
