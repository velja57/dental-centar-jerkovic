import Link from "next/link";
import { Phone } from "lucide-react";
import { clinic, telLink, waLink } from "@/content/clinic";
import type { Dict } from "@/lib/dictionaries";
import { href, type Locale } from "@/lib/i18n";
import { Logo } from "./Logo";
import { LangSwitch, MobileNav, NavLinks } from "./NavClient";

export function Header({ locale, t }: { locale: Locale; t: Dict }) {
  const homeHref = href(locale, "home");
  const items = [
    { href: homeHref, label: t.nav.home },
    { href: href(locale, "services"), label: t.nav.services },
    { href: href(locale, "prices"), label: t.nav.prices },
    { href: href(locale, "team"), label: t.nav.team },
    { href: href(locale, "contact"), label: t.nav.contact },
  ];
  const bookHref = href(locale, "booking");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75">
      <div className="container-page flex h-[68px] items-center justify-between gap-4">
        <Link href={homeHref} aria-label={`${clinic.name}, ${t.nav.home}`} className="shrink-0">
          <Logo />
        </Link>
        <NavLinks items={items} homeHref={homeHref} />
        <div className="flex items-center gap-2 sm:gap-3">
          <LangSwitch locale={locale} label={t.nav.language} />
          <a href={telLink} className="hidden items-center gap-2 text-sm font-bold text-ink hover:text-brand-700 xl:flex">
            <Phone className="h-4 w-4 text-brand-600" />
            {clinic.phoneDisplay}
          </a>
          <Link href={bookHref} className="btn btn-primary hidden sm:inline-flex">
            {t.nav.book}
          </Link>
          <MobileNav
            items={items}
            homeHref={homeHref}
            bookHref={bookHref}
            phone={clinic.phoneDisplay}
            telHref={telLink}
            waHref={waLink(t.wa.greeting)}
            labels={{ menu: t.nav.menu, close: t.nav.close, book: t.nav.book, call: t.nav.call, whatsapp: t.floating.whatsapp }}
          />
        </div>
      </div>
    </header>
  );
}
