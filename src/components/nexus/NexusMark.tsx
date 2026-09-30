import { cn } from "@/lib/utils";

type NexusMarkProps = {
  className?: string;
  title?: string;
};

/**
 * Public Noctis mascot.
 *
 * NEXUS remains the internal runtime/orchestration name, while public surfaces
 * use the animated Noctis asset created for MG Profile. The source WebP is a
 * lightweight 6-frame idle loop derived from the approved Noctis sprite atlas.
 */
export function NexusMark({ className, title = "Noctis" }: NexusMarkProps) {
  return (
    <span
      className={cn(
        "group/noctis relative inline-grid size-6 shrink-0 place-items-center overflow-visible",
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
        className="pointer-events-none size-[150%] max-w-none select-none object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.28)] transition-transform duration-300 ease-out group-hover/noctis:-translate-y-0.5 group-hover/noctis:scale-110 group-active/noctis:translate-y-0 group-active/noctis:scale-95"
      />
    </span>
  );
}
