import "server-only";
import { and, asc, desc, eq, gte, inArray, isNull, lte, or, sql, type AnyColumn, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { appointments, doctors, emailOutbox, patients, payments, schedules, services, timeOff, treatments } from "@/db/schema";
import type { Session } from "@/lib/auth";
import { addDays, monthRange, nowInClinic, shiftMonth } from "@/lib/time";

export async function allDoctors() {
  return db.select().from(doctors).orderBy(asc(doctors.sortOrder));
}

export async function allServices() {
  return db.select().from(services).orderBy(asc(services.sortOrder));
}

const apptFields = {
  id: appointments.id,
  token: appointments.token,
  date: appointments.date,
  startMin: appointments.startMin,
  endMin: appointments.endMin,
  status: appointments.status,
  mode: appointments.mode,
  source: appointments.source,
  locale: appointments.locale,
  patientNote: appointments.patientNote,
  internalNote: appointments.internalNote,
  preferences: appointments.preferences,
  createdAt: appointments.createdAt,
  doctorId: appointments.doctorId,
  patientId: patients.id,
  patientName: patients.fullName,
  patientPhone: patients.phone,
  patientEmail: patients.email,
  guardianName: patients.guardianName,
  serviceId: services.id,
  serviceName: services.nameSr,
  serviceDuration: services.durationMin,
  servicePrice: services.priceFrom,
  servicePriceType: services.priceType,
  doctorName: doctors.name,
  doctorColor: doctors.color,
};

function apptQuery(where?: SQL) {
  return db
    .select(apptFields)
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
    .where(where);
}

export type ApptRow = Awaited<ReturnType<typeof apptQuery>>[number];

export function doctorScope(s: Session) {
  return s.role === "admin" ? undefined : eq(appointments.doctorId, s.id);
}

/** Zahtevi koje doktor vidi: svoji + oni bez izabranog doktora. */
export function pendingScope(s: Session) {
  return s.role === "admin" ? undefined : or(isNull(appointments.doctorId), eq(appointments.doctorId, s.id));
}

export async function pendingCount(s: Session) {
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)` })
    .from(appointments)
    .where(and(eq(appointments.status, "pending"), pendingScope(s)));
  return n;
}

// ——— KPI za period ———
export async function periodKpis(from: string, to: string, doctorId: number | null) {
  const byDoc = <T extends typeof payments.doctorId | typeof treatments.doctorId | typeof appointments.doctorId>(col: T) =>
    doctorId ? eq(col, doctorId) : undefined;

  const [[rev], [chg], statusRows, sourceRows, newPatientsRows] = await Promise.all([
    db
      .select({ v: sql<number>`coalesce(sum(${payments.amount}), 0)` })
      .from(payments)
      .where(and(gte(payments.date, from), lte(payments.date, to), byDoc(payments.doctorId))),
    db
      .select({ v: sql<number>`coalesce(sum(${treatments.total}), 0)` })
      .from(treatments)
      .where(and(gte(treatments.date, from), lte(treatments.date, to), byDoc(treatments.doctorId))),
    db
      .select({ status: appointments.status, n: sql<number>`count(*)` })
      .from(appointments)
      .where(and(gte(appointments.date, from), lte(appointments.date, to), byDoc(appointments.doctorId)))
      .groupBy(appointments.status),
    db
      .select({ source: appointments.source, n: sql<number>`count(*)` })
      .from(appointments)
      .where(and(gte(appointments.date, from), lte(appointments.date, to), byDoc(appointments.doctorId)))
      .groupBy(appointments.source),
    db
      .select({ pid: appointments.patientId })
      .from(appointments)
      .where(and(inArray(appointments.status, ["confirmed", "completed"]), byDoc(appointments.doctorId)))
      .groupBy(appointments.patientId)
      .having(sql`min(${appointments.date}) between ${from} and ${to}`),
  ]);

  const status = Object.fromEntries(statusRows.map((r) => [r.status, r.n])) as Record<string, number>;
  const source = Object.fromEntries(sourceRows.map((r) => [r.source, r.n])) as Record<string, number>;
  const booked = (status.confirmed ?? 0) + (status.completed ?? 0) + (status.no_show ?? 0);
  const totalSource = Object.values(source).reduce((a, b) => a + b, 0);
  return {
    revenue: rev.v,
    charged: chg.v,
    booked,
    completed: status.completed ?? 0,
    noShow: status.no_show ?? 0,
    cancelled: status.cancelled ?? 0,
    upcoming: status.confirmed ?? 0,
    onlineShare: totalSource ? (source.online ?? 0) / totalSource : 0,
    online: source.online ?? 0,
    newPatients: newPatientsRows.length,
  };
}

// Podupiti sa eksplicitnim imenima tabela: kad upit ima samo jednu tabelu, Drizzle izostavlja
// ime tabele ispred kolone, pa bi "id" u podupitu pokazivao na pogrešnu tabelu.
const P_CHARGED = sql<number>`(select coalesce(sum(t.total), 0) from treatments t where t.patient_id = "patients"."id")`;
const P_PAID = sql<number>`(select coalesce(sum(y.amount), 0) from payments y where y.patient_id = "patients"."id")`;

export async function outstanding() {
  // Dva grupisana upita umesto podupita za svakog pacijenta
  const [charged, paidRows] = await Promise.all([
    db.select({ pid: treatments.patientId, v: sql<number>`sum(${treatments.total})` }).from(treatments).groupBy(treatments.patientId),
    db.select({ pid: payments.patientId, v: sql<number>`sum(${payments.amount})` }).from(payments).groupBy(payments.patientId),
  ]);
  const paid = new Map(paidRows.map((r) => [r.pid, r.v]));
  let total = 0;
  let count = 0;
  for (const r of charged) {
    const d = r.v - (paid.get(r.pid) ?? 0);
    if (d > 0) {
      total += d;
      count++;
    }
  }
  return { total, count };
}

/** Kraj uporednog perioda: za tekući mesec poredimo isti broj dana prethodnog meseca. */
export function comparablePrevious(ym: string, today: string) {
  const prev = monthRange(shiftMonth(ym, -1));
  if (today.slice(0, 7) !== ym) return prev;
  const day = Number(today.slice(8, 10));
  return { ...prev, to: addDays(prev.from, Math.min(day, prev.days) - 1) };
}

export async function dashboardData(s: Session) {
  const now = nowInClinic();
  const ym = now.date.slice(0, 7);
  const { from, to } = monthRange(ym);
  const prev = comparablePrevious(ym, now.date);
  const scopeId = s.role === "admin" ? null : s.id;
  const [today, pending, [{ upcoming }], month, prevMonth, debt] = await Promise.all([
    apptQuery(and(eq(appointments.date, now.date), inArray(appointments.status, ["confirmed", "completed", "no_show"]), doctorScope(s))).orderBy(
      asc(appointments.startMin),
    ),
    apptQuery(and(eq(appointments.status, "pending"), pendingScope(s))).orderBy(asc(appointments.createdAt)),
    db
      .select({ upcoming: sql<number>`count(*)` })
      .from(appointments)
      .where(and(eq(appointments.status, "confirmed"), gte(appointments.date, addDays(now.date, 1)), lte(appointments.date, addDays(now.date, 7)), doctorScope(s))),
    periodKpis(from, to, scopeId),
    periodKpis(prev.from, prev.to, scopeId),
    outstanding(),
  ]);
  return { now, today, pending, upcoming, month, prevMonth, debt };
}

/** Termini, rasporedi i odsustva za period — za sve doktore (filtrira se na stranici), u jednom paralelnom krugu. */
export async function calendarData(from: string, to: string) {
  const [items, sch, off] = await Promise.all([
    apptQuery(and(gte(appointments.date, from), lte(appointments.date, to), inArray(appointments.status, ["confirmed", "completed", "no_show"]))),
    db.select().from(schedules),
    db
      .select()
      .from(timeOff)
      .where(and(lte(timeOff.dateFrom, to), gte(timeOff.dateTo, from))),
  ]);
  return { items, sch, off };
}

// ——— Pretraga pacijenata ———
// SQLite „like“ razlikuje č/ć/š/ž/đ od c/s/z/dj i ne pretvara Č u č, a telefon se čuva kao +381641234567,
// dok ga admin prikazuje kao „064 123 4567“. Bez ovoga „jovanovic“ ne nalazi „Jovanović“,
// a ni broj prepisan sa ekrana („064 123 4567“) ne nalazi nikoga.
const FOLD: [string, string][] = [
  ["Č", "c"], ["č", "c"], ["Ć", "c"], ["ć", "c"], ["Š", "s"], ["š", "s"],
  ["Ž", "z"], ["ž", "z"], ["Đ", "dj"], ["đ", "dj"],
];

function foldText(v: string) {
  let out = v.toLocaleLowerCase("sr");
  for (const [from, to] of FOLD) out = out.split(from.toLocaleLowerCase("sr")).join(to);
  return out.replace(/\s+/g, " ").trim();
}

function foldColumn(col: AnyColumn) {
  let expr: SQL = sql`coalesce(${col}, '')`;
  for (const [from, to] of FOLD) expr = sql`replace(${expr}, ${from}, ${to})`;
  return sql`lower(${expr})`;
}

export function patientSearch(q: string): SQL | undefined {
  const text = foldText(q);
  if (!text) return undefined;
  const like = `%${text}%`;
  const conds: SQL[] = [
    sql`${foldColumn(patients.fullName)} like ${like}`,
    sql`${foldColumn(patients.guardianName)} like ${like}`,
    sql`${foldColumn(patients.email)} like ${like}`,
  ];
  // Broj telefona u bilo kom obliku: „064 123 4567“, „0641234567“, „+381 64 123…“, deo broja
  if (/^[\d\s+\-()./]+$/.test(q.trim())) {
    const core = q.replace(/\D/g, "").replace(/^00/, "").replace(/^381/, "").replace(/^0/, "");
    if (core.length >= 3) conds.push(sql`${patients.phone} like ${`%${core}%`}`);
  }
  return or(...conds);
}

export type ListFilter = "upcoming" | "today" | "pending" | "past" | "cancelled" | "all";

export async function listAppointments(s: Session, filter: ListFilter, q: string, doctorId: number | null) {
  const now = nowInClinic();
  const conds: (SQL | undefined)[] = [filter === "pending" ? pendingScope(s) : doctorScope(s)];
  if (doctorId && s.role === "admin") conds.push(eq(appointments.doctorId, doctorId));
  if (q) conds.push(patientSearch(q));
  let order = [asc(appointments.date), asc(appointments.startMin)];
  switch (filter) {
    case "upcoming":
      conds.push(eq(appointments.status, "confirmed"), gte(appointments.date, now.date));
      break;
    case "today":
      conds.push(eq(appointments.date, now.date), inArray(appointments.status, ["confirmed", "completed", "no_show"]));
      break;
    case "pending":
      conds.push(eq(appointments.status, "pending"));
      order = [asc(appointments.createdAt)];
      break;
    case "past":
      conds.push(sql`${appointments.date} < ${now.date}`, inArray(appointments.status, ["completed", "no_show", "confirmed"]));
      order = [desc(appointments.date), desc(appointments.startMin)];
      break;
    case "cancelled":
      conds.push(eq(appointments.status, "cancelled"));
      order = [desc(appointments.date)];
      break;
    default:
      order = [desc(appointments.date), desc(appointments.startMin)];
  }
  return apptQuery(and(...conds))
    .orderBy(...order)
    .limit(300);
}

export async function appointmentDetail(id: number) {
  // Sve u jednom paralelnom krugu: pacijent za saldo se nalazi podupitom, bez čekanja na prvi upit
  const pid = sql`(select a.patient_id from appointments a where a.id = ${id})`;
  const [[appt], tr, pay, [c], [p]] = await Promise.all([
    apptQuery(eq(appointments.id, id)),
    db
      .select({ t: treatments, doctorName: doctors.name })
      .from(treatments)
      .leftJoin(doctors, eq(treatments.doctorId, doctors.id))
      .where(eq(treatments.appointmentId, id))
      .orderBy(asc(treatments.id)),
    db.select().from(payments).where(eq(payments.appointmentId, id)).orderBy(asc(payments.id)),
    db.select({ v: sql<number>`coalesce(sum(${treatments.total}), 0)` }).from(treatments).where(sql`${treatments.patientId} = ${pid}`),
    db.select({ v: sql<number>`coalesce(sum(${payments.amount}), 0)` }).from(payments).where(sql`${payments.patientId} = ${pid}`),
  ]);
  if (!appt) return null;
  return { appt, treatments: tr, payments: pay, balance: { charged: c.v, paid: p.v, debt: c.v - p.v } };
}

export async function patientBalance(patientId: number) {
  const [[c], [p]] = await Promise.all([
    db.select({ v: sql<number>`coalesce(sum(${treatments.total}), 0)` }).from(treatments).where(eq(treatments.patientId, patientId)),
    db.select({ v: sql<number>`coalesce(sum(${payments.amount}), 0)` }).from(payments).where(eq(payments.patientId, patientId)),
  ]);
  return { charged: c.v, paid: p.v, debt: c.v - p.v };
}

export async function listPatients(q: string) {
  const now = nowInClinic();
  return db
    .select({
      id: patients.id,
      fullName: patients.fullName,
      phone: patients.phone,
      email: patients.email,
      guardianName: patients.guardianName,
      source: patients.source,
      charged: P_CHARGED,
      paid: P_PAID,
      lastVisit: sql<string | null>`(select max(a.date) from appointments a where a.patient_id = "patients"."id" and a.status = 'completed')`,
      nextVisit: sql<string | null>`(select min(a.date) from appointments a where a.patient_id = "patients"."id" and a.status = 'confirmed' and a.date >= ${now.date})`,
      visits: sql<number>`(select count(*) from appointments a where a.patient_id = "patients"."id" and a.status = 'completed')`,
    })
    .from(patients)
    .where(q ? patientSearch(q) : undefined)
    .orderBy(asc(patients.fullName))
    .limit(300);
}

export async function patientDetail(id: number) {
  const [[p], appts, tr, pay, balance] = await Promise.all([
    db.select().from(patients).where(eq(patients.id, id)),
    apptQuery(eq(appointments.patientId, id)).orderBy(desc(appointments.date), desc(appointments.startMin)),
    db.select().from(treatments).where(eq(treatments.patientId, id)).orderBy(desc(treatments.date), desc(treatments.id)),
    db.select().from(payments).where(eq(payments.patientId, id)).orderBy(desc(payments.date), desc(payments.id)),
    patientBalance(id),
  ]);
  if (!p) return null;
  return { patient: p, appts, treatments: tr, payments: pay, balance };
}

export async function reportData(ym: string, doctorId: number | null) {
  const { from, to, days } = monthRange(ym);
  const prev = comparablePrevious(ym, nowInClinic().date);
  const payDoc = doctorId ? eq(payments.doctorId, doctorId) : undefined;
  const trDoc = doctorId ? eq(treatments.doctorId, doctorId) : undefined;

  const [cur, prv, dailyRows, byDoctor, byService, byMethod] = await Promise.all([
    periodKpis(from, to, doctorId),
    periodKpis(prev.from, prev.to, doctorId),
    db
      .select({ date: payments.date, total: sql<number>`sum(${payments.amount})` })
      .from(payments)
      .where(and(gte(payments.date, from), lte(payments.date, to), payDoc))
      .groupBy(payments.date),
    db
      .select({ doctorId: payments.doctorId, total: sql<number>`sum(${payments.amount})`, n: sql<number>`count(*)` })
      .from(payments)
      .where(and(gte(payments.date, from), lte(payments.date, to), payDoc))
      .groupBy(payments.doctorId),
    db
      .select({ name: sql<string>`coalesce(${services.nameSr}, ${treatments.description})`, n: sql<number>`sum(${treatments.quantity})`, total: sql<number>`sum(${treatments.total})` })
      .from(treatments)
      .leftJoin(services, eq(treatments.serviceId, services.id))
      .where(and(gte(treatments.date, from), lte(treatments.date, to), trDoc))
      .groupBy(sql`coalesce(${services.nameSr}, ${treatments.description})`)
      .orderBy(desc(sql`sum(${treatments.total})`))
      .limit(10),
    db
      .select({ method: payments.method, total: sql<number>`sum(${payments.amount})` })
      .from(payments)
      .where(and(gte(payments.date, from), lte(payments.date, to), payDoc))
      .groupBy(payments.method),
  ]);

  const map = new Map(dailyRows.map((r) => [r.date, r.total]));
  const daily = Array.from({ length: days }, (_, i) => {
    const date = addDays(from, i);
    return { date, value: map.get(date) ?? 0 };
  });
  return { from, to, cur, prv, daily, byDoctor, byService, byMethod };
}

export async function outboxList(limit = 100) {
  return db.select().from(emailOutbox).orderBy(desc(emailOutbox.id)).limit(limit);
}

export async function scheduleRows() {
  return db.select().from(schedules).orderBy(asc(schedules.doctorId), asc(schedules.weekday));
}

export async function timeOffRows() {
  const now = nowInClinic();
  return db
    .select({ t: timeOff, doctorName: doctors.name })
    .from(timeOff)
    .leftJoin(doctors, eq(timeOff.doctorId, doctors.id))
    .where(gte(timeOff.dateTo, now.date))
    .orderBy(asc(timeOff.dateFrom));
}
