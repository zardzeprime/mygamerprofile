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

    const root = document.documentElement;
    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.42;
    let currentX = targetX;
    let currentY = targetY;
    let frame = 0;

    const writeAtmosphere = () => {
      const width = Math.max(window.innerWidth, 1);
      const height = Math.max(window.innerHeight, 1);
      const nx = currentX / width - 0.5;
      const ny = currentY / height - 0.5;

      root.style.setProperty("--impar-pointer-x", `${currentX.toFixed(1)}px`);
      root.style.setProperty("--impar-pointer-y", `${currentY.toFixed(1)}px`);
      root.style.setProperty("--impar-star-dx", `${(nx * 18).toFixed(2)}px`);
      root.style.setProperty("--impar-star-dy", `${(ny * 14).toFixed(2)}px`);
      root.style.setProperty("--impar-star-dx-reverse", `${(-nx * 11).toFixed(2)}px`);
      root.style.setProperty("--impar-star-dy-reverse", `${(-ny * 9).toFixed(2)}px`);
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      aura.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      writeAtmosphere();

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        frame = window.requestAnimationFrame(animate);
      } else {
        frame = 0;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      aura.dataset["visible"] = "true";
      if (frame === 0) frame = window.requestAnimationFrame(animate);

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
      targetX = window.innerWidth * 0.5;
      targetY = window.innerHeight * 0.42;
      if (frame === 0) frame = window.requestAnimationFrame(animate);
    };

    writeAtmosphere();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      root.style.removeProperty("--impar-pointer-x");
      root.style.removeProperty("--impar-pointer-y");
      root.style.removeProperty("--impar-star-dx");
      root.style.removeProperty("--impar-star-dy");
      root.style.removeProperty("--impar-star-dx-reverse");
      root.style.removeProperty("--impar-star-dy-reverse");
    };
  }, []);

  return <div ref={auraRef} className="mgp-pointer-aura" aria-hidden="true" />;
}
