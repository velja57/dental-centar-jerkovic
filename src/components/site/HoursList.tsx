import { clinic } from "@/content/clinic";
import { weekdayName, type Loc } from "@/lib/time";

const ORDER = [1, 2, 3, 4, 5, 6, 0];

export function HoursList({ locale, closedLabel, dark = false }: { locale: Loc; closedLabel: string; dark?: boolean }) {
  return (
    <dl className="grid gap-1.5 text-[15px]">
      {ORDER.map((wd) => {
        const h = clinic.hours.find((x) => x.weekday === wd);
        return (
          <div key={wd} className="flex items-center justify-between gap-6">
            <dt className={`capitalize ${dark ? "text-brand-100/80" : "text-slate-600"}`}>{weekdayName(wd, locale)}</dt>
            <dd className={`font-semibold tabular-nums ${h ? (dark ? "text-white" : "text-ink") : dark ? "text-brand-200/60" : "text-slate-400"}`}>
              {h ? `${h.open} – ${h.close}` : closedLabel}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
