# Dental Centar Jerković — sajt + online zakazivanje + program za ordinaciju

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · SQLite/libSQL (Drizzle ORM) · srpski i engleski.

## Pokretanje (lokalno)

```bash
npm install          # prvi put
npm run setup        # pravi bazu (data/dental.db) i puni je: doktori, usluge, praznici, demo podaci
npm run dev          # http://localhost:3100
```

- Sajt: http://localhost:3100 (srpski) i http://localhost:3100/en (engleski)
- Admin panel: http://localhost:3100/admin — korisnici `jerkovic` (administrator), `jovana`, `milosevic`, lozinka `demo1234`
  → **promenite lozinke** (Podešavanja → Moj nalog) i **obrišite demo podatke** (Podešavanja → Podaci) pre početka rada.
- Ispočetka: `npm run db:reset` (briše SVE i puni ponovo). Bez demo podataka: `npm run db:seed -- --no-demo`.

## Šta gde menjati

| Šta | Gde |
|---|---|
| Adresa, telefon, e-mail, radno vreme, ocena na Google-u, pravila zakazivanja (4h otkazivanje, 60 dana unapred…) | `src/content/clinic.ts` |
| Google profil (Place ID, link „Napišite recenziju“), koordinate, Instagram, okolna naselja | `src/content/clinic.ts` |
| Tekstovi oblasti usluga (opis, prednosti, kome je namenjeno, postupak, česta pitanja) i SEO naslovi (`seoTitle`, `h1`, `seo`) | `src/content/services.ts` |
| Strukturirani podaci za Google (schema.org: Dentist, WebSite, FAQ, Breadcrumb) | `src/lib/jsonld.ts` (vrednosti dolaze iz `src/content/*`) |
| Merenje konverzija (poziv, WhatsApp, Viber, navigacija, zakazivanje) | `src/lib/analytics.ts`, `src/components/site/SiteAnalytics.tsx` |
| Cene, trajanje, ko radi uslugu, „odmah“ ili „na upit“ | admin → Podešavanja → Usluge i cene |
| Tim (biografije, oblasti rada) | `src/content/team.ts` (ime i boja i u adminu → Doktori) |
| Recenzije | `src/content/reviews.ts` |
| Česta pitanja na početnoj | `src/content/faq.ts` |
| Svi ostali tekstovi sajta (srpski/engleski) | `src/lib/dictionaries.ts` |
| Fotografije (trenutno privremene sa Unsplash-a) | `src/content/images.ts` |
| Slika za pregled linka (Viber, WhatsApp, Facebook) — sadrži adresu i telefon | `public/og-sr.png`, `public/og-en.png` → `node scripts/og-slika.cjs` |
| Politika privatnosti (nacrt — proveriti sa pravnikom) | `src/app/(site)/[locale]/privatnost/page.tsx` |

## Funkcije

**Sajt:** početna (prvi slobodan termin uživo), 7 oblasti usluga sa zasebnim stranicama, cenovnik (RSD + ≈ € na engleskom),
tim, kontakt (mapa se učitava tek na klik), WhatsApp/Viber dugmad, traka „Pozovi · WhatsApp · Zakaži“ na telefonu,
SEO (schema.org Dentist, hreflang, sitemap, robots, lepe adrese po jeziku).

**Online zakazivanje:** usluga → doktor (ili „prvi slobodan“) → dan i vreme → podaci (za sebe ili za dete) → odmah potvrđeno.
Složeniji zahvati idu „na upit“ (pacijent bira željene dane, ordinacija zakazuje). Otkazivanje i pomeranje preko linka
do 4 sata pre termina, dodavanje u kalendar (.ics / Google Calendar), zaštita od duplih termina.

**Admin („program“):** pregled dana i KPI, kalendar (dan po doktorima / nedelja), termini i zahtevi, karton pacijenta,
urađeni radovi i uplate (gotovina, kartica, rate, prenos) sa automatskim obračunom duga, izveštaji po mesecu,
podešavanja (cene, radno vreme, odsustva i praznici, doktori, lozinka), pregled svih poslatih mejlova.
Svaki doktor vidi svoj kalendar; administrator vidi sve.

**Automatski mejlovi:** potvrda, obaveštenje ordinaciji o novoj rezervaciji, pomeranje, otkazivanje, podsetnik dan pre,
molba za Google recenziju posle posete, poziv na kontrolu posle 6 meseci (`/api/cron/daily`, Vercel Cron svako jutro).
Dok nije podešen `RESEND_API_KEY`, mejlovi se **samo beleže** u admin → Poruke (ništa ne odlazi napolje).
Tada sajt i ne obećava mejl: pacijent posle zakazivanja dobija link do termina (kopiranje, „Pošalji sebi“, kalendar),
a tekstovi o mejlu i podsetnicima se sami vraćaju kada se podese `RESEND_API_KEY` i `EMAIL_FROM` (`src/lib/features.ts`).

## Objava (kada odlučite)

1. Domen (npr. `.rs`) i hosting (preporuka: Vercel; za komercijalni sajt potreban je Pro paket).
2. Baza: libSQL/Turso (`DATABASE_URL=libsql://…`, `DATABASE_AUTH_TOKEN`) ili SQLite fajl na VPS-u; zatim `npm run setup`.
3. Slanje mejlova: `RESEND_API_KEY` i `EMAIL_FROM` (verifikovan domen).
4. `AUTH_SECRET`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL=https://vas-domen.rs`, `CLINIC_NOTIFY_EMAIL`.

## SEO i merenje (posle povezivanja domena)

- **Domen:** u Vercelu dodati domen (npr. `vas-domen.rs` kao glavni, `www` → preusmerenje na njega) i postaviti
  `NEXT_PUBLIC_SITE_URL=https://vas-domen.rs`. Canonical adrese, sitemap i schema se same prebacuju na domen,
  a stranice sa `*.vercel.app` se trajno (308) preusmeravaju na domen (`src/proxy.ts`).
- **Google Search Console:** svojstvo „Domain“ preko DNS zapisa (preporuka) ili „URL prefix“ preko meta oznake:
  kod iz GSC upisati u Vercel env `GOOGLE_SITE_VERIFICATION` i ponovo objaviti. Zatim poslati `https://vas-domen.rs/sitemap.xml`.
- **Vercel Web Analytics:** Vercel → projekat → Analytics → Enable (bez kolačića, nije potreban baner).
  Posete rade i na Hobby paketu; događaji (`phone_click`, `whatsapp_click`, `booking_completed`…) se prikazuju na Pro paketu.
- **Google profil:** u polje „Website“ upisati `https://vas-domen.rs/?utm_source=google&utm_medium=organic&utm_campaign=gbp`.
- Posle svake veće izmene proveriti: https://search.google.com/test/rich-results i https://pagespeed.web.dev/

## Privremene fotografije (Unsplash licenca, zameniti pravim)

unsplash.com/photos/: VzqEWn1uxaM (glavna), aCJ2jt9yvoA-serija (stomatolog i dečak), e7MJLM5VGjY (ordinacija),
XJptUS8nbhs (stolica), Bg81yWKZlMg, sS6qV__PFR4, WFsNCIn8OF4 (folije), glPVwPr1FKo (osmeh), f6a2ZaBytUM (model zuba),
W9YEY6G8LVM (implant), pxOQ-P97sA8 (čekaonica) i porodične fotografije sa stranica „kid-dentist“ / „happy-family-smile“.
