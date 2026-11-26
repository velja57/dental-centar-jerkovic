"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarPlus,
  Check,
  CircleCheck,
  Clock,
  Copy,
  Download,
  Info,
  Link2,
  LoaderCircle,
  Phone,
  Share2,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { DentalIcon } from "@/components/site/DentalIcon";
import type { DentalIconName } from "@/content/services";
import { track } from "@/lib/analytics";
import { createBooking } from "@/lib/booking-actions";
import { googleCalendarUrl } from "@/lib/calendar-links";
import type { Dict } from "@/lib/dictionaries";
import { normalizePhone } from "@/lib/phone";
import { clinicToUtc, fmtDateLong, fmtDateMedium, minToTime, type Loc } from "@/lib/time";
import { PreferredDaysPicker, SlotPicker } from "./SlotPicker";

export type WService = {
  id: number;
  slug: string;
  category: string;
  name: string;
  durationMin: number;
  price: string;
  priceEur: string | null;
  mode: "instant" | "request";
  doctorIds: number[];
  popular: boolean;
};
export type WCategory = { key: string; title: string; icon: DentalIconName };
export type WDoctor = { id: number; slug: string; name: string; role: string; color: string; initials: string };

type Props = {
  locale: Loc;
  t: Dict["booking"];
  common: { min: string; instant: string; request: string };
  services: WService[];
  categories: WCategory[];
  doctors: WDoctor[];
  initial: { serviceId?: number; doctorId?: number; category?: string };
  clinic: { name: string; phone: string; telHref: string; address: string };
  privacyHref: string;
  appointmentBase: string;
  cancelHours: number;
};

type Form = {
  forChild: boolean;
  fullName: string;
  guardianName: string;
  phone: string;
  email: string;
  note: string;
  consent: boolean;
  website: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function BookingWizard(props: Props) {
  const { locale, t, common, services, categories, doctors, initial } = props;
  const rootRef = useRef<HTMLDivElement>(null);

  const [doctorFilter, setDoctorFilter] = useState<number | null>(initial.serviceId ? null : (initial.doctorId ?? null));
  const visible = useMemo(
    () => (doctorFilter ? services.filter((s) => s.doctorIds.includes(doctorFilter)) : services),
    [services, doctorFilter],
  );
  const visibleCats = categories.filter((c) => visible.some((s) => s.category === c.key));

  const [step, setStep] = useState(initial.serviceId ? 1 : 0);
  const [serviceId, setServiceId] = useState<number | null>(initial.serviceId ?? null);
  const [category, setCategory] = useState(
    initial.category && visibleCats.some((c) => c.key === initial.category) ? initial.category : (visibleCats[0]?.key ?? ""),
  );
  const [doctorId, setDoctorId] = useState<number | null>(initial.doctorId ?? null);
  const [slot, setSlot] = useState<{ date: string; start: number } | null>(null);
  const [prefDates, setPrefDates] = useState<string[]>([]);
  const [tod, setTod] = useState<"morning" | "afternoon" | "any">("any");
  const [form, setForm] = useState<Form>({ forChild: false, fullName: "", guardianName: "", phone: "", email: "", note: "", consent: false, website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [result, setResult] = useState<{ token: string; status: "confirmed" | "pending"; doctorId: number | null; emailed: boolean } | null>(null);

  const service = services.find((s) => s.id === serviceId) ?? null;
  const serviceDoctors = service ? doctors.filter((d) => service.doctorIds.includes(d.id)) : [];
  const chosenDoctor = doctors.find((d) => d.id === (result?.doctorId ?? doctorId)) ?? null;
  const noticeRef = useRef<HTMLDivElement>(null);
  const [focusField, setFocusField] = useState<{ id: string } | null>(null); // novi objekat = ponovni fokus

  useEffect(() => {
    if (!focusField) return;
    const el = document.getElementById(focusField.id);
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ block: "center" }); // odmah, bez animacije: greška mora odmah da se vidi
  }, [focusField]);

  function go(next: number) {
    setStep(next);
    setNotice(null);
    requestAnimationFrame(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  // Poruka posle slanja (npr. „previše termina“) stoji na vrhu, a pacijent je kod dugmeta na dnu:
  // na telefonu je ne bi video, pa je dovodimo u vidno polje.
  useEffect(() => {
    if (notice) noticeRef.current?.scrollIntoView({ block: "center" });
  }, [notice]);

  // ——— Dugme „Nazad“ (telefon/pregledač) vraća na prethodni korak, umesto da napusti zakazivanje ———
  // Dok je pacijent dalje od početnog koraka, u istoriji držimo jedan dodatni unos (ista adresa).
  // „Nazad“ ga skida, a mi umesto napuštanja stranice prikazujemo prethodni korak.
  const baseStep = initial.serviceId ? 1 : 0;
  const stepRef = useRef(step);
  const guardRef = useRef(false);
  const ignorePopRef = useRef(false);
  stepRef.current = step;

  useEffect(() => {
    if (step > baseStep && !guardRef.current) {
      window.history.pushState(null, "", window.location.href);
      guardRef.current = true;
    } else if (step <= baseStep && guardRef.current) {
      // Vratio se dugmetima na stranici: skidamo dodatni unos, da sledeće „Nazad“ odmah napusti stranicu
      guardRef.current = false;
      ignorePopRef.current = true;
      window.history.back();
    }
  }, [step, baseStep]);

  useEffect(() => {
    function onPop() {
      if (ignorePopRef.current) {
        ignorePopRef.current = false;
        return;
      }
      if (!guardRef.current) return; // nije naš unos: pregledač napušta stranicu kao i obično
      guardRef.current = false;
      const current = stepRef.current;
      if (current >= 3) {
        // Posle uspešnog zakazivanja „Nazad“ ne vraća na popunjen formular (da se termin ne zakaže dvaput)
        setResult(null);
        setSlot(null);
        setPrefDates([]);
        if (!initial.serviceId) setServiceId(null);
        go(baseStep);
      } else if (current > baseStep) {
        go(current - 1);
      }
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function chooseService(s: WService) {
    setServiceId(s.id);
    setSlot(null);
    setPrefDates([]);
    if (doctorId && !s.doctorIds.includes(doctorId)) setDoctorId(null);
    if (!doctorId && doctorFilter && s.doctorIds.includes(doctorFilter)) setDoctorId(doctorFilter);
    go(1);
  }

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      const { [key]: _omit, ...rest } = e;
      return rest;
    });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (form.fullName.trim().length < 3) e.fullName = t.errors.name;
    if (form.forChild && form.guardianName.trim().length < 3) e.guardianName = t.errors.guardian;
    if (!normalizePhone(form.phone)) e.phone = t.errors.phone;
    if (!EMAIL_RE.test(form.email.trim())) e.email = t.errors.email;
    if (!form.consent) e.consent = t.errors.consent;
    setErrors(e);
    // Na telefonu je polje sa greškom često iznad ekrana (dugme je na dnu), pa izgleda kao da se ništa
    // nije desilo: fokusiramo prvo pogrešno polje i dovodimo ga na sredinu ekrana (vidi efekat ispod).
    const first = ["fullName", "guardianName", "phone", "email", "consent"].find((k) => e[k]);
    if (first) setFocusField({ id: first });
    return !first;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!service || !validate()) return;
    setSubmitting(true);
    setNotice(null);
    const res = await createBooking({
      locale,
      serviceId: service.id,
      doctorId,
      date: service.mode === "instant" ? (slot?.date ?? null) : null,
      start: service.mode === "instant" ? (slot?.start ?? null) : null,
      preferences: service.mode === "request" ? { dates: prefDates, timeOfDay: tod } : null,
      forChild: form.forChild,
      fullName: form.fullName,
      guardianName: form.guardianName,
      phone: form.phone,
      email: form.email,
      note: form.note,
      consent: form.consent as true,
      website: form.website,
    }).catch(() => ({ ok: false as const, error: "generic" as const }));
    setSubmitting(false);
    if (res.ok) {
      setResult({ token: res.token, status: res.status, doctorId: res.doctorId, emailed: res.emailed });
      // Jednom po uspešnom zakazivanju; bez ličnih podataka i bez konkretne usluge (samo oblast).
      track("booking_completed", { mode: res.status === "confirmed" ? "instant" : "request", category: service.category });
      go(3);
      return;
    }
    if (res.error === "slot_taken") {
      setSlot(null);
      setRefreshKey((k) => k + 1);
      go(1);
      setNotice(t.errors.slotTaken);
    } else if (res.error === "too_many") setNotice(t.errors.tooMany);
    else if (res.error === "validation") setNotice(t.errors.validation);
    else setNotice(t.errors.generic);
  }

  const slotLabels = {
    chooseDay: t.chooseDay,
    chooseTime: t.chooseTime,
    morning: t.morning,
    afternoon: t.afternoon,
    evening: t.evening,
    loading: t.loading,
    noSlotsDay: t.noSlotsDay,
    noSlotsRange: t.noSlotsRange,
    loadError: t.loadError,
    retry: t.retry,
    closedDay: t.closedDay,
    fullDay: t.fullDay,
    prevDays: t.prevDays,
    nextDays: t.nextDays,
  };

  // ——— Sažetak (desno) ———
  const summary = service && (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
      <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">{t.summary}</p>
      <p className="mt-2 text-lg font-extrabold text-ink">{service.name}</p>
      <dl className="mt-3 grid gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">{t.duration}</dt>
          <dd className="font-semibold text-ink">
            {service.durationMin} {common.min}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">{t.price}</dt>
          <dd className="text-right font-semibold text-ink">
            {service.price}
            {service.priceEur && <span className="block text-xs font-normal text-slate-500">{service.priceEur}</span>}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">{t.doctor}</dt>
          <dd className="font-semibold text-ink">{chosenDoctor?.name ?? t.anyDoctor}</dd>
        </div>
        {service.mode === "instant" && slot && (
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">{t.dateTime}</dt>
            <dd className="text-right font-semibold text-ink">
              {fmtDateMedium(slot.date, locale)}, {minToTime(slot.start)}
            </dd>
          </div>
        )}
        {service.mode === "request" && prefDates.length > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">{t.preferred}</dt>
            <dd className="text-right font-semibold text-ink">{prefDates.map((d) => fmtDateMedium(d, locale)).join(" · ")}</dd>
          </div>
        )}
      </dl>
    </div>
  );

  // ——— Gotovo ———
  if (step === 3 && result && service) {
    const confirmed = result.status === "confirmed" && slot;
    const start = confirmed ? clinicToUtc(slot.date, slot.start) : null;
    const end = confirmed ? clinicToUtc(slot.date, slot.start + service.durationMin) : null;
    const manageHref = `${props.appointmentBase}/${result.token}`;
    return (
      <div ref={rootRef} className="mx-auto max-w-2xl scroll-mt-24 text-center animate-fade-up">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <CircleCheck className="h-9 w-9" />
        </span>
        <h2 className="mt-5 text-3xl font-extrabold text-ink">{confirmed ? t.doneInstantTitle : t.doneRequestTitle}</h2>
        {/* „Poslali smo vam mejl“ samo ako je mejl zaista otišao (dok slanje nije podešeno, ne odlazi) */}
        <p className="lead mt-3">
          {confirmed
            ? result.emailed
              ? t.doneInstantText
              : t.doneInstantTextNoEmail
            : result.emailed
              ? t.doneRequestText
              : t.doneRequestTextNoEmail}
        </p>
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-soft">
          <p className="text-lg font-extrabold text-ink">{service.name}</p>
          {confirmed && (
            <p className="mt-2 flex items-center gap-2 text-[15px] font-semibold text-brand-800">
              <CalendarCheck className="h-5 w-5" /> {fmtDateLong(slot.date, locale)}, {minToTime(slot.start)}
            </p>
          )}
          <p className="mt-2 flex items-center gap-2 text-[15px] text-slate-600">
            <UserRound className="h-5 w-5 text-slate-400" /> {chosenDoctor?.name ?? t.anyDoctor}
          </p>
          <p className="mt-2 text-sm text-slate-500">{props.clinic.address}</p>
        </div>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          {confirmed && start && end && (
            <>
              <a href={`/api/ics/${result.token}`} className="btn btn-outline">
                <Download className="h-4 w-4" /> {t.addToCalendar}
              </a>
              <a
                href={googleCalendarUrl({
                  title: `${service.name}, ${props.clinic.name}`,
                  start,
                  end,
                  details: `${props.clinic.phone}\n${typeof window !== "undefined" ? window.location.origin : ""}${manageHref}`,
                  location: props.clinic.address,
                })}
                target="_blank"
                rel="noopener"
                className="btn btn-outline"
              >
                <CalendarPlus className="h-4 w-4" /> {t.googleCalendar}
              </a>
            </>
          )}
          <Link href={manageHref} className="btn btn-brand">
            {t.manage}
          </Link>
        </div>
        {!result.emailed && (
          <SaveLink
            href={manageHref}
            title={t.saveLinkTitle}
            text={confirmed ? t.saveLinkInstant : t.saveLinkRequest}
            labels={{ copy: t.copyLink, copied: t.copied, share: t.shareLink }}
          />
        )}
        {confirmed && <p className="mt-5 text-sm text-slate-500">{t.cancelPolicy.replace("{h}", String(props.cancelHours))}</p>}
        <button
          type="button"
          onClick={() => {
            setResult(null);
            setServiceId(null);
            setSlot(null);
            setPrefDates([]);
            go(0);
          }}
          className="mt-8 text-sm font-bold text-brand-700 hover:text-brand-800"
        >
          {t.bookAnother}
        </button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="scroll-mt-24">
      {/* Koraci */}
      <ol className="mb-8 grid grid-cols-3 gap-2" aria-label={t.stepsLabel}>
        {t.steps.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={label}>
              <button
                type="button"
                disabled={i > step || (i === 1 && !service)}
                onClick={() => go(i)}
                className="group flex w-full flex-col gap-2 text-left disabled:cursor-default"
                aria-current={current ? "step" : undefined}
              >
                <span className={`h-1.5 rounded-full transition ${done || current ? "bg-brand-600" : "bg-slate-200"}`} />
                <span className={`text-xs font-bold sm:text-sm ${current ? "text-ink" : done ? "text-brand-700" : "text-slate-400"}`}>
                  {i + 1}. {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {notice && (
        <div ref={noticeRef} role="alert" className="mb-6 flex scroll-mt-24 items-start gap-3 rounded-2xl bg-amber-50 p-4 text-[15px] text-amber-900">
          <Info className="mt-0.5 h-5 w-5 shrink-0" /> {notice}
        </div>
      )}

      {/* ——— 1. USLUGA ——— */}
      {step === 0 && (
        <div className="animate-fade-up">
          <h2 className="text-2xl font-extrabold text-ink">{t.chooseService}</h2>
          {doctorFilter && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-50 py-1 pr-1 pl-3 text-sm font-semibold text-brand-800">
              {doctors.find((d) => d.id === doctorFilter)?.name}
              <button type="button" onClick={() => setDoctorFilter(null)} className="rounded-full p-1 hover:bg-brand-100" aria-label={t.removeFilter}>
                <X className="h-3.5 w-3.5" />
              </button>
            </p>
          )}

          {!doctorFilter && (
            <>
              <p className="mt-6 flex items-center gap-2 text-sm font-bold tracking-wide text-slate-500 uppercase">
                <Sparkles className="h-4 w-4 text-coral-500" /> {t.popular}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {services
                  .filter((s) => s.popular)
                  .map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => chooseService(s)}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-brand-400 hover:shadow-soft"
                    >
                      <span>
                        <span className="block font-bold text-ink">{s.name}</span>
                        <span className="mt-0.5 block text-sm text-slate-500">
                          {s.durationMin} {common.min}
                        </span>
                      </span>
                      <span className="text-right text-sm font-bold whitespace-nowrap text-brand-700">{s.price}</span>
                    </button>
                  ))}
              </div>
            </>
          )}

          <p className="mt-8 text-sm font-bold tracking-wide text-slate-500 uppercase">{t.byCategory}</p>
          <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
            {visibleCats.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                aria-pressed={category === c.key}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${
                  category === c.key ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"
                }`}
              >
                <DentalIcon name={c.icon} className="h-4 w-4" /> {c.title}
              </button>
            ))}
          </div>
          <ul className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {visible
              .filter((s) => s.category === category)
              .map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => chooseService(s)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition hover:bg-brand-50/60 sm:px-5"
                  >
                    <span>
                      <span className="block font-semibold text-ink">{s.name}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {s.durationMin} {common.min}
                        </span>
                        <span className={`badge ${s.mode === "instant" ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700"}`}>
                          {s.mode === "instant" ? common.instant : common.request}
                        </span>
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block font-bold whitespace-nowrap text-ink">{s.price}</span>
                      {s.priceEur && <span className="block text-xs text-slate-500">{s.priceEur}</span>}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* ——— 2. TERMIN ——— */}
      {step === 1 && service && (
        <div className="grid gap-8 animate-fade-up lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-extrabold text-ink">{service.name}</h2>
              <button type="button" onClick={() => go(0)} className="text-sm font-bold text-brand-700 hover:text-brand-800">
                {t.change}
              </button>
            </div>

            {serviceDoctors.length > 1 && (
              <div className="mt-5">
                <p className="text-sm font-bold text-ink">{t.doctor}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[{ id: null as number | null, name: t.anyDoctor, color: "", initials: "" }, ...serviceDoctors].map((d) => {
                    const on = doctorId === d.id;
                    return (
                      <button
                        key={d.id ?? "any"}
                        type="button"
                        onClick={() => {
                          setDoctorId(d.id);
                          setSlot(null);
                        }}
                        aria-pressed={on}
                        className={`flex items-center gap-2 rounded-full border py-1.5 pr-4 pl-1.5 text-sm font-bold transition ${
                          on ? "border-brand-600 bg-brand-50 text-brand-800" : "border-slate-200 bg-white text-slate-700 hover:border-brand-300"
                        }`}
                      >
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
                          style={{ background: d.color || "#94a3b8" }}
                        >
                          {d.initials || "✦"}
                        </span>
                        {d.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-7">
              {service.mode === "instant" ? (
                <SlotPicker
                  serviceId={service.id}
                  doctorId={doctorId}
                  locale={locale}
                  labels={slotLabels}
                  selected={slot}
                  refreshKey={refreshKey}
                  contact={{ phone: props.clinic.phone, telHref: props.clinic.telHref }}
                  onSelect={(date, start) => {
                    setSlot({ date, start });
                    go(2);
                  }}
                />
              ) : (
                <div>
                  <div className="rounded-2xl bg-amber-50 p-4 text-[15px] text-amber-900">
                    <p className="font-bold">{t.requestTitle}</p>
                    <p className="mt-1 leading-relaxed">{t.requestText}</p>
                  </div>
                  <p className="mt-6 text-sm font-bold text-ink">{t.preferredDays}</p>
                  <div className="mt-3">
                    <PreferredDaysPicker
                      serviceId={service.id}
                      locale={locale}
                      labels={slotLabels}
                      value={prefDates}
                      onChange={setPrefDates}
                      contact={{ phone: props.clinic.phone, telHref: props.clinic.telHref }}
                    />
                  </div>
                  <p className="mt-6 text-sm font-bold text-ink">{t.timeOfDay}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["morning", "afternoon", "any"] as const).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setTod(k)}
                        aria-pressed={tod === k}
                        className={`rounded-full border px-4 py-2 text-sm font-bold ${
                          tod === k ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        {t.tod[k]}
                      </button>
                    ))}
                  </div>
                  {errors.days && <p className="mt-3 text-sm font-semibold text-red-600">{errors.days}</p>}
                  <button
                    type="button"
                    className="btn btn-primary btn-lg mt-8"
                    onClick={() => {
                      if (prefDates.length === 0) {
                        setErrors({ days: t.errors.days });
                        return;
                      }
                      setErrors({});
                      go(2);
                    }}
                  >
                    {t.continue}
                  </button>
                </div>
              )}
            </div>
          </div>
          <aside className="hidden lg:block">{summary}</aside>
        </div>
      )}

      {/* ——— 3. PODACI ——— */}
      {step === 2 && service && (
        <form onSubmit={submit} noValidate className="grid gap-8 animate-fade-up lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="min-w-0">
            <button type="button" onClick={() => go(1)} className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
              <ArrowLeft className="h-4 w-4" /> {t.back}
            </button>
            <h2 className="mt-3 text-2xl font-extrabold text-ink">{t.detailsTitle}</h2>
            <div className="mt-5 lg:hidden">{summary}</div>

            <fieldset className="mt-6">
              <legend className="label">{t.forWhom}</legend>
              <div className="grid grid-cols-2 gap-2 sm:max-w-sm">
                {[false, true].map((child) => (
                  <button
                    key={String(child)}
                    type="button"
                    onClick={() => set("forChild", child)}
                    aria-pressed={form.forChild === child}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                      form.forChild === child ? "border-brand-600 bg-brand-50 text-brand-800" : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {child ? t.forChild : t.forMe}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field id="fullName" label={form.forChild ? t.childName : t.fullName} error={errors.fullName} className="sm:col-span-2">
                <input
                  id="fullName"
                  className="input"
                  autoComplete={form.forChild ? "off" : "name"}
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                />
              </Field>
              {form.forChild && (
                <Field id="guardianName" label={t.guardianName} error={errors.guardianName} className="sm:col-span-2">
                  <input
                    id="guardianName"
                    className="input"
                    autoComplete="name"
                    value={form.guardianName}
                    onChange={(e) => set("guardianName", e.target.value)}
                    aria-invalid={!!errors.guardianName}
                    aria-describedby={errors.guardianName ? "guardianName-error" : undefined}
                  />
                </Field>
              )}
              <Field id="phone" label={t.phone} hint={t.phoneHint} error={errors.phone}>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  className="input"
                  autoComplete="tel"
                  placeholder="06x xxx xxxx"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
                />
              </Field>
              <Field id="email" label={t.email} hint={t.emailHint} error={errors.email}>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  className="input"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : "email-hint"}
                />
              </Field>
              <Field id="note" label={t.note} className="sm:col-span-2">
                <textarea
                  id="note"
                  rows={3}
                  className="input resize-y"
                  placeholder={t.notePlaceholder}
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  maxLength={1000}
                />
              </Field>
              {/* zamka za botove — ljudi ovo polje ne vide */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} />
              </div>
            </div>

            <label className="mt-6 flex items-start gap-3 text-sm text-slate-600">
              <input
                id="consent"
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-brand-600"
                checked={form.consent}
                onChange={(e) => set("consent", e.target.checked)}
                aria-invalid={!!errors.consent}
                aria-describedby={errors.consent ? "consent-error" : undefined}
              />
              <span>
                {t.consent}{" "}
                <Link href={props.privacyHref} target="_blank" className="font-semibold text-brand-700 underline">
                  {t.privacyLink}
                </Link>
                .
              </span>
            </label>
            {errors.consent && (
              <p id="consent-error" className="mt-2 text-sm font-semibold text-red-600">
                {errors.consent}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg mt-7 w-full sm:w-auto">
              {submitting ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" /> {t.submitting}
                </>
              ) : (
                <>
                  <CalendarCheck className="h-5 w-5" /> {service.mode === "instant" ? t.submitInstant : t.submitRequest}
                </>
              )}
            </button>
            <p className="mt-5 flex items-center gap-2 text-sm text-slate-500">
              <Phone className="h-4 w-4" /> {t.callInstead}{" "}
              <a href={props.clinic.telHref} className="font-bold text-brand-700">
                {props.clinic.phone}
              </a>
            </p>
          </div>
          <aside className="hidden lg:block">{summary}</aside>
        </form>
      )}
    </div>
  );
}

/**
 * Link do termina, kada potvrda nije otišla mejlom: bez njega pacijent posle zatvaranja stranice
 * ne bi mogao sam da pomeri ili otkaže termin. Kopiranje, a na telefonu i „Pošalji sebi“ (Viber, WhatsApp, beleške…).
 * Prikazuje se tek posle zakazivanja (samo u pregledaču), pa je window dostupan.
 */
function SaveLink({ href, title, text, labels }: { href: string; title: string; text: string; labels: { copy: string; copied: string; share: string } }) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const url = typeof window === "undefined" ? href : window.location.origin + href;
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  function done() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      done();
    } catch {
      // Stariji pregledači ili zabranjen pristup: označi link i probaj staru komandu za kopiranje
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      el.select();
      try {
        if (document.execCommand("copy")) done();
      } catch {
        // link ostaje označen, korisnik ga kopira sam
      }
    }
  }

  return (
    <div className="mt-6 rounded-3xl border border-brand-100 bg-brand-50/60 p-5 text-left">
      <p className="flex items-center gap-2 font-bold text-ink">
        <Link2 className="h-5 w-5 shrink-0 text-brand-600" /> {title}
      </p>
      <p className="mt-1 text-sm text-slate-600">{text}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          ref={inputRef}
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          aria-label={title}
          className="input min-w-0 flex-1 text-sm"
        />
        <button type="button" onClick={copy} className="btn btn-outline shrink-0">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span aria-live="polite">{copied ? labels.copied : labels.copy}</span>
        </button>
        {canShare && (
          <button
            type="button"
            onClick={() => navigator.share({ title, url }).catch(() => {})}
            className="btn btn-outline shrink-0"
          >
            <Share2 className="h-4 w-4" /> {labels.share}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-semibold text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
