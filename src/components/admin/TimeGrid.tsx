import Link from "next/link";
import { minToTime } from "@/lib/time";

export type GridItem = {
  id: number;
  start: number;
  end: number;
  status: string;
  patient: string;
  service: string;
  color: string;
  online: boolean;
};

export type GridColumn = {
  key: string;
  title: string;
  subtitle?: string;
  date: string;
  doctorId: number;
  isToday: boolean;
  work: [number, number][];
  off: { start: number; end: number; reason: string | null }[];
  items: GridItem[];
};

const START = 8 * 60;
const END = 20 * 60;
const STEP = 15;
const ROW = 14; // px po 15 minuta
const y = (m: number) => ((Math.min(Math.max(m, START), END) - START) / STEP) * ROW;
const HEIGHT = y(END);

export function TimeGrid({ columns, nowMinutes }: { columns: GridColumn[]; nowMinutes: number | null }) {
  const hours = Array.from({ length: (END - START) / 60 + 1 }, (_, i) => START + i * 60);
  return (
    <div className="overflow-x-auto overflow-y-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="grid pb-3" style={{ gridTemplateColumns: `52px repeat(${columns.length}, minmax(150px, 1fr))`, minWidth: 52 + columns.length * 150 }}>
        <div className="sticky left-0 z-20 border-b border-slate-200 bg-white" />
        {columns.map((c) => (
          <div key={c.key} className={`border-b border-l border-slate-200 px-3 py-2.5 ${c.isToday ? "bg-brand-50" : ""}`}>
            <p className={`text-sm font-bold ${c.isToday ? "text-brand-800" : "text-ink"}`}>{c.title}</p>
            {c.subtitle && <p className="text-xs text-slate-500">{c.subtitle}</p>}
          </div>
        ))}

        <div className="sticky left-0 z-20 bg-white" style={{ height: HEIGHT }}>
          {hours.map((h) => (
            <span key={h} className="absolute right-2 -translate-y-1/2 text-[11px] text-slate-400 tabular-nums" style={{ top: y(h) }}>
              {minToTime(h)}
            </span>
          ))}
        </div>

        {columns.map((c) => (
          <div key={c.key} className="relative border-l border-slate-200 bg-slate-50" style={{ height: HEIGHT }}>
            {c.work.map(([s, e]) => (
              <div key={`w${s}`} className="absolute inset-x-0 bg-white" style={{ top: y(s), height: y(e) - y(s) }} />
            ))}
            {hours.map((h) => (
              <div key={h} className="pointer-events-none absolute inset-x-0 border-t border-slate-100" style={{ top: y(h) }} />
            ))}
            {/* prazna polja: klik = novi termin */}
            {c.work.flatMap(([s, e]) =>
              Array.from({ length: Math.floor((e - s) / STEP) }, (_, i) => s + i * STEP).map((m) => (
                <Link
                  key={`s${m}`}
                  href={`/admin/termini/novi?date=${c.date}&time=${minToTime(m)}&doctor=${c.doctorId}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="group absolute inset-x-0 hover:bg-brand-50"
                  style={{ top: y(m), height: ROW }}
                >
                  <span className="hidden pl-2 text-[10px] leading-[14px] font-semibold text-brand-700 group-hover:inline">+ {minToTime(m)}</span>
                </Link>
              )),
            )}
            {c.off.map((o, i) => (
              <div
                key={`o${i}`}
                className="hatch absolute inset-x-1 overflow-hidden rounded-md border border-slate-300/60 bg-slate-100/80 px-2 py-1"
                style={{ top: y(o.start), height: Math.max(y(o.end) - y(o.start), ROW) }}
              >
                <span className="text-[11px] font-semibold text-slate-600">{o.reason ?? "Odsustvo"}</span>
              </div>
            ))}
            {c.items.map((it) => {
              const h = Math.max(y(it.end) - y(it.start) - 2, ROW + 4);
              const done = it.status === "completed";
              const missed = it.status === "no_show";
              return (
                <Link
                  key={it.id}
                  href={`/admin/termini/${it.id}`}
                  className="absolute inset-x-1 z-10 overflow-hidden rounded-lg border-l-4 px-2 py-1 text-xs leading-tight shadow-sm transition hover:z-20 hover:shadow-md"
                  style={{
                    top: y(it.start) + 1,
                    height: h,
                    borderColor: missed ? "#d03b3b" : it.color,
                    background: missed ? "#fdecec" : done ? "#f1f5f4" : `${it.color}1f`,
                  }}
                  title={`${minToTime(it.start)}–${minToTime(it.end)} · ${it.patient} · ${it.service}`}
                >
                  <span className={`block truncate font-bold ${done ? "text-slate-500 line-through decoration-slate-300" : "text-ink"}`}>
                    {minToTime(it.start)} {it.patient}
                  </span>
                  {h > 30 && <span className="block truncate text-slate-600">{it.service}</span>}
                  {h > 44 && (
                    <span className="mt-0.5 block text-[10px] font-semibold text-slate-500">
                      {done ? "✓ završen" : missed ? "nije došao" : it.online ? "online" : "telefon"}
                    </span>
                  )}
                </Link>
              );
            })}
            {c.isToday && nowMinutes !== null && nowMinutes > START && nowMinutes < END && (
              <div className="pointer-events-none absolute inset-x-0 z-30 border-t-2 border-coral-500" style={{ top: y(nowMinutes) }}>
                <span className="absolute -top-[5px] -left-[5px] h-2 w-2 rounded-full bg-coral-500" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
