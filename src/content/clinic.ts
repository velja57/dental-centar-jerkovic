// Osnovni podaci o ordinaciji — menjati ovde, sve stranice ih koriste.
export const clinic = {
  name: "Dental Centar Jerković",
  // Glavni broj (potvrđeno 24.11.2026): isti mora biti na sajtu, Google profilu, Instagramu i u direktorijumima.
  phoneDisplay: "065 300 70 56",
  phoneE164: "+381653007056",
  // WhatsApp i Viber za sada ostaju na broju na kome su podešeni u prvoj fazi; prebaciti na glavni broj
  // kada se potvrdi da 065 300 70 56 ima WhatsApp i Viber.
  whatsapp: "381604848086", // broj za wa.me linkove (bez +)
  viber: "+381604848086",
  email: "marsenic57@gmail.com",
  address: {
    street: "Stevana Dubajića 53",
    postalCode: "11273",
    city: "Batajnica",
    region: "Beograd",
    country: "RS",
  },
  mapsQuery: "Dental Centar Jerković, Stevana Dubajića 53, Batajnica, Beograd",
  // Tačka sa Google Business profila (Google Mape, provereno 24.11.2026.)
  geo: { lat: 44.8941237, lng: 20.2870849 },
  google: {
    rating: 4.9,
    reviewCount: 13,
    // Google Business profil ordinacije (Place ID i CID provereni 24.11.2026. — vode na „Dental Centar Jerkovic“, Stevana Dubajića 53)
    placeId: "ChIJx3v2e0xnWkcRzMEXiwDmG6A",
    profileUrl: "https://www.google.com/maps?cid=11537067760447635916",
    reviewsUrl: "https://www.google.com/maps/search/?api=1&query=Dental%20Centar%20Jerkovi%C4%87&query_place_id=ChIJx3v2e0xnWkcRzMEXiwDmG6A",
    writeReviewUrl: "https://search.google.com/local/writereview?placeid=ChIJx3v2e0xnWkcRzMEXiwDmG6A",
  },
  // Radno vreme ordinacije (0 = nedelja). Rasporedi doktora se podešavaju u admin panelu.
  hours: [
    { weekday: 1, open: "11:00", close: "19:00" },
    { weekday: 2, open: "11:00", close: "19:00" },
    { weekday: 3, open: "08:30", close: "16:30" },
    { weekday: 4, open: "11:00", close: "19:00" },
    { weekday: 5, open: "08:30", close: "16:30" },
  ],
  // Batajnica je primarno područje; ostala naselja su u neposrednoj blizini (koristi se u schema.org i tekstu o lokaciji).
  areaServed: ["Batajnica", "Zemun Polje", "Altina", "Busije", "Ugrinovci", "Nova Pazova", "Zemun"],
  nearby: { sr: "Zemun Polja, Altine, Busija, Ugrinovaca i Nove Pazove", en: "Zemun Polje, Altina, Busije, Ugrinovci and Nova Pazova" },
  booking: {
    cancelHours: 4, // otkazivanje/pomeranje najkasnije 4h pre termina
    horizonDays: 60, // koliko dana unapred može da se zakaže
    minLeadMinutes: 120, // najranije 2h od trenutka zakazivanja
    slotStep: 15, // korak ponuđenih termina u minutima
    chairs: 2, // broj stolica: najviše toliko termina istovremeno (bez obzira na doktora)
    maxActivePerPhone: 3, // zaštita od zloupotrebe
    // Državni i verski neradni dani (Nova godina, Božić, Sretenje, Vaskrs, 1. maj, Dan primirja) zatvoreni su
    // za online zakazivanje (src/lib/holidays.ts). Staviti false ako ordinacija radi za praznike.
    closedOnHolidays: true,
  },
  eurRate: 117.2, // okvirni kurs za prikaz cena u evrima (engleska verzija)
  social: {
    instagram: "https://www.instagram.com/dental_centar_jerkovic/",
    facebook: "", // dodati kada otvorite stranicu
  },
} as const;

export function waLink(text?: string, phone: string = clinic.whatsapp) {
  return `https://wa.me/${phone}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export const viberLink = `viber://chat?number=${encodeURIComponent(clinic.viber)}`;
export const telLink = `tel:${clinic.phoneE164}`;
// destination_place_id vodi navigaciju tačno do Google profila ordinacije (a ne do prve adrese koju Mape pogode)
export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clinic.mapsQuery)}&destination_place_id=${clinic.google.placeId}`;
export const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(clinic.mapsQuery)}&output=embed`;
