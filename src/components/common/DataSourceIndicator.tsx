import { BadgeCheck, CircleSlash, FlaskConical, UserPen } from "lucide-react";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export type DataSource = "verified" | "player_provided" | "mock" | "unavailable";

const CONFIG: Record<DataSource, { icon: typeof BadgeCheck; className: string }> = {
  verified: { icon: BadgeCheck, className: "border-success/40 bg-success/10 text-success" },
  player_provided: { icon: UserPen, className: "border-gold/40 bg-gold-soft/50 text-gold-strong" },
  mock: { icon: FlaskConical, className: "border-border-strong bg-muted text-muted-foreground" },
  unavailable: { icon: CircleSlash, className: "border-border bg-muted text-muted-foreground" },
};

export function DataSourceIndicator({
  source,
  className,
}: {
  source: DataSource;
  className?: string;
}) {
  const { t } = useI18n();
  const { icon: Icon, className: tone } = CONFIG[source];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold",
        tone,
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {t(`dataSource.${source}`)}
    </span>
  );
}
