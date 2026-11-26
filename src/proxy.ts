import { NextResponse, type NextRequest } from "next/server";
import { fixEnglishSlug, toInternalPath } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

// Kada se poveže sopstveni domen, siteUrl postaje taj domen (VERCEL_PROJECT_PRODUCTION_URL ili NEXT_PUBLIC_SITE_URL).
const canonicalHost = new URL(siteUrl).host;

/**
 * Lepe adrese po jeziku:
 *   /cenovnik      → interno /sr/cenovnik
 *   /en/prices     → interno /en/cenovnik
 *   /sr/...        → trajno preusmerenje na adresu bez /sr
 *   /en/cenovnik   → trajno preusmerenje na /en/prices (jedna adresa po stranici)
 * Posle povezivanja domena: stranice sa *.vercel.app (produkcija) trajno se preusmeravaju na domen,
 * da Google ne bi video dva sajta sa istim sadržajem. Dok domena nema, adrese su iste i ništa se ne dešava.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  if (process.env.VERCEL_ENV === "production" && host.endsWith(".vercel.app") && host !== canonicalHost) {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, siteUrl);
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/sr" || pathname.startsWith("/sr/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  const english = fixEnglishSlug(pathname);
  if (english) {
    const url = request.nextUrl.clone();
    url.pathname = english;
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = toInternalPath(pathname);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|admin|_next|favicon.ico|icon.svg|robots.txt|sitemap.xml|.*\\..*).*)"],
};
