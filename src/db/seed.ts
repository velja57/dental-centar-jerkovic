/**
 * Početno punjenje baze.
 *   npm run db:seed            – dodaje doktore, rasporede, usluge, praznike i demo podatke (ako baza nema termine)
 *   npm run db:reset           – briše SVE podatke i puni ispočetka
 *   npm run db:seed -- --no-demo – bez demo pacijenata i termina
 * Lozinka za sve naloge: SEED_PASSWORD iz .env.local ili "demo1234" (promeniti posle prijave!).
 */
import { randomBytes } from "node:crypto";

// Lokalna podešavanja se učitavaju samo kad adresa baze nije prosleđena (npr. iz skripte za objavu)
if (!process.env.DATABASE_URL && !process.env.TURSO_DATABASE_URL) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // nema .env.local – koriste se podrazumevane vrednosti
  }
}

async function main() {
  const { db } = await import("./index");
  const s = await import("./schema");
  const { eq, sql } = await import("drizzle-orm");
  const { team } = await import("../content/team");
  const { serviceSeeds } = await import("../content/services");
  const { clinic } = await import("../content/clinic");
  const { hashPassword } = await import("../lib/password");
  const t = await import("../lib/time");

  const args = process.argv.slice(2);
  const reset = args.includes("--reset");
  const withDemo = !args.includes("--no-demo");

  if (reset) {
    console.log("Brišem postojeće podatke…");
    for (const table of [s.emailOutbox, s.payments, s.treatments, s.appointments, s.timeOff, s.schedules, s.patients, s.services, s.doctors]) {
      await db.delete(table);
    }
  }

  // ——— Doktori ———
  const password = process.env.SEED_PASSWORD || "demo1234";
  const doctorIds: Record<string, number> = {};
  for (const [i, m] of team.entries()) {
    const [existing] = await db.select().from(s.doctors).where(eq(s.doctors.slug, m.slug));
    if (existing) {
      doctorIds[m.slug] = existing.id;
      continue;
    }
    const [row] = await db
      .insert(s.doctors)
      .values({
        slug: m.slug,
        name: m.name,
        specialty: m.specialty,
        username: m.username,
        passwordHash: hashPassword(password),
        role: m.isAdmin ? "admin" : "doctor",
        color: m.color,
        sortOrder: i,
      })
      .returning({ id: s.doctors.id });
    doctorIds[m.slug] = row.id;
    console.log(`+ doktor ${m.name} (korisnik: ${m.username})`);
  }

  // ——— Rasporedi (radno vreme ordinacije za svakog doktora) ———
  for (const id of Object.values(doctorIds)) {
    const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(s.schedules).where(eq(s.schedules.doctorId, id));
    if (n > 0) continue;
    await db.insert(s.schedules).values(
      clinic.hours.map((h) => ({ doctorId: id, weekday: h.weekday, startMin: t.timeToMin(h.open), endMin: t.timeToMin(h.close) })),
    );
  }

  // ——— Usluge (postojeće se ne diraju, da bi cene izmenjene u adminu ostale) ———
  const serviceIds: Record<string, number> = {};
  for (const [i, svc] of serviceSeeds.entries()) {
    const [existing] = await db.select().from(s.services).where(eq(s.services.slug, svc.slug));
    if (existing) {
      serviceIds[svc.slug] = existing.id;
      continue;
    }
    const [row] = await db
      .insert(s.services)
      .values({
        slug: svc.slug,
        category: svc.category,
        nameSr: svc.nameSr,
        nameEn: svc.nameEn,
        durationMin: svc.durationMin,
        priceType: svc.priceType,
        priceFrom: svc.priceFrom,
        priceTo: svc.priceTo ?? null,
        priceUnitSr: svc.priceUnitSr ?? null,
        priceUnitEn: svc.priceUnitEn ?? null,
        bookingMode: svc.bookingMode,
        doctorSlugs: JSON.stringify(svc.doctors),
        popular: svc.popular ?? false,
        sortOrder: i,
      })
      .returning({ id: s.services.id });
    serviceIds[svc.slug] = row.id;
  }
  console.log(`✓ usluge: ${Object.keys(serviceIds).length}`);

  // ——— Državni praznici (ordinacija ne radi) ———
  const holidays = [
    { from: "2027-01-01", to: "2027-01-02", reason: "Nova godina" },
    { from: "2027-01-07", to: "2027-01-07", reason: "Božić" },
    { from: "2027-02-15", to: "2027-02-16", reason: "Sretenje – Dan državnosti" },
    { from: "2027-04-30", to: "2027-05-04", reason: "Uskrs i Praznik rada (proveriti)" },
    { from: "2027-11-11", to: "2027-11-11", reason: "Dan primirja" },
  ];
  const [{ offCount }] = await db.select({ offCount: sql<number>`count(*)` }).from(s.timeOff);
  if (offCount === 0) {
    await db.insert(s.timeOff).values(holidays.map((h) => ({ doctorId: null, dateFrom: h.from, dateTo: h.to, reason: h.reason })));
    console.log(`✓ praznici: ${holidays.length}`);
  }

  // ——— Demo podaci (da admin panel odmah pokaže kako izgleda) ———
  const [{ apptCount }] = await db.select({ apptCount: sql<number>`count(*)` }).from(s.appointments);
  if (withDemo && apptCount === 0) {
    await seedDemo();
  }

  console.log("\nGotovo. Prijava u admin: /admin/login");
  console.log(`Korisnici: ${team.map((m) => m.username).join(", ")} | lozinka: ${process.env.SEED_PASSWORD ? "(iz SEED_PASSWORD)" : password}`);

  async function seedDemo() {
    // Deterministički "slučajni" brojevi, da demo uvek izgleda isto
    let seed = 20261117;
    const rnd = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
    const pick = <T>(arr: readonly T[]) => arr[Math.floor(rnd() * arr.length)];

    const people = [
      { fullName: "Jovana Petrović", kind: "adult" },
      { fullName: "Marko Jovanović", kind: "adult" },
      { fullName: "Milena Ilić", kind: "adult" },
      { fullName: "Stefan Marković", kind: "adult" },
      { fullName: "Ivana Stojanović", kind: "adult" },
      { fullName: "Nikola Pavlović", kind: "adult" },
      { fullName: "Teodora Đorđević", kind: "adult" },
      { fullName: "Aleksandar Popović", kind: "adult" },
      { fullName: "Dragana Kostić", kind: "adult" },
      { fullName: "Vladimir Savić", kind: "adult" },
      { fullName: "Luka Nikolić", kind: "child", guardian: "Jelena Nikolić" },
      { fullName: "Mia Lukić", kind: "child", guardian: "Petar Lukić" },
      { fullName: "Vuk Ristić", kind: "child", guardian: "Marija Ristić" },
      { fullName: "Sara Tomić", kind: "child", guardian: "Ivan Tomić" },
      { fullName: "Lazar Simić", kind: "teen", guardian: "Snežana Simić" },
      { fullName: "Una Mitrović", kind: "teen" },
      { fullName: "Ognjen Vasić", kind: "teen" },
    ] as const;

    const patientIds: { id: number; kind: string }[] = [];
    for (const [i, p] of people.entries()) {
      const first = p.fullName.split(" ")[0].toLowerCase().replace(/[čć]/g, "c").replace(/đ/g, "dj").replace(/š/g, "s").replace(/ž/g, "z");
      const [row] = await db
        .insert(s.patients)
        .values({
          fullName: p.fullName,
          phone: `+38160000${String(1000 + i)}`,
          email: `${first}.demo${i}@example.com`,
          guardianName: "guardian" in p ? p.guardian : null,
          source: "demo",
          note: "Demo pacijent (izmišljen)",
        })
        .returning({ id: s.patients.id });
      patientIds.push({ id: row.id, kind: p.kind });
    }

    const byKind = (kinds: string[]) => patientIds.filter((p) => kinds.includes(p.kind));
    const plan: Record<string, { services: string[]; patients: { id: number; kind: string }[] }> = {
      "jovana-jovanovic": {
        services: ["prvi-pregled-deteta", "popravka-mlecnog-zuba", "zalivanje-fisura", "fluorizacija-dece", "popravka-mlecnog-zuba", "lecenje-mlecnog-zuba", "bela-plomba"],
        patients: byKind(["child", "child", "adult"]),
      },
      "milos-jerkovic": {
        services: ["kontrola-aparata", "kontrola-aparata", "kontrola-aparata", "ortodontska-konsultacija", "retejner"],
        patients: byKind(["teen", "child"]),
      },
      "milos-milosevic": {
        services: ["uklanjanje-kamenca", "bela-plomba", "lecenje-kanala", "vadjenje-zuba", "cirkonijum-krunica", "metalokeramicka-krunica", "kamenac-peskiranje", "beljenje-u-ordinaciji"],
        patients: byKind(["adult"]),
      },
    };

    const allServices = await db.select().from(s.services);
    const svcBySlug = Object.fromEntries(allServices.map((x) => [x.slug, x]));
    const schedulesRows = await db.select().from(s.schedules);
    const now = t.nowInClinic();
    let created = 0;

    for (let offset = -42; offset <= 12; offset++) {
      const date = t.addDays(now.date, offset);
      const wd = t.weekdayOf(date);
      for (const [slug, cfg] of Object.entries(plan)) {
        const doctorId = doctorIds[slug];
        const sch = schedulesRows.find((r) => r.doctorId === doctorId && r.weekday === wd);
        if (!sch) continue;
        const isPast = offset < 0;
        const count = isPast ? 2 + Math.floor(rnd() * 3) : offset === 0 ? 2 : Math.floor(rnd() * 3);
        const taken: [number, number][] = [];
        for (let k = 0; k < count; k++) {
          const svc = svcBySlug[pick(cfg.services)];
          if (!svc) continue;
          // nasumičan početak poravnat na pola sata, bez preklapanja
          let start = -1;
          for (let tries = 0; tries < 12; tries++) {
            const slots = Math.floor((sch.endMin - sch.startMin - svc.durationMin) / 30);
            if (slots < 0) break;
            const candidate = sch.startMin + Math.floor(rnd() * (slots + 1)) * 30;
            if (!taken.some(([a, b]) => candidate < b && candidate + svc.durationMin > a)) {
              start = candidate;
              break;
            }
          }
          if (start < 0) continue;
          if (offset === 0 && start < now.minutes + 60) continue;
          taken.push([start, start + svc.durationMin]);
          const patient = pick(cfg.patients);
          let status = "confirmed";
          if (isPast) {
            const r = rnd();
            status = r < 0.86 ? "completed" : r < 0.93 ? "no_show" : "cancelled";
          }
          const [appt] = await db
            .insert(s.appointments)
            .values({
              token: randomBytes(18).toString("base64url"),
              patientId: patient.id,
              serviceId: svc.id,
              doctorId,
              date,
              startMin: start,
              endMin: start + svc.durationMin,
              status,
              mode: "instant",
              source: rnd() < 0.62 ? "online" : "phone",
              locale: "sr",
              cancelledBy: status === "cancelled" ? "patient" : null,
              reminderSentAt: isPast ? date : null,
              reviewRequestSentAt: status === "completed" ? date : null,
            })
            .returning({ id: s.appointments.id });
          created++;

          if (status === "completed") {
            const price = svc.priceType === "free" ? 0 : svc.priceFrom;
            if (price > 0) {
              const qty = svc.slug === "zalivanje-fisura" ? 2 : 1;
              const discount = rnd() < 0.12 ? 10 : 0;
              const total = Math.round(price * qty * (1 - discount / 100));
              await db.insert(s.treatments).values({
                patientId: patient.id,
                appointmentId: appt.id,
                doctorId,
                serviceId: svc.id,
                description: svc.nameSr,
                tooth: ["popravka-mlecnog-zuba", "bela-plomba", "lecenje-kanala", "vadjenje-zuba", "cirkonijum-krunica", "metalokeramicka-krunica"].includes(svc.slug)
                  ? pick(["16", "26", "36", "46", "11", "21", "55", "65", "75", "85"])
                  : null,
                quantity: qty,
                unitPrice: price,
                discountPct: discount,
                total,
                date,
              });
              const partial = total >= 15000 && rnd() < 0.6;
              const paid = partial ? Math.round(total / 2 / 1000) * 1000 : total;
              await db.insert(s.payments).values({
                patientId: patient.id,
                appointmentId: appt.id,
                doctorId,
                amount: paid,
                method: partial ? "rate" : pick(["gotovina", "gotovina", "kartica", "kartica", "prenos"]),
                date,
                note: partial ? "Prva rata" : null,
              });
            }
          }
        }
      }
    }

    // Dva zahteva "na upit" koji čekaju odgovor ordinacije
    const requests = [
      { svc: "fiksni-metalni-aparat", patient: byKind(["teen"])[0], doctor: "milos-jerkovic", note: "Zanima me cena i trajanje terapije." },
      { svc: "cirkonijum-krunica", patient: byKind(["adult"])[3], doctor: null, note: "Polomljen prednji zub." },
    ];
    for (const r of requests) {
      const svc = svcBySlug[r.svc];
      if (!svc || !r.patient) continue;
      await db.insert(s.appointments).values({
        token: randomBytes(18).toString("base64url"),
        patientId: r.patient.id,
        serviceId: svc.id,
        doctorId: r.doctor ? doctorIds[r.doctor] : null,
        status: "pending",
        mode: "request",
        source: "online",
        locale: "sr",
        patientNote: r.note,
        preferences: JSON.stringify({ dates: [t.addDays(now.date, 2), t.addDays(now.date, 3)], timeOfDay: "afternoon" }),
      });
      created++;
    }

    // Demo pacijenti imaju source = "demo"; brišu se zajedno sa terminima jednim klikom (Podešavanja)
    console.log(`✓ demo: ${patientIds.length} pacijenata, ${created} termina`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
