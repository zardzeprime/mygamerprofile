import { Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { leagueRuneIcon, type LeagueRuneStyle } from "@/lib/league-runes";
import { cn } from "@/lib/utils";

export function LeagueRuneTreeWheel({
  locale,
  styles,
  activeStyle,
  onSelect,
}: {
  locale: Locale;
  styles: LeagueRuneStyle[];
  activeStyle: LeagueRuneStyle;
  onSelect: (style: LeagueRuneStyle) => void;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const otherStyles = styles.filter((style) => style.id !== activeStyle.id);

  const dialog =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-background/65 px-4 backdrop-blur-md animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label={copy(
              "Selecionar árvore principal de runas",
              "Select primary rune tree",
              "Seleccionar árbol principal de runas",
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-default"
              aria-label={copy("Fechar seletor", "Close selector", "Cerrar selector")}
            />

            <div className="relative z-10 flex w-full max-w-xl flex-col items-center">
              <div className="mb-4 text-center sm:mb-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-background/80 px-3 py-1.5 text-[0.64rem] font-black uppercase tracking-[0.12em] text-gold-strong shadow-lift">
                  <Sparkles className="size-3.5" />
                  {copy("Trocar árvore principal", "Change primary tree", "Cambiar árbol principal")}
                </div>
                <p className="mx-auto mt-3 max-w-sm text-xs leading-5 text-muted-foreground">
                  {copy(
                    "A árvore atual fica no centro. Escolha uma das árvores ao redor para trocar instantaneamente.",
                    "Your current tree stays in the center. Choose one of the surrounding trees to switch instantly.",
                    "El árbol actual queda en el centro. Elige uno de los árboles alrededor para cambiar al instante.",
                  )}
                </p>
              </div>

              <div className="relative h-[19rem] w-[19rem] sm:h-[27rem] sm:w-[27rem]">
                <div className="pointer-events-none absolute inset-1/2 size-[13rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10 bg-[radial-gradient(circle,hsl(var(--gold)/0.09),transparent_68%)] sm:size-[18rem]" />
                <div className="pointer-events-none absolute inset-1/2 size-[17rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/55 sm:size-[24rem]" />

                <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-90 duration-300">
                  <div className="relative grid size-28 place-items-center rounded-full border border-gold/50 bg-background/95 shadow-lift sm:size-36">
                    <span className="absolute inset-2 rounded-full border border-gold/20" />
                    <img
                      src={leagueRuneIcon(activeStyle.icon)}
                      alt=""
                      className="relative size-14 object-contain sm:size-20"
                    />
                    <span className="absolute -bottom-7 whitespace-nowrap rounded-full border border-gold/30 bg-background/95 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.08em] text-foreground shadow-sm">
                      {activeStyle.name}
                    </span>
                  </div>
                </div>

                {otherStyles.map((style, index) => {
                  const angle = -90 + (360 / Math.max(otherStyles.length, 1)) * index;
                  const radians = (angle * Math.PI) / 180;
                  const x = 50 + Math.cos(radians) * 38;
                  const y = 50 + Math.sin(radians) * 38;

                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        onSelect(style);
                        setOpen(false);
                      }}
                      className={cn(
                        "group absolute z-30 -translate-x-1/2 -translate-y-1/2",
                        "animate-in fade-in zoom-in-75 duration-300",
                      )}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        animationDelay: `${70 + index * 55}ms`,
                        animationFillMode: "both",
                      }}
                      aria-label={copy(
                        `Selecionar ${style.name}`,
                        `Select ${style.name}`,
                        `Seleccionar ${style.name}`,
                      )}
                    >
                      <span className="flex w-20 flex-col items-center gap-1.5 sm:w-28">
                        <span className="grid size-16 place-items-center rounded-full border border-border bg-background/95 shadow-lift transition-all duration-200 group-hover:scale-110 group-hover:border-gold/50 group-hover:bg-gold/10 sm:size-20">
                          <img
                            src={leagueRuneIcon(style.icon)}
                            alt=""
                            className="size-10 object-contain transition-transform duration-200 group-hover:scale-105 sm:size-12"
                          />
                        </span>
                        <span className="max-w-full truncate rounded-full border border-border bg-background/90 px-2 py-1 text-[0.58rem] font-black uppercase tracking-[0.06em] text-muted-foreground shadow-sm transition-colors group-hover:border-gold/30 group-hover:text-foreground sm:text-[0.64rem]">
                          {style.name}
                        </span>
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute -right-2 -top-2 z-40 grid size-10 place-items-center rounded-full border border-border bg-background/95 text-muted-foreground shadow-lift transition hover:border-gold/35 hover:text-foreground sm:right-0 sm:top-0"
                  aria-label={copy("Fechar", "Close", "Cerrar")}
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-1/2 z-50 -translate-y-1/2 rounded-2xl border border-gold/35 bg-background/95 p-2.5 text-left shadow-lift backdrop-blur transition-all hover:-translate-y-[52%] hover:border-gold/60 hover:bg-background sm:p-3"
        style={{ left: "max(0.75rem, calc((100vw - 80rem) / 2 - 4.5rem))" }}
        aria-label={copy(
          "Abrir seletor de árvore principal",
          "Open primary rune tree selector",
          "Abrir selector de árbol principal",
        )}
      >
        <span className="flex items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-gold/20 bg-gold/10 sm:size-11">
            <img src={leagueRuneIcon(activeStyle.icon)} alt="" className="size-7 object-contain sm:size-8" />
          </span>
          <span className="hidden min-w-0 xl:block">
            <span className="block text-[0.55rem] font-black uppercase tracking-[0.12em] text-muted-foreground">
              {copy("Árvore atual", "Current tree", "Árbol actual")}
            </span>
            <span className="mt-0.5 block max-w-24 truncate text-xs font-bold text-foreground">
              {activeStyle.name}
            </span>
          </span>
        </span>
      </button>

      {dialog}
    </>
  );
}
