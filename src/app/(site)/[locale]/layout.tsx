import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "../../globals.css";
import { ContactDock } from "@/components/site/ContactDock";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { JsonLd } from "@/components/site/JsonLd";
import { SiteAnalytics } from "@/components/site/SiteAnalytics";
import { clinic } from "@/content/clinic";
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
      // Slika za pregled linka na Viberu, WhatsApp-u i Facebook-u: logotip, naziv, adresa i telefon ordinacije
      // (ranije stock fotografija nepoznate porodice). Pravi se iz logotipa; menja se uz promenu broja ili adrese.
      images: [
        {
          url: `/og-${loc}.png`,
          width: 1200,
          height: 630,
          alt:
            loc === "sr"
              ? `${clinic.name}, stomatološka ordinacija u Batajnici: ${clinic.address.street}, ${clinic.phoneDisplay}`
              : `${clinic.name}, dental clinic in Batajnica, Belgrade: ${clinic.address.street}, ${clinic.phoneDisplay}`,
        },
      ],
    },
    twitter: { card: "summary_large_image" },
    // Google Search Console (svojstvo „URL prefix“): kod iz GSC → Vercel env GOOGLE_SITE_VERIFICATION
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
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
        <JsonLd data={dentistJsonLd(locale)} />
        <SiteAnalytics />
      </body>
    </html>
  );
}
