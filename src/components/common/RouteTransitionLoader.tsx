import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

const MIN_VISIBLE_MS = 420;

export function RouteTransitionLoader() {
  const { locale } = useI18n();
  const pending = useRouterState({ select: (state) => state.status === "pending" });
  const [initialBoot, setInitialBoot] = useState(true);
  const [visible, setVisible] = useState(true);
  const shownAtRef = useRef(0);

  useEffect(() => {
    shownAtRef.current = performance.now();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(
      () => setInitialBoot(false),
      reducedMotion ? 80 : MIN_VISIBLE_MS,
    );
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    let timeout: number | undefined;
    const shouldShow = initialBoot || pending;

    if (shouldShow) {
      if (!visible) shownAtRef.current = performance.now();
      setVisible(true);
    } else if (visible) {
      const elapsed = performance.now() - shownAtRef.current;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
      timeout = window.setTimeout(() => setVisible(false), remaining);
    }

    return () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, [initialBoot, pending, visible]);

  return (
    <div
      className={`mgp-route-loader${visible ? " mgp-route-loader--visible" : ""}`}
      aria-hidden={!visible}
      aria-live="polite"
      aria-busy={visible}
    >
      <div className="mgp-route-loader__veil" />
      <div className="mgp-route-loader__content">
        <div className="mgp-route-loader__brand">
          <div className="mgp-route-loader__threshold" aria-hidden="true">
            <span className="mgp-route-loader__gate-line mgp-route-loader__gate-line--a" />
            <span className="mgp-route-loader__gate-line mgp-route-loader__gate-line--b" />
            <span className="mgp-route-loader__logo-wrap">
              <img src="/brand/impar-logo-official.webp" alt="" className="mgp-route-loader__logo" />
            </span>
          </div>

          <div className="text-center">
            <p className="font-display text-sm font-bold tracking-[0.2em] text-foreground">ÍMPAR</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {localeCopy(
                locale,
                "Abrindo o Limiar…",
                "Opening the Threshold…",
                "Abriendo el Umbral…",
              )}
            </p>
          </div>
        </div>

        <div className="mgp-route-loader__progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
