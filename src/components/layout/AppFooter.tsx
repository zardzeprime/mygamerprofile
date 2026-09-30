import { Link } from "@tanstack/react-router";
import { BrandLogoPlaceholder } from "@/components/brand/BrandLogoPlaceholder";
import { LEGAL_CONTACT_LABEL, LEGAL_CONTACT_URL } from "@/config/legal";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

export function AppFooter() {
  const { locale } = useI18n();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <footer className="mt-12 border-t border-[var(--impar-line)] bg-[color:var(--impar-night)] sm:mt-16">
      <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <BrandLogoPlaceholder withFullName />
            <p className="mt-3 max-w-sm text-xs leading-5 text-muted-foreground">
              {copy(
                "Seu jogo. Seu perfil. Do seu jeito.",
                "Your game. Your profile. Your way.",
                "Tu juego. Tu perfil. A tu manera.",
              )}
            </p>
          </div>

          <div className="space-y-3 md:text-right">
            <nav
              aria-label={copy("Links legais", "Legal links", "Enlaces legales")}
              className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground md:justify-end"
            >
              <Link to="/terms" className="transition-colors hover:text-[var(--impar-spectral)]">
                {copy("Termos de Uso", "Terms of Use", "Términos de Uso")}
              </Link>
              <Link to="/privacy" className="transition-colors hover:text-[var(--impar-spectral)]">
                {copy("Privacidade", "Privacy", "Privacidad")}
              </Link>
              <Link
                to="/support"
                className="font-semibold text-[var(--impar-amber)] transition-colors hover:text-foreground"
              >
                {copy("Apoie o ÍMPAR", "Support ÍMPAR", "Apoya ÍMPAR")}
              </Link>
              <a
                href={LEGAL_CONTACT_URL}
                className="transition-colors hover:text-[var(--impar-spectral)]"
                aria-label={`${copy("Contato", "Contact", "Contacto")}: ${LEGAL_CONTACT_LABEL}`}
              >
                {copy("Contato", "Contact", "Contacto")}
              </a>
            </nav>
            <p className="text-xs text-muted-foreground">
              {copy("Comunidade ÍMPAR", "ÍMPAR Community", "Comunidad ÍMPAR")} · {copy("Beta público", "Public beta", "Beta público")} · © {new Date().getFullYear()}
            </p>
          </div>
        </div>

        <p className="mt-5 max-w-4xl border-t border-[var(--impar-line)] pt-4 text-[0.68rem] leading-5 text-muted-foreground/75">
          {copy(
            "ÍMPAR foi criado de acordo com a política Legal Jibber Jabber da Riot Games, usando recursos pertencentes à Riot Games. A Riot Games não endossa nem patrocina este projeto.",
            "ÍMPAR was created under Riot Games' Legal Jibber Jabber policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.",
            "ÍMPAR fue creado bajo la política Legal Jibber Jabber de Riot Games usando recursos propiedad de Riot Games. Riot Games no respalda ni patrocina este proyecto.",
          )}
        </p>
      </div>
    </footer>
  );
}
