import { clinic } from "@/content/clinic";
import { images } from "@/content/images";
import { team } from "@/content/team";
import { href, type Locale } from "@/lib/i18n";
import { absoluteUrl, siteUrl } from "@/lib/site";

// Strukturirani podaci za Google (schema.org). Sve vrednosti dolaze iz src/content/* — ništa se ne unosi ručno ovde.
// Proveriti posle izmena: https://search.google.com/test/rich-results i https://validator.schema.org/

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dentistId = `${siteUrl}/#dentist`;

/** Lokalni biznis: stomatolog (na svim stranicama sajta). */
export function dentistJsonLd(locale: Locale) {
  const groups = new Map<string, string[]>();
  for (const h of clinic.hours) {
    const key = `${h.open}-${h.close}`;
    groups.set(key, [...(groups.get(key) ?? []), DAY[h.weekday]]);
  }
  const sameAs = [clinic.google.profileUrl, clinic.social.instagram, clinic.social.facebook].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "@id": dentistId,
    name: clinic.name,
    url: absoluteUrl(href(locale, "home")),
    telephone: clinic.phoneE164,
    email: clinic.email,
    image: `${images.clinic.src}?auto=format&fit=crop&w=1200&q=70`,
    priceRange: "$$",
    currenciesAccepted: "RSD, EUR",
    paymentAccepted: "Cash, Credit Card",
    medicalSpecialty: "https://schema.org/Dentistry",
    isAcceptingNewPatients: true,
    knowsLanguage: ["sr", "en"],
    address: {
      "@type": "PostalAddress",
      streetAddress: clinic.address.street,
      addressLocality: clinic.address.city,
      addressRegion: clinic.address.region,
      postalCode: clinic.address.postalCode,
      addressCountry: clinic.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: clinic.geo.lat, longitude: clinic.geo.lng },
    hasMap: clinic.google.profileUrl,
    sameAs,
    areaServed: clinic.areaServed.map((name) => ({ "@type": "Place", name })),
    openingHoursSpecification: [...groups.entries()].map(([key, days]) => {
      const [opens, closes] = key.split("-");
      return { "@type": "OpeningHoursSpecification", dayOfWeek: days, opens, closes };
    }),
    employee: team.map((m) => ({
      "@type": "Person",
      name: m.name,
      honorificPrefix: locale === "sr" ? "dr" : "Dr",
      jobTitle: m.role[locale],
      url: absoluteUrl(`${href(locale, "team")}#${m.slug}`),
    })),
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl(href(locale, "booking")),
        actionPlatform: ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"],
      },
      result: { "@type": "Reservation", name: locale === "sr" ? "Termin" : "Appointment" },
    },
  };
}

/** Naziv sajta u Google rezultatima (samo na početnoj). */
export function websiteJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: absoluteUrl(href(locale, "home")),
    name: clinic.name,
    inLanguage: locale === "sr" ? "sr-Latn" : "en",
    publisher: { "@id": dentistId },
  };
}

/** Putanja stranice (Početna › Usluge › …). Poslednja stavka je trenutna stranica. */
export function breadcrumbJsonLd(locale: Locale, items: { name: string; path?: string }[]) {
  const all = [{ name: locale === "sr" ? "Početna" : "Home", path: href(locale, "home") }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}

/** Česta pitanja koja su vidljiva na stranici. */
export function faqJsonLd(items: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
