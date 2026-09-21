import { cn } from "@/lib/utils";

type AdSlotFormat = "leaderboard" | "rectangle" | "rail" | "fluid";

type AdSlotProps = {
  id: string;
  format?: AdSlotFormat;
  className?: string;
  label?: string;
};

/**
 * Layout reservation for future AdSense inventory.
 * It intentionally renders no ad network markup yet: monetization can be
 * activated centrally without rebuilding individual hubs.
 */
export function AdSlot({ id, format = "fluid", className, label = "Publicidade" }: AdSlotProps) {
  return (
    <aside
      data-ad-slot={id}
      data-ad-format={format}
      aria-label={label}
      className={cn(
        "mgp-ad-slot",
        format === "leaderboard" && "mgp-ad-slot--leaderboard",
        format === "rectangle" && "mgp-ad-slot--rectangle",
        format === "rail" && "mgp-ad-slot--rail",
        className,
      )}
    />
  );
}

export function AdReadyLayout({
  children,
  rail,
  className,
}: {
  children: React.ReactNode;
  rail?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mgp-ad-layout", className)}>
      <div className="mgp-ad-layout__main">{children}</div>
      {rail ? <div className="mgp-ad-layout__rail">{rail}</div> : null}
    </div>
  );
}
