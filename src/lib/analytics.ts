import { track as vercelTrack } from "@vercel/analytics";

/**
 * Konverzije koje sajt meri (Vercel Web Analytics: bez kolačića, anonimno).
 * PRAVILO: nikada ne slati ime, telefon, e-mail, napomenu, token termina ni konkretnu uslugu —
 * samo vrstu događaja i grubu kategoriju. Ako se kasnije doda GA4/Google Ads, dodaje se OVDE (uz saglasnost za kolačiće).
 */
export type ConversionEvent =
  | "phone_click"
  | "whatsapp_click"
  | "viber_click"
  | "email_click"
  | "directions_click"
  | "google_profile_click"
  | "review_click"
  | "map_open"
  | "booking_cta_click"
  | "booking_completed";

export function track(event: ConversionEvent, props?: Record<string, string | number | boolean>) {
  try {
    vercelTrack(event, props);
  } catch {
    // merenje nikada ne sme da pokvari sajt
  }
}
