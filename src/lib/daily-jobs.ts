import "server-only";
import { and, desc, eq, gte, inArray, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { appointments, patients } from "@/db/schema";
import { notifyAppointment } from "@/lib/notifications";
import { addDays, nowInClinic } from "@/lib/time";

/**
 * Dnevni poslovi (Vercel Cron jednom dnevno ili ručno iz admina):
 * 1) podsetnik dan pre termina, 2) molba za Google recenziju posle završenog termina,
 * 3) poziv na kontrolu 6 meseci posle poslednje posete.
 */
export async function runDailyJobs() {
  const now = nowInClinic();
  const iso = new Date().toISOString();
  const tomorrow = addDays(now.date, 1);

  // 1) Podsetnici za sutra
  const due = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(and(eq(appointments.date, tomorrow), eq(appointments.status, "confirmed"), isNull(appointments.reminderSentAt)));
  for (const a of due) {
    await notifyAppointment(a.id, "reminder");
    await db.update(appointments).set({ reminderSentAt: iso }).where(eq(appointments.id, a.id));
  }

  // 2) Molba za recenziju (termini završeni juče ili danas)
  const done = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(
      and(
        eq(appointments.status, "completed"),
        gte(appointments.date, addDays(now.date, -2)),
        lte(appointments.date, now.date),
        isNull(appointments.reviewRequestSentAt),
      ),
    );
  for (const a of done) {
    await notifyAppointment(a.id, "review_request");
    await db.update(appointments).set({ reviewRequestSentAt: iso }).where(eq(appointments.id, a.id));
  }

  // 3) Poziv na kontrolu: poslednja poseta pre ~6 meseci, nema zakazanih termina
  const lastVisits = await db
    .select({ patientId: appointments.patientId, last: sql<string>`max(${appointments.date})` })
    .from(appointments)
    .where(eq(appointments.status, "completed"))
    .groupBy(appointments.patientId)
    .having(sql`max(${appointments.date}) between ${addDays(now.date, -190)} and ${addDays(now.date, -180)}`);

  let recalls = 0;
  for (const v of lastVisits) {
    const [p] = await db.select().from(patients).where(eq(patients.id, v.patientId));
    if (!p?.email) continue;
    if (p.lastRecallAt && p.lastRecallAt > addDays(now.date, -150)) continue;
    const [upcoming] = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(and(eq(appointments.patientId, p.id), inArray(appointments.status, ["pending", "confirmed"])))
      .limit(1);
    if (upcoming) continue;
    const [lastAppt] = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(and(eq(appointments.patientId, p.id), eq(appointments.status, "completed")))
      .orderBy(desc(appointments.date))
      .limit(1);
    if (!lastAppt) continue;
    await notifyAppointment(lastAppt.id, "recall");
    await db.update(patients).set({ lastRecallAt: now.date }).where(eq(patients.id, p.id));
    recalls++;
  }

  return { reminders: due.length, reviewRequests: done.length, recalls };
}
