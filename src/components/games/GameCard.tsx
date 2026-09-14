import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import type { GameConfig } from "@/config/games";
import { cn } from "@/lib/utils";

const ATMOSPHERE: Record<GameConfig["themeKey"], string> = {
  dark_souls: "hub-atmosphere-dark-souls",
  valorant: "hub-atmosphere-valorant",
};

export function GameCard({ game }: { game: GameConfig }) {
  const { locale, t } = useI18n();

  return (
    <article className="surface-panel group overflow-hidden">
      <div
        aria-hidden="true"
        className={cn("h-28 w-full opacity-70 transition-opacity group-hover:opacity-90", ATMOSPHERE[game.themeKey])}
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-foreground">{game.name}</h3>
          <span className="shrink-0 rounded-full border border-border-strong px-2 py-0.5 text-[0.7rem] font-semibold text-muted-foreground">
            {game.ageRating}
          </span>
        </div>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {game.description[locale]}
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          <li className="rounded-full bg-gold-soft/60 px-2 py-0.5 text-[0.7rem] font-semibold text-gold-strong">
            {game.genre}
          </li>
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
          className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t("games.openHub")}
        </Link>
      </div>
    </article>
  );
}
