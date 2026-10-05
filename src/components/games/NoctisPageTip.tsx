import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import type { GameModuleKey } from "@/config/games";
import { NoctisMark } from "@/components/noctis/NoctisMark";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

const TIPS: Partial<Record<GameModuleKey, [string, string, string]>> = {
  builds: [
    "Dica do Noctis: deixa a build privada primeiro. Você pode testar, ajustar e publicar depois.",
    "Noctis tip: keep a build private first. Test and adjust it before publishing.",
    "Consejo de Noctis: deja la build privada primero. Puedes probarla y ajustarla antes de publicarla.",
  ],
  mods: [
    "Dica do Noctis: confira compatibilidade e polaridade antes de fechar os oito slots.",
    "Noctis tip: check compatibility and polarity before filling all eight slots.",
    "Consejo de Noctis: revisa compatibilidad y polaridad antes de llenar los ocho espacios.",
  ],
  weapons: [
    "Dica do Noctis: compare crítico, status, cadência e recarga; o maior dano-base sozinho não conta a história toda.",
    "Noctis tip: compare criticals, Status, fire rate and reload; base damage alone does not tell the whole story.",
    "Consejo de Noctis: compara crítico, estado, cadencia y recarga; el daño base por sí solo no cuenta toda la historia.",
  ],
  warframes: [
    "Dica do Noctis: abre as habilidades junto da função e do ciclo do kit para entender como o Warframe realmente joga.",
    "Noctis tip: read abilities alongside the role and kit loop to see how the Warframe actually plays.",
    "Consejo de Noctis: mira las habilidades junto con el rol y el ciclo del kit para entender cómo se juega el Warframe.",
  ],
  competitive: [
    "Dica do Noctis: os elencos mudam durante a temporada; use a fonte e a data de verificação exibidas no perfil.",
    "Noctis tip: rosters change during a season; check the source and verification date on each profile.",
    "Consejo de Noctis: las alineaciones cambian durante la temporada; revisa la fuente y la fecha de verificación.",
  ],
};

export function NoctisPageTip({ gameSlug, moduleKey, locale }: { gameSlug: string; moduleKey: GameModuleKey; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [visible, setVisible] = useState(false);
  const key = `impar:noctis-tip:v1:${gameSlug}:${moduleKey}`;

  useEffect(() => {
    let alreadySeen = false;
    try { alreadySeen = window.localStorage.getItem(key) === "1"; } catch { /* Storage may be disabled. */ }
    if (!TIPS[moduleKey] || alreadySeen) return;
    const timer = window.setTimeout(() => setVisible(true), 11_000);
    return () => window.clearTimeout(timer);
  }, [key, moduleKey]);

  const dismiss = () => {
    try { window.localStorage.setItem(key, "1"); } catch { /* Dismiss still works for this visit. */ }
    setVisible(false);
  };
  if (!visible) return null;
  const message = TIPS[moduleKey];
  if (!message) return null;

  return <aside role="status" className="fixed bottom-24 right-4 z-[60] w-[min(22rem,calc(100vw-2rem))] animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-[var(--impar-line)] bg-[var(--impar-night)]/95 p-4 text-white shadow-2xl backdrop-blur-xl motion-reduce:animate-none sm:bottom-6 sm:right-6">
    <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5"><NoctisMark className="size-7" title="Noctis" /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-1.5 text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--impar-spectral)]"><Sparkles className="size-3.5" />{copy("Noctis · dica rápida", "Noctis · quick tip", "Noctis · consejo rápido")}</div><p className="mt-1.5 text-sm leading-5 text-white/85">{message[locale === "pt-BR" ? 0 : locale === "en" ? 1 : 2]}</p><button type="button" onClick={dismiss} className="mt-3 text-xs font-semibold text-[var(--impar-spectral)] hover:underline">{copy("Entendi", "Got it", "Entendido")}</button></div><button type="button" onClick={dismiss} aria-label={copy("Fechar dica", "Dismiss tip", "Cerrar consejo")} className="grid size-8 shrink-0 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"><X className="size-4" /></button></div>
  </aside>;
}
