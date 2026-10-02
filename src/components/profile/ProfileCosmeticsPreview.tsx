import { useEffect, useState } from "react";
import { Badge, Loader2, Sparkles } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

type Cosmetic = {
  slug: string;
  kind: string;
  name: Record<string, string> | null;
  description: Record<string, string> | null;
  css_class: string | null;
  rarity: string;
  animated: boolean;
  game_slug: string | null;
};

export function ProfileCosmeticsPreview({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [cosmetics, setCosmetics] = useState<Cosmetic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("profile_cosmetics")
        .select("slug,kind,name,description,css_class,rarity,animated,game_slug")
        .eq("active", true)
        .order("kind")
        .order("slug")
        .limit(30);

      if (active) {
        setCosmetics((data ?? []) as Cosmetic[]);
        setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const backgrounds = cosmetics.filter((cosmetic) => cosmetic.kind === "background");

  return (
    <section className="surface-panel rounded-2xl p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-gold-strong" />
            <h2 className="font-display text-lg font-semibold">
              {copy("Cosméticos e insígnias", "Cosmetics and badges", "Cosméticos e insignias")}
            </h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy(
              "A base da coleção já está pronta para fundos, banners, chibis e até seis insígnias equipadas. Nesta fase estamos testando apenas cosméticos originais do ÍMPAR.",
              "The collection foundation already supports backgrounds, banners, chibis and up to six equipped badges. This phase tests ÍMPAR-original cosmetics only.",
              "La base de la colección ya admite fondos, banners, chibis y hasta seis insignias equipadas. En esta fase probamos solo cosméticos originales de ÍMPAR.",
            )}
          </p>
        </div>
        <Badge className="size-5 shrink-0 text-gold-strong" />
      </div>

      {loading ? (
        <div className="mt-5 grid min-h-24 place-items-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {backgrounds.slice(0, 3).map((cosmetic) => (
            <article key={cosmetic.slug} className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className={cn("relative h-24", cosmetic.css_class ?? "profile-bg-midnight")}>
                <span className="absolute right-2 top-2 rounded-full border border-white/15 bg-black/35 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/80 backdrop-blur">
                  {cosmetic.animated ? copy("Animado", "Animated", "Animado") : cosmetic.rarity}
                </span>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-foreground">
                  {cosmetic.name?.[locale] ?? cosmetic.name?.["pt-BR"] ?? cosmetic.slug}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {cosmetic.description?.[locale] ?? cosmetic.description?.["pt-BR"] ?? ""}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-dashed border-border p-4">
          <p className="text-sm font-semibold text-foreground">Chibis por jogo</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {copy(
              "Arquitetura pronta. Personagens como agentes/campeões só entram quando a procedência e os direitos do asset estiverem revisados.",
              "Architecture ready. Agent/champion characters are added only after asset provenance and rights are reviewed.",
              "Arquitectura lista. Los personajes de agentes/campeones solo se añaden tras revisar procedencia y derechos.",
            )}
          </p>
        </div>
        <div className="rounded-xl border border-dashed border-border p-4">
          <p className="text-sm font-semibold text-foreground">Insígnias & gacha</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {copy(
              "Inventário e loadout já existem no banco. Recompensas aleatórias pagas continuam desligadas até revisão de produto, idade e regras regionais.",
              "Inventory and loadout already exist in the database. Paid randomized rewards remain disabled until product, age and regional review.",
              "El inventario y el loadout ya existen en la base. Las recompensas aleatorias de pago siguen desactivadas hasta revisar producto, edad y región.",
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
