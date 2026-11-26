"use client";

import { useEffect, useState } from "react";
import { fmtSlotRelative, nowInClinic, type Loc } from "@/lib/time";

type Slot = { date: string; start: number; today: string } | null;

/**
 * „Prvi slobodan termin“ na početnoj. Stranica je keširana (posle mirovanja sajta Vercel prvo posluži
 * staru verziju), pa serverska vrednost može biti od juče: „Danas u 16:00“ bi tada bilo netačno.
 * Zato se odmah po učitavanju „Danas/Sutra“ računa prema današnjem datumu, termin koji je prošao
 * se sakriva, a sveža vrednost stiže sa /api/next-slot.
 */
export function NextSlot({ initial, locale, fallback, leadMinutes }: { initial: Slot; locale: Loc; fallback: string; leadMinutes: number }) {
  const [slot, setSlot] = useState<Slot>(initial);

  useEffect(() => {
    const now = nowInClinic();
    setSlot((s) => {
      if (!s) return s;
      const tooLate = s.date < now.date || (s.date === now.date && s.start < now.minutes + leadMinutes);
      return tooLate ? null : { ...s, today: now.date };
    });

    const ctrl = new AbortController();
    fetch("/api/next-slot", { signal: ctrl.signal })
      .then((r) => (r.ok ? (r.json() as Promise<Slot>) : Promise.reject(new Error(String(r.status)))))
      .then((fresh) => setSlot(fresh))
      .catch(() => {
        // bez mreže ostaje provereni (ili opšti) tekst, link ionako vodi na sve slobodne termine
      });
    return () => ctrl.abort();
  }, [leadMinutes]);

  return <>{slot ? fmtSlotRelative(slot.date, slot.start, locale, slot.today) : fallback}</>;
}
