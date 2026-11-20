// Logo: zub u zaobljenom kvadratu + "iskrica" (čistoća, blistav osmeh). Privremeno — lako se menja.
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="dcj-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3fb5a9" />
          <stop offset="1" stopColor="#17625d" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#dcj-logo-g)" />
      <path
        d="M24 13.2C21.6 13.2 20.4 11.5 17.4 11.5 13.5 11.5 10.6 14.6 10.6 19.1c0 3.4 1.2 5.7 2.2 8.4 1 2.7 1.4 6.2 2.1 9.6.5 2.7 1.4 4.4 2.9 4.4 1.7 0 2.2-1.7 2.7-4.4.5-2.7 1-5.8 3.5-5.8s3 3.1 3.5 5.8c.5 2.7 1 4.4 2.7 4.4 1.5 0 2.4-1.7 2.9-4.4.7-3.4 1.1-6.9 2.1-9.6 1-2.7 2.2-5 2.2-8.4 0-4.5-2.9-7.6-6.8-7.6-3 0-4.2 1.7-6.6 1.7z"
        fill="#fff"
      />
      <path d="M37.5 5.5l1.1 2.9 2.9 1.1-2.9 1.1-1.1 2.9-1.1-2.9-2.9-1.1 2.9-1.1z" fill="#ffa283" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className="h-10 w-10 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${light ? "text-brand-200" : "text-brand-600"}`}>
          Dental Centar
        </span>
        <span className={`mt-1 text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-ink"}`}>Jerković</span>
      </span>
    </span>
  );
}
