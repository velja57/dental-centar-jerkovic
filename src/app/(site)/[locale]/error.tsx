"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Phone, RotateCw } from "lucide-react";
import { WhatsAppIcon } from "@/components/site/BrandIcons";
import { DentalIcon } from "@/components/site/DentalIcon";
import { clinic, telLink, waLink } from "@/content/clinic";

// Kada stranica ne može da se učita (npr. baza kratko nije dostupna), umesto tehničke poruke bez
// ikakvog kontakta pacijent vidi objašnjenje, „Pokušaj ponovo“ i telefon/WhatsApp. Zaglavlje i
// podnožje sajta ostaju (dolaze iz layout-a).
const TEXT = {
  sr: {
    title: "Stranica trenutno ne može da se učita",
    text: "Došlo je do privremene greške. Pokušajte ponovo za trenutak. Termin možete zakazati i telefonom ili porukom.",
    retry: "Pokušaj ponovo",
    call: "Pozovite",
    whatsapp: "Pišite na WhatsApp",
  },
  en: {
    title: "This page can't be loaded right now",
    text: "A temporary error occurred. Please try again in a moment. You can also book by phone or message.",
    retry: "Try again",
    call: "Call",
    whatsapp: "Message us on WhatsApp",
  },
};

export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  const pathname = usePathname();
  const t = TEXT[pathname === "/en" || pathname.startsWith("/en/") ? "en" : "sr"];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <DentalIcon name="tooth" className="h-9 w-9" />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold text-balance text-ink sm:text-4xl">{t.title}</h1>
      <p className="lead mt-4 max-w-md">{t.text}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className="btn btn-primary">
          <RotateCw className="h-4 w-4" /> {t.retry}
        </button>
        <a href={telLink} className="btn btn-outline">
          <Phone className="h-4 w-4" /> {t.call} {clinic.phoneDisplay}
        </a>
        <a href={waLink()} target="_blank" rel="noopener" className="btn bg-[#25D366]/12 text-[#128C4B] hover:bg-[#25D366]/20">
          <WhatsAppIcon className="h-4 w-4" /> {t.whatsapp}
        </a>
      </div>
    </section>
  );
}
