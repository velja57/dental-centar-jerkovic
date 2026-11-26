import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarCheck, Clock, MapPin, Phone } from "lucide-react";
import { DentalIcon } from "@/components/site/DentalIcon";
import { JsonLd } from "@/components/site/JsonLd";
import { Photo } from "@/components/site/Photo";
import { Check, DoctorAvatar, FaqList } from "@/components/site/ui";
import { categorySlugs } from "@/content/category-slugs";
import { clinic, mapsDirectionsUrl, telLink } from "@/content/clinic";
import { categories, categoryBySlug, categorySlug } from "@/content/services";
import { teamContent } from "@/content/team";
import { parseSlugs } from "@/lib/availability";
import { fill, getDict } from "@/lib/dictionaries";
import { priceParts } from "@/lib/format";
import { alternates, href, serviceCategoryHref, type Locale } from "@/lib/i18n";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/jsonld";
import { getActiveDoctors, getActiveServices } from "@/lib/public-data";
import { doctorTitle } from "@/lib/site";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  return categorySlugs.map((c) => ({ slug: c[locale] }));
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const cat = categoryBySlug(slug, locale);
  if (!cat) return {};
  return {
    title: cat.seoTitle[locale],
    description: cat.seo[locale],
    alternates: alternates(locale, "services", { sr: [categorySlug(cat.key, "sr")], en: [categorySlug(cat.key, "en")] }),
  };
}

export default async function CategoryPage({ params }: Props) {
  const { locale: l, slug } = await params;
  const locale = l as Locale;
  const cat = categoryBySlug(slug, locale);
  if (!cat) notFound();
  const t = getDict(locale);
  const [allServices, docs] = await Promise.all([getActiveServices(), getActiveDoctors()]);
  const svcs = allServices.filter((s) => s.category === cat.key);
  // Doktori koji rade usluge iz ove oblasti (dodela se menja u admin panelu → Usluge i cene)
  const doctorSlugs = new Set(svcs.flatMap((s) => parseSlugs(s.doctorSlugs)));
  const catDoctors = docs.filter((d) => doctorSlugs.has(d.slug));
  const words = { free: t.common.free, onRequest: t.common.onRequest, from: t.common.from };
  const bookHref = href(locale, "booking");
  const servicesHref = href(locale, "services");
  const homeLabel = locale === "sr" ? "Početna" : "Home";

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(locale, [{ name: t.servicesPage.title, path: servicesHref }, { name: cat.title[locale] }]),
          faqJsonLd(cat.faq[locale]),
        ]}
      />
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50 to-white">
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="container-page relative grid items-center gap-10 py-12 md:py-16 lg:grid-cols-2">
          <div>
            <nav aria-label={t.common.breadcrumb} className="text-sm font-semibold text-slate-500">
              <Link href={href(locale, "home")} className="hover:text-brand-700">
                {homeLabel}
              </Link>
              <span className="mx-2">/</span>
              <Link href={servicesHref} className="hover:text-brand-700">
                {t.servicesPage.title}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-ink">{cat.title[locale]}</span>
            </nav>
            <span className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-soft">
              <DentalIcon name={cat.icon} className="h-8 w-8" />
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance text-ink sm:text-5xl">{cat.h1[locale]}</h1>
            <p className="lead mt-5">{cat.intro[locale]}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`${bookHref}?kategorija=${cat.key}`} className="btn btn-primary btn-lg">
                <CalendarCheck className="h-5 w-5" /> {t.servicesPage.bookCategory}
              </Link>
              <a href={telLink} className="btn btn-outline btn-lg">
                <Phone className="h-5 w-5" /> {clinic.phoneDisplay}
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-brand-50 shadow-lift">
            <Photo
              src={cat.image.src}
              alt={cat.image.alt[locale]}
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="text-2xl font-extrabold text-ink">{t.servicesPage.benefitsTitle}</h2>
            <ul className="mt-6 grid gap-4">
              {cat.benefits[locale].map((b) => (
                <Check key={b}>{b}</Check>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-ink">{t.servicesPage.priceList}</h2>
            <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white">
              {svcs.map((s) => {
                const p = priceParts(s, locale, words);
                return (
                  <li key={s.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                      <p className="font-semibold text-ink">{locale === "sr" ? s.nameSr : s.nameEn}</p>
                      <p className="mt-0.5 flex items-center gap-3 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {s.durationMin} {t.common.min}
                        </span>
                        <span className={`badge ${s.bookingMode === "instant" ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700"}`}>
                          {s.bookingMode === "instant" ? t.common.instant : t.common.request}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="text-right">
                        <span className={`block font-bold whitespace-nowrap ${s.priceType === "free" ? "text-brand-600" : "text-ink"}`}>
                          {p.main}
                          {p.unit && <span className="font-medium text-slate-500"> {p.unit}</span>}
                        </span>
                        {p.eur && <span className="block text-xs text-slate-500">{p.eur}</span>}
                      </span>
                      <Link href={`${bookHref}?usluga=${s.slug}`} className="btn btn-outline btn-sm">
                        {t.servicesPage.book}
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-sm text-slate-500">{t.servicesPage.priceNote}</p>
          </div>
        </div>
      </section>

      <section className="bg-sand-50 py-16 md:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-extrabold text-ink">{t.servicesPage.forWhomTitle}</h2>
            <ul className="mt-6 grid gap-4">
              {cat.forWhom[locale].map((item) => (
                <Check key={item}>{item}</Check>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-ink">{t.servicesPage.processTitle}</h2>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2">
              {cat.steps[locale].map((step, i) => (
                <li key={step.t} className="rounded-3xl border border-sand-200 bg-white p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white">{i + 1}</span>
                  <h3 className="mt-4 text-lg font-bold text-ink">{step.t}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{step.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {catDoctors.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container-page">
            <h2 className="text-2xl font-extrabold text-ink">{t.servicesPage.doctorsTitle}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {catDoctors.map((d) => (
                <div key={d.id} className="card flex items-center gap-4 p-5">
                  <DoctorAvatar name={d.name} color={d.color} size="md" />
                  <div className="min-w-0">
                    <Link href={`${href(locale, "team")}#${d.slug}`} className="font-bold text-ink hover:text-brand-700">
                      {doctorTitle(d.name, locale)}
                    </Link>
                    <p className="text-sm font-semibold text-brand-700">{teamContent(d.slug)?.role[locale]}</p>
                    <Link
                      href={`${bookHref}?doktor=${d.slug}&kategorija=${cat.key}`}
                      className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-coral-600 hover:text-coral-700"
                    >
                      {t.teamPage.bookWith} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-brand-50/60 py-16 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="h2">{t.servicesPage.faqTitle}</h2>
          <FaqList items={cat.faq[locale]} />
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-page">
          <div className="grid gap-6 rounded-[2rem] bg-brand-50 p-7 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-extrabold text-ink">
                <MapPin className="h-6 w-6 shrink-0 text-brand-600" /> {t.servicesPage.localTitle}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
                {fill(t.servicesPage.localText, { street: clinic.address.street, nearby: clinic.nearby[locale] })}
              </p>
              <a href={mapsDirectionsUrl} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
                {t.common.directions} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href={`${bookHref}?kategorija=${cat.key}`} className="btn btn-primary">
                <CalendarCheck className="h-4 w-4" /> {t.servicesPage.bookCategory}
              </Link>
              <a href={telLink} className="btn btn-outline">
                <Phone className="h-4 w-4" /> {clinic.phoneDisplay}
              </a>
            </div>
          </div>

          <h2 className="mt-16 text-2xl font-extrabold text-ink">{t.servicesPage.otherTitle}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories
              .filter((c) => c.key !== cat.key)
              .map((c) => (
                <Link
                  key={c.key}
                  href={serviceCategoryHref(locale, c.key)}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-brand-200 hover:shadow-soft"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                    <DentalIcon name={c.icon} />
                  </span>
                  <span className="font-bold text-ink">{c.title[locale]}</span>
                  <ArrowRight className="ml-auto h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600" />
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
