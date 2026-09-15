import { useState } from "react";
import type { GameConfig } from "@/config/games";
import { cn } from "@/lib/utils";

type GameArtworkProps = {
  game: GameConfig;
  variant?: "card" | "hero";
  className?: string;
  imageClassName?: string;
  loading?: "eager" | "lazy";
};

export function GameArtwork({
  game,
  variant = "card",
  className,
  imageClassName,
  loading = "lazy",
}: GameArtworkProps) {
  const configuredSource = variant === "hero" ? game.visual.heroImage : game.visual.coverImage;
  const [source, setSource] = useState(configuredSource);
  const objectPosition =
    variant === "hero" ? game.visual.heroObjectPosition : game.visual.cardObjectPosition;

  return (
    <div className={cn("game-artwork relative h-full w-full overflow-hidden bg-muted", className)}>
      <img
        src={source}
        alt=""
        width={1600}
        height={1000}
        loading={loading}
        decoding="async"
        draggable={false}
        onError={() => {
          if (source !== game.visual.fallbackImage) setSource(game.visual.fallbackImage);
        }}
        style={objectPosition ? { objectPosition } : undefined}
        className={cn(
          "game-artwork-base h-full w-full select-none object-cover transition-[transform,filter,opacity] duration-700 group-hover:scale-[1.065]",
          imageClassName,
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-white/[0.025]" aria-hidden="true" />
    </div>
  );
}
