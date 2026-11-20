// Sva vremena termina čuvamo kao lokalno vreme ordinacije (Beograd):
// datum "YYYY-MM-DD" + minuti od ponoći. Ovde su pomoćne funkcije za rad s tim.

export const CLINIC_TZ = "Europe/Belgrade";
export type Loc = "sr" | "en";

const pad = (n: number) => String(n).padStart(2, "0");

function zonedParts(at: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CLINIC_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    y: get("year"),
    m: get("month"),
    d: get("day"),
    h: get("hour"),
    min: get("minute"),
    s: get("second"),
  };
}

/** Trenutni datum i minut u Beogradu (nezavisno od vremenske zone servera). */
export function nowInClinic(at: Date = new Date()) {
  const p = zonedParts(at);
  return { date: `${p.y}-${pad(p.m)}-${pad(p.d)}`, minutes: p.h * 60 + p.min };
}

export function parseDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d };
}

export function isValidDate(s: string | null | undefined): s is string {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const { y, m, d } = parseDate(s);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function addDays(date: string, n: number) {
  const { y, m, d } = parseDate(date);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** 0 = nedelja, 1 = ponedeljak … 6 = subota */
export function weekdayOf(date: string) {
  const { y, m, d } = parseDate(date);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function diffDays(from: string, to: string) {
  const a = parseDate(from);
  const b = parseDate(to);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000);
}

/** Ponedeljak u nedelji kojoj datum pripada. */
export function startOfWeek(date: string) {
  return addDays(date, -((weekdayOf(date) + 6) % 7));
}

export function minToTime(min: number) {
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
}

export function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function isValidTime(t: string | null | undefined): t is string {
  return !!t && /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
}

export function monthRange(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from: `${y}-${pad(m)}-01`, to: `${y}-${pad(m)}-${pad(last)}`, days: last };
}

export function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}`;
}

function tzOffsetMs(at: Date) {
  const p = zonedParts(at);
  return Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - Math.floor(at.getTime() / 1000) * 1000;
}

/** Pretvara lokalno vreme ordinacije u pravi trenutak (UTC Date). */
export function clinicToUtc(date: string, minutes: number): Date {
  const { y, m, d } = parseDate(date);
  const guess = Date.UTC(y, m - 1, d, Math.floor(minutes / 60), minutes % 60);
  const first = guess - tzOffsetMs(new Date(guess));
  return new Date(guess - tzOffsetMs(new Date(first)));
}

/** Koliko minuta ima do početka termina (negativno ako je prošao). */
export function minutesUntil(date: string, startMin: number) {
  return Math.round((clinicToUtc(date, startMin).getTime() - Date.now()) / 60_000);
}

// ——— Formatiranje (sopstveni nazivi, da server i pregledač daju identičan tekst) ———

const SR_DAYS = ["nedelja", "ponedeljak", "utorak", "sreda", "četvrtak", "petak", "subota"];
const SR_DAYS_SHORT = ["ned", "pon", "uto", "sre", "čet", "pet", "sub"];
const SR_MONTHS = ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"];
const SR_MONTHS_GEN = ["januara", "februara", "marta", "aprila", "maja", "juna", "jula", "avgusta", "septembra", "oktobra", "novembra", "decembra"];
const SR_MONTHS_SHORT = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "avg", "sep", "okt", "nov", "dec"];
const EN_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const EN_DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const EN_MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function weekdayName(weekday: number, loc: Loc, short = false) {
  if (loc === "sr") return (short ? SR_DAYS_SHORT : SR_DAYS)[weekday];
  return (short ? EN_DAYS_SHORT : EN_DAYS)[weekday];
}

export function monthShort(date: string, loc: Loc) {
  const { m } = parseDate(date);
  return (loc === "sr" ? SR_MONTHS_SHORT : EN_MONTHS_SHORT)[m - 1];
}

/** "utorak, 17. novembra 2026." / "Tuesday, 17 November 2026" */
export function fmtDateLong(date: string, loc: Loc) {
  const { y, m, d } = parseDate(date);
  const wd = weekdayOf(date);
  return loc === "sr" ? `${SR_DAYS[wd]}, ${d}. ${SR_MONTHS_GEN[m - 1]} ${y}.` : `${EN_DAYS[wd]}, ${d} ${EN_MONTHS[m - 1]} ${y}`;
}

/** "uto, 17. nov" / "Tue, 17 Nov" */
export function fmtDateMedium(date: string, loc: Loc) {
  const { m, d } = parseDate(date);
  const wd = weekdayOf(date);
  return loc === "sr" ? `${SR_DAYS_SHORT[wd]}, ${d}. ${SR_MONTHS_SHORT[m - 1]}` : `${EN_DAYS_SHORT[wd]}, ${d} ${EN_MONTHS_SHORT[m - 1]}`;
}

/** "17.11.2026." */
export function fmtDateNumeric(date: string) {
  const { y, m, d } = parseDate(date);
  return `${pad(d)}.${pad(m)}.${y}.`;
}

/** "novembar 2026." / "November 2026" */
export function fmtMonthYear(ym: string, loc: Loc) {
  const [y, m] = ym.split("-").map(Number);
  return loc === "sr" ? `${SR_MONTHS[m - 1]} ${y}.` : `${EN_MONTHS[m - 1]} ${y}`;
}

/** UTC vreme iz baze ("2026-11-17 14:49:03" ili ISO) → beogradsko vreme { date, minutes } */
export function stampToClinic(utc: string) {
  const iso = utc.includes("T") ? utc : utc.replace(" ", "T");
  const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  return Number.isNaN(d.getTime()) ? null : nowInClinic(d);
}

/** "17.11.2026. 15:49" po beogradskom vremenu */
export function fmtStamp(utc: string) {
  const c = stampToClinic(utc);
  return c ? `${fmtDateNumeric(c.date)} ${minToTime(c.minutes)}` : utc;
}

/** "Danas u 15:30" / "Sutra u 08:30" / "uto, 18. nov u 11:00" */
export function fmtSlotRelative(date: string, start: number, loc: Loc, today: string) {
  const at = loc === "sr" ? "u" : "at";
  const diff = diffDays(today, date);
  if (diff === 0) return `${loc === "sr" ? "Danas" : "Today"} ${at} ${minToTime(start)}`;
  if (diff === 1) return `${loc === "sr" ? "Sutra" : "Tomorrow"} ${at} ${minToTime(start)}`;
  return `${fmtDateMedium(date, loc)} ${at} ${minToTime(start)}`;
}
