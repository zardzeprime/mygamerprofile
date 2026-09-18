import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "[role='button']",
  "[role='tab']",
  "[role='radio']",
  "select",
  "input[type='range']",
  "input[type='color']",
].join(",");

export function PointerAura() {
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const aura = auraRef.current;
    if (!aura) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    let targetX = -80;
    let targetY = -80;
    let currentX = targetX;
    let currentY = targetY;
    let frame = 0;
    let running = true;

    const animate = () => {
      if (!running) return;
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;
      aura.style.transform =
        \`translate3d(\${currentX}px, \${currentY}px, 0) translate(-50%, -50%)\`;
      frame = window.requestAnimationFrame(animate);
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      aura.dataset["visible"] = "true";

      const target = event.target;
      const interactive =
        target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR));
      aura.dataset["interactive"] = interactive ? "true" : "false";
    };

    const onPointerDown = () => {
      aura.dataset["pressed"] = "true";
    };

    const onPointerUp = () => {
      aura.dataset["pressed"] = "false";
    };

    const onPointerLeave = () => {
      aura.dataset["visible"] = "false";
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    frame = window.requestAnimationFrame(animate);

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
    };
  }, []);

  return <div ref={auraRef} className="mgp-pointer-aura" aria-hidden="true" />;
}
