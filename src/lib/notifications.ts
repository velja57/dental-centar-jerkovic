import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments, doctors, patients, services } from "@/db/schema";
import { clinic } from "@/content/clinic";
import { href } from "@/lib/i18n";
import { absoluteUrl, doctorTitle } from "@/lib/site";
import { fmtDateLong, minToTime, type Loc } from "@/lib/time";
import { renderEmail, sendEmail } from "@/lib/email";
import { displayPhone } from "@/lib/phone";

export type NotifyKind =
  | "confirmed"
  | "request_received"
  | "request_confirmed"
  | "rescheduled"
  | "cancelled_patient"
  | "cancelled_clinic"
  | "reminder"
  | "review_request"
  | "recall";

async function loadFull(appointmentId: number) {
  const [row] = await db
    .select({ a: appointments, p: patients, s: services, d: doctors })
    .from(appointments)
    .innerJoin(patients, eq(appointments.patientId, patients.id))
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
    .where(eq(appointments.id, appointmentId));
  return row;
}

type Full = NonNullable<Awaited<ReturnType<typeof loadFull>>>;

const address = `${clinic.address.street}, ${clinic.address.city}`;

function patientEmail(kind: NotifyKind, r: Full, loc: Loc) {
  const sr = loc === "sr";
  const svc = sr ? r.s.nameSr : r.s.nameEn;
  const date = r.a.date ? fmtDateLong(r.a.date, loc) : "";
  const time = r.a.startMin != null ? minToTime(r.a.startMin) : "";
  const doctor = r.d ? doctorTitle(r.d.name, loc) : sr ? "Prvi slobodan" : "First available";
  const greeting = sr ? `Dobar dan, ${r.p.fullName},` : `Hello ${r.p.fullName},`;
  const manageUrl = absoluteUrl(href(loc, "appointment", r.a.token));
  const bookingUrl = absoluteUrl(href(loc, "booking"));
  const detailRows: [string, string][] = [
    [sr ? "Usluga" : "Service", svc],
    [sr ? "Doktor" : "Dentist", doctor],
    [sr ? "Datum" : "Date", date],
    [sr ? "Vreme" : "Time", time],
    [sr ? "Adresa" : "Address", address],
  ];
  const policy = sr
    ? `Termin možete otkazati ili pomeriti najkasnije ${clinic.booking.cancelHours} sata pre početka. Za sva pitanja pozovite nas na ${clinic.phoneDisplay}.`
    : `You can cancel or reschedule up to ${clinic.booking.cancelHours} hours before your appointment. For any questions call us on ${clinic.phoneE164}.`;

  switch (kind) {
    case "confirmed":
    case "request_confirmed":
      return {
        subject: sr ? `Termin potvrđen: ${svc}, ${date} u ${time}` : `Appointment confirmed: ${svc}, ${date} at ${time}`,
        ...renderEmail({
          locale: loc,
          preheader: sr ? `${date} u ${time}` : `${date} at ${time}`,
          title: kind === "confirmed" ? (sr ? "Vaš termin je potvrđen" : "Your appointment is confirmed") : sr ? "Zakazali smo vam termin" : "Your appointment is booked",
          greeting,
          intro: sr ? "Radujemo se vašem dolasku. Evo detalja termina:" : "We look forward to seeing you. Here are the details:",
          rows: detailRows,
          button: { label: sr ? "Pomeri ili otkaži termin" : "Reschedule or cancel", url: manageUrl },
          outro: policy,
        }),
      };
    case "request_received": {
      let prefs = "";
      try {
        const p = JSON.parse(r.a.preferences ?? "{}") as { dates?: string[]; timeOfDay?: string };
        const tod = { morning: sr ? "pre podne" : "morning", afternoon: sr ? "popodne" : "afternoon", any: sr ? "svejedno" : "any time" } as Record<string, string>;
        prefs = `${(p.dates ?? []).map((d) => fmtDateLong(d, loc)).join("; ")}${p.timeOfDay ? ` (${tod[p.timeOfDay] ?? p.timeOfDay})` : ""}`;
      } catch {
        prefs = "";
      }
      return {
        subject: sr ? `Primili smo vaš zahtev: ${svc}` : `We received your request: ${svc}`,
        ...renderEmail({
          locale: loc,
          preheader: sr ? "Javićemo vam se sa predlogom termina." : "We'll get back to you with a proposed time.",
          title: sr ? "Zahtev je primljen" : "Request received",
          greeting,
          intro: sr
            ? "Hvala na poverenju! Javićemo vam se sa predlogom termina, najčešće istog ili narednog radnog dana."
            : "Thank you! We'll get back to you with a proposed time, usually the same or the next working day.",
          rows: [
            [sr ? "Usluga" : "Service", svc],
            [sr ? "Željeni dani" : "Preferred days", prefs || "—"],
          ],
          button: { label: sr ? "Pogledaj zahtev" : "View request", url: manageUrl },
          outro: sr ? `Imate pitanje? Pozovite nas na ${clinic.phoneDisplay}.` : `Questions? Call us on ${clinic.phoneE164}.`,
        }),
      };
    }
    case "rescheduled":
      return {
        subject: sr ? `Termin pomeren: ${date} u ${time}` : `Appointment moved: ${date} at ${time}`,
        ...renderEmail({
          locale: loc,
          preheader: sr ? `Novi termin: ${date} u ${time}` : `New time: ${date} at ${time}`,
          title: sr ? "Vaš termin je pomeren" : "Your appointment has been moved",
          greeting,
          intro: sr ? "Evo novih detalja termina:" : "Here are the new details:",
          rows: detailRows,
          button: { label: sr ? "Pogledaj termin" : "View appointment", url: manageUrl },
          outro: policy,
        }),
      };
    case "cancelled_patient":
    case "cancelled_clinic":
      return {
        subject: sr ? `Termin otkazan: ${svc}${date ? `, ${date}` : ""}` : `Appointment cancelled: ${svc}${date ? `, ${date}` : ""}`,
        ...renderEmail({
          locale: loc,
          preheader: sr ? "Termin je otkazan." : "Your appointment has been cancelled.",
          title: sr ? "Termin je otkazan" : "Appointment cancelled",
          greeting,
          intro:
            kind === "cancelled_patient"
              ? sr
                ? "Potvrđujemo da je vaš termin otkazan. Kad god poželite, novi termin možete zakazati online."
                : "This confirms that your appointment has been cancelled. You can book a new one online at any time."
              : sr
                ? "Nažalost, morali smo da otkažemo vaš termin. Javićemo vam se da dogovorimo novi, a možete i sami izabrati termin online."
                : "Unfortunately we had to cancel your appointment. We'll contact you to arrange a new one, or you can pick a time online.",
          rows: date ? detailRows.slice(0, 4) : [[sr ? "Usluga" : "Service", svc]],
          button: { label: sr ? "Zakaži novi termin" : "Book a new appointment", url: bookingUrl },
        }),
      };
    case "reminder":
      return {
        subject: sr ? `Podsetnik: sutra u ${time}, ${svc}` : `Reminder: tomorrow at ${time}, ${svc}`,
        ...renderEmail({
          locale: loc,
          preheader: sr ? `Sutra u ${time}` : `Tomorrow at ${time}`,
          title: sr ? "Vidimo se sutra!" : "See you tomorrow!",
          greeting,
          intro: sr ? "Podsećamo vas na sutrašnji termin:" : "A friendly reminder about your appointment tomorrow:",
          rows: detailRows,
          button: { label: sr ? "Pomeri ili otkaži termin" : "Reschedule or cancel", url: manageUrl },
          outro: policy,
        }),
      };
    case "review_request":
      return {
        subject: sr ? "Hvala na poseti! Kako vam je bilo?" : "Thank you for your visit! How was it?",
        ...renderEmail({
          locale: loc,
          preheader: sr ? "Vaše mišljenje nam mnogo znači." : "Your feedback means a lot to us.",
          title: sr ? "Hvala što ste nam ukazali poverenje" : "Thank you for trusting us",
          greeting,
          intro: sr
            ? "Nadamo se da ste zadovoljni. Ako imate minut, vaša recenzija na Google-u nam mnogo znači i pomaže drugima da nas pronađu."
            : "We hope you're happy with your visit. If you have a minute, a Google review means a lot to us and helps others find us.",
          button: { label: sr ? "Ostavite recenziju" : "Leave a review", url: clinic.google.writeReviewUrl },
          outro: sr ? "Hvala vam i vidimo se na sledećoj kontroli!" : "Thank you, and see you at your next check-up!",
        }),
      };
    case "recall":
      return {
        subject: sr ? "Vreme je za kontrolni pregled" : "It's time for your check-up",
        ...renderEmail({
          locale: loc,
          preheader: sr ? "Prošlo je šest meseci od vaše poslednje posete." : "It's been six months since your last visit.",
          title: sr ? "Vreme je za kontrolu" : "Time for a check-up",
          greeting,
          intro: sr
            ? "Prošlo je šest meseci od vaše poslednje posete. Redovna kontrola je najlakši način da sitni problemi ne postanu veliki."
            : "It's been six months since your last visit. A regular check-up is the easiest way to keep small problems from growing.",
          button: { label: sr ? "Zakaži kontrolu" : "Book a check-up", url: absoluteUrl(`${href(loc, "booking")}?usluga=kontrolni-pregled`) },
        }),
      };
  }
}

function clinicEmail(kind: NotifyKind, r: Full) {
  const svc = r.s.nameSr;
  const when = r.a.date && r.a.startMin != null ? `${fmtDateLong(r.a.date, "sr")} u ${minToTime(r.a.startMin)}` : "termin nije određen";
  const titles: Partial<Record<NotifyKind, string>> = {
    confirmed: "Nova online rezervacija",
    request_received: "Novi zahtev na upit",
    rescheduled: "Pacijent je pomerio termin",
    cancelled_patient: "Pacijent je otkazao termin",
  };
  const title = titles[kind];
  if (!title) return null;
  return {
    subject: `${title}: ${r.p.fullName}, ${svc}`,
    ...renderEmail({
      locale: "sr",
      preheader: `${r.p.fullName}, ${when}`,
      title,
      intro: kind === "request_received" ? "Pacijent čeka predlog termina. Zakažite ga u admin panelu." : "Detalji:",
      rows: [
        ["Pacijent", r.p.fullName + (r.p.guardianName ? ` (roditelj: ${r.p.guardianName})` : "")],
        ["Telefon", displayPhone(r.p.phone)],
        ["E-mail", r.p.email ?? "—"],
        ["Usluga", svc],
        ["Doktor", r.d ? doctorTitle(r.d.name, "sr") : "Prvi slobodan"],
        ["Termin", when],
        ["Napomena", r.a.patientNote || "—"],
      ],
      button: { label: "Otvori u admin panelu", url: absoluteUrl(`/admin/termini/${r.a.id}`) },
    }),
  };
}

/**
 * Šalje mejl pacijentu (i po želji ordinaciji). Greške ne prekidaju zakazivanje.
 * Vraća da li je mejl pacijentu zaista otišao, da sajt ne bi tvrdio da je potvrda poslata kada nije
 * (npr. dok slanje mejlova nije podešeno, pa se mejl samo beleži u admin → Poruke).
 */
export async function notifyAppointment(
  appointmentId: number,
  kind: NotifyKind,
  opts: { clinic?: boolean } = {},
): Promise<{ patientEmailSent: boolean }> {
  let patientEmailSent = false;
  try {
    const r = await loadFull(appointmentId);
    if (!r) return { patientEmailSent };
    const loc: Loc = r.a.locale === "en" ? "en" : "sr";
    const mail = patientEmail(kind, r, loc);
    if (r.p.email && mail) {
      const status = await sendEmail({ to: r.p.email, subject: mail.subject, html: mail.html, text: mail.text, kind, appointmentId });
      patientEmailSent = status === "sent";
    }
    if (opts.clinic && process.env.CLINIC_NOTIFY_EMAIL) {
      const c = clinicEmail(kind, r);
      if (c) await sendEmail({ to: process.env.CLINIC_NOTIFY_EMAIL, subject: c.subject, html: c.html, text: c.text, kind: `clinic_${kind}`, appointmentId });
    }
  } catch (e) {
    console.error("notifyAppointment", kind, e);
  }
  return { patientEmailSent };
}
