import type { Metadata } from "next";
import { BellRing, CalendarCheck, ShieldCheck } from "lucide-react";
import { BookingWizard, type WCategory, type WDoctor, type WService } from "@/components/booking/BookingWizard";
import { isCategoryKey } from "@/content/category-slugs";
import { clinic, telLink } from "@/content/clinic";
import { categories } from "@/content/services";
import { teamContent } from "@/content/team";
import { parseSlugs } from "@/lib/availability";
import { getDict } from "@/lib/dictionaries";
import { initials, priceParts, priceText } from "@/lib/format";
import { alternates, href, type Locale } from "@/lib/i18n";
import { getActiveDoctors, getActiveServices } from "@/lib/public-data";
import { doctorTitle } from "@/lib/site";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ usluga?: string; doktor?: string; kategorija?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = getDict(locale);
  return { title: t.booking.title, description: t.booking.subtitle, alternates: alternates(locale, "booking") };
}

export default async function BookingPage({ params, searchParams }: Props) {
  const locale = (await params).locale as Locale;
  const sp = await searchParams;
  const t = getDict(locale);
  const [svcs, docs] = await Promise.all([getActiveServices(), getActiveDoctors()]);
  const words = { free: t.common.free, onRequest: t.common.onRequest, from: t.common.from };
  const idBySlug = new Map(docs.map((d) => [d.slug, d.id]));

  const services: WService[] = svcs.map((s) => ({
    id: s.id,
    slug: s.slug,
    category: s.category,
    name: locale === "sr" ? s.nameSr : s.nameEn,
    durationMin: s.durationMin,
    price: priceText(s, locale, words),
    priceEur: priceParts(s, locale, words).eur,
    mode: s.bookingMode === "request" ? "request" : "instant",
    doctorIds: parseSlugs(s.doctorSlugs)
      .map((slug) => idBySlug.get(slug))
      .filter((x): x is number => typeof x === "number"),
    popular: s.popular,
  }));
  const cats: WCategory[] = categories
    .filter((c) => services.some((s) => s.category === c.key))
    .map((c) => ({ key: c.key, title: c.title[locale], icon: c.icon }));
  const doctors: WDoctor[] = docs.map((d) => ({
    id: d.id,
    slug: d.slug,
    name: doctorTitle(d.name, locale),
    role: teamContent(d.slug)?.role[locale] ?? "",
    color: d.color,
    initials: initials(d.name),
  }));

  const initService = services.find((s) => s.slug === sp.usluga);
  const initDoctor = doctors.find((d) => d.slug === sp.doktor);
  const perks = [
    { icon: CalendarCheck, text: t.hero.trust[3] },
    { icon: ShieldCheck, text: t.hero.trust[0] },
    { icon: BellRing, text: t.why.items[5].title },
  ];

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-brand-50 to-white">
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-100/70 blur-3xl" />
      <div className="container-page relative py-10 md:py-14">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{t.booking.title}</h1>
          <p className="lead mt-3">{t.booking.subtitle}</p>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {perks.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Icon className="h-4 w-4 text-brand-600" /> {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-soft sm:p-8">
          <BookingWizard
            locale={locale}
            t={t.booking}
            common={{ min: t.common.min, instant: t.common.instant, request: t.common.request }}
            services={services}
            categories={cats}
            doctors={doctors}
            initial={{
              serviceId: initService?.id,
              doctorId: initDoctor?.id,
              category: isCategoryKey(sp.kategorija) ? sp.kategorija : initService?.category,
            }}
            clinic={{ name: clinic.name, phone: clinic.phoneDisplay, telHref: telLink, address: `${clinic.address.street}, ${clinic.address.city}` }}
            privacyHref={href(locale, "privacy")}
            appointmentBase={href(locale, "appointment")}
            cancelHours={clinic.booking.cancelHours}
          />
        </div>
      </div>
    </section>
  );
}
