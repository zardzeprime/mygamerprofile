import type { AppLocale, Locale as ContentLocale } from "./translations";

export function toContentLocale(locale: AppLocale): ContentLocale {
  return locale === "pt-BR" ? "pt-BR" : "en";
}

export function localeCopy(locale: AppLocale, ptBR: string, en: string, es: string): string {
  if (locale === "pt-BR") return ptBR;
  if (locale === "es") return es;
  return en;
}
