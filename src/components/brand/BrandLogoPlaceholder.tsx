import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

/**
 * Temporary textual brand mark. Replace the inner block with the real logo
 * asset later without touching the header layout.
 */
export function BrandLogoPlaceholder({
  withFullName = false,
  size = "md",
  className,
}: {
  withFullName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { t } = useI18n();

  const markSize = size === "lg" ? "size-12 text-[0.95rem]" : size === "sm" ? "size-7 text-[0.6rem]" : "size-9 text-[0.7rem]";
  const textSize = size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-base";

  return (
    <Link
      to="/"
      aria-label={`${t("brand.name")} — ${t("brand.full")}`}
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span
        aria-hidden="true"
        className={cn("grid place-items-center rounded-full border border-gold/60 bg-gold-soft/40 font-display font-bold tracking-tight text-gold-strong transition-colors group-hover:border-gold", markSize)}
      >
        MGP
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-bold tracking-tight text-foreground">
          {t("brand.name")}
        </span>
        {withFullName ? (
          <span className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t("brand.full")}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
