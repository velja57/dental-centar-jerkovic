import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DentalIcon } from "@/components/site/DentalIcon";
import { Photo } from "@/components/site/Photo";
import { PageHero } from "@/components/site/ui";
import { categories } from "@/content/services";
import { getDict } from "@/lib/dictionaries";
import { priceParts } from "@/lib/format";
import { alternates, href, serviceCategoryHref, type Locale } from "@/lib/i18n";
import { getActiveServices } from "@/lib/public-data";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = getDict(locale);
  return { title: t.servicesPage.title, description: t.servicesPage.subtitle, alternates: alternates(locale, "services") };
}

export default async function ServicesPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const t = getDict(locale);
  const svcs = await getActiveServices();
  const words = { free: t.common.free, onRequest: t.common.onRequest, from: t.common.from };

  return (
    <>
      <PageHero eyebrow={t.servicesSection.eyebrow} title={t.servicesPage.title} subtitle={t.servicesPage.subtitle} />
      <section className="pb-20 md:pb-28">
        <div className="container-page grid gap-8 md:grid-cols-2">
          {categories.map((cat) => {
            const list = svcs.filter((s) => s.category === cat.key).slice(0, 4);
            const link = serviceCategoryHref(locale, cat.key);
            return (
              <article key={cat.key} className="card group flex flex-col overflow-hidden">
                <Link href={link} className="relative block aspect-[16/9] overflow-hidden bg-brand-50">
                  <Photo
                    src={cat.image.src}
                    alt={cat.image.alt[locale]}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <DentalIcon name={cat.icon} />
                    </span>
                    <h2 className="text-2xl font-extrabold text-ink">
                      <Link href={link} className="hover:text-brand-700">
                        {cat.title[locale]}
                      </Link>
                    </h2>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{cat.short[locale]}</p>
                  <ul className="mt-5 flex-1 divide-y divide-slate-100 border-y border-slate-100">
                    {list.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-4 py-2.5 text-[15px]">
                        <span className="text-slate-700">{locale === "sr" ? s.nameSr : s.nameEn}</span>
                        <span className="font-bold whitespace-nowrap text-ink">{priceParts(s, locale, words).main}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={link} className="btn btn-outline btn-sm">
                      {t.common.learnMore} <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href={`${href(locale, "booking")}?kategorija=${cat.key}`} className="btn btn-primary btn-sm">
                      {t.servicesPage.book}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
