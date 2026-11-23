export default function CalendarLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Učitavanje kalendara">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="h-8 w-40 rounded-lg bg-slate-200" />
          <div className="mt-2 h-4 w-56 rounded bg-slate-200/70" />
        </div>
        <div className="h-10 w-36 rounded-full bg-slate-200" />
      </div>
      <div className="mb-4 flex gap-3">
        <div className="h-9 w-40 rounded-full bg-slate-200" />
        <div className="h-9 w-32 rounded-full bg-slate-200" />
      </div>
      <div className="grid grid-cols-[52px_repeat(3,1fr)] overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div />
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="border-b border-l border-slate-200 px-3 py-3">
            <div className="h-4 w-28 rounded bg-slate-200" />
          </div>
        ))}
        <div className="h-[560px]" />
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="relative h-[560px] border-l border-slate-200 bg-slate-50/60">
            <div className="absolute inset-x-2 top-[90px] h-10 rounded-lg bg-slate-200/80" />
            <div className="absolute inset-x-2 top-[260px] h-16 rounded-lg bg-slate-200/80" />
          </div>
        ))}
      </div>
    </div>
  );
}
