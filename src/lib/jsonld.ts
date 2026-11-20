import { clinic } from "@/content/clinic";
import { images } from "@/content/images";
import { href, type Locale } from "@/lib/i18n";
import { absoluteUrl, siteUrl } from "@/lib/site";

const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Strukturirani podaci za Google (lokalni biznis: stomatolog). */
export function dentistJsonLd(locale: Locale) {
  const groups = new Map<string, string[]>();
  for (const h of clinic.hours) {
    const key = `${h.open}-${h.close}`;
    groups.set(key, [...(groups.get(key) ?? []), DAY[h.weekday]]);
  }
  return {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "@id": `${siteUrl}/#dentist`,
    name: clinic.name,
    url: absoluteUrl(href(locale, "home")),
    telephone: clinic.phoneE164,
    email: clinic.email,
    image: `${images.clinic.src}?auto=format&fit=crop&w=1200&q=70`,
    priceRange: "$$",
    currenciesAccepted: "RSD, EUR",
    paymentAccepted: "Cash, Credit Card",
    medicalSpecialty: "https://schema.org/Dentistry",
    availableLanguage: ["sr", "en"],
    address: {
      "@type": "PostalAddress",
      streetAddress: clinic.address.street,
      addressLocality: clinic.address.city,
      addressRegion: clinic.address.region,
      postalCode: clinic.address.postalCode,
      addressCountry: clinic.address.country,
    },
    areaServed: clinic.areaServed.map((name) => ({ "@type": "Place", name })),
    openingHoursSpecification: [...groups.entries()].map(([key, days]) => {
      const [opens, closes] = key.split("-");
      return { "@type": "OpeningHoursSpecification", dayOfWeek: days, opens, closes };
    }),
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
