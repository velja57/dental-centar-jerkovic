import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/forms";
import { Logo } from "@/components/site/Logo";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Prijava" };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-brand-50 via-white to-coral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-soft">
          <h1 className="text-xl font-extrabold text-ink">Prijava za osoblje</h1>
          <p className="mt-1 mb-6 text-sm text-slate-500">Termini, pacijenti, uplate i izveštaji.</p>
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/" className="font-semibold text-brand-700 hover:text-brand-800">
            ← Nazad na sajt
          </Link>
        </p>
      </div>
    </div>
  );
}
