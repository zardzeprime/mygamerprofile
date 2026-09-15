import { useEffect, useState } from "react";
import type { GameConfig } from "@/config/games";
import { cn } from "@/lib/utils";

// Riot-hosted Data Dragon splash art. We intentionally avoid hotlinking the
// TechTudo copy because that page credits Riot but does not publish the image
// under a reusable Creative Commons license.
const LEAGUE_OFFICIAL_COVER =
  "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg";

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
  const isLeagueArtwork = game.slug === "league-of-legends";
  const configuredSource = isLeagueArtwork
    ? LEAGUE_OFFICIAL_COVER
    : variant === "hero"
      ? game.visual.heroImage
      : game.visual.coverImage;
  const [source, setSource] = useState(configuredSource);
  const objectPosition = isLeagueArtwork
    ? variant === "hero"
      ? "center 32%"
      : "center 28%"
    : variant === "hero"
      ? game.visual.heroObjectPosition
      : game.visual.cardObjectPosition;

  useEffect(() => {
    setSource(configuredSource);
  }, [configuredSource]);

  return (
    <div
      className={cn(
        "game-artwork relative h-full w-full overflow-hidden bg-muted",
        isLeagueArtwork && "bg-[#071a2d]",
        className,
      )}
    >
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
          isLeagueArtwork && variant === "hero" && "opacity-90",
          imageClassName,
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-white/[0.025]",
          isLeagueArtwork && "bg-[linear-gradient(90deg,rgba(2,10,18,0.42),rgba(2,10,18,0.03)_55%,rgba(2,10,18,0.2))]",
        )}
        aria-hidden="true"
      />
    </div>
  );
}
