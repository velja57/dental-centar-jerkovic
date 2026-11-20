import "server-only";
import { and, eq, gte, inArray, isNull, lte, ne, or } from "drizzle-orm";
import { db } from "@/db";
import { appointments, doctors, schedules, services, timeOff } from "@/db/schema";
import { clinic } from "@/content/clinic";
import { addDays, nowInClinic, weekdayOf } from "@/lib/time";

export const BLOCKING_STATUSES = ["pending", "confirmed", "completed"];

type Interval = [number, number];

/** db ili transakcija (isti API za upite) */
export type Executor = Pick<typeof db, "select" | "insert" | "update" | "delete">;

export type DayContext = {
  schedules: { doctorId: number; weekday: number; startMin: number; endMin: number }[];
  timeOff: { doctorId: number | null; dateFrom: string; dateTo: string; startMin: number | null; endMin: number | null }[];
  busy: { id: number; doctorId: number | null; date: string | null; startMin: number | null; endMin: number | null }[];
};

export function parseSlugs(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function subtract(intervals: Interval[], [s, e]: Interval): Interval[] {
  const out: Interval[] = [];
  for (const [a, b] of intervals) {
    if (e <= a || s >= b) {
      out.push([a, b]);
      continue;
    }
    if (s > a) out.push([a, s]);
    if (e < b) out.push([e, b]);
  }
  return out;
}

export function isDayOff(ctx: DayContext, doctorId: number, date: string) {
  return ctx.timeOff.some(
    (t) => (t.doctorId === null || t.doctorId === doctorId) && date >= t.dateFrom && date <= t.dateTo && (t.startMin == null || t.endMin == null),
  );
}

export function worksOn(ctx: DayContext, doctorId: number, date: string) {
  const wd = weekdayOf(date);
  return ctx.schedules.some((s) => s.doctorId === doctorId && s.weekday === wd) && !isDayOff(ctx, doctorId, date);
}

/** Slobodni intervali doktora za dan (raspored − odsustva − zauzeti termini). */
export function doctorFreeIntervals(ctx: DayContext, doctorId: number, date: string): Interval[] {
  if (isDayOff(ctx, doctorId, date)) return [];
  const wd = weekdayOf(date);
  let intervals: Interval[] = ctx.schedules
    .filter((s) => s.doctorId === doctorId && s.weekday === wd)
    .map((s) => [s.startMin, s.endMin] as Interval);
  for (const t of ctx.timeOff) {
    if (t.doctorId !== null && t.doctorId !== doctorId) continue;
    if (date < t.dateFrom || date > t.dateTo || t.startMin == null || t.endMin == null) continue;
    intervals = subtract(intervals, [t.startMin, t.endMin]);
  }
  for (const a of ctx.busy) {
    if (a.doctorId !== doctorId || a.date !== date || a.startMin == null || a.endMin == null) continue;
    intervals = subtract(intervals, [a.startMin, a.endMin]);
  }
  return intervals;
}

/**
 * Da li u intervalu [start, end) ima slobodna stolica: najveći broj termina koji se
 * u bilo kom trenutku preklapaju mora biti manji od broja stolica.
 */
export function chairsFree(ctx: DayContext, date: string, start: number, end: number, chairs: number = clinic.booking.chairs) {
  const overlapping = ctx.busy.filter(
    (b) => b.date === date && b.startMin != null && b.endMin != null && b.startMin < end && b.endMin > start,
  );
  if (overlapping.length < chairs) return true;
  const points = [start, ...overlapping.map((b) => b.startMin!).filter((p) => p > start && p < end)];
  return points.every((p) => overlapping.filter((b) => b.startMin! <= p && b.endMin! > p).length < chairs);
}

/** Mogući počeci termina (poravnati na korak, npr. svakih 15 min). */
export function slotsFor(intervals: Interval[], duration: number, step: number, minStart = 0): number[] {
  const out: number[] = [];
  for (const [a, b] of intervals) {
    for (let s = Math.ceil(Math.max(a, minStart) / step) * step; s + duration <= b; s += step) out.push(s);
  }
  return out;
}

export async function loadContext(
  doctorIds: number[],
  from: string,
  to: string,
  excludeAppointmentId?: number,
  exec: Executor = db,
): Promise<DayContext> {
  if (doctorIds.length === 0) return { schedules: [], timeOff: [], busy: [] };
  const [sch, off, busy] = await Promise.all([
    exec
      .select({ doctorId: schedules.doctorId, weekday: schedules.weekday, startMin: schedules.startMin, endMin: schedules.endMin })
      .from(schedules)
      .where(inArray(schedules.doctorId, doctorIds)),
    exec
      .select({ doctorId: timeOff.doctorId, dateFrom: timeOff.dateFrom, dateTo: timeOff.dateTo, startMin: timeOff.startMin, endMin: timeOff.endMin })
      .from(timeOff)
      .where(and(lte(timeOff.dateFrom, to), gte(timeOff.dateTo, from), or(isNull(timeOff.doctorId), inArray(timeOff.doctorId, doctorIds)))),
    // Svi termini u periodu (svih doktora) — potrebni i za proveru slobodnih stolica
    exec
      .select({ id: appointments.id, doctorId: appointments.doctorId, date: appointments.date, startMin: appointments.startMin, endMin: appointments.endMin })
      .from(appointments)
      .where(
        and(
          gte(appointments.date, from),
          lte(appointments.date, to),
          inArray(appointments.status, BLOCKING_STATUSES),
          excludeAppointmentId ? ne(appointments.id, excludeAppointmentId) : undefined,
        ),
      ),
  ]);
  return { schedules: sch, timeOff: off, busy };
}

export async function getServiceWithDoctors(serviceId: number) {
  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.active, true)));
  if (!service) return null;
  const slugs = parseSlugs(service.doctorSlugs);
  const docs = slugs.length
    ? await db
        .select()
        .from(doctors)
        .where(and(inArray(doctors.slug, slugs), eq(doctors.active, true)))
        .orderBy(doctors.sortOrder)
    : [];
  return { service, doctors: docs };
}

export type DaySlots = { date: string; open: boolean; slots: { start: number; doctorIds: number[] }[] };

export async function getAvailability(opts: {
  serviceId: number;
  doctorId?: number | null;
  from: string;
  days: number;
  excludeAppointmentId?: number;
  ignoreLeadTime?: boolean;
}): Promise<{ days: DaySlots[]; today: string; horizonEnd: string } | null> {
  const data = await getServiceWithDoctors(opts.serviceId);
  if (!data) return null;
  const docs = opts.doctorId ? data.doctors.filter((d) => d.id === opts.doctorId) : data.doctors;
  const now = nowInClinic();
  const horizonEnd = addDays(now.date, clinic.booking.horizonDays);
  const start = opts.from < now.date ? now.date : opts.from;
  const rawEnd = addDays(start, Math.max(1, Math.min(opts.days, 31)) - 1);
  const end = rawEnd > horizonEnd ? horizonEnd : rawEnd;
  const ids = docs.map((d) => d.id);
  const ctx = await loadContext(ids, start, end, opts.excludeAppointmentId);

  const days: DaySlots[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) {
    const minStart = !opts.ignoreLeadTime && d === now.date ? now.minutes + clinic.booking.minLeadMinutes : 0;
    const map = new Map<number, number[]>();
    for (const doc of docs) {
      for (const s of slotsFor(doctorFreeIntervals(ctx, doc.id, d), data.service.durationMin, clinic.booking.slotStep, minStart)) {
        if (!chairsFree(ctx, d, s, s + data.service.durationMin)) continue;
        const list = map.get(s);
        if (list) list.push(doc.id);
        else map.set(s, [doc.id]);
      }
    }
    days.push({
      date: d,
      open: docs.some((doc) => worksOn(ctx, doc.id, d)),
      slots: [...map.entries()].sort((a, b) => a[0] - b[0]).map(([s, doctorIds]) => ({ start: s, doctorIds })),
    });
  }
  return { days, today: now.date, horizonEnd };
}

/** Prvi slobodan termin za uslugu (za karticu na početnoj strani). */
export async function getNextAvailable(serviceSlug: string) {
  const [svc] = await db.select({ id: services.id }).from(services).where(eq(services.slug, serviceSlug));
  if (!svc) return null;
  const now = nowInClinic();
  for (let i = 0; i < 3; i++) {
    const res = await getAvailability({ serviceId: svc.id, from: addDays(now.date, i * 14), days: 14 });
    if (!res) return null;
    for (const day of res.days) {
      if (day.slots.length) return { date: day.date, start: day.slots[0].start, today: res.today };
    }
  }
  return null;
}
