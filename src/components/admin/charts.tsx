import { fmtNumber } from "@/lib/format";
import { parseDate } from "@/lib/time";

// Specifikacija (dataviz): jedna nijansa za veličinu, stubići ≤24px sa zaobljenim vrhom 4px,
// tanke pomoćne linije, vrednost uvek dostupna i bez hovera (tabela ispod grafikona).
const GRID = "#e1e0d9";
const BASE = "#c3c2b7";
const MUTED = "#898781";

function niceCeil(v: number) {
  if (v <= 0) return 0;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
}

function compact(n: number) {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  return fmtNumber(n);
}

/** Dnevni prihod u mesecu (stubići). */
export function DailyColumns({ data, caption }: { data: { date: string; value: number }[]; caption: string }) {
  const max = niceCeil(Math.max(0, ...data.map((d) => d.value))) || 1;
  const ticks = [0, max / 2, max];
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <figure>
      <div className="relative h-56 pl-12">
        {ticks.map((t) => (
          <div key={t} className="absolute right-0 left-12 border-t" style={{ bottom: `${(t / max) * 100}%`, borderColor: t === 0 ? BASE : GRID }}>
            <span className="absolute top-0 -left-12 w-10 -translate-y-1/2 text-right text-[11px] tabular-nums" style={{ color: MUTED }}>
              {compact(t)}
            </span>
          </div>
        ))}
        <div className="absolute inset-y-0 right-0 left-12 flex items-end gap-[2px]">
          {data.map((d) => {
            const label = `${parseDate(d.date).d}.${parseDate(d.date).m}.`;
            return (
              <div
                key={d.date}
                tabIndex={0}
                aria-label={`${label}: ${fmtNumber(d.value)} RSD`}
                className="group relative flex h-full min-w-0 flex-1 items-end justify-center outline-none"
              >
                <div
                  className="w-full max-w-[24px] rounded-t-[4px] bg-brand-500 transition-colors group-hover:bg-brand-700 group-focus-visible:bg-brand-700"
                  style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 2 : 0 }}
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg group-hover:block group-focus-visible:block">
                  <strong className="block text-sm">{fmtNumber(d.value)} RSD</strong>
                  <span className="text-white/70">{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex pl-12 text-[11px] tabular-nums" style={{ color: MUTED }}>
        {data.map((d, i) => {
          const day = parseDate(d.date).d;
          const show = day === 1 || day % 5 === 0 || i === data.length - 1;
          return (
            <span key={d.date} className="flex-1 text-center">
              {show ? day : ""}
            </span>
          );
        })}
      </div>
      <figcaption className="sr-only">{caption}</figcaption>
      <details className="mt-3 text-sm">
        <summary className="font-semibold text-brand-700">Prikaži tabelu</summary>
        <table className="mt-2 w-full max-w-sm text-left">
          <tbody className="divide-y divide-slate-100">
            {data
              .filter((d) => d.value > 0)
              .map((d) => (
                <tr key={d.date}>
                  <td className="py-1 text-slate-600">{d.date.split("-").reverse().join(".")}.</td>
                  <td className="py-1 text-right font-semibold tabular-nums">{fmtNumber(d.value)} RSD</td>
                </tr>
              ))}
            <tr>
              <td className="py-1 font-bold">Ukupno</td>
              <td className="py-1 text-right font-bold tabular-nums">{fmtNumber(total)} RSD</td>
            </tr>
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** Rangirane horizontalne trake (najveće prvo), jedna nijansa. */
export function RankedBars({ rows, format }: { rows: { label: string; value: number; swatch?: string; sub?: string }[]; format: (n: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0) return <p className="text-sm text-slate-500">Nema podataka za ovaj period.</p>;
  return (
    <ul className="grid gap-3">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,9rem)_1fr_6.5rem] items-center gap-3 text-sm sm:grid-cols-[minmax(0,13rem)_1fr_7rem]">
          <span className="flex min-w-0 items-center gap-2">
            {r.swatch && <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.swatch }} aria-hidden="true" />}
            <span className="truncate text-slate-700" title={r.label}>
              {r.label}
            </span>
          </span>
          <span className="relative h-4" title={`${r.label}: ${format(r.value)}`}>
            <span className="absolute inset-y-0 left-0 rounded-r-[4px] bg-brand-500" style={{ width: `${(r.value / max) * 100}%`, minWidth: r.value > 0 ? 2 : 0 }} />
          </span>
          <span className="text-right font-semibold text-ink tabular-nums">
            {format(r.value)}
            {r.sub && <span className="block text-xs font-normal text-slate-500">{r.sub}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Tanka segmentirana traka (ishod termina) — brojevi su u listi pored, traka nema teksta. */
export function SegmentBar({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  if (total === 0) return <div className="h-2 rounded-full bg-slate-100" />;
  return (
    <div className="flex h-2 gap-[2px] overflow-hidden rounded-full" role="img" aria-label={parts.map((p) => `${p.label}: ${p.value}`).join(", ")}>
      {parts
        .filter((p) => p.value > 0)
        .map((p) => (
          <span key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />
        ))}
    </div>
  );
}
