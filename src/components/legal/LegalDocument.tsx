import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Scale } from "lucide-react";
import { BrandLogoPlaceholder } from "@/components/brand/BrandLogoPlaceholder";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  summary: string;
  effectiveDate: string;
  version: string;
  sections: LegalSection[];
};

export function LegalDocument({
  eyebrow,
  title,
  summary,
  effectiveDate,
  version,
  sections,
}: LegalDocumentProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-gold-strong"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar ao MGP
      </Link>

      <article className="overflow-hidden rounded-3xl border border-border bg-surface shadow-lift">
        <header className="border-b border-border bg-gradient-to-br from-gold/10 via-surface to-surface px-5 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-strong">
                {eyebrow}
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h1>
              <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                {summary}
              </p>
            </div>
            <BrandLogoPlaceholder size="lg" className="shrink-0" />
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5">
              <CalendarDays
                className="size-3.5 text-gold-strong"
                aria-hidden="true"
              />
              Vigente desde {effectiveDate}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1.5">
              <Scale className="size-3.5 text-gold-strong" aria-hidden="true" />
              Versão {version} · texto oficial em português
            </span>
          </div>
        </header>

        <div className="grid gap-8 px-5 py-8 sm:px-10 sm:py-10 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <nav
            aria-label="Nesta página"
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Nesta página
            </p>
            <ol className="space-y-1 border-l border-border pl-3 text-sm">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-r-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-gold/5 hover:text-gold-strong"
                  >
                    {index + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0 space-y-9">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24"
              >
                <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
                  {index + 1}. {section.title}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground sm:text-[0.95rem]">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
