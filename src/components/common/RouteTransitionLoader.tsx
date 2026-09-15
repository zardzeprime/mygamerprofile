import { useRouterState } from "@tanstack/react-router";
import { Gamepad2, Keyboard, Mouse } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";

const DEVICES = [Gamepad2, Mouse, Keyboard, Gamepad2, Mouse, Keyboard, Gamepad2, Mouse, Keyboard];

export function RouteTransitionLoader() {
  const { locale } = useI18n();
  const pending = useRouterState({ select: (state) => state.status === "pending" });
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef(0);

  useEffect(() => {
    let timeout: number | undefined;

    if (pending) {
      shownAtRef.current = performance.now();
      setVisible(true);
    } else if (visible) {
      const elapsed = performance.now() - shownAtRef.current;
      const remaining = Math.max(0, 360 - elapsed);
      timeout = window.setTimeout(() => setVisible(false), remaining);
    }

    return () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, [pending, visible]);

  return (
    <div
      className={`mgp-route-loader${visible ? " mgp-route-loader--visible" : ""}`}
      aria-hidden={!visible}
      aria-live="polite"
      aria-busy={visible}
    >
      <div className="mgp-route-loader__veil" />
      <div className="mgp-route-loader__content">
        <div className="mgp-route-loader__devices" aria-hidden="true">
          {DEVICES.map((Icon, index) => (
            <span
              key={`${Icon.displayName ?? Icon.name}-${index}`}
              className="mgp-route-loader__device"
              style={{ animationDelay: `${index * 110}ms` }}
            >
              <Icon className="size-5 sm:size-6" />
            </span>
          ))}
        </div>

        <div className="mgp-route-loader__brand">
          <span className="mgp-route-loader__logo-wrap">
            <img src="/brand/mgp-logo.png" alt="" className="mgp-route-loader__logo" />
          </span>
          <div className="text-left">
            <p className="font-display text-sm font-bold tracking-[0.16em] text-foreground">MGP</p>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {localeCopy(locale, "Carregando sua próxima tela…", "Loading your next screen…", "Cargando tu próxima pantalla…")}
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
