import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleCheck, Mail, MessageCircle, Phone, Trash } from "lucide-react";
import { ScheduleForm, TreatmentForm } from "@/components/admin/forms";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { METHOD_LABEL, PageHeader, Panel, rsd, SOURCE_LABEL, StatusBadge } from "@/components/admin/ui";
import { clinic } from "@/content/clinic";
import {
  addPaymentAction,
  deletePaymentAction,
  deleteTreatmentAction,
  setStatusAction,
  updateInternalNoteAction,
} from "@/lib/admin-actions";
import { allDoctors, allServices, appointmentDetail } from "@/lib/admin-data";
import { requireSession } from "@/lib/auth";
import { displayPhone, waNumber } from "@/lib/phone";
import { doctorTitle } from "@/lib/site";
import { fmtDateLong, fmtDateMedium, fmtStamp, minToTime, nowInClinic } from "@/lib/time";

export const metadata: Metadata = { title: "Termin" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ novo?: string }> };

export default async function AppointmentDetailPage({ params, searchParams }: Props) {
  const s = await requireSession();
  const id = Number((await params).id);
  const sp = await searchParams;
  if (!Number.isInteger(id)) notFound();
  const data = await appointmentDetail(id);
  if (!data) notFound();
  const { appt: a, treatments, payments, balance } = data;
  const [docs, svcs] = await Promise.all([allDoctors(), allServices()]);
  const now = nowInClinic();
  const canEdit = s.role === "admin" || a.doctorId === null || a.doctorId === s.id;
  const scheduled = a.date != null && a.startMin != null;
  const isPast = scheduled && (a.date! < now.date || (a.date === now.date && (a.endMin ?? 0) <= now.minutes));

  const apptCharged = treatments.reduce((sum, r) => sum + r.t.total, 0);
  const apptPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  let prefs: string | null = null;
  if (a.preferences) {
    try {
      const p = JSON.parse(a.preferences) as { dates?: string[]; timeOfDay?: string };
      const tod: Record<string, string> = { morning: "pre podne", afternoon: "popodne", any: "bilo kad" };
      prefs = `${(p.dates ?? []).map((d) => fmtDateLong(d, "sr")).join("; ")}${p.timeOfDay ? ` (${tod[p.timeOfDay] ?? ""})` : ""}`;
    } catch {
      prefs = null;
    }
  }

  const reminder = scheduled
    ? `Poštovani, podsećamo vas na termin u ordinaciji ${clinic.name}: ${fmtDateLong(a.date!, "sr")} u ${minToTime(a.startMin!)} (${a.serviceName}). Adresa: ${clinic.address.street}, ${clinic.address.city}. Za izmene pozovite ${clinic.phoneDisplay}.`
    : `Poštovani, javljamo se povodom vašeg zahteva za termin (${a.serviceName}) u ordinaciji ${clinic.name}.`;
  const waHref = `https://wa.me/${waNumber(a.patientPhone)}?text=${encodeURIComponent(reminder)}`;
  const viberHref = `viber://chat?number=${encodeURIComponent(a.patientPhone)}`;
  const doctorOptions = docs.filter((d) => d.active).map((d) => ({ id: d.id, name: doctorTitle(d.name, "sr") }));

  return (
    <>
      <Link href="/admin/termini" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Svi termini
      </Link>
      {sp.novo && (
        <p className="mb-4 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          <CircleCheck className="h-4 w-4" /> Termin je zakazan.
        </p>
      )}
      <PageHeader
        title={a.patientName}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusBadge status={a.status} />
            <span>{a.serviceName}</span>
            {scheduled && (
              <span className="font-semibold text-ink">
                {fmtDateLong(a.date!, "sr")}, {minToTime(a.startMin!)}–{minToTime(a.endMin!)}
              </span>
            )}
          </span>
        }
        actions={
          <Link href={`/admin/pacijenti/${a.patientId}`} className="btn btn-outline">
            Karton pacijenta
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
        <div className="grid content-start gap-6">
          <Panel title="Pacijent i kontakt">
            <dl className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Telefon</dt>
                <dd>
                  <a href={`tel:${a.patientPhone}`} className="font-semibold text-brand-700">
                    {displayPhone(a.patientPhone)}
                  </a>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">E-mail</dt>
                <dd className="font-semibold break-all text-ink">{a.patientEmail ?? "—"}</dd>
              </div>
              {a.guardianName && (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Roditelj</dt>
                  <dd className="font-semibold text-ink">{a.guardianName}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Doktor</dt>
                <dd className="font-semibold text-ink">{a.doctorName ? doctorTitle(a.doctorName, "sr") : "Prvi slobodan"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Zakazano</dt>
                <dd className="text-ink">
                  {SOURCE_LABEL[a.source] ?? a.source} · {fmtStamp(a.createdAt)}
                </dd>
              </div>
              {prefs && (
                <div className="rounded-xl bg-orange-50 p-3 text-orange-900">
                  <dt className="font-bold">Željeni dani</dt>
                  <dd className="mt-1">{prefs}</dd>
                </div>
              )}
              {a.patientNote && (
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="font-bold text-ink">Napomena pacijenta</dt>
                  <dd className="mt-1 text-slate-700">{a.patientNote}</dd>
                </div>
              )}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:${a.patientPhone}`} className="btn btn-outline btn-sm">
                <Phone className="h-4 w-4" /> Pozovi
              </a>
              <a href={waHref} target="_blank" rel="noopener" className="btn btn-sm bg-[#25D366]/12 text-[#128C4B] hover:bg-[#25D366]/20">
                <MessageCircle className="h-4 w-4" /> WhatsApp podsetnik
              </a>
              <a href={viberHref} className="btn btn-sm bg-[#7360F2]/10 text-[#5b48d6] hover:bg-[#7360F2]/20">
                <MessageCircle className="h-4 w-4" /> Viber
              </a>
              {a.patientEmail && (
                <a href={`mailto:${a.patientEmail}`} className="btn btn-outline btn-sm">
                  <Mail className="h-4 w-4" /> E-mail
                </a>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">WhatsApp podsetnik otvara poruku sa već upisanim tekstom; samo kliknete „Pošalji“.</p>
          </Panel>

          {canEdit && (a.status === "pending" || a.status === "confirmed") && (
            <Panel title={a.status === "pending" ? "Zakaži termin za ovaj zahtev" : "Pomeri termin"}>
              <ScheduleForm
                id={a.id}
                doctors={doctorOptions}
                canChooseDoctor={s.role === "admin"}
                submitLabel={a.status === "pending" ? "Zakaži i obavesti pacijenta" : "Sačuvaj novi termin"}
                hasEmail={!!a.patientEmail}
                defaults={{
                  date: a.date ?? now.date,
                  time: a.startMin != null ? minToTime(a.startMin) : "",
                  doctorId: a.doctorId ?? (s.role === "admin" ? (doctorOptions[0]?.id ?? null) : s.id),
                  duration: a.endMin != null && a.startMin != null ? a.endMin - a.startMin : a.serviceDuration,
                }}
              />
            </Panel>
          )}

          {canEdit && (
            <Panel title="Status">
              <div className="flex flex-wrap gap-2">
                {a.status === "confirmed" && (
                  <>
                    <StatusButton id={a.id} status="completed" label="Završen" cls="bg-green-50 text-green-800 ring-green-200 hover:bg-green-100" />
                    {isPast && <StatusButton id={a.id} status="no_show" label="Nije došao" cls="bg-red-50 text-red-700 ring-red-200 hover:bg-red-100" />}
                  </>
                )}
                {(a.status === "completed" || a.status === "no_show") && (
                  <StatusButton id={a.id} status="confirmed" label="Vrati na „Zakazan“" cls="bg-slate-50 text-slate-700 ring-slate-200 hover:bg-slate-100" />
                )}
                {(a.status === "confirmed" || a.status === "pending") && (
                  <form action={setStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="status" value="cancelled" />
                    {a.patientEmail && (
                      <label className="flex items-center gap-1.5 text-xs text-slate-600">
                        <input type="checkbox" name="notify" value="1" defaultChecked className="h-3.5 w-3.5 accent-brand-600" /> obavesti
                      </label>
                    )}
                    <SubmitButton className="btn btn-sm bg-amber-50 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100">Otkaži termin</SubmitButton>
                  </form>
                )}
              </div>
            </Panel>
          )}

          <Panel title="Interna beleška">
            <form action={updateInternalNoteAction} className="grid gap-3">
              <input type="hidden" name="id" value={a.id} />
              <textarea name="internalNote" rows={3} className="input" defaultValue={a.internalNote ?? ""} placeholder="Vidi samo osoblje ordinacije…" />
              <div>
                <SubmitButton className="btn btn-outline btn-sm">Sačuvaj belešku</SubmitButton>
              </div>
            </form>
          </Panel>
        </div>

        <div className="grid content-start gap-6">
          <Panel title="Urađeni radovi" bodyClass="p-0">
            {treatments.length > 0 && (
              <ul className="divide-y divide-slate-100">
                {treatments.map(({ t, doctorName }) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink">
                        {t.description}
                        {t.tooth && <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">zub {t.tooth}</span>}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {t.quantity} × {rsd(t.unitPrice)}
                        {t.discountPct ? ` · popust ${t.discountPct}%` : ""} · {fmtDateMedium(t.date, "sr")}
                        {doctorName ? ` · ${doctorTitle(doctorName, "sr")}` : ""}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <strong className="whitespace-nowrap text-ink tabular-nums">{rsd(t.total)}</strong>
                      <form action={deleteTreatmentAction}>
                        <input type="hidden" name="id" value={t.id} />
                        <button className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Obriši rad">
                          <Trash className="h-4 w-4" />
                        </button>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className={`p-5 ${treatments.length ? "border-t border-slate-100" : ""}`}>
              <TreatmentForm
                patientId={a.patientId}
                appointmentId={a.id}
                services={svcs.filter((x) => x.active).map((x) => ({ id: x.id, name: x.nameSr, price: x.priceFrom }))}
                defaultServiceId={treatments.length === 0 ? a.serviceId : undefined}
                today={a.date ?? now.date}
              />
            </div>
          </Panel>

          <Panel title="Uplate" bodyClass="p-0">
            {payments.length > 0 && (
              <ul className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <span>
                      <span className="block font-semibold text-ink">{METHOD_LABEL[p.method] ?? p.method}</span>
                      <span className="block text-xs text-slate-500">
                        {fmtDateMedium(p.date, "sr")}
                        {p.note ? ` · ${p.note}` : ""}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <strong className="whitespace-nowrap text-ink tabular-nums">{rsd(p.amount)}</strong>
                      <form action={deletePaymentAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Obriši uplatu">
                          <Trash className="h-4 w-4" />
                        </button>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <form action={addPaymentAction} className={`grid gap-3 p-5 sm:grid-cols-4 ${payments.length ? "border-t border-slate-100" : ""}`}>
              <input type="hidden" name="patientId" value={a.patientId} />
              <input type="hidden" name="appointmentId" value={a.id} />
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-slate-600" htmlFor="amount">
                  Iznos (RSD)
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min={1}
                 
                  className="input"
                  defaultValue={apptCharged - apptPaid > 0 ? apptCharged - apptPaid : ""}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-slate-600" htmlFor="method">
                  Način
                </label>
                <select id="method" name="method" className="input">
                  {Object.entries(METHOD_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-slate-600" htmlFor="pdate">
                  Datum
                </label>
                <input id="pdate" name="date" type="date" className="input" defaultValue={now.date} />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-semibold text-slate-600" htmlFor="pnote">
                  Napomena
                </label>
                <input id="pnote" name="note" className="input" placeholder="npr. 1. rata" />
              </div>
              <div className="sm:col-span-4">
                <SubmitButton>Evidentiraj uplatu</SubmitButton>
              </div>
            </form>
          </Panel>

          <Panel title="Obračun">
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Ovaj termin: zaduženo</dt>
                <dd className="font-semibold text-ink tabular-nums">{rsd(apptCharged)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Ovaj termin: plaćeno</dt>
                <dd className="font-semibold text-ink tabular-nums">{rsd(apptPaid)}</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-slate-100 pt-3">
                <dt className="font-bold text-ink">Ukupan dug pacijenta</dt>
                <dd className={`text-lg font-bold tabular-nums ${balance.debt > 0 ? "text-red-700" : "text-green-700"}`}>
                  {balance.debt > 0 ? rsd(balance.debt) : balance.debt < 0 ? `Preplata ${rsd(-balance.debt)}` : "Nema duga"}
                </dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}

function StatusButton({ id, status, label, cls }: { id: number; status: string; label: string; cls: string }) {
  return (
    <form action={setStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <SubmitButton className={`btn btn-sm ring-1 ${cls}`}>{label}</SubmitButton>
    </form>
  );
}
