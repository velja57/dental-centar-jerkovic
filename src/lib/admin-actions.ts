"use server";

import { randomBytes } from "node:crypto";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { appointments, doctors, emailOutbox, patients, payments, schedules, services, timeOff, treatments } from "@/db/schema";
import { BLOCKING_STATUSES, chairsFree } from "@/lib/availability";
import { endSession, requireAdmin, requireSession, startSession, type Session } from "@/lib/auth";
import { runDailyJobs } from "@/lib/daily-jobs";
import { notifyAppointment } from "@/lib/notifications";
import { hashPassword, verifyPassword } from "@/lib/password";
import { normalizePhone } from "@/lib/phone";
import { isValidDate, isValidTime, minToTime, nowInClinic, timeToMin } from "@/lib/time";

export type FormState = { ok?: boolean; error?: string; message?: string };

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};
const num = (fd: FormData, k: string) => {
  const raw = str(fd, k).replace(/\./g, "").replace(",", ".");
  if (raw === "") return NaN;
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
};
const nowIso = () => new Date().toISOString();

function revalidateAdmin() {
  revalidatePath("/admin", "layout");
}

function canEdit(s: Session, doctorId: number | null) {
  return s.role === "admin" || doctorId === null || doctorId === s.id;
}

async function findConflict(doctorId: number, date: string, start: number, end: number, excludeId?: number) {
  const rows = await db
    .select({ id: appointments.id, doctorId: appointments.doctorId, startMin: appointments.startMin, endMin: appointments.endMin, name: patients.fullName })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .where(
      and(
        eq(appointments.date, date),
        inArray(appointments.status, BLOCKING_STATUSES),
        excludeId ? ne(appointments.id, excludeId) : undefined,
      ),
    );
  const hit = rows.find((r) => r.doctorId === doctorId && r.startMin != null && r.endMin != null && start < r.endMin && end > r.startMin);
  if (hit) return `Preklapa se sa terminom ${minToTime(hit.startMin!)}–${minToTime(hit.endMin!)} (${hit.name}).`;
  const ctx = { schedules: [], timeOff: [], busy: rows.map((r) => ({ ...r, date })) };
  if (!chairsFree(ctx, date, start, end)) return `U to vreme su zauzete obe stolice.`;
  return null;
}

// ——— Prijava ———

export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const username = str(fd, "username").toLowerCase();
  const password = str(fd, "password");
  const [d] = await db.select().from(doctors).where(eq(doctors.username, username));
  if (!d || !d.active || !verifyPassword(password, d.passwordHash)) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Pogrešno korisničko ime ili lozinka." };
  }
  await startSession(d.id);
  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}

export async function changePasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const s = await requireSession();
  const current = str(fd, "current");
  const next = str(fd, "next");
  const repeat = str(fd, "repeat");
  const [d] = await db.select().from(doctors).where(eq(doctors.id, s.id));
  if (!d || !verifyPassword(current, d.passwordHash)) return { error: "Trenutna lozinka nije tačna." };
  if (next.length < 8) return { error: "Nova lozinka mora imati bar 8 znakova." };
  if (next !== repeat) return { error: "Nove lozinke se ne poklapaju." };
  await db.update(doctors).set({ passwordHash: hashPassword(next) }).where(eq(doctors.id, s.id));
  return { ok: true, message: "Lozinka je promenjena." };
}

// ——— Termini ———

export async function setStatusAction(fd: FormData) {
  const s = await requireSession();
  const id = num(fd, "id");
  const status = str(fd, "status");
  if (!["completed", "no_show", "cancelled", "confirmed"].includes(status)) return;
  const [a] = await db.select().from(appointments).where(eq(appointments.id, id));
  if (!a || !canEdit(s, a.doctorId)) return;
  if (status === "confirmed" && (!a.date || a.startMin == null)) return;
  await db
    .update(appointments)
    .set({
      status,
      cancelledBy: status === "cancelled" ? "clinic" : a.cancelledBy,
      cancelledAt: status === "cancelled" ? nowIso() : a.cancelledAt,
      updatedAt: nowIso(),
    })
    .where(eq(appointments.id, id));
  if (status === "cancelled" && str(fd, "notify") === "1") await notifyAppointment(id, "cancelled_clinic");
  revalidateAdmin();
}

/** Zakazivanje zahteva na upit ili pomeranje postojećeg termina. */
export async function scheduleAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const s = await requireSession();
  const id = num(fd, "id");
  const date = str(fd, "date");
  const time = str(fd, "time");
  const doctorId = num(fd, "doctorId");
  const duration = num(fd, "duration");
  const force = str(fd, "force") === "1";
  const notify = str(fd, "notify") === "1";
  if (!isValidDate(date) || !isValidTime(time)) return { error: "Unesite ispravan datum i vreme." };
  if (!Number.isInteger(doctorId)) return { error: "Izaberite doktora." };
  const [a] = await db.select().from(appointments).where(eq(appointments.id, id));
  if (!a) return { error: "Termin nije pronađen." };
  if (!canEdit(s, a.doctorId) || (s.role !== "admin" && doctorId !== s.id)) return { error: "Nemate dozvolu za ovu izmenu." };
  const [svc] = await db.select().from(services).where(eq(services.id, a.serviceId));
  const start = timeToMin(time);
  const end = start + (duration > 0 ? Math.round(duration) : (svc?.durationMin ?? 30));
  if (!force) {
    const conflict = await findConflict(doctorId, date, start, end, id);
    if (conflict) return { error: `${conflict} Označite „Zakaži uprkos preklapanju“ ako ste sigurni.` };
  }
  const wasPending = a.status === "pending";
  await db
    .update(appointments)
    .set({ date, startMin: start, endMin: end, doctorId, status: "confirmed", reminderSentAt: null, updatedAt: nowIso() })
    .where(eq(appointments.id, id));
  if (notify) await notifyAppointment(id, wasPending ? "request_confirmed" : "rescheduled");
  revalidateAdmin();
  return { ok: true, message: wasPending ? "Termin je zakazan." : "Termin je pomeren." };
}

export async function createAppointmentAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const s = await requireSession();
  let patientId = num(fd, "patientId");
  const serviceId = num(fd, "serviceId");
  const doctorId = num(fd, "doctorId");
  const date = str(fd, "date");
  const time = str(fd, "time");
  const duration = num(fd, "duration");
  const force = str(fd, "force") === "1";
  const notify = str(fd, "notify") === "1";

  if (!Number.isInteger(serviceId)) return { error: "Izaberite uslugu." };
  if (!Number.isInteger(doctorId)) return { error: "Izaberite doktora." };
  if (s.role !== "admin" && doctorId !== s.id) return { error: "Možete zakazivati samo u svom kalendaru." };
  if (!isValidDate(date) || !isValidTime(time)) return { error: "Unesite ispravan datum i vreme." };
  const [svc] = await db.select().from(services).where(eq(services.id, serviceId));
  if (!svc) return { error: "Usluga nije pronađena." };

  if (!Number.isInteger(patientId)) {
    const fullName = str(fd, "fullName");
    const phone = normalizePhone(str(fd, "phone"));
    const email = str(fd, "email");
    if (fullName.length < 3) return { error: "Unesite ime i prezime pacijenta (ili izaberite postojećeg)." };
    if (!phone) return { error: "Unesite ispravan broj telefona." };
    const [row] = await db
      .insert(patients)
      .values({ fullName, phone, email: email || null, guardianName: str(fd, "guardianName") || null, source: "phone" })
      .returning({ id: patients.id });
    patientId = row.id;
  }

  const start = timeToMin(time);
  const end = start + (duration > 0 ? Math.round(duration) : svc.durationMin);
  if (!force) {
    const conflict = await findConflict(doctorId, date, start, end);
    if (conflict) return { error: `${conflict} Označite „Zakaži uprkos preklapanju“ ako ste sigurni.` };
  }
  const [row] = await db
    .insert(appointments)
    .values({
      token: randomBytes(18).toString("base64url"),
      patientId,
      serviceId,
      doctorId,
      date,
      startMin: start,
      endMin: end,
      status: "confirmed",
      mode: "instant",
      source: "phone",
      locale: "sr",
      internalNote: str(fd, "internalNote") || null,
    })
    .returning({ id: appointments.id });
  if (notify) await notifyAppointment(row.id, "confirmed");
  revalidateAdmin();
  redirect(`/admin/termini/${row.id}?novo=1`);
}

export async function updateInternalNoteAction(fd: FormData) {
  const s = await requireSession();
  const id = num(fd, "id");
  const [a] = await db.select().from(appointments).where(eq(appointments.id, id));
  if (!a || !canEdit(s, a.doctorId)) return;
  await db
    .update(appointments)
    .set({ internalNote: str(fd, "internalNote") || null, updatedAt: nowIso() })
    .where(eq(appointments.id, id));
  revalidateAdmin();
}

// ——— Radovi i uplate ———

export async function addTreatmentAction(fd: FormData) {
  const s = await requireSession();
  const patientId = num(fd, "patientId");
  const appointmentId = num(fd, "appointmentId");
  const serviceId = num(fd, "serviceId");
  const quantity = Math.max(1, Math.round(num(fd, "quantity") || 1));
  const unitPrice = Math.max(0, Math.round(num(fd, "unitPrice") || 0));
  const discountPct = Math.min(100, Math.max(0, Math.round(num(fd, "discountPct") || 0)));
  const date = isValidDate(str(fd, "date")) ? str(fd, "date") : nowInClinic().date;
  let description = str(fd, "description");
  if (!Number.isInteger(patientId)) return;
  if (!description && Number.isInteger(serviceId)) {
    const [svc] = await db.select({ name: services.nameSr }).from(services).where(eq(services.id, serviceId));
    description = svc?.name ?? "";
  }
  if (!description) return;
  await db.insert(treatments).values({
    patientId,
    appointmentId: Number.isInteger(appointmentId) ? appointmentId : null,
    doctorId: s.id,
    serviceId: Number.isInteger(serviceId) ? serviceId : null,
    description,
    tooth: str(fd, "tooth") || null,
    quantity,
    unitPrice,
    discountPct,
    total: Math.round(unitPrice * quantity * (1 - discountPct / 100)),
    date,
  });
  revalidateAdmin();
}

export async function deleteTreatmentAction(fd: FormData) {
  const s = await requireSession();
  const id = num(fd, "id");
  const [row] = await db.select().from(treatments).where(eq(treatments.id, id));
  if (!row || !(s.role === "admin" || row.doctorId === s.id)) return;
  await db.delete(treatments).where(eq(treatments.id, id));
  revalidateAdmin();
}

export async function addPaymentAction(fd: FormData) {
  const s = await requireSession();
  const patientId = num(fd, "patientId");
  const appointmentId = num(fd, "appointmentId");
  const amount = Math.round(num(fd, "amount"));
  const method = str(fd, "method");
  const date = isValidDate(str(fd, "date")) ? str(fd, "date") : nowInClinic().date;
  if (!Number.isInteger(patientId) || !(amount > 0) || !["gotovina", "kartica", "rate", "prenos"].includes(method)) return;
  await db.insert(payments).values({
    patientId,
    appointmentId: Number.isInteger(appointmentId) ? appointmentId : null,
    doctorId: s.id,
    amount,
    method,
    date,
    note: str(fd, "note") || null,
  });
  revalidateAdmin();
}

export async function deletePaymentAction(fd: FormData) {
  const s = await requireSession();
  const id = num(fd, "id");
  const [row] = await db.select().from(payments).where(eq(payments.id, id));
  if (!row || !(s.role === "admin" || row.doctorId === s.id)) return;
  await db.delete(payments).where(eq(payments.id, id));
  revalidateAdmin();
}

// ——— Pacijenti ———

export async function createPatientAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireSession();
  const fullName = str(fd, "fullName");
  const phone = normalizePhone(str(fd, "phone"));
  if (fullName.length < 3) return { error: "Unesite ime i prezime." };
  if (!phone) return { error: "Unesite ispravan broj telefona." };
  const birthYear = num(fd, "birthYear");
  const [row] = await db
    .insert(patients)
    .values({
      fullName,
      phone,
      email: str(fd, "email") || null,
      guardianName: str(fd, "guardianName") || null,
      birthYear: Number.isInteger(birthYear) ? birthYear : null,
      note: str(fd, "note") || null,
      source: "admin",
    })
    .returning({ id: patients.id });
  revalidateAdmin();
  redirect(`/admin/pacijenti/${row.id}`);
}

export async function updatePatientAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireSession();
  const id = num(fd, "id");
  const fullName = str(fd, "fullName");
  const phone = normalizePhone(str(fd, "phone"));
  if (fullName.length < 3) return { error: "Unesite ime i prezime." };
  if (!phone) return { error: "Unesite ispravan broj telefona." };
  const birthYear = num(fd, "birthYear");
  await db
    .update(patients)
    .set({
      fullName,
      phone,
      email: str(fd, "email") || null,
      guardianName: str(fd, "guardianName") || null,
      birthYear: Number.isInteger(birthYear) ? birthYear : null,
      note: str(fd, "note") || null,
    })
    .where(eq(patients.id, id));
  revalidateAdmin();
  return { ok: true, message: "Sačuvano." };
}

// ——— Podešavanja ———

export async function updateServiceAction(fd: FormData) {
  await requireAdmin();
  const id = num(fd, "id");
  const priceType = str(fd, "priceType");
  const priceTo = num(fd, "priceTo");
  const docs = fd.getAll("doctorSlugs").filter((v): v is string => typeof v === "string");
  await db
    .update(services)
    .set({
      nameSr: str(fd, "nameSr"),
      nameEn: str(fd, "nameEn"),
      durationMin: Math.max(5, Math.round(num(fd, "durationMin") || 30)),
      priceType: ["fixed", "from", "range", "free", "request"].includes(priceType) ? priceType : "fixed",
      priceFrom: Math.max(0, Math.round(num(fd, "priceFrom") || 0)),
      priceTo: Number.isFinite(priceTo) && priceTo > 0 ? Math.round(priceTo) : null,
      bookingMode: str(fd, "bookingMode") === "request" ? "request" : "instant",
      popular: str(fd, "popular") === "1",
      active: str(fd, "active") === "1",
      doctorSlugs: JSON.stringify(docs),
    })
    .where(eq(services.id, id));
  revalidatePath("/", "layout");
}

export async function createServiceAction(fd: FormData) {
  await requireAdmin();
  const nameSr = str(fd, "nameSr");
  const category = str(fd, "category");
  if (nameSr.length < 3 || !category) return;
  const slug =
    nameSr
      .toLowerCase()
      .replace(/[čć]/g, "c")
      .replace(/đ/g, "dj")
      .replace(/š/g, "s")
      .replace(/ž/g, "z")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    randomBytes(2).toString("hex");
  const [{ maxOrder }] = await db.select({ maxOrder: sql<number>`coalesce(max(${services.sortOrder}), 0)` }).from(services);
  await db.insert(services).values({
    slug,
    category,
    nameSr,
    nameEn: str(fd, "nameEn") || nameSr,
    durationMin: Math.max(5, Math.round(num(fd, "durationMin") || 30)),
    priceType: "fixed",
    priceFrom: Math.max(0, Math.round(num(fd, "priceFrom") || 0)),
    bookingMode: str(fd, "bookingMode") === "request" ? "request" : "instant",
    doctorSlugs: JSON.stringify(fd.getAll("doctorSlugs").filter((v): v is string => typeof v === "string")),
    sortOrder: maxOrder + 1,
  });
  revalidatePath("/", "layout");
}

export async function saveScheduleAction(fd: FormData) {
  const s = await requireSession();
  const doctorId = num(fd, "doctorId");
  if (!Number.isInteger(doctorId) || (s.role !== "admin" && doctorId !== s.id)) return;
  const rows: { doctorId: number; weekday: number; startMin: number; endMin: number }[] = [];
  for (let wd = 0; wd < 7; wd++) {
    if (str(fd, `on_${wd}`) !== "1") continue;
    const from = str(fd, `from_${wd}`);
    const to = str(fd, `to_${wd}`);
    if (!isValidTime(from) || !isValidTime(to) || timeToMin(to) <= timeToMin(from)) continue;
    rows.push({ doctorId, weekday: wd, startMin: timeToMin(from), endMin: timeToMin(to) });
  }
  await db.transaction(async (tx) => {
    await tx.delete(schedules).where(eq(schedules.doctorId, doctorId));
    if (rows.length) await tx.insert(schedules).values(rows);
  });
  revalidateAdmin();
}

export async function addTimeOffAction(fd: FormData) {
  const s = await requireSession();
  const who = str(fd, "doctorId");
  const doctorId = who === "all" ? null : Number(who);
  if (doctorId === null ? s.role !== "admin" : !Number.isInteger(doctorId) || (s.role !== "admin" && doctorId !== s.id)) return;
  const dateFrom = str(fd, "dateFrom");
  const dateTo = str(fd, "dateTo") || dateFrom;
  if (!isValidDate(dateFrom) || !isValidDate(dateTo) || dateTo < dateFrom) return;
  const from = str(fd, "from");
  const to = str(fd, "to");
  const partial = dateFrom === dateTo && isValidTime(from) && isValidTime(to) && timeToMin(to) > timeToMin(from);
  await db.insert(timeOff).values({
    doctorId,
    dateFrom,
    dateTo,
    startMin: partial ? timeToMin(from) : null,
    endMin: partial ? timeToMin(to) : null,
    reason: str(fd, "reason") || null,
  });
  revalidateAdmin();
}

export async function deleteTimeOffAction(fd: FormData) {
  const s = await requireSession();
  const id = num(fd, "id");
  const [row] = await db.select().from(timeOff).where(eq(timeOff.id, id));
  if (!row || !(s.role === "admin" || row.doctorId === s.id)) return;
  await db.delete(timeOff).where(eq(timeOff.id, id));
  revalidateAdmin();
}

export async function updateDoctorAction(fd: FormData) {
  await requireAdmin();
  const id = num(fd, "id");
  const name = str(fd, "name");
  const color = str(fd, "color");
  if (name.length < 2) return;
  await db
    .update(doctors)
    .set({ name, color: /^#[0-9a-fA-F]{6}$/.test(color) ? color : undefined, active: str(fd, "active") === "1" })
    .where(eq(doctors.id, id));
  revalidatePath("/", "layout");
}

export async function deleteDemoDataAction(fd: FormData) {
  await requireAdmin();
  if (str(fd, "confirm") !== "1") return;
  const demo = await db.select({ id: patients.id }).from(patients).where(eq(patients.source, "demo"));
  const ids = demo.map((p) => p.id);
  if (ids.length) {
    await db.transaction(async (tx) => {
      const appts = await tx.select({ id: appointments.id }).from(appointments).where(inArray(appointments.patientId, ids));
      const apptIds = appts.map((a) => a.id);
      await tx.delete(payments).where(inArray(payments.patientId, ids));
      await tx.delete(treatments).where(inArray(treatments.patientId, ids));
      if (apptIds.length) await tx.delete(emailOutbox).where(inArray(emailOutbox.appointmentId, apptIds));
      await tx.delete(appointments).where(inArray(appointments.patientId, ids));
      await tx.delete(patients).where(inArray(patients.id, ids));
    });
  }
  revalidatePath("/", "layout");
}

export async function runDailyJobsAction(_prev: FormState, _fd: FormData): Promise<FormState> {
  await requireAdmin();
  const r = await runDailyJobs();
  revalidateAdmin();
  return { ok: true, message: `Poslato: ${r.reminders} podsetnika, ${r.reviewRequests} molbi za recenziju, ${r.recalls} poziva na kontrolu.` };
}
