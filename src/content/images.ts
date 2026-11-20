// PRIVREMENE fotografije sa Unsplash-a (besplatna Unsplash licenca) — samo da vidimo izgled.
// Pre objave zameniti pravim fotografijama ordinacije i tima.
// Izvori: https://unsplash.com/photos/<id> (lista u README.md)
const u = (id: string) => `https://images.unsplash.com/${id}`;

export type SitePhoto = { src: string; alt: { sr: string; en: string } };

export const images = {
  hero: {
    src: u("photo-1752652011858-302f08a6dc9f"),
    alt: { sr: "Mama i ćerka se grle i smeju", en: "Mother and daughter hugging and smiling" },
  },
  familyThree: {
    src: u("photo-1758687125973-ec9932a4245b"),
    alt: { sr: "Nasmejana porodica: roditelji i dečak", en: "Smiling family: parents and their son" },
  },
  kidDentist: {
    src: u("photo-1758205307836-0829c799890b"),
    alt: { sr: "Stomatolog pregleda zube dečaku", en: "Dentist examining a boy's teeth" },
  },
  kidsBrushing: {
    src: u("photo-1651146494264-1b3a54f71175"),
    alt: { sr: "Dečaci peru zube", en: "Boys brushing their teeth" },
  },
  clinic: {
    src: u("photo-1629909613654-28e377c37b09"),
    alt: { sr: "Moderna stomatološka ordinacija sa stolicom i opremom", en: "Modern dental office with chair and equipment" },
  },
  clinicChair: {
    src: u("photo-1598256989800-fe5f95da9787"),
    alt: { sr: "Stomatološka stolica u svetloj ordinaciji", en: "Dental chair in a bright treatment room" },
  },
  consultation: {
    src: u("photo-1777331903190-341a3dd0441b"),
    alt: { sr: "Stomatolog razgovara sa pacijentom u ordinaciji", en: "Dentist talking with a patient in the office" },
  },
  checkup: {
    src: u("photo-1684607632941-2ca3b6234fb9"),
    alt: { sr: "Pacijent na stomatološkom pregledu", en: "Patient at a dental check-up" },
  },
  treatment: {
    src: u("photo-1758205308106-5760d0227cc7"),
    alt: { sr: "Stomatolozi tokom lečenja pacijenta", en: "Dentists treating a patient" },
  },
  aligners: {
    src: u("photo-1564420228450-d9a5bc8d6565"),
    alt: { sr: "Providne folije za ispravljanje zuba", en: "Clear aligners for straightening teeth" },
  },
  smile: {
    src: u("photo-1654373535457-383a0a4d00f9"),
    alt: { sr: "Blistav, beo osmeh", en: "A bright white smile" },
  },
  toothModel: {
    src: u("photo-1684607632829-1e5bf4f21dab"),
    alt: { sr: "Model zuba na stolu", en: "Tooth model on a table" },
  },
  implant: {
    src: u("photo-1593022356769-11f762e25ed9"),
    alt: { sr: "Model zubnog implanta", en: "Dental implant model" },
  },
  waiting: {
    src: u("photo-1762625570087-6d98fca29531"),
    alt: { sr: "Moderna čekaonica", en: "Modern waiting room" },
  },
} satisfies Record<string, SitePhoto>;
