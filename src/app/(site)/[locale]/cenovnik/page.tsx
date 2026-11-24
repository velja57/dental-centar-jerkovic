import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, CreditCard } from "lucide-react";
import { DentalIcon } from "@/components/site/DentalIcon";
import { PageHero } from "@/components/site/ui";
import { categories } from "@/content/services";
import { getDict } from "@/lib/dictionaries";
import { priceParts } from "@/lib/format";
import { alternates, href, type Locale } from "@/lib/i18n";
import { getActiveServices } from "@/lib/public-data";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = getDict(locale);
  return { title: t.pricesPage.metaTitle, description: t.pricesPage.subtitle, alternates: alternates(locale, "prices") };
}

export default async function PricesPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const t = getDict(locale);
  const svcs = await getActiveServices();
  const words = { free: t.common.free, onRequest: t.common.onRequest, from: t.common.from };
  const bookHref = href(locale, "booking");

  return (
    <>
      <PageHero eyebrow={t.pricesSection.eyebrow} title={t.pricesPage.title} subtitle={t.pricesPage.subtitle}>
        <nav aria-label={t.pricesPage.title} className="no-scrollbar mt-8 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {categories.map((c) => (
            <a
              key={c.key}
              href={`#${c.key}`}
              className="flex shrink-0 items-center gap-2 rounded-full border border-brand-100 bg-white px-4 py-2 text-sm font-bold text-brand-800 hover:border-brand-300"
            >
              <DentalIcon name={c.icon} className="h-4 w-4" />
              {c.title[locale]}
            </a>
          ))}
        </nav>
      </PageHero>

      <section className="pb-20 md:pb-28">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div className="grid gap-10">
            {categories.map((cat) => {
              const list = svcs.filter((s) => s.category === cat.key);
              if (list.length === 0) return null;
              return (
                <section key={cat.key} id={cat.key} className="scroll-mt-24">
                  <h2 className="flex items-center gap-3 text-2xl font-extrabold text-ink">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <DentalIcon name={cat.icon} />
                    </span>
                    {cat.title[locale]}
                  </h2>
                  <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-[15px]">
                      <thead className="bg-slate-50 text-xs font-bold tracking-wide text-slate-500 uppercase">
                        <tr>
                          <th scope="col" className="px-5 py-3 sm:px-6">
                            {t.pricesPage.service}
                          </th>
                          <th scope="col" className="hidden px-3 py-3 sm:table-cell">
                            {t.pricesPage.duration}
                          </th>
                          <th scope="col" className="px-5 py-3 text-right sm:px-6">
                            {t.pricesPage.price}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {list.map((s) => {
                          const p = priceParts(s, locale, words);
                          return (
                            <tr key={s.id} className="hover:bg-brand-50/40">
                              <td className="px-5 py-3.5 sm:px-6">
                                <Link href={`${bookHref}?usluga=${s.slug}`} className="font-semibold text-ink hover:text-brand-700">
                                  {locale === "sr" ? s.nameSr : s.nameEn}
                                </Link>
                                <span className="block text-sm text-slate-500 sm:hidden">
                                  {s.durationMin} {t.common.min}
                                </span>
                              </td>
                              <td className="hidden px-3 py-3.5 text-slate-500 sm:table-cell">
                                {s.durationMin} {t.common.min}
                              </td>
                              <td className="px-5 py-3.5 text-right sm:px-6">
                                <span className={`font-bold whitespace-nowrap ${s.priceType === "free" ? "text-brand-600" : "text-ink"}`}>{p.main}</span>
                                {p.unit && <span className="block text-xs text-slate-500">{p.unit}</span>}
                                {p.eur && <span className="block text-xs text-slate-500">{p.eur}</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
            <p className="text-sm text-slate-500">{t.pricesPage.note}</p>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl bg-brand-600 p-7 text-white shadow-lift">
              <CreditCard className="h-8 w-8 text-brand-200" />
              <h2 className="mt-4 text-xl font-extrabold">{t.pricesSection.paymentTitle}</h2>
              <ul className="mt-4 grid gap-3">
                {t.pricesSection.payment.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[15px] text-brand-50">
                    <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-200" /> {item}
                  </li>
                ))}
              </ul>
              <Link href={`${bookHref}?usluga=prvi-pregled`} className="btn btn-light mt-6 w-full">
                {t.ctaBand.cta}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
