import { createFileRoute } from "@tanstack/react-router";
import { Check, Palette, SlidersHorizontal, Volume2 } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { ThemeSelector } from "@/components/common/ThemeSelector";
import { AudioControl } from "@/components/common/AudioControl";

export const Route = createFileRoute("/_authenticated/settings/appearance")({
  head: () => ({ meta: [{ title: "Aparência — MGP" }, { name: "description", content: "Personalize a aparência do My Gamer Profile." }] }),
  component: SettingsAppearancePage,
});

function SettingsAppearancePage() {
  const { t, locale } = useI18n();
  const { accentColor, setAccentColor, resetAccentColor } = useTheme();
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
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{copy("Dê o seu tom ao MGP. O dourado continua na assinatura; o resto acompanha você.", "Make MGP feel like you. Gold stays in the signature; the rest follows your style.", "Dale tu tono a MGP. El dorado mantiene la identidad; el resto sigue tu estilo.")}</p>
        </header>

        <section className="surface-panel overflow-hidden">
          <div className="appearance-preview border-b border-border p-5 sm:p-7" aria-label={copy("Prévia ao vivo", "Live preview", "Vista previa en vivo")}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-display text-lg font-bold tracking-tight">MG<span className="text-gold-strong">P</span></span>
              <span className="rounded-full border border-border bg-surface/90 px-3 py-1 text-xs text-foreground">{copy("Prévia ao vivo", "Live preview", "Vista previa en vivo")}</span>
            </div>
            <h3 className="mt-8 font-display text-xl font-semibold sm:text-2xl">{copy("Seu jogo. Sua identidade.", "Your game. Your identity.", "Tu juego. Tu identidad.")}</h3>
            <div className="mt-4 flex flex-wrap gap-2" aria-hidden="true">
              <span className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">{copy("Explorar", "Explore", "Explorar")}</span>
              <span className="rounded-lg border border-border bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">{copy("Seu perfil", "Your profile", "Tu perfil")}</span>
            </div>
          </div>
          <div className="space-y-6 p-4 sm:p-6">
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal className="size-4 text-gold-strong" aria-hidden="true" />{t("settings.theme")}</h3>
              <ThemeSelector showLabels />
            </div>
            <div className="border-t border-border pt-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><Palette className="size-4 text-gold-strong" aria-hidden="true" />{copy("Cor de apoio", "Accent palette", "Color complementario")}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{copy("Escolha uma combinação ou use o seletor para criar a sua. Fundos e gradientes se ajustam ao tema.", "Choose a palette or use the picker to create your own. Backgrounds and gradients adapt to your theme.", "Elige una combinación o crea la tuya con el selector. Los fondos y degradados se adaptan al tema.")}</p>
              <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={copy("Paletas de cores", "Color palettes", "Paletas de colores")}>
                {palettes.map(({ color, name }) => {
                  const active = color === accentColor;
                  return <button key={name} type="button" aria-pressed={active} onClick={() => color ? setAccentColor(color) : resetAccentColor()} className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${active ? "border-gold bg-gold-soft text-gold-strong" : "border-border hover:bg-muted"}`}>
                    <span className="size-4 rounded-full border border-black/10" style={{ background: color ?? "#d4a72c" }} aria-hidden="true" />{name}{active && <Check className="size-3.5" aria-hidden="true" />}
                  </button>;
                })}
              </div>
            </div>
          </div>
        </section>
        <section className="surface-panel p-4 sm:p-6">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Volume2 className="size-4 text-gold-strong" aria-hidden="true" />{copy("Som da interface", "Interface sound", "Sonido de la interfaz")}</h3>
          <p className="mb-4 text-xs text-muted-foreground">{copy("Retornos discretos para seus cliques. Ajuste o volume ou deixe tudo em silêncio.", "Subtle feedback for your clicks. Adjust the volume or keep everything quiet.", "Respuesta sutil a tus clics. Ajusta el volumen o deja todo en silencio.")}</p>
          <AudioControl />
        </section>
      </div>
    </SettingsLayout>
  );
}
