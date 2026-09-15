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
          className={cn("game-artwork-base h-full w-full object-cover", imageClassName)}
        />
      </div>
    );
  }

  const agents = PROMO_AGENT_NAMES.map((name) => VALORANT_PROMO_AGENTS.find((agent) => agent.name === name)).filter(Boolean);

  return (
    <div
      className={cn(
        "game-artwork game-artwork-valorant relative h-full w-full overflow-hidden bg-[#121722]",
        variant === "hero" ? "game-artwork-valorant-hero" : "game-artwork-valorant-card",
        className,
      )}
    >
      <img
        src={source}
        alt=""
        width={1600}
        height={1000}
        loading={loading}
        className={cn("game-artwork-base absolute inset-0 h-full w-full object-cover opacity-30", imageClassName)}
      />
      <div className="game-artwork-valorant-glow absolute inset-0" aria-hidden="true" />
      <div className="game-artwork-agent-stage absolute inset-0" aria-hidden="true">
        {agents.map((agent, index) => (
          <img
            key={agent!.name}
            src={agent!.image}
            alt=""
            loading={loading}
            className="game-artwork-agent absolute bottom-[-7%] w-[43%] max-w-none select-none object-contain"
            style={{ left: `${-15 + index * 20}%`, zIndex: index + 1 }}
          />
        ))}
      </div>
      <div className="game-artwork-valorant-vignette absolute inset-0" aria-hidden="true" />
    </div>
  );
}
