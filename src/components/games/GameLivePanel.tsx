import { Radio, Search, Swords } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import type { GameThemeKey } from "@/config/games";
import type { Locale } from "@/i18n";

export function GameLivePanel({ themeKey, locale }: { themeKey: GameThemeKey; locale: Locale }) {
  const pt = locale === "pt-BR";
  const isValorant = themeKey === "valorant";
  return (
    <aside className="surface-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          {isValorant ? <Radio className="size-4 text-tactical" /> : <Swords className="size-4 text-ember" />}
          <h2 className="font-display text-sm font-semibold uppercase text-foreground">{isValorant ? (pt ? "Partidas" : "Matches") : (pt ? "Em destaque" : "Trending")}</h2>
        </div>
        <span className="status-dot" aria-hidden="true" />
      </div>
      {isValorant ? (
        <>
          <div className="grid grid-cols-3 border-b border-border text-center text-[0.68rem] font-semibold uppercase text-muted-foreground">
            <span className="border-r border-border py-3">{pt ? "Ao vivo" : "Live"}</span>
            <span className="border-r border-border py-3">{pt ? "Próximas" : "Upcoming"}</span>
            <span className="py-3">{pt ? "Resultados" : "Results"}</span>
          </div>
          <EmptyState className="m-4 border-0 bg-muted/45 py-8" title={pt ? "Partidas oficiais serão exibidas aqui." : "Official matches will appear here."} description="VCT Americas · Challengers Brazil · Game Changers" />
          <div className="border-t border-border p-4">
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><Search className="size-3.5" />{pt ? "Buscar jogador" : "Player search"}</label>
            <Input placeholder="Nome#TAG" disabled />
            <p className="mt-2 text-xs text-muted-foreground">{pt ? "Busca disponível após integração oficial." : "Search available after official integration."}</p>
          </div>
        </>
      ) : (
        <EmptyState className="m-4 border-0 bg-muted/45 py-10" title={pt ? "O mundo ainda está silencioso." : "The world is quiet for now."} description={pt ? "Builds populares, bosses discutidos e grupos aparecerão aqui." : "Popular builds, discussed bosses and groups will appear here."} />
      )}
    </aside>
  );
}