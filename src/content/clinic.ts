// Osnovni podaci o ordinaciji — menjati ovde, sve stranice ih koriste.
export const clinic = {
  name: "Dental Centar Jerković",
  phoneDisplay: "060 484 8086",
  phoneE164: "+381604848086",
  whatsapp: "381604848086", // broj za wa.me linkove (bez +)
  email: "marsenic57@gmail.com",
  address: {
    street: "Stevana Dubajića 53",
    postalCode: "11273",
    city: "Batajnica",
    region: "Beograd",
    country: "RS",
  },
  mapsQuery: "Dental Centar Jerković, Stevana Dubajića 53, Batajnica, Beograd",
  google: {
    rating: 4.9,
    reviewCount: 13,
    // TODO: zameniti direktnim linkom "Napišite recenziju" iz Google Business profila (search.google.com/local/writereview?placeid=...)
    reviewsUrl: "https://www.google.com/maps/search/?api=1&query=Dental+Centar+Jerkovi%C4%87+Batajnica",
    writeReviewUrl: "https://www.google.com/maps/search/?api=1&query=Dental+Centar+Jerkovi%C4%87+Batajnica",
  },
  // Radno vreme ordinacije (0 = nedelja). Rasporedi doktora se podešavaju u admin panelu.
  hours: [
    { weekday: 1, open: "11:00", close: "19:00" },
    { weekday: 2, open: "11:00", close: "19:00" },
    { weekday: 3, open: "08:30", close: "16:30" },
    { weekday: 4, open: "11:00", close: "19:00" },
    { weekday: 5, open: "08:30", close: "16:30" },
  ],
  areaServed: ["Batajnica", "Zemun Polje", "Nova Pazova", "Ugrinovci", "Zemun", "Beograd"],
  booking: {
    cancelHours: 4, // otkazivanje/pomeranje najkasnije 4h pre termina
    horizonDays: 60, // koliko dana unapred može da se zakaže
    minLeadMinutes: 120, // najranije 2h od trenutka zakazivanja
    slotStep: 15, // korak ponuđenih termina u minutima
    chairs: 2, // broj stolica: najviše toliko termina istovremeno (bez obzira na doktora)
    maxActivePerPhone: 3, // zaštita od zloupotrebe
  },
  eurRate: 117.2, // okvirni kurs za prikaz cena u evrima (engleska verzija)
  social: {
    instagram: "", // dodati kada otvorite profile
    facebook: "",
  },
} as const;

export function waLink(text?: string, phone: string = clinic.whatsapp) {
  return `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export const viberLink = `viber://chat?number=${encodeURIComponent(clinic.phoneE164)}`;
export const telLink = `tel:${clinic.phoneE164}`;
export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clinic.mapsQuery)}`;
export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(clinic.mapsQuery)}&output=embed`;
