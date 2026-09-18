import { createFileRoute } from "@tanstack/react-router";
import {
  BrainCircuit,
  Gauge,
  ImageIcon,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Workflow,
  EyeOff,
} from "lucide-react";

import {
  AI_CORE_REGISTRY,
  AI_COUNCIL_NAME,
  type AiCoreId,
} from "@/config/aiCores";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

export const Route = createFileRoute("/nexus")({
  head: () => ({
    meta: [
      { title: "NEXUS · Os Sete — MG Profile" },
      {
        name: "description",
        content:
          "Conheça a NEXUS e os seis núcleos especializados que formam Os Sete no MG Profile.",
      },
    ],
  }),
  component: NexusCouncilPage,
});

const CORE_ICONS: Record<AiCoreId, typeof BrainCircuit> = {
  nexus: BrainCircuit,
  aegis: ShieldCheck,
  veil: EyeOff,
  atlas: ImageIcon,
  pulse: SearchCheck,
  gear: Workflow,
  vector: Gauge,
};

const CORE_COPY: Record<
  AiCoreId,
  {
    domain: [string, string, string];
    mission: [string, string, string];
  }
> = {
  nexus: {
    domain: ["Coordenação e IA", "Coordination & AI", "Coordinación e IA"],
    mission: [
      "Recebe o objetivo, escolhe os núcleos necessários, integra as decisões e mantém uma única direção para o MG Profile.",
      "Owns the objective, selects the necessary cores, integrates decisions and keeps one direction for MG Profile.",
      "Recibe el objetivo, selecciona los núcleos necesarios, integra las decisiones y mantiene una sola dirección para MG Profile.",
    ],
  },
  aegis: {
    domain: ["Segurança", "Security", "Seguridad"],
    mission: [
      "Protege autenticação, permissões, segredos, APIs e superfícies de ataque.",
      "Protects authentication, permissions, secrets, APIs and attack surfaces.",
      "Protege autenticación, permisos, secretos, APIs y superficies de ataque.",
    ],
  },
  veil: {
    domain: ["Privacidade", "Privacy", "Privacidad"],
    mission: [
      "Revisa dados pessoais, visibilidade, consentimento, retenção e telemetria.",
      "Reviews personal data, visibility, consent, retention and telemetry.",
      "Revisa datos personales, visibilidad, consentimiento, retención y telemetría.",
    ],
  },
  atlas: {
    domain: ["Direitos e procedência", "Rights & provenance", "Derechos y procedencia"],
    mission: [
      "Confere origem, licença, atribuição e regras de reutilização de imagens e mídia.",
      "Checks provenance, licensing, attribution and reuse rules for images and media.",
      "Comprueba procedencia, licencias, atribución y reglas de reutilización de imágenes y medios.",
    ],
  },
  pulse: {
    domain: ["Pesquisa e atualizações", "Research & updates", "Investigación y actualizaciones"],
    mission: [
      "Investiga dados que envelhecem, fontes, patches, elencos e necessidade de atualização.",
      "Investigates aging data, sources, patches, rosters and refresh needs.",
      "Investiga datos que envejecen, fuentes, parches, plantillas y necesidades de actualización.",
    ],
  },
  gear: {
    domain: ["Automação", "Automation", "Automatización"],
    mission: [
      "Transforma rotinas estáveis em validações, pipelines e automações confiáveis.",
      "Turns stable routines into reliable validations, pipelines and automations.",
      "Convierte rutinas estables en validaciones, pipelines y automatizaciones confiables.",
    ],
  },
  vector: {
    domain: ["Performance e UX", "Performance & UX", "Rendimiento y UX"],
    mission: [
      "Cuida de desempenho, responsividade, peso de mídia, renderização e eficiência da experiência.",
      "Owns performance, responsiveness, media weight, rendering and experience efficiency.",
      "Cuida del rendimiento, responsividad, peso de medios, renderizado y eficiencia de la experiencia.",
    ],
  },
};

const ORDER: AiCoreId[] = [
  "nexus",
  "aegis",
  "veil",
  "atlas",
  "pulse",
  "gear",
  "vector",
];

function NexusCouncilPage() {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-soft sm:p-9">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 12% 10%, color-mix(in oklab, #C9A95D 17%, transparent), transparent 32rem)",
          }}
        />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-gold-strong">
            <Sparkles className="size-3.5" />
            {copy("IA do MG Profile", "MG Profile AI", "IA de MG Profile")}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground sm:text-5xl">
            {AI_COUNCIL_NAME}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {copy(
              "A NEXUS é a regente. Os outros seis núcleos são especializações sob a coordenação dela: cada um revisa uma parte diferente do produto, sem substituir a decisão integrada da NEXUS.",
              "NEXUS is the orchestrator. The other six cores are specialist layers under its coordination: each reviews a different part of the product without replacing NEXUS's integrated decision.",
              "NEXUS es la regente. Los otros seis núcleos son especializaciones bajo su coordinación: cada uno revisa una parte distinta del producto sin sustituir la decisión integrada de NEXUS.",
            )}
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ORDER.map((id) => {
          const core = AI_CORE_REGISTRY[id];
          const Icon = CORE_ICONS[id];
          const localized = CORE_COPY[id];

          return (
            <article
              key={id}
              className={
                id === "nexus"
                  ? "relative overflow-hidden rounded-3xl border border-gold/30 bg-surface p-5 shadow-soft md:col-span-2 xl:col-span-3 sm:p-6"
                  : "relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6"
              }
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ backgroundColor: core.accent }}
                aria-hidden="true"
              />
              <div className="flex items-start gap-4">
                <div
                  className="grid size-12 shrink-0 place-items-center rounded-2xl border text-lg font-black shadow-soft"
                  style={{
                    color: core.accent,
                    borderColor: `${core.accent}66`,
                    backgroundColor: `${core.accent}16`,
                  }}
                  aria-label={copy(
                    `Letra de ${core.name}: ${core.letter}`,
                    `${core.name} letter: ${core.letter}`,
                    `Letra de ${core.name}: ${core.letter}`,
                  )}
                >
                  {core.letter}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {core.name}
                    </h2>
                    <span
                      className="rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]"
                      style={{
                        color: core.accent,
                        borderColor: `${core.accent}55`,
                        backgroundColor: `${core.accent}12`,
                      }}
                    >
                      {localized.domain[locale === "pt-BR" ? 0 : locale === "en" ? 1 : 2]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {core.epithet}
                  </p>
                </div>

                <div
                  className="grid size-9 shrink-0 place-items-center rounded-xl border"
                  style={{
                    color: core.accent,
                    borderColor: `${core.accent}44`,
                    backgroundColor: `${core.accent}0F`,
                  }}
                  aria-hidden="true"
                >
                  <Icon className="size-4" />
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                {localized.mission[locale === "pt-BR" ? 0 : locale === "en" ? 1 : 2]}
              </p>

              <div className="mt-5 border-t border-border pt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {copy("Identidade técnica", "Technical identity", "Identidad técnica")}
                </p>
                <p className="mt-1 text-xs text-foreground">
                  {core.legacyName} · {core.kind === "orchestrator"
                    ? copy("orquestradora", "orchestrator", "orquestadora")
                    : copy("especialista", "specialist", "especialista")}
                </p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-muted/15 p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold text-foreground">
          {copy("Como Os Sete trabalham", "How the Seven work", "Cómo trabajan Los Siete")}
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {copy(
            "Um núcleo pode identificar um risco ou uma melhoria, mas a NEXUS continua sendo a coordenadora. Mudanças destrutivas ou que impactam produção exigem aprovação humana; nenhuma IA deve afirmar que executou uma ação que o sistema não confirmou.",
            "A core may identify a risk or improvement, but NEXUS remains the coordinator. Destructive or production-impacting changes require human approval; no AI should claim an action happened unless the system confirmed it.",
            "Un núcleo puede identificar un riesgo o una mejora, pero NEXUS sigue siendo la coordinadora. Los cambios destructivos o con impacto en producción requieren aprobación humana; ninguna IA debe afirmar que ejecutó una acción que el sistema no confirmó.",
          )}
        </p>
      </section>
    </main>
  );
}
