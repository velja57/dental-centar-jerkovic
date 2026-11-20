import { clinic } from "@/content/clinic";
import type { Loc } from "@/lib/time";

export function fmtNumber(n: number, loc: Loc = "sr") {
  const sign = n < 0 ? "-" : "";
  return sign + Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, loc === "sr" ? "." : ",");
}

export function fmtRsd(n: number, loc: Loc = "sr") {
  return `${fmtNumber(n, loc)} RSD`;
}

export function toEur(rsd: number) {
  const eur = rsd / clinic.eurRate;
  return eur >= 100 ? Math.round(eur / 5) * 5 : Math.round(eur);
}

export type PriceInfo = {
  priceType: string; // fixed | from | range | free | request
  priceFrom: number;
  priceTo: number | null;
  priceUnitSr?: string | null;
  priceUnitEn?: string | null;
};

export type PriceWords = { free: string; onRequest: string; from: string };

/** Glavni prikaz cene + opciono evri za stranu publiku. */
export function priceParts(p: PriceInfo, loc: Loc, words: PriceWords) {
  const unit = loc === "sr" ? p.priceUnitSr : p.priceUnitEn;
  let main: string;
  let eurText: string | null = null;
  switch (p.priceType) {
    case "free":
      main = words.free;
      break;
    case "request":
      main = words.onRequest;
      break;
    case "range":
      main = `${fmtNumber(p.priceFrom, loc)} – ${fmtRsd(p.priceTo ?? p.priceFrom, loc)}`;
      eurText = `≈ €${toEur(p.priceFrom)}–${toEur(p.priceTo ?? p.priceFrom)}`;
      break;
    case "from":
      main = `${words.from} ${fmtRsd(p.priceFrom, loc)}`;
      eurText = `≈ ${words.from} €${toEur(p.priceFrom)}`;
      break;
    default:
      main = fmtRsd(p.priceFrom, loc);
      eurText = `≈ €${toEur(p.priceFrom)}`;
  }
  return { main, unit: unit ?? null, eur: loc === "en" ? eurText : null };
}

export function priceText(p: PriceInfo, loc: Loc, words: PriceWords) {
  const { main, unit } = priceParts(p, loc, words);
  return unit ? `${main} ${unit}` : main;
}

export function initials(name: string) {
  return name
    .replace(/^(dr|Dr\.?)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
