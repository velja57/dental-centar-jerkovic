import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "../../globals.css";
import { ContactDock } from "@/components/site/ContactDock";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { clinic } from "@/content/clinic";
import { images } from "@/content/images";
import { getDict } from "@/lib/dictionaries";
import { isLocale, locales } from "@/lib/i18n";
import { dentistJsonLd } from "@/lib/jsonld";
import { siteUrl } from "@/lib/site";
import { jakarta } from "../../fonts";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = isLocale(locale) ? locale : "sr";
  const t = getDict(loc);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t.meta.siteTitle, template: `%s | ${clinic.name}` },
    description: t.meta.siteDescription,
    applicationName: clinic.name,
    openGraph: {
      type: "website",
      siteName: clinic.name,
      locale: loc === "sr" ? "sr_RS" : "en_US",
      images: [{ url: `${images.familyThree.src}?auto=format&fit=crop&w=1200&h=630&q=70`, width: 1200, height: 630, alt: images.familyThree.alt[loc] }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = {
  themeColor: "#187a73",
};

export default async function SiteLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDict(locale);

  return (
    <html lang={locale === "sr" ? "sr-Latn" : "en"} className={jakarta.variable}>
      <body className="min-h-screen bg-white pb-[76px] font-sans md:pb-0">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:shadow-lift"
        >
          {t.nav.skip}
        </a>
        <Header locale={locale} t={t} />
        <main id="main">{children}</main>
        <Footer locale={locale} t={t} />
        <ContactDock locale={locale} t={t} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dentistJsonLd(locale)) }} />
      </body>
    </html>
  );
}
