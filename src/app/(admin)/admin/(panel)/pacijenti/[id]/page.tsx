import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, Info, Mail, MessageCircle, Phone } from "lucide-react";
import { PatientForm, TreatmentForm } from "@/components/admin/forms";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Empty, METHOD_LABEL, PageHeader, Panel, rsd, StatTile, StatusBadge } from "@/components/admin/ui";
import { addPaymentAction } from "@/lib/admin-actions";
import { allServices, patientDetail } from "@/lib/admin-data";
import { requireSession } from "@/lib/auth";
import { displayPhone, waNumber } from "@/lib/phone";
import { doctorTitle } from "@/lib/site";
import { fmtDateMedium, minToTime, nowInClinic } from "@/lib/time";

export const metadata: Metadata = { title: "Karton pacijenta" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ postoji?: string }> };

export default async function PatientPage({ params, searchParams }: Props) {
  const [, { id: rawId }, sp] = await Promise.all([requireSession(), params, searchParams]);
  const id = Number(rawId);
  if (!Number.isInteger(id)) notFound();
  const [data, svcs] = await Promise.all([patientDetail(id), allServices()]);
  if (!data) notFound();
  const { patient: p, appts, treatments, payments, balance } = data;
  const now = nowInClinic();
  const completed = appts.filter((a) => a.status === "completed").length;
  const noShows = appts.filter((a) => a.status === "no_show").length;

  return (
    <>
      <Link href="/admin/pacijenti" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Svi pacijenti
      </Link>
      {sp.postoji && (
        <p className="mb-4 flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900">
          <Info className="h-4 w-4 shrink-0" /> Pacijent sa ovim imenom i brojem telefona već postoji, pa je otvoren njegov karton (nije napravljen novi).
        </p>
      )}
      <PageHeader
        title={p.fullName}
        subtitle={
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            <a href={`tel:${p.phone}`} className="font-semibold text-brand-700">
              {displayPhone(p.phone)}
            </a>
            {p.email && <span>{p.email}</span>}
            {p.guardianName && <span>roditelj: {p.guardianName}</span>}
          </span>
        }
        actions={
          <>
            <Link href={`/admin/termini/novi?patient=${p.id}`} className="btn btn-brand">
              <CalendarPlus className="h-4 w-4" /> Novi termin
            </Link>
            <a href={`https://wa.me/${waNumber(p.phone)}`} target="_blank" rel="noopener" className="btn btn-outline">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a href={`tel:${p.phone}`} className="btn btn-outline" aria-label="Pozovi">
              <Phone className="h-4 w-4" />
            </a>
            {p.email && (
              <a href={`mailto:${p.email}`} className="btn btn-outline" aria-label="E-mail">
                <Mail className="h-4 w-4" />
              </a>
            )}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Ukupno zaduženo" value={rsd(balance.charged)} />
        <StatTile label="Ukupno plaćeno" value={rsd(balance.paid)} />
        <StatTile label={balance.debt >= 0 ? "Dug" : "Preplata"} value={rsd(Math.abs(balance.debt))} hint={balance.debt > 0 ? "Neizmireno" : "Sve je plaćeno"} />
        <StatTile label="Posete" value={String(completed)} hint={noShows ? `${noShows} propuštenih termina` : "Bez propuštenih termina"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="grid content-start gap-6">
          <Panel title={`Termini (${appts.length})`} bodyClass="p-0">
            {appts.length === 0 ? (
              <div className="p-5">
                <Empty>Pacijent još nema termina.</Empty>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {appts.map((a) => (
                  <li key={a.id}>
                    <Link prefetch={false}
                  href={`/admin/termini/${a.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-slate-50">
                      <span className="min-w-0">
                        <span className="block font-semibold text-ink">
                          {a.date ? `${fmtDateMedium(a.date, "sr")} ${a.startMin != null ? minToTime(a.startMin) : ""}` : "Zahtev bez termina"}
                        </span>
                        <span className="block truncate text-slate-500">
                          {a.serviceName}
                          {a.doctorName ? ` · ${doctorTitle(a.doctorName, "sr")}` : ""}
                        </span>
                      </span>
                      <StatusBadge status={a.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Radovi i uplate" bodyClass="p-0">
            <div className="grid divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="p-5">
                <h3 className="text-sm font-bold text-slate-500 uppercase">Radovi</h3>
                {treatments.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">Nema evidentiranih radova.</p>
                ) : (
                  <ul className="mt-3 grid gap-2 text-sm">
                    {treatments.map((t) => (
                      <li key={t.id} className="flex justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block truncate text-ink">
                            {t.description}
                            {t.tooth ? ` (zub ${t.tooth})` : ""}
                          </span>
                          <span className="text-xs text-slate-500">{fmtDateMedium(t.date, "sr")}</span>
                        </span>
                        <span className="font-semibold whitespace-nowrap tabular-nums">{rsd(t.total)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-sm font-bold text-slate-500 uppercase">Uplate</h3>
                {payments.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">Nema uplata.</p>
                ) : (
                  <ul className="mt-3 grid gap-2 text-sm">
                    {payments.map((y) => (
                      <li key={y.id} className="flex justify-between gap-3">
                        <span>
                          <span className="block text-ink">{METHOD_LABEL[y.method] ?? y.method}</span>
                          <span className="text-xs text-slate-500">
                            {fmtDateMedium(y.date, "sr")}
                            {y.note ? ` · ${y.note}` : ""}
                          </span>
                        </span>
                        <span className="font-semibold whitespace-nowrap tabular-nums">{rsd(y.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Panel>
        </div>

        <div className="grid content-start gap-6">
          <Panel title="Podaci o pacijentu">
            <PatientForm patient={p} />
          </Panel>
          <Panel title="Dodaj rad (van termina)">
            <TreatmentForm patientId={p.id} services={svcs.filter((x) => x.active).map((x) => ({ id: x.id, name: x.nameSr, price: x.priceFrom }))} today={now.date} />
          </Panel>
          <Panel title="Evidentiraj uplatu">
            <form action={addPaymentAction} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="patientId" value={p.id} />
              <div>
                <label htmlFor="pay-amount" className="mb-1 block text-[13px] font-semibold text-slate-600">
                  Iznos (RSD)
                </label>
                <input id="pay-amount" name="amount" type="number" min={1} className="input" defaultValue={balance.debt > 0 ? balance.debt : ""} required />
              </div>
              <div>
                <label htmlFor="pay-method" className="mb-1 block text-[13px] font-semibold text-slate-600">
                  Način plaćanja
                </label>
                <select id="pay-method" name="method" className="input">
                  {Object.entries(METHOD_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pay-date" className="mb-1 block text-[13px] font-semibold text-slate-600">
                  Datum
                </label>
                <input id="pay-date" name="date" type="date" className="input" defaultValue={now.date} />
              </div>
              <div>
                <label htmlFor="pay-note" className="mb-1 block text-[13px] font-semibold text-slate-600">
                  Napomena
                </label>
                <input id="pay-note" name="note" className="input" />
              </div>
              <div className="sm:col-span-2">
                <SubmitButton>Evidentiraj uplatu</SubmitButton>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
