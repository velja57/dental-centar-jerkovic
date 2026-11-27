// Slika za pregled linka (Viber, WhatsApp, Facebook): logotip, naziv, adresa i telefon → public/og-sr.png i og-en.png.
// Pokrenuti ponovo (node scripts/og-slika.cjs) ako se promene broj telefona ili adresa.
const { createRequire } = require("node:module");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const sharp = createRequire(root + "/package.json")("sharp");

const icon = fs.readFileSync(path.join(root, "src/app/icon.svg"), "utf8");
const inner = icon.match(/<path[\s\S]*<\/svg>/)[0].replace("</svg>", "");

const T = {
  sr: {
    sub: "Stomatološka ordinacija u Batajnici",
    team: "Dečji stomatolog  ·  Ortodont  ·  Protetičar",
    pill: "Online zakazivanje",
  },
  en: {
    sub: "Dental clinic in Batajnica, Belgrade",
    team: "Children's dentist  ·  Orthodontist  ·  Prosthodontist",
    pill: "Book online",
  },
};

const font = "Segoe UI, Arial, sans-serif";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function svg(loc) {
  const t = T[loc];
  const pillW = t.pill.length * 12.5 + 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3fb5a9"/><stop offset="1" stop-color="#17625d"/></linearGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4faf8"/><stop offset="1" stop-color="#e3f1ee"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="12" fill="#187a73"/>
  <g transform="translate(528 40) scale(3)">
    <rect width="48" height="48" rx="14" fill="url(#g)"/>
    ${inner}
  </g>
  <text x="600" y="278" text-anchor="middle" font-family="${font}" font-weight="700" font-size="76" fill="#10292a">Dental Centar Jerković</text>
  <text x="600" y="340" text-anchor="middle" font-family="${font}" font-size="38" fill="#475569">${esc(t.sub)}</text>
  <text x="600" y="404" text-anchor="middle" font-family="${font}" font-weight="600" font-size="29" fill="#187a73">${esc(t.team)}</text>
  <line x1="300" y1="448" x2="900" y2="448" stroke="#c8e2dd" stroke-width="2"/>
  <text x="600" y="510" text-anchor="middle" font-family="${font}" font-weight="700" font-size="34" fill="#10292a">Stevana Dubajića 53  ·  065 300 70 56</text>
  <rect x="${600 - pillW / 2}" y="540" width="${pillW}" height="44" rx="22" fill="#d63f1a"/>
  <text x="600" y="570" text-anchor="middle" font-family="${font}" font-weight="700" font-size="22" fill="#ffffff">${esc(t.pill)}</text>
</svg>`;
}

(async () => {
  for (const loc of ["sr", "en"]) {
    const out = path.join(root, `public/og-${loc}.png`);
    await sharp(Buffer.from(svg(loc))).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(out);
    console.log(out, fs.statSync(out).size);
  }
})();
