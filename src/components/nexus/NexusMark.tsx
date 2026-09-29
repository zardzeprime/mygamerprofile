import { cn } from "@/lib/utils";

type NexusMarkProps = {
  className?: string;
  title?: string;
};

/**
 * Public Noctis mark.
 *
 * The component keeps its legacy export name because NEXUS remains the internal
 * MGP runtime/orchestration layer. Public surfaces render Noctis instead.
 */
export function NexusMark({ className, title = "Noctis" }: NexusMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-6", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>

      {/* top hat */}
      <path d="M23 14h18l-2-8H25l-2 8Z" fill="currentColor" opacity=".95" />
      <path d="M18 15.5h28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

      {/* owl-cat ears and head */}
      <path
        d="M18 27 14 20l9 4c2.7-1.7 5.7-2.5 9-2.5s6.3.8 9 2.5l9-4-4 7c1.3 2.5 2 5.4 2 8.5C48 45.2 41.1 52 32 52s-16-6.8-16-16.5c0-3.1.7-6 2-8.5Z"
        fill="currentColor"
        opacity=".18"
      />
      <path
        d="M18 27 14 20l9 4c2.7-1.7 5.7-2.5 9-2.5s6.3.8 9 2.5l9-4-4 7c1.3 2.5 2 5.4 2 8.5C48 45.2 41.1 52 32 52s-16-6.8-16-16.5c0-3.1.7-6 2-8.5Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* heterochromia is represented with theme-safe accent opacity */}
      <circle cx="25" cy="34" r="4.5" fill="#5FD39A" />
      <circle cx="39" cy="34" r="4.5" fill="#E3B84F" />
      <circle cx="25" cy="34" r="1.8" fill="currentColor" />
      <circle cx="39" cy="34" r="1.8" fill="currentColor" />

      {/* owl beak / cat muzzle */}
      <path d="m32 38-3.2 3.2L32 43l3.2-1.8L32 38Z" fill="currentColor" />
      <path d="M27 46c1.7 1.2 3.3 1.8 5 1.8s3.3-.6 5-1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

      {/* small mystical wings */}
      <path d="M16 36c-5 1-7 4-8 8 4-1 7-.2 9 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".65" />
      <path d="M48 36c5 1 7 4 8 8-4-1-7-.2-9 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".65" />
    </svg>
  );
}
