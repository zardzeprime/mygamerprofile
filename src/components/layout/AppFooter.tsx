import { BrandLogoPlaceholder } from "@/components/brand/BrandLogoPlaceholder";
import { useI18n } from "@/i18n";

export function AppFooter() {
  const { t } = useI18n();

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <BrandLogoPlaceholder withFullName />
          <p className="text-xs text-muted-foreground">
            {t("brand.tagline")} · MGP v0.1.3B · © {new Date().getFullYear()}
          </p>
        </div>
        <p className="mt-5 max-w-4xl border-t border-border pt-4 text-[0.68rem] leading-5 text-muted-foreground/75">
          MGP was created under Riot Games&apos; &quot;Legal Jibber Jabber&quot; policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.
        </p>
      </div>
    </footer>
  );
}
