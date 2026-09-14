import { BrandLogoPlaceholder } from "@/components/brand/BrandLogoPlaceholder";
import { useI18n } from "@/i18n";

export function AppFooter() {
  const { t } = useI18n();

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
        <BrandLogoPlaceholder withFullName />
        <p className="text-xs text-muted-foreground">
          {t("brand.tagline")} · © {new Date().getFullYear()} {t("brand.name")}
        </p>
      </div>
    </footer>
  );
}
