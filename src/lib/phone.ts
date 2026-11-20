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
    else return null;
  }
  const digits = s.slice(1);
  if (!/^\d{8,15}$/.test(digits)) return null;
  return s;
}

/** Lepši prikaz: +381604848086 → 060 484 8086 */
export function displayPhone(e164: string) {
  if (e164.startsWith("+381")) {
    const local = "0" + e164.slice(4);
    if (local.length >= 9) return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
    return local;
  }
  return e164;
}

/** Broj za wa.me link (samo cifre) */
export function waNumber(e164: string) {
  return e164.replace(/\D/g, "");
}
