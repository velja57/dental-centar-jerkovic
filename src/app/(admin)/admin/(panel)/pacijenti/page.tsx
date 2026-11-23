import type { Metadata } from "next";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { PatientForm } from "@/components/admin/forms";
import { Empty, PageHeader, rsd } from "@/components/admin/ui";
import { listPatients } from "@/lib/admin-data";
import { requireSession } from "@/lib/auth";
import { displayPhone } from "@/lib/phone";
import { fmtDateMedium } from "@/lib/time";

export const metadata: Metadata = { title: "Pacijenti" };

type Props = { searchParams: Promise<{ q?: string; dug?: string }> };

export default async function PatientsPage({ searchParams }: Props) {
  await requireSession();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const onlyDebt = sp.dug === "1";
  let rows = await listPatients(q);
  if (onlyDebt) rows = rows.filter((r) => r.charged - r.paid > 0);

  return (
    <>
      <PageHeader title="Pacijenti" subtitle={`${rows.length} ${onlyDebt ? "sa dugom" : "u bazi"}`} />

      <details className="group mb-5 rounded-2xl border border-slate-200 bg-white">
        <summary className="flex items-center gap-2 px-5 py-3.5 font-bold text-brand-700">
          <UserPlus className="h-4 w-4" /> Novi pacijent
        </summary>
        <div className="border-t border-slate-100 p-5">
          <PatientForm />
        </div>
      </details>

      <form className="mb-4 flex flex-wrap gap-2" action="/admin/pacijenti">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={q} placeholder="Ime, telefon ili e-mail" className="input w-72 py-2 pl-9 text-sm" />
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600">
          <input type="checkbox" name="dug" value="1" defaultChecked={onlyDebt} className="h-4 w-4 accent-brand-600" /> Samo sa dugom
        </label>
        <button className="btn btn-outline py-2 text-sm">Primeni</button>
      </form>

      {rows.length === 0 ? (
        <Empty>Nema pacijenata za ovu pretragu.</Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-2.5">Pacijent</th>
                <th className="px-3 py-2.5">Telefon</th>
                <th className="px-3 py-2.5">Poslednja poseta</th>
                <th className="px-3 py-2.5">Sledeći termin</th>
                <th className="px-3 py-2.5 text-right">Posete</th>
                <th className="px-5 py-2.5 text-right">Dug</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((p) => {
                const debt = p.charged - p.paid;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link prefetch={false} href={`/admin/pacijenti/${p.id}`} className="font-bold text-ink hover:text-brand-700">
                        {p.fullName}
                      </Link>
                      {p.guardianName && <span className="block text-xs text-slate-500">roditelj: {p.guardianName}</span>}
                      {p.source === "demo" && <span className="badge mt-1 bg-slate-100 text-slate-500">demo</span>}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-slate-600">{displayPhone(p.phone)}</td>
                    <td className="px-3 py-3 text-slate-600">{p.lastVisit ? fmtDateMedium(p.lastVisit, "sr") : "—"}</td>
                    <td className="px-3 py-3 text-slate-600">{p.nextVisit ? fmtDateMedium(p.nextVisit, "sr") : "—"}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{p.visits}</td>
                    <td className={`px-5 py-3 text-right font-semibold tabular-nums ${debt > 0 ? "text-red-700" : "text-slate-400"}`}>{debt > 0 ? rsd(debt) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
