import { Link } from "@tanstack/react-router";
import { BrandLogoPlaceholder } from "@/components/brand/BrandLogoPlaceholder";
import { LEGAL_CONTACT_LABEL, LEGAL_CONTACT_URL } from "@/config/legal";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

export function AppFooter() {
  const { t, locale } = useI18n();
  const copy = (pt: string, en: string, es: string) =>
    localeCopy(locale, pt, en, es);

  return (
    <footer className="mt-12 border-t border-border bg-surface sm:mt-16">
      <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <BrandLogoPlaceholder withFullName />
          <div className="space-y-3 md:text-right">
            <nav
              aria-label={copy(
                "Links legais",
                "Legal links",
                "Enlaces legales",
              )}
              className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground md:justify-end"
            >
              <Link
                to="/terms"
                className="transition-colors hover:text-gold-strong"
              >
                {copy("Termos de Uso", "Terms of Use", "Términos de Uso")}
              </Link>
              <Link
                to="/privacy"
                className="transition-colors hover:text-gold-strong"
              >
                {copy("Privacidade", "Privacy", "Privacidad")}
              </Link>
              <a
                href={LEGAL_CONTACT_URL}
                className="transition-colors hover:text-gold-strong"
                aria-label={`${copy("Contato", "Contact", "Contacto")}: ${LEGAL_CONTACT_LABEL}`}
              >
                {copy("Contato", "Contact", "Contacto")}
              </a>
            </nav>
            <p className="text-xs text-muted-foreground">
              {t("brand.tagline")} · MG Profile v0.1.6B · © {new Date().getFullYear()}
            </p>
          </div>
        </div>
        <p className="mt-5 max-w-4xl border-t border-border pt-4 text-[0.68rem] leading-5 text-muted-foreground/75">
          MG Profile was created under Riot Games&apos; &quot;Legal Jibber Jabber&quot;
          policy using assets owned by Riot Games. Riot Games does not endorse
          or sponsor this project.
        </p>
      </div>
    </footer>
  );
}
