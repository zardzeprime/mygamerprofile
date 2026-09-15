import { LockKeyhole, Search } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import type { GameModuleKey, GameThemeKey } from "@/config/games";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { DarkSoulsBossWiki } from "@/components/games/DarkSoulsBossWiki";
import { DarkSoulsGuides } from "@/components/games/DarkSoulsGuides";
import { ValorantAgents } from "@/components/games/ValorantAgents";
import { ValorantMaps } from "@/components/games/ValorantMaps";
import { ValorantWeapons } from "@/components/games/ValorantWeapons";

export function FutureCollection({ moduleKey, themeKey, locale }: { moduleKey: GameModuleKey; themeKey: GameThemeKey; locale: Locale }) {
  if (moduleKey === "bosses" && themeKey === "dark_souls") return <DarkSoulsBossWiki locale={locale} />;
  if (moduleKey === "guides" && themeKey === "dark_souls") return <DarkSoulsGuides locale={locale} />;

  if (themeKey === "valorant") {
    if (moduleKey === "agents") return <ValorantAgents locale={locale} />;
    if (moduleKey === "maps") return <ValorantMaps locale={locale} />;
    if (moduleKey === "weapons") return <ValorantWeapons locale={locale} />;
  }

  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const labels: Partial<Record<GameModuleKey, [string, string]>> = {
    bosses: [
      copy("Enciclopédia de bosses", "Boss encyclopedia", "Enciclopedia de jefes"),
      copy("Chefes, filtros e páginas individuais chegam na próxima atualização.", "Bosses, filters and individual pages arrive in the next update.", "Jefes, filtros y páginas individuales llegarán en la próxima actualización."),
    ],
    agents: [
      copy("Enciclopédia de agentes", "Agent encyclopedia", "Enciclopedia de agentes"),
      copy("Agentes e habilidades serão adicionados com informações canônicas.", "Agents and abilities will be added with canonical information.", "Los agentes y sus habilidades se añadirán con información canónica."),
    ],
    maps: [
      copy("Atlas de mapas", "Map atlas", "Atlas de mapas"),
      copy("Mapas, minimapas e características táticas aparecerão aqui.", "Maps, minimaps and tactical characteristics will appear here.", "Mapas, minimapas y características tácticas aparecerán aquí."),
    ],
    weapons: [
      copy("Arsenal", "Arsenal", "Arsenal"),
      copy("Armas, economia, penetração e tabelas de dano aparecerão aqui.", "Weapons, economy, penetration and damage tables will appear here.", "Armas, economía, penetración y tablas de daño aparecerán aquí."),
    ],
    competitive: [
      copy("Competitivo", "Competitive", "Competitivo"),
      copy("Ranked, VCT, rankings e integrações competitivas serão aprofundados em uma próxima etapa. A agenda oficial já aparece na Visão geral.", "Ranked, VCT, rankings and competitive integrations will be expanded in a later step. The official schedule already appears in Overview.", "Ranked, VCT, rankings e integraciones competitivas se ampliarán en una etapa posterior. La agenda oficial ya aparece en Vista general."),
    ],
    lineups: [
      copy("Biblioteca de lineups", "Lineup library", "Biblioteca de lineups"),
      copy("Smokes, molotovs, setups, utilitários e jogadas da comunidade serão publicados aqui com autoria e procedência.", "Smokes, mollies, setups, utility and community plays will be published here with authorship and provenance.", "Smokes, molotovs, setups, utilidades y jugadas de la comunidad se publicarán aquí con autoría y procedencia."),
    ],
    builds: [
      copy("Laboratório de builds", "Build laboratory", "Laboratorio de builds"),
      copy("Crie e descubra combinações da comunidade em breve.", "Create and discover community combinations soon.", "Muy pronto podrás crear y descubrir combinaciones de la comunidad."),
    ],
    guides: [
      copy("Guias da comunidade", "Community guides", "Guías de la comunidad"),
      copy("Conteúdo editorial e guias verificados serão organizados aqui.", "Editorial content and verified guides will be organized here.", "El contenido editorial y las guías verificadas se organizarán aquí."),
    ],
    clips: [
      copy("Clipes", "Clips", "Clips"),
      copy("Momentos da comunidade chegarão em uma versão futura.", "Community moments will arrive in a future version.", "Los momentos de la comunidad llegarán en una versión futura."),
    ],
  };
  const [title, description] = labels[moduleKey] ?? [
    copy("Em preparação", "In preparation", "En preparación"),
    copy("Este espaço está sendo preparado.", "This space is being prepared.", "Este espacio se está preparando."),
  ];
  const slots = moduleKey === "bosses" || moduleKey === "agents" || moduleKey === "maps" || moduleKey === "weapons" ? 6 : 3;

  return (
    <div className="space-y-5">
      {(moduleKey === "bosses" || moduleKey === "agents" || moduleKey === "maps" || moduleKey === "weapons") && (
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
          <div key={index} className={`future-card ${themeKey === "valorant" ? "future-card-tactical" : "future-card-ember"}`} aria-hidden="true">
            <LockKeyhole className="size-5" />
            <span>{String(index + 1).padStart(2, "0")}</span>
          </div>
        ))}
      </div>
      <EmptyState title={title} description={description} />
    </div>
  );
}
