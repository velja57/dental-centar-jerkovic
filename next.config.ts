import type { NextConfig } from "next";

// Bezbednosna zaglavlja za ceo sajt. Sajt čuva podatke pacijenata (admin, termini), pa:
// niko ne sme da ga ubaci u svoj <iframe> (zaštita od „clickjacking“ napada na admin),
// pregledač ne pogađa tip fajlova, a kamera/mikrofon/lokacija su isključeni jer nisu potrebni.
// (HSTS Vercel već šalje sam.)
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
];

// Admin i stranice termina (link sa tajnim kodom): nikad u Google-u, i bez slanja adrese drugim sajtovima.
const privateHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Referrer-Policy", value: "no-referrer" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["@libsql/client", "libsql"],
  images: {
    // Privremene fotografije sa Unsplash-a (zameniti pravim fotografijama ordinacije)
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  async headers() {
    // Kasnije pravilo pobeđuje kada dva postavljaju isto zaglavlje (Referrer-Policy za privatne stranice).
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin", headers: privateHeaders },
      { source: "/admin/:path*", headers: privateHeaders },
      { source: "/termin/:path*", headers: privateHeaders },
      { source: "/en/appointment/:path*", headers: privateHeaders },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
};

export default nextConfig;
