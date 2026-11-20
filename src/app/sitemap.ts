import type { MetadataRoute } from "next";
import { categorySlugs } from "@/content/category-slugs";
import { href, type RouteKey } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { key: RouteKey; priority: number; freq: "weekly" | "monthly" | "yearly" }[] = [
    { key: "home", priority: 1, freq: "weekly" },
    { key: "booking", priority: 0.9, freq: "weekly" },
    { key: "services", priority: 0.8, freq: "monthly" },
    { key: "prices", priority: 0.8, freq: "monthly" },
    { key: "team", priority: 0.6, freq: "monthly" },
    { key: "contact", priority: 0.7, freq: "yearly" },
    { key: "privacy", priority: 0.2, freq: "yearly" },
  ];
  const now = new Date();
  const entries: MetadataRoute.Sitemap = pages.map((p) => ({
    url: absoluteUrl(href("sr", p.key)),
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
    alternates: { languages: { sr: absoluteUrl(href("sr", p.key)), en: absoluteUrl(href("en", p.key)) } },
  }));
  for (const c of categorySlugs) {
    entries.push({
      url: absoluteUrl(href("sr", "services", c.sr)),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages: { sr: absoluteUrl(href("sr", "services", c.sr)), en: absoluteUrl(href("en", "services", c.en)) } },
    });
  }
  return entries;
}
