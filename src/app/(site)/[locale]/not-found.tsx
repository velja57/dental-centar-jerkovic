import Link from "next/link";
import { DentalIcon } from "@/components/site/DentalIcon";

// Napomena: not-found ne dobija params; prikazujemo dvojezičnu poruku.
export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <DentalIcon name="tooth" className="h-9 w-9" />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold text-ink sm:text-4xl">Stranica nije pronađena</h1>
      <p className="mt-2 text-slate-500">Page not found</p>
      <p className="lead mt-4 max-w-md">Možda je link zastareo. Vratite se na početnu ili zakažite termin.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-outline">
          Na početnu
        </Link>
        <Link href="/zakazivanje" className="btn btn-primary">
          Zakaži termin
        </Link>
        <Link href="/en" className="btn btn-ghost">
          English
        </Link>
      </div>
    </section>
  );
}
