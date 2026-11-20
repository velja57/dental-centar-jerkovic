// Kratka lista (bez dugih tekstova) da bi mogla da se koristi i u klijentskim komponentama.
export const categorySlugs = [
  { key: "decja", sr: "decja-stomatologija", en: "pediatric-dentistry" },
  { key: "prevencija", sr: "pregledi-i-prevencija", en: "checkups-and-prevention" },
  { key: "ortodoncija", sr: "ortodoncija", en: "orthodontics" },
  { key: "estetika", sr: "estetska-stomatologija", en: "cosmetic-dentistry" },
  { key: "lecenje", sr: "lecenje-zuba", en: "general-dentistry" },
  { key: "protetika", sr: "protetika", en: "prosthodontics" },
  { key: "implanti", sr: "implantologija", en: "dental-implants" },
] as const;

export type CategoryKey = (typeof categorySlugs)[number]["key"];

export const categoryKeys = categorySlugs.map((c) => c.key) as CategoryKey[];

export function isCategoryKey(v: string | null | undefined): v is CategoryKey {
  return !!v && (categoryKeys as string[]).includes(v);
}
