import { cn } from "@/lib/utils";

type NexusMarkProps = {
  className?: string;
  title?: string;
};

/**
 * Public Noctis mascot.
 *
 * NEXUS remains the internal runtime/orchestration name for compatibility.
 * Public surfaces use Noctis and let the shared brand stylesheet handle motion
 * so the mascot behaves consistently across chat, loading states and cards.
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
      <img
        src="/assets/noctis/noctis-idle.webp"
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        className="noctis-mark__sprite pointer-events-none select-none object-contain"
      />
    </span>
  );
}
