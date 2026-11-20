// Prave Google recenzije ordinacije (sa Google Business profila).
// Srpski tekst je vraćen iz Google-ovog prevoda — TODO: zameniti tačnim originalnim tekstom.
export const reviews = [
  {
    author: "Milica Vasić",
    rating: 5,
    text: {
      sr: "Doktorka Ana je pokazala mnogo strpljenja u radu sa decom. Popravila je mojoj ćerki dva zuba, bez anestezije i bez ijedne suze. Sve preporuke i za doktorku Anu i za doktora Miloša.",
      en: "Doctor Ana showed a lot of patience in working with children. She fixed two of my daughter's teeth, without anaesthesia and without a single tear. Full recommendations for both Doctor Ana and Doctor Miloš.",
    },
  },
  {
    author: "Mile Srna",
    rating: 5,
    text: {
      sr: "Dr Miloš je pre svega izuzetan stomatolog, veoma pažljiv i odgovoran. Moje iskustvo je za svaku pohvalu, preporučujem ga.",
      en: "Dr Miloš is, first and foremost, an excellent dentist, very attentive and responsible. My experience is nothing but praiseworthy. I recommend him.",
    },
  },
  {
    author: "Uroš Nikšić",
    rating: 5,
    text: {
      sr: "Toplo preporučujem, Ana je izuzetno pažljiva i posvećena. Veoma sam zadovoljan.",
      en: "Highly recommended. Ana is extremely attentive and dedicated. I am very satisfied.",
    },
  },
] as const;
