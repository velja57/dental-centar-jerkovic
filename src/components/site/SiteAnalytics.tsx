"use client";

import { useEffect } from "react";
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { track, type ConversionEvent } from "@/lib/analytics";
import { href } from "@/lib/i18n";

const BOOKING_PATHS = new Set([href("sr", "booking"), href("en", "booking")]);

// Link za upravljanje terminom sadrži tajni token → nikada ga ne šaljemo u analitiku.
function redact(event: BeforeSendEvent): BeforeSendEvent {
  return { ...event, url: event.url.replace(/\/(termin|appointment)\/[^/?#]+/, "/$1/[token]") };
}

function classify(el: Element): ConversionEvent | null {
  const explicit = el.getAttribute("data-track");
  if (explicit) return explicit as ConversionEvent;
  const raw = el.getAttribute("href");
  if (!raw) return null;
  if (raw.startsWith("tel:")) return "phone_click";
  if (raw.startsWith("viber:")) return "viber_click";
  if (raw.startsWith("mailto:")) return "email_click";
  if (raw.includes("wa.me/")) return "whatsapp_click";
  if (raw.includes("google.com/maps/dir")) return "directions_click";
  if (raw.includes("/local/writereview")) return "review_click";
  if (raw.includes("google.com/maps") || raw.includes("search.google.com/local")) return "google_profile_click";
  try {
    const url = new URL(raw, window.location.href);
    if (url.origin === window.location.origin && BOOKING_PATHS.has(url.pathname)) return "booking_cta_click";
  } catch {
    // neispravan href — ignorišemo
  }
  return null;
}

/**
 * Jedan osluškivač klikova za ceo sajt (event delegation): svaki klik se broji tačno jednom,
 * bez dodavanja koda na svako dugme. Oblast (header, footer, dock…) pomaže da vidimo koje dugme radi.
 */
export function SiteAnalytics() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as Element | null)?.closest?.("a[href], [data-track]");
      if (!el) return;
      const event = classify(el);
      if (!event) return;
      const area = el.closest<HTMLElement>("[data-area]")?.dataset.area ?? (el.closest("header") ? "header" : el.closest("footer") ? "footer" : "content");
      track(event, { area });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return <Analytics beforeSend={redact} />;
}
