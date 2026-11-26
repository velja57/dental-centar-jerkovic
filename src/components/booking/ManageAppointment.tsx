"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarCheck, CalendarPlus, Clock, Download, LoaderCircle, MapPin, Phone, UserRound } from "lucide-react";
import { cancelBooking, rescheduleBooking } from "@/lib/booking-actions";
import { googleCalendarUrl } from "@/lib/calendar-links";
import type { Dict } from "@/lib/dictionaries";
import { clinicToUtc, fmtDateLong, minToTime, type Loc } from "@/lib/time";
import { SlotPicker, type SlotLabels } from "./SlotPicker";

export type ManageData = {
  token: string;
  status: string;
  mode: string;
  serviceId: number;
  serviceName: string;
  durationMin: number;
  doctorId: number | null;
  doctorName: string | null;
  date: string | null;
  start: number | null;
  patientName: string;
  canChange: boolean;
  preferences: string | null;
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800",
  confirmed: "bg-brand-50 text-brand-800",
  completed: "bg-slate-100 text-slate-700",
  cancelled: "bg-red-50 text-red-700",
  no_show: "bg-red-50 text-red-700",
};

export function ManageAppointment({
  locale,
  t,
  slotLabels,
  data,
  clinic,
  bookingHref,
  cancelHours,
}: {
  locale: Loc;
  t: Dict["manage"];
  slotLabels: SlotLabels;
  data: ManageData;
  clinic: { name: string; phone: string; telHref: string; address: string };
  bookingHref: string;
  cancelHours: number;
}) {
  const router = useRouter();
  const [view, setView] = useState<"details" | "cancel" | "reschedule">("details");
  const [newSlot, setNewSlot] = useState<{ date: string; start: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  const active = data.status === "confirmed" || data.status === "pending";
  const hasTime = data.date && data.start != null;
  const start = hasTime ? clinicToUtc(data.date!, data.start!) : null;
  const end = hasTime ? clinicToUtc(data.date!, data.start! + data.durationMin) : null;

  async function doCancel() {
    setBusy(true);
    const res = await cancelBooking(data.token);
    setBusy(false);
    if (res.ok) {
      setMessage({ tone: "ok", text: t.cancelled });
      setView("details");
      router.refresh();
    } else setMessage({ tone: "err", text: res.error === "too_late" ? t.errors.tooLate : t.errors.generic });
  }

  async function doReschedule() {
    if (!newSlot) return;
    setBusy(true);
    const res = await rescheduleBooking({ token: data.token, date: newSlot.date, start: newSlot.start, doctorId: data.doctorId });
    setBusy(false);
    if (res.ok) {
      // „Nova potvrda je poslata na e-mail“ samo ako je mejl zaista otišao
      setMessage({ tone: "ok", text: res.emailed ? t.rescheduled : t.rescheduledNoEmail });
      setView("details");
      setNewSlot(null);
      router.refresh();
    } else {
      setMessage({
        tone: "err",
        text: res.error === "too_late" ? t.errors.tooLate : res.error === "slot_taken" ? t.errors.slotTaken : t.errors.generic,
      });
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-100 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold tracking-wide text-slate-500 uppercase">{t.title}</p>
          <span className={`badge px-3 py-1 text-sm ${STATUS_STYLE[data.status] ?? "bg-slate-100"}`}>{t.status[data.status] ?? data.status}</span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold text-ink sm:text-3xl">{data.serviceName}</h1>
        <dl className="mt-5 grid gap-3 text-[15px]">
          {hasTime && (
            <div className="flex items-center gap-3">
              <CalendarCheck className="h-5 w-5 shrink-0 text-brand-600" />
              <dt className="sr-only">{t.when}</dt>
              <dd className="font-semibold text-ink">
                {fmtDateLong(data.date!, locale)}, {minToTime(data.start!)}
                <span className="font-normal text-slate-500">
                  {" "}
                  ({data.durationMin} min)
                </span>
              </dd>
            </div>
          )}
          {!hasTime && data.preferences && (
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 shrink-0 text-amber-600" />
              <dd className="text-slate-700">{data.preferences}</dd>
            </div>
          )}
          <div className="flex items-center gap-3">
            <UserRound className="h-5 w-5 shrink-0 text-brand-600" />
            <dt className="sr-only">{t.doctor}</dt>
            <dd className="text-slate-700">{data.doctorName ?? "—"}</dd>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 shrink-0 text-brand-600" />
            <dt className="sr-only">{t.where}</dt>
            <dd className="text-slate-700">{clinic.address}</dd>
          </div>
        </dl>
      </div>

      <div className="p-6 sm:p-8">
        {message && (
          <p role="status" className={`mb-5 rounded-2xl p-4 text-[15px] ${message.tone === "ok" ? "bg-brand-50 text-brand-900" : "bg-red-50 text-red-800"}`}>
            {message.text}
          </p>
        )}

        {data.status === "pending" && <p className="mb-5 text-[15px] text-slate-600">{t.pendingText}</p>}

        {active && !data.canChange && data.status === "confirmed" && (
          <p className="rounded-2xl bg-amber-50 p-4 text-[15px] text-amber-900">
            {t.tooLate.replace("{h}", String(cancelHours))}{" "}
            <a href={clinic.telHref} className="font-bold underline">
              {clinic.phone}
            </a>
          </p>
        )}

        {view === "details" && (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {data.status === "confirmed" && start && end && (
              <>
                <a href={`/api/ics/${data.token}`} className="btn btn-outline">
                  <Download className="h-4 w-4" /> .ics
                </a>
                <a
                  href={googleCalendarUrl({ title: `${data.serviceName}, ${clinic.name}`, start, end, details: clinic.phone, location: clinic.address })}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-outline"
                >
                  <CalendarPlus className="h-4 w-4" /> Google Calendar
                </a>
              </>
            )}
            {active && data.canChange && data.status === "confirmed" && (
              <button type="button" onClick={() => setView("reschedule")} className="btn btn-brand">
                {t.reschedule}
              </button>
            )}
            {active && (data.canChange || data.status === "pending") && (
              <button type="button" onClick={() => setView("cancel")} className="btn btn-ghost text-red-700 hover:bg-red-50">
                {t.cancel}
              </button>
            )}
            {!active && (
              <Link href={bookingHref} className="btn btn-primary">
                {t.bookNew}
              </Link>
            )}
          </div>
        )}

        {view === "cancel" && (
          <div className="rounded-2xl border border-red-100 bg-red-50/60 p-5">
            <p className="font-bold text-red-900">{t.cancelConfirm}</p>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={doCancel} disabled={busy} className="btn btn-danger">
                {busy && <LoaderCircle className="h-4 w-4 animate-spin" />} {t.yesCancel}
              </button>
              <button type="button" onClick={() => setView("details")} className="btn btn-outline">
                {t.no}
              </button>
            </div>
          </div>
        )}

        {view === "reschedule" && (
          <div>
            <h2 className="text-lg font-extrabold text-ink">{t.pickNew}</h2>
            <div className="mt-4">
              <SlotPicker
                serviceId={data.serviceId}
                doctorId={data.doctorId}
                locale={locale}
                labels={slotLabels}
                selected={newSlot}
                onSelect={(date, s) => setNewSlot({ date, start: s })}
                excludeToken={data.token}
                contact={{ phone: clinic.phone, telHref: clinic.telHref }}
              />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={doReschedule} disabled={!newSlot || busy} className="btn btn-primary">
                {busy && <LoaderCircle className="h-4 w-4 animate-spin" />} {t.confirmNew}
                {newSlot && ` · ${fmtDateLong(newSlot.date, locale)}, ${minToTime(newSlot.start)}`}
              </button>
              <button type="button" onClick={() => setView("details")} className="btn btn-outline">
                {t.no}
              </button>
            </div>
          </div>
        )}

        <p className="mt-8 flex items-center gap-2 border-t border-slate-100 pt-5 text-sm text-slate-500">
          <Phone className="h-4 w-4" />
          <a href={clinic.telHref} className="font-bold text-brand-700">
            {clinic.phone}
          </a>
        </p>
      </div>
    </div>
  );
}
