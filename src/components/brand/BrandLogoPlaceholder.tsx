import { Link } from "@tanstack/react-router";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

export function BrandLogoPlaceholder({
  withFullName = false,
  size = "md",
  className,
}: {
  withFullName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { locale } = useI18n();
  const fullName = localeCopy(locale, "Identidade gamer", "Gaming identity", "Identidad gamer");

  const markSize = size === "lg" ? "size-12" : size === "sm" ? "size-7" : "size-9";
  const textSize = size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-base";

  return (
    <Link
      to="/"
      aria-label={`ÍMPAR — ${fullName}`}
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "brand-logo-shell grid shrink-0 place-items-center overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-[1.06]",
          markSize,
        )}
      >
        <img
          src="/brand/impar-logo-official.webp"
          alt=""
          width={256}
          height={256}
          decoding="async"
          draggable={false}
          className="h-full w-full select-none object-contain"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("font-display font-bold tracking-tight text-foreground", textSize)}>
          ÍMPAR
        </span>
        {withFullName ? (
          <span className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {fullName}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
