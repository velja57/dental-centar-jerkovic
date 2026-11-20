import { NextResponse, type NextRequest } from "next/server";
import { toInternalPath } from "@/lib/i18n";

/**
 * Lepe adrese po jeziku:
 *   /cenovnik      → interno /sr/cenovnik
 *   /en/prices     → interno /en/cenovnik
 *   /sr/...        → trajno preusmerenje na adresu bez /sr
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/sr" || pathname.startsWith("/sr/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = toInternalPath(pathname);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|admin|_next|favicon.ico|icon.svg|robots.txt|sitemap.xml|.*\\..*).*)"],
};
