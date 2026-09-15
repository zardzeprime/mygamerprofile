import type { GameConfig } from "@/config/games";
import { VALORANT_PROMO_AGENTS } from "@/data/valorantPromoAgents";
import { cn } from "@/lib/utils";

type GameArtworkProps = {
  game: GameConfig;
  variant?: "card" | "hero";
  className?: string;
  imageClassName?: string;
  loading?: "eager" | "lazy";
};

const PROMO_AGENT_NAMES = ["Jett", "Raze", "Sage", "Omen", "Viper", "Sova"];

export function GameArtwork({
  game,
  variant = "card",
  className,
  imageClassName,
  loading = "lazy",
}: GameArtworkProps) {
  const source = variant === "hero" ? game.visual.heroImage : game.visual.coverImage;

  if (game.themeKey !== "valorant") {
    return (
      <div className={cn("game-artwork relative h-full w-full overflow-hidden", className)}>
        <img
          src={source}
          alt=""
          width={1600}
          height={1000}
          loading={loading}
          className={cn(
            "game-artwork-base h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.065]",
            imageClassName,
          )}
        />
      </div>
    );
  }

  const agents = PROMO_AGENT_NAMES.map((name) => VALORANT_PROMO_AGENTS.find((agent) => agent.name === name)).filter(Boolean);

  return (
    <div
      className={cn(
        "game-artwork relative h-full w-full overflow-hidden bg-[#121722]",
        className,
      )}
    >
      <img
        src={source}
        alt=""
        width={1600}
        height={1000}
        loading={loading}
        className={cn(
          "game-artwork-base absolute inset-0 h-full w-full object-cover opacity-30 transition-transform duration-700 group-hover:scale-[1.055]",
          imageClassName,
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#30466f]/70 via-[#151b28]/20 to-[#5b1f35]/55" aria-hidden="true" />
      <div className="absolute inset-0" aria-hidden="true">
        {agents.map((agent, index) => (
          <img
            key={agent!.name}
            src={agent!.image}
            alt=""
            loading={loading}
            className={cn(
              "absolute bottom-[-7%] max-w-none select-none object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)] transition-transform duration-700 group-hover:-translate-y-1 group-hover:scale-[1.035]",
              variant === "hero" ? "w-[31%]" : "w-[43%]",
            )}
            style={{
              left: variant === "hero" ? `${-4 + index * 16}%` : `${-15 + index * 20}%`,
              zIndex: index + 1,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" aria-hidden="true" />
    </div>
  );
}
