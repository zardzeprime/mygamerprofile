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
  const isLeagueArtwork = game.slug === "league-of-legends";
  const configuredSource = isLeagueArtwork
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
        isLeagueArtwork &&
          "bg-[radial-gradient(circle_at_45%_38%,#153c57_0%,#081b2c_46%,#03101b_100%)]",
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
          "game-artwork-base h-full w-full select-none transition-[transform,filter,opacity] duration-700 group-hover:scale-[1.045]",
          isLeagueArtwork
            ? variant === "hero"
              ? "object-contain p-[19%] opacity-90"
              : "object-contain p-[11%]"
            : "object-cover",
          imageClassName,
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-white/[0.025]",
          isLeagueArtwork &&
            "bg-[linear-gradient(180deg,rgba(255,255,255,0.015),transparent_36%,rgba(0,0,0,0.16))]",
        )}
        aria-hidden="true"
      />
    </div>
  );
}
