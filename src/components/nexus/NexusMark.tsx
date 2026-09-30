import { cn } from "@/lib/utils";

type NexusMarkProps = {
  className?: string;
  title?: string;
};

/**
 * Public Noctis mark.
 *
 * NEXUS remains the internal runtime/orchestration name for compatibility.
 * The old animated WebP is intentionally not rendered here because its tiny
 * source canvas and frame palette produce visible flicker/pixel artifacts.
 * This temporary vector stays crisp until the final mascot asset is supplied.
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
      <svg
        viewBox="0 0 120 120"
        aria-hidden="true"
        className="size-full overflow-visible"
        fill="none"
      >
        <path
          d="M28 41 34 18l19 14c2-1 5-1 7-1s5 0 7 1l19-14 6 23c7 8 11 18 11 30 0 25-19 39-43 39S17 96 17 71c0-12 4-22 11-30Z"
          fill="var(--impar-night-raised)"
          stroke="var(--impar-spectral)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M38 56c7-8 16-10 22-4-5 14-15 18-24 10 0-2 1-4 2-6Zm44 0c-7-8-16-10-22-4 5 14 15 18 24 10 0-2-1-4-2-6Z"
          fill="var(--impar-night)"
          stroke="var(--impar-spectral-strong)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="47" cy="58" r="5" fill="var(--impar-spectral)" />
        <circle cx="73" cy="58" r="5" fill="var(--impar-amber)" />
        <path d="M55 70h10l-5 6-5-6Z" fill="var(--impar-prestige)" />
        <path
          d="M42 83c6 6 12 8 18 8s12-2 18-8"
          stroke="var(--impar-prestige)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M30 43c7 1 12 4 16 9M90 43c-7 1-12 4-16 9"
          stroke="var(--impar-mystic)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
    </span>
  );
}
