import { useEffect, useState } from "react";
import type { GameConfig } from "@/config/games";
import { cn } from "@/lib/utils";

const LEAGUE_OFFICIAL_LOGO =
  "https://www.riotgames.com/darkroom/original/9a50f5b3bdcfb815580ef103ec9b6ee2%3Ad49b78b12cf185e10127cdf81b144a00/lol-logo-rendered-hi-res.png";

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
  const isLeagueCard = game.slug === "league-of-legends" && variant === "card";
  const configuredSource = isLeagueCard
    ? LEAGUE_OFFICIAL_LOGO
    : variant === "hero"
      ? game.visual.heroImage
      : game.visual.coverImage;
  const [source, setSource] = useState(configuredSource);
  const objectPosition =
    variant === "hero" ? game.visual.heroObjectPosition : game.visual.cardObjectPosition;

  useEffect(() => {
    setSource(configuredSource);
  }, [configuredSource]);

  return (
    <div
      className={cn(
        "game-artwork relative h-full w-full overflow-hidden bg-muted",
        isLeagueCard && "bg-[#071a2d]",
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
          "game-artwork-base h-full w-full select-none transition-[transform,filter,opacity] duration-700 group-hover:scale-[1.065]",
          isLeagueCard ? "object-contain p-[12%]" : "object-cover",
          imageClassName,
        )}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-white/[0.025]"
        aria-hidden="true"
      />
    </div>
  );
}
