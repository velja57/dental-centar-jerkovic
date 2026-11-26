"use client";

import { clinic, telLink } from "@/content/clinic";

// Poslednja linija odbrane: greška u samom osnovnom rasporedu stranice (layout). Tada ne važe stilovi
// sajta, pa je sve jednostavno i u samoj stranici. Glavno je da pacijent vidi telefon.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="sr-Latn">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", background: "#f6faf9", color: "#10292a" }}>
        <title>{clinic.name}</title>
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
          <p style={{ fontWeight: 700, color: "#187a73", margin: 0 }}>{clinic.name}</p>
          <h1 style={{ fontSize: 28, margin: "16px 0 8px" }}>Stranica trenutno ne može da se učita</h1>
          <p style={{ color: "#475569", margin: 0 }}>This page can&apos;t be loaded right now.</p>
          <p style={{ color: "#334155", lineHeight: 1.6 }}>Pokušajte ponovo za trenutak ili nas pozovite. / Please try again or give us a call.</p>
          <p style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{ padding: "12px 22px", borderRadius: 999, border: "1px solid #187a73", background: "#fff", color: "#187a73", fontWeight: 700, cursor: "pointer" }}
            >
              Pokušaj ponovo / Try again
            </button>
            <a href={telLink} style={{ padding: "12px 22px", borderRadius: 999, background: "#d63f1a", color: "#fff", fontWeight: 700, textDecoration: "none" }}>
              {clinic.phoneDisplay}
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
