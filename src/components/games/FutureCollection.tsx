import { LockKeyhole, Search } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import type { GameModuleKey, GameThemeKey } from "@/config/games";
import type { Locale } from "@/i18n";
import { DarkSoulsBossWiki } from "@/components/games/DarkSoulsBossWiki";

export function FutureCollection({ moduleKey, themeKey, locale }: { moduleKey: GameModuleKey; themeKey: GameThemeKey; locale: Locale }) {
  if (moduleKey === "bosses" && themeKey === "dark_souls") {
    return <DarkSoulsBossWiki locale={locale} />;
  }

  const pt = locale === "pt-BR";
  const copy: Partial<Record<GameModuleKey, [string, string]>> = {
    bosses: [pt ? "Enciclopédia de bosses" : "Boss encyclopedia", pt ? "Chefes, filtros e páginas individuais chegam na próxima atualização." : "Bosses, filters and individual pages arrive in the next update."],
    agents: [pt ? "Enciclopédia de agentes" : "Agent encyclopedia", pt ? "Agentes e habilidades serão adicionados com informações canônicas." : "Agents and abilities will be added with canonical information."],
    competitive: [pt ? "Competitivo" : "Competitive", pt ? "Rotação, leaderboard, Top Radiant e ato atual dependem da integração oficial." : "Rotation, leaderboard, Top Radiant and current act require official integration."],
    builds: [pt ? "Laboratório de builds" : "Build laboratory", pt ? "Crie e descubra combinações da comunidade em breve." : "Create and discover community combinations soon."],
    guides: [pt ? "Guias da comunidade" : "Community guides", pt ? "Conteúdo editorial e guias verificados serão organizados aqui." : "Editorial content and verified guides will be organized here."],
    clips: [pt ? "Clipes" : "Clips", pt ? "Momentos da comunidade chegarão em uma versão futura." : "Community moments will arrive in a future version."],
  };
  const [title, description] = copy[moduleKey] ?? [pt ? "Em preparação" : "In preparation", pt ? "Este espaço está sendo preparado." : "This space is being prepared."];
  const slots = moduleKey === "bosses" || moduleKey === "agents" ? 6 : 3;
  return (
    <div className="space-y-5">
      {(moduleKey === "bosses" || moduleKey === "agents") && (
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <label className="flex max-w-sm flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 py-2"><Search className="size-4 text-muted-foreground" /><Input disabled className="h-auto border-0 p-0 shadow-none" placeholder={pt ? "Buscar na coleção" : "Search the collection"} /></label>
          <span className="text-xs font-semibold uppercase text-muted-foreground">{pt ? "Conteúdo futuro" : "Future content"}</span>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: slots }).map((_, index) => (
          <div key={index} className={`future-card ${themeKey === "valorant" ? "future-card-tactical" : "future-card-ember"}`} aria-hidden="true"><LockKeyhole className="size-5" /><span>{String(index + 1).padStart(2, "0")}</span></div>
        ))}
      </div>
      <EmptyState title={title} description={description} />
    </div>
  );
}
