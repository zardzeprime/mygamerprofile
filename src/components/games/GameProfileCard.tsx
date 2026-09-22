import { Link } from "@tanstack/react-router";
import { ChevronRight, PencilLine } from "lucide-react";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { getGameConfig } from "@/config/games";

interface GameProfileCardProps {
  gameProfile: {
    game_id: string;
    game_slug?: string;
    profile_data: Record<string, unknown> | null;
    visibility: string;
  };
  username: string;
  isOwn?: boolean;
}

function hasMeaningfulValue(value: unknown) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

export function GameProfileCard({ gameProfile, username, isOwn = false }: GameProfileCardProps) {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const config = getGameConfig(gameProfile.game_slug ?? "");
  if (!config) return null;

  const fieldCount = Object.entries(gameProfile.profile_data ?? {}).filter(
    ([key, value]) => key !== "favorite" && hasMeaningfulValue(value),
  ).length;
  const configured = fieldCount > 0;

  return (
    <Link to="/u/$username/games/$slug" params={{ username, slug: config.slug }}>
      <article className="surface-panel group h-full rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:border-gold/35">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg font-semibold">{config.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {configured
                ? copy(
                    `${fieldCount} ${fieldCount === 1 ? "informação adicionada" : "informações adicionadas"}`,
                    `${fieldCount} ${fieldCount === 1 ? "detail added" : "details added"}`,
                    `${fieldCount} ${fieldCount === 1 ? "dato añadido" : "datos añadidos"}`,
                  )
                : isOwn
                  ? copy(
                      "Favorito, mas o perfil deste jogo ainda não foi preenchido.",
                      "Favorite, but this game profile has not been filled out yet.",
                      "Favorito, pero este perfil de juego aún no se ha completado.",
                    )
                  : copy(
                      "Perfil deste jogo ainda não configurado.",
                      "This game profile has not been configured yet.",
                      "Este perfil de juego aún no está configurado.",
                    )}
            </p>
          </div>

          <span
            className={
              configured
                ? "shrink-0 rounded-full border border-gold/25 bg-gold/[0.07] px-2.5 py-1 text-[0.65rem] font-bold text-gold-strong"
                : "shrink-0 rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[0.65rem] font-bold text-muted-foreground"
            }
          >
            {configured
              ? copy("Configurado", "Configured", "Configurado")
              : copy("Não configurado", "Not configured", "No configurado")}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs font-semibold">
          <span className={configured ? "text-foreground" : "text-gold-strong"}>
            {isOwn
              ? configured
                ? copy("Editar perfil do jogo", "Edit game profile", "Editar perfil del juego")
                : copy("Configurar perfil do jogo", "Set up game profile", "Configurar perfil del juego")
              : copy("Ver perfil do jogo", "View game profile", "Ver perfil del juego")}
          </span>
          {isOwn ? (
            <PencilLine className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          ) : (
            <ChevronRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          )}
        </div>
      </article>
    </Link>
  );
}
