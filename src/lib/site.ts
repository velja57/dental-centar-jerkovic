// Na Vercelu se adresa sama preuzima (VERCEL_PROJECT_PRODUCTION_URL prati i sopstveni domen kad ga povežemo).
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3100")
).replace(/\/$/, "");

export function absoluteUrl(path: string) {
  return siteUrl + (path.startsWith("/") ? path : `/${path}`);
}

/** "dr Ana" / "Dr Ana" — u srpskom se "dr" piše malim slovom i bez tačke. */
export function doctorTitle(name: string, loc: "sr" | "en") {
  return `${loc === "sr" ? "dr" : "Dr"} ${name}`;
}
