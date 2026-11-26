import type { MetadataRoute } from "next";
import { clinic } from "@/content/clinic";

// Kada pacijent doda sajt na početni ekran telefona (Android: „Dodaj na početni ekran“), dobija pravu
// ikonicu i naziv ordinacije, a sajt se otvara kao aplikacija. Ikonice su napravljene iz logotipa.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: clinic.name,
    short_name: "Dental Jerković",
    description: "Stomatološka ordinacija u Batajnici: online zakazivanje, cene i kontakt.",
    lang: "sr-Latn",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#187a73",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
