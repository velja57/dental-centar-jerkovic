import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Globe, Plus } from "lucide-react";
import { SegmentBar } from "@/components/admin/charts";
import { Empty, PageHeader, Panel, rsd, STATUS_META, StatTile, StatusBadge } from "@/components/admin/ui";
import { setStatusAction } from "@/lib/admin-actions";
import { dashboardData } from "@/lib/admin-data";
import { requireSession } from "@/lib/auth";
import { fmtNumber } from "@/lib/format";
import { displayPhone } from "@/lib/phone";
import { doctorTitle } from "@/lib/site";
import { fmtDateLong, fmtMonthYear, minToTime, shiftMonth } from "@/lib/time";

export const metadata: Metadata = { title: "Pregled" };

export default async function DashboardPage() {
  const s = await requireSession();
  const d = await dashboardData(s);
  const ym = d.now.date.slice(0, 7);
  const vs = `vs isti period u ${fmtMonthYear(shiftMonth(ym, -1), "sr").replace(/ \d{4}\.$/, "")}`;
  const greeting = d.now.minutes < 12 * 60 ? "Dobro jutro" : d.now.minutes < 18 * 60 ? "Dobar dan" : "Dobro veče";
  const m = d.month;
  const outcome = [
    { key: "completed", label: STATUS_META.completed.label, value: m.completed, color: STATUS_META.completed.dot },
    { key: "confirmed", label: "Predstoji", value: m.upcoming, color: STATUS_META.confirmed.dot },
    { key: "no_show", label: STATUS_META.no_show.label, value: m.noShow, color: STATUS_META.no_show.dot },
    { key: "cancelled", label: STATUS_META.cancelled.label, value: m.cancelled, color: STATUS_META.cancelled.dot },
  ];
  const outcomeTotal = outcome.reduce((a, o) => a + o.value, 0);

  return (
    <>
      <PageHeader
        title={`${greeting}, ${doctorTitle(s.name, "sr")}`}
        subtitle={<span className="inline-block first-letter:uppercase">{fmtDateLong(d.now.date, "sr")}</span>}
        actions={
          <>
            <Link href="/admin/termini/novi" className="btn btn-brand">
              <Plus className="h-4 w-4" /> Novi termin
            </Link>
            <Link href="/admin/kalendar" className="btn btn-outline">
              <CalendarDays className="h-4 w-4" /> Kalendar
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Naplaćeno ovog meseca" value={rsd(m.revenue)} delta={{ current: m.revenue, previous: d.prevMonth.revenue, vs }} />
        <StatTile label="Termini ovog meseca" value={fmtNumber(m.booked)} delta={{ current: m.booked, previous: d.prevMonth.booked, vs }} />
        <StatTile label="Novi pacijenti" value={fmtNumber(m.newPatients)} delta={{ current: m.newPatients, previous: d.prevMonth.newPatients, vs }} />
        <StatTile label="Dugovanja pacijenata" value={rsd(d.debt.total)} hint={`${d.debt.count} pacijenata ima neizmiren dug`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Panel
          title={`Danas · ${d.today.length} ${d.today.length === 1 ? "termin" : "termina"}`}
          actions={
            <Link href="/admin/kalendar?view=day" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
              Kalendar dana <ArrowRight className="h-4 w-4" />
            </Link>
          }
          bodyClass="p-0"
        >
          {d.today.length === 0 ? (
            <div className="p-5">
              <Empty>Danas nema zakazanih termina.</Empty>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {d.today.map((a) => {
                const past = a.endMin != null && a.endMin <= d.now.minutes;
                return (
                  <li key={a.id} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center">
                    <Link href={`/admin/termini/${a.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                      <span className="w-14 shrink-0 text-center">
                        <span className="block text-base font-bold text-ink tabular-nums">{a.startMin != null ? minToTime(a.startMin) : "—"}</span>
                        <span className="block text-xs text-slate-500 tabular-nums">{a.endMin != null ? minToTime(a.endMin) : ""}</span>
                      </span>
                      <span className="h-10 w-1 shrink-0 rounded-full" style={{ background: a.doctorColor ?? "#22988e" }} aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block truncate font-bold text-ink">{a.patientName}</span>
                        <span className="block truncate text-sm text-slate-500">
                          {a.serviceName}
                          {s.role === "admin" && a.doctorName ? ` · ${doctorTitle(a.doctorName, "sr")}` : ""}
                        </span>
                      </span>
                    </Link>
                    <div className="flex items-center gap-2 pl-[4.5rem] sm:pl-0">
                      {a.status === "confirmed" && past ? (
                        <>
                          <form action={setStatusAction}>
                            <input type="hidden" name="id" value={a.id} />
                            <input type="hidden" name="status" value="completed" />
                            <button className="btn btn-sm bg-green-50 text-green-800 ring-1 ring-green-200 hover:bg-green-100">Završen</button>
                          </form>
                          <form action={setStatusAction}>
                            <input type="hidden" name="id" value={a.id} />
                            <input type="hidden" name="status" value="no_show" />
                            <button className="btn btn-sm bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100">Nije došao</button>
                          </form>
                        </>
                      ) : (
                        <StatusBadge status={a.status} />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <div className="grid content-start gap-6">
          <Panel
            title={`Zahtevi na čekanju (${d.pending.length})`}
            actions={
              d.pending.length > 0 && (
                <Link href="/admin/termini?filter=pending" className="text-sm font-semibold text-brand-700">
                  Svi →
                </Link>
              )
            }
            bodyClass="p-0"
          >
            {d.pending.length === 0 ? (
              <div className="p-5">
                <Empty>Nema zahteva koji čekaju odgovor.</Empty>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {d.pending.slice(0, 6).map((a) => (
                  <li key={a.id}>
                    <Link href={`/admin/termini/${a.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                      <span className="min-w-0">
                        <span className="block truncate font-bold text-ink">{a.patientName}</span>
                        <span className="block truncate text-sm text-slate-500">
                          {a.serviceName} · {displayPhone(a.patientPhone)}
                        </span>
                      </span>
                      <span className="btn btn-sm btn-brand shrink-0">Zakaži</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Ovaj mesec: ishod termina">
            <SegmentBar parts={outcome} />
            <ul className="mt-4 grid gap-2 text-sm">
              {outcome.map((o) => (
                <li key={o.key} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: o.color }} aria-hidden="true" />
                    {o.label}
                  </span>
                  <span className="font-semibold text-ink tabular-nums">
                    {o.value}
                    <span className="ml-2 font-normal text-slate-400">{outcomeTotal ? Math.round((o.value / outcomeTotal) * 100) : 0}%</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-700">
                  <Globe className="h-4 w-4 text-brand-600" aria-hidden="true" /> Zakazano online
                </span>
                <span className="font-semibold text-ink">{Math.round(m.onlineShare * 100)}%</span>
              </p>
              <div className="mt-2 h-2 rounded-full bg-brand-100">
                <div className="h-2 rounded-full bg-brand-500" style={{ width: `${Math.round(m.onlineShare * 100)}%` }} />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Narednih 7 dana: <strong className="text-ink">{d.upcoming}</strong> zakazanih termina
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
