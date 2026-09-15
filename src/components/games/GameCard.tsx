import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useI18n } from "@/i18n";
import type { GameConfig } from "@/config/games";
import { ArrowUpRight, Play } from "lucide-react";
import { useSound } from "@/lib/sound";
import { GameArtwork } from "@/components/games/GameArtwork";

export function GameCard({ game }: { game: GameConfig }) {
  const { locale, t } = useI18n();
  const { play } = useSound();
  const bonfireTimerRef = useRef<number | null>(null);

  const stopBonfire = () => {
    if (bonfireTimerRef.current !== null) {
      window.clearInterval(bonfireTimerRef.current);
      bonfireTimerRef.current = null;
    }
  };

  const handlePointerEnter = () => {
    if (game.themeKey !== "dark_souls") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    stopBonfire();
    play("bonfire");
    bonfireTimerRef.current = window.setInterval(() => play("bonfire"), 430);
  };

  useEffect(() => () => stopBonfire(), []);

  return (
    <article
      className="game-card group overflow-hidden"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={stopBonfire}
    >
      <div className="game-card-media relative aspect-[16/10] overflow-hidden">
        <GameArtwork game={game} className="game-card-image" />
        <div className="game-card-scrim absolute inset-0" />
        <div className="game-card-sheen absolute inset-0" aria-hidden="true" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="rounded-sm border border-border-strong bg-background/80 px-2 py-1 text-[0.65rem] font-bold uppercase text-foreground backdrop-blur">{game.genre}</span>
          <span className="rounded-sm bg-background/80 px-2 py-1 text-[0.65rem] font-semibold text-muted-foreground backdrop-blur">{game.ageRating}</span>
        </div>
        <span className="absolute bottom-4 right-4 grid size-9 translate-y-2 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden="true"><Play className="size-4 fill-current" /></span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-foreground">{game.name}</h3>
          <ArrowUpRight className="size-4 shrink-0 text-gold-strong transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {game.description[locale]}
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {game.platforms.map((platform) => (
            <li
              key={platform}
              className="rounded-full bg-muted px-2 py-0.5 text-[0.7rem] font-medium text-muted-foreground"
            >
              {platform}
            </li>
          ))}
        </ul>
        <Link
          to="/games/$slug"
          params={{ slug: game.slug }}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold-strong story-link"
        >
          {t("games.openHub")}
        </Link>
      </div>
    </article>
  );
}
