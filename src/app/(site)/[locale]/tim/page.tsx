import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { Check, DoctorAvatar, PageHero } from "@/components/site/ui";
import { teamContent } from "@/content/team";
import { getDict } from "@/lib/dictionaries";
import { alternates, href, type Locale } from "@/lib/i18n";
import { getActiveDoctors } from "@/lib/public-data";
import { doctorTitle } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  const t = getDict(locale);
  return { title: t.teamPage.title, description: t.teamPage.subtitle, alternates: alternates(locale, "team") };
}

export default async function TeamPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const t = getDict(locale);
  const docs = await getActiveDoctors();

  return (
    <>
      <PageHero eyebrow={t.teamSection.eyebrow} title={t.teamPage.title} subtitle={t.teamPage.subtitle} />
      <section className="pb-20 md:pb-28">
        <div className="container-page grid gap-6 lg:grid-cols-3">
          {docs.map((d) => {
            const c = teamContent(d.slug);
            return (
              <article key={d.id} className="card flex flex-col p-8">
                <div className="flex items-center gap-5">
                  <DoctorAvatar name={d.name} color={d.color} size="md" />
                  <div>
                    <h2 className="text-xl font-extrabold text-ink">{doctorTitle(d.name, locale)}</h2>
                    <p className="text-sm font-bold text-brand-700">{c?.role[locale]}</p>
                  </div>
                </div>
                <p className="mt-6 text-[15px] leading-relaxed text-slate-600">{c?.bio[locale]}</p>
                {c && (
                  <>
                    <h3 className="mt-6 text-sm font-bold tracking-wide text-slate-500 uppercase">{t.teamPage.focus}</h3>
                    <ul className="mt-3 grid flex-1 gap-2.5">
                      {c.focus[locale].map((f) => (
                        <Check key={f}>{f}</Check>
                      ))}
                    </ul>
                  </>
                )}
                <Link href={`${href(locale, "booking")}?doktor=${d.slug}`} className="btn btn-primary mt-8">
                  <CalendarCheck className="h-4 w-4" /> {t.teamPage.bookWith}
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
