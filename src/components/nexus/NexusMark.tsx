import { cn } from "@/lib/utils";
import "./NexusMark.css";

type NexusMarkProps = {
  className?: string;
  title?: string;
};

/**
 * Public Noctis mascot.
 *
 * NEXUS remains the internal runtime/orchestration name for compatibility.
 * Public surfaces use the cleaned animation generated for Noctis in Work.
 */
export function NexusMark({ className, title = "Noctis" }: NexusMarkProps) {
  return (
    <span
      className={cn(
        "noctis-mark relative inline-grid size-6 shrink-0 place-items-center overflow-visible",
        className,
      )}
      role="img"
      aria-label={title}
      title={title}
    >
      <picture className="pointer-events-none size-full">
        <source
          media="(prefers-reduced-motion: reduce)"
          srcSet="/assets/noctis/noctis-idle-work.webp"
        />
        <img
          src="/assets/noctis/noctis-animacoes.gif"
          alt=""
          aria-hidden="true"
          draggable={false}
          decoding="async"
          className="noctis-mark__work pointer-events-none size-full select-none object-contain"
        />
      </picture>
    </span>
  );
}
