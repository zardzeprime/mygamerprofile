import { Loader2, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";

import { NexusMark } from "@/components/nexus/NexusMark";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { assistNexusBuild } from "@/lib/nexus.functions";

export type NexusBuildSuggestion = {
  title?: string;
  summary?: string;
  reason?: string;
  [key: string]: unknown;
};

export function NexusBuildAssistant({
  gameSlug,
  locale,
  context,
  quickPrompts = [],
  onApply,
}: {
  gameSlug: string;
  locale: Locale;
  context: Record<string, unknown>;
  quickPrompts?: string[];
  onApply: (suggestion: NexusBuildSuggestion) => void;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [request, setRequest] = useState("");
  const [suggestion, setSuggestion] = useState<NexusBuildSuggestion | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const generate = async (override?: string) => {
    const prompt = (override ?? request).trim();
    if (!prompt || busy) return;

    setBusy(true);
    setError("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setError(
          copy(
            "Entre na sua conta para usar o Noctis no criador.",
            "Sign in to use Noctis in the builder.",
            "Inicia sesión para usar Noctis en el creador.",
          ),
        );
        return;
      }

      const response = (await assistNexusBuild({
        data: {
          accessToken,
          gameSlug,
          locale,
          request: prompt,
          context,
        },
      })) as {
        suggestion?: NexusBuildSuggestion;
      };

      if (!response.suggestion || typeof response.suggestion !== "object") {
        throw new Error("NEXUS_BUILD_EMPTY");
      }

      setRequest(prompt);
      setSuggestion(response.suggestion);
    } catch (reason) {
      console.error("[NexusBuildAssistant] build assist failed", reason);
      setError(
        copy(
          "O Noctis não conseguiu montar o preset agora. Tente novamente em instantes.",
          "Noctis could not create the preset right now. Try again shortly.",
          "Noctis no pudo crear el preset ahora. Inténtalo de nuevo en unos instantes.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[var(--impar-line)] bg-[var(--impar-spectral-soft)]/40 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--impar-line)] bg-background/55">
          <NexusMark className="size-7" title="Noctis" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-display text-lg font-semibold text-foreground">
              {copy("Noctis · Copiloto de build", "Noctis · Build copilot", "Noctis · Copiloto de build")}
            </h4>
            <span className="rounded-full border border-[var(--impar-line)] bg-background/50 px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.1em] text-[var(--impar-spectral)]">
              IA
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {copy(
              "Diga o que você quer da build. O Noctis usa o contexto real deste criador e devolve um preset que pode ser aplicado diretamente aos campos.",
              "Describe what you want from the build. Noctis uses this builder's real context and returns a preset that can be applied directly to the fields.",
              "Describe qué quieres de la build. Noctis usa el contexto real de este creador y devuelve un preset que puede aplicarse directamente a los campos.",
            )}
          </p>
        </div>
      </div>

      {quickPrompts.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={busy}
              onClick={() => {
                setRequest(prompt);
                void generate(prompt);
              }}
              className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-[var(--impar-spectral)]/45 hover:text-foreground disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}

      <Textarea
        value={request}
        onChange={(event) => setRequest(event.target.value.slice(0, 1200))}
        rows={3}
        maxLength={1200}
        className="mt-4 bg-background/70"
        placeholder={copy(
          "Ex.: quero uma build segura para SoloQ, com boa margem de erro e sem depender de snowball.",
          "Example: I want a safe SoloQ build with room for mistakes and no heavy snowball dependency.",
          "Ej.: quiero una build segura para SoloQ, con margen de error y sin depender demasiado del snowball.",
        )}
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => void generate()} disabled={!request.trim() || busy}>
          {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
          {busy
            ? copy("Noctis pensando…", "Noctis is thinking…", "Noctis está pensando…")
            : copy("Gerar preset", "Generate preset", "Generar preset")}
        </Button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>

      {suggestion ? (
        <div className="mt-4 rounded-xl border border-[var(--impar-line)] bg-background/70 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.1em] text-[var(--impar-spectral)]">
                {copy("Preset sugerido", "Suggested preset", "Preset sugerido")}
              </p>
              <h5 className="mt-1 font-display text-base font-semibold text-foreground">
                {suggestion.title || copy("Preset do Noctis", "Noctis preset", "Preset de Noctis")}
              </h5>
              {suggestion.summary || suggestion.reason ? (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {String(suggestion.summary || suggestion.reason)}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => onApply(suggestion)}
            >
              <WandSparkles className="mr-2 size-4" />
              {copy("Aplicar no criador", "Apply to builder", "Aplicar al creador")}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
