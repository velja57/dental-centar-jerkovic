import type { ReactNode } from "react";
import { Ban, CalendarCheck, CircleCheck, Hourglass, TrendingDown, TrendingUp, UserX } from "lucide-react";
import { fmtNumber } from "@/lib/format";

export const STATUS_META: Record<string, { label: string; cls: string; dot: string; icon: typeof CircleCheck }> = {
  pending: { label: "Zahtev na upit", cls: "bg-orange-50 text-orange-800 ring-orange-200", dot: "#ec835a", icon: Hourglass },
  confirmed: { label: "Zakazan", cls: "bg-brand-50 text-brand-800 ring-brand-200", dot: "#22988e", icon: CalendarCheck },
  completed: { label: "Završen", cls: "bg-green-50 text-green-800 ring-green-200", dot: "#0ca30c", icon: CircleCheck },
  no_show: { label: "Nije došao", cls: "bg-red-50 text-red-700 ring-red-200", dot: "#d03b3b", icon: UserX },
  cancelled: { label: "Otkazan", cls: "bg-amber-50 text-amber-800 ring-amber-200", dot: "#fab219", icon: Ban },
};

export const METHOD_LABEL: Record<string, string> = {
  gotovina: "Gotovina",
  kartica: "Kartica",
  rate: "Na rate",
  prenos: "Prenos na račun",
};

export const SOURCE_LABEL: Record<string, string> = {
  online: "Online",
  phone: "Telefon",
  admin: "Admin",
  demo: "Demo",
};

export const SPECIALTY_LABEL: Record<string, string> = {
  pedijatrija: "Dečji stomatolog",
  ortodoncija: "Ortodont",
  protetika: "Protetičar",
  opsta: "Opšta stomatologija",
};

export const rsd = (n: number) => `${fmtNumber(n)} RSD`;

export function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META.confirmed;
  const Icon = m.icon;
  return (
    <span className={`badge ring-1 ring-inset ${m.cls}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {m.label}
    </span>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, actions, children, className = "", bodyClass = "p-5" }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          {title && <h2 className="text-base font-bold text-ink">{title}</h2>}
          {actions}
        </div>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{children}</p>;
}

/** KPI pločica: oznaka · vrednost · promena u odnosu na prethodni period (boja = smer × da li je rast dobar). */
export function StatTile({
  label,
  value,
  hint,
  delta,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: { current: number; previous: number; goodWhenUp?: boolean; vs: string };
}) {
  let deltaEl: ReactNode = null;
  if (delta && delta.previous > 0) {
    const pct = ((delta.current - delta.previous) / delta.previous) * 100;
    const up = pct >= 0;
    const good = delta.goodWhenUp === false ? !up : up;
    const Icon = up ? TrendingUp : TrendingDown;
    deltaEl = (
      <p className="mt-2 flex items-center gap-1 text-xs font-semibold" style={{ color: good ? "#006300" : "#b42318" }}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {up ? "+" : "−"}
        {Math.abs(Math.round(pct))}% <span className="font-medium text-slate-500">{delta.vs}</span>
      </p>
    );
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1.5 text-[1.65rem] leading-tight font-bold tracking-tight text-ink">{value}</p>
      {deltaEl}
      {hint && !deltaEl && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-[13px] font-semibold text-slate-600">
      {children}
    </label>
  );
}
