import { clinic } from "./clinic";

// Radno vreme rečenicom, iz clinic.hours (da odgovor nikad ne odstupa od tabele radnog vremena).
const DAYS = {
  sr: ["nedeljom", "ponedeljkom", "utorkom", "sredom", "četvrtkom", "petkom", "subotom"],
  en: ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"],
};
const WEEK = [1, 2, 3, 4, 5, 6, 0];
const hm = (t: string) => t.replace(/^0/, "");

function joinList(items: string[], and: string) {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

function hoursAnswer(loc: "sr" | "en") {
  const groups: { open: string; close: string; days: number[] }[] = [];
  for (const wd of WEEK) {
    const h = clinic.hours.find((x) => x.weekday === wd);
    if (!h) continue;
    const g = groups.find((x) => x.open === h.open && x.close === h.close);
    if (g) g.days.push(wd);
    else groups.push({ open: h.open, close: h.close, days: [wd] });
  }
  const closed = WEEK.filter((wd) => !clinic.hours.some((x) => x.weekday === wd));
  if (loc === "sr") {
    const open = groups.map((g) => `${joinList(g.days.map((d) => DAYS.sr[d]), "i")} od ${hm(g.open)} do ${hm(g.close)}`).join(", a ");
    const offList = joinList(closed.map((d) => DAYS.sr[d]), "i");
    const off = closed.length ? ` ${offList.charAt(0).toUpperCase()}${offList.slice(1)} ne radimo.` : "";
    return `Radimo ${open}.${off} Termin možete zakazati online u bilo koje doba.`;
  }
  const open = groups.map((g) => `${joinList(g.days.map((d) => DAYS.en[d]), "and")} from ${hm(g.open)} to ${hm(g.close)}`).join(", and ");
  const off = closed.length ? ` We're closed on ${joinList(closed.map((d) => DAYS.en[d]), "and")}.` : "";
  return `We're open ${open}.${off} You can book online at any time.`;
}

export const generalFaq = {
  sr: [
    {
      q: "Da li je prva konsultacija zaista besplatna?",
      a: "Da. Na prvom pregledu pregledamo zube, razgovaramo o onome što vas muči i dobijate plan terapije sa cenom, bez ikakve obaveze.",
    },
    {
      q: "Kako mogu da otkažem ili pomerim termin?",
      a: `Preko linka iz e-maila potvrde, najkasnije ${clinic.booking.cancelHours} sata pre termina. Kasnije izmene dogovaramo telefonom.`,
    },
    {
      q: "Da li mogu da platim na rate?",
      a: "Da, karticama na rate i čekovima, a za veće radove pravimo plan plaćanja u fazama.",
    },
    {
      q: "Da li radite sa privatnim osiguranjem?",
      a: "Sarađujemo sa privatnim osiguravajućim kućama. Pre dolaska nam javite koje osiguranje imate, pa ćemo proveriti šta pokriva.",
    },
    {
      q: "Moje dete se plaši zubara. Šta da radim?",
      a: "Neka prvi dolazak bude samo upoznavanje. Naš dečji stomatolog radi kroz igru i bez prisile, a roditelj je uz dete sve vreme.",
    },
    {
      q: "Da li primate hitne slučajeve?",
      a: `Da. Pozovite nas na ${clinic.phoneDisplay} ili zakažite hitnu intervenciju online. Pacijente sa bolom trudimo se da primimo istog dana.`,
    },
    {
      q: "Kakvo je radno vreme ordinacije?",
      a: hoursAnswer("sr"),
    },
    {
      q: "Gde se nalazite?",
      a: `${clinic.address.street}, ${clinic.address.city} (Beograd). Na stranici Kontakt su mapa i uputstvo za dolazak.`,
    },
  ],
  en: [
    {
      q: "Is the first consultation really free?",
      a: "Yes. At your first visit we examine your teeth, talk about what's bothering you and give you a treatment plan with prices, with no obligation.",
    },
    {
      q: "How can I cancel or reschedule?",
      a: `Use the link in your confirmation e-mail, no later than ${clinic.booking.cancelHours} hours before the appointment. Later changes can be arranged by phone.`,
    },
    {
      q: "Can I pay in instalments?",
      a: "Yes, with instalment-enabled cards and cheques, and for larger treatments we set up a staged payment plan.",
    },
    {
      q: "Do you accept private insurance?",
      a: "We work with private insurance companies. Let us know which insurer you have before your visit and we'll check what's covered.",
    },
    {
      q: "My child is afraid of the dentist. What should I do?",
      a: "Make the first visit just a get-to-know-us. Our pediatric dentist works through play and never forces anything, and a parent stays with the child the whole time.",
    },
    {
      q: "Do you take emergencies?",
      a: `Yes. Call us on ${clinic.phoneE164} or book an emergency visit online. We do our best to see patients in pain the same day.`,
    },
    {
      q: "What are your opening hours?",
      a: hoursAnswer("en"),
    },
    {
      q: "Where are you located?",
      a: `${clinic.address.street}, ${clinic.address.city} (Belgrade, Serbia). The Contact page has a map and directions.`,
    },
  ],
};
