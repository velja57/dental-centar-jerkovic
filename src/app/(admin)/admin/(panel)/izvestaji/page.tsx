import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DailyColumns, RankedBars, SegmentBar } from "@/components/admin/charts";
import { METHOD_LABEL, PageHeader, Panel, rsd, STATUS_META, StatTile } from "@/components/admin/ui";
import { allDoctors, reportData } from "@/lib/admin-data";
import { requireSession } from "@/lib/auth";
import { fmtNumber } from "@/lib/format";
import { doctorTitle } from "@/lib/site";
import { fmtMonthYear, nowInClinic, shiftMonth } from "@/lib/time";

export const metadata: Metadata = { title: "Izveštaji" };

type Props = { searchParams: Promise<{ m?: string; doc?: string }> };

export default async function ReportsPage({ searchParams }: Props) {
  const s = await requireSession();
  const sp = await searchParams;
  const now = nowInClinic();
  const ym = sp.m && /^\d{4}-\d{2}$/.test(sp.m) ? sp.m : now.date.slice(0, 7);
  const docs = await allDoctors();
  const isAdmin = s.role === "admin";
  const doctorId = isAdmin ? (sp.doc && sp.doc !== "all" ? Number(sp.doc) : null) : s.id;
  const r = await reportData(ym, doctorId);
  const c = r.cur;
  const p = r.prv;
  const isCurrent = ym === now.date.slice(0, 7);
  const vs = isCurrent ? "vs isti period prošlog meseca" : `vs ${fmtMonthYear(shiftMonth(ym, -1), "sr")}`;
  const noShowRate = c.completed + c.noShow ? c.noShow / (c.completed + c.noShow) : 0;
  const prevNoShowRate = p.completed + p.noShow ? p.noShow / (p.completed + p.noShow) : 0;
  const link = (patch: Record<string, string>) => {
    const params = new URLSearchParams({ m: ym, ...(isAdmin && doctorId ? { doc: String(doctorId) } : {}), ...patch });
    return `/admin/izvestaji?${params.toString()}`;
  };
  const docById = new Map(docs.map((d) => [d.id, d]));
  const outcome = [
    { label: STATUS_META.completed.label, value: c.completed, color: STATUS_META.completed.dot },
    { label: "Predstoji", value: c.upcoming, color: STATUS_META.confirmed.dot },
    { label: STATUS_META.no_show.label, value: c.noShow, color: STATUS_META.no_show.dot },
    { label: STATUS_META.cancelled.label, value: c.cancelled, color: STATUS_META.cancelled.dot },
  ];

  return (
    <>
      <PageHeader
        title="Izveštaji"
        subtitle={
          <span className="inline-block first-letter:uppercase">
            {fmtMonthYear(ym, "sr")}
            {doctorId && docById.get(doctorId) ? ` · ${doctorTitle(docById.get(doctorId)!.name, "sr")}` : isAdmin ? " · cela ordinacija" : ""}
          </span>
        }
      />

      {/* Filteri: jedan red iznad svih grafikona */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
          <Link href={link({ m: shiftMonth(ym, -1) })} className="rounded-full p-1.5 text-slate-600 hover:bg-slate-100" aria-label="Prethodni mesec">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="px-2 text-sm font-semibold text-slate-700 capitalize">{fmtMonthYear(ym, "sr")}</span>
          <Link href={link({ m: shiftMonth(ym, 1) })} className="rounded-full p-1.5 text-slate-600 hover:bg-slate-100" aria-label="Sledeći mesec">
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {!isCurrent && (
          <Link href={link({ m: now.date.slice(0, 7) })} className="text-sm font-semibold text-brand-700">
            Tekući mesec
          </Link>
        )}
        {isAdmin && (
          <div className="flex flex-wrap gap-1.5">
            <Link
              href={`/admin/izvestaji?m=${ym}`}
              className={`rounded-full border px-3 py-1 text-sm font-semibold ${!doctorId ? "border-brand-600 bg-brand-50 text-brand-800" : "border-slate-200 bg-white text-slate-600"}`}
            >
              Cela ordinacija
            </Link>
            {docs.map((d) => (
              <Link
                key={d.id}
                href={link({ doc: String(d.id) })}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${
                  doctorId === d.id ? "border-brand-600 bg-brand-50 text-brand-800" : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} aria-hidden="true" />
                {doctorTitle(d.name, "sr")}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile label="Naplaćeno" value={rsd(c.revenue)} delta={{ current: c.revenue, previous: p.revenue, vs }} />
        <StatTile label="Zaduženo (urađeni radovi)" value={rsd(c.charged)} delta={{ current: c.charged, previous: p.charged, vs }} />
        <StatTile label="Završeni termini" value={fmtNumber(c.completed)} delta={{ current: c.completed, previous: p.completed, vs }} />
        <StatTile label="Novi pacijenti" value={fmtNumber(c.newPatients)} delta={{ current: c.newPatients, previous: p.newPatients, vs }} />
        <StatTile
          label="Stopa nedolazaka"
          value={`${Math.round(noShowRate * 100)}%`}
          delta={{ current: noShowRate, previous: prevNoShowRate, goodWhenUp: false, vs }}
        />
        <StatTile label="Zakazano online" value={`${Math.round(c.onlineShare * 100)}%`} hint={`${c.online} termina preko sajta`} />
      </div>

      <Panel title="Naplata po danima" className="mt-6">
        <DailyColumns data={r.daily} caption={`Naplata po danima, ${fmtMonthYear(ym, "sr")}`} />
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Najisplativije usluge (zaduženo)">
          <RankedBars rows={r.byService.map((x) => ({ label: x.name, value: x.total, sub: `${x.n}×` }))} format={rsd} />
        </Panel>
        <div className="grid content-start gap-6">
          {isAdmin && !doctorId && (
            <Panel title="Naplata po doktoru">
              <RankedBars
                rows={r.byDoctor
                  .map((x) => {
                    const d = x.doctorId ? docById.get(x.doctorId) : undefined;
                    return { label: d ? doctorTitle(d.name, "sr") : "Nepoznato", value: x.total, swatch: d?.color };
                  })
                  .sort((a, b) => b.value - a.value)}
                format={rsd}
              />
            </Panel>
          )}
          <Panel title="Način plaćanja">
            <RankedBars
              rows={r.byMethod.map((x) => ({ label: METHOD_LABEL[x.method] ?? x.method, value: x.total })).sort((a, b) => b.value - a.value)}
              format={rsd}
            />
          </Panel>
          <Panel title="Ishod termina">
            <SegmentBar parts={outcome} />
            <ul className="mt-4 grid gap-2 text-sm">
              {outcome.map((o) => (
                <li key={o.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: o.color }} aria-hidden="true" />
                    {o.label}
                  </span>
                  <span className="font-semibold tabular-nums">{o.value}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
