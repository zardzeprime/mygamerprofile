import { useRef, useState } from "react";
import { BadgeCheck, BookOpen, ChevronDown, ChevronUp, Flame, Library } from "lucide-react";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { DarkSoulsStatsGuide } from "@/components/games/DarkSoulsStatsGuide";
import { cn } from "@/lib/utils";

export function DarkSoulsGuides({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [openGuide, setOpenGuide] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const expanded = openGuide === "stats-01";

  const toggleGuide = () => {
    const willOpen = !expanded;
    setOpenGuide(willOpen ? "stats-01" : null);
    if (willOpen) {
      requestAnimationFrame(() => {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        contentRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      });
    }
  };

  return (
    <div className="space-y-6">
      <section className="surface-panel rounded-2xl p-6 sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2"><Library className="size-4 text-gold-strong" /><span className="section-kicker">{copy("BIBLIOTECA DE GUIAS", "GUIDE LIBRARY", "BIBLIOTECA DE GUÍAS")}</span></div>
            <h2 className="mt-2 font-display text-3xl font-semibold">{copy("Aprenda Lordran por partes", "Learn Lordran one system at a time", "Aprende Lordran sistema por sistema")}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{copy("Esta área é uma coleção expansível. Cada guia fica separado para a página continuar organizada conforme novos conteúdos forem publicados.", "This area is an expandable collection. Every guide stays separate so the page remains organized as new content is published.", "Esta área es una colección ampliable. Cada guía queda separada para mantener la página organizada a medida que se publique nuevo contenido.")}</p>
          </div>
          <div className="rounded-full border border-gold/25 bg-gold-soft/20 px-3 py-1.5 text-xs font-bold text-gold-strong">1 {copy("guia publicado", "guide published", "guía publicada")}</div>
        </div>
      </section>

      <article className={cn("overflow-hidden rounded-2xl border transition-colors", expanded ? "border-amber-600/35 bg-amber-950/10" : "border-border bg-surface hover:border-amber-700/30")}>
        <button type="button" onClick={toggleGuide} aria-expanded={expanded} aria-controls="dark-souls-guide-stats" className="group flex w-full items-center gap-4 p-5 text-left sm:p-6">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-amber-600/30 bg-amber-500/10 text-amber-400"><BookOpen className="size-5" /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-amber-400">{copy("GUIA 01", "GUIDE 01", "GUÍA 01")}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-700/25 bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-emerald-400"><BadgeCheck className="size-3" />{copy("Publicado", "Published", "Publicado")}</span>
            </div>
            <h3 className="mt-1 font-display text-xl font-semibold sm:text-2xl">{copy("Stats: tudo que você precisa saber", "Stats: everything you need to know", "Stats: todo lo que necesitas saber")}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{copy("Os oito atributos, soft caps, scaling S–E, duas mãos, Magic Adjustment, Humanity e rotas de upgrade — do básico ao avançado.", "All eight stats, soft caps, S–E scaling, two-handing, Magic Adjustment, Humanity and upgrade paths—from basics to advanced concepts.", "Los ocho atributos, soft caps, escalado S–E, dos manos, Ajuste Mágico, Humanidad y rutas de mejora, desde lo básico hasta lo avanzado.")}</p>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-muted/20 text-muted-foreground transition-colors group-hover:border-amber-700/30 group-hover:text-amber-400">{expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}</span>
        </button>

        {expanded && (
          <div ref={contentRef} id="dark-souls-guide-stats" className="scroll-mt-24 border-t border-border px-4 py-6 sm:px-6 sm:py-8">
            <DarkSoulsStatsGuide locale={locale} />
          </div>
        )}
      </article>

      <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-5 sm:p-6">
        <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-muted/20 text-muted-foreground"><Flame className="size-4" /></span><div><p className="font-semibold">{copy("A biblioteca vai crescer daqui", "The library grows from here", "La biblioteca crecerá desde aquí")}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{copy("Os próximos guias podem entrar como novos capítulos independentes sem transformar esta aba em uma parede infinita de conteúdo.", "Future guides can arrive as independent chapters without turning this tab into one endless wall of content.", "Las próximas guías pueden llegar como capítulos independientes sin convertir esta pestaña en una pared infinita de contenido.")}</p></div></div>
      </div>
    </div>
  );
}
