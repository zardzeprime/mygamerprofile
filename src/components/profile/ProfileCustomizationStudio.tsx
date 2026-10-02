import { useMemo, useState } from "react";
import {
  BadgeCheck,
  CircleUserRound,
  Frame,
  Ghost,
  Layers3,
  MousePointer2,
  PanelTop,
  Sparkles,
  Wallpaper,
} from "lucide-react";

import {
  PROFILE_CUSTOMIZATION_SLOTS,
  PROFILE_IDENTITY_PACK_CONCEPTS,
  type ProfileCustomizationSlot,
} from "@/config/profileCustomization";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

const ICONS: Record<ProfileCustomizationSlot, typeof Wallpaper> = {
  background: Wallpaper,
  banner: PanelTop,
  avatar_frame: Frame,
  cursor: MousePointer2,
  profile_effect: Sparkles,
  chibi: Ghost,
  badges: BadgeCheck,
};

export function ProfileCustomizationStudio({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [selectedSlot, setSelectedSlot] = useState<ProfileCustomizationSlot>("background");
  const [selectedPack, setSelectedPack] = useState(PROFILE_IDENTITY_PACK_CONCEPTS[0]?.id ?? "mgp-core");

  const slot = useMemo(
    () => PROFILE_CUSTOMIZATION_SLOTS.find((item) => item.id === selectedSlot) ?? PROFILE_CUSTOMIZATION_SLOTS[0],
    [selectedSlot],
  );
  const pack = useMemo(
    () => PROFILE_IDENTITY_PACK_CONCEPTS.find((item) => item.id === selectedPack) ?? PROFILE_IDENTITY_PACK_CONCEPTS[0],
    [selectedPack],
  );

  if (!slot || !pack) return null;

  const readiness =
    slot.readiness === "available"
      ? copy("Disponível agora", "Available now", "Disponible ahora")
      : slot.readiness === "foundation"
        ? copy("Estrutura pronta", "Foundation ready", "Base lista")
        : copy("Planejado", "Planned", "Planificado");

  return (
    <section className="surface-panel overflow-hidden rounded-2xl">
      <div className="border-b border-border p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <Layers3 className="size-4 text-gold-strong" aria-hidden="true" />
              <h2 className="font-display text-lg font-semibold">
                {copy("Estúdio do perfil", "Profile studio", "Estudio del perfil")}
              </h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {copy(
                "O perfil gamer vai funcionar como um loadout visual: fundo, banner, moldura, cursor, efeito, mascote e insígnias podem formar uma identidade única. A estrutura abaixo já reserva cada slot sem depender de assets de terceiros.",
                "Your gamer profile will work like a visual loadout: background, banner, frame, cursor, effect, mascot and badges can form one identity. The structure below reserves every slot without depending on third-party assets.",
                "Tu perfil gamer funcionará como un loadout visual: fondo, banner, marco, cursor, efecto, mascota e insignias pueden formar una identidad. La estructura ya reserva cada espacio sin depender de recursos de terceros.",
              )}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-gold/20 bg-gold-soft/40 px-2.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-gold-strong">
            <CircleUserRound className="size-3.5" aria-hidden="true" />
            ÍMPAR
          </span>
        </div>
      </div>

      <div className="grid min-w-0 gap-0 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 p-4 sm:p-6">
          <p className="mb-3 text-[0.67rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {copy("Slots de customização", "Customization slots", "Espacios de personalización")}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {PROFILE_CUSTOMIZATION_SLOTS.map((item) => {
              const Icon = ICONS[item.id];
              const active = selectedSlot === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedSlot(item.id)}
                  className={cn(
                    "group min-w-0 rounded-[1rem_1rem_0.45rem_1rem] border p-3 text-left transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5",
                    active
                      ? "border-gold/45 bg-gold-soft/45"
                      : "border-border bg-surface hover:border-gold/25",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-[0.72rem_0.72rem_0.28rem_0.72rem] border",
                        active
                          ? "border-gold/30 bg-gold/10 text-gold-strong"
                          : "border-border bg-muted/45 text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.09em] text-muted-foreground">
                      {item.readiness === "available"
                        ? copy("ativo", "live", "activo")
                        : copy("slot pronto", "slot ready", "slot listo")}
                    </span>
                  </div>
                  <p className="mt-3 truncate text-sm font-semibold text-foreground">{item.label[locale]}</p>
                  {item.maxEquipped ? (
                    <p className="mt-1 text-[0.67rem] text-muted-foreground">
                      {copy("até " + item.maxEquipped + " equipadas", "up to " + item.maxEquipped + " equipped", "hasta " + item.maxEquipped + " equipadas")}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-[1rem_1rem_0.45rem_1rem] border border-border bg-muted/15 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = ICONS[slot.id];
                  return <Icon className="size-4 text-gold-strong" aria-hidden="true" />;
                })()}
                <h3 className="font-display text-base font-semibold">{slot.label[locale]}</h3>
              </div>
              <span className="rounded-md border border-border bg-surface px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                {readiness}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{slot.description[locale]}</p>
            <p className="mt-3 text-[0.68rem] leading-5 text-muted-foreground">
              {copy(
                "Os assets inspirados em jogos só serão liberados quando houver material original do ÍMPAR, licença, autorização ou procedência de reutilização suficientemente clara.",
                "Game-inspired assets will only ship when ÍMPAR has original material, a license, permission or sufficiently clear reuse provenance.",
                "Los recursos inspirados en juegos solo se publicarán con material original de ÍMPAR, licencia, permiso o procedencia de reutilización suficientemente clara.",
              )}
            </p>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-[0.67rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {copy("Coleções de identidade — conceitos", "Identity collections — concepts", "Colecciones de identidad — conceptos")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {PROFILE_IDENTITY_PACK_CONCEPTS.map((item) => {
                const active = selectedPack === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedPack(item.id)}
                    className={cn(
                      "overflow-hidden rounded-[1rem_1rem_0.45rem_1rem] border bg-surface text-left transition-[transform,border-color] duration-200 hover:-translate-y-0.5",
                      active ? "border-gold/50 ring-2 ring-gold/10" : "border-border hover:border-gold/25",
                    )}
                  >
                    <div className={cn("relative h-20 overflow-hidden", item.previewClass)}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                      <span className="absolute bottom-2 left-3 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white/80">
                        {copy("prévia conceitual", "concept preview", "vista conceptual")}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-foreground">{item.label[locale]}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.description[locale]}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="min-w-0 border-t border-border bg-muted/10 p-4 sm:p-6 lg:border-l lg:border-t-0">
          <p className="text-[0.67rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {copy("Loadout em prévia", "Loadout preview", "Vista del loadout")}
          </p>
          <div className={cn("mt-3 overflow-hidden rounded-[1.1rem_1.1rem_0.5rem_1.1rem] border border-border", pack.previewClass)}>
            <div className="min-h-40 bg-gradient-to-t from-black/65 via-black/15 to-transparent p-4 text-white">
              <div className="flex min-h-32 flex-col justify-between">
                <span className="w-fit rounded-md border border-white/15 bg-black/30 px-2 py-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] backdrop-blur">
                  {pack.label[locale]}
                </span>
                <div>
                  <div className="size-12 rounded-full border-2 border-white/55 bg-black/25 shadow-lg" />
                  <p className="mt-2 font-display text-base font-bold">ÍMPAR Player</p>
                  <p className="text-[0.68rem] text-white/65">@username</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {PROFILE_CUSTOMIZATION_SLOTS.map((item) => {
              const included = pack.slots.includes(item.id);
              return (
                <div key={item.id} className="flex items-center justify-between gap-3 border-b border-border/70 py-2 last:border-0">
                  <span className="text-xs text-muted-foreground">{item.label[locale]}</span>
                  <span className={cn("text-[0.62rem] font-bold uppercase tracking-[0.08em]", included ? "text-gold-strong" : "text-muted-foreground/55")}>
                    {included ? copy("incluído", "included", "incluido") : "—"}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-[0.68rem] leading-5 text-muted-foreground">
            {copy(
              "Selecionar uma coleção aqui só muda a prévia. Equipar packs completos será habilitado quando o inventário visual entrar na interface.",
              "Selecting a collection here only changes the preview. Equipping complete packs will be enabled when the visual inventory reaches the interface.",
              "Seleccionar una colección aquí solo cambia la vista previa. Equipar packs completos se habilitará cuando el inventario visual llegue a la interfaz.",
            )}
          </p>
        </aside>
      </div>
    </section>
  );
}
