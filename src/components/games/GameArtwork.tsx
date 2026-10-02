import { useEffect, useState } from "react";
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
  const isLeagueArtwork = game.slug === "league-of-legends";
  const isValorantArtwork = game.slug === "valorant";
  const isMinimalLogoArtwork = isLeagueArtwork || isValorantArtwork;
  const isWarframePlaceholder =
    game.slug === "warframe" &&
    game.visual.assetSource.startsWith("ÍMPAR-generated Warframe placeholder");
  const usesUpscaledRepositoryArtwork = ["dark-souls-iii", "elden-ring", "ea-sports-fc"].includes(
    game.slug,
  );
  const configuredSource = variant === "hero" ? game.visual.heroImage : game.visual.coverImage;
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
        isValorantArtwork &&
          "bg-[radial-gradient(circle_at_50%_42%,#251219_0%,#0c0d11_52%,#050609_100%)]",
        isWarframePlaceholder && "bg-[linear-gradient(135deg,#061016_0%,#0a222b_52%,#1a5663_100%)]",
        className,
      )}
    >
      {isWarframePlaceholder ? (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-[18%] -top-[42%] aspect-square w-[78%] rounded-full bg-white/[0.04] transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute -bottom-[55%] -left-[22%] aspect-square w-[92%] rounded-full bg-white/[0.025] transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute left-[12%] top-[18%] h-px w-[48%] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute bottom-[22%] right-[12%] size-2 rounded-full bg-white/15 shadow-[0_0_24px_rgba(255,255,255,0.12)]" />
        </div>
      ) : (
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
            "game-artwork-base h-full w-full select-none transition-[transform,filter,opacity] duration-700",
            usesUpscaledRepositoryArtwork
              ? "group-hover:scale-[1.015]"
              : "group-hover:scale-[1.045]",
            isLeagueArtwork
              ? variant === "hero"
                ? "object-contain p-[19%] opacity-90"
                : "object-contain p-[11%]"
              : isValorantArtwork
                ? variant === "hero"
                  ? "object-contain p-[6%] opacity-95"
                  : "object-contain p-[2%]"
                : "object-cover",
            imageClassName,
          )}
        />
      )}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-white/[0.025]",
          isMinimalLogoArtwork &&
            "bg-[linear-gradient(180deg,rgba(255,255,255,0.018),transparent_36%,rgba(0,0,0,0.18))]",
        )}
        aria-hidden="true"
      />
    </div>
  );
}
