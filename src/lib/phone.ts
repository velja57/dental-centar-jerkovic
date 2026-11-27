/**
 * Normalizuje broj telefona: srpske brojeve u +381 format, strane ostavlja međunarodne.
 * "060 484 8086" → "+381604848086", "0049 151 …" → "+49151…"
 */
export function normalizePhone(input: string): string | null {
  let s = input.trim().replace(/[\s\-()./]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (!s.startsWith("+")) {
    if (s.startsWith("0")) s = "+381" + s.slice(1);
    else if (s.startsWith("381")) s = "+" + s;
    // Mobilni bez početne nule („64 123 4567“)
    else if (/^6\d{7,8}$/.test(s)) s = "+381" + s;
    else return null;
  }
  // „+381 064 …“ i „+381 (0)64 …“: nula posle pozivnog broja se ne bira. Ranije je ostajala u broju,
  // pa su poziv i WhatsApp iz admina vodili na nepostojeći broj, a isti pacijent je dobijao drugi karton.
  if (s.startsWith("+3810")) s = "+381" + s.slice(5);
  const digits = s.slice(1);
  if (!/^\d{8,15}$/.test(digits)) return null;
  return s;
}

/** Brojevi sačuvani pre ispravke u obliku „+3810…“ (višak nule posle pozivnog broja). */
function fixLegacy(e164: string) {
  return e164.startsWith("+3810") ? "+381" + e164.slice(5) : e164;
}

/** Lepši prikaz: +381604848086 → 060 484 8086 */
export function displayPhone(raw: string) {
  const e164 = fixLegacy(raw);
  if (e164.startsWith("+381")) {
    const local = "0" + e164.slice(4);
    if (local.length >= 9) return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
    return local;
  }
  return e164;
}

/** Broj za wa.me link (samo cifre) */
export function waNumber(e164: string) {
  return fixLegacy(e164).replace(/\D/g, "");
}

/** tel: link za pozivanje pacijenta iz admina */
export function telHref(e164: string) {
  return `tel:${fixLegacy(e164)}`;
}
