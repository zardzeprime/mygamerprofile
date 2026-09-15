import { Radio, Search, Swords } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import type { GameThemeKey } from "@/config/games";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

export function GameLivePanel({ themeKey, locale }: { themeKey: GameThemeKey; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const isValorant = themeKey === "valorant";

  return (
    <aside className="surface-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          {isValorant ? <Radio className="size-4 text-tactical" /> : <Swords className="size-4 text-ember" />}
          <h2 className="font-display text-sm font-semibold uppercase text-foreground">
            {isValorant
              ? copy("Partidas", "Matches", "Partidas")
              : copy("Em destaque", "Trending", "Destacado")}
          </h2>
        </div>
        <span className="status-dot" aria-hidden="true" />
      </div>
      {isValorant ? (
        <>
          <div className="grid grid-cols-3 border-b border-border text-center text-[0.68rem] font-semibold uppercase text-muted-foreground">
            <span className="border-r border-border py-3">{copy("Ao vivo", "Live", "En vivo")}</span>
            <span className="border-r border-border py-3">{copy("Próximas", "Upcoming", "Próximas")}</span>
            <span className="py-3">{copy("Resultados", "Results", "Resultados")}</span>
          </div>
          <EmptyState
            className="m-4 border-0 bg-muted/45 py-8"
            title={copy(
              "Partidas oficiais serão exibidas aqui.",
              "Official matches will appear here.",
              "Las partidas oficiales aparecerán aquí.",
            )}
            description="VCT Americas · Challengers Brazil · Game Changers"
          />
          <div className="border-t border-border p-4">
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <Search className="size-3.5" />
              {copy("Buscar jogador", "Player search", "Buscar jugador")}
            </label>
            <Input placeholder="Nome#TAG" disabled />
            <p className="mt-2 text-xs text-muted-foreground">
              {copy(
                "Busca disponível após integração oficial.",
                "Search available after official integration.",
                "La búsqueda estará disponible tras la integración oficial.",
              )}
            </p>
          </div>
        </>
      ) : (
        <EmptyState
          className="m-4 border-0 bg-muted/45 py-10"
          title={copy("O mundo ainda está silencioso.", "The world is quiet for now.", "El mundo sigue en silencio por ahora.")}
          description={copy(
            "Builds populares, bosses discutidos e grupos aparecerão aqui.",
            "Popular builds, discussed bosses and groups will appear here.",
            "Las builds populares, los jefes comentados y los grupos aparecerán aquí.",
          )}
        />
      )}
    </aside>
  );
}
