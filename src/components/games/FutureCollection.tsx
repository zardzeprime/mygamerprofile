import { Construction, FlaskConical, Search, Wrench } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import type { GameModuleKey, GameThemeKey } from "@/config/games";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { CompetitiveCompendium } from "@/components/games/CompetitiveCompendium";
import { DarkSoulsBossWiki } from "@/components/games/DarkSoulsBossWiki";
import { DarkSoulsGuides } from "@/components/games/DarkSoulsGuides";
import { DarkSoulsBuildLab } from "@/components/games/DarkSoulsBuildLab";
import { DarkSouls3BuildLab } from "@/components/games/DarkSouls3BuildLab";
import { SoulsItemCompendium } from "@/components/games/SoulsItemCompendium";
import { SoulsDpsTest } from "@/components/games/SoulsDpsTest";
import { SoulsFashionTest } from "@/components/games/SoulsFashionTest";
import { ValorantAgents } from "@/components/games/ValorantAgents";
import { ValorantMaps } from "@/components/games/ValorantMaps";
import { ValorantNews } from "@/components/games/ValorantNews";
import { ValorantWeapons } from "@/components/games/ValorantWeapons";
import { ValorantSkins } from "@/components/games/ValorantSkins";
import { ValorantLineupsPanel } from "@/components/games/ValorantLineupsPanel";
import { LeagueChampionExplorer } from "@/components/games/LeagueChampionExplorer";
import { LeagueRunesExplorer } from "@/components/games/LeagueRunesExplorer";
import { LeagueBuildLab } from "@/components/games/LeagueBuildLab";
import { LeagueItemsExplorerV2 } from "@/components/games/LeagueItemsExplorerV2";
import { LeagueModesExplorer } from "@/components/games/LeagueModesExplorer";
import { LeagueEsportsPanel } from "@/components/games/LeagueEsportsPanel";
import { SoulsBossExplorer } from "@/components/games/SoulsBossExplorer";
import { SoulsGameGuides } from "@/components/games/SoulsGameGuides";

export function FutureCollection({
  moduleKey,
  themeKey,
  locale,
  gameSlug,
}: {
  moduleKey: GameModuleKey;
  themeKey: GameThemeKey;
  locale: Locale;
  gameSlug: string;
}) {
  if (gameSlug === "dark-souls-remastered") {
    if (moduleKey === "builds") return <DarkSoulsBuildLab locale={locale} />;
    if (moduleKey === "dps-test") return <SoulsDpsTest gameSlug="dark-souls-remastered" locale={locale} />;
    if (moduleKey === "fashion-test") return <SoulsFashionTest gameSlug="dark-souls-remastered" locale={locale} />;
    if (moduleKey === "items") return <SoulsItemCompendium gameSlug="dark-souls-remastered" locale={locale} />;
    if (moduleKey === "bosses") return <DarkSoulsBossWiki locale={locale} />;
    if (moduleKey === "guides") return <DarkSoulsGuides locale={locale} />;
  }

  if (gameSlug === "dark-souls-iii" || gameSlug === "elden-ring") {
    if (gameSlug === "dark-souls-iii" && moduleKey === "builds") {
      return <DarkSouls3BuildLab locale={locale} />;
    }
    if (gameSlug === "dark-souls-iii" && moduleKey === "dps-test") {
      return <SoulsDpsTest gameSlug="dark-souls-iii" locale={locale} />;
    }
    if (gameSlug === "dark-souls-iii" && moduleKey === "fashion-test") {
      return <SoulsFashionTest gameSlug="dark-souls-iii" locale={locale} />;
    }
    if (gameSlug === "dark-souls-iii" && moduleKey === "items") {
      return <SoulsItemCompendium gameSlug="dark-souls-iii" locale={locale} />;
    }
    if (moduleKey === "bosses") return <SoulsBossExplorer gameSlug={gameSlug} locale={locale} />;
    if (moduleKey === "guides") return <SoulsGameGuides gameSlug={gameSlug} locale={locale} />;
  }

  if (gameSlug === "valorant") {
    if (moduleKey === "news") return <ValorantNews locale={locale} />;
    if (moduleKey === "agents") return <ValorantAgents locale={locale} />;
    if (moduleKey === "maps") return <ValorantMaps locale={locale} />;
    if (moduleKey === "weapons") return <ValorantWeapons locale={locale} />;
    if (moduleKey === "skins") return <ValorantSkins locale={locale} />;
    if (moduleKey === "competitive") return <CompetitiveCompendium game="valorant" locale={locale} />;
    if (moduleKey === "lineups") return <ValorantLineupsPanel locale={locale} />;
  }

  if (gameSlug === "league-of-legends") {
    if (moduleKey === "builds") return <LeagueBuildLab locale={locale} />;
    if (moduleKey === "champions") return <LeagueChampionExplorer locale={locale} />;
    if (moduleKey === "runes") return <LeagueRunesExplorer locale={locale} />;
    if (moduleKey === "skins") return <LeagueChampionExplorer locale={locale} mode="skins" />;
    if (moduleKey === "items") return <LeagueItemsExplorerV2 locale={locale} />;
    if (moduleKey === "modes") return <LeagueModesExplorer locale={locale} />;
    if (moduleKey === "competitive") {
      return (
        <div className="space-y-8">
          <LeagueEsportsPanel locale={locale} />
          <CompetitiveCompendium game="league-of-legends" locale={locale} />
        </div>
      );
    }
  }

  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const labels: Partial<Record<GameModuleKey, [string, string]>> = {
    bosses: [
      copy("Enciclopédia de chefes", "Boss encyclopedia", "Enciclopedia de jefes"),
      copy("Chefes, filtros e páginas individuais serão organizados aqui para este jogo.", "Bosses, filters and individual pages will be organized here for this game.", "Jefes, filtros y páginas individuales se organizarán aquí para este juego."),
    ],
    guides: [
      copy("Guias da comunidade", "Community guides", "Guías de la comunidad"),
      copy("Conteúdo editorial e guias verificados serão organizados aqui.", "Editorial content and verified guides will be organized here.", "El contenido editorial y las guías verificadas se organizarán aquí."),
    ],
    news: [
      copy("Novidades", "News", "Novedades"),
      copy("Atualizações e anúncios oficiais deste jogo aparecerão aqui.", "Official updates and announcements for this game will appear here.", "Actualizaciones y anuncios oficiales de este juego aparecerán aquí."),
    ],
    agents: [
      copy("Enciclopédia de agentes", "Agent encyclopedia", "Enciclopedia de agentes"),
      copy("Agentes e habilidades serão adicionados com informações canônicas.", "Agents and abilities will be added with canonical information.", "Los agentes y sus habilidades se añadirán con información canónica."),
    ],
    champions: [
      copy("Enciclopédia de campeões", "Champion encyclopedia", "Enciclopedia de campeones"),
      copy("Campeões, funções, habilidades e referências oficiais serão organizados aqui.", "Champions, roles, abilities and official references will be organized here.", "Campeones, roles, habilidades y referencias oficiales se organizarán aquí."),
    ],
    runes: [
      copy("Compêndio de runas", "Rune compendium", "Compendio de runas"),
      copy("Árvores, runas essenciais, opções secundárias e fragmentos de atributos.", "Trees, keystones, secondary choices and stat shards.", "Árboles, runas clave, opciones secundarias y fragmentos de atributos."),
    ],
    maps: [
      copy("Atlas de mapas", "Map atlas", "Atlas de mapas"),
      copy("Mapas e características táticas aparecerão aqui.", "Maps and tactical characteristics will appear here.", "Mapas y características tácticas aparecerán aquí."),
    ],
    weapons: [
      copy("Arsenal", "Arsenal", "Arsenal"),
      copy("Armas, economia e dados oficiais aparecerão aqui.", "Weapons, economy and official data will appear here.", "Armas, economía y datos oficiales aparecerán aquí."),
    ],
    items: [
      copy("Biblioteca de itens", "Item library", "Biblioteca de objetos"),
      copy("Itens, componentes, atributos e mudanças de patch serão organizados aqui.", "Items, components, stats and patch changes will be organized here.", "Objetos, componentes, atributos y cambios de parche se organizarán aquí."),
    ],
    modes: [
      copy("Modos de jogo", "Game modes", "Modos de juego"),
      copy("Modos, temporadas e formatos competitivos serão organizados aqui.", "Modes, seasons and competitive formats will be organized here.", "Modos, temporadas y formatos competitivos se organizarán aquí."),
    ],
    skins: [
      copy("Coleção de skins", "Skin collection", "Colección de skins"),
      copy("Skins, variantes e referências oficiais aparecerão aqui.", "Skins, variants and official references will appear here.", "Skins, variantes y referencias oficiales aparecerán aquí."),
    ],
    competitive: [
      copy("Compêndio competitivo", "Competitive compendium", "Compendio competitivo"),
      copy("Times, jogadores, equipamentos e configurações serão publicados com fonte e data de verificação.", "Teams, players, gear and settings will be published with source and verification date.", "Equipos, jugadores, equipo y configuraciones se publicarán con fuente y fecha de verificación."),
    ],
    lineups: [
      copy("Biblioteca de lineups", "Lineup library", "Biblioteca de lineups"),
      copy("Setups, utilitários e jogadas da comunidade serão publicados com autoria e procedência.", "Setups, utility and community plays will be published with authorship and provenance.", "Setups, utilidades y jugadas de la comunidad se publicarán con autoría y procedencia."),
    ],
    "dps-test": [
      copy("DPS Test", "DPS Test", "DPS Test"),
      copy("Teste armas, upgrades e atributos em modo Casual ou Avançado.", "Test weapons, upgrades and attributes in Casual or Advanced mode.", "Prueba armas, mejoras y atributos en modo Casual o Avanzado."),
    ],
    "fashion-test": [
      copy("Fashion Test", "Fashion Test", "Fashion Test"),
      copy("Monte armaduras, confira peso, poise e resistências em uma ferramenta própria.", "Build armor sets and check weight, poise and resistances in a dedicated tool.", "Monta armaduras y revisa peso, poise y resistencias en una herramienta propia."),
    ],
    builds: [
      copy("Laboratório de builds", "Build laboratory", "Laboratorio de builds"),
      copy("Crie e descubra combinações da comunidade em breve.", "Create and discover community combinations soon.", "Muy pronto podrás crear y descubrir combinaciones de la comunidad."),
    ],
    clips: [
      copy("Clipes", "Clips", "Clips"),
      copy("Momentos da comunidade chegarão em uma versão futura.", "Community moments will arrive in a future version.", "Los momentos de la comunidad llegarán en una versión futura."),
    ],
    lfg: [
      copy("Procurando grupo", "Looking for group", "Buscando grupo"),
      copy("O LFG global do MG Profile poderá ser filtrado por este jogo.", "MG Profile's global LFG can be filtered by this game.", "El LFG global de MG Profile podrá filtrarse por este juego."),
    ],
  };

  const [title, description] = labels[moduleKey] ?? [
    copy("Em preparação", "In preparation", "En preparación"),
    copy("Este espaço está sendo preparado.", "This space is being prepared.", "Este espacio se está preparando."),
  ];
  const collectionModules: GameModuleKey[] = ["bosses", "agents", "champions", "runes", "maps", "weapons", "items", "modes", "skins"];
  const isCollection = collectionModules.includes(moduleKey);
  const developmentCards = [
    {
      icon: Construction,
      title: copy("Em desenvolvimento", "In development", "En desarrollo"),
      text: copy(
        "A estrutura desta área já está aberta no hub e será preenchida progressivamente.",
        "This hub area is now open and will be populated progressively.",
        "Esta área del hub ya está abierta y se completará progresivamente.",
      ),
    },
    {
      icon: Wrench,
      title: copy("Dados e interação", "Data and interaction", "Datos e interacción"),
      text: copy(
        "Filtros, busca e componentes finais entram conforme as fontes e assets forem validados.",
        "Filters, search and final components will land as sources and assets are validated.",
        "Los filtros, búsqueda y componentes finales llegarán conforme se validen fuentes y recursos.",
      ),
    },
    {
      icon: FlaskConical,
      title: copy("Revisão MGP", "MGP review", "Revisión MGP"),
      text: copy(
        "Conteúdo incompleto fica identificado como desenvolvimento em vez de aparecer bloqueado.",
        "Incomplete content is labeled as development instead of appearing locked.",
        "El contenido incompleto se identifica como desarrollo en vez de aparecer bloqueado.",
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {isCollection ? (
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <label className="flex max-w-sm flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 opacity-80">
            <Search className="size-4 text-muted-foreground" />
            <Input
              disabled
              className="h-auto border-0 p-0 shadow-none"
              placeholder={copy("Busca entra com o conteúdo", "Search arrives with content", "La búsqueda llega con el contenido")}
            />
          </label>
          <span className="rounded-full border border-gold/25 bg-gold/[0.06] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-gold-strong">
            {copy("Em desenvolvimento", "In development", "En desarrollo")}
          </span>
        </div>
      ) : null}

      <div className="surface-panel overflow-hidden">
        <div className="border-b border-border p-5 sm:p-6">
          <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
          {developmentCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-2xl border border-border bg-muted/10 p-4">
                <Icon className="size-5 text-gold-strong" />
                <p className="mt-3 font-display text-base font-semibold text-foreground">{card.title}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{card.text}</p>
              </div>
            );
          })}
        </div>
      </div>

      <EmptyState
        title={copy("Área aberta para desenvolvimento", "Area open for development", "Área abierta para desarrollo")}
        description={copy(
          "O módulo não está mais bloqueado. O que ainda depender de pesquisa, licença, screenshot ou fonte aparecerá explicitamente como em desenvolvimento.",
          "The module is no longer locked. Anything still depending on research, licensing, screenshots or source validation is explicitly marked as in development.",
          "El módulo ya no está bloqueado. Lo que dependa de investigación, licencia, capturas o fuentes aparecerá explícitamente como en desarrollo.",
        )}
      />
    </div>
  );
}
