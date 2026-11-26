import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  CalendarClock,
  CircleCheck,
  Clock,
  CreditCard,
  HeartHandshake,
  MapPin,
  Phone,
  Quote,
  Receipt,
  Siren,
  Users,
} from "lucide-react";
import { DentalIcon } from "@/components/site/DentalIcon";
import { WhatsAppIcon } from "@/components/site/BrandIcons";
import { HoursList } from "@/components/site/HoursList";
import { JsonLd } from "@/components/site/JsonLd";
import { MapFacade } from "@/components/site/MapFacade";
import { NextSlot } from "@/components/site/NextSlot";
import { Photo } from "@/components/site/Photo";
import { DoctorAvatar, FaqList, SectionHeading, Stars } from "@/components/site/ui";
import { clinic, mapsDirectionsUrl, mapsEmbedUrl, telLink, waLink } from "@/content/clinic";
import { generalFaq } from "@/content/faq";
import { images } from "@/content/images";
import { reviews } from "@/content/reviews";
import { categories, getCategory } from "@/content/services";
import { teamContent } from "@/content/team";
import { getNextAvailable } from "@/lib/availability";
import { fill, getDict } from "@/lib/dictionaries";
import { priceParts } from "@/lib/format";
import { alternates, href, serviceCategoryHref, type Locale } from "@/lib/i18n";
import { faqJsonLd, websiteJsonLd } from "@/lib/jsonld";
import { getActiveDoctors, getActiveServices, lowestPrice } from "@/lib/public-data";
import { emailEnabled } from "@/lib/features";
import { doctorTitle } from "@/lib/site";

// Stranica se osvežava na 5 min; „prvi slobodan termin“ se pored toga uvek proverava u pregledaču (NextSlot).
export const revalidate = 300;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = getDict(locale);
  return { title: { absolute: t.meta.siteTitle }, description: t.meta.siteDescription, alternates: alternates(locale, "home") };
}

// Šesta stavka je „Podsetnik za kontrolu“ samo kada sajt šalje mejlove, inače „Zakazivanje 0–24“.
const WHY_ICONS = [HeartHandshake, Users, Receipt, CreditCard, Clock, emailEnabled ? Bell : CalendarClock];

export default async function HomePage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const t = getDict(locale);
  const [svcs, docs, next] = await Promise.all([getActiveServices(), getActiveDoctors(), getNextAvailable("prvi-pregled")]);

  const bookHref = href(locale, "booking");
  const rating = locale === "sr" ? String(clinic.google.rating).replace(".", ",") : String(clinic.google.rating);
  const words = { free: t.common.free, onRequest: t.common.onRequest, from: t.common.from };
  const popular = svcs.filter((s) => s.popular).slice(0, 7);
  const faq = generalFaq[locale];

  return (
    <>
      <JsonLd data={[websiteJsonLd(locale), faqJsonLd(faq)]} />
      {/* ——— HERO ——— */}
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50 via-white to-white">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-40 h-[36rem] w-[36rem] rounded-full bg-brand-100/60 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-coral-100/50 blur-3xl" />
        <div className="container-page relative grid items-center gap-12 pt-10 pb-20 md:pt-16 lg:grid-cols-[1.08fr_1fr] lg:gap-14 lg:pb-28">
          <div className="animate-fade-up">
            <p className="eyebrow">
              <MapPin className="h-3.5 w-3.5" /> {t.hero.eyebrow}
            </p>
            <h1 className="mt-5 text-[2.5rem] leading-[1.06] font-extrabold tracking-tight text-balance text-ink sm:text-6xl lg:text-[4rem]">
              {t.hero.titleA} <span className="text-brand-600">{t.hero.titleB}</span>
            </h1>
            <p className="lead mt-6 max-w-xl">{t.hero.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={bookHref} className="btn btn-primary btn-lg">
                <CalendarCheck className="h-5 w-5" /> {t.common.bookOnline}
              </Link>
              <a href={telLink} className="btn btn-outline btn-lg">
                <Phone className="h-5 w-5" /> {t.hero.callCta} {clinic.phoneDisplay}
              </a>
            </div>
            <ul className="mt-9 grid max-w-lg grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {t.hero.trust.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[15px] font-semibold text-slate-700">
                  <CircleCheck className="h-5 w-5 shrink-0 text-brand-500" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-brand-100 shadow-lift">
              <Photo
                src={images.hero.src}
                alt={images.hero.alt[locale]}
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1024px) 42vw, (min-width: 640px) 28rem, 92vw"
                className="object-cover"
              />
            </div>
            <a
              href={clinic.google.reviewsUrl}
              target="_blank"
              rel="noopener"
              className="absolute -top-5 right-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lift transition hover:-translate-y-0.5 sm:-right-5"
            >
              <span className="text-3xl font-extrabold text-ink">{rating}</span>
              <span>
                <Stars rating={clinic.google.rating} />
                <span className="mt-1 block text-xs font-semibold text-slate-500">{t.hero.ratingLabel}</span>
              </span>
            </a>
            <Link
              href={`${bookHref}?usluga=prvi-pregled`}
              className="absolute right-3 -bottom-7 left-3 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-lift transition hover:-translate-y-0.5 sm:right-auto sm:-left-6 sm:w-[21rem]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-coral-50 text-coral-600">
                <CalendarClock className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold tracking-wide text-slate-500 uppercase">{t.hero.nextSlotLabel}</span>
                <span className="block truncate text-base font-extrabold text-ink">
                  <NextSlot initial={next} locale={locale} fallback={t.hero.seeSlots} leadMinutes={clinic.booking.minLeadMinutes} />
                </span>
                <span className="block text-sm font-medium text-brand-700">{t.hero.nextSlotService}</span>
              </span>
              <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-slate-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* ——— ZA CELU PORODICU ——— */}
      <section className="py-20 md:py-28">
        <div className="container-page">
          <SectionHeading eyebrow={t.family.eyebrow} title={t.family.title} subtitle={t.family.subtitle} />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {t.family.cards.map((card) => {
              const cat = getCategory(card.key);
              if (!cat) return null;
              return (
                <Link
                  key={card.key}
                  href={serviceCategoryHref(locale, card.key)}
                  className="group card overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
                    <Photo
                      src={cat.image.src}
                      alt={cat.image.alt[locale]}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <DentalIcon name={cat.icon} />
                    </span>
                    <h3 className="mt-4 text-xl font-bold text-ink">{card.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{card.text}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
                      {cat.title[locale]} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ——— USLUGE ——— */}
      <section className="bg-sand-50 py-20 md:py-28">
        <div className="container-page">
          <SectionHeading eyebrow={t.servicesSection.eyebrow} title={t.servicesSection.title} subtitle={t.servicesSection.subtitle} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => {
              const min = lowestPrice(svcs.filter((s) => s.category === cat.key));
              return (
                <Link
                  key={cat.key}
                  href={serviceCategoryHref(locale, cat.key)}
                  className="group flex flex-col rounded-3xl border border-sand-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                    <DentalIcon name={cat.icon} className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-ink">{cat.title[locale]}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{cat.short[locale]}</p>
                  {min !== null && (
                    <p className="mt-4 text-sm font-bold text-brand-700">
                      {priceParts({ priceType: "from", priceFrom: min, priceTo: null }, locale, words).main}
                    </p>
                  )}
                </Link>
              );
            })}
            <Link
              href={href(locale, "prices")}
              className="group flex flex-col justify-between rounded-3xl bg-brand-600 p-6 text-white transition hover:bg-brand-700"
            >
              <Receipt className="h-8 w-8 text-brand-200" />
              <span>
                <span className="block text-lg font-bold">{t.common.viewPrices}</span>
                <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-100">
                  {t.pricesSection.title} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ——— KAKO RADI ONLINE ZAKAZIVANJE ——— */}
      <section className="relative overflow-hidden bg-brand-900 py-20 text-white md:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-brand-600/40 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -bottom-28 h-96 w-96 rounded-full bg-coral-500/20 blur-3xl" />
        <div className="container-page relative">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[13px] font-semibold tracking-wide text-brand-100">{t.how.eyebrow}</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{t.how.title}</h2>
            <p className="mt-4 text-lg text-brand-100/80">{t.how.subtitle}</p>
          </div>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {t.how.steps.map((step, i) => (
              <li key={step.title} className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-coral-500 text-lg font-extrabold text-white">{i + 1}</span>
                <h3 className="mt-5 text-xl font-bold">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-brand-100/80">{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link href={bookHref} className="btn btn-primary btn-lg">
              <CalendarCheck className="h-5 w-5" /> {t.common.bookOnline}
            </Link>
          </div>
        </div>
      </section>

      {/* ——— ZAŠTO MI ——— */}
      <section className="py-20 md:py-28">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-brand-50 shadow-soft">
              <Photo src={images.clinicChair.src} alt={images.clinicChair.alt[locale]} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </div>
            <div className="absolute -right-3 -bottom-6 max-w-[15rem] rounded-2xl bg-white p-5 shadow-lift sm:-right-6">
              <p className="text-3xl font-extrabold text-brand-600">{locale === "sr" ? "do 19h" : "till 7 pm"}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">{t.why.items[4].title}</p>
            </div>
          </div>
          <div>
            <SectionHeading eyebrow={t.why.eyebrow} title={t.why.title} align="left" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {t.why.items.map((item, i) => {
                const Icon = WHY_ICONS[i] ?? CircleCheck;
                return (
                  <div key={item.title} className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-coral-50 text-coral-600">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                      <p className="mt-1 text-[15px] leading-relaxed text-slate-600">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ——— TIM ——— */}
      <section className="bg-brand-50/60 py-20 md:py-28">
        <div className="container-page">
          <SectionHeading eyebrow={t.teamSection.eyebrow} title={t.teamSection.title} subtitle={t.teamSection.subtitle} />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {docs.map((d) => {
              const c = teamContent(d.slug);
              return (
                <div key={d.id} className="card flex flex-col items-center p-8 text-center">
                  <DoctorAvatar name={d.name} color={d.color} />
                  <h3 className="mt-5 text-xl font-bold text-ink">{doctorTitle(d.name, locale)}</h3>
                  <p className="mt-1 text-sm font-bold text-brand-700">{c?.role[locale]}</p>
                  <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-slate-600">{c?.bio[locale]}</p>
                  <Link href={`${bookHref}?doktor=${d.slug}`} className="btn btn-outline btn-sm mt-6">
                    {t.teamPage.bookWith}
                  </Link>
                </div>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Link href={href(locale, "team")} className="inline-flex items-center gap-1.5 font-bold text-brand-700 hover:text-brand-800">
              {t.teamSection.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ——— RECENZIJE ——— */}
      <section className="py-20 md:py-28">
        <div className="container-page">
          <SectionHeading
            eyebrow={t.reviewsSection.eyebrow}
            title={t.reviewsSection.title}
            subtitle={fill(t.reviewsSection.subtitle, { rating, count: clinic.google.reviewCount })}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.author} className="card relative flex flex-col p-7">
                <Quote className="absolute top-6 right-6 h-8 w-8 text-brand-100" />
                <Stars rating={r.rating} />
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-700">„{r.text[locale]}“</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sand-100 text-sm font-bold text-brand-800">
                    {r.author
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                  <span>
                    <span className="block font-bold text-ink">{r.author}</span>
                    <span className="block text-xs font-semibold text-slate-500">{t.reviewsSection.source}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center gap-4">
            <a href={clinic.google.reviewsUrl} target="_blank" rel="noopener" className="btn btn-outline">
              {t.reviewsSection.cta} <ArrowRight className="h-4 w-4" />
            </a>
            <a href={clinic.google.writeReviewUrl} target="_blank" rel="noopener" className="text-sm font-semibold text-slate-500 underline-offset-4 hover:text-brand-700 hover:underline">
              {t.reviewsSection.write}
            </a>
          </div>
        </div>
      </section>

      {/* ——— CENE ——— */}
      <section className="bg-sand-50 py-20 md:py-28">
        <div className="container-page grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionHeading eyebrow={t.pricesSection.eyebrow} title={t.pricesSection.title} subtitle={t.pricesSection.subtitle} align="left" />
            <ul className="mt-8 divide-y divide-sand-200 overflow-hidden rounded-3xl border border-sand-200 bg-white">
              {popular.map((s) => {
                const p = priceParts(s, locale, words);
                return (
                  <li key={s.id}>
                    <Link href={`${bookHref}?usluga=${s.slug}`} className="group flex items-center justify-between gap-4 px-5 py-4 hover:bg-brand-50/50 sm:px-6">
                      <span>
                        <span className="block font-semibold text-ink">{locale === "sr" ? s.nameSr : s.nameEn}</span>
                        <span className="block text-sm text-slate-500">
                          {s.durationMin} {t.common.min}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className={`block font-bold whitespace-nowrap ${s.priceType === "free" ? "text-brand-600" : "text-ink"}`}>{p.main}</span>
                        {p.eur && <span className="block text-xs text-slate-500">{p.eur}</span>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link href={href(locale, "prices")} className="mt-6 inline-flex items-center gap-1.5 font-bold text-brand-700 hover:text-brand-800">
              {t.common.viewPrices} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="self-start rounded-3xl bg-brand-600 p-8 text-white shadow-lift lg:mt-24">
            <CreditCard className="h-9 w-9 text-brand-200" />
            <h3 className="mt-5 text-2xl font-extrabold">{t.pricesSection.paymentTitle}</h3>
            <ul className="mt-5 grid gap-3">
              {t.pricesSection.payment.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] text-brand-50">
                  <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-200" /> {item}
                </li>
              ))}
            </ul>
            <Link href={`${bookHref}?usluga=prvi-pregled`} className="btn btn-light mt-7 w-full">
              {t.ctaBand.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* ——— HITNO / INOSTRANSTVO ——— */}
      <section className="py-20 md:py-24">
        <div className="container-page grid gap-6 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl bg-coral-50 p-8 sm:p-10">
            <Siren className="h-9 w-9 text-coral-600" />
            <h2 className="mt-5 text-2xl font-extrabold text-ink sm:text-3xl">{t.emergency.title}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{t.emergency.text}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={telLink} className="btn btn-primary">
                <Phone className="h-4 w-4" /> {clinic.phoneDisplay}
              </a>
              <Link href={`${bookHref}?usluga=hitna-intervencija`} className="btn btn-outline">
                {t.emergency.cta}
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-brand-50 p-8 sm:p-10">
            <span className="flex h-9 w-9 items-center justify-center text-brand-700">
              <DentalIcon name="implant" className="h-9 w-9" />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold text-ink sm:text-3xl">{t.abroad.title}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{t.abroad.text}</p>
            <a href={waLink(t.wa.abroad)} target="_blank" rel="noopener" className="btn mt-6 bg-[#25D366] text-white hover:bg-[#1ebe5b]">
              <WhatsAppIcon /> {t.abroad.cta}
            </a>
          </div>
        </div>
      </section>

      {/* ——— ČESTA PITANJA ——— */}
      <section className="bg-brand-50/60 py-20 md:py-28">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading eyebrow={t.faqSection.eyebrow} title={t.faqSection.title} align="left" />
            <p className="lead mt-4">{t.faqSection.more}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={telLink} className="btn btn-outline">
                <Phone className="h-4 w-4" /> {clinic.phoneDisplay}
              </a>
              <a href={waLink(t.wa.greeting)} target="_blank" rel="noopener" className="btn bg-[#25D366]/12 text-[#128C4B] hover:bg-[#25D366]/20">
                <WhatsAppIcon /> WhatsApp
              </a>
            </div>
          </div>
          <FaqList items={faq} />
        </div>
      </section>

      {/* ——— LOKACIJA ——— */}
      <section className="py-20 md:py-28">
        <div className="container-page">
          <SectionHeading eyebrow={t.location.eyebrow} title={t.location.title} subtitle={fill(t.location.subtitle, { nearby: clinic.nearby[locale] })} />
          <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <MapFacade embedUrl={mapsEmbedUrl} title={clinic.mapsQuery} buttonLabel={t.common.showMap} note={t.common.mapNote} />
            <div className="card p-7">
              <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
                <MapPin className="h-5 w-5 text-brand-600" /> {t.common.address}
              </h3>
              <p className="mt-2 text-[15px] text-slate-700">
                {clinic.address.street}, {clinic.address.postalCode} {clinic.address.city}, {clinic.address.region}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                <a href={mapsDirectionsUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
                  {t.common.directions} <ArrowRight className="h-4 w-4" />
                </a>
                <a href={clinic.google.reviewsUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
                  {t.common.openInMaps} <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <h3 className="mt-7 flex items-center gap-2 text-lg font-bold text-ink">
                <Clock className="h-5 w-5 text-brand-600" /> {t.common.hours}
              </h3>
              <div className="mt-3">
                <HoursList locale={locale} closedLabel={t.common.closed} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— POZIV NA AKCIJU ——— */}
      <section className="pb-20 md:pb-28">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-brand-600 to-brand-800 px-6 py-14 text-center text-white sm:px-12">
            <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            <h2 className="relative text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{t.ctaBand.title}</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-brand-50/90">{t.ctaBand.text}</p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={`${bookHref}?usluga=prvi-pregled`} className="btn btn-primary btn-lg">
                <CalendarCheck className="h-5 w-5" /> {t.ctaBand.cta}
              </Link>
              <a href={telLink} className="btn btn-lg border border-white/30 text-white hover:bg-white/10">
                <Phone className="h-5 w-5" /> {clinic.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
