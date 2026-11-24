import { categorySlugs, type CategoryKey } from "./category-slugs";
import { images, type SitePhoto } from "./images";
import type { Locale } from "@/lib/i18n";

type L = { sr: string; en: string };
type LL = { sr: string[]; en: string[] };
type QA = { q: string; a: string };
type Step = { t: string; d: string };

export type DentalIconName = "child" | "shield" | "braces" | "sparkle" | "filling" | "crown" | "implant" | "tooth";

// SEO: seoTitle ide u <title> (+ " | Dental Centar Jerković"), h1 je naslov stranice, seo je meta description.
// Medicinski tekstovi (forWhom, steps, faq) su opšti i konzervativni — pre objave ih pregleda stomatolog ordinacije.
export type Category = {
  key: CategoryKey;
  icon: DentalIconName;
  image: SitePhoto;
  title: L;
  seoTitle: L;
  h1: L;
  short: L;
  intro: L;
  benefits: LL;
  forWhom: LL;
  steps: { sr: Step[]; en: Step[] };
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
    seoTitle: { sr: "Dečji stomatolog u Batajnici", en: "Pediatric dentist in Batajnica" },
    h1: { sr: "Dečji stomatolog u Batajnici", en: "Pediatric dentist in Batajnica, Belgrade" },
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
    forWhom: {
      sr: [
        "Bebama i maloj deci, od izbijanja prvih zuba",
        "Predškolcima i školarcima, za redovne kontrole, popravke i zaštitu zuba",
        "Deci koja se plaše zubara ili su imala neprijatno iskustvo",
      ],
      en: [
        "Babies and toddlers, from the very first tooth",
        "Pre-schoolers and school children, for check-ups, fillings and protection",
        "Children who are afraid of the dentist or have had a bad experience",
      ],
    },
    steps: {
      sr: [
        { t: "Upoznavanje", d: "Dete razgleda ordinaciju i stolicu, a mi sa roditeljem razgovaramo o navikama, ishrani i eventualnim tegobama." },
        { t: "Pregled", d: "Pregledamo zube i desni i pratimo kako teku nicanje i smena zuba." },
        { t: "Plan i saveti", d: "Roditelj dobija objašnjenje šta je potrebno, kojim redom i po kojoj ceni, kao i savete za pranje zuba kod kuće." },
        { t: "Lečenje i kontrole", d: "Sa lečenjem počinjemo kada je dete spremno, a kontrole zakazujemo u skladu sa uzrastom i stanjem zuba." },
      ],
      en: [
        { t: "Getting acquainted", d: "Your child explores the room and the chair while we talk with you about habits, diet and any problems." },
        { t: "Check-up", d: "We examine the teeth and gums and keep an eye on how the teeth are coming through and changing." },
        { t: "Plan and advice", d: "You get a clear explanation of what is needed, in what order and at what cost, plus tips for brushing at home." },
        { t: "Treatment and follow-ups", d: "Treatment starts when your child is ready, and follow-ups are scheduled according to age and the state of the teeth." },
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
        {
          q: "Kako da pripremim dete za prvi pregled?",
          a: "Govorite o pregledu mirno i bez reči kao što su „boli“ ili „bocka“. Prvi dolazak je upoznavanje, a roditelj je sve vreme uz dete.",
        },
        {
          q: "Koliko često dete treba da ide na kontrolu?",
          a: "Najčešće na šest meseci, a češće ako je dete sklono karijesu. Raspored kontrola stomatolog predlaže posle pregleda.",
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
        {
          q: "How can I prepare my child for the first visit?",
          a: "Talk about it calmly and avoid words like “hurt” or “needle”. The first visit is just getting to know us, and a parent stays with the child the whole time.",
        },
        {
          q: "How often should my child have a check-up?",
          a: "Usually every six months, or more often if your child is prone to cavities. The dentist will suggest a schedule after the check-up.",
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
    seoTitle: { sr: "Pregled i uklanjanje kamenca u Batajnici", en: "Dental check-ups and scaling in Batajnica" },
    h1: { sr: "Stomatološki pregled i uklanjanje kamenca", en: "Dental check-ups and scaling" },
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
    forWhom: {
      sr: [
        "Svima kojima je od poslednje kontrole prošlo više od šest meseci",
        "Ako primećujete krvarenje desni, kamenac ili neprijatan zadah",
        "Pušačima i ljubiteljima kafe i čaja koji žele da uklone mrlje sa zuba",
      ],
      en: [
        "Anyone whose last check-up was more than six months ago",
        "If you notice bleeding gums, tartar or bad breath",
        "Smokers and coffee or tea lovers who want to remove stains",
      ],
    },
    steps: {
      sr: [
        { t: "Razgovor i pregled", d: "Pregledamo zube, desni i postojeće plombe i pitamo vas da li vas nešto muči." },
        { t: "Uklanjanje kamenca", d: "Kamenac uklanjamo ultrazvučnim aparatom, a zatim poliramo zube." },
        { t: "Peskiranje po potrebi", d: "Mrlje od kafe, čaja ili duvana uklanjamo peskiranjem (Air Flow)." },
        { t: "Saveti i podsetnik", d: "Dobijate savete za održavanje higijene, a sistem vas podseti kada je vreme za sledeću kontrolu." },
      ],
      en: [
        { t: "Chat and check-up", d: "We examine your teeth, gums and existing fillings and ask whether anything is bothering you." },
        { t: "Scaling", d: "Tartar is removed with an ultrasonic scaler, and then your teeth are polished." },
        { t: "Air Flow if needed", d: "Coffee, tea or tobacco stains are removed with Air Flow polishing." },
        { t: "Advice and a reminder", d: "You get hygiene tips, and our system reminds you when your next check-up is due." },
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
        {
          q: "Koliko često treba ići na stomatološki pregled?",
          a: "Za većinu dece i odraslih preporuka je jednom u šest meseci. Ako ste skloni karijesu ili problemima sa desnima, stomatolog može predložiti češće kontrole.",
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
        {
          q: "How often should I see the dentist for a check-up?",
          a: "For most children and adults the recommendation is every six months. If you're prone to cavities or gum problems, your dentist may suggest more frequent visits.",
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
    seoTitle: { sr: "Ortodont u Batajnici – aparatići i folije", en: "Orthodontist in Batajnica – braces and aligners" },
    h1: { sr: "Ortodont u Batajnici", en: "Orthodontist in Batajnica, Belgrade" },
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
    forWhom: {
      sr: [
        "Deci u razvoju, kod koje se mnoge nepravilnosti mogu ispraviti na vreme",
        "Tinejdžerima i odraslima sa krivim, zbijenim ili razmaknutim zubima",
        "Odraslima koji žele diskretnije rešenje: safirni aparat ili providne folije",
      ],
      en: [
        "Growing children, when many problems can be corrected early",
        "Teenagers and adults with crooked, crowded or gapped teeth",
        "Adults who want a more discreet option: sapphire braces or clear aligners",
      ],
    },
    steps: {
      sr: [
        { t: "Konsultacija", d: "Ortodont pregleda zube i zagrižaj, objasni šta primećuje i da li je terapija potrebna." },
        { t: "Dijagnostika i plan", d: "Na osnovu otisaka ili skeniranja i rendgenskih snimaka pravi se plan terapije, sa okvirnim trajanjem i cenom." },
        { t: "Postavljanje aparata", d: "Aparat se predaje ili postavlja u jednoj poseti, uz uputstva za nošenje i održavanje." },
        { t: "Kontrole i retencija", d: "Na kontrole se dolazi najčešće na četiri do osam nedelja. Posle terapije retejner čuva postignut rezultat." },
      ],
      en: [
        { t: "Consultation", d: "The orthodontist checks your teeth and bite, explains what they see and whether treatment is needed." },
        { t: "Records and plan", d: "Impressions or a scan and X-rays are used to make a treatment plan with an estimated duration and price." },
        { t: "Fitting the appliance", d: "The appliance is fitted or handed over in one visit, with instructions for wearing and cleaning it." },
        { t: "Follow-ups and retention", d: "Adjustment visits are usually every four to eight weeks. After treatment, a retainer keeps the result in place." },
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
        {
          q: "Kada je vreme za prvi ortodontski pregled?",
          a: "Preporučuje se da dete prvi put pregleda ortodont oko sedme godine, kada se mnoge nepravilnosti mogu uočiti na vreme. Za ortodontsku terapiju nije kasno ni u odraslom dobu.",
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
        {
          q: "When should my child first see an orthodontist?",
          a: "Around the age of seven is recommended, when many problems can be spotted early. And it's never too late: adults can have orthodontic treatment too.",
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
    seoTitle: { sr: "Beljenje zuba i fasete u Batajnici", en: "Teeth whitening and veneers in Batajnica" },
    h1: { sr: "Beljenje zuba i estetska stomatologija", en: "Teeth whitening and cosmetic dentistry" },
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
    forWhom: {
      sr: [
        "Onima kojima smeta boja zuba ili mrlje koje ne skida obično pranje",
        "Pacijentima sa okrnjenim, neujednačenim ili razmaknutim prednjim zubima",
        "Svima koji pre važnog događaja žele svetliji i ujednačeniji osmeh",
      ],
      en: [
        "Anyone bothered by tooth colour or stains that brushing won't remove",
        "Patients with chipped, uneven or gapped front teeth",
        "Anyone who wants a brighter, more even smile before a big event",
      ],
    },
    steps: {
      sr: [
        { t: "Pregled i želje", d: "Proveravamo zdravlje zuba i desni i razgovaramo o tome šta biste voleli da promenite." },
        { t: "Priprema", d: "Pre beljenja ili faseta rešavamo karijes i uklanjamo kamenac, jer se tretman radi samo na zdravim zubima." },
        { t: "Tretman", d: "Beljenje se radi u ordinaciji ili kod kuće, uz folije i gel, a fasete prema planu koji smo zajedno dogovorili." },
        { t: "Održavanje", d: "Dobijate savete kako da rezultat što duže traje i kada da dođete na kontrolu." },
      ],
      en: [
        { t: "Check-up and goals", d: "We check the health of your teeth and gums and talk about what you'd like to change." },
        { t: "Preparation", d: "Any decay and tartar are treated first, because cosmetic treatment is only done on healthy teeth." },
        { t: "Treatment", d: "Whitening is done in the office or at home with trays and gel, and veneers follow the plan we agree together." },
        { t: "Aftercare", d: "You get advice on making the result last and on when to come back for a check-up." },
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
        {
          q: "Da li beljenje menja boju plombi i krunica?",
          a: "Ne. Beljenje deluje samo na prirodne zube, pa se plombe ili krunice na vidljivim mestima ponekad menjaju posle beljenja, da bi se boja uskladila. O tome razgovaramo pre tretmana.",
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
        {
          q: "Does whitening change the colour of fillings and crowns?",
          a: "No. Whitening only works on natural teeth, so visible fillings or crowns are sometimes replaced afterwards to match the new shade. We discuss this before treatment.",
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
    seoTitle: { sr: "Lečenje i popravka zuba u Batajnici", en: "Fillings and root canal treatment in Batajnica" },
    h1: { sr: "Lečenje i popravka zuba", en: "Fillings, root canals and extractions" },
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
    forWhom: {
      sr: [
        "Ako vas boli zub ili ste osetljivi na hladno, toplo ili slatko",
        "Ako vam je pukla ili ispala plomba ili se okrnjio zub",
        "Ako je potrebno vađenje zuba ili umnjaka",
      ],
      en: [
        "If you have toothache or sensitivity to cold, heat or sweets",
        "If a filling has cracked or fallen out, or a tooth has chipped",
        "If a tooth or wisdom tooth needs to come out",
      ],
    },
    steps: {
      sr: [
        { t: "Pregled", d: "Utvrđujemo uzrok tegoba i pre početka objašnjavamo moguća rešenja i cenu." },
        { t: "Anestezija", d: "Kada je potrebno, zub lokalno anesteziramo, a vi u svakom trenutku možete dati znak da zastanemo." },
        { t: "Lečenje", d: "Uklanjamo karijes i zub popravljamo plombom u boji zuba. Ako je zahvaćen nerv, radi se lečenje kanala korena." },
        { t: "Kontrola", d: "Proveravamo zagrižaj i dajemo savete za naredne dane. Zub posle lečenja kanala često treba zaštititi nadogradnjom ili krunicom." },
      ],
      en: [
        { t: "Examination", d: "We find the cause of the problem and explain the options and the price before we start." },
        { t: "Anaesthesia", d: "When needed, the tooth is numbed with local anaesthetic, and you can signal us to pause at any time." },
        { t: "Treatment", d: "Decay is removed and the tooth is restored with a tooth-coloured filling. If the nerve is affected, root canal treatment is done." },
        { t: "Follow-up", d: "We check your bite and give advice for the next few days. After a root canal, a tooth often needs a core build-up or a crown." },
      ],
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
        {
          q: "Da li je bolje izvaditi ili lečiti zub?",
          a: "Kad god je moguće, bolje je sačuvati prirodan zub. Vađenje predlažemo tek kada zub ne može pouzdano da se izleči, i tada razgovaramo o tome kako da se nadoknadi.",
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
        {
          q: "Is it better to extract or to save a tooth?",
          a: "Whenever possible, it's better to keep your natural tooth. We only suggest an extraction when a tooth can't be reliably saved, and then we discuss how to replace it.",
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
    seoTitle: { sr: "Krunice, mostovi i proteze u Batajnici", en: "Crowns, bridges and dentures in Batajnica" },
    h1: { sr: "Zubne krunice, mostovi i proteze", en: "Crowns, bridges and dentures" },
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
    forWhom: {
      sr: [
        "Pacijentima kojima nedostaje jedan ili više zuba",
        "Kada je zub jako oštećen ili mu je posle lečenja kanala potrebna zaštita",
        "Nosiocima proteza kojima je proteza postala labava, napukla ili neudobna",
      ],
      en: [
        "Patients missing one or more teeth",
        "When a tooth is badly damaged or needs protection after a root canal",
        "Denture wearers whose denture has become loose, cracked or uncomfortable",
      ],
    },
    steps: {
      sr: [
        { t: "Pregled i plan", d: "Procenjujemo stanje zuba i desni i predlažemo rešenja, uz prednosti, trajanje i cenu svakog." },
        { t: "Priprema i otisak", d: "Zubi se pripremaju i uzima se otisak. Do gotovog rada, kada je potrebno, nosite privremeno rešenje." },
        { t: "Proba", d: "Proveravamo oblik, boju i zagrižaj i po potrebi korigujemo pre konačnog postavljanja." },
        { t: "Predaja i kontrola", d: "Rad se cementira ili predaje, uz savete za održavanje i kontrolu posle perioda navikavanja." },
      ],
      en: [
        { t: "Assessment and plan", d: "We assess your teeth and gums and suggest options, with the benefits, timeline and price of each." },
        { t: "Preparation and impressions", d: "The teeth are prepared and impressions are taken. Until the final work is ready, you wear a temporary solution when needed." },
        { t: "Try-in", d: "We check the shape, shade and bite and make adjustments before the final fitting." },
        { t: "Fitting and follow-up", d: "The work is cemented or handed over, with care instructions and a check-up after you've got used to it." },
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
        {
          q: "Koliko traju krunice i mostovi?",
          a: "Uz dobru higijenu i redovne kontrole krunice i mostovi traju dugi niz godina. Trajnost zavisi od materijala, stanja zuba nosača i navika kao što je škrgutanje zubima.",
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
        {
          q: "How long do crowns and bridges last?",
          a: "With good hygiene and regular check-ups, crowns and bridges last for many years. How long depends on the material, the supporting teeth and habits such as grinding.",
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
    seoTitle: { sr: "Zubni implanti u Batajnici", en: "Dental implants in Batajnica" },
    h1: { sr: "Zubni implanti", en: "Dental implants" },
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
    forWhom: {
      sr: [
        "Odraslima kojima nedostaje jedan ili više zuba",
        "Nosiocima proteza koji žele stabilnije rešenje",
        "Onima koji ne žele da se zbog mosta bruse zdravi susedni zubi",
      ],
      en: [
        "Adults missing one or more teeth",
        "Denture wearers who want a more stable solution",
        "Anyone who'd rather not have healthy neighbouring teeth ground down for a bridge",
      ],
    },
    steps: {
      sr: [
        { t: "Konsultacija", d: "Procenjujemo da li ste kandidat za implant i šta je potrebno pre ugradnje." },
        { t: "Dijagnostika", d: "Na osnovu snimka, najčešće 3D snimka vilice, planira se položaj implanta." },
        { t: "Ugradnja", d: "Implant se ugrađuje u lokalnoj anesteziji. Sledi srastanje sa kosti, najčešće od tri do šest meseci." },
        { t: "Krunica", d: "Kada implant sraste, izrađuje se i postavlja krunica, a zatim se dolazi na redovne kontrole." },
      ],
      en: [
        { t: "Consultation", d: "We assess whether you're a candidate for an implant and what is needed before placement." },
        { t: "Planning", d: "The implant position is planned from an X-ray, usually a 3D scan of the jaw." },
        { t: "Placement", d: "The implant is placed under local anaesthetic. It then bonds with the bone, usually over three to six months." },
        { t: "Crown", d: "Once the implant has healed, the crown is made and fitted, followed by regular check-ups." },
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
        {
          q: "Da li svako može da ugradi implant?",
          a: "Većina odraslih može, ali o tome odlučuje stomatolog posle pregleda i snimka. Na plan terapije utiču količina kosti, opšte zdravlje, pušenje i neke hronične bolesti.",
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
        {
          q: "Can anyone have an implant?",
          a: "Most adults can, but the dentist decides after an examination and X-ray. Bone volume, general health, smoking and some chronic conditions all affect the plan.",
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
