import { BadgeCheck, BookOpen, ChevronRight, Crosshair, Layers3, Sparkles, Users } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { ValorantEsportsPanel } from "@/components/games/ValorantEsportsPanel";
import type { GameModuleKey, GameThemeKey } from "@/config/games";
import { GAME_EDITORIAL_OVERVIEW } from "@/data/gameEditorialOverview";
import type { FeaturedContentItem } from "@/data/gameEditorialOverview";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

export function GameLivePanel({
  gameSlug,
  themeKey,
  locale,
  onOpenModule,
}: {
  gameSlug: string;
  themeKey: GameThemeKey;
  locale: Locale;
  onOpenModule?: ((module: GameModuleKey) => void) | undefined;
}) {
  if (themeKey === "valorant") {
    return (
      <aside className="space-y-4">
        <ValorantEsportsPanel locale={locale} />
        <FeaturedPanel gameSlug={gameSlug} themeKey={themeKey} locale={locale} onOpenModule={onOpenModule} />
      </aside>
    );
  }

  return <FeaturedPanel gameSlug={gameSlug} themeKey={themeKey} locale={locale} onOpenModule={onOpenModule} />;
}

function FeaturedPanel({
  gameSlug,
  themeKey,
  locale,
  onOpenModule,
}: {
  gameSlug: string;
  themeKey: GameThemeKey;
  locale: Locale;
  onOpenModule?: ((module: GameModuleKey) => void) | undefined;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const overview = GAME_EDITORIAL_OVERVIEW[gameSlug];
  const featured = overview?.featured ?? [];
  const accentClass = themeKey === "dark_souls" ? "text-ember" : "text-gold-strong";

  return (
    <section className="surface-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className={`size-4 ${accentClass}`} />
          <h2 className="font-display text-sm font-semibold uppercase text-foreground">
            {copy("Em destaque", "Featured", "Destacado")}
          </h2>
        </div>
        <span className="status-dot" aria-hidden="true" />
      </div>

      {featured.length === 0 ? (
        <EmptyState
          className="m-4 border-0 bg-muted/45 py-10"
          title={copy("Os destaques ainda estão sendo preparados.", "Highlights are still being prepared.", "Los destacados todavía se están preparando.")}
          description={copy("Conteúdo selecionado aparecerá aqui.", "Selected content will appear here.", "El contenido seleccionado aparecerá aquí.")}
        />
      ) : (
        <div className="space-y-3 p-4">
          {featured.map((item) => (
            <FeaturedCard key={item.id} item={item} locale={locale} themeKey={themeKey} onOpenModule={onOpenModule} />
          ))}

          <div className="rounded-xl border border-dashed border-border px-4 py-3 text-xs leading-5 text-muted-foreground">
            {copy(
              "Conteúdo editorial recebe o selo MGP verificado. Conteúdo de usuários aparecerá identificado como criação da comunidade.",
              "Editorial content receives the MGP verified badge. User-made content will be identified as a community creation.",
              "El contenido editorial recibe el sello MGP verificado. El contenido de usuarios se identificará como creación de la comunidad.",
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function FeaturedCard({
  item,
  locale,
  themeKey,
  onOpenModule,
}: {
  item: FeaturedContentItem;
  locale: Locale;
  themeKey: GameThemeKey;
  onOpenModule?: ((module: GameModuleKey) => void) | undefined;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const OfficialIcon = item.origin === "official" ? BadgeCheck : Users;
  const TypeIcon = item.type === "lineup" ? Crosshair : item.type === "collection" ? Layers3 : BookOpen;
  const typeLabel =
    item.type === "guide"
      ? copy("Guia", "Guide", "Guía")
      : item.type === "build"
        ? "Build"
        : item.type === "lineup"
          ? "Lineup"
          : copy("Coleção", "Collection", "Colección");
  const hoverClass = themeKey === "valorant" ? "hover:border-gold/35 hover:bg-gold/[0.035]" : "hover:border-gold/35 hover:bg-gold-soft/10";
  const actionClass = themeKey === "valorant" ? "text-gold-strong hover:text-foreground" : "text-gold-strong hover:text-foreground";

  return (
    <article className={`group rounded-xl border border-border bg-muted/25 p-4 transition-all duration-200 hover:-translate-y-0.5 ${hoverClass}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
          <TypeIcon className="size-3.5" />
          {typeLabel}
        </span>
        <span className={item.origin === "official" ? "inline-flex items-center gap-1 text-[0.66rem] font-bold uppercase tracking-[0.08em] text-gold-strong" : "inline-flex items-center gap-1 text-[0.66rem] font-bold uppercase tracking-[0.08em] text-muted-foreground"}>
          <OfficialIcon className="size-3.5" />
          {item.origin === "official" ? copy("MGP verificado", "MGP verified", "MGP verificado") : copy("Comunidade", "Community", "Comunidad")}
        </span>
      </div>

      <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-foreground">{item.title[locale]}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description[locale]}</p>
      <p className="mt-3 text-xs font-semibold text-muted-foreground">{item.authorLabel[locale]}</p>

      <button type="button" onClick={() => onOpenModule?.(item.module)} className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${actionClass}`}>
        {copy("Abrir conteúdo", "Open content", "Abrir contenido")}
        <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </article>
  );
}
