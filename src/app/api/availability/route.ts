import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { getAvailability } from "@/lib/availability";
import { isValidDate, nowInClinic } from "@/lib/time";

export const dynamic = "force-dynamic";

// GET /api/availability?serviceId=1&doctorId=2&from=2026-11-17&days=14&exclude=<token>
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const serviceId = Number(sp.get("serviceId"));
  const doctorParam = sp.get("doctorId");
  const doctorId = doctorParam ? Number(doctorParam) : null;
  const from = sp.get("from") || nowInClinic().date;
  const days = Number(sp.get("days") || 14);

  if (!Number.isInteger(serviceId) || serviceId <= 0 || !isValidDate(from) || (doctorId !== null && !Number.isInteger(doctorId))) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  let excludeAppointmentId: number | undefined;
  const exclude = sp.get("exclude");
  if (exclude) {
    const [a] = await db.select({ id: appointments.id }).from(appointments).where(eq(appointments.token, exclude));
    excludeAppointmentId = a?.id;
  }

  const res = await getAvailability({ serviceId, doctorId, from, days: Number.isFinite(days) ? days : 14, excludeAppointmentId });
  if (!res) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(res, { headers: { "Cache-Control": "no-store" } });
}
