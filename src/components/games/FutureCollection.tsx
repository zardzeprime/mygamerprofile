import { LockKeyhole, Search } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import type { GameModuleKey, GameThemeKey } from "@/config/games";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { CompetitiveCompendium } from "@/components/games/CompetitiveCompendium";
import { DarkSoulsBossWiki } from "@/components/games/DarkSoulsBossWiki";
import { DarkSoulsGuides } from "@/components/games/DarkSoulsGuides";
import { ValorantAgents } from "@/components/games/ValorantAgents";
import { ValorantMaps } from "@/components/games/ValorantMaps";
import { ValorantNews } from "@/components/games/ValorantNews";
import { ValorantWeapons } from "@/components/games/ValorantWeapons";
import { ValorantSkins } from "@/components/games/ValorantSkins";
import { LeagueChampionExplorer } from "@/components/games/LeagueChampionExplorer";
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
    if (moduleKey === "bosses") return <DarkSoulsBossWiki locale={locale} />;
    if (moduleKey === "guides") return <DarkSoulsGuides locale={locale} />;
  }

  if (gameSlug === "dark-souls-iii" || gameSlug === "elden-ring") {
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
  }

  if (gameSlug === "league-of-legends") {
    if (moduleKey === "champions") return <LeagueChampionExplorer locale={locale} />;
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
  const collectionModules: GameModuleKey[] = ["bosses", "agents", "champions", "maps", "weapons", "items", "modes", "skins"];
  const isCollection = collectionModules.includes(moduleKey);
  const slots = isCollection ? 6 : 3;
  const tacticalTheme = themeKey === "valorant" || themeKey === "competitive";

  return (
    <div className="space-y-5">
      {isCollection && (
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <label className="flex max-w-sm flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 transition-colors focus-within:border-gold/60">
            <Search className="size-4 text-muted-foreground" />
            <Input disabled className="h-auto border-0 p-0 shadow-none" placeholder={copy("Buscar na coleção", "Search the collection", "Buscar en la colección")} />
          </label>
          <span className="text-xs font-semibold uppercase text-muted-foreground">{copy("Conteúdo futuro", "Future content", "Contenido futuro")}</span>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: slots }).map((_, index) => (
          <div key={index} className={`future-card ${tacticalTheme ? "future-card-tactical" : "future-card-ember"}`} aria-hidden="true">
            <LockKeyhole className="size-5" />
            <span>{String(index + 1).padStart(2, "0")}</span>
          </div>
        ))}
      </div>
      <EmptyState title={title} description={description} />
    </div>
  );
}
