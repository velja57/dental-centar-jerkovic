import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { Search, UserRound, X } from "lucide-react";
import { NewAppointmentForm } from "@/components/admin/forms";
import { PageHeader, Panel } from "@/components/admin/ui";
import { categories } from "@/content/services";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { allDoctors, allServices, listPatients } from "@/lib/admin-data";
import { requireSession } from "@/lib/auth";
import { displayPhone } from "@/lib/phone";
import { doctorTitle } from "@/lib/site";
import { isValidDate, isValidTime, nowInClinic } from "@/lib/time";

export const metadata: Metadata = { title: "Novi termin" };

type Props = { searchParams: Promise<{ date?: string; time?: string; doctor?: string; patient?: string; q?: string; service?: string }> };

export default async function NewAppointmentPage({ searchParams }: Props) {
  const s = await requireSession();
  const sp = await searchParams;
  const now = nowInClinic();
  const [docsAll, svcs] = await Promise.all([allDoctors(), allServices()]);
  const docs = docsAll.filter((d) => d.active && (s.role === "admin" || d.id === s.id));
  const patientId = Number(sp.patient);
  const [patient] = Number.isInteger(patientId) ? await db.select().from(patients).where(eq(patients.id, patientId)) : [];
  const q = (sp.q ?? "").trim();
  const results = !patient && q ? (await listPatients(q)).slice(0, 8) : [];

  const keep = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { date: sp.date, time: sp.time, doctor: sp.doctor, service: sp.service, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `/admin/termini/novi?${p.toString()}`;
  };

  const doctorDefault = Number(sp.doctor);
  return (
    <>
      <PageHeader title="Novi termin" subtitle="Za pacijente koji zakazuju telefonom ili u ordinaciji." />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Panel title="Detalji termina">
          {patient && (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-brand-50 px-4 py-3">
              <span className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-brand-700" />
                <span>
                  <span className="block font-bold text-ink">{patient.fullName}</span>
                  <span className="block text-sm text-slate-600">{displayPhone(patient.phone)}</span>
                </span>
              </span>
              <Link href={keep({ patient: undefined })} className="rounded-full p-1.5 text-slate-500 hover:bg-white" aria-label="Promeni pacijenta">
                <X className="h-4 w-4" />
              </Link>
            </div>
          )}
          <NewAppointmentForm
            services={svcs
              .filter((x) => x.active)
              .map((x) => ({
                id: x.id,
                name: x.nameSr,
                category: x.category,
                categoryTitle: categories.find((c) => c.key === x.category)?.title.sr ?? x.category,
                durationMin: x.durationMin,
              }))}
            doctors={docs.map((d) => ({ id: d.id, name: doctorTitle(d.name, "sr") }))}
            defaults={{
              date: isValidDate(sp.date) ? sp.date : now.date,
              time: isValidTime(sp.time) ? sp.time : "",
              doctorId: Number.isInteger(doctorDefault) && docs.some((d) => d.id === doctorDefault) ? doctorDefault : (docs[0]?.id ?? null),
              serviceId: Number(sp.service) || null,
            }}
            patient={patient ? { id: patient.id, fullName: patient.fullName, phone: patient.phone, email: patient.email } : null}
          />
        </Panel>

        {!patient && (
          <Panel title="Postojeći pacijent">
            <form action="/admin/termini/novi" className="flex gap-2">
              {Object.entries({ date: sp.date, time: sp.time, doctor: sp.doctor, service: sp.service }).map(([k, v]) =>
                v ? <input key={k} type="hidden" name={k} value={v} /> : null,
              )}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input name="q" defaultValue={q} placeholder="Ime ili telefon" className="input py-2 pl-9 text-sm" />
              </div>
              <button className="btn btn-outline py-2 text-sm">Traži</button>
            </form>
            {q && (
              <ul className="mt-4 divide-y divide-slate-100">
                {results.length === 0 && <li className="py-3 text-sm text-slate-500">Nema rezultata — unesite novog pacijenta u formi.</li>}
                {results.map((p) => (
                  <li key={p.id}>
                    <Link href={keep({ patient: String(p.id) })} className="flex items-center justify-between gap-3 py-2.5 hover:text-brand-700">
                      <span>
                        <span className="block font-semibold text-ink">{p.fullName}</span>
                        <span className="block text-sm text-slate-500">{displayPhone(p.phone)}</span>
                      </span>
                      <span className="text-sm font-bold text-brand-700">Izaberi</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-sm text-slate-500">Ako pacijent već postoji u bazi, izaberite ga ovde. U suprotnom popunite polja „Novi pacijent“.</p>
          </Panel>
        )}
      </div>
    </>
  );
}
