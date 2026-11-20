import { ChevronDown, Star } from "lucide-react";
import type { ReactNode } from "react";
import { initials } from "@/lib/format";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  id,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  id?: string;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className="h2 mt-4">
        {title}
      </h2>
      {subtitle && <p className="lead mt-4">{subtitle}</p>}
    </div>
  );
}

export function Stars({ rating = 5, className = "h-4 w-4" }: { rating?: number; className?: string }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-400" aria-label={`${rating} / 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={className} fill={i < Math.round(rating) ? "currentColor" : "none"} strokeWidth={1.5} />
      ))}
    </span>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white">
      {items.map((item) => (
        <details key={item.q} className="group px-5 py-1 sm:px-6">
          <summary className="flex items-center justify-between gap-4 py-4 text-left text-[17px] font-bold text-ink">
            {item.q}
            <ChevronDown className="h-5 w-5 shrink-0 text-brand-600 transition group-open:rotate-180" />
          </summary>
          <p className="pb-5 text-[15px] leading-relaxed text-slate-600">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

export function DoctorAvatar({ name, color, size = "lg" }: { name: string; color: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-9 w-9 text-sm", md: "h-14 w-14 text-lg", lg: "h-24 w-24 text-3xl" };
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full font-extrabold text-white ${sizes[size]}`}
      style={{ background: `linear-gradient(140deg, ${color}, ${color}cc)` }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function Check({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M5 10.5l3.2 3L15 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-[15px] leading-relaxed text-slate-700">{children}</span>
    </li>
  );
}

export function PageHero({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-brand-50 to-white">
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="container-page relative py-14 md:py-20">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-balance text-ink sm:text-5xl">{title}</h1>
        {subtitle && <p className="lead mt-5 max-w-2xl">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
