import { createFileRoute } from "@tanstack/react-router";
import { Axe, Check, Crosshair, MousePointer2, Palette, Sword, Volume2 } from "lucide-react";
import { DEFAULT_ACCENT_COLOR, useTheme } from "@/lib/theme";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { AudioControl } from "@/components/common/AudioControl";
import { BrandLogoPlaceholder } from "@/components/brand/BrandLogoPlaceholder";

export const Route = createFileRoute("/_authenticated/settings/appearance")({
  head: () => ({
    meta: [
      { title: "Aparência — ÍMPAR" },
      { name: "description", content: "Personalize a aparência do ÍMPAR." },
    ],
  }),
  component: SettingsAppearancePage,
});

function SettingsAppearancePage() {
  const { t, locale } = useI18n();
  const { accentColor, cursorStyle, setAccentColor, resetAccentColor, setCursorStyle } = useTheme();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const palettes = [
    { color: null, name: copy("Original", "Original", "Original") },
    { color: "#22a875", name: copy("Jade", "Jade", "Jade") },
    { color: "#6488ea", name: copy("Íris", "Iris", "Iris") },
    { color: "#ad78db", name: copy("Ametista", "Amethyst", "Amatista") },
    { color: "#d78360", name: copy("Cobre", "Copper", "Cobre") },
  ];

  return (
    <SettingsLayout>
      <div className="space-y-5">
        <header>
          <p className="section-kicker">{copy("Seu espaço", "Your space", "Tu espacio")}</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">{t("settings.appearance")}</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {copy(
              "Dê o seu tom ao ÍMPAR. A cor principal da interface pode mudar com você, sem perder a estrutura da marca.",
              "Make ÍMPAR feel like you. The interface signal color can change with you without losing the brand structure.",
              "Dale tu tono a ÍMPAR. El color principal de la interfaz puede cambiar contigo sin perder la estructura de la marca.",
            )}
          </p>
        </header>

        <section className="surface-panel overflow-hidden">
          <div
            className="appearance-preview border-b border-border p-5 sm:p-7"
            aria-label={copy("Prévia ao vivo", "Live preview", "Vista previa en vivo")}
          >
            <div className="flex items-center justify-between gap-3">
              <BrandLogoPlaceholder size="sm" />
              <span className="rounded-full border border-border bg-surface/90 px-3 py-1 text-xs text-foreground">
                {copy("Prévia ao vivo", "Live preview", "Vista previa en vivo")}
              </span>
            </div>
            <h3 className="mt-8 font-display text-xl font-semibold sm:text-2xl">
              {copy(
                "Seu jogo. Sua identidade.",
                "Your game. Your identity.",
                "Tu juego. Tu identidad.",
              )}
            </h3>
            <div className="mt-4 flex flex-wrap gap-2" aria-hidden="true">
              <span className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                {copy("Explorar", "Explore", "Explorar")}
              </span>
              <span className="rounded-lg border border-border bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
                {copy("Seu perfil", "Your profile", "Tu perfil")}
              </span>
            </div>
          </div>
          <div className="space-y-6 p-4 sm:p-6">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Palette className="size-4 text-gold-strong" aria-hidden="true" />
                {copy("Cor principal", "Primary color", "Color principal")}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {copy(
                  "Escolha uma combinação ou use o seletor para criar a sua. A cor passa a comandar botões, barras, foco e destaques. Logado, ela fica sincronizada com a sua conta.",
                  "Choose a palette or use the picker to create your own. It drives buttons, rails, focus and highlights. When signed in, it syncs with your account.",
                  "Elige una combinación o crea la tuya con el selector. Controla botones, barras, foco y destacados. Con sesión iniciada, se sincroniza con tu cuenta.",
                )}
              </p>
              <div
                className="mt-4 flex flex-wrap gap-2"
                role="group"
                aria-label={copy("Paletas de cores", "Color palettes", "Paletas de colores")}
              >
                {palettes.map(({ color, name }) => {
                  const active = color === accentColor;
                  return (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={active}
                      onClick={() => (color ? setAccentColor(color) : resetAccentColor())}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${active ? "border-gold bg-gold-soft text-gold-strong" : "border-border hover:bg-muted"}`}
                    >
                      <span
                        className="size-4 rounded-full border border-black/10"
                        style={{ background: color ?? DEFAULT_ACCENT_COLOR }}
                        aria-hidden="true"
                      />
                      {name}
                      {active && <Check className="size-3.5" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        <section className="surface-panel p-4 sm:p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Crosshair className="size-4 text-gold-strong" />
            {copy("Cursor", "Cursor", "Cursor")}
          </h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            {copy(
              "Cursores mais compactos e limpos. Eles acompanham sua cor principal sem cobrir conteúdo da tela.",
              "Cleaner, more compact cursors. They follow your accent color without covering screen content.",
              "Cursores más compactos y limpios. Siguen tu color principal sin cubrir el contenido de la pantalla.",
            )}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {(
              [
                ["classic", copy("ÍMPAR padrão", "ÍMPAR default", "ÍMPAR estándar"), MousePointer2],
                ["sword", copy("Espada", "Sword", "Espada"), Sword],
                ["axe", copy("Machado", "Axe", "Hacha"), Axe],
                ["reticle", copy("Mira", "Reticle", "Mira"), Crosshair],
              ] as const
            ).map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                aria-pressed={cursorStyle === value}
                onClick={() => setCursorStyle(value)}
                className={`flex min-h-16 items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                  cursorStyle === value
                    ? "border-gold bg-gold-soft text-gold-strong"
                    : "border-border bg-surface hover:border-gold/40"
                }`}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background/60">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block">{label}</span>
                  <span className="mt-0.5 block text-[0.65rem] font-medium text-muted-foreground">
                    {value === "classic"
                      ? copy(
                          "Cursor normal customizado",
                          "Customized normal cursor",
                          "Cursor normal personalizado",
                        )
                      : value === "reticle"
                        ? copy("Precisão central", "Centered precision", "Precisión central")
                        : copy(
                            "Cosmético alternativo",
                            "Alternative cosmetic",
                            "Cosmético alternativo",
                          )}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="surface-panel p-4 sm:p-6">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Volume2 className="size-4 text-gold-strong" aria-hidden="true" />
            {copy("Som da interface", "Interface sound", "Sonido de la interfaz")}
          </h3>
          <p className="mb-4 text-xs text-muted-foreground">
            {copy(
              "Retornos discretos para seus cliques. Ajuste o volume ou deixe tudo em silêncio.",
              "Subtle feedback for your clicks. Adjust the volume or keep everything quiet.",
              "Respuesta sutil a tus clics. Ajusta el volumen o deja todo en silencio.",
            )}
          </p>
          <AudioControl />
        </section>
      </div>
    </SettingsLayout>
  );
}
