import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock, Mail, MapPin, Phone } from "lucide-react";
import { ViberIcon, WhatsAppIcon } from "@/components/site/BrandIcons";
import { HoursList } from "@/components/site/HoursList";
import { MapFacade } from "@/components/site/MapFacade";
import { PageHero } from "@/components/site/ui";
import { clinic, mapsDirectionsUrl, mapsEmbedUrl, telLink, viberLink, waLink } from "@/content/clinic";
import { getDict } from "@/lib/dictionaries";
import { alternates, href, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = getDict(locale);
  return { title: t.contactPage.title, description: t.contactPage.subtitle, alternates: alternates(locale, "contact") };
}

export default async function ContactPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const t = getDict(locale);
  const channels = [
    { href: telLink, label: t.nav.call, value: clinic.phoneDisplay, icon: <Phone className="h-6 w-6" />, tone: "bg-brand-50 text-brand-700", external: false },
    { href: waLink(t.wa.greeting), label: t.contactPage.writeWhatsApp, value: "WhatsApp", icon: <WhatsAppIcon className="h-6 w-6" />, tone: "bg-[#25D366]/12 text-[#128C4B]", external: true },
    { href: viberLink, label: t.contactPage.writeViber, value: "Viber", icon: <ViberIcon className="h-6 w-6" />, tone: "bg-[#7360F2]/10 text-[#5b48d6]", external: false },
    { href: `mailto:${clinic.email}`, label: t.contactPage.sendEmail, value: clinic.email, icon: <Mail className="h-6 w-6" />, tone: "bg-coral-50 text-coral-600", external: false },
  ];

  return (
    <>
      <PageHero eyebrow={t.nav.contact} title={t.contactPage.title} subtitle={t.contactPage.subtitle}>
        <Link href={href(locale, "booking")} className="btn btn-primary btn-lg mt-8">
          <CalendarCheck className="h-5 w-5" /> {t.common.bookOnline}
        </Link>
      </PageHero>
      <section className="pb-16">
        <div className="container-page">
          <h2 className="sr-only">{t.contactPage.channels}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener" } : {})}
                className="card group flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${c.tone}`}>{c.icon}</span>
                <span>
                  <span className="block text-sm font-semibold text-slate-500">{c.label}</span>
                  <span className="mt-0.5 block font-bold break-all text-ink">{c.value}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className="pb-20 md:pb-28">
        <div className="container-page grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <MapFacade embedUrl={mapsEmbedUrl} title={clinic.mapsQuery} buttonLabel={t.common.showMap} note={t.common.mapNote} />
          <div className="card p-7">
            <h2 className="text-xl font-extrabold text-ink">{t.contactPage.findUs}</h2>
            <p className="mt-4 flex gap-2.5 text-[15px] text-slate-700">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <span>
                {clinic.address.street}
                <br />
                {clinic.address.postalCode} {clinic.address.city}, {clinic.address.region}
              </span>
            </p>
            <a href={mapsDirectionsUrl} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
              {t.common.directions} <ArrowRight className="h-4 w-4" />
            </a>
            <h3 className="mt-8 flex items-center gap-2 text-lg font-bold text-ink">
              <Clock className="h-5 w-5 text-brand-600" /> {t.common.hours}
            </h3>
            <div className="mt-3">
              <HoursList locale={locale} closedLabel={t.common.closed} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
