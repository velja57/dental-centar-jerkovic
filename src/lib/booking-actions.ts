"use server";

import { randomBytes } from "node:crypto";
import { and, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { appointments, doctors, patients, services } from "@/db/schema";
import { clinic } from "@/content/clinic";
import { chairsFree, doctorFreeIntervals, loadContext, parseSlugs, slotsFor, type Executor } from "@/lib/availability";
import { notifyAppointment } from "@/lib/notifications";
import { normalizePhone } from "@/lib/phone";
import { addDays, isValidDate, minutesUntil, nowInClinic } from "@/lib/time";

const bookingSchema = z.object({
  locale: z.enum(["sr", "en"]),
  serviceId: z.number().int().positive(),
  doctorId: z.number().int().positive().nullable(),
  date: z.string().nullable(),
  start: z.number().int().min(0).max(1440).nullable(),
  preferences: z
    .object({
      dates: z.array(z.string()).max(3),
      timeOfDay: z.enum(["morning", "afternoon", "any"]),
    })
    .nullable(),
  forChild: z.boolean(),
  fullName: z.string().trim().min(3).max(100),
  guardianName: z.string().trim().max(100).default(""),
  phone: z.string().trim().min(6).max(30),
  email: z
    .string()
    .trim()
    .max(120)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/),
  note: z.string().trim().max(1000).default(""),
  consent: z.literal(true),
  website: z.string().default(""), // zamka za botove (skriveno polje)
});

export type BookingInput = z.input<typeof bookingSchema>;
export type BookingResult =
  | { ok: true; token: string; status: "confirmed" | "pending"; doctorId: number | null; emailed: boolean }
  | { ok: false; error: "validation" | "slot_taken" | "too_many" | "generic"; field?: string };

async function findOrCreatePatient(
  exec: Executor,
  p: { fullName: string; phone: string; email: string; guardianName: string | null },
) {
  const candidates = await exec.select().from(patients).where(eq(patients.phone, p.phone));
  const norm = (s: string) => s.toLocaleLowerCase("sr").replace(/\s+/g, " ").trim();
  const match = candidates.find((c) => norm(c.fullName) === norm(p.fullName));
  if (match) {
    await exec
      .update(patients)
      .set({ email: p.email || match.email, guardianName: p.guardianName || match.guardianName })
      .where(eq(patients.id, match.id));
    return match.id;
  }
  const [row] = await exec
    .insert(patients)
    .values({ fullName: p.fullName, phone: p.phone, email: p.email || null, guardianName: p.guardianName, source: "online" })
    .returning({ id: patients.id });
  return row.id;
}

export async function createBooking(raw: BookingInput): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "validation", field: String(parsed.error.issues[0]?.path[0] ?? "") };
  }
  const input = parsed.data;
  if (input.website) return { ok: false, error: "generic" };
  if (input.forChild && input.guardianName.length < 3) return { ok: false, error: "validation", field: "guardianName" };

  const phone = normalizePhone(input.phone);
  if (!phone) return { ok: false, error: "validation", field: "phone" };

  try {
    const [svc] = await db
      .select()
      .from(services)
      .where(and(eq(services.id, input.serviceId), eq(services.active, true)));
    if (!svc) return { ok: false, error: "generic" };

    const now = nowInClinic();
    const horizonEnd = addDays(now.date, clinic.booking.horizonDays);

    // Zaštita od zloupotrebe: ograničen broj aktivnih termina po broju telefona
    const [{ active }] = await db
      .select({ active: sql<number>`count(*)` })
      .from(appointments)
      .innerJoin(patients, eq(appointments.patientId, patients.id))
      .where(
        and(
          eq(patients.phone, phone),
          inArray(appointments.status, ["pending", "confirmed"]),
          sql`(${appointments.date} is null or ${appointments.date} >= ${now.date})`,
        ),
      );
    if (active >= clinic.booking.maxActivePerPhone) return { ok: false, error: "too_many" };

    const allowed = await db
      .select()
      .from(doctors)
      .where(and(inArray(doctors.slug, parseSlugs(svc.doctorSlugs)), eq(doctors.active, true)))
      .orderBy(doctors.sortOrder);
    if (allowed.length === 0) return { ok: false, error: "generic" };
    if (input.doctorId && !allowed.some((d) => d.id === input.doctorId)) return { ok: false, error: "validation", field: "doctorId" };

    const token = randomBytes(18).toString("base64url");
    const patientData = {
      fullName: input.fullName,
      phone,
      email: input.email,
      guardianName: input.forChild ? input.guardianName : null,
    };
    const note = input.note || null;

    if (svc.bookingMode === "instant") {
      const date = input.date;
      const start = input.start;
      if (!isValidDate(date) || start == null) return { ok: false, error: "validation", field: "date" };
      if (date < now.date || date > horizonEnd) return { ok: false, error: "slot_taken" };
      if (date === now.date && start < now.minutes + clinic.booking.minLeadMinutes) return { ok: false, error: "slot_taken" };

      const candidates = input.doctorId ? allowed.filter((d) => d.id === input.doctorId) : allowed;
      const result = await db.transaction(async (tx) => {
        const ctx = await loadContext(candidates.map((d) => d.id), date, date, undefined, tx);
        const load = (id: number) => ctx.busy.filter((b) => b.doctorId === id).length;
        if (!chairsFree(ctx, date, start, start + svc.durationMin)) return null;
        const free = candidates
          .filter((d) => slotsFor(doctorFreeIntervals(ctx, d.id, date), svc.durationMin, clinic.booking.slotStep).includes(start))
          .sort((a, b) => load(a.id) - load(b.id));
        if (free.length === 0) return null;
        const doctor = free[0];
        const patientId = await findOrCreatePatient(tx, patientData);
        const [row] = await tx
          .insert(appointments)
          .values({
            token,
            patientId,
            serviceId: svc.id,
            doctorId: doctor.id,
            date,
            startMin: start,
            endMin: start + svc.durationMin,
            status: "confirmed",
            mode: "instant",
            source: "online",
            locale: input.locale,
            patientNote: note,
          })
          .returning({ id: appointments.id });
        return { id: row.id, doctorId: doctor.id };
      });
      if (!result) return { ok: false, error: "slot_taken" };
      const sent = await notifyAppointment(result.id, "confirmed", { clinic: true });
      return { ok: true, token, status: "confirmed", doctorId: result.doctorId, emailed: sent.patientEmailSent };
    }

    // Usluga na upit: čuvamo željene dane, ordinacija predlaže termin
    const prefs = input.preferences;
    const dates = (prefs?.dates ?? []).filter((d) => isValidDate(d) && d >= now.date && d <= horizonEnd);
    if (!prefs || dates.length === 0) return { ok: false, error: "validation", field: "preferences" };
    const id = await db.transaction(async (tx) => {
      const patientId = await findOrCreatePatient(tx, patientData);
      const [row] = await tx
        .insert(appointments)
        .values({
          token,
          patientId,
          serviceId: svc.id,
          doctorId: input.doctorId,
          status: "pending",
          mode: "request",
          source: "online",
          locale: input.locale,
          patientNote: note,
          preferences: JSON.stringify({ dates, timeOfDay: prefs.timeOfDay }),
        })
        .returning({ id: appointments.id });
      return row.id;
    });
    const sent = await notifyAppointment(id, "request_received", { clinic: true });
    return { ok: true, token, status: "pending", doctorId: input.doctorId, emailed: sent.patientEmailSent };
  } catch (e) {
    console.error("createBooking", e);
    return { ok: false, error: "generic" };
  }
}

export async function cancelBooking(token: string): Promise<{ ok: true } | { ok: false; error: "not_found" | "too_late" | "generic" }> {
  try {
    const [a] = await db.select().from(appointments).where(eq(appointments.token, String(token)));
    if (!a) return { ok: false, error: "not_found" };
    if (a.status !== "confirmed" && a.status !== "pending") return { ok: false, error: "generic" };
    if (a.status === "confirmed" && a.date && a.startMin != null && minutesUntil(a.date, a.startMin) < clinic.booking.cancelHours * 60) {
      return { ok: false, error: "too_late" };
    }
    const nowIso = new Date().toISOString();
    await db
      .update(appointments)
      .set({ status: "cancelled", cancelledBy: "patient", cancelledAt: nowIso, updatedAt: nowIso })
      .where(eq(appointments.id, a.id));
    await notifyAppointment(a.id, "cancelled_patient", { clinic: true });
    return { ok: true };
  } catch (e) {
    console.error("cancelBooking", e);
    return { ok: false, error: "generic" };
  }
}

export async function rescheduleBooking(input: {
  token: string;
  date: string;
  start: number;
  doctorId?: number | null;
}): Promise<{ ok: true; emailed: boolean } | { ok: false; error: "not_found" | "too_late" | "slot_taken" | "generic" }> {
  try {
    const [a] = await db.select().from(appointments).where(eq(appointments.token, String(input.token)));
    if (!a) return { ok: false, error: "not_found" };
    if (a.status !== "confirmed" || !a.date || a.startMin == null) return { ok: false, error: "generic" };
    if (minutesUntil(a.date, a.startMin) < clinic.booking.cancelHours * 60) return { ok: false, error: "too_late" };

    const date = input.date;
    const start = Number(input.start);
    const now = nowInClinic();
    if (!isValidDate(date) || !Number.isInteger(start)) return { ok: false, error: "generic" };
    if (date < now.date || date > addDays(now.date, clinic.booking.horizonDays)) return { ok: false, error: "slot_taken" };
    if (date === now.date && start < now.minutes + clinic.booking.minLeadMinutes) return { ok: false, error: "slot_taken" };

    const [svc] = await db.select().from(services).where(eq(services.id, a.serviceId));
    if (!svc) return { ok: false, error: "generic" };
    const allowed = await db
      .select()
      .from(doctors)
      .where(and(inArray(doctors.slug, parseSlugs(svc.doctorSlugs)), eq(doctors.active, true)));
    const candidates = input.doctorId ? allowed.filter((d) => d.id === input.doctorId) : allowed;

    const ok = await db.transaction(async (tx) => {
      const ctx = await loadContext(candidates.map((d) => d.id), date, date, a.id, tx);
      if (!chairsFree(ctx, date, start, start + svc.durationMin)) return false;
      const free = candidates.filter((d) =>
        slotsFor(doctorFreeIntervals(ctx, d.id, date), svc.durationMin, clinic.booking.slotStep).includes(start),
      );
      if (free.length === 0) return false;
      const doctor = free.find((d) => d.id === a.doctorId) ?? free[0];
      await tx
        .update(appointments)
        .set({
          date,
          startMin: start,
          endMin: start + svc.durationMin,
          doctorId: doctor.id,
          reminderSentAt: null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(appointments.id, a.id));
      return true;
    });
    if (!ok) return { ok: false, error: "slot_taken" };
    const sent = await notifyAppointment(a.id, "rescheduled", { clinic: true });
    return { ok: true, emailed: sent.patientEmailSent };
  } catch (e) {
    console.error("rescheduleBooking", e);
    return { ok: false, error: "generic" };
  }
}
