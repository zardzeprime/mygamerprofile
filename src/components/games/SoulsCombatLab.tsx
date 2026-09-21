import { useState } from "react";
import { Gauge, Shield } from "lucide-react";

import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import type { SoulsCompendiumGame } from "@/lib/souls-compendium";
import { cn } from "@/lib/utils";
import { SoulsDpsTest } from "@/components/games/SoulsDpsTest";
import { SoulsFashionTest } from "@/components/games/SoulsFashionTest";

type Tool = "dps" | "fashion";

export function SoulsCombatLab({
  gameSlug,
  locale,
}: {
  gameSlug: SoulsCompendiumGame;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [tool, setTool] = useState<Tool>("dps");

  return (
    <div className="space-y-5">
      <nav
        className="surface-panel flex flex-wrap gap-2 p-3"
        aria-label={copy("Ferramentas de build", "Build tools", "Herramientas de build")}
      >
        <button
          type="button"
          onClick={() => setTool("dps")}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition",
            tool === "dps"
              ? "border-gold/45 bg-gold/10 text-foreground"
              : "border-border bg-muted/10 text-muted-foreground hover:text-foreground",
          )}
        >
          <Gauge className="size-4" />
          DPS Test
        </button>
        <button
          type="button"
          onClick={() => setTool("fashion")}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold transition",
            tool === "fashion"
              ? "border-gold/45 bg-gold/10 text-foreground"
              : "border-border bg-muted/10 text-muted-foreground hover:text-foreground",
          )}
        >
          <Shield className="size-4" />
          Fashion Test
        </button>
      </nav>
      {tool === "dps" ? (
        <SoulsDpsTest gameSlug={gameSlug} locale={locale} />
      ) : (
        <SoulsFashionTest gameSlug={gameSlug} locale={locale} />
      )}
    </div>
  );
}
