import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { clinic, mapsDirectionsUrl, telLink } from "@/content/clinic";
import { categories } from "@/content/services";
import type { Dict } from "@/lib/dictionaries";
import { href, serviceCategoryHref, type Locale } from "@/lib/i18n";
import { InstagramIcon } from "./BrandIcons";
import { HoursList } from "./HoursList";
import { Logo } from "./Logo";

export function Footer({ locale, t }: { locale: Locale; t: Dict }) {
  const links = [
    { href: href(locale, "services"), label: t.nav.services },
    { href: href(locale, "prices"), label: t.nav.prices },
    { href: href(locale, "team"), label: t.nav.team },
    { href: href(locale, "booking"), label: t.nav.book },
    { href: href(locale, "contact"), label: t.nav.contact },
  ];
  return (
    <footer className="bg-brand-950 text-brand-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.25fr_0.75fr_1fr_1.1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-brand-100/75">{t.footer.tagline}</p>
          <Link href={href(locale, "booking")} className="btn btn-primary mt-6">
            {t.common.bookOnline}
          </Link>
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-wider text-white uppercase">{t.footer.explore}</h2>
          <ul className="mt-4 grid gap-2.5 text-[15px]">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-brand-100/80 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-wider text-white uppercase">{t.nav.services}</h2>
          <ul className="mt-4 grid gap-2.5 text-[15px]">
            {categories.map((c) => (
              <li key={c.key}>
                <Link href={serviceCategoryHref(locale, c.key)} className="text-brand-100/80 hover:text-white">
                  {c.title[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-wider text-white uppercase">{t.footer.contact}</h2>
          <ul className="mt-4 grid gap-3 text-[15px]">
            <li>
              <a href={mapsDirectionsUrl} target="_blank" rel="noopener" className="flex gap-2.5 text-brand-100/80 hover:text-white">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                <span>
                  {clinic.address.street}
                  <br />
                  {clinic.address.postalCode} {clinic.address.city}, {clinic.address.region}
                </span>
              </a>
            </li>
            <li>
              <a href={telLink} className="flex items-center gap-2.5 text-brand-100/80 hover:text-white">
                <Phone className="h-4 w-4 shrink-0 text-brand-300" />
                {clinic.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${clinic.email}`} className="flex items-center gap-2.5 break-all text-brand-100/80 hover:text-white">
                <Mail className="h-4 w-4 shrink-0 text-brand-300" />
                {clinic.email}
              </a>
            </li>
            {clinic.social.instagram && (
              <li>
                <a href={clinic.social.instagram} target="_blank" rel="noopener" className="flex items-center gap-2.5 text-brand-100/80 hover:text-white">
                  <InstagramIcon className="h-4 w-4 shrink-0 text-brand-300" />
                  {t.footer.follow}
                </a>
              </li>
            )}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-wider text-white uppercase">{t.footer.hours}</h2>
          <div className="mt-4">
            <HoursList locale={locale} closedLabel={t.common.closed} dark />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-6 text-sm text-brand-100/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {clinic.name}. {t.footer.rights}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href={href(locale, "privacy")} className="hover:text-white">
              {t.footer.privacy}
            </Link>
            <Link href="/admin/login" className="hover:text-white" prefetch={false}>
              {t.footer.staff}
            </Link>
            <span>{t.footer.photos}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
