import type { Metadata } from "next";
import Link from "next/link";
import { Trash } from "lucide-react";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { PasswordForm, TimeOffForm } from "@/components/admin/forms";
import { KeepForm } from "@/components/admin/KeepForm";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { PageHeader, Panel, SPECIALTY_LABEL } from "@/components/admin/ui";
import { categories } from "@/content/services";
import {
  createServiceAction,
  deleteDemoDataAction,
  deleteTimeOffAction,
  saveScheduleAction,
  updateDoctorAction,
  updateServiceAction,
} from "@/lib/admin-actions";
import { allDoctors, allServices, scheduleRows, timeOffRows } from "@/lib/admin-data";
import { parseSlugs } from "@/lib/availability";
import { requireSession } from "@/lib/auth";
import { doctorTitle } from "@/lib/site";
import { fmtDateMedium, minToTime, nowInClinic, weekdayName } from "@/lib/time";

export const metadata: Metadata = { title: "Podešavanja" };

type Props = { searchParams: Promise<{ tab?: string }> };

const WEEK = [1, 2, 3, 4, 5, 6, 0];

export default async function SettingsPage({ searchParams }: Props) {
  const s = await requireSession();
  const isAdmin = s.role === "admin";
  const sp = await searchParams;
  const tabs = [
    ...(isAdmin ? [{ key: "usluge", label: "Usluge i cene" }] : []),
    { key: "radno-vreme", label: "Radno vreme" },
    { key: "odsustva", label: "Odsustva i praznici" },
    ...(isAdmin ? [{ key: "doktori", label: "Doktori" }] : []),
    { key: "nalog", label: "Moj nalog" },
    ...(isAdmin ? [{ key: "podaci", label: "Podaci" }] : []),
  ];
  const tab = tabs.some((t) => t.key === sp.tab) ? sp.tab! : tabs[0].key;
  const [docs, svcs, sch, offs] = await Promise.all([allDoctors(), allServices(), scheduleRows(), timeOffRows()]);
  const now = nowInClinic();
  const editableDocs = isAdmin ? docs : docs.filter((d) => d.id === s.id);

  return (
    <>
      <PageHeader title="Podešavanja" />
      <nav className="no-scrollbar mb-6 flex gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white p-1" aria-label="Podešavanja">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/podesavanja?tab=${t.key}`}
            aria-current={tab === t.key ? "page" : undefined}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold ${tab === t.key ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "usluge" && isAdmin && (
        <div className="grid gap-6">
          <p className="text-sm text-slate-500">
            Izmene cena i trajanja odmah važe na sajtu (cenovnik, zakazivanje). „Na upit“ znači da pacijent šalje zahtev, a vi predlažete termin.
          </p>
          {categories.map((cat) => {
            const list = svcs.filter((x) => x.category === cat.key);
            if (!list.length) return null;
            return (
              <Panel key={cat.key} title={cat.title.sr} bodyClass="p-0">
                <ul className="divide-y divide-slate-100">
                  {list.map((x) => {
                    const slugs = parseSlugs(x.doctorSlugs);
                    return (
                      <li key={x.id} className="p-4">
                        <KeepForm action={updateServiceAction} className="grid items-end gap-3 md:grid-cols-12">
                          <input type="hidden" name="id" value={x.id} />
                          <div className="md:col-span-4">
                            <label className="mb-1 block text-[12px] font-semibold text-slate-500">Naziv (srpski / engleski)</label>
                            <input name="nameSr" defaultValue={x.nameSr} className="input py-2 text-sm" />
                            <input name="nameEn" defaultValue={x.nameEn} className="input mt-1.5 py-1.5 text-xs text-slate-500" />
                          </div>
                          <div className="md:col-span-1">
                            <label className="mb-1 block text-[12px] font-semibold text-slate-500">Min</label>
                            <input name="durationMin" type="number" min={5} step={5} defaultValue={x.durationMin} className="input py-2 text-sm" />
                          </div>
                          <div className="md:col-span-2">
                            <label className="mb-1 block text-[12px] font-semibold text-slate-500">Cena</label>
                            <select name="priceType" defaultValue={x.priceType} className="input py-2 text-sm">
                              <option value="fixed">Fiksna</option>
                              <option value="from">Od</option>
                              <option value="range">Od–do</option>
                              <option value="free">Besplatno</option>
                              <option value="request">Na upit</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="mb-1 block text-[12px] font-semibold text-slate-500">RSD (od / do)</label>
                            <div className="flex gap-1.5">
                              <input name="priceFrom" type="number" min={0} defaultValue={x.priceFrom} className="input py-2 text-sm" />
                              <input name="priceTo" type="number" min={0} defaultValue={x.priceTo ?? ""} className="input py-2 text-sm" placeholder="do" />
                            </div>
                          </div>
                          <div className="md:col-span-3">
                            <label className="mb-1 block text-[12px] font-semibold text-slate-500">Zakazivanje</label>
                            <select name="bookingMode" defaultValue={x.bookingMode} className="input py-2 text-sm">
                              <option value="instant">Odmah potvrđeno</option>
                              <option value="request">Na upit</option>
                            </select>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm md:col-span-9">
                            <span className="text-[12px] font-semibold text-slate-500">Rade:</span>
                            {docs.map((d) => (
                              <label key={d.id} className="flex items-center gap-1.5">
                                <input type="checkbox" name="doctorSlugs" value={d.slug} defaultChecked={slugs.includes(d.slug)} className="h-4 w-4 accent-brand-600" />
                                {doctorTitle(d.name, "sr")}
                              </label>
                            ))}
                            <label className="flex items-center gap-1.5">
                              <input type="checkbox" name="popular" value="1" defaultChecked={x.popular} className="h-4 w-4 accent-brand-600" /> Istaknuta
                            </label>
                            <label className="flex items-center gap-1.5">
                              <input type="checkbox" name="active" value="1" defaultChecked={x.active} className="h-4 w-4 accent-brand-600" /> Aktivna
                            </label>
                          </div>
                          <div className="md:col-span-3 md:text-right">
                            <SubmitButton className="btn btn-outline btn-sm" doneText="Sačuvano">
                              Sačuvaj
                            </SubmitButton>
                          </div>
                        </KeepForm>
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            );
          })}
          <Panel title="Nova usluga">
            <form action={createServiceAction} className="grid items-end gap-3 md:grid-cols-6">
              <div className="md:col-span-2">
                <label className="mb-1 block text-[12px] font-semibold text-slate-500">Naziv</label>
                <input name="nameSr" className="input py-2 text-sm" required />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-semibold text-slate-500">Oblast</label>
                <select name="category" className="input py-2 text-sm">
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.title.sr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-semibold text-slate-500">Trajanje (min)</label>
                <input name="durationMin" type="number" min={5} step={5} defaultValue={30} className="input py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-semibold text-slate-500">Cena (RSD)</label>
                <input name="priceFrom" type="number" min={0} className="input py-2 text-sm" />
              </div>
              <div>
                <select name="bookingMode" className="input py-2 text-sm">
                  <option value="instant">Odmah potvrđeno</option>
                  <option value="request">Na upit</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-4 text-sm md:col-span-5">
                {docs.map((d) => (
                  <label key={d.id} className="flex items-center gap-1.5">
                    <input type="checkbox" name="doctorSlugs" value={d.slug} className="h-4 w-4 accent-brand-600" />
                    {doctorTitle(d.name, "sr")}
                  </label>
                ))}
              </div>
              <div className="md:text-right">
                <SubmitButton className="btn btn-brand btn-sm">Dodaj uslugu</SubmitButton>
              </div>
            </form>
          </Panel>
        </div>
      )}

      {tab === "radno-vreme" && (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {editableDocs.map((d) => (
            <Panel key={d.id} title={doctorTitle(d.name, "sr")}>
              <form action={saveScheduleAction} className="grid gap-2.5">
                <input type="hidden" name="doctorId" value={d.id} />
                {WEEK.map((wd) => {
                  const row = sch.find((r) => r.doctorId === d.id && r.weekday === wd);
                  return (
                    <div key={wd} className="grid grid-cols-[7.5rem_1fr_1fr] items-center gap-2 text-sm">
                      <label className="flex items-center gap-2 capitalize">
                        <input type="checkbox" name={`on_${wd}`} value="1" defaultChecked={!!row} className="h-4 w-4 accent-brand-600" />
                        {weekdayName(wd, "sr")}
                      </label>
                      <input name={`from_${wd}`} type="time" step={900} defaultValue={row ? minToTime(row.startMin) : "09:00"} className="input py-1.5 text-sm" />
                      <input name={`to_${wd}`} type="time" step={900} defaultValue={row ? minToTime(row.endMin) : "17:00"} className="input py-1.5 text-sm" />
                    </div>
                  );
                })}
                <div className="pt-2">
                  <SubmitButton className="btn btn-outline btn-sm" doneText="Raspored je sačuvan">
                  Sačuvaj raspored
                </SubmitButton>
                </div>
              </form>
            </Panel>
          ))}
        </div>
      )}

      {tab === "odsustva" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
          <Panel title="Predstojeća odsustva i praznici" bodyClass="p-0">
            {offs.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">Nema unetih odsustava.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {offs.map(({ t, doctorName }) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <span>
                      <span className="block font-semibold text-ink">
                        {fmtDateMedium(t.dateFrom, "sr")}
                        {t.dateTo !== t.dateFrom ? ` – ${fmtDateMedium(t.dateTo, "sr")}` : ""}
                        {t.startMin != null && t.endMin != null ? `, ${minToTime(t.startMin)}–${minToTime(t.endMin)}` : ", ceo dan"}
                      </span>
                      <span className="block text-slate-500">
                        {doctorName ? doctorTitle(doctorName, "sr") : "Cela ordinacija"}
                        {t.reason ? ` · ${t.reason}` : ""}
                      </span>
                    </span>
                    {(isAdmin || t.doctorId === s.id) && (
                      <form action={deleteTimeOffAction}>
                        <input type="hidden" name="id" value={t.id} />
                        <ConfirmSubmit
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          ariaLabel="Obriši odsustvo"
                          question="Obrisati odsustvo?"
                          confirmLabel="Da, obriši"
                        >
                          <Trash className="h-4 w-4" />
                        </ConfirmSubmit>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Dodaj odsustvo">
            <TimeOffForm
              doctors={editableDocs.map((d) => ({ id: d.id, name: doctorTitle(d.name, "sr") }))}
              allowClinicWide={isAdmin}
              defaultWho={isAdmin ? "all" : String(s.id)}
              today={now.date}
            />
          </Panel>
        </div>
      )}

      {tab === "doktori" && isAdmin && (
        <div className="grid gap-4 lg:grid-cols-3">
          {docs.map((d) => (
            <Panel key={d.id} title={doctorTitle(d.name, "sr")}>
              <form action={updateDoctorAction} className="grid gap-3">
                <input type="hidden" name="id" value={d.id} />
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-slate-600">Ime i prezime (bez „dr“)</label>
                  <input name="name" defaultValue={d.name} className="input" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[13px] font-semibold text-slate-600">Boja u kalendaru</label>
                    <input name="color" type="color" defaultValue={d.color} className="h-11 w-full cursor-pointer rounded-xl border border-slate-300 bg-white p-1" />
                  </div>
                  <div>
                    <label className="mb-1 block text-[13px] font-semibold text-slate-600">Oblast</label>
                    <p className="input bg-slate-50 text-sm">{SPECIALTY_LABEL[d.specialty] ?? d.specialty}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Korisničko ime: <strong className="text-ink">{d.username}</strong> · {d.role === "admin" ? "administrator" : "doktor"}
                </p>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="active" value="1" defaultChecked={d.active} className="h-4 w-4 accent-brand-600" /> Aktivan (prikazan na sajtu i u zakazivanju)
                </label>
                <div>
                  <SubmitButton className="btn btn-outline btn-sm" doneText="Sačuvano">
                    Sačuvaj
                  </SubmitButton>
                </div>
              </form>
            </Panel>
          ))}
          <p className="text-sm text-slate-500 lg:col-span-3">Biografije i oblasti rada na stranici „Tim“ menjaju se u fajlu src/content/team.ts.</p>
        </div>
      )}

      {tab === "nalog" && (
        <Panel title="Promena lozinke" className="max-w-xl">
          <PasswordForm />
        </Panel>
      )}

      {tab === "podaci" && isAdmin && (
        <Panel title="Demo podaci" className="max-w-xl">
          <p className="text-sm text-slate-600">
            Baza je napunjena izmišljenim pacijentima i terminima da biste videli kako panel izgleda. Pre početka rada obrišite ih. Brišu se samo
            demo pacijenti i njihovi termini, radovi i uplate.
          </p>
          <form action={deleteDemoDataAction} className="mt-4 grid gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" name="confirm" value="1" required className="h-4 w-4 accent-red-600" /> Razumem, obriši demo podatke
            </label>
            <div>
              <SubmitButton className="btn btn-danger btn-sm">Obriši demo podatke</SubmitButton>
            </div>
          </form>
        </Panel>
      )}
    </>
  );
}
