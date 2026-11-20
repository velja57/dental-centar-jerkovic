import { notFound } from "next/navigation";

// Sve nepostojeće adrese prikazuju lepu 404 stranicu unutar sajta.
export default function CatchAll() {
  notFound();
}
