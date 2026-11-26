"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { switchLocalePath, type Locale } from "@/lib/i18n";
import { WhatsAppIcon } from "./BrandIcons";

type NavItem = { href: string; label: string };

function isActive(pathname: string, href: string, homeHref: string) {
  if (href === homeHref) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function NavLinks({ items, homeHref, label }: { items: NavItem[]; homeHref: string; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="hidden items-center gap-1 lg:flex">
      {items.map((item) => {
        const active = isActive(pathname, item.href, homeHref);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3.5 py-2 text-[15px] font-semibold transition ${
              active ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-50 hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function LangSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  // Prelazak na drugi jezik zadržava izbor iz adrese (npr. ?usluga=… na zakazivanju). Čita se posle
  // učitavanja, da serverski i klijentski HTML budu isti.
  const [search, setSearch] = useState("");
  useEffect(() => setSearch(window.location.search), [pathname]);
  return (
    <div role="group" aria-label={label} className="flex items-center rounded-full border border-slate-200 bg-white p-0.5 text-xs font-bold">
      {(["sr", "en"] as const).map((l) => (
        <Link
          key={l}
          href={switchLocalePath(pathname, l) + search}
          hrefLang={l}
          aria-current={l === locale ? "true" : undefined}
          className={`rounded-full px-2.5 py-1 uppercase transition ${l === locale ? "bg-brand-600 text-white" : "text-slate-500 hover:text-ink"}`}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}

export function MobileNav({
  items,
  homeHref,
  bookHref,
  labels,
  phone,
  telHref,
  waHref,
}: {
  items: NavItem[];
  homeHref: string;
  bookHref: string;
  labels: { menu: string; close: string; book: string; call: string; whatsapp: string };
  phone: string;
  telHref: string;
  waHref: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-ink"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">{open ? labels.close : labels.menu}</span>
      </button>
      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-[68px] bottom-0 z-40 overflow-y-auto bg-white px-4 pt-4 pb-10 animate-fade-up">
          <nav className="flex flex-col gap-1" aria-label={labels.menu}>
            {items.map((item) => {
              const active = isActive(pathname, item.href, homeHref);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-2xl px-4 py-3.5 text-lg font-bold ${active ? "bg-brand-50 text-brand-800" : "text-ink hover:bg-slate-50"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 grid gap-3">
            <Link href={bookHref} className="btn btn-primary btn-lg w-full">
              {labels.book}
            </Link>
            <a href={telHref} className="btn btn-outline btn-lg w-full">
              <Phone className="h-5 w-5" /> {phone}
            </a>
            <a href={waHref} target="_blank" rel="noopener" className="btn btn-lg w-full bg-[#25D366]/10 text-[#128C4B] hover:bg-[#25D366]/20">
              <WhatsAppIcon /> {labels.whatsapp}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
