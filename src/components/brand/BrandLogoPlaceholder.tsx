import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

function MGPBrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 128 128"
      aria-hidden="true"
      className={cn("block", className)}
    >
      <defs>
        <linearGradient id="mgp-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E4BC4C" />
          <stop offset="1" stopColor="#B88922" />
        </linearGradient>
      </defs>

      <circle cx="64" cy="64" r="46" fill="#15181D" />

      <path
        d="M107 39A50 50 0 1 0 107 89"
        fill="none"
        stroke="url(#mgp-gold)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M96 64h24"
        fill="none"
        stroke="url(#mgp-gold)"
        strokeWidth="9"
        strokeLinecap="square"
      />

      <path
        d="M38 98c5-11 14-17 26-17s21 6 26 17"
        fill="none"
        stroke="url(#mgp-gold)"
        strokeWidth="7"
        strokeLinecap="round"
      />

      <path
        d="M50 58c0-12 6-21 14-21s14 9 14 21v10c0 11-6 18-14 18s-14-7-14-18V58Z"
        fill="#15181D"
        stroke="url(#mgp-gold)"
        strokeWidth="4.5"
      />

      <path
        d="M43 61V53c0-15 9-28 21-28s21 13 21 28v8"
        fill="none"
        stroke="url(#mgp-gold)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <rect x="36" y="54" width="11" height="24" rx="5.5" fill="url(#mgp-gold)" />
      <rect x="81" y="54" width="11" height="24" rx="5.5" fill="url(#mgp-gold)" />

      <path
        d="M88 72c0 9-5 14-14 15"
        fill="none"
        stroke="url(#mgp-gold)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="69" y="84" width="10" height="5" rx="2.5" fill="url(#mgp-gold)" />
    </svg>
  );
}

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

  const markSize = size === "lg" ? "size-14" : size === "sm" ? "size-7" : "size-9";
  const textSize = size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-base";

  return (
    <Link
      to="/"
      aria-label={`${t("brand.name")} — ${t("brand.full")}`}
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <MGPBrandMark
        className={cn(
          "shrink-0 transition-transform duration-200 group-hover:scale-105",
          markSize,
        )}
      />
      <span className="flex flex-col leading-none">
        <span className={cn("font-display font-bold tracking-tight text-foreground", textSize)}>
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
