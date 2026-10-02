import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type AdSlotFormat = "leaderboard" | "rectangle" | "rail" | "fluid";

type AdSlotProps = {
  id: string;
  format?: AdSlotFormat;
  className?: string;
  label?: string;
};

const ADSENSE_CLIENT = "ca-pub-7774329183197175";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

function configuredAdUnit(format: AdSlotFormat) {
  if (format === "rail") return import.meta.env["VITE_ADSENSE_RAIL_SLOT"] || "";
  if (format === "leaderboard") {
    return import.meta.env["VITE_ADSENSE_LEADERBOARD_SLOT"] || "";
  }
  if (format === "rectangle") {
    return import.meta.env["VITE_ADSENSE_RECTANGLE_SLOT"] || "";
  }
  return import.meta.env["VITE_ADSENSE_FLUID_SLOT"] || "";
}

/**
 * Manual AdSense unit location. When no manual ad-unit ID is configured, the
 * component renders nothing and the global AdSense loader remains available
 * for Auto Ads. Ad unit IDs are public identifiers and may be supplied through
 * VITE_ADSENSE_* variables without exposing account credentials.
 */
export function AdSlot({ id, format = "fluid", className, label = "Publicidade" }: AdSlotProps) {
  const unitSlot = configuredAdUnit(format);
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!unitSlot || requestedRef.current) return;
    requestedRef.current = true;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (error) {
      console.warn("[ÍMPAR] AdSense unit could not be requested.", error);
    }
  }, [unitSlot]);

  if (!unitSlot) return null;

  return (
    <aside
      data-mgp-ad-location={id}
      aria-label={label}
      className={cn(
        "mgp-ad-slot",
        format === "leaderboard" && "mgp-ad-slot--leaderboard",
        format === "rectangle" && "mgp-ad-slot--rectangle",
        format === "rail" && "mgp-ad-slot--rail",
        className,
      )}
    >
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={unitSlot}
        data-ad-format={format === "rail" ? "auto" : format === "leaderboard" ? "horizontal" : "auto"}
        data-tag-for-age-treatment="2"
        data-full-width-responsive="true"
      />
    </aside>
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
  const manualRailEnabled = Boolean(configuredAdUnit("rail"));

  return (
    <div className={cn("mgp-ad-layout", !manualRailEnabled && "mgp-ad-layout--single", className)}>
      <div className="mgp-ad-layout__main">{children}</div>
      {rail && manualRailEnabled ? <div className="mgp-ad-layout__rail">{rail}</div> : null}
    </div>
  );
}
