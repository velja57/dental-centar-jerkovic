import { categorySlugs, type CategoryKey } from "./category-slugs";
import { images, type SitePhoto } from "./images";
import type { Locale } from "@/lib/i18n";

type L = { sr: string; en: string };
type LL = { sr: string[]; en: string[] };
type QA = { q: string; a: string };

export type DentalIconName = "child" | "shield" | "braces" | "sparkle" | "filling" | "crown" | "implant" | "tooth";

export type Category = {
  key: CategoryKey;
  icon: DentalIconName;
  image: SitePhoto;
  title: L;
  short: L;
  intro: L;
  benefits: LL;
  faq: { sr: QA[]; en: QA[] };
  seo: L;
};

// Redosled prati prioritete ordinacije: porodice sa decom → mlađi → pacijenti iz inostranstva → stariji.
export const categories: Category[] = [
  {
    key: "decja",
    icon: "child",
    image: images.kidDentist,
    title: { sr: "Dečja stomatologija", en: "Pediatric dentistry" },
    short: {
      sr: "Strpljiv i nežan pristup, da prvi susret sa zubarom bude prijatno iskustvo.",
      en: "A patient, gentle approach that makes the first visit to the dentist a pleasant one.",
    },
    intro: {
      sr: "Dečji zubi traže posebno znanje i još više strpljenja. Kod nas dete najpre kroz igru upozna ordinaciju, stolicu i instrumente, a lečenje počinje tek kada se oseti sigurno. Želimo da izraste u osobu koja se ne plaši zubara.",
      en: "Children's teeth call for special expertise and even more patience. Your child first gets to know the room, the chair and the instruments through play, and treatment begins only once they feel safe. We want them to grow up without a fear of the dentist.",
    },
    benefits: {
      sr: [
        "Besplatan prvi pregled deteta, bez ikakve prisile",
        "Popravka i lečenje mlečnih zuba",
        "Zalivanje fisura i fluorizacija za zaštitu od karijesa",
        "Saveti roditeljima o ishrani, pranju zuba i navikama",
      ],
      en: [
        "A free first visit for your child, with no pressure at all",
        "Fillings and treatment of baby teeth",
        "Fissure sealants and fluoride to prevent decay",
        "Advice for parents on diet, brushing and habits",
      ],
    },
    faq: {
      sr: [
        {
          q: "Kada dete treba prvi put da dođe kod stomatologa?",
          a: "Kada izbiju prvi zubi, a najkasnije oko prvog rođendana. Prve posete su kratke i opuštene i služe da dete stekne poverenje.",
        },
        {
          q: "Da li treba lečiti mlečne zube kad ionako ispadaju?",
          a: "Da. Mlečni zubi čuvaju mesto za stalne, važni su za govor i žvakanje, a neizlečen karijes može da ošteti stalni zub koji raste ispod.",
        },
      ],
      en: [
        {
          q: "When should my child first see a dentist?",
          a: "When the first teeth come in, and no later than around the first birthday. Early visits are short and relaxed and help your child build trust.",
        },
        {
          q: "Do baby teeth need treatment if they fall out anyway?",
          a: "Yes. Baby teeth hold space for the permanent ones, matter for speech and chewing, and untreated decay can damage the permanent tooth growing underneath.",
        },
      ],
    },
    seo: {
      sr: "Dečji stomatolog u Batajnici: besplatan prvi pregled deteta, popravka mlečnih zuba, zalivanje fisura i fluorizacija. Strpljivo, nežno i bez straha.",
      en: "Pediatric dentist in Batajnica, Belgrade: free first visit, baby tooth fillings, fissure sealants and fluoride. Patient, gentle and fear-free.",
    },
  },
  {
    key: "prevencija",
    icon: "shield",
    image: images.kidsBrushing,
    title: { sr: "Pregledi i prevencija", en: "Check-ups & prevention" },
    short: {
      sr: "Redovni pregledi, uklanjanje kamenca i peskiranje, najjeftiniji način da sačuvate zube.",
      en: "Regular check-ups, scaling and Air Flow polishing, the most affordable way to keep your teeth healthy.",
    },
    intro: {
      sr: "Većina problema sa zubima može se sprečiti ili rešiti dok je mala i jeftina. Zato preporučujemo kontrolu na svakih šest meseci, a naš sistem vas sam podseti kada je vreme za sledeći pregled.",
      en: "Most dental problems can be prevented, or fixed while they are still small and inexpensive. That's why we recommend a check-up every six months, and our system reminds you when the next one is due.",
    },
    benefits: {
      sr: [
        "Besplatan prvi pregled i plan terapije sa cenama",
        "Ultrazvučno uklanjanje kamenca i poliranje",
        "Peskiranje za uklanjanje mrlja od kafe, čaja i duvana",
        "Automatski podsetnik za kontrolu na šest meseci",
      ],
      en: [
        "A free first check-up and a priced treatment plan",
        "Ultrasonic scaling and polishing",
        "Air Flow polishing to remove coffee, tea and tobacco stains",
        "An automatic reminder for your six-month check-up",
      ],
    },
    faq: {
      sr: [
        {
          q: "Koliko često treba skidati kamenac?",
          a: "Za većinu ljudi jednom do dva puta godišnje. Pušačima i osobama sklonim stvaranju kamenca preporučujemo češće.",
        },
        {
          q: "Da li je uklanjanje kamenca bolno?",
          a: "Ne. Moguća je blaga osetljivost, ali je tretman uglavnom potpuno komforan i traje oko pola sata.",
        },
      ],
      en: [
        {
          q: "How often should I have my teeth scaled?",
          a: "For most people once or twice a year. Smokers and people prone to tartar build-up may need it more often.",
        },
        {
          q: "Does scaling hurt?",
          a: "No. You may feel mild sensitivity, but the treatment is usually completely comfortable and takes about half an hour.",
        },
      ],
    },
    seo: {
      sr: "Stomatološki pregled, uklanjanje kamenca i peskiranje u Batajnici. Besplatan prvi pregled i podsetnik za kontrolu na šest meseci.",
      en: "Dental check-ups, scaling and Air Flow polishing in Batajnica, Belgrade. Free first check-up and six-month reminders.",
    },
  },
  {
    key: "ortodoncija",
    icon: "braces",
    image: images.aligners,
    title: { sr: "Ortodoncija", en: "Orthodontics" },
    short: {
      sr: "Ravni zubi u svakom uzrastu: mobilni i fiksni aparati i providne folije.",
      en: "Straight teeth at any age: removable and fixed braces and clear aligners.",
    },
    intro: {
      sr: "Ortodontska terapija ispravlja položaj zuba i odnos vilica, zbog lepšeg osmeha, ali i zdravijih zuba, desni i zgloba. Na besplatnoj konsultaciji procenjujemo stanje, objašnjavamo opcije i dajemo cenu i okvirno trajanje terapije.",
      en: "Orthodontic treatment corrects the position of teeth and jaws, for a nicer smile and also healthier teeth, gums and jaw joints. At a free consultation we assess your case, explain the options and give you the price and the expected treatment length.",
    },
    benefits: {
      sr: [
        "Mobilni aparati za decu u razvoju",
        "Fiksni metalni i estetski (safirni) aparati",
        "Providne folije, gotovo nevidljivo ispravljanje zuba",
        "Plaćanje terapije na rate",
      ],
      en: [
        "Removable appliances for growing children",
        "Fixed metal and aesthetic (sapphire) braces",
        "Clear aligners, almost invisible straightening",
        "Treatment payable in instalments",
      ],
    },
    faq: {
      sr: [
        {
          q: "Koliko traje ortodontska terapija?",
          a: "Najčešće između 12 i 24 meseca, zavisno od složenosti slučaja i saradnje pacijenta. Procenu za vaš slučaj dobijate na konsultaciji.",
        },
        {
          q: "Da li odrasli mogu da nose aparatić?",
          a: "Naravno. Zubi se pomeraju u svakom uzrastu, a odraslima su najčešće zanimljive estetske opcije: safirni aparat ili providne folije.",
        },
      ],
      en: [
        {
          q: "How long does orthodontic treatment take?",
          a: "Usually 12 to 24 months, depending on how complex the case is and on the patient's cooperation. You get an estimate for your case at the consultation.",
        },
        {
          q: "Can adults wear braces?",
          a: "Absolutely. Teeth can move at any age, and adults often prefer the aesthetic options: sapphire braces or clear aligners.",
        },
      ],
    },
    seo: {
      sr: "Ortodont u Batajnici: mobilni i fiksni aparati, safirni aparati i providne folije za decu i odrasle. Besplatna ortodontska konsultacija.",
      en: "Orthodontist in Batajnica, Belgrade: removable and fixed braces, sapphire braces and clear aligners for children and adults. Free consultation.",
    },
  },
  {
    key: "estetika",
    icon: "sparkle",
    image: images.smile,
    title: { sr: "Estetska stomatologija", en: "Cosmetic dentistry" },
    short: {
      sr: "Beljenje, fasete i kompozitne korekcije za osmeh kojim ćete se ponositi.",
      en: "Whitening, veneers and composite bonding for a smile you'll be proud of.",
    },
    intro: {
      sr: "Mali zahvati prave veliku razliku: svetlija boja, ujednačen oblik, zatvoren razmak između zuba. Svaku promenu planiramo zajedno sa vama, da rezultat izgleda prirodno i traje godinama.",
      en: "Small treatments can make a big difference: a brighter shade, even shapes, closed gaps. We plan every change together with you so the result looks natural and lasts for years.",
    },
    benefits: {
      sr: [
        "Profesionalno beljenje u ordinaciji ili kod kuće",
        "Keramičke (E-max) i kompozitne fasete",
        "Korekcija oblika, boje i razmaka između zuba",
        "Plan i cena unapred, bez iznenađenja",
      ],
      en: [
        "Professional whitening in the office or at home",
        "Ceramic (E-max) and composite veneers",
        "Correction of tooth shape, shade and gaps",
        "A plan and price upfront, with no surprises",
      ],
    },
    faq: {
      sr: [
        {
          q: "Da li beljenje oštećuje zube?",
          a: "Profesionalno beljenje pod nadzorom stomatologa ne oštećuje gleđ. Moguća je prolazna osetljivost koja nestaje za nekoliko dana.",
        },
        {
          q: "Koliko traju keramičke fasete?",
          a: "Uz dobru higijenu i redovne kontrole keramičke fasete traju 10 do 15 godina, a često i duže.",
        },
      ],
      en: [
        {
          q: "Does whitening damage teeth?",
          a: "Professional whitening supervised by a dentist does not damage enamel. Temporary sensitivity is possible and fades within a few days.",
        },
        {
          q: "How long do ceramic veneers last?",
          a: "With good hygiene and regular check-ups, ceramic veneers last 10 to 15 years, often longer.",
        },
      ],
    },
    seo: {
      sr: "Beljenje zuba, keramičke i kompozitne fasete u Batajnici. Prirodan, blistav osmeh uz plan i cenu unapred.",
      en: "Teeth whitening and ceramic and composite veneers in Batajnica, Belgrade. A natural, bright smile with a clear plan and price.",
    },
  },
  {
    key: "lecenje",
    icon: "filling",
    image: images.treatment,
    title: { sr: "Lečenje zuba", en: "General dentistry" },
    short: {
      sr: "Popravka zuba, lečenje kanala i vađenje, bezbolno, uz lokalnu anesteziju.",
      en: "Fillings, root canals and extractions, pain-free with local anaesthesia.",
    },
    intro: {
      sr: "Bilo da je u pitanju mali karijes ili zub koji boli, cilj nam je da sačuvamo prirodan zub kad god je moguće. Radimo pažljivo, uz lokalnu anesteziju, i pre početka uvek objasnimo šta radimo i koliko košta.",
      en: "Whether it's a small cavity or a painful tooth, our goal is to save your natural tooth whenever possible. We work carefully, with local anaesthesia, and always explain what we'll do and what it costs before we start.",
    },
    benefits: {
      sr: ["Bele (kompozitne) plombe u boji zuba", "Lečenje kanala korena", "Vađenje zuba i umnjaka", "Hitne intervencije kod zubobolje"],
      en: ["Tooth-coloured composite fillings", "Root canal treatment", "Tooth and wisdom tooth extraction", "Emergency appointments for toothache"],
    },
    faq: {
      sr: [
        {
          q: "Da li je lečenje zuba bolno?",
          a: "Uz savremenu lokalnu anesteziju intervencija je bezbolna. Ako se plašite, recite nam, idemo vašim tempom.",
        },
        {
          q: "Šta da radim ako me boli zub?",
          a: "Pozovite nas ili zakažite hitnu intervenciju online. Pacijente sa bolom trudimo se da primimo istog dana.",
        },
      ],
      en: [
        {
          q: "Does dental treatment hurt?",
          a: "With modern local anaesthesia the treatment is pain-free. If you're anxious, tell us, and we'll go at your pace.",
        },
        {
          q: "What should I do if I have a toothache?",
          a: "Call us or book an emergency visit online. We do our best to see patients in pain the same day.",
        },
      ],
    },
    seo: {
      sr: "Bele plombe, lečenje kanala i vađenje zuba u Batajnici. Bezbolno, uz lokalnu anesteziju, i hitne intervencije kod zubobolje.",
      en: "White fillings, root canal treatment and extractions in Batajnica, Belgrade. Pain-free care and emergency toothache appointments.",
    },
  },
  {
    key: "protetika",
    icon: "crown",
    image: images.toothModel,
    title: { sr: "Protetika", en: "Prosthodontics" },
    short: {
      sr: "Krunice, mostovi i proteze koje vraćaju funkciju, izgled i samopouzdanje.",
      en: "Crowns, bridges and dentures that restore function, looks and confidence.",
    },
    intro: {
      sr: "Kada zub nedostaje ili je jako oštećen, protetika vraća sposobnost žvakanja i prirodan izgled osmeha. Radimo metalokeramičke, cirkonijumske i bezmetalne krunice i mostove, kao i mobilne proteze.",
      en: "When a tooth is missing or badly damaged, prosthodontics restores your ability to chew and the natural look of your smile. We make porcelain-fused-to-metal, zirconia and metal-free crowns and bridges, as well as removable dentures.",
    },
    benefits: {
      sr: [
        "Cirkonijum i E-max krunice prirodnog izgleda",
        "Metalokeramičke krunice i mostovi",
        "Totalne i skeletirane proteze",
        "Reparatura i podlaganje proteza",
      ],
      en: [
        "Natural-looking zirconia and E-max crowns",
        "Porcelain-fused-to-metal crowns and bridges",
        "Complete and cast partial dentures",
        "Denture repairs and relining",
      ],
    },
    faq: {
      sr: [
        {
          q: "Koliko dolazaka je potrebno za krunicu?",
          a: "Najčešće dva do tri: priprema zuba i otisak, zatim proba i cementiranje. Između dolazaka nosite privremenu krunicu.",
        },
        {
          q: "Šta je bolje, cirkonijum ili metalokeramika?",
          a: "Cirkonijum izgleda prirodnije i ne sadrži metal, pa je idealan za prednje zube. Metalokeramika je pristupačnija i i dalje odlično rešenje za bočne zube.",
        },
      ],
      en: [
        {
          q: "How many visits does a crown take?",
          a: "Usually two or three: preparing the tooth and taking an impression, then a try-in and cementation. You wear a temporary crown in between.",
        },
        {
          q: "Which is better, zirconia or porcelain-fused-to-metal?",
          a: "Zirconia looks more natural and contains no metal, which makes it ideal for front teeth. Porcelain-fused-to-metal is more affordable and still an excellent choice for back teeth.",
        },
      ],
    },
    seo: {
      sr: "Cirkonijum, E-max i metalokeramičke krunice, mostovi i proteze u Batajnici. Prirodan izgled i plan terapije sa cenom unapred.",
      en: "Zirconia, E-max and porcelain-fused-to-metal crowns, bridges and dentures in Batajnica, Belgrade. Natural results and an upfront price.",
    },
  },
  {
    key: "implanti",
    icon: "implant",
    image: images.implant,
    title: { sr: "Implantologija", en: "Dental implants" },
    short: {
      sr: "Trajna zamena za izgubljene zube: implant i krunica koji izgledaju i rade kao pravi zub.",
      en: "A permanent replacement for missing teeth: an implant and crown that look and work like a real tooth.",
    },
    intro: {
      sr: "Implant je titanijumski koren na koji se postavlja krunica. Ne zahteva brušenje susednih zuba i uz dobro održavanje traje decenijama. Na besplatnoj konsultaciji procenjujemo da li ste kandidat i pravimo plan sa cenom.",
      en: "An implant is a titanium root that holds a crown. It doesn't require grinding down neighbouring teeth and, with good care, lasts for decades. At a free consultation we check whether you're a candidate and prepare a priced plan.",
    },
    benefits: {
      sr: [
        "Besplatna konsultacija i plan terapije",
        "Krunice na implantima prirodnog izgleda",
        "Rešenja za jedan zub, više zuba ili celu vilicu",
        "Za pacijente iz inostranstva: procena na osnovu ortopan snimka",
      ],
      en: [
        "A free consultation and treatment plan",
        "Natural-looking crowns on implants",
        "Solutions for one tooth, several teeth or a full arch",
        "Patients from abroad: an estimate based on your panoramic X-ray",
      ],
    },
    faq: {
      sr: [
        {
          q: "Koliko traje terapija implantima?",
          a: "Ugradnja traje oko sat vremena po implantu. Sledi period srastanja od tri do šest meseci, nakon čega se postavlja krunica.",
        },
        {
          q: "Živim u inostranstvu. Mogu li da dobijem procenu unapred?",
          a: "Da. Pošaljite ortopan snimak na WhatsApp ili e-mail i dobićete okvirni plan i cenu pre dolaska.",
        },
      ],
      en: [
        {
          q: "How long does implant treatment take?",
          a: "Placement takes about an hour per implant. Then comes a healing period of three to six months, after which the crown is fitted.",
        },
        {
          q: "I live abroad. Can I get an estimate in advance?",
          a: "Yes. Send your panoramic X-ray via WhatsApp or e-mail and you'll receive an outline plan and price before you travel.",
        },
      ],
    },
    seo: {
      sr: "Zubni implanti u Batajnici, Beograd: besplatna konsultacija, plan terapije sa cenom i procena za pacijente iz inostranstva.",
      en: "Dental implants in Batajnica, Belgrade: free consultation, a priced treatment plan and remote estimates for patients from abroad.",
    },
  },
];

export function getCategory(key: string) {
  return categories.find((c) => c.key === key);
}

export function categorySlug(key: CategoryKey, locale: Locale) {
  return categorySlugs.find((c) => c.key === key)![locale];
}

export function categoryBySlug(slug: string, locale: Locale) {
  const entry = categorySlugs.find((c) => c[locale] === slug);
  return entry ? getCategory(entry.key) : undefined;
}

// ——— Početna lista usluga za bazu (cene u dinarima; menjaju se u admin panelu) ———
// Okvirne cene za Beograd, 2026. Usluge "request" idu na upit (ordinacija predlaže termin).

export type ServiceSeed = {
  slug: string;
  category: CategoryKey;
  nameSr: string;
  nameEn: string;
  durationMin: number;
  priceType: "fixed" | "from" | "range" | "free" | "request";
  priceFrom: number;
  priceTo?: number;
  priceUnitSr?: string;
  priceUnitEn?: string;
  bookingMode: "instant" | "request";
  doctors: string[];
  popular?: boolean;
};

const PO_ZUBU = { priceUnitSr: "po zubu", priceUnitEn: "per tooth" };
const PO_VILICI = { priceUnitSr: "po vilici", priceUnitEn: "per jaw" };

export const serviceSeeds: ServiceSeed[] = [
  // Pregledi i prevencija
  { slug: "prvi-pregled", category: "prevencija", nameSr: "Prvi pregled i konsultacija", nameEn: "First check-up & consultation", durationMin: 30, priceType: "free", priceFrom: 0, bookingMode: "instant", doctors: ["milos-milosevic", "jovana-jovanovic"], popular: true },
  { slug: "kontrolni-pregled", category: "prevencija", nameSr: "Kontrolni pregled", nameEn: "Routine check-up", durationMin: 30, priceType: "fixed", priceFrom: 2000, bookingMode: "instant", doctors: ["milos-milosevic", "jovana-jovanovic"] },
  { slug: "uklanjanje-kamenca", category: "prevencija", nameSr: "Uklanjanje kamenca i poliranje", nameEn: "Scaling & polishing", durationMin: 45, priceType: "fixed", priceFrom: 4500, bookingMode: "instant", doctors: ["milos-milosevic", "jovana-jovanovic"], popular: true },
  { slug: "peskiranje", category: "prevencija", nameSr: "Peskiranje (Air Flow)", nameEn: "Air Flow stain removal", durationMin: 30, priceType: "fixed", priceFrom: 4000, bookingMode: "instant", doctors: ["milos-milosevic", "jovana-jovanovic"] },
  { slug: "kamenac-peskiranje", category: "prevencija", nameSr: "Kamenac + peskiranje (paket)", nameEn: "Scaling + Air Flow (bundle)", durationMin: 60, priceType: "fixed", priceFrom: 7000, bookingMode: "instant", doctors: ["milos-milosevic", "jovana-jovanovic"] },
  { slug: "fluorizacija", category: "prevencija", nameSr: "Fluorizacija", nameEn: "Fluoride treatment", durationMin: 30, priceType: "fixed", priceFrom: 2500, bookingMode: "instant", doctors: ["jovana-jovanovic", "milos-milosevic"] },

  // Dečja stomatologija
  { slug: "prvi-pregled-deteta", category: "decja", nameSr: "Prvi pregled deteta (upoznavanje)", nameEn: "Child's first visit (getting to know us)", durationMin: 30, priceType: "free", priceFrom: 0, bookingMode: "instant", doctors: ["jovana-jovanovic"], popular: true },
  { slug: "popravka-mlecnog-zuba", category: "decja", nameSr: "Popravka mlečnog zuba", nameEn: "Baby tooth filling", durationMin: 30, priceType: "fixed", priceFrom: 3500, bookingMode: "instant", doctors: ["jovana-jovanovic"] },
  { slug: "zalivanje-fisura", category: "decja", nameSr: "Zalivanje fisura", nameEn: "Fissure sealant", durationMin: 30, priceType: "fixed", priceFrom: 2500, ...PO_ZUBU, bookingMode: "instant", doctors: ["jovana-jovanovic"] },
  { slug: "fluorizacija-dece", category: "decja", nameSr: "Fluorizacija dečjih zuba", nameEn: "Fluoride treatment for kids", durationMin: 30, priceType: "fixed", priceFrom: 2000, bookingMode: "instant", doctors: ["jovana-jovanovic"] },
  { slug: "lecenje-mlecnog-zuba", category: "decja", nameSr: "Lečenje mlečnog zuba", nameEn: "Baby tooth pulp treatment", durationMin: 45, priceType: "fixed", priceFrom: 5000, bookingMode: "instant", doctors: ["jovana-jovanovic"] },
  { slug: "vadjenje-mlecnog-zuba", category: "decja", nameSr: "Vađenje mlečnog zuba", nameEn: "Baby tooth extraction", durationMin: 30, priceType: "fixed", priceFrom: 2500, bookingMode: "instant", doctors: ["jovana-jovanovic"] },

  // Ortodoncija
  { slug: "ortodontska-konsultacija", category: "ortodoncija", nameSr: "Ortodontska konsultacija", nameEn: "Orthodontic consultation", durationMin: 30, priceType: "free", priceFrom: 0, bookingMode: "instant", doctors: ["milos-jerkovic"], popular: true },
  { slug: "mobilni-aparat", category: "ortodoncija", nameSr: "Mobilni ortodontski aparat", nameEn: "Removable orthodontic appliance", durationMin: 45, priceType: "fixed", priceFrom: 35000, ...PO_VILICI, bookingMode: "request", doctors: ["milos-jerkovic"] },
  { slug: "fiksni-metalni-aparat", category: "ortodoncija", nameSr: "Fiksni metalni aparat", nameEn: "Fixed metal braces", durationMin: 60, priceType: "fixed", priceFrom: 85000, ...PO_VILICI, bookingMode: "request", doctors: ["milos-jerkovic"] },
  { slug: "fiksni-safirni-aparat", category: "ortodoncija", nameSr: "Fiksni safirni (estetski) aparat", nameEn: "Fixed sapphire (aesthetic) braces", durationMin: 60, priceType: "fixed", priceFrom: 115000, ...PO_VILICI, bookingMode: "request", doctors: ["milos-jerkovic"] },
  { slug: "providne-folije", category: "ortodoncija", nameSr: "Providne folije (alajneri)", nameEn: "Clear aligners", durationMin: 45, priceType: "from", priceFrom: 250000, bookingMode: "request", doctors: ["milos-jerkovic"] },
  { slug: "kontrola-aparata", category: "ortodoncija", nameSr: "Kontrola fiksnog aparata", nameEn: "Braces adjustment visit", durationMin: 30, priceType: "fixed", priceFrom: 3500, bookingMode: "instant", doctors: ["milos-jerkovic"] },
  { slug: "retejner", category: "ortodoncija", nameSr: "Retejner", nameEn: "Retainer", durationMin: 30, priceType: "fixed", priceFrom: 12000, ...PO_VILICI, bookingMode: "request", doctors: ["milos-jerkovic"] },

  // Estetska stomatologija
  { slug: "beljenje-u-ordinaciji", category: "estetika", nameSr: "Beljenje zuba u ordinaciji", nameEn: "In-office teeth whitening", durationMin: 90, priceType: "fixed", priceFrom: 28000, bookingMode: "instant", doctors: ["milos-milosevic"], popular: true },
  { slug: "kucno-beljenje", category: "estetika", nameSr: "Kućno beljenje (folije + gel)", nameEn: "Take-home whitening kit", durationMin: 30, priceType: "fixed", priceFrom: 20000, bookingMode: "instant", doctors: ["milos-milosevic"] },
  { slug: "kompozitna-faseta", category: "estetika", nameSr: "Kompozitna faseta", nameEn: "Composite veneer", durationMin: 60, priceType: "fixed", priceFrom: 10000, ...PO_ZUBU, bookingMode: "request", doctors: ["milos-milosevic"] },
  { slug: "keramicka-faseta", category: "estetika", nameSr: "Keramička faseta (E-max)", nameEn: "Ceramic veneer (E-max)", durationMin: 60, priceType: "fixed", priceFrom: 38000, ...PO_ZUBU, bookingMode: "request", doctors: ["milos-milosevic"] },
  { slug: "nakit-za-zube", category: "estetika", nameSr: "Nakit za zube", nameEn: "Tooth gem", durationMin: 30, priceType: "fixed", priceFrom: 3500, bookingMode: "instant", doctors: ["milos-milosevic"] },

  // Lečenje zuba
  { slug: "bela-plomba", category: "lecenje", nameSr: "Bela (kompozitna) plomba", nameEn: "White (composite) filling", durationMin: 45, priceType: "range", priceFrom: 5000, priceTo: 8000, bookingMode: "instant", doctors: ["milos-milosevic", "jovana-jovanovic"], popular: true },
  { slug: "lecenje-kanala", category: "lecenje", nameSr: "Lečenje kanala korena", nameEn: "Root canal treatment", durationMin: 60, priceType: "fixed", priceFrom: 7000, priceUnitSr: "po kanalu", priceUnitEn: "per canal", bookingMode: "instant", doctors: ["milos-milosevic"] },
  { slug: "vadjenje-zuba", category: "lecenje", nameSr: "Vađenje zuba", nameEn: "Tooth extraction", durationMin: 30, priceType: "fixed", priceFrom: 4000, bookingMode: "instant", doctors: ["milos-milosevic"] },
  { slug: "hirursko-vadjenje", category: "lecenje", nameSr: "Hirurško vađenje / umnjak", nameEn: "Surgical / wisdom tooth extraction", durationMin: 60, priceType: "from", priceFrom: 12000, bookingMode: "request", doctors: ["milos-milosevic"] },
  { slug: "hitna-intervencija", category: "lecenje", nameSr: "Hitna intervencija (zubobolja)", nameEn: "Emergency visit (toothache)", durationMin: 30, priceType: "fixed", priceFrom: 3000, bookingMode: "instant", doctors: ["milos-milosevic", "jovana-jovanovic"], popular: true },

  // Protetika
  { slug: "proteticka-konsultacija", category: "protetika", nameSr: "Protetička konsultacija i plan terapije", nameEn: "Prosthodontic consultation & plan", durationMin: 30, priceType: "free", priceFrom: 0, bookingMode: "instant", doctors: ["milos-milosevic"] },
  { slug: "metalokeramicka-krunica", category: "protetika", nameSr: "Metalokeramička krunica", nameEn: "Porcelain-fused-to-metal crown", durationMin: 60, priceType: "fixed", priceFrom: 18000, bookingMode: "request", doctors: ["milos-milosevic"] },
  { slug: "cirkonijum-krunica", category: "protetika", nameSr: "Cirkonijum krunica", nameEn: "Zirconia crown", durationMin: 60, priceType: "fixed", priceFrom: 30000, bookingMode: "request", doctors: ["milos-milosevic"] },
  { slug: "emax-krunica", category: "protetika", nameSr: "Bezmetalna E-max krunica", nameEn: "Metal-free E-max crown", durationMin: 60, priceType: "fixed", priceFrom: 35000, bookingMode: "request", doctors: ["milos-milosevic"] },
  { slug: "totalna-proteza", category: "protetika", nameSr: "Totalna proteza", nameEn: "Complete denture", durationMin: 45, priceType: "fixed", priceFrom: 55000, ...PO_VILICI, bookingMode: "request", doctors: ["milos-milosevic"] },
  { slug: "skeletirana-proteza", category: "protetika", nameSr: "Skeletirana proteza", nameEn: "Cast partial denture", durationMin: 45, priceType: "fixed", priceFrom: 75000, bookingMode: "request", doctors: ["milos-milosevic"] },
  { slug: "reparatura-proteze", category: "protetika", nameSr: "Reparatura proteze", nameEn: "Denture repair", durationMin: 30, priceType: "fixed", priceFrom: 5000, bookingMode: "instant", doctors: ["milos-milosevic"] },

  // Implantologija
  { slug: "implant-konsultacija", category: "implanti", nameSr: "Konsultacija za implante", nameEn: "Implant consultation", durationMin: 30, priceType: "free", priceFrom: 0, bookingMode: "instant", doctors: ["milos-milosevic"] },
  { slug: "ugradnja-implanta", category: "implanti", nameSr: "Ugradnja implanta", nameEn: "Implant placement", durationMin: 90, priceType: "from", priceFrom: 75000, bookingMode: "request", doctors: ["milos-milosevic"] },
  { slug: "krunica-na-implantu", category: "implanti", nameSr: "Krunica na implantu", nameEn: "Crown on an implant", durationMin: 60, priceType: "from", priceFrom: 40000, bookingMode: "request", doctors: ["milos-milosevic"] },
];
