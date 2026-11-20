"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

/** Google mapa se učitava tek na klik: brža stranica i bez Google kolačića dok korisnik ne želi mapu. */
export function MapFacade({ embedUrl, title, buttonLabel, note }: { embedUrl: string; title: string; buttonLabel: string; note: string }) {
  const [show, setShow] = useState(false);
  if (show) {
    return (
      <iframe
        src={embedUrl}
        title={title}
        className="h-full min-h-80 w-full rounded-3xl border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => setShow(true)}
      className="group relative flex h-full min-h-80 w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border border-brand-100 bg-brand-50 text-center"
    >
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full text-brand-200/70" preserveAspectRatio="none" viewBox="0 0 400 300">
        <path d="M0 210 C80 180 120 240 200 200 S320 150 400 180" fill="none" stroke="currentColor" strokeWidth="14" />
        <path d="M120 0 C140 80 90 160 150 300" fill="none" stroke="currentColor" strokeWidth="10" />
        <path d="M300 0 L260 300" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M0 90 L400 60" fill="none" stroke="currentColor" strokeWidth="5" />
      </svg>
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-coral-600 text-white shadow-lift transition group-hover:scale-110">
        <MapPin className="h-7 w-7" />
      </span>
      <span className="relative text-base font-bold text-brand-900">{buttonLabel}</span>
      <span className="relative max-w-xs px-4 text-xs text-brand-800/70">{note}</span>
    </button>
  );
}
