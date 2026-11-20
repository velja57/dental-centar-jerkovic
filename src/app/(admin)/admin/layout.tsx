import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../../globals.css";
import { jakarta } from "../../fonts";

export const metadata: Metadata = {
  title: { default: "Admin | Dental Centar Jerković", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sr-Latn" className={jakarta.variable}>
      <body className="min-h-screen bg-slate-50 font-sans text-ink">{children}</body>
    </html>
  );
}
