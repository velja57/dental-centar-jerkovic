import { categorySlugs } from "@/content/category-slugs";

export const locales = ["sr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "sr";

export function isLocale(v: string | null | undefined): v is Locale {
  return !!v && (locales as readonly string[]).includes(v);
}

/**
 * Javne adrese po jeziku. Srpski je bez prefiksa (/cenovnik), engleski ima /en (/en/prices).
 * Fizički folderi u app/ koriste srpske nazive; proxy.ts prepisuje javnu adresu u internu.
 */
export const routes = {
  home: { sr: "", en: "" },
  services: { sr: "usluge", en: "services" },
  prices: { sr: "cenovnik", en: "prices" },
  team: { sr: "tim", en: "team" },
  booking: { sr: "zakazivanje", en: "booking" },
  contact: { sr: "kontakt", en: "contact" },
  privacy: { sr: "privatnost", en: "privacy" },
  appointment: { sr: "termin", en: "appointment" },
} as const;

export type RouteKey = keyof typeof routes;
const routeKeys = Object.keys(routes) as RouteKey[];

export function href(locale: Locale, key: RouteKey, ...rest: (string | number)[]) {
  const parts = [locale === "en" ? "en" : "", routes[key][locale], ...rest.map(String)].filter(Boolean);
  return "/" + parts.join("/");
}

export function serviceCategoryHref(locale: Locale, key: string) {
  const c = categorySlugs.find((x) => x.key === key);
  return c ? href(locale, "services", c[locale]) : href(locale, "services");
}

/** Javna putanja -> interna putanja ("/en/prices" -> "/en/cenovnik", "/tim" -> "/sr/tim"). */
export function toInternalPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  let locale: Locale = "sr";
  if (parts[0] === "en") {
    locale = "en";
    parts.shift();
  }
  if (parts.length === 0) return `/${locale}`;
  const first = decodeURIComponent(parts[0]);
  const key = routeKeys.find((k) => routes[k][locale] !== "" && routes[k][locale] === first);
  if (key) parts[0] = routes[key].sr;
  return `/${locale}/${parts.join("/")}`;
}

/** Ista stranica na drugom jeziku (za prekidač SR/EN). */
export function switchLocalePath(pathname: string, target: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  let current: Locale = "sr";
  if (parts[0] === "en") {
    current = "en";
    parts.shift();
  }
  if (parts.length === 0) return href(target, "home");
  const key = routeKeys.find((k) => routes[k][current] !== "" && routes[k][current] === parts[0]);
  if (!key) return href(target, "home");
  const rest = parts.slice(1);
  if (key === "services" && rest[0]) {
    const cat = categorySlugs.find((c) => c[current] === rest[0]);
    if (cat) rest[0] = cat[target];
  }
  return href(target, key, ...rest);
}

/**
 * Engleska adresa sa srpskim nazivom stranice (/en/cenovnik, /en/usluge/ortodoncija) otvarala je istu
 * stranicu kao /en/prices — dve adrese za isti sadržaj. Vraća pravu englesku adresu za trajno
 * preusmerenje (308), ili null ako je adresa već ispravna.
 */
export function fixEnglishSlug(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "en" || parts.length < 2) return null;
  const first = decodeURIComponent(parts[1]);
  if (!routeKeys.some((k) => routes[k].sr !== "" && routes[k].sr === first)) return null;
  const target = switchLocalePath("/" + parts.slice(1).join("/"), "en");
  return target === pathname ? null : target; // isti naziv na oba jezika: nema preusmerenja (i nema petlje)
}

/** hreflang alternativne adrese za metapodatke stranice. */
export function alternates(locale: Locale, key: RouteKey, rest: { sr?: string[]; en?: string[] } = {}) {
  const sr = href("sr", key, ...(rest.sr ?? []));
  const en = href("en", key, ...(rest.en ?? []));
  return {
    canonical: locale === "sr" ? sr : en,
    languages: { sr, en, "x-default": sr },
  };
}
