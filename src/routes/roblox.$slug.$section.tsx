import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  ChevronRight,
  Database,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { AdReadyLayout, AdSlot } from "@/components/common/AdSlot";
import { getRobloxExperienceSection } from "@/data/robloxExperiences";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/roblox/$slug/$section")({
  loader: ({ params }) => {
    const result = getRobloxExperienceSection(params.slug, params.section);
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Conteúdo Roblox não encontrado — ÍMPAR" },
          { name: "robots", content: "noindex" },
        ],
      };
    }

    const title = `${loaderData.section.label["pt-BR"]} · ${loaderData.experience.name} — ÍMPAR`;
    const description = loaderData.section.description["pt-BR"];
    return buildSeo({
      title,
      description,
      path: `/roblox/${loaderData.experience.slug}/${loaderData.section.slug}`,
      robots: "noindex, follow",
    });
  },
  component: RobloxExperienceSectionPage,
});

function RobloxExperienceSectionPage() {
  const { experience, section } = Route.useLoaderData();
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <div className="pb-12">
      <section className="relative isolate overflow-hidden border-b border-border">
        <img
          src={experience.visual.heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,6,12,.96),rgba(3,6,12,.72)_58%,rgba(3,6,12,.45))]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-9 pt-24 sm:px-6 sm:pb-12">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/65">
            <Link to="/roblox" className="transition hover:text-white">
              Roblox
            </Link>
            <ChevronRight className="size-3" />
            <Link
              to="/roblox/$slug"
              params={{ slug: experience.slug }}
              className="transition hover:text-white"
            >
              {experience.name}
            </Link>
            <ChevronRight className="size-3" />
            <span>{section.label[locale]}</span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[0.64rem] font-black uppercase tracking-[0.1em] text-amber-100">
              {copy("Em andamento", "In progress", "En curso")}
            </span>
            <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[0.64rem] font-bold uppercase tracking-[0.1em] text-white/65">
              {experience.name}
            </span>
          </div>

          <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
            {section.label[locale]}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
            {section.description[locale]}
          </p>
        </div>
      </section>

      <AdReadyLayout
        className="mx-auto w-full max-w-[92rem] px-4 py-7 sm:px-6 sm:py-9"
        rail={<AdSlot id={`roblox-${experience.slug}-${section.slug}-rail`} format="rail" />}
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <main className="space-y-5">
            <section className="surface-panel p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-gold-strong" />
                <span className="section-kicker">
                  {copy("PÁGINA DO HUB", "HUB PAGE", "PÁGINA DEL HUB")}
                </span>
              </div>
              <h2 className="mt-3 font-display text-2xl font-semibold text-foreground">
                {copy("Estrutura pronta, conteúdo em carga", "Structure ready, content loading", "Estructura lista, contenido en carga")}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                {copy(
                  "Esta página já faz parte do hub e tem URL própria. O que falta agora é popular os dados editoriais verificados, imagens e referências específicas desta categoria sem colocar informação velha só para preencher espaço.",
                  "This page is already part of the hub and has its own URL. The remaining work is to populate verified editorial data, imagery and category-specific references without filling space with stale information.",
                  "Esta página ya forma parte del hub y tiene URL propia. Falta poblar datos editoriales verificados, imágenes y referencias específicas sin rellenar el espacio con información vieja.",
                )}
              </p>
            </section>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ProgressCard
                icon={Database}
                title={copy("Catálogo e dados", "Catalog & data", "Catálogo y datos")}
                text={copy(
                  "Itens, atributos, requisitos, formas de obtenção e relações desta categoria.",
                  "Items, attributes, requirements, acquisition methods and category relationships.",
                  "Objetos, atributos, requisitos, formas de obtención y relaciones de esta categoría.",
                )}
                locale={locale}
              />
              <ProgressCard
                icon={BookOpen}
                title={copy("Guias e comparações", "Guides & comparisons", "Guías y comparaciones")}
                text={copy(
                  "Guias curtos, comparações por objetivo e rotas de progressão relacionadas.",
                  "Short guides, goal-based comparisons and related progression routes.",
                  "Guías cortas, comparaciones por objetivo y rutas de progresión relacionadas.",
                )}
                locale={locale}
              />
              <ProgressCard
                icon={WandSparkles}
                title="Noctis · Guardião do ÍMPAR"
                text={copy(
                  "Contexto preparado para o Noctis ajudar com recomendações e presets quando os dados verificáveis estiverem carregados.",
                  "Context is prepared for Noctis recommendations and presets once verifiable data is loaded.",
                  "El contexto queda preparado para recomendaciones y presets de NEXUS cuando los datos verificables estén cargados.",
                )}
                locale={locale}
              />
            </div>
          </main>

          <aside className="space-y-4">
            <section className="surface-panel rounded-2xl p-5">
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-gold-strong" />
                <h3 className="font-display text-base font-semibold text-foreground">
                  {copy("Status", "Status", "Estado")}
                </h3>
              </div>
              <div className="mt-4 space-y-2.5">
                <StatusLine
                  label={copy("Rota e navegação", "Route & navigation", "Ruta y navegación")}
                  done
                  locale={locale}
                />
                <StatusLine
                  label={copy("Layout do hub", "Hub layout", "Layout del hub")}
                  done
                  locale={locale}
                />
                <StatusLine
                  label={copy("Dados editoriais", "Editorial data", "Datos editoriales")}
                  locale={locale}
                />
                <StatusLine
                  label={copy("Assets específicos", "Specific assets", "Assets específicos")}
                  locale={locale}
                />
              </div>
            </section>

            <Link
              to="/roblox/$slug"
              params={{ slug: experience.slug }}
              className="surface-panel flex items-center gap-2 rounded-2xl p-4 text-sm font-semibold text-foreground transition hover:border-gold/30"
            >
              <ArrowLeft className="size-4 text-gold-strong" />
              {copy("Voltar ao hub", "Back to hub", "Volver al hub")}
            </Link>
          </aside>
        </div>
      </AdReadyLayout>
    </div>
  );
}

function ProgressCard({
  icon: Icon,
  title,
  text,
  locale,
}: {
  icon: typeof Database;
  title: string;
  text: string;
  locale: "pt-BR" | "en" | "es";
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  return (
    <article className="surface-panel rounded-2xl p-5">
      <Icon className="size-5 text-gold-strong" />
      <h3 className="mt-3 font-display text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
      <span className="mt-4 inline-flex rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[0.58rem] font-black uppercase tracking-[0.08em] text-amber-200">
        {copy("Em andamento", "In progress", "En curso")}
      </span>
    </article>
  );
}

function StatusLine({
  label,
  done = false,
  locale,
}: {
  label: string;
  done?: boolean;
  locale: "pt-BR" | "en" | "es";
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/10 px-3 py-2.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <span
        className={
          done
            ? "rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[0.56rem] font-black uppercase tracking-[0.08em] text-emerald-200"
            : "rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[0.56rem] font-black uppercase tracking-[0.08em] text-amber-200"
        }
      >
        {done
          ? copy("Pronto", "Ready", "Listo")
          : copy("Em andamento", "In progress", "En curso")}
      </span>
    </div>
  );
}
