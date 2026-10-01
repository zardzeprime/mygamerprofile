import { cn } from "@/lib/utils";
import "./NexusMark.css";

type NexusMarkProps = {
  className?: string;
  title?: string;
  calmMotion?: boolean;
};

/**
 * Public Noctis mascot.
 *
 * NEXUS remains the internal runtime/orchestration name for compatibility.
 * Public surfaces use the cleaned animation generated for Noctis in Work.
 */
export function NexusMark({ className, title = "Noctis", calmMotion = false }: NexusMarkProps) {
  return (
    <span
      className={cn(
        "noctis-mark relative inline-grid size-6 shrink-0 place-items-center overflow-visible",
        calmMotion && "noctis-mark--calm-motion",
        className,
      )}
      role="img"
      aria-label={title}
      title={title}
    >
      <img
        src="/assets/noctis/noctis-impar-web-4x.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        className="noctis-mark__work pointer-events-none size-full select-none object-contain"
      />
    </span>
  );
}
