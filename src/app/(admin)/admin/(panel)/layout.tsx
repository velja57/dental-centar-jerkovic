import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { logoutAction } from "@/lib/admin-actions";
import { pendingCount } from "@/lib/admin-data";
import { requireSession } from "@/lib/auth";
import { initials } from "@/lib/format";
import { doctorTitle } from "@/lib/site";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const s = await requireSession();
  const pending = await pendingCount(s);
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <AdminNav
        user={{ name: doctorTitle(s.name, "sr"), role: s.role, color: s.color, initials: initials(s.name) }}
        pendingCount={pending}
        logout={logoutAction}
      />
      <div className="min-w-0">
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
