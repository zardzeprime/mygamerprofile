import { useServerFn } from "@tanstack/react-start";
import {
  Award,
  Check,
  Crown,
  Frame,
  Loader2,
  LockKeyhole,
  MousePointer2,
  PanelTop,
  Sparkles,
  Trophy,
  Type,
  Wallpaper,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import {
  equipProfileIdentity,
  getProfileIdentityStudio,
  type ProfileCosmeticCatalogItem,
  type ProfileIdentityLoadout,
  type ProfileTitleCatalogItem,
} from "@/lib/profileIdentity.functions";
import { cn } from "@/lib/utils";

type StudioData = {
  titles: ProfileTitleCatalogItem[];
  cosmetics: ProfileCosmeticCatalogItem[];
  loadout: ProfileIdentityLoadout;
};

const RARITY_LABEL: Record<string, { "pt-BR": string; en: string; es: string }> = {
  common: { "pt-BR": "Comum", en: "Common", es: "Común" },
  uncommon: { "pt-BR": "Incomum", en: "Uncommon", es: "Poco común" },
  rare: { "pt-BR": "Raro", en: "Rare", es: "Raro" },
  epic: { "pt-BR": "Épico", en: "Epic", es: "Épico" },
  legendary: { "pt-BR": "Lendário", en: "Legendary", es: "Legendario" },
  mythic: { "pt-BR": "Mítico", en: "Mythic", es: "Mítico" },
};

const KIND_META = {
  background: { icon: Wallpaper, title: { "pt-BR": "Fundos", en: "Backgrounds", es: "Fondos" } },
  avatar_frame: { icon: Frame, title: { "pt-BR": "Molduras", en: "Frames", es: "Marcos" } },
  profile_effect: { icon: Sparkles, title: { "pt-BR": "Efeitos", en: "Effects", es: "Efectos" } },
  banner: { icon: PanelTop, title: { "pt-BR": "Faixas", en: "Banners", es: "Franjas" } },
  cursor: { icon: MousePointer2, title: { "pt-BR": "Cursores", en: "Cursors", es: "Cursores" } },
  nameplate: { icon: Type, title: { "pt-BR": "Nome", en: "Name style", es: "Nombre" } },
} as const;

type SupportedKind = keyof typeof KIND_META;

function localized(
  value: { "pt-BR"?: string; en?: string; es?: string } | null | undefined,
  locale: Locale,
) {
  return value?.[locale] ?? value?.["pt-BR"] ?? value?.en ?? "";
}

export function ProfileIdentityStudio({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const loadStudio = useServerFn(getProfileIdentityStudio);
  const equip = useServerFn(equipProfileIdentity);
  const [data, setData] = useState<StudioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [error, setError] = useState("");
  const [activeKind, setActiveKind] = useState<SupportedKind>("background");
  const [showLockedTitles, setShowLockedTitles] = useState(false);
  const [showLockedCosmetics, setShowLockedCosmetics] = useState(false);

  const refresh = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) throw new Error("PROFILE_IDENTITY_AUTH_REQUIRED");
    const result = await loadStudio({ data: { accessToken } });
    setData(result as StudioData);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) throw new Error("PROFILE_IDENTITY_AUTH_REQUIRED");
        const result = await loadStudio({ data: { accessToken } });
        if (!cancelled) setData(result as StudioData);
      } catch (reason) {
        console.error("[MGP Identity] studio load failed", reason);
        if (!cancelled) {
          setError(
            copy(
              "Não foi possível carregar sua coleção visual agora.",
              "Could not load your visual collection right now.",
              "No se pudo cargar tu colección visual ahora.",
            ),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadStudio]);

  const equipItem = async (
    slot:
      | "title"
      | "background"
      | "avatar_frame"
      | "profile_effect"
      | "banner"
      | "cursor"
      | "nameplate",
    slug: string | null,
  ) => {
    if (savingKey) return;
    setSavingKey(`${slot}:${slug ?? "none"}`);
    setError("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("PROFILE_IDENTITY_AUTH_REQUIRED");
      await equip({ data: { accessToken, slot, slug } });
      await refresh();
      window.dispatchEvent(new Event("mgp:profile-updated"));
    } catch (reason) {
      console.error("[MGP Identity] equip failed", reason);
      setError(
        copy(
          "Não foi possível equipar esse item. Confirme se ele já foi desbloqueado.",
          "Could not equip this item. Confirm that it has already been unlocked.",
          "No se pudo equipar este objeto. Confirma que ya esté desbloqueado.",
        ),
      );
    } finally {
      setSavingKey("");
    }
  };

  const titles = useMemo(
    () =>
      [...(data?.titles ?? [])].sort(
        (a, b) =>
          Number(b.unlocked) - Number(a.unlocked) ||
          Number(b.is_new) - Number(a.is_new) ||
          a.name?.["pt-BR"]?.localeCompare(b.name?.["pt-BR"] ?? "") ||
          0,
      ),
    [data?.titles],
  );

  const availableKinds = useMemo(
    () =>
      (Object.keys(KIND_META) as SupportedKind[]).filter((kind) =>
        (data?.cosmetics ?? []).some((item) => item.kind === kind),
      ),
    [data?.cosmetics],
  );

  useEffect(() => {
    const firstAvailableKind = availableKinds[0];
    if (firstAvailableKind && !availableKinds.includes(activeKind)) {
      setActiveKind(firstAvailableKind);
    }
  }, [activeKind, availableKinds]);

  const cosmetics = useMemo(
    () =>
      (data?.cosmetics ?? [])
        .filter((item) => item.kind === activeKind)
        .sort(
          (a, b) =>
            Number(b.unlocked) - Number(a.unlocked) ||
            Number(b.is_new) - Number(a.is_new) ||
            a.name?.["pt-BR"]?.localeCompare(b.name?.["pt-BR"] ?? "") ||
            0,
        ),
    [activeKind, data?.cosmetics],
  );

  const visibleTitles = useMemo(() => {
    if (showLockedTitles) return titles;
    const unlocked = titles.filter((title) => title.unlocked);
    const nextGoals = titles.filter((title) => !title.unlocked).slice(0, 3);
    return [...unlocked, ...nextGoals];
  }, [showLockedTitles, titles]);

  const visibleCosmetics = useMemo(() => {
    if (showLockedCosmetics) return cosmetics;
    const unlocked = cosmetics.filter((item) => item.unlocked);
    const nextGoals = cosmetics.filter((item) => !item.unlocked).slice(0, 3);
    return [...unlocked, ...nextGoals];
  }, [cosmetics, showLockedCosmetics]);

  if (loading) {
    return (
      <section className="surface-panel rounded-2xl p-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-gold-strong" />
          {copy(
            "Preparando sua coleção…",
            "Preparing your collection…",
            "Preparando tu colección…",
          )}
        </div>
      </section>
    );
  }

  if (!data) return null;

  const unlockedTitles = data.titles.filter((title) => title.unlocked).length;
  const unlockedCosmetics = data.cosmetics.filter((item) => item.unlocked).length;

  return (
    <section className="surface-panel overflow-hidden rounded-2xl">
      <div className="border-b border-border p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <Crown className="size-4 text-gold-strong" />
              <h2 className="font-display text-lg font-semibold">
                {copy("Aparência & títulos", "Appearance & titles", "Apariencia y títulos")}
              </h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy(
                "Este é o único lugar para equipar títulos, fundos, molduras, efeitos, banners e cursores. Itens desbloqueados aparecem primeiro; objetivos bloqueados ficam compactos para não poluir a página.",
                "This is the single place to equip titles, backgrounds, frames, effects, banners and cursors. Unlocked items come first, while locked goals stay compact to keep the page clean.",
                "Este es el único lugar para equipar títulos, fondos, marcos, efectos, banners y cursores. Los objetos desbloqueados aparecen primero y los objetivos bloqueados quedan compactos para mantener la página limpia.",
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat value={unlockedTitles} label={copy("títulos", "titles", "títulos")} />
            <Stat value={unlockedCosmetics} label={copy("cosméticos", "cosmetics", "cosméticos")} />
          </div>
        </div>
        {error ? (
          <p className="mt-4 rounded-xl border border-destructive/25 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-gold-strong" />
          <h3 className="font-display text-base font-semibold">
            {copy("Títulos", "Titles", "Títulos")}
          </h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {copy(
            "Equipe um título principal. Os bloqueados continuam visíveis para mostrar o próximo objetivo.",
            "Equip one main title. Locked titles stay visible so you can see your next goal.",
            "Equipa un título principal. Los bloqueados siguen visibles para mostrar tu próximo objetivo.",
          )}
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[0.68rem] font-medium text-muted-foreground">
            {unlockedTitles}/{data.titles.length}{" "}
            {copy("desbloqueados", "unlocked", "desbloqueados")}
          </span>
          <button
            type="button"
            onClick={() => setShowLockedTitles((value) => !value)}
            className="rounded-lg border border-border bg-muted/15 px-2.5 py-1.5 text-[0.68rem] font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            {showLockedTitles
              ? copy("Ocultar bloqueados", "Hide locked", "Ocultar bloqueados")
              : copy("Ver todos os títulos", "View all titles", "Ver todos los títulos")}
          </button>
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {visibleTitles.map((title) => {
            const equipped = data.loadout.title_slug === title.slug;
            return (
              <button
                key={title.slug}
                type="button"
                disabled={!title.unlocked || Boolean(savingKey)}
                onClick={() => title.unlocked && equipItem("title", title.slug)}
                className={cn(
                  "relative min-w-0 rounded-[1rem_1rem_0.42rem_1rem] border p-3 text-left transition",
                  title.unlocked
                    ? "border-border bg-surface hover:-translate-y-0.5 hover:border-gold/35"
                    : "cursor-not-allowed border-border/60 bg-muted/15 opacity-62",
                  equipped && "border-gold/55 ring-2 ring-gold/10",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      "mgp-rarity-chip rounded-md border px-2 py-1 text-[0.58rem] font-bold uppercase tracking-[0.09em]",
                      `mgp-rarity-${title.rarity}`,
                    )}
                  >
                    {RARITY_LABEL[title.rarity]?.[locale] ?? title.rarity}
                  </span>
                  {equipped ? (
                    <Check className="size-4 text-gold-strong" />
                  ) : !title.unlocked ? (
                    <LockKeyhole className="size-4 text-muted-foreground" />
                  ) : title.is_new ? (
                    <Sparkles className="size-4 text-gold-strong" />
                  ) : null}
                </div>
                <p className="mt-3 truncate text-sm font-semibold">
                  {localized(title.name, locale)}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {localized(title.description, locale)}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-7 border-t border-border pt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-display text-base font-semibold">
                {copy("Cosméticos", "Cosmetics", "Cosméticos")}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {copy(
                  "Escolha uma categoria por vez. O que você já pode usar aparece primeiro.",
                  "Choose one category at a time. Items you can already use appear first.",
                  "Elige una categoría a la vez. Los objetos que ya puedes usar aparecen primero.",
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLockedCosmetics((value) => !value)}
              className="rounded-lg border border-border bg-muted/15 px-2.5 py-1.5 text-[0.68rem] font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              {showLockedCosmetics
                ? copy("Ocultar bloqueados", "Hide locked", "Ocultar bloqueados")
                : copy("Ver todos", "View all", "Ver todos")}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {availableKinds.map((kind) => {
              const meta = KIND_META[kind];
              const Icon = meta.icon;
              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setActiveKind(kind)}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition",
                    activeKind === kind
                      ? "border-gold/45 bg-gold-soft/40 text-foreground"
                      : "border-border bg-muted/15 text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" />
                  {meta.title[locale]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleCosmetics.map((item) => (
            <CosmeticCard
              key={item.slug}
              item={item}
              locale={locale}
              equipped={
                activeKind === "background"
                  ? data.loadout.background_slug === item.slug
                  : activeKind === "avatar_frame"
                    ? data.loadout.avatar_frame_slug === item.slug
                    : activeKind === "profile_effect"
                      ? data.loadout.effect_slug === item.slug
                      : activeKind === "banner"
                        ? data.loadout.banner_slug === item.slug
                        : activeKind === "cursor"
                          ? data.loadout.cursor_slug === item.slug
                          : data.loadout.nameplate_slug === item.slug
              }
              busy={Boolean(savingKey)}
              onEquip={() => equipItem(activeKind, item.slug)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CosmeticCard({
  item,
  locale,
  equipped,
  busy,
  onEquip,
}: {
  item: ProfileCosmeticCatalogItem;
  locale: Locale;
  equipped: boolean;
  busy: boolean;
  onEquip: () => void;
}) {
  const preview =
    item.kind === "avatar_frame" ? (
      <div className="grid h-24 place-items-center bg-muted/20">
        <div className={cn("grid size-14 place-items-center", item.css_class)}>
          <div className="size-full rounded-full bg-gradient-to-br from-zinc-700 to-zinc-950" />
        </div>
      </div>
    ) : item.kind === "profile_effect" ? (
      <div className="relative h-24 overflow-hidden bg-gradient-to-br from-zinc-900 to-black">
        <div className={cn("mgp-profile-effect-layer", item.css_class)} />
        <Sparkles className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-white/70" />
      </div>
    ) : item.kind === "banner" ? (
      <div className="relative h-24 bg-gradient-to-br from-zinc-900 to-black">
        <div className={item.css_class ?? undefined} />
      </div>
    ) : item.kind === "cursor" ? (
      <div
        className={cn(
          "grid h-24 place-items-center bg-gradient-to-br from-zinc-900 to-black",
          item.css_class,
        )}
      >
        <MousePointer2 className="size-6 text-white/75" />
      </div>
    ) : item.kind === "nameplate" ? (
      <div className="grid h-24 place-items-center overflow-hidden bg-gradient-to-br from-zinc-900 to-black px-3">
        <span className={cn("max-w-full truncate text-lg font-bold", item.css_class)}>
          Zardze Prime
        </span>
      </div>
    ) : (
      <div className={cn("h-24", item.css_class)} />
    );

  return (
    <button
      type="button"
      disabled={!item.unlocked || busy}
      onClick={onEquip}
      className={cn(
        "group overflow-hidden rounded-[1rem_1rem_0.42rem_1rem] border bg-surface text-left transition",
        item.unlocked
          ? "border-border hover:-translate-y-0.5 hover:border-gold/35"
          : "cursor-not-allowed border-border/60 opacity-55",
        equipped && "border-gold/55 ring-2 ring-gold/10",
      )}
    >
      <div className="relative">
        {preview}
        <span
          className={cn(
            "mgp-rarity-chip absolute left-2 top-2 rounded-md border px-2 py-1 text-[0.56rem] font-bold uppercase tracking-[0.08em]",
            `mgp-rarity-${item.rarity}`,
          )}
        >
          {RARITY_LABEL[item.rarity]?.[locale] ?? item.rarity}
        </span>
        <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur">
          {equipped ? (
            <Check className="size-4" />
          ) : item.unlocked ? (
            item.is_new ? (
              <Sparkles className="size-3.5" />
            ) : (
              <Award className="size-3.5" />
            )
          ) : (
            <LockKeyhole className="size-3.5" />
          )}
        </span>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold">{localized(item.name, locale)}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {localized(item.description, locale)}
        </p>
      </div>
    </button>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/15 px-3 py-2 text-center">
      <p className="font-display text-lg font-bold">{value}</p>
      <p className="text-[0.62rem] uppercase tracking-[0.09em] text-muted-foreground">{label}</p>
    </div>
  );
}
