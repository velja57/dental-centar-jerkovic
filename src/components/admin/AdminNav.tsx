"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChartColumn, ExternalLink, Inbox, LayoutDashboard, ListChecks, LogOut, Mail, Settings, Users } from "lucide-react";
import { LogoMark } from "@/components/site/Logo";

const items = [
  { href: "/admin", label: "Pregled", icon: LayoutDashboard, exact: true },
  { href: "/admin/kalendar", label: "Kalendar", icon: CalendarDays },
  { href: "/admin/termini", label: "Termini", icon: ListChecks },
  { href: "/admin/termini?filter=pending", label: "Zahtevi", icon: Inbox, badge: true },
  { href: "/admin/pacijenti", label: "Pacijenti", icon: Users },
  { href: "/admin/izvestaji", label: "Izveštaji", icon: ChartColumn },
  { href: "/admin/poruke", label: "Poruke", icon: Mail },
  { href: "/admin/podesavanja", label: "Podešavanja", icon: Settings },
];

export function AdminNav({
  user,
  pendingCount,
  logout,
}: {
  user: { name: string; role: string; color: string; initials: string };
  pendingCount: number;
  logout: () => Promise<void>;
}) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => {
    const path = href.split("?")[0];
    if (href.includes("?")) return false;
    return exact ? pathname === path : pathname === path || pathname.startsWith(path + "/");
  };

  const links = items.map((it) => {
    const active = isActive(it.href, it.exact);
    const Icon = it.icon;
    return (
      <Link
        key={it.href}
        href={it.href}
        aria-current={active ? "page" : undefined}
        className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition ${
          active ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
        }`}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        <span>{it.label}</span>
        {it.badge && pendingCount > 0 && (
          <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${active ? "bg-white text-brand-700" : "bg-orange-100 text-orange-800"}`}>
            {pendingCount}
          </span>
        )}
      </Link>
    );
  });

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-slate-200 bg-white p-4 lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-2 py-1">
          <LogoMark className="h-9 w-9" />
          <span className="leading-tight">
            <span className="block text-[11px] font-semibold tracking-[0.16em] text-brand-600 uppercase">Dental Centar</span>
            <span className="block text-base font-extrabold text-ink">Ordinacija</span>
          </span>
        </Link>
        <nav aria-label="Admin navigacija" className="mt-6 flex flex-1 flex-col gap-1">
          {links}
        </nav>
        <a href="/" target="_blank" className="mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100">
          <ExternalLink className="h-4 w-4" /> Otvori sajt
        </a>
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: user.color }}>
            {user.initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-ink">{user.name}</span>
            <span className="block text-xs text-slate-500">{user.role === "admin" ? "Administrator" : "Doktor"}</span>
          </span>
          <form action={logout}>
            <button type="submit" className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-ink" title="Odjava" aria-label="Odjava">
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* Telefon / tablet */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-2.5">
          <Link href="/admin" className="flex items-center gap-2">
            <LogoMark className="h-8 w-8" />
            <span className="text-sm font-extrabold text-ink">Ordinacija</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600">{user.name}</span>
            <form action={logout}>
              <button type="submit" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Odjava">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
        <nav aria-label="Admin navigacija" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2.5">
          {links}
        </nav>
      </div>
    </>
  );
}
