import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarCheck, Clock, Phone } from "lucide-react";
import { DentalIcon } from "@/components/site/DentalIcon";
import { Photo } from "@/components/site/Photo";
import { Check, FaqList } from "@/components/site/ui";
import { categorySlugs } from "@/content/category-slugs";
import { clinic, telLink } from "@/content/clinic";
import { categories, categoryBySlug, categorySlug } from "@/content/services";
import { getDict } from "@/lib/dictionaries";
import { priceParts } from "@/lib/format";
import { alternates, href, serviceCategoryHref, type Locale } from "@/lib/i18n";
import { getActiveServices } from "@/lib/public-data";

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
    title: cat.title[locale],
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
  const svcs = (await getActiveServices()).filter((s) => s.category === cat.key);
  const words = { free: t.common.free, onRequest: t.common.onRequest, from: t.common.from };
  const bookHref = href(locale, "booking");

  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50 to-white">
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="container-page relative grid items-center gap-10 py-12 md:py-16 lg:grid-cols-2">
          <div>
            <nav aria-label="breadcrumb" className="text-sm font-semibold text-slate-500">
              <Link href={href(locale, "services")} className="hover:text-brand-700">
                {t.servicesPage.title}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-ink">{cat.title[locale]}</span>
            </nav>
            <span className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-soft">
              <DentalIcon name={cat.icon} className="h-8 w-8" />
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance text-ink sm:text-5xl">{cat.title[locale]}</h1>
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
            <Photo src={cat.image.src} alt={cat.image.alt[locale]} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
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

      <section className="bg-brand-50/60 py-16 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="h2">{t.servicesPage.faqTitle}</h2>
          <FaqList items={cat.faq[locale]} />
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-page">
          <h2 className="text-2xl font-extrabold text-ink">{t.servicesPage.otherTitle}</h2>
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
