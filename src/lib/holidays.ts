// Neradni dani u Srbiji (Zakon o državnim i drugim praznicima): online zakazivanje ih automatski
// preskače, da pacijent ne zakaže termin za Novu godinu ili Božić kada ordinacija ne radi.
// Isključuje se u src/content/clinic.ts (booking.closedOnHolidays), npr. ako ordinacija radi i za praznike.
import { addDays, weekdayOf } from "@/lib/time";

export type Holiday = { date: string; sr: string; en: string };

const pad = (n: number) => String(n).padStart(2, "0");

/** Pravoslavni Vaskrs (julijanski računanje + 13 dana; važi za godine 1900–2099). */
export function orthodoxEaster(year: number) {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  return addDays(`${year}-${pad(month)}-${pad(day)}`, 13);
}

const cache = new Map<number, Holiday[]>();

export function holidaysOfYear(year: number): Holiday[] {
  const hit = cache.get(year);
  if (hit) return hit;
  const ymd = (m: number, d: number) => `${year}-${pad(m)}-${pad(d)}`;
  // Državni praznici: ako padnu u nedelju, ne radi se ni prvi naredni radni dan
  const state: Holiday[] = [
    { date: ymd(1, 1), sr: "Nova godina", en: "New Year" },
    { date: ymd(1, 2), sr: "Nova godina", en: "New Year" },
    { date: ymd(2, 15), sr: "Sretenje", en: "Statehood Day" },
    { date: ymd(2, 16), sr: "Sretenje", en: "Statehood Day" },
    { date: ymd(5, 1), sr: "Praznik rada", en: "Labour Day" },
    { date: ymd(5, 2), sr: "Praznik rada", en: "Labour Day" },
    { date: ymd(11, 11), sr: "Dan primirja", en: "Armistice Day" },
  ];
  const easter = orthodoxEaster(year);
  const religious: Holiday[] = [
    { date: ymd(1, 7), sr: "Božić", en: "Orthodox Christmas" },
    { date: addDays(easter, -2), sr: "Vaskrs", en: "Orthodox Easter" },
    { date: addDays(easter, -1), sr: "Vaskrs", en: "Orthodox Easter" },
    { date: easter, sr: "Vaskrs", en: "Orthodox Easter" },
    { date: addDays(easter, 1), sr: "Vaskrs", en: "Orthodox Easter" },
  ];
  const all = [...state, ...religious];
  const taken = new Set(all.map((h) => h.date));
  for (const h of state) {
    if (weekdayOf(h.date) !== 0) continue;
    let next = addDays(h.date, 1);
    while (weekdayOf(next) === 0 || taken.has(next)) next = addDays(next, 1);
    taken.add(next);
    all.push({ date: next, sr: `${h.sr} (prenet neradni dan)`, en: `${h.en} (observed)` });
  }
  // Isti dan može biti dva praznika (npr. 2. maj 2027. je i Praznik rada i Vaskrs): jedan red, oba naziva
  const byDate = new Map<string, Holiday>();
  for (const h of all) {
    const prev = byDate.get(h.date);
    byDate.set(h.date, prev ? { date: h.date, sr: `${prev.sr} i ${h.sr}`, en: `${prev.en} and ${h.en}` } : h);
  }
  const list = [...byDate.values()].sort((x, y) => x.date.localeCompare(y.date));
  cache.set(year, list);
  return list;
}

export function holidayOn(date: string): Holiday | null {
  return holidaysOfYear(Number(date.slice(0, 4))).find((h) => h.date === date) ?? null;
}

/** Praznici u periodu [from, to] (za prikaz u adminu). */
export function holidaysBetween(from: string, to: string): Holiday[] {
  const out: Holiday[] = [];
  for (let y = Number(from.slice(0, 4)); y <= Number(to.slice(0, 4)); y++) {
    for (const h of holidaysOfYear(y)) if (h.date >= from && h.date <= to) out.push(h);
  }
  return out;
}
