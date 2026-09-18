import { useEffect, useMemo, useState } from "react";
import { Bot, Crosshair, Dumbbell, ExternalLink, ShieldCheck, Sparkles, Swords, Zap } from "lucide-react";
import { DataSourceIndicator } from "@/components/common/DataSourceIndicator";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

const DDRAGON = "https://ddragon.leagueoflegends.com";
const FALLBACK_VERSION = "16.18.1";
const DATA_DRAGON_LOCALE: Record<Locale, string> = {
  "pt-BR": "pt_BR",
  en: "en_US",
  es: "es_ES",
};

type LeagueMap = {
  MapName?: string;
  MapId?: string;
  mapName?: string;
  mapId?: string;
  image?: { full: string };
};

type MapPayload = { data: Record<string, LeagueMap> };

type ModeKey =
  | "ranked"
  | "swiftplay"
  | "aram"
  | "coop"
  | "practice"
  | "arena"
  | "aram-mayhem"
  | "classic"
  | "tft";

type ModeCategory = "fixed" | "rotating" | "tft";

type ModeDefinition = {
  key: ModeKey;
  category: ModeCategory;
  mapId: string | null;
  teamSize: string;
  icon: typeof Swords;
  officialUrl: string;
};

const MODES: ModeDefinition[] = [
  {
    key: "ranked",
    category: "fixed",
    mapId: "11",
    teamSize: "5v5",
    icon: Swords,
    officialUrl: "https://www.leagueoflegends.com/",
  },
  {
    key: "swiftplay",
    category: "fixed",
    mapId: "11",
    teamSize: "5v5",
    icon: Zap,
    officialUrl: "https://www.leagueoflegends.com/news/dev/dev-a-swifter-swiftplay/",
  },
  {
    key: "aram",
    category: "fixed",
    mapId: "12",
    teamSize: "5v5",
    icon: Crosshair,
    officialUrl: "https://www.leagueoflegends.com/news/game-updates/",
  },
  {
    key: "coop",
    category: "fixed",
    mapId: "11",
    teamSize: "5 players",
    icon: Bot,
    officialUrl: "https://www.leagueoflegends.com/",
  },
  {
    key: "practice",
    category: "fixed",
    mapId: "11",
    teamSize: "solo",
    icon: Dumbbell,
    officialUrl: "https://www.leagueoflegends.com/",
  },
  {
    key: "arena",
    category: "rotating",
    mapId: "30",
    teamSize: "multi-team",
    icon: Sparkles,
    officialUrl: "https://www.leagueoflegends.com/pt-br/news/game-updates/league-of-legends-patch-26-17-notes/",
  },
  {
    key: "aram-mayhem",
    category: "rotating",
    mapId: "12",
    teamSize: "5v5",
    icon: Zap,
    officialUrl: "https://www.leagueoflegends.com/pt-br/news/game-updates/league-of-legends-patch-26-18-notes/",
  },
  {
    key: "classic",
    category: "rotating",
    mapId: "11",
    teamSize: "5v5",
    icon: Swords,
    officialUrl: "https://www.leagueoflegends.com/pt-br/news/game-updates/league-of-legends-patch-26-18-notes/",
  },
  {
    key: "tft",
    category: "tft",
    mapId: null,
    teamSize: "8 players",
    icon: Sparkles,
    officialUrl: "https://teamfighttactics.leagueoflegends.com/",
  },
];

function modeCopy(locale: Locale, key: ModeKey) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  const entries: Record<ModeKey, { name: string; short: string; description: string; objective: string }> = {
    ranked: {
      name: copy("Summoner's Rift · Normal e Ranqueada", "Summoner's Rift · Normal & Ranked", "Grieta del Invocador · Normal y Clasificatoria"),
      short: copy("A experiência principal do League.", "League's main experience.", "La experiencia principal de League."),
      description: copy(
        "Duas equipes de cinco jogadores disputam rotas, objetivos e controle de mapa até destruir o Nexus adversário. A arena sustenta filas normais, ranqueadas e formatos competitivos.",
        "Two teams of five contest lanes, objectives and map control until one destroys the enemy Nexus. The battleground supports normal, ranked and competitive formats.",
        "Dos equipos de cinco disputan líneas, objetivos y control del mapa hasta destruir el Nexo rival. El campo sostiene partidas normales, clasificatorias y competitivas.",
      ),
      objective: copy("Destruir o Nexus inimigo.", "Destroy the enemy Nexus.", "Destruir el Nexo enemigo."),
    },
    swiftplay: {
      name: "Swiftplay",
      short: copy("Summoner's Rift em ritmo acelerado.", "A faster-paced Summoner's Rift queue.", "Grieta del Invocador a un ritmo más rápido."),
      description: copy(
        "Fila 5v5 criada para manter o arco completo de uma partida de League, mas acelerar progressão e reduzir o peso de vantagens iniciais.",
        "A 5v5 queue designed to preserve the full League match arc while accelerating progression and reducing the punishment of early disadvantages.",
        "Una cola 5v5 pensada para conservar el arco completo de League acelerando la progresión y reduciendo el castigo de las desventajas tempranas.",
      ),
      objective: copy("Chegar mais rápido aos momentos decisivos do Rift.", "Reach the decisive Rift moments faster.", "Llegar antes a los momentos decisivos de la Grieta."),
    },
    aram: {
      name: "ARAM",
      short: copy("Uma rota, campeões aleatórios e luta constante.", "One lane, random champions and constant fighting.", "Una línea, campeones aleatorios y combate constante."),
      description: copy(
        "All Random All Mid coloca duas equipes em uma única rota. Composição, teamfight e adaptação ficam no centro da partida.",
        "All Random All Mid puts two teams on a single lane. Composition, teamfighting and adaptation become the center of the match.",
        "All Random All Mid enfrenta a dos equipos en una sola línea. Composición, peleas y adaptación pasan al centro de la partida.",
      ),
      objective: copy("Vencer teamfights e avançar até o Nexus.", "Win teamfights and push to the Nexus.", "Ganar peleas y avanzar hasta el Nexo."),
    },
    coop: {
      name: copy("Co-op vs. IA", "Co-op vs. AI", "Cooperativo vs. IA"),
      short: copy("Aprenda o Rift enfrentando bots.", "Learn the Rift against bots.", "Aprende la Grieta contra bots."),
      description: copy(
        "Uma porta de entrada com menos pressão para aprender fundamentos, testar campeões e entender o fluxo básico de Summoner's Rift.",
        "A lower-pressure entry point to learn fundamentals, test champions and understand the basic Summoner's Rift flow.",
        "Una entrada con menos presión para aprender fundamentos, probar campeones y entender el flujo básico de la Grieta.",
      ),
      objective: copy("Praticar fundamentos e concluir a partida contra IA.", "Practice fundamentals and complete a match against AI.", "Practicar fundamentos y completar una partida contra IA."),
    },
    practice: {
      name: copy("Ferramenta de Treino", "Practice Tool", "Herramienta de Práctica"),
      short: copy("Laboratório para mecânica, combos e testes.", "A sandbox for mechanics, combos and testing.", "Un laboratorio para mecánicas, combos y pruebas."),
      description: copy(
        "Ambiente controlado para testar dano, tempos, combos, rotas, interações e configurações sem a pressão de uma partida normal.",
        "A controlled environment to test damage, timings, combos, routes, interactions and settings without normal match pressure.",
        "Un entorno controlado para probar daño, tiempos, combos, rutas, interacciones y ajustes sin presión de partida.",
      ),
      objective: copy("Treinar e experimentar livremente.", "Train and experiment freely.", "Entrenar y experimentar libremente."),
    },
    arena: {
      name: "Arena",
      short: copy("Rodadas, Aprimoramentos e múltiplas equipes.", "Rounds, Augments and multiple teams.", "Rondas, Aumentos y múltiples equipos."),
      description: copy(
        "Arena gira em torno de rodadas de combate, Aprimoramentos e builds fora do padrão do Rift. Em 2026 a Riot continua atualizando eventos e regras ao longo dos patches.",
        "Arena revolves around combat rounds, Augments and builds outside standard Rift play. In 2026 Riot continues updating events and rules across patches.",
        "Arena gira alrededor de rondas de combate, Aumentos y builds fuera del Rift estándar. En 2026 Riot sigue actualizando eventos y reglas entre parches.",
      ),
      objective: copy("Sobreviver às rodadas e adaptar sua build.", "Survive rounds and adapt your build.", "Sobrevivir las rondas y adaptar tu build."),
    },
    classic: {
      name: "League of Legends Classic",
      short: copy(
        "Uma versão oficial do LoL clássico, mantida e atualizada pela Riot.",
        "An official Classic LoL experience maintained and updated by Riot.",
        "Una experiencia oficial de LoL clásico mantenida y actualizada por Riot.",
      ),
      description: copy(
        "Classic recria uma era antiga de League com kits, sistemas, runas e ritmo próprios. A Riot continua adicionando campeões clássicos e ajustes específicos, então o MGP mantém o modo separado do Summoner's Rift moderno.",
        "Classic recreates an older League era with its own kits, systems, runes and pacing. Riot continues adding classic champions and mode-specific updates, so MGP keeps it separate from modern Summoner's Rift.",
        "Classic recrea una era antigua de League con kits, sistemas, runas y ritmo propios. Riot sigue añadiendo campeones clásicos y ajustes específicos, así que MGP lo mantiene separado de la Grieta moderna.",
      ),
      objective: copy(
        "Jogar o Rift com as regras e kits da experiência Classic.",
        "Play the Rift using the Classic ruleset and champion kits.",
        "Jugar la Grieta con las reglas y kits de la experiencia Classic.",
      ),
    },
    "aram-mayhem": {
      name: copy("ARAM: Desordem", "ARAM: Mayhem", "ARAM: Caos"),
      short: copy("ARAM com Aprimoramentos e variações especiais.", "ARAM with Augments and special variations.", "ARAM con Aumentos y variaciones especiales."),
      description: copy(
        "Uma variação especial do ARAM em que Aprimoramentos mudam o ritmo e criam combinações fora da experiência fixa do modo tradicional.",
        "A special ARAM variant where Augments change the pace and create combinations outside the standard fixed-mode experience.",
        "Una variante especial de ARAM donde los Aumentos cambian el ritmo y crean combinaciones fuera de la experiencia fija tradicional.",
      ),
      objective: copy("Vencer a rota única explorando Aprimoramentos.", "Win the single lane while exploiting Augments.", "Ganar la línea única aprovechando los Aumentos."),
    },
    tft: {
      name: "Teamfight Tactics",
      short: copy("Auto battler separado do League tradicional.", "An auto battler separate from traditional League.", "Auto battler separado del League tradicional."),
      description: copy(
        "TFT compartilha o universo e parte da infraestrutura de League, mas possui regras, sets, itens e progressão próprios. Por isso aparece em uma categoria separada no MGP.",
        "TFT shares League's universe and some infrastructure but has its own rules, sets, items and progression, so MGP keeps it in a separate category.",
        "TFT comparte el universo y parte de la infraestructura de League, pero tiene reglas, sets, objetos y progresión propios; por eso MGP lo mantiene separado.",
      ),
      objective: copy("Montar uma composição e sobreviver até o topo da sala.", "Build a composition and survive to the top of the lobby.", "Construir una composición y sobrevivir hasta lo alto de la sala."),
    },
  };

  return entries[key];
}

function categoryCopy(locale: Locale, category: ModeCategory) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  if (category === "fixed") {
    return {
      title: copy("Modos fixos", "Permanent modes", "Modos fijos"),
      description: copy(
        "Experiências que formam o núcleo regular do cliente.",
        "Experiences that form the regular core of the client.",
        "Experiencias que forman el núcleo regular del cliente.",
      ),
    };
  }
  if (category === "rotating") {
    return {
      title: copy("Modos rotativos e especiais", "Rotating & special modes", "Modos rotativos y especiales"),
      description: copy(
        "A disponibilidade e as regras podem mudar entre atualizações.",
        "Availability and rules can change between patches.",
        "La disponibilidad y las reglas pueden cambiar entre actualizaciones.",
      ),
    };
  }
  return {
    title: "Teamfight Tactics",
    description: copy(
      "Separado do LoL tradicional para não misturar modos e sistemas.",
      "Separated from traditional LoL so modes and systems are not mixed together.",
      "Separado del LoL tradicional para no mezclar modos y sistemas.",
    ),
  };
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

        const response = await fetch(
          `${DDRAGON}/cdn/${current}/data/${DATA_DRAGON_LOCALE[locale]}/map.json`,
          { signal: controller.signal },
        );
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

  const selected = useMemo(
    () => MODES.find((mode) => mode.key === selectedKey) ?? MODES[0],
    [selectedKey],
  );
  if (!selected) return null;

  const selectedCopy = modeCopy(locale, selected.key);
  const selectedMap = selected.mapId ? maps[selected.mapId] : undefined;

  const imageUrl = (mode: ModeDefinition) => {
    if (!mode.mapId) return null;
    const map = maps[mode.mapId];
    return map?.image?.full ? `${DDRAGON}/cdn/${version}/img/map/${map.image.full}` : null;
  };

  const categories: ModeCategory[] = ["fixed", "rotating", "tft"];

  return (
    <section className="space-y-6">
      <div className="surface-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <DataSourceIndicator source="verified" />
          <span className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Riot Data Dragon · {version}
          </span>
          <span className="rounded-full border border-gold/25 bg-gold/[0.06] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-gold-strong">
            Estado editorial · Patch 26.18
          </span>
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {copy("Modos de jogo", "Game modes", "Modos de juego")}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {copy(
            "Os modos ficam separados por categoria no próprio layout: núcleo fixo, experiências rotativas e TFT. Clique em qualquer card para abrir os detalhes.",
            "Modes are separated directly in the layout: permanent core, rotating experiences and TFT. Select any card to open its details.",
            "Los modos se separan directamente en el layout: núcleo fijo, experiencias rotativas y TFT. Selecciona cualquier card para abrir sus detalles.",
          )}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-8">
          {categories.map((category) => {
            const text = categoryCopy(locale, category);
            const entries = MODES.filter((mode) => mode.category === category);

            return (
              <section key={category}>
                <div className="mb-3">
                  <h3 className="font-display text-xl font-semibold text-foreground">{text.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{text.description}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {entries.map((mode) => {
                    const modeText = modeCopy(locale, mode.key);
                    const Icon = mode.icon;
                    const artwork = imageUrl(mode);
                    const active = selected.key === mode.key;

                    return (
                      <button
                        key={mode.key}
                        type="button"
                        onClick={() => setSelectedKey(mode.key)}
                        className={cn(
                          "group overflow-hidden rounded-2xl border bg-surface text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lift",
                          active ? "border-gold/70 ring-1 ring-gold/25" : "border-border hover:border-gold/35",
                        )}
                      >
                        <div className="relative grid h-32 place-items-center overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.16),transparent_70%),hsl(var(--muted)/0.18)]">
                          {artwork ? (
                            <img
                              src={artwork}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <Icon className="size-10 text-gold-strong" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white/85 backdrop-blur">
                            {mode.teamSize}
                          </span>
                        </div>
                        <div className="p-4">
                          <h4 className="font-display text-base font-semibold text-foreground">{modeText.name}</h4>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{modeText.short}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <article className="surface-panel overflow-hidden xl:sticky xl:top-24 xl:self-start">
          <div className="relative min-h-52 overflow-hidden bg-[radial-gradient(circle_at_top,hsl(var(--gold)/0.17),transparent_66%),hsl(var(--muted)/0.18)]">
            {selectedMap?.image?.full ? (
              <img
                src={`${DDRAGON}/cdn/${version}/img/map/${selectedMap.image.full}`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
            ) : (
              <selected.icon className="absolute left-6 top-6 size-12 text-gold-strong" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
            <div className="relative flex min-h-52 items-end p-5">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-gold-strong">{selected.teamSize}</p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-foreground">{selectedCopy.name}</h3>
              </div>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm leading-7 text-muted-foreground">{selectedCopy.description}</p>
            <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {copy("Objetivo", "Objective", "Objetivo")}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">{selectedCopy.objective}</p>
            </div>
            <a
              href={selected.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-gold-strong hover:underline"
            >
              {copy("Fonte oficial", "Official source", "Fuente oficial")}
              <ExternalLink className="size-3" />
            </a>
          </div>
        </article>
      </div>

      <div className="flex gap-3 rounded-2xl border border-border bg-muted/15 p-4 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold-strong" />
        <p>
          {copy(
            "Mapas e artes vêm do Riot Data Dragon. A divisão entre modos fixos, rotativos e TFT é editorial e segue o estado atual documentado pela Riot; disponibilidade de modos especiais pode mudar entre patches.",
            "Maps and artwork come from Riot Data Dragon. The permanent/rotating/TFT grouping is editorial and follows Riot's currently documented state; special-mode availability can change between patches.",
            "Mapas y artes provienen de Riot Data Dragon. La división entre modos fijos, rotativos y TFT es editorial y sigue el estado actual documentado por Riot; la disponibilidad de modos especiales puede cambiar entre parches.",
          )}
        </p>
      </div>
    </section>
  );
}
