import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Empty, PageHeader, SOURCE_LABEL, StatusBadge } from "@/components/admin/ui";
import { allDoctors, listAppointments, type ListFilter } from "@/lib/admin-data";
import { requireSession } from "@/lib/auth";
import { displayPhone } from "@/lib/phone";
import { doctorTitle } from "@/lib/site";
import { fmtDateMedium, minToTime } from "@/lib/time";

export const metadata: Metadata = { title: "Termini" };

const TABS: { key: ListFilter; label: string }[] = [
  { key: "upcoming", label: "Predstojeći" },
  { key: "today", label: "Danas" },
  { key: "pending", label: "Zahtevi na upit" },
  { key: "past", label: "Prošli" },
  { key: "cancelled", label: "Otkazani" },
  { key: "all", label: "Svi" },
];

type Props = { searchParams: Promise<{ filter?: string; q?: string; doc?: string }> };

function prefsText(json: string | null) {
  if (!json) return null;
  try {
    const p = JSON.parse(json) as { dates?: string[]; timeOfDay?: string };
    const tod: Record<string, string> = { morning: "pre podne", afternoon: "popodne", any: "bilo kad" };
    return `${(p.dates ?? []).map((d) => fmtDateMedium(d, "sr")).join(", ")}${p.timeOfDay ? ` · ${tod[p.timeOfDay] ?? ""}` : ""}`;
  } catch {
    return null;
  }
}

export default async function AppointmentsPage({ searchParams }: Props) {
  const s = await requireSession();
  const sp = await searchParams;
  const filter = (TABS.some((t) => t.key === sp.filter) ? sp.filter : "upcoming") as ListFilter;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const docFilter = s.role === "admin" && sp.doc ? Number(sp.doc) : null;
  const [rows, docs] = await Promise.all([listAppointments(s, filter, q, docFilter), allDoctors()]);
  const link = (patch: Record<string, string>) => {
    const p = new URLSearchParams({ filter, ...(q ? { q } : {}), ...(docFilter ? { doc: String(docFilter) } : {}), ...patch });
    return `/admin/termini?${p.toString()}`;
  };

  return (
    <>
      <PageHeader
        title="Termini"
        subtitle={`${rows.length} ${rows.length === 1 ? "termin" : "termina"}`}
        actions={
          <Link href="/admin/termini/novi" className="btn btn-brand">
            <Plus className="h-4 w-4" /> Novi termin
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav className="no-scrollbar flex gap-1 overflow-x-auto rounded-full border border-slate-200 bg-white p-1" aria-label="Filter termina">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={link({ filter: t.key })}
              aria-current={filter === t.key ? "page" : undefined}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ${filter === t.key ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <form className="flex gap-2" action="/admin/termini">
          <input type="hidden" name="filter" value={filter} />
          {s.role === "admin" && (
            <select name="doc" defaultValue={docFilter ?? ""} className="input w-auto py-2 text-sm">
              <option value="">Svi doktori</option>
              {docs.map((d) => (
                <option key={d.id} value={d.id}>
                  {doctorTitle(d.name, "sr")}
                </option>
              ))}
            </select>
          )}
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input name="q" defaultValue={q} placeholder="Ime, telefon, e-mail…" className="input w-56 py-2 pl-9 text-sm" />
          </div>
          <button className="btn btn-outline py-2 text-sm">Traži</button>
        </form>
      </div>

      {rows.length === 0 ? (
        <Empty>Nema termina za izabrani filter.</Empty>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="hidden grid-cols-[10.5rem_1.3fr_1.4fr_9rem_5.5rem_8.5rem] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-xs font-bold tracking-wide text-slate-500 uppercase lg:grid">
            <span>Termin</span>
            <span>Pacijent</span>
            <span>Usluga</span>
            <span>Doktor</span>
            <span>Izvor</span>
            <span>Status</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {rows.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/admin/termini/${a.id}`}
                  className="grid gap-1 px-5 py-3.5 hover:bg-slate-50 lg:grid-cols-[10.5rem_1.3fr_1.4fr_9rem_5.5rem_8.5rem] lg:items-center lg:gap-4"
                >
                  <span className="font-semibold whitespace-nowrap text-ink tabular-nums">
                    {a.date ? (
                      <>
                        {fmtDateMedium(a.date, "sr")}
                        <span className="ml-2 text-slate-500">{a.startMin != null ? minToTime(a.startMin) : ""}</span>
                      </>
                    ) : (
                      <span className="text-sm font-medium text-orange-700">{prefsText(a.preferences) ?? "bez termina"}</span>
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-ink">{a.patientName}</span>
                    <span className="block truncate text-sm text-slate-500">{displayPhone(a.patientPhone)}</span>
                  </span>
                  <span className="truncate text-sm text-slate-700">{a.serviceName}</span>
                  <span className="flex items-center gap-2 truncate text-sm text-slate-600">
                    {a.doctorColor && <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: a.doctorColor }} aria-hidden="true" />}
                    {a.doctorName ? doctorTitle(a.doctorName, "sr") : "Prvi slobodan"}
                  </span>
                  <span className="text-sm text-slate-500">{SOURCE_LABEL[a.source] ?? a.source}</span>
                  <span>
                    <StatusBadge status={a.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
