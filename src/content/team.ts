// Tim ordinacije. Ime, boja u kalendaru i aktivnost menjaju se i u admin panelu (Podešavanja → Doktori);
// biografije i oblasti rada menjaju se ovde.

type L = { sr: string; en: string };

export type TeamMember = {
  slug: string;
  name: string; // bez titule; "dr" se dodaje automatski
  specialty: "pedijatrija" | "ortodoncija" | "protetika";
  role: L;
  bio: L;
  focus: { sr: string[]; en: string[] };
  color: string; // boja u kalendaru
  username: string; // korisničko ime za admin panel
  isAdmin?: boolean;
};

export const team: TeamMember[] = [
  {
    slug: "milos-jerkovic",
    name: "Miloš Jerković",
    specialty: "ortodoncija",
    role: { sr: "Ortodont", en: "Orthodontist" },
    bio: {
      sr: "Vodi ortodontske terapije za decu, tinejdžere i odrasle: mobilnim i fiksnim aparatima i providnim folijama. Na besplatnoj konsultaciji detaljno objašnjava plan, trajanje i cenu terapije.",
      en: "Leads orthodontic treatment for children, teenagers and adults with removable and fixed braces and clear aligners. At a free consultation explains the plan, duration and cost in detail.",
    },
    focus: {
      sr: ["Mobilni aparati za decu", "Fiksni metalni i safirni aparati", "Providne folije", "Retejneri i praćenje rezultata"],
      en: ["Removable appliances for children", "Fixed metal and sapphire braces", "Clear aligners", "Retainers and follow-up"],
    },
    color: "#e0662f",
    username: "jerkovic",
    isAdmin: true,
  },
  {
    slug: "jovana-jovanovic",
    name: "Jovana Jovanović",
    specialty: "pedijatrija",
    role: { sr: "Dečji stomatolog", en: "Pediatric dentist" },
    bio: {
      sr: "Sa decom radi strpljivo i nežno, kroz igru i objašnjavanje, tako da i najmlađi pacijenti iz ordinacije izlaze nasmejani. Veliku pažnju posvećuje prevenciji i savetima roditeljima.",
      en: "Works with children patiently and gently, through play and explanation, so even the youngest patients leave smiling. Puts great emphasis on prevention and advice for parents.",
    },
    focus: {
      sr: ["Prvi pregledi i upoznavanje", "Popravka mlečnih zuba", "Zalivanje fisura i fluorizacija", "Prevencija karijesa"],
      en: ["First visits and getting acquainted", "Baby tooth fillings", "Fissure sealants and fluoride", "Cavity prevention"],
    },
    color: "#22988e",
    username: "jovana",
  },
  {
    slug: "milos-milosevic",
    name: "Miloš Milošević",
    specialty: "protetika",
    role: { sr: "Stomatolog protetičar", en: "Prosthodontist" },
    bio: {
      sr: "Bavi se protetikom i estetikom: krunicama, mostovima, protezama i fasetama koje vraćaju funkciju i lep osmeh. Pre početka terapije objašnjava svaki korak i cenu.",
      en: "Focuses on prosthodontics and cosmetic work: crowns, bridges, dentures and veneers that restore function and a beautiful smile. Explains every step and the price before treatment starts.",
    },
    focus: {
      sr: ["Cirkonijum i E-max krunice", "Mostovi i proteze", "Beljenje i fasete", "Lečenje zuba"],
      en: ["Zirconia and E-max crowns", "Bridges and dentures", "Whitening and veneers", "General treatment"],
    },
    color: "#5b6ee1",
    username: "milosevic",
  },
];

export function teamContent(slug: string) {
  return team.find((m) => m.slug === slug);
}
