import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useEffect } from "react";

import { NoctisMark } from "@/components/noctis/NoctisMark";
import { buildSeo } from "@/lib/seo";

export const Route = createFileRoute("/noctis")({
  head: () =>
    buildSeo({
      title: "Noctis — ÍMPAR",
      description: "Converse com Noctis, mascote e assistente do ÍMPAR.",
      path: "/noctis",
      robots: "noindex, nofollow",
    }),
  component: NoctisRoute,
});

function findNoctisLauncher() {
  return document.querySelector<HTMLButtonElement>('button[aria-label$="Noctis"]');
}

function openNoctis() {
  const launcher = findNoctisLauncher();
  if (!launcher || launcher.querySelector("svg")) return false;
  launcher.click();
  return true;
}

function NoctisRoute() {
  useEffect(() => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (openNoctis() || attempts >= 12) window.clearInterval(timer);
    }, 80);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="impar-shell min-h-[calc(100dvh-4.25rem)] px-4 py-10 sm:px-6 sm:py-16">
      <section className="impar-card relative mx-auto flex w-full max-w-3xl flex-col items-center overflow-hidden rounded-[2rem_2rem_0.8rem_2rem] px-5 py-9 text-center sm:px-10 sm:py-12">
        <div className="impar-noctis-halo pointer-events-none absolute inset-0 opacity-80" aria-hidden="true" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--impar-line)] bg-[var(--impar-spectral-soft)] px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--impar-spectral)]">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Assistente do ÍMPAR
          </div>

          <NoctisMark className="size-24 sm:size-28" title="Noctis" />

          <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Noctis
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
            Jogos, builds, sistemas, dúvidas ou só uma troca de ideia. O Noctis fica por aqui para te ajudar a navegar pelo ÍMPAR.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => findNoctisLauncher()?.click()}
              className="brand-button min-h-11 gap-2"
            >
              Falar com Noctis
              <Sparkles className="size-4" aria-hidden="true" />
            </button>
            <a href="/" className="brand-button-secondary min-h-11 gap-2">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Voltar ao início
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
