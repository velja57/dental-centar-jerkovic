import type { Metadata } from "next";
import Link from "next/link";
import { RunJobsForm } from "@/components/admin/forms";
import { Empty, PageHeader, Panel } from "@/components/admin/ui";
import { outboxList } from "@/lib/admin-data";
import { requireSession } from "@/lib/auth";
import { fmtStamp } from "@/lib/time";

export const metadata: Metadata = { title: "Poruke" };

const KIND: Record<string, string> = {
  confirmed: "Potvrda termina",
  request_received: "Zahtev primljen",
  request_confirmed: "Zahtev zakazan",
  rescheduled: "Termin pomeren",
  cancelled_patient: "Otkazao pacijent",
  cancelled_clinic: "Otkazala ordinacija",
  reminder: "Podsetnik (dan pre)",
  review_request: "Molba za recenziju",
  recall: "Poziv na kontrolu",
};

const STATUS: Record<string, { label: string; cls: string }> = {
  sent: { label: "Poslato", cls: "bg-green-50 text-green-800" },
  logged: { label: "Samo zabeleženo", cls: "bg-slate-100 text-slate-600" },
  failed: { label: "Greška", cls: "bg-red-50 text-red-700" },
};

export default async function OutboxPage() {
  const s = await requireSession();
  const rows = await outboxList(150);
  const sendingEnabled = !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

  return (
    <>
      <PageHeader title="Poruke" subtitle="Svi automatski e-mailovi pacijentima i ordinaciji." />
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Slanje e-mailova">
          {sendingEnabled ? (
            <p className="text-sm text-green-800">Slanje je uključeno: e-mailovi odlaze pacijentima.</p>
          ) : (
            <p className="text-sm text-slate-600">
              Slanje još <strong>nije uključeno</strong> (nedostaje RESEND_API_KEY). Mejlovi se samo beleže ovde da vidite kako izgledaju. Uključuje se pri
              objavi sajta.
            </p>
          )}
        </Panel>
        {s.role === "admin" && (
          <Panel title="Automatski podsetnici">
            <p className="mb-3 text-sm text-slate-600">
              Svakog jutra se šalju: podsetnik za sutrašnje termine, molba za Google recenziju posle posete i poziv na kontrolu posle 6 meseci. Ovde možete
              pokrenuti ručno.
            </p>
            <RunJobsForm />
          </Panel>
        )}
      </div>

      {rows.length === 0 ? (
        <Empty>Još nema poruka.</Empty>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {rows.map((m) => {
              const st = STATUS[m.status] ?? STATUS.logged;
              return (
                <li key={m.id}>
                  <details className="group">
                    <summary className="flex flex-col gap-1 px-5 py-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-4">
                      <span className="w-36 shrink-0 text-xs text-slate-500 tabular-nums">{fmtStamp(m.createdAt)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-ink">{m.subject}</span>
                        <span className="block truncate text-sm text-slate-500">
                          {KIND[m.kind.replace(/^clinic_/, "")] ?? m.kind}
                          {m.kind.startsWith("clinic_") ? " · za ordinaciju" : ""} · {m.to}
                        </span>
                      </span>
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                    </summary>
                    <div className="border-t border-slate-100 bg-slate-50 p-4">
                      {m.appointmentId && (
                        <Link href={`/admin/termini/${m.appointmentId}`} className="mb-3 inline-block text-sm font-semibold text-brand-700">
                          Otvori termin →
                        </Link>
                      )}
                      {m.error && <p className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">{m.error}</p>}
                      <iframe title={m.subject} srcDoc={m.html} sandbox="" className="h-[560px] w-full rounded-xl border border-slate-200 bg-white" />
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
