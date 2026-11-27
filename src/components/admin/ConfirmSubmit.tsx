"use client";

import { useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";

/**
 * Dugme za radnju koja se ne može vratiti (brisanje uplate ili rada, otkazivanje termina).
 * Prvi dodir samo pita „Sigurno?“; tek „Da“ šalje formular. Na telefonu je kanta odmah pored
 * iznosa, pa je slučajan dodir ranije brisao uplatu bez traga.
 */
export function ConfirmSubmit({
  children,
  className,
  ariaLabel,
  question,
  confirmLabel,
}: {
  children: ReactNode;
  className: string;
  ariaLabel?: string;
  question: string;
  confirmLabel: string;
}) {
  const [asking, setAsking] = useState(false);
  const { pending } = useFormStatus();

  if (!asking) {
    return (
      <button type="button" onClick={() => setAsking(true)} aria-label={ariaLabel} className={className}>
        {children}
      </button>
    );
  }
  return (
    <span role="group" aria-label={question} className="inline-flex flex-wrap items-center gap-1.5 text-xs">
      <span className="font-semibold text-red-800">{question}</span>
      <button
        type="submit"
        disabled={pending}
        autoFocus
        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 font-bold text-white hover:bg-red-700 disabled:opacity-70"
      >
        {pending && <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
        {confirmLabel}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setAsking(false)}
        className="rounded-lg px-2 py-1.5 font-semibold text-slate-600 hover:bg-slate-100"
      >
        Ne
      </button>
    </span>
  );
}
