// Objava sajta na Vercel — pokretanje: npm run objava
// Svaki korak se preskače ako je već urađen, pa je skriptu bezbedno pokrenuti ponovo.
import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const run = (cmd, opts = {}) => execSync(cmd, { stdio: "inherit", ...opts });
const out = (cmd) => execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const step = (n, text) => console.log(`\n\x1b[36m=== ${n}/6 ${text} ===\x1b[0m`);

function parseEnv(text) {
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
  }
  return env;
}

step(1, "Vercel nalog");
console.log("Prijavljeni ste kao:", out("vercel whoami").trim());

step(2, "Baza podataka (Turso, besplatan paket)");
if (/TURSO_DATABASE_URL/.test(out("vercel env ls production"))) {
  console.log("Baza je već povezana sa projektom.");
} else {
  console.log("Ako vas pita za plan, izaberite besplatni (Free / Starter).");
  run("vercel integration add tursocloud/database --name dental-centar-db -e production -e preview --no-env-pull");
}

step(3, "Tajni ključevi za produkciju");
const existing = out("vercel env ls production");
const addEnv = (name, value, sensitive) => {
  if (new RegExp(`\\b${name}\\b`).test(existing)) return console.log(`${name}: već postoji`);
  execSync(`vercel env add ${name} production${sensitive ? " --sensitive" : ""}`, { input: value, stdio: ["pipe", "inherit", "inherit"] });
};
addEnv("AUTH_SECRET", randomBytes(32).toString("hex"), true);
addEnv("CRON_SECRET", randomBytes(24).toString("hex"), true);
addEnv("CLINIC_NOTIFY_EMAIL", "marsenic57@gmail.com", false);

step(4, "Tabele u bazi");
const tmp = ".env.vercel-production.tmp";
run(`vercel env pull ${tmp} --environment=production --yes`);
const prod = parseEnv(readFileSync(tmp, "utf8"));
rmSync(tmp, { force: true });
if (!prod.TURSO_DATABASE_URL) {
  console.error("\nNe vidim TURSO_DATABASE_URL. Proverite na vercel.com da je baza povezana sa projektom (Storage).");
  process.exit(1);
}
const dbEnv = { ...process.env, DATABASE_URL: prod.TURSO_DATABASE_URL, DATABASE_AUTH_TOKEN: prod.TURSO_AUTH_TOKEN ?? "" };
run("npx drizzle-kit push", { env: dbEnv });

step(5, "Doktori, usluge, rasporedi i praznici (bez demo pacijenata)");
const secretsFile = ".env.production.local";
let password = existsSync(secretsFile) ? parseEnv(readFileSync(secretsFile, "utf8")).ADMIN_PASSWORD : undefined;
if (!password) {
  password = randomBytes(9).toString("base64url");
  writeFileSync(
    secretsFile,
    `# Početna lozinka za admin naloge na objavljenom sajtu (jerkovic, jovana, milosevic).\n# Promenite je posle prve prijave: Podešavanja → Moj nalog. Ovaj fajl se ne objavljuje.\nADMIN_PASSWORD=${password}\n`,
  );
}
run("npx tsx src/db/seed.ts --no-demo", { env: { ...dbEnv, SEED_PASSWORD: password } });

step(6, "Objava");
run("vercel deploy --prod --yes");
console.log(`\n\x1b[32mGotovo!\x1b[0m Adresa sajta je ispisana iznad (…vercel.app).`);
console.log(`Admin: <adresa>/admin — korisnici jerkovic, jovana, milosevic; lozinka je u fajlu ${secretsFile}.`);
