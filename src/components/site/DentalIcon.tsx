import type { DentalIconName } from "@/content/services";

const TOOTH =
  "M12 6.6C10.8 6.6 10.2 5.75 8.7 5.75 6.75 5.75 5.3 7.3 5.3 9.55c0 1.7.6 2.85 1.1 4.2.5 1.35.7 3.1 1.05 4.8.25 1.35.7 2.2 1.45 2.2.85 0 1.1-.85 1.35-2.2.25-1.35.5-2.9 1.75-2.9s1.5 1.55 1.75 2.9c.25 1.35.5 2.2 1.35 2.2.75 0 1.2-.85 1.45-2.2.35-1.7.55-3.45 1.05-4.8.5-1.35 1.1-2.5 1.1-4.2 0-2.25-1.45-3.8-3.4-3.8-1.5 0-2.1.85-3.3.85z";

/** Sopstvene stomatološke ikonice (isti stil kao lucide: linija 1.7, zaobljeni krajevi). */
export function DentalIcon({ name, className = "h-6 w-6" }: { name: DentalIconName; className?: string }) {
  if (name === "implant") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7.2 3.5h9.6c.9 0 1.6.7 1.6 1.6v1.2c0 2.4-1.9 4.2-4.2 4.2H9.8c-2.3 0-4.2-1.8-4.2-4.2V5.1c0-.9.7-1.6 1.6-1.6z" />
        <path d="M10.2 10.5h3.6v1.8h-3.6z" />
        <path d="M9.6 12.3h4.8l-.5 7.2-1.9 2-1.9-2z" />
        <path d="M9.8 14.7h4.4M10 17h4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g transform="translate(0 -1.25)">
        <path d={TOOTH} />
        {name === "child" && (
          <>
            <circle cx="9.8" cy="10" r=".55" fill="currentColor" />
            <circle cx="14.2" cy="10" r=".55" fill="currentColor" />
            <path d="M9.7 12.2c.7.7 1.4 1 2.3 1s1.6-.3 2.3-1" />
          </>
        )}
        {name === "shield" && <path d="M9.3 11l1.8 1.8 3.6-3.6" />}
        {name === "braces" && (
          <>
            <path d="M5.7 11.3h12.6" />
            <rect x="8.2" y="10.2" width="2.2" height="2.2" rx=".5" />
            <rect x="13.6" y="10.2" width="2.2" height="2.2" rx=".5" />
          </>
        )}
        {name === "sparkle" && (
          <>
            <path d="M8.3 8.8c.35-.75.9-1.15 1.7-1.3" />
            <path d="M20.2 2.6v3.6M18.4 4.4H22" />
          </>
        )}
        {name === "filling" && <circle cx="12" cy="10.6" r="1.9" />}
        {name === "crown" && <path d="M8.4 11.8l1.2-2.4 2.4 1.6 2.4-1.6 1.2 2.4" />}
      </g>
    </svg>
  );
}
