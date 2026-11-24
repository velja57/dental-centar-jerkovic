import type { Metadata } from "next";
import { PageHero } from "@/components/site/ui";
import { clinic } from "@/content/clinic";
import { getDict } from "@/lib/dictionaries";
import { alternates, type Locale } from "@/lib/i18n";

// NACRT politike privatnosti — pre objave proveriti sa pravnikom (Zakon o zaštiti podataka o ličnosti, "Sl. glasnik RS" 87/2018).

type Props = { params: Promise<{ locale: string }> };

const content = {
  sr: {
    title: "Politika privatnosti",
    intro: `Ova politika objašnjava kako ${clinic.name} prikuplja i koristi lične podatke kada zakazujete termin preko sajta.`,
    sections: [
      {
        h: "Rukovalac podacima",
        p: `${clinic.name}, ${clinic.address.street}, ${clinic.address.postalCode} ${clinic.address.city}. Kontakt: ${clinic.email}, ${clinic.phoneDisplay}.`,
      },
      {
        h: "Koje podatke prikupljamo",
        p: "Ime i prezime (i ime roditelja ako zakazujete za dete), broj telefona, e-mail adresu, izabranu uslugu i termin, kao i napomenu koju sami unesete.",
      },
      {
        h: "Svrha obrade",
        p: "Podatke koristimo isključivo za zakazivanje i potvrdu termina, podsetnike, obaveštenja o promeni termina i poziv na kontrolni pregled. Ne prodajemo ih i ne koristimo za oglašavanje trećih strana.",
      },
      {
        h: "Pravni osnov",
        p: "Vaš pristanak, dat pri zakazivanju, i preduzimanje radnji na vaš zahtev pre pružanja usluge. Pristanak možete povući u svakom trenutku.",
      },
      {
        h: "Koliko dugo čuvamo podatke",
        p: "Podatke o terminima čuvamo dok je potrebno radi pružanja usluge i vođenja evidencije, u skladu sa propisima o zdravstvenoj dokumentaciji.",
      },
      {
        h: "Kome se podaci dostavljaju",
        p: "Pristup imaju samo zaposleni u ordinaciji. Tehnički pružaoci usluga (hosting sajta i slanje e-mailova) obrađuju podatke samo u naše ime i uz odgovarajuću zaštitu.",
      },
      {
        h: "Vaša prava",
        p: "Imate pravo na pristup, ispravku i brisanje podataka, ograničenje obrade, prenosivost i prigovor, kao i pravo na pritužbu Povereniku za informacije od javnog značaja i zaštitu podataka o ličnosti.",
      },
      {
        h: "Merenje posećenosti",
        p: "Da bismo znali koje stranice su korisne i koliko ljudi nas pozove ili zakaže termin preko sajta, koristimo Vercel Web Analytics. On ne koristi kolačiće i ne prepoznaje vas lično: beleži samo zbirne podatke (posećena stranica, vrsta uređaja, zemlja) i klikove kao što su „poziv“ ili „zakazan termin“, bez vašeg imena, telefona, e-maila i podataka o zdravlju.",
      },
      {
        h: "Kolačići",
        p: "Sajt ne koristi kolačiće za praćenje ili oglašavanje. Mapa sa Google Maps učitava se samo kada kliknete na nju.",
      },
    ],
  },
  en: {
    title: "Privacy policy",
    intro: `This policy explains how ${clinic.name} collects and uses personal data when you book an appointment on our website.`,
    sections: [
      {
        h: "Data controller",
        p: `${clinic.name}, ${clinic.address.street}, ${clinic.address.postalCode} ${clinic.address.city}, Serbia. Contact: ${clinic.email}, ${clinic.phoneE164}.`,
      },
      {
        h: "What we collect",
        p: "Your full name (and a parent's name when booking for a child), phone number, e-mail address, the chosen service and time, and any note you enter.",
      },
      {
        h: "Why we use it",
        p: "Only to book and confirm appointments, send reminders, notify you about changes and invite you to check-ups. We never sell your data or use it for third-party advertising.",
      },
      {
        h: "Legal basis",
        p: "Your consent given when booking, and steps taken at your request before providing a service. You may withdraw consent at any time.",
      },
      {
        h: "How long we keep it",
        p: "Appointment data is kept as long as needed to provide care and keep records, in line with regulations on medical documentation.",
      },
      {
        h: "Who can access it",
        p: "Only clinic staff. Technical providers (website hosting and e-mail delivery) process data solely on our behalf with appropriate safeguards.",
      },
      {
        h: "Your rights",
        p: "You have the right to access, correct and erase your data, restrict processing, data portability and to object, as well as to lodge a complaint with the Serbian Commissioner for Information of Public Importance and Personal Data Protection.",
      },
      {
        h: "Visitor statistics",
        p: "To learn which pages are useful and how many people call us or book through the website, we use Vercel Web Analytics. It uses no cookies and does not identify you: it records only aggregate data (page visited, device type, country) and clicks such as “call” or “appointment booked”, never your name, phone number, e-mail or health information.",
      },
      {
        h: "Cookies",
        p: "The website does not use tracking or advertising cookies. The Google Maps map loads only when you click on it.",
      },
    ],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = (await params).locale as Locale;
  return { title: content[locale].title, alternates: alternates(locale, "privacy") };
}

export default async function PrivacyPage({ params }: Props) {
  const locale = (await params).locale as Locale;
  const c = content[locale];
  const t = getDict(locale);
  return (
    <>
      <PageHero eyebrow={t.footer.privacy} title={c.title} subtitle={c.intro} />
      <section className="pb-20">
        <div className="container-page max-w-3xl">
          <div className="grid gap-8">
            {c.sections.map((s) => (
              <div key={s.h}>
                <h2 className="text-xl font-extrabold text-ink">{s.h}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
