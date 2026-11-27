"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { CircleCheck, CircleExclamationPoint, LoaderCircle } from "lucide-react";
import Link from "next/link";
import {
  addTimeOffAction,
  addTreatmentAction,
  changePasswordAction,
  createAppointmentAction,
  createPatientAction,
  loginAction,
  runDailyJobsAction,
  scheduleAction,
  updatePatientAction,
  type FormState,
  type TimeOffState,
} from "@/lib/admin-actions";
import { fmtNumber } from "@/lib/format";
import { doctorTitle } from "@/lib/site";
import { fmtDateMedium, minToTime } from "@/lib/time";
import { keepOnSubmit } from "./KeepForm";
import { FieldLabel } from "./ui";
import { SubmitButton } from "./SubmitButton";

function Feedback({ state }: { state: FormState }) {
  if (state.error)
    return (
      <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-800">
        <CircleExclamationPoint className="mt-0.5 h-4 w-4 shrink-0" /> {state.error}
      </p>
    );
  if (state.message)
    return (
      <p role="status" className="flex items-start gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-sm text-green-800">
        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" /> {state.message}
      </p>
    );
  return null;
}

// ——— Prijava ———
export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  const passwordRef = useRef<HTMLInputElement>(null);
  // Posle pogrešne lozinke korisničko ime ostaje, a lozinka se briše (kao na svakom sajtu)
  useEffect(() => {
    if (state.error && passwordRef.current) passwordRef.current.value = "";
  }, [state]);
  return (
    <form action={action} onSubmit={keepOnSubmit(action)} className="grid gap-4">
      <div>
        <FieldLabel htmlFor="username">Korisničko ime</FieldLabel>
        <input id="username" name="username" className="input" autoComplete="username" autoCapitalize="none" required />
      </div>
      <div>
        <FieldLabel htmlFor="password">Lozinka</FieldLabel>
        <input ref={passwordRef} id="password" name="password" type="password" className="input" autoComplete="current-password" required />
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className="btn btn-brand btn-lg w-full">
        {pending && <LoaderCircle className="h-5 w-5 animate-spin" />} Prijavi se
      </button>
    </form>
  );
}

// ——— Zakazivanje zahteva / pomeranje termina ———
export function ScheduleForm({
  id,
  doctors,
  defaults,
  canChooseDoctor,
  submitLabel,
  hasEmail,
}: {
  id: number;
  doctors: { id: number; name: string }[];
  defaults: { date: string; time: string; doctorId: number | null; duration: number };
  canChooseDoctor: boolean;
  submitLabel: string;
  hasEmail: boolean;
}) {
  const [state, action] = useActionState(scheduleAction, {});
  return (
    <form action={action} onSubmit={keepOnSubmit(action)} className="grid gap-4">
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor={`date-${id}`}>Datum</FieldLabel>
          <input id={`date-${id}`} name="date" type="date" className="input" defaultValue={defaults.date} required />
        </div>
        <div>
          <FieldLabel htmlFor={`time-${id}`}>Vreme</FieldLabel>
          <input id={`time-${id}`} name="time" type="time" step={300} className="input" defaultValue={defaults.time} required />
        </div>
        <div>
          <FieldLabel htmlFor={`doc-${id}`}>Doktor</FieldLabel>
          <select id={`doc-${id}`} name="doctorId" className="input" defaultValue={defaults.doctorId ?? doctors[0]?.id} disabled={!canChooseDoctor}>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          {!canChooseDoctor && <input type="hidden" name="doctorId" value={defaults.doctorId ?? doctors[0]?.id} />}
        </div>
        <div>
          <FieldLabel htmlFor={`dur-${id}`}>Trajanje (min)</FieldLabel>
          <input id={`dur-${id}`} name="duration" type="number" min={5} step={5} className="input" defaultValue={defaults.duration} />
        </div>
      </div>
      <div className="grid gap-2 text-sm text-slate-700">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="notify" value="1" defaultChecked={hasEmail} disabled={!hasEmail} className="h-4 w-4 accent-brand-600" />
          Pošalji pacijentu e-mail sa potvrdom {!hasEmail && <span className="text-slate-400">(nema e-mail)</span>}
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="force" value="1" className="h-4 w-4 accent-brand-600" />
          Zakaži uprkos preklapanju
        </label>
      </div>
      <Feedback state={state} />
      <div>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

// ——— Novi termin (telefon / ordinacija) ———
type SvcOpt = { id: number; name: string; category: string; categoryTitle: string; durationMin: number };

export function NewAppointmentForm({
  services,
  doctors,
  defaults,
  patient,
}: {
  services: SvcOpt[];
  doctors: { id: number; name: string }[];
  defaults: { date: string; time: string; doctorId: number | null; serviceId: number | null };
  patient: { id: number; fullName: string; phone: string; email: string | null } | null;
}) {
  const [state, action] = useActionState(createAppointmentAction, {});
  const [serviceId, setServiceId] = useState<number | null>(defaults.serviceId);
  const [email, setEmail] = useState("");
  const svc = services.find((s) => s.id === serviceId);
  const groups = useMemo(() => {
    const map = new Map<string, SvcOpt[]>();
    for (const s of services) map.set(s.categoryTitle, [...(map.get(s.categoryTitle) ?? []), s]);
    return [...map.entries()];
  }, [services]);
  const hasEmail = patient ? !!patient.email : email.includes("@");

  return (
    <form action={action} onSubmit={keepOnSubmit(action)} className="grid gap-6">
      {patient ? (
        <input type="hidden" name="patientId" value={patient.id} />
      ) : (
        <fieldset className="grid gap-3 rounded-2xl border border-dashed border-slate-300 p-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-bold text-ink">Novi pacijent</legend>
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="fullName">Ime i prezime</FieldLabel>
            <input id="fullName" name="fullName" className="input" />
          </div>
          <div>
            <FieldLabel htmlFor="phone">Telefon</FieldLabel>
            <input id="phone" name="phone" type="tel" className="input" placeholder="06x xxx xxxx" />
          </div>
          <div>
            <FieldLabel htmlFor="email">E-mail (nije obavezno)</FieldLabel>
            <input id="email" name="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="guardianName">Roditelj (ako je pacijent dete)</FieldLabel>
            <input id="guardianName" name="guardianName" className="input" />
          </div>
        </fieldset>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="serviceId">Usluga</FieldLabel>
          <select
            id="serviceId"
            name="serviceId"
            className="input"
            value={serviceId ?? ""}
            onChange={(e) => setServiceId(e.target.value ? Number(e.target.value) : null)}
            required
          >
            <option value="">— izaberite —</option>
            {groups.map(([title, list]) => (
              <optgroup key={title} label={title}>
                {list.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMin} min)
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="doctorId">Doktor</FieldLabel>
          <select id="doctorId" name="doctorId" className="input" defaultValue={defaults.doctorId ?? doctors[0]?.id}>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="duration">Trajanje (min)</FieldLabel>
          <input id="duration" name="duration" type="number" min={5} step={5} className="input" placeholder={svc ? String(svc.durationMin) : "po usluzi"} />
        </div>
        <div>
          <FieldLabel htmlFor="date">Datum</FieldLabel>
          <input id="date" name="date" type="date" className="input" defaultValue={defaults.date} required />
        </div>
        <div>
          <FieldLabel htmlFor="time">Vreme</FieldLabel>
          <input id="time" name="time" type="time" step={300} className="input" defaultValue={defaults.time} required />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel htmlFor="internalNote">Interna beleška (vidi samo osoblje)</FieldLabel>
          <textarea id="internalNote" name="internalNote" rows={2} className="input" />
        </div>
      </div>

      <div className="grid gap-2 text-sm text-slate-700">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="notify" value="1" defaultChecked disabled={!hasEmail} className="h-4 w-4 accent-brand-600" />
          Pošalji pacijentu e-mail sa potvrdom {!hasEmail && <span className="text-slate-400">(nema e-mail)</span>}
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="force" value="1" className="h-4 w-4 accent-brand-600" />
          Zakaži uprkos preklapanju
        </label>
      </div>
      <Feedback state={state} />
      <div>
        <SubmitButton className="btn btn-brand btn-lg">Zakaži termin</SubmitButton>
      </div>
    </form>
  );
}

// ——— Pacijent (novi / izmena) ———
export function PatientForm({
  patient,
}: {
  patient?: { id: number; fullName: string; phone: string; email: string | null; guardianName: string | null; birthYear: number | null; note: string | null };
}) {
  const [state, action] = useActionState(patient ? updatePatientAction : createPatientAction, {});
  return (
    <form action={action} onSubmit={keepOnSubmit(action)} className="grid gap-3 sm:grid-cols-2">
      {patient && <input type="hidden" name="id" value={patient.id} />}
      <div className="sm:col-span-2">
        <FieldLabel htmlFor="p-name">Ime i prezime</FieldLabel>
        <input id="p-name" name="fullName" className="input" defaultValue={patient?.fullName} required />
      </div>
      <div>
        <FieldLabel htmlFor="p-phone">Telefon</FieldLabel>
        <input id="p-phone" name="phone" type="tel" className="input" defaultValue={patient?.phone} required />
      </div>
      <div>
        <FieldLabel htmlFor="p-email">E-mail</FieldLabel>
        <input id="p-email" name="email" type="email" className="input" defaultValue={patient?.email ?? ""} />
      </div>
      <div>
        <FieldLabel htmlFor="p-guardian">Roditelj / staratelj</FieldLabel>
        <input id="p-guardian" name="guardianName" className="input" defaultValue={patient?.guardianName ?? ""} />
      </div>
      <div>
        <FieldLabel htmlFor="p-year">Godina rođenja</FieldLabel>
        <input id="p-year" name="birthYear" type="number" min={1900} max={2100} className="input" defaultValue={patient?.birthYear ?? ""} />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel htmlFor="p-note">Napomena (alergije, strah, posebne potrebe…)</FieldLabel>
        <textarea id="p-note" name="note" rows={2} className="input" defaultValue={patient?.note ?? ""} />
      </div>
      <div className="sm:col-span-2">
        <Feedback state={state} />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton>{patient ? "Sačuvaj izmene" : "Dodaj pacijenta"}</SubmitButton>
      </div>
    </form>
  );
}

// ——— Urađen rad (cena se popunjava iz cenovnika) ———
export function TreatmentForm({
  patientId,
  appointmentId,
  services,
  defaultServiceId,
  today,
}: {
  patientId: number;
  appointmentId?: number;
  services: { id: number; name: string; price: number }[];
  defaultServiceId?: number;
  today: string;
}) {
  const initial = services.find((s) => s.id === defaultServiceId);
  const [serviceId, setServiceId] = useState<number | null>(initial?.id ?? null);
  const [price, setPrice] = useState<number>(initial?.price ?? 0);
  const [qty, setQty] = useState(1);
  const [disc, setDisc] = useState(0);
  const total = Math.round(price * qty * (1 - disc / 100));
  return (
    <form action={addTreatmentAction} className="grid gap-3 sm:grid-cols-6">
      <input type="hidden" name="patientId" value={patientId} />
      {appointmentId && <input type="hidden" name="appointmentId" value={appointmentId} />}
      <div className="sm:col-span-4">
        <FieldLabel htmlFor={`t-svc-${appointmentId ?? patientId}`}>Usluga iz cenovnika</FieldLabel>
        <select
          id={`t-svc-${appointmentId ?? patientId}`}
          name="serviceId"
          className="input"
          value={serviceId ?? ""}
          onChange={(e) => {
            const id = e.target.value ? Number(e.target.value) : null;
            setServiceId(id);
            const s = services.find((x) => x.id === id);
            if (s) setPrice(s.price);
          }}
        >
          <option value="">— druga usluga (upišite opis) —</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <FieldLabel htmlFor={`t-tooth-${appointmentId ?? patientId}`}>Zub</FieldLabel>
        <input id={`t-tooth-${appointmentId ?? patientId}`} name="tooth" className="input" placeholder="npr. 36" />
      </div>
      {!serviceId && (
        <div className="sm:col-span-6">
          <FieldLabel htmlFor={`t-desc-${appointmentId ?? patientId}`}>Opis</FieldLabel>
          <input id={`t-desc-${appointmentId ?? patientId}`} name="description" className="input" required />
        </div>
      )}
      <div className="sm:col-span-2">
        <FieldLabel htmlFor={`t-price-${appointmentId ?? patientId}`}>Cena (RSD)</FieldLabel>
        <input
          id={`t-price-${appointmentId ?? patientId}`}
          name="unitPrice"
          type="number"
          min={0}
         
          className="input"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value) || 0)}
        />
      </div>
      <div>
        <FieldLabel htmlFor={`t-qty-${appointmentId ?? patientId}`}>Kom.</FieldLabel>
        <input
          id={`t-qty-${appointmentId ?? patientId}`}
          name="quantity"
          type="number"
          min={1}
          className="input"
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
        />
      </div>
      <div>
        <FieldLabel htmlFor={`t-disc-${appointmentId ?? patientId}`}>Popust %</FieldLabel>
        <input
          id={`t-disc-${appointmentId ?? patientId}`}
          name="discountPct"
          type="number"
          min={0}
          max={100}
          className="input"
          value={disc}
          onChange={(e) => setDisc(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
        />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel htmlFor={`t-date-${appointmentId ?? patientId}`}>Datum</FieldLabel>
        <input id={`t-date-${appointmentId ?? patientId}`} name="date" type="date" className="input" defaultValue={today} />
      </div>
      <div className="flex items-center justify-between gap-3 sm:col-span-6">
        <p className="text-sm text-slate-600">
          Ukupno: <strong className="text-base text-ink">{fmtNumber(total)} RSD</strong>
        </p>
        <SubmitButton>Dodaj rad</SubmitButton>
      </div>
    </form>
  );
}

// ——— Lozinka ———
export function PasswordForm() {
  const [state, action] = useActionState(changePasswordAction, {});
  return (
    <form action={action} className="grid max-w-sm gap-3">
      <div>
        <FieldLabel htmlFor="current">Trenutna lozinka</FieldLabel>
        <input id="current" name="current" type="password" className="input" autoComplete="current-password" required />
      </div>
      <div>
        <FieldLabel htmlFor="next">Nova lozinka (bar 8 znakova)</FieldLabel>
        <input id="next" name="next" type="password" className="input" autoComplete="new-password" minLength={8} required />
      </div>
      <div>
        <FieldLabel htmlFor="repeat">Ponovite novu lozinku</FieldLabel>
        <input id="repeat" name="repeat" type="password" className="input" autoComplete="new-password" minLength={8} required />
      </div>
      <Feedback state={state} />
      <div>
        <SubmitButton>Promeni lozinku</SubmitButton>
      </div>
    </form>
  );
}

// ——— Ručno pokretanje dnevnih poslova ———
export function RunJobsForm() {
  const [state, action] = useActionState(runDailyJobsAction, {});
  return (
    <form action={action} className="grid gap-3">
      <Feedback state={state} />
      <div>
        <SubmitButton className="btn btn-outline">Pokreni podsetnike sada</SubmitButton>
      </div>
    </form>
  );
}

// ——— Odsustvo / praznik ———
export function TimeOffForm({
  doctors,
  allowClinicWide,
  defaultWho,
  today,
}: {
  doctors: { id: number; name: string }[];
  allowClinicWide: boolean;
  defaultWho: string;
  today: string;
}) {
  const [state, action] = useActionState<TimeOffState, FormData>(addTimeOffAction, {});
  const affected = state.affected ?? [];
  return (
    <form action={action} className="grid gap-3">
      <div>
        <FieldLabel htmlFor="off-who">Ko</FieldLabel>
        <select id="off-who" name="doctorId" className="input" defaultValue={defaultWho}>
          {allowClinicWide && <option value="all">Cela ordinacija (praznik, kolektivni odmor)</option>}
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel htmlFor="off-from">Od datuma</FieldLabel>
          <input id="off-from" name="dateFrom" type="date" defaultValue={today} className="input" required />
        </div>
        <div>
          <FieldLabel htmlFor="off-to">Do datuma</FieldLabel>
          <input id="off-to" name="dateTo" type="date" className="input" />
        </div>
        <div>
          <FieldLabel htmlFor="off-start">Od (deo dana)</FieldLabel>
          <input id="off-start" name="from" type="time" step={900} className="input" />
        </div>
        <div>
          <FieldLabel htmlFor="off-end">Do</FieldLabel>
          <input id="off-end" name="to" type="time" step={900} className="input" />
        </div>
      </div>
      <div>
        <FieldLabel htmlFor="off-reason">Razlog (vidi samo osoblje)</FieldLabel>
        <input id="off-reason" name="reason" className="input" placeholder="Godišnji odmor, seminar…" />
      </div>
      <p className="text-xs text-slate-500">Vreme popunite samo za blokadu dela jednog dana. U tom periodu online zakazivanje nije moguće.</p>
      <Feedback state={state} />
      {affected.length > 0 && (
        <div role="alert" className="rounded-xl bg-amber-50 px-3 py-3 text-sm text-amber-900">
          <p className="font-bold">
            {affected.length === 1 ? "U tom periodu već postoji 1 zakazan termin." : `U tom periodu već postoje zakazani termini: ${affected.length}.`} Odsustvo ih ne pomera:
            pacijenti će doći ako ih ne obavestite.
          </p>
          <ul className="mt-2 grid gap-1">
            {affected.map((a) => (
              <li key={a.id}>
                <Link href={`/admin/termini/${a.id}`} className="font-semibold underline">
                  {fmtDateMedium(a.date, "sr")} u {minToTime(a.start)} · {a.patient}
                </Link>
                {a.doctor && <span className="text-amber-800"> · {doctorTitle(a.doctor, "sr")}</span>}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs">Otvorite termin da pozovete pacijenta, pošaljete WhatsApp poruku, pomerite ili otkažete termin.</p>
        </div>
      )}
      <div>
        <SubmitButton>Dodaj</SubmitButton>
      </div>
    </form>
  );
}
