import Link from "next/link";
import { CalendarCheck, Phone } from "lucide-react";
import { telLink, viberLink, waLink } from "@/content/clinic";
import type { Dict } from "@/lib/dictionaries";
import { href, type Locale } from "@/lib/i18n";
import { ViberIcon, WhatsAppIcon } from "./BrandIcons";

/** Desktop: plutajuća WhatsApp/Viber dugmad. Telefon: traka na dnu ekrana (Pozovi · WhatsApp · Zakaži). */
export function ContactDock({ locale, t }: { locale: Locale; t: Dict }) {
  return (
    <>
      <div data-area="dock" className="fixed right-5 bottom-5 z-40 hidden flex-col gap-3 md:flex">
        <a
          href={viberLink}
          aria-label={t.floating.viber}
          title={t.floating.viber}
          className="flex h-13 w-13 items-center justify-center rounded-full bg-[#7360F2] text-white shadow-lift transition hover:scale-105"
        >
          <ViberIcon className="h-6 w-6" />
        </a>
        <a
          href={waLink(t.wa.greeting)}
          target="_blank"
          rel="noopener"
          aria-label={t.floating.whatsapp}
          title={t.floating.whatsapp}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition hover:scale-105"
        >
          <WhatsAppIcon className="h-7 w-7" />
        </a>
      </div>

      <div data-area="dock" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-2">
          <a href={telLink} className="btn btn-outline px-2 py-2.5 text-sm">
            <Phone className="h-4 w-4" />
            {t.nav.call}
          </a>
          <a href={waLink(t.wa.greeting)} target="_blank" rel="noopener" className="btn bg-[#25D366]/12 px-2 py-2.5 text-sm text-[#128C4B]">
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>
          <Link href={href(locale, "booking")} className="btn btn-primary px-2 py-2.5 text-sm">
            <CalendarCheck className="h-4 w-4" />
            {t.nav.book}
          </Link>
        </div>
      </div>
    </>
  );
}
