import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { clinic } from "@/content/clinic";
import { db } from "@/db";
import { appointments, doctors, services } from "@/db/schema";
import { buildIcs } from "@/lib/calendar-links";
import { href } from "@/lib/i18n";
import { absoluteUrl, doctorTitle } from "@/lib/site";
import { clinicToUtc } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [row] = await db
    .select({ a: appointments, s: services, d: doctors })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
    .where(eq(appointments.token, token));

  if (!row || !row.a.date || row.a.startMin == null || row.a.endMin == null || row.a.status === "cancelled") {
    return new Response("Not found", { status: 404 });
  }
  const loc = row.a.locale === "en" ? "en" : "sr";
  const name = loc === "sr" ? row.s.nameSr : row.s.nameEn;
  const manage = absoluteUrl(href(loc, "appointment", row.a.token));
  const ics = buildIcs({
    uid: `${row.a.token}@dentalcentar`,
    start: clinicToUtc(row.a.date, row.a.startMin),
    end: clinicToUtc(row.a.date, row.a.endMin),
    title: `${name}, ${clinic.name}`,
    description: `${row.d ? doctorTitle(row.d.name, loc) + "\n" : ""}${clinic.phoneDisplay}\n${manage}`,
    location: `${clinic.address.street}, ${clinic.address.postalCode} ${clinic.address.city}`,
    url: manage,
  });
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="termin-dental-centar.ics"',
      "Cache-Control": "no-store",
    },
  });
}
