import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { doctors, services, type Service } from "@/db/schema";

export async function getActiveServices() {
  return db.select().from(services).where(eq(services.active, true)).orderBy(asc(services.sortOrder));
}

export async function getActiveDoctors() {
  return db
    .select({ id: doctors.id, slug: doctors.slug, name: doctors.name, specialty: doctors.specialty, color: doctors.color })
    .from(doctors)
    .where(eq(doctors.active, true))
    .orderBy(asc(doctors.sortOrder));
}

export type PublicDoctor = Awaited<ReturnType<typeof getActiveDoctors>>[number];

/** Najniža cena u grupi usluga (za "od X RSD"). */
export function lowestPrice(list: Service[]) {
  const priced = list.filter((s) => s.priceType !== "free" && s.priceType !== "request" && s.priceFrom > 0);
  return priced.length ? Math.min(...priced.map((s) => s.priceFrom)) : null;
}
