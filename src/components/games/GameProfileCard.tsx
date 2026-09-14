import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import { DataSourceIndicator } from "@/components/common/DataSourceIndicator";
import { getGameConfig } from "@/config/games";

interface GameProfileCardProps {
  gameProfile: {
    game_id: string;
    profile_data: Record<string, unknown>;
    visibility: string;
  };
  username: string;
}

export function GameProfileCard({ gameProfile, username }: GameProfileCardProps) {
  const { t } = useI18n();
  const config = getGameConfigById(gameProfile.game_id);
  if (!config) return null;

  return (
    <Link to="/u/$username/games/$slug" params={{ username, slug: config.slug }}>
      <article className="surface-panel hover-lift rounded-xl p-4 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg font-semibold">{config.name}</h3>
          <DataSourceIndicator source="player_provided" />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {Object.keys(gameProfile.profile_data).length} {t("profile.games")}
        </p>
      </article>
    </Link>
  );
}

function getGameConfigById(id: string) {
  return getGameConfig(id) || undefined;
}
