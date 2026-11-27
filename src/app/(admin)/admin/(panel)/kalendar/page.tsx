import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { TimeGrid, type GridColumn } from "@/components/admin/TimeGrid";
import { PageHeader, SPECIALTY_LABEL } from "@/components/admin/ui";
import { allDoctors, calendarData } from "@/lib/admin-data";
import { isClinicHoliday } from "@/lib/availability";
import { holidayOn } from "@/lib/holidays";
import { requireSession } from "@/lib/auth";
import { doctorTitle } from "@/lib/site";
import { addDays, fmtDateLong, isValidDate, nowInClinic, parseDate, startOfWeek, weekdayName, weekdayOf } from "@/lib/time";

export const metadata: Metadata = { title: "Kalendar" };

type Props = { searchParams: Promise<{ view?: string; d?: string; doc?: string }> };

export default async function CalendarPage({ searchParams }: Props) {
  const [s, sp] = await Promise.all([requireSession(), searchParams]);
  const now = nowInClinic();
  const date = isValidDate(sp.d) ? sp.d : now.date;
  const isAdmin = s.role === "admin";
  const view: "day" | "week" = sp.view === "day" || sp.view === "week" ? sp.view : isAdmin ? "day" : "week";
  const from = view === "day" ? date : startOfWeek(date);
  const to = view === "day" ? date : addDays(from, 6);

  // Doktori i podaci kalendara u jednom paralelnom krugu
  const [docsAll, { items, sch, off }] = await Promise.all([allDoctors(), calendarData(from, to)]);
  const docs = docsAll.filter((d) => d.active);

  // Doktor vidi samo svoj kalendar; administrator bira doktora ili sve (u prikazu dana)
  let selected: number | "all" = s.id;
  if (isAdmin) {
    if (sp.doc && sp.doc !== "all" && docs.some((d) => d.id === Number(sp.doc))) selected = Number(sp.doc);
    else selected = view === "day" ? "all" : (docs[0]?.id ?? s.id);
  }
  const shownDocs = selected === "all" ? docs : docs.filter((d) => d.id === selected);

  function columnFor(doctorId: number, day: string, title: string, subtitle?: string): GridColumn {
    const wd = weekdayOf(day);
    const work = sch.filter((r) => r.doctorId === doctorId && r.weekday === wd).map((r) => [r.startMin, r.endMin] as [number, number]);
    const dayOff = off
      .filter((o) => (o.doctorId === null || o.doctorId === doctorId) && day >= o.dateFrom && day <= o.dateTo)
      .map((o) => ({
        start: o.startMin ?? (work[0]?.[0] ?? 8 * 60),
        end: o.endMin ?? (work[work.length - 1]?.[1] ?? 20 * 60),
        reason: o.reason,
      }));
    // Državni praznik: online zakazivanje je tog dana zatvoreno (src/lib/holidays.ts)
    if (isClinicHoliday(day)) {
      dayOff.push({ start: work[0]?.[0] ?? 8 * 60, end: work[work.length - 1]?.[1] ?? 20 * 60, reason: holidayOn(day)!.sr });
    }
    return {
      key: `${doctorId}-${day}`,
      title,
      subtitle,
      date: day,
      doctorId,
      isToday: day === now.date,
      work,
      off: dayOff,
      items: items
        .filter((a) => a.doctorId === doctorId && a.date === day && a.startMin != null && a.endMin != null)
        .map((a) => ({
          id: a.id,
          start: a.startMin!,
          end: a.endMin!,
          status: a.status,
          patient: a.patientName,
          service: a.serviceName,
          color: a.doctorColor ?? "#22988e",
          online: a.source === "online",
        })),
    };
  }

  let columns: GridColumn[];
  if (view === "day") {
    columns = shownDocs.map((d) => columnFor(d.id, date, doctorTitle(d.name, "sr"), SPECIALTY_LABEL[d.specialty] ?? d.specialty));
  } else {
    const doc = shownDocs[0];
    const days = Array.from({ length: 7 }, (_, i) => addDays(from, i)).filter((day) => {
      const wd = weekdayOf(day);
      if (wd >= 1 && wd <= 5) return true;
      return sch.some((r) => r.doctorId === doc?.id && r.weekday === wd) || items.some((a) => a.date === day && a.doctorId === doc?.id);
    });
    columns = doc
      ? days.map((day) => {
          const { d, m } = parseDate(day);
          return columnFor(doc.id, day, `${weekdayName(weekdayOf(day), "sr", true)} ${d}.${m}.`);
        })
      : [];
  }

  const step = view === "day" ? 1 : 7;
  const qs = (patch: Record<string, string>) => {
    const p = new URLSearchParams({ view, d: date, ...(isAdmin ? { doc: String(selected) } : {}), ...patch });
    return `/admin/kalendar?${p.toString()}`;
  };
  const rangeLabel = view === "day" ? fmtDateLong(date, "sr") : `${fmtDateLong(from, "sr")} – ${fmtDateLong(to, "sr")}`;

  return (
    <>
      <PageHeader
        title="Kalendar"
        subtitle={<span className="inline-block first-letter:uppercase">{rangeLabel}</span>}
        actions={
          <Link href={`/admin/termini/novi?date=${date}${selected !== "all" ? `&doctor=${selected}` : ""}`} className="btn btn-brand">
            <Plus className="h-4 w-4" /> Novi termin
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
          <Link href={qs({ d: addDays(date, -step) })} className="rounded-full p-1.5 text-slate-600 hover:bg-slate-100" aria-label="Prethodno">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link href={qs({ d: now.date })} className="rounded-full px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Danas
          </Link>
          <Link href={qs({ d: addDays(date, step) })} className="rounded-full p-1.5 text-slate-600 hover:bg-slate-100" aria-label="Sledeće">
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex rounded-full border border-slate-200 bg-white p-1 text-sm font-semibold">
          {(["day", "week"] as const).map((v) => (
            <Link
              key={v}
              href={qs({ view: v, ...(isAdmin && v === "week" && selected === "all" ? { doc: String(docs[0]?.id ?? s.id) } : {}) })}
              className={`rounded-full px-3 py-1 ${view === v ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {v === "day" ? "Dan" : "Nedelja"}
            </Link>
          ))}
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-1.5">
            {view === "day" && (
              <Link
                href={qs({ doc: "all" })}
                className={`rounded-full border px-3 py-1 text-sm font-semibold ${selected === "all" ? "border-brand-600 bg-brand-50 text-brand-800" : "border-slate-200 bg-white text-slate-600"}`}
              >
                Svi doktori
              </Link>
            )}
            {docs.map((d) => (
              <Link
                key={d.id}
                href={qs({ doc: String(d.id) })}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${
                  selected === d.id ? "border-brand-600 bg-brand-50 text-brand-800" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} aria-hidden="true" />
                {doctorTitle(d.name, "sr")}
              </Link>
            ))}
          </div>
        )}
      </div>

      {columns.length === 0 ? (
        <p className="rounded-2xl bg-white p-6 text-slate-500">Nema doktora za prikaz.</p>
      ) : (
        <TimeGrid columns={columns} nowMinutes={now.minutes} />
      )}
      <p className="mt-3 text-sm text-slate-500">Kliknite na prazno polje za novi termin, ili na termin za detalje. Šrafirano: odsustvo ili praznik.</p>
    </>
  );
}
