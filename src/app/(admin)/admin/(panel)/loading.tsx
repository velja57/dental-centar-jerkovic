// Prikazuje se ODMAH posle klika u meniju, dok server sprema podatke (Next.js ga i unapred učitava).
export default function AdminLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Učitavanje">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="h-8 w-56 rounded-lg bg-slate-200" />
          <div className="mt-2 h-4 w-40 rounded bg-slate-200/70" />
        </div>
        <div className="hidden h-10 w-36 rounded-full bg-slate-200 sm:block" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-[104px] rounded-2xl border border-slate-200 bg-white p-5">
            <div className="h-3.5 w-28 rounded bg-slate-200" />
            <div className="mt-3 h-7 w-32 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="h-4 w-40 rounded bg-slate-200" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="h-9 w-14 rounded bg-slate-200" />
              <div className="flex-1">
                <div className="h-4 w-48 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-32 rounded bg-slate-200/70" />
              </div>
              <div className="h-6 w-20 rounded-full bg-slate-200/80" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
