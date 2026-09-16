import { cn } from "@/lib/utils";

type NexusMarkProps = {
  className?: string;
  title?: string;
};

/**
 * Original MGP/NEXUS interface mark: an angular N whose diagonal silhouette
 * also reads as a Z at small sizes. Kept as vector geometry so it stays crisp
 * in the floating chat button, headers and future NEXUS surfaces.
 */
export function NexusMark({ className, title }: NexusMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-6", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}

      <path
        d="M14 50V14L50 50V14"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M13 13H25M39 51H51"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
      />
      <path d="M48 13L56 5L54 18L48 13Z" fill="currentColor" />
      <path d="M16 51L8 59L10 46L16 51Z" fill="currentColor" />
      <path
        d="M23 24L41 42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        opacity="0.45"
      />
    </svg>
  );
}
