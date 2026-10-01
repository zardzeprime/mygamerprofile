import { cn } from "@/lib/utils";
import "./NoctisMark.css";

type NoctisMarkProps = {
  className?: string;
  title?: string;
  calmMotion?: boolean;
  faceOnly?: boolean;
};

/**
 * Public Noctis mascot.
 *
 * NEXUS remains the internal runtime/orchestration name for compatibility.
 * Public surfaces use the cleaned animation generated for Noctis in Work.
 */
export function NoctisMark({ className, title = "Noctis", calmMotion = false, faceOnly = false }: NoctisMarkProps) {
  return (
    <span
      className={cn(
        "noctis-mark relative inline-grid size-6 shrink-0 place-items-center overflow-visible",
        calmMotion && "noctis-mark--calm-motion",
        faceOnly && "noctis-mark--face",
        className,
      )}
      role="img"
      aria-label={title}
      title={title}
    >
      <img
        src="/assets/noctis/noctis-impar-web-hd.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        className="noctis-mark__work pointer-events-none size-full select-none object-contain"
      />
    </span>
  );
}
