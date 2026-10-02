import { useState } from "react";
import { BookOpen, Boxes, PackageSearch, Sparkles, Sword, Wrench } from "lucide-react";

import { WarframeDatabase } from "@/components/games/WarframeDatabase";
import { WARFRAME_GUIDE_SEEDS } from "@/data/warframeRoster";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

type DatabaseSection = "warframes" | "weapons" | "items";

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
    <WarframeArsenal locale={locale} />
  );
}

function WarframeArsenal({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [section, setSection] = useState<DatabaseSection>("warframes");
  const tabs: Array<{ id: DatabaseSection; icon: typeof Sparkles; label: string; detail: string }> =
    [
      {
        id: "warframes",
        icon: Sparkles,
        label: "Warframes",
        detail: copy(
          "Peças, Sistemas, Chassi e Fundição",
          "Parts, Systems, Chassis and Foundry",
          "Piezas, Sistemas, Chasis y Fundición",
        ),
      },
      {
        id: "weapons",
        icon: Sword,
        label: copy("Armas", "Weapons", "Armas"),
        detail: copy(
          "Stats, receita, MR e drops",
          "Stats, recipe, MR and drops",
          "Stats, receta, MR y drops",
        ),
      },
      {
        id: "items",
        icon: Boxes,
        label: copy("Itens", "Items", "Objetos"),
        detail: copy(
          "Recursos, blueprints e equipamentos",
          "Resources, blueprints and gear",
          "Recursos, planos y equipo",
        ),
      },
    ];

  return (
    <div className="space-y-4">
      <nav
        className="surface-panel grid grid-cols-3 gap-2 p-2"
        aria-label={copy("Banco de dados Warframe", "Warframe database", "Base de datos Warframe")}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = section === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSection(tab.id)}
              aria-pressed={active}
              className={cn(
                "min-w-0 rounded-xl border px-2.5 py-3 text-left transition-all sm:px-4",
                active
                  ? "border-gold/35 bg-gold/[0.08] shadow-sm"
                  : "border-transparent hover:border-border hover:bg-muted/25",
              )}
            >
              <div className="flex items-center gap-2">
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-gold-strong" : "text-muted-foreground",
                  )}
                />
                <span className="truncate text-sm font-semibold text-foreground sm:text-base">
                  {tab.label}
                </span>
              </div>
              <span className="mt-1.5 hidden text-xs leading-5 text-muted-foreground sm:block">
                {tab.detail}
              </span>
            </button>
          );
        })}
      </nav>

      <WarframeDatabase mode={section} locale={locale} />
    </div>
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
            "Guias editoriais do ÍMPAR para progressão, Mods, dano, Status e farming. O banco de Warframes/Armas/Itens usa dados atuais e complementa estes guias.",
            "ÍMPAR editorial guides for progression, Mods, damage, Status and farming. The live Warframes/Weapons/Items database complements these guides.",
            "Guías editoriales de ÍMPAR para progresión, Mods, daño, Estado y farming. La base actual de Warframes/Armas/Objetos complementa estas guías.",
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
