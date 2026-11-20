import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-extrabold text-ink">Stranica nije pronađena</h1>
      <Link href="/admin" className="btn btn-brand">
        Nazad na pregled
      </Link>
    </div>
  );
}
