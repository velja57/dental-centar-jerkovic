import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { ManageAppointment, type ManageData } from "@/components/booking/ManageAppointment";
import { clinic, telLink } from "@/content/clinic";
import { db } from "@/db";
import { appointments, doctors, patients, services } from "@/db/schema";
import { getDict } from "@/lib/dictionaries";
import { href, type Locale } from "@/lib/i18n";
import { doctorTitle } from "@/lib/site";
import { fmtDateMedium, minutesUntil } from "@/lib/time";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string; token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  return { title: getDict(locale).manage.title, robots: { index: false, follow: false } };
}

export default async function AppointmentPage({ params }: Props) {
  const { locale: l, token } = await params;
  const locale = l as Locale;
  const t = getDict(locale);

  const [row] = await db
    .select({ a: appointments, s: services, d: doctors, p: patients })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
    .where(eq(appointments.token, token));

  if (!row) {
    return (
      <section className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-extrabold text-ink">{t.manage.title}</h1>
        <p className="lead mt-3">{t.notFound.text}</p>
        <Link href={href(locale, "booking")} className="btn btn-primary mt-6">
          {t.manage.bookNew}
        </Link>
      </section>
    );
  }

  const { a, s, d, p } = row;
  let preferences: string | null = null;
  if (a.preferences) {
    try {
      const pr = JSON.parse(a.preferences) as { dates?: string[]; timeOfDay?: "morning" | "afternoon" | "any" };
      preferences = `${t.booking.preferred}: ${(pr.dates ?? []).map((x) => fmtDateMedium(x, locale)).join(", ")}${
        pr.timeOfDay ? ` · ${t.booking.tod[pr.timeOfDay]}` : ""
      }`;
    } catch {
      preferences = null;
    }
  }

  const data: ManageData = {
    token: a.token,
    status: a.status,
    mode: a.mode,
    serviceId: s.id,
    serviceName: locale === "sr" ? s.nameSr : s.nameEn,
    durationMin: s.durationMin,
    doctorId: a.doctorId,
    doctorName: d ? doctorTitle(d.name, locale) : null,
    date: a.date,
    start: a.startMin,
    patientName: p.fullName,
    canChange: a.status === "confirmed" && !!a.date && a.startMin != null && minutesUntil(a.date, a.startMin) >= clinic.booking.cancelHours * 60,
    preferences,
  };

  const b = t.booking;
  return (
    <section className="bg-linear-to-b from-brand-50 to-white">
      <div className="container-page max-w-3xl py-12 md:py-16">
        <ManageAppointment
          locale={locale}
          t={t.manage}
          slotLabels={{
            chooseDay: b.chooseDay,
            chooseTime: b.chooseTime,
            morning: b.morning,
            afternoon: b.afternoon,
            evening: b.evening,
            loading: b.loading,
            noSlotsDay: b.noSlotsDay,
            noSlotsRange: b.noSlotsRange,
            loadError: b.loadError,
            retry: b.retry,
            closedDay: b.closedDay,
            fullDay: b.fullDay,
            holiday: b.holiday,
            prevDays: b.prevDays,
            nextDays: b.nextDays,
          }}
          data={data}
          clinic={{ name: clinic.name, phone: clinic.phoneDisplay, telHref: telLink, address: `${clinic.address.street}, ${clinic.address.city}` }}
          bookingHref={href(locale, "booking")}
          cancelHours={clinic.booking.cancelHours}
        />
      </div>
    </section>
  );
}
