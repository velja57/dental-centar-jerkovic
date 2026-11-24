import type { MetadataRoute } from "next";
import { categorySlugs } from "@/content/category-slugs";
import { href, type RouteKey } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";

type Freq = "weekly" | "monthly" | "yearly";

// Svaka jezička verzija je zaseban <url> sa svim hreflang alternativama (uključujući x-default),
// kako Google preporučuje za višejezične sajtove. lastmod = vreme objave (sitemap se generiše pri build-u).
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { key: RouteKey; priority: number; freq: Freq }[] = [
    { key: "home", priority: 1, freq: "weekly" },
    { key: "booking", priority: 0.9, freq: "weekly" },
    { key: "services", priority: 0.8, freq: "monthly" },
    { key: "prices", priority: 0.8, freq: "monthly" },
    { key: "team", priority: 0.6, freq: "monthly" },
    { key: "contact", priority: 0.7, freq: "yearly" },
    { key: "privacy", priority: 0.2, freq: "yearly" },
  ];
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  const add = (sr: string, en: string, priority: number, freq: Freq) => {
    const languages = { sr: absoluteUrl(sr), en: absoluteUrl(en), "x-default": absoluteUrl(sr) };
    entries.push({ url: absoluteUrl(sr), lastModified: now, changeFrequency: freq, priority, alternates: { languages } });
    entries.push({ url: absoluteUrl(en), lastModified: now, changeFrequency: freq, priority: Math.round(priority * 5) / 10, alternates: { languages } });
  };

  for (const p of pages) add(href("sr", p.key), href("en", p.key), p.priority, p.freq);
  for (const c of categorySlugs) add(href("sr", "services", c.sr), href("en", "services", c.en), 0.8, "monthly");
  return entries;
}
