"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle, Phone, RotateCw } from "lucide-react";
import { addDays, minToTime, monthShort, parseDate, weekdayName, weekdayOf, type Loc } from "@/lib/time";

export type SlotLabels = {
  chooseDay: string;
  chooseTime: string;
  morning: string;
  afternoon: string;
  evening: string;
  loading: string;
  noSlotsDay: string;
  noSlotsRange: string;
  loadError: string;
  retry: string;
  closedDay: string;
  fullDay: string;
  prevDays: string;
  nextDays: string;
};

export type SlotContact = { phone: string; telHref: string };

type Day = { date: string; open: boolean; slots: { start: number; doctorIds: number[] }[] };
type Resp = { days: Day[]; today: string; horizonEnd: string };

const PAGE = 14;

export function useAvailability(
  serviceId: number,
  doctorId: number | null,
  from: string | null,
  refreshKey = 0,
  excludeToken?: string,
  enabled = true,
) {
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const ctrl = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const qs = new URLSearchParams({ serviceId: String(serviceId), days: String(PAGE) });
    if (doctorId) qs.set("doctorId", String(doctorId));
    if (from) qs.set("from", from);
    if (excludeToken) qs.set("exclude", excludeToken);
    setLoading(true);
    setError(false);
    const load = (retriesLeft: number) => {
      fetch(`/api/availability?${qs.toString()}`, { signal: ctrl.signal, cache: "no-store" })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((json: Resp) => {
          setData(json);
          setLoading(false);
        })
        .catch(() => {
          if (ctrl.signal.aborted) return;
          // Kratak prekid mreže ili spor prvi odziv baze: jednom tiho pokušaj ponovo, pa tek onda prijavi grešku
          if (retriesLeft > 0) {
            timer = setTimeout(() => load(retriesLeft - 1), 1200);
            return;
          }
          setError(true);
          setLoading(false);
        });
    };
    load(1);
    return () => {
      ctrl.abort();
      if (timer) clearTimeout(timer);
    };
  }, [serviceId, doctorId, from, refreshKey, excludeToken, enabled, attempt]);

  return { data, loading, error, retry: () => setAttempt((n) => n + 1) };
}

/** Greška pri učitavanju nije isto što i „nema termina“: kažemo šta se desilo i nudimo ponovni pokušaj i poziv. */
function LoadError({ labels, onRetry, contact }: { labels: SlotLabels; onRetry: () => void; contact?: SlotContact }) {
  return (
    <div role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">
      <p>{labels.loadError}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 font-bold text-red-800 hover:border-red-300"
        >
          <RotateCw className="h-4 w-4" /> {labels.retry}
        </button>
        {contact && (
          <a href={contact.telHref} className="inline-flex items-center gap-1.5 font-bold text-brand-700">
            <Phone className="h-4 w-4" /> {contact.phone}
          </a>
        )}
      </div>
    </div>
  );
}

export function SlotPicker({
  serviceId,
  doctorId,
  locale,
  labels,
  selected,
  onSelect,
  refreshKey = 0,
  excludeToken,
  contact,
}: {
  serviceId: number;
  doctorId: number | null;
  locale: Loc;
  labels: SlotLabels;
  selected: { date: string; start: number } | null;
  onSelect: (date: string, start: number) => void;
  refreshKey?: number;
  excludeToken?: string;
  contact?: SlotContact;
}) {
  const [from, setFrom] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(selected?.date ?? null);
  const { data, loading, error, retry } = useAvailability(serviceId, doctorId, from, refreshKey, excludeToken);

  // Kad stignu podaci: izaberi prvi dan sa slobodnim terminima (ako trenutno izabrani nije u prikazu)
  useEffect(() => {
    if (!data) return;
    const inRange = data.days.some((d) => d.date === activeDate && d.slots.length > 0);
    if (!inRange) {
      const first = data.days.find((d) => d.slots.length > 0);
      setActiveDate(first?.date ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const day = data?.days.find((d) => d.date === activeDate) ?? null;
  const groups = useMemo(() => {
    const slots = day?.slots ?? [];
    return [
      { label: labels.morning, items: slots.filter((s) => s.start < 720) },
      { label: labels.afternoon, items: slots.filter((s) => s.start >= 720 && s.start < 1020) },
      { label: labels.evening, items: slots.filter((s) => s.start >= 1020) },
    ].filter((g) => g.items.length > 0);
  }, [day, labels]);

  const firstDate = data?.days[0]?.date;
  const lastDate = data?.days[data.days.length - 1]?.date;
  const canPrev = !!data && !!firstDate && firstDate > data.today;
  const canNext = !!data && !!lastDate && lastDate < data.horizonEnd;
  const anySlots = data?.days.some((d) => d.slots.length > 0);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-ink">{labels.chooseDay}</h3>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => firstDate && data && setFrom(addDays(firstDate, -PAGE) < data.today ? data.today : addDays(firstDate, -PAGE))}
            disabled={!canPrev || loading}
            aria-label={labels.prevDays}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 disabled:opacity-35"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => lastDate && setFrom(addDays(lastDate, 1))}
            disabled={!canNext || loading}
            aria-label={labels.nextDays}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 disabled:opacity-35"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="no-scrollbar -mx-1 mt-3 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
        {(data?.days ?? Array.from({ length: 7 }, (_, i) => ({ date: `skeleton-${i}`, open: false, slots: [] }))).map((d) => {
          if (d.date.startsWith("skeleton")) {
            return <div key={d.date} className="h-[84px] w-[68px] shrink-0 animate-pulse rounded-2xl bg-slate-100" />;
          }
          const has = d.slots.length > 0;
          const isActive = d.date === activeDate;
          return (
            <button
              key={d.date}
              type="button"
              disabled={!has}
              onClick={() => setActiveDate(d.date)}
              aria-pressed={isActive}
              className={`flex h-[84px] w-[68px] shrink-0 snap-start flex-col items-center justify-center rounded-2xl border text-center transition ${
                isActive
                  ? "border-brand-600 bg-brand-600 text-white shadow-soft"
                  : has
                    ? "border-slate-200 bg-white text-ink hover:border-brand-300"
                    : "border-transparent bg-slate-50 text-slate-400"
              }`}
            >
              <span className={`text-[11px] font-bold uppercase ${isActive ? "text-brand-100" : "text-slate-500"}`}>
                {weekdayName(weekdayOf(d.date), locale, true)}
              </span>
              <span className="text-xl leading-tight font-extrabold">{parseDate(d.date).d}</span>
              <span className={`text-[11px] font-semibold ${isActive ? "text-brand-100" : has ? "text-slate-500" : "text-slate-400"}`}>
                {has ? monthShort(d.date, locale) : d.open ? labels.fullDay : labels.closedDay}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 min-h-40" aria-live="polite">
        {loading && (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <LoaderCircle className="h-4 w-4 animate-spin" /> {labels.loading}
          </p>
        )}
        {!loading && error && <LoadError labels={labels} onRetry={retry} contact={contact} />}
        {!loading && !error && !anySlots && <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{labels.noSlotsRange}</p>}
        {!loading && !error && anySlots && (
          <>
            <h3 className="text-base font-bold text-ink">{labels.chooseTime}</h3>
            {groups.length === 0 && <p className="mt-3 text-sm text-slate-500">{labels.noSlotsDay}</p>}
            <div className="mt-3 grid gap-4">
              {groups.map((g) => (
                <div key={g.label}>
                  <p className="mb-2 text-xs font-bold tracking-wide text-slate-500 uppercase">{g.label}</p>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {g.items.map((s) => {
                      const isSel = selected?.date === activeDate && selected?.start === s.start;
                      return (
                        <button
                          key={s.start}
                          type="button"
                          onClick={() => activeDate && onSelect(activeDate, s.start)}
                          aria-pressed={isSel}
                          className={`rounded-xl border px-2 py-2.5 text-[15px] font-bold tabular-nums transition ${
                            isSel ? "border-coral-600 bg-coral-600 text-white" : "border-slate-200 bg-white text-ink hover:border-brand-400 hover:bg-brand-50"
                          }`}
                        >
                          {minToTime(s.start)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Izbor do 3 željena dana (za usluge na upit). */
export function PreferredDaysPicker({
  serviceId,
  locale,
  labels,
  value,
  onChange,
  max = 3,
  contact,
}: {
  serviceId: number;
  locale: Loc;
  labels: SlotLabels;
  value: string[];
  onChange: (dates: string[]) => void;
  max?: number;
  contact?: SlotContact;
}) {
  const { data, loading, error, retry } = useAvailability(serviceId, null, null);
  const [extra, setExtra] = useState<string | null>(null);
  // Druga stranica dana se učitava tek kada je korisnik zatraži (ranije se isti period učitavao dvaput)
  const next = useAvailability(serviceId, null, extra, 0, undefined, extra !== null);
  const days = [...(data?.days ?? []), ...(extra ? (next.data?.days ?? []) : [])].filter((d) => d.open);

  if (!loading && error) return <LoadError labels={labels} onRetry={retry} contact={contact} />;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(loading || next.loading) && <LoaderCircle className="h-5 w-5 animate-spin text-slate-400" />}
        {days.map((d) => {
          const on = value.includes(d.date);
          return (
            <button
              key={d.date}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((x) => x !== d.date) : value.length < max ? [...value, d.date] : value)}
              className={`flex w-[68px] flex-col items-center rounded-2xl border py-2.5 transition ${
                on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-ink hover:border-brand-300"
              }`}
            >
              <span className={`text-[11px] font-bold uppercase ${on ? "text-brand-100" : "text-slate-500"}`}>{weekdayName(weekdayOf(d.date), locale, true)}</span>
              <span className="text-lg font-extrabold">{parseDate(d.date).d}</span>
              <span className={`text-[11px] font-semibold ${on ? "text-brand-100" : "text-slate-500"}`}>{monthShort(d.date, locale)}</span>
            </button>
          );
        })}
      </div>
      {!extra && data && data.days.length > 0 && (
        <button type="button" onClick={() => setExtra(addDays(data.days[data.days.length - 1].date, 1))} className="mt-3 text-sm font-bold text-brand-700">
          {labels.nextDays} →
        </button>
      )}
      {extra && !next.loading && next.error && (
        <div className="mt-3">
          <LoadError labels={labels} onRetry={next.retry} contact={contact} />
        </div>
      )}
    </div>
  );
}
