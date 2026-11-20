const HANDSET =
  "M9.1 7.6c.3-.1.6 0 .7.3l.8 1.9c.1.3 0 .6-.2.8l-.6.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.6c.2-.2.5-.3.8-.2l1.9.8c.3.1.4.4.3.7l-.3 1.1c-.1.4-.5.7-.9.7C10.7 16.5 7.5 13.3 7.5 9c0-.4.3-.8.7-.9z";

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d={HANDSET} fill="currentColor" />
    </svg>
  );
}

export function ViberIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M7 3h10a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-5l-4 3.5V17H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <g transform="translate(3.6 1.4) scale(.7)">
        <path d={HANDSET} fill="currentColor" />
      </g>
      <path d="M13.8 6.1a3 3 0 0 1 2.6 2.6M13.8 4.5a4.6 4.6 0 0 1 4.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
