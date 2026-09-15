import type { GameConfig } from "@/config/games";
import { cn } from "@/lib/utils";

type GameArtworkProps = {
  game: GameConfig;
  variant?: "card" | "hero";
  className?: string;
  imageClassName?: string;
  loading?: "eager" | "lazy";
};

const COVER_OVERRIDES: Record<string, string> = {
  "dark-souls-remastered":
    "https://static.actugaming.net/media/2018/01/dark-souls-remastered-jaquette.jpg",
  valorant:
    "https://images.stopgame.ru/games/logos/19592/c560x560/62PEyFi2MwDpL91qF8_FsA/valorant-square_1.jpg",
};

export function GameArtwork({
  game,
  variant = "card",
  className,
  imageClassName,
  loading = "lazy",
}: GameArtworkProps) {
  const configuredSource = variant === "hero" ? game.visual.heroImage : game.visual.coverImage;
  const source = COVER_OVERRIDES[game.slug] ?? configuredSource;
  const objectPosition =
    game.slug === "dark-souls-remastered" && variant === "card" ? "center 18%" : undefined;

  return (
    <div className={cn("game-artwork relative h-full w-full overflow-hidden", className)}>
      <img
        src={source}
        alt=""
        width={1600}
        height={1000}
        loading={loading}
        style={objectPosition ? { objectPosition } : undefined}
        className={cn(
          "game-artwork-base h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.065]",
          game.slug === "valorant" && "object-center",
          imageClassName,
        )}
      />
    </div>
  );
}
