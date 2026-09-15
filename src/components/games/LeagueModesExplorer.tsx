import { useEffect, useMemo, useState } from "react";
import { Bot, Crosshair, Dumbbell, ShieldCheck, Sparkles, Swords, Zap } from "lucide-react";
import { DataSourceIndicator } from "@/components/common/DataSourceIndicator";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

const DDRAGON = "https://ddragon.leagueoflegends.com";
const FALLBACK_VERSION = "16.18.1";
const DATA_DRAGON_LOCALE: Record<Locale, string> = { "pt-BR": "pt_BR", en: "en_US", es: "es_ES" };

type LeagueMap = {
  MapName?: string;
  MapId?: string;
  mapName?: string;
  mapId?: string;
  image?: { full: string };
};

type MapPayload = { data: Record<string, LeagueMap> };

type ModeKey = "ranked" | "swiftplay" | "aram" | "arena" | "coop" | "practice";

type ModeDefinition = {
  key: ModeKey;
  mapId: string | null;
  permanent: boolean;
  teamSize: string;
  icon: typeof Swords;
  officialUrl: string;
};

const MODES: ModeDefinition[] = [
  {
    key: "ranked",
    mapId: "11",
    permanent: true,
    teamSize: "5v5",
    icon: Swords,
    officialUrl: "https://www.leagueoflegends.com/",
  },
  {
    key: "swiftplay",
    mapId: "11",
    permanent: true,
    teamSize: "5v5",
    icon: Zap,
    officialUrl: "https://www.leagueoflegends.com/news/dev/dev-a-swifter-swiftplay/",
  },
  {
    key: "aram",
    mapId: "12",
    permanent: true,
    teamSize: "5v5",
    icon: Crosshair,
    officialUrl: "https://www.leagueoflegends.com/news/game-updates/",
  },
  {
    key: "arena",
    mapId: "30",
    permanent: false,
    teamSize: "multi-team",
    icon: Sparkles,
    officialUrl: "https://www.leagueoflegends.com/news/game-updates/",
  },
  {
    key: "coop",
    mapId: "11",
    permanent: true,
    teamSize: "5 players",
    icon: Bot,
    officialUrl: "https://www.leagueoflegends.com/",
  },
  {
    key: "practice",
    mapId: "11",
    permanent: true,
    teamSize: "solo",
    icon: Dumbbell,
    officialUrl: "https://www.leagueoflegends.com/",
  },
];

function modeCopy(locale: Locale, key: ModeKey) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const entries: Record<ModeKey, { name: string; short: string; description: string; objective: string }> = {
    ranked: {
      name: copy("Summoner's Rift · Normal e Ranqueada", "Summoner's Rift · Normal & Ranked", "Grieta del Invocador · Normal y Clasificatoria"),
      short: copy("A experiência competitiva principal do League.", "League's main competitive experience.", "La experiencia competitiva principal de League."),
      description: copy(
        "Duas equipes de cinco jogadores disputam rotas, objetivos e controle de mapa até destruir o Nexus adversário. A mesma arena sustenta filas normais, ranqueadas e Clash.",
        "Two teams of five contest lanes, objectives and map control until one destroys the enemy Nexus. The same battleground supports normal, ranked and Clash play.",
        "Dos equipos de cinco disputan líneas, objetivos y control del mapa hasta destruir el Nexo rival. El mismo campo sostiene partidas normales, clasificatorias y Clash.",
      ),
      objective: copy("Destruir o Nexus inimigo.", "Destroy the enemy Nexus.", "Destruir el Nexo enemigo."),
    },
    swiftplay: {
      name: "Swiftplay",
      short: copy("Summoner's Rift em ritmo acelerado.", "A faster-paced Summoner's Rift queue.", "Grieta del Invocador a un ritmo más rápido."),
      description: copy(
        "Fila 5v5 criada para preservar a fantasia completa de uma partida de League, mas reduzir o peso de vantagens iniciais e acelerar a progressão da partida.",
        "A 5v5 queue designed to keep the full League match arc while reducing the punishment of early disadvantages and accelerating progression.",
        "Una cola 5v5 pensada para conservar el arco completo de League reduciendo el castigo de las desventajas tempranas y acelerando la progresión.",
      ),
      objective: copy("Chegar ao late game mais rápido sem abandonar o macro do Rift.", "Reach the late game faster without removing Rift macro play.", "Llegar antes al juego tardío sin perder el macro de la Grieta."),
    },
    aram: {
      name: "ARAM",
      short: copy("Uma rota, campeões aleatórios e luta constante.", "One lane, random champions and constant fighting.", "Una línea, campeones aleatorios y combate constante."),
      description: copy(
        "O modo All Random All Mid coloca duas equipes na Howling Abyss. A seleção aleatória e a única rota transformam composição, teamfight e adaptação no centro da partida.",
        "All Random All Mid puts two teams on the Howling Abyss. Random champion selection and a single lane make composition, teamfighting and adaptation the focus.",
        "All Random All Mid enfrenta a dos equipos en el Abismo de los Lamentos. La selección aleatoria y una sola línea priorizan composición, peleas y adaptación.",
      ),
      objective: copy("Vencer teamfights e avançar pela única rota até o Nexus.", "Win teamfights and push the single lane to the Nexus.", "Ganar peleas y avanzar por la única línea hasta el Nexo."),
    },
    arena: {
      name: "Arena",
      short: copy("Combates curtos, Aprimoramentos e múltiplas equipes.", "Short rounds, Augments and multiple teams.", "Rondas cortas, Aumentos y múltiples equipos."),
      description: copy(
        "Arena é um formato alternativo focado em rodadas de combate, escolhas de Aprimoramentos e builds fora do padrão do Rift. A Riot ajusta estrutura e regras ao longo das temporadas.",
        "Arena is an alternate format built around combat rounds, Augment choices and builds outside standard Rift play. Riot adjusts its structure and rules across seasons.",
        "Arena es un formato alternativo de rondas de combate, selección de Aumentos y builds fuera del Rift tradicional. Riot ajusta su estructura y reglas entre temporadas.",
      ),
      objective: copy("Sobreviver às rodadas e adaptar sua build aos oponentes.", "Survive rounds and adapt your build to the opposition.", "Sobrevivir las rondas y adaptar la build a los rivales."),
    },
    coop: {
      name: copy("Co-op vs. IA", "Co-op vs. AI", "Cooperativo vs. IA"),
      short: copy("Aprenda o Rift enfrentando bots.", "Learn the Rift against bots.", "Aprende la Grieta contra bots."),
      description: copy(
        "Uma porta de entrada para jogadores novos ou para testar campeões com menos pressão, mantendo a estrutura básica de Summoner's Rift.",
        "A lower-pressure entry point for new players or champion testing while keeping the basic Summoner's Rift structure.",
        "Una entrada con menos presión para jugadores nuevos o para probar campeones manteniendo la estructura básica de la Grieta.",
      ),
      objective: copy("Praticar fundamentos e concluir a partida contra IA.", "Practice fundamentals and complete a match against AI.", "Practicar fundamentos y completar una partida contra IA."),
    },
    practice: {
      name: copy("Ferramenta de Treino", "Practice Tool", "Herramienta de Práctica"),
      short: copy("Laboratório para mecânica, combos e testes.", "A sandbox for mechanics, combos and testing.", "Un laboratorio para mecánicas, combos y pruebas."),
      description: copy(
        "Ambiente controlado para testar dano, tempos, combos, rotas, interações e configurações sem a pressão de uma partida normal.",
        "A controlled environment to test damage, timings, combos, routes, interactions and settings without match pressure.",
        "Un entorno controlado para probar daño, tiempos, combos, rutas, interacciones y ajustes sin presión de partida.",
      ),
      objective: copy("Treinar e experimentar livremente.", "Train and experiment freely.", "Entrenar y experimentar libremente."),
    },
  };
  return entries[key];
}

export function LeagueModesExplorer({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [version, setVersion] = useState(FALLBACK_VERSION);
  const [maps, setMaps] = useState<Record<string, LeagueMap>>({});
  const [selectedKey, setSelectedKey] = useState<ModeKey>("ranked");

  useEffect(() => {
    const controller = new AbortController();
    async function loadMaps() {
      try {
        let current = FALLBACK_VERSION;
        const versionsResponse = await fetch(`${DDRAGON}/api/versions.json`, { signal: controller.signal });
        if (versionsResponse.ok) {
          const versions = (await versionsResponse.json()) as string[];
          current = versions[0] || FALLBACK_VERSION;
        }
        const response = await fetch(`${DDRAGON}/cdn/${current}/data/${DATA_DRAGON_LOCALE[locale]}/map.json`, { signal: controller.signal });
        if (!response.ok) return;
        const payload = (await response.json()) as MapPayload;
        const byId: Record<string, LeagueMap> = {};
        Object.values(payload.data).forEach((map) => {
          const id = map.MapId ?? map.mapId;
          if (id) byId[String(id)] = map;
        });
        setVersion(current);
        setMaps(byId);
      } catch (error) {
        if (!controller.signal.aborted) console.warn("[League] Mode artwork fallback in use.", error);
      }
    }
    void loadMaps();
    return () => controller.abort();
  }, [locale]);

  const selected = useMemo(() => MODES.find((mode) => mode.key === selectedKey) ?? MODES[0], [selectedKey]);
  if (!selected) return null;
  const selectedCopy = modeCopy(locale, selected.key);
  const selectedMap = selected.mapId ? maps[selected.mapId] : undefined;

  const imageUrl = (mode: ModeDefinition) => {
    if (!mode.mapId) return null;
    const map = maps[mode.mapId];
    return map?.image?.full ? `${DDRAGON}/cdn/${version}/img/map/${map.image.full}` : null;
  };

  return (
    <section className="space-y-6">
      <div className="surface-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <DataSourceIndicator source="verified" />
          <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">Riot Data Dragon · {version}</span>
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">{copy("Modos de League of Legends", "League of Legends modes", "Modos de League of Legends")}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{copy("Escolha um modo para entender ritmo, objetivo, mapa e formato. Modos rotativos podem mudar de regras entre atualizações.", "Choose a mode to understand its pace, objective, map and format. Rotating modes may change rules between updates.", "Elige un modo para entender ritmo, objetivo, mapa y formato. Los modos rotativos pueden cambiar reglas entre actualizaciones.")}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.78fr)]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {MODES.map((mode) => {
            const text = modeCopy(locale, mode.key);
            const Icon = mode.icon;
            const artwork = imageUrl(mode);
            const active = selected.key === mode.key;
            return (
              <button
                key={mode.key}
                type="button"
                onClick={() => setSelectedKey(mode.key)}
                className={cn(
                  "group overflow-hidden rounded-2xl border bg-surface text-left transition-all hover:-translate-y-0.5 hover:shadow-lift",
                  active ? "border-gold/70 ring-1 ring-gold/25" : "border-border hover:border-gold/35",
                )}
              >
                <div className="relative grid h-32 place-items-center overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.16),transparent_70%),hsl(var(--muted)/0.18)]">
                  {artwork ? <img src={artwork} alt="" loading="lazy" className="h-full w-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105" /> : <Icon className="size-10 text-gold-strong" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white/85 backdrop-blur">
                    {mode.permanent ? copy("Permanente", "Permanent", "Permanente") : copy("Rotativo", "Rotating", "Rotativo")}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-base font-semibold text-foreground">{text.name}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{text.short}</p>
                </div>
              </button>
            );
          })}
        </div>

        <article className="surface-panel overflow-hidden lg:sticky lg:top-24 lg:self-start">
          <div className="relative min-h-48 overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.17),transparent_66%),hsl(var(--muted)/0.18)]">
            {selectedMap?.image?.full ? <img src={`${DDRAGON}/cdn/${version}/img/map/${selectedMap.image.full}`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" /> : <selected.icon className="absolute left-6 top-6 size-12 text-gold-strong" />}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
            <div className="relative flex min-h-48 items-end p-5">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-gold-strong">{selected.teamSize}</p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-foreground">{selectedCopy.name}</h3>
              </div>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm leading-7 text-muted-foreground">{selectedCopy.description}</p>
            <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">{copy("Objetivo", "Objective", "Objetivo")}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{selectedCopy.objective}</p>
            </div>
            <a href={selected.officialUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-xs font-bold text-gold-strong hover:underline">
              {copy("Fonte oficial da Riot ↗", "Official Riot source ↗", "Fuente oficial de Riot ↗")}
            </a>
          </div>
        </article>
      </div>

      <div className="flex gap-3 rounded-2xl border border-border bg-muted/15 p-4 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-strong" />
        <p>{copy("Mapas e artes desta seção vêm do Riot Data Dragon; descrições do MG Profile resumem documentação e notas oficiais da Riot. MG Profile é independente e não é endossado pela Riot Games.", "Maps and artwork in this section come from Riot Data Dragon; MG Profile descriptions summarize official Riot documentation and patch notes. MG Profile is independent and is not endorsed by Riot Games.", "Los mapas y artes provienen de Riot Data Dragon; las descripciones de MG Profile resumen documentación y notas oficiales de Riot. MG Profile es independiente y no está respaldado por Riot Games.")}</p>
      </div>
    </section>
  );
}
