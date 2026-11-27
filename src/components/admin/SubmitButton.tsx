"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Check, LoaderCircle } from "lucide-react";

export function SubmitButton({
  children,
  className = "btn btn-brand",
  pendingText,
  doneText,
}: {
  children: ReactNode;
  className?: string;
  pendingText?: string;
  /** Kratka potvrda posle čuvanja (formulari bez druge poruke, npr. cene u podešavanjima). */
  doneText?: string;
}) {
  const { pending } = useFormStatus();
  const wasPending = useRef(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const finished = wasPending.current && !pending;
    wasPending.current = pending;
    if (!finished || !doneText) return;
    setDone(true);
    const t = setTimeout(() => setDone(false), 2500);
    return () => clearTimeout(t);
  }, [pending, doneText]);

  const button = (
    <button type="submit" disabled={pending} className={className}>
      {pending && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
  if (!doneText) return button;
  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      {button}
      <span role="status" className="inline-flex items-center gap-1 text-sm font-semibold text-green-700">
        {done && (
          <>
            <Check className="h-4 w-4" aria-hidden="true" /> {doneText}
          </>
        )}
      </span>
    </span>
  );
}
