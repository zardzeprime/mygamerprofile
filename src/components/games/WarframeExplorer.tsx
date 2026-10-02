import { BookOpen, PackageSearch, Wrench } from "lucide-react";

import { WarframeCodex } from "@/components/games/WarframeCodex";
import { WARFRAME_GUIDE_SEEDS } from "@/data/warframeRoster";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

export function WarframeExplorer({
  mode,
  locale,
}: {
  mode: "warframes" | "guides";
  locale: Locale;
}) {
  return mode === "guides" ? (
    <WarframeGuides locale={locale} />
  ) : (
    <WarframeCodex locale={locale} />
  );
}

function WarframeGuides({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);

  return (
    <div className="space-y-5">
      <div className="surface-panel p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-gold-strong" />
          <span className="section-kicker">ÍMPAR / TENNO GUIDES</span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
          {copy(
            "Central de guias do Warframe",
            "Warframe guide center",
            "Centro de guías de Warframe",
          )}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {copy(
            "Guias editoriais do ÍMPAR para progressão, Mods, dano, Status e farming. Warframes, Armas e Itens vivem em módulos separados para cada área ter uma função clara.",
            "ÍMPAR editorial guides for progression, Mods, damage, Status and farming. Warframes, Weapons and Items live in separate hub modules so every area has a clear purpose.",
            "Guías editoriales de ÍMPAR para progresión, Mods, daño, Estado y farming. Warframes, Armas y Objetos viven en módulos separados para que cada área tenga una función clara.",
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 min-[520px]:gap-4">
        {WARFRAME_GUIDE_SEEDS.map((guide) => (
          <article key={guide.slug} className="surface-panel min-w-0 p-3 min-[520px]:p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 min-[520px]:gap-3">
              {guide.slug === "farming-roadmap" ? (
                <PackageSearch className="size-5 text-gold-strong" />
              ) : (
                <Wrench className="size-5 text-gold-strong" />
              )}
              <span className="rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                {guide.status === "foundation"
                  ? copy("Fundação pronta", "Foundation ready", "Base lista")
                  : copy("Rascunho", "Draft", "Borrador")}
              </span>
            </div>
            <h3 className="mt-3 text-balance font-display text-base font-semibold leading-tight text-foreground min-[520px]:mt-4 min-[520px]:text-xl">
              {guide.title[locale]}
            </h3>
            <p className="mt-2 line-clamp-4 text-xs leading-5 text-muted-foreground min-[520px]:line-clamp-none min-[520px]:text-sm min-[520px]:leading-6">
              {guide.description[locale]}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
