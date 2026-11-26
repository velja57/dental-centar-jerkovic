import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { doctors } from "@/db/schema";

const COOKIE = "dcj_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dana

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET nije podešen u .env.local");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/**
 * „Otisak“ trenutne lozinke u kolačiću prijave. Kada se lozinka promeni, otisak se menja, pa sve
 * ranije prijave (drugi telefon, računar u ordinaciji, izgubljen uređaj) prestaju da važe.
 * Sama lozinka (ni njen hash) nikad ne izlazi iz servera: otisak je HMAC tajnim ključem.
 */
function passwordStamp(passwordHash: string) {
  return createHmac("sha256", secret()).update(`pw:${passwordHash}`).digest("base64url").slice(0, 16);
}

function createToken(doctorId: number, passwordHash: string) {
  const payload = Buffer.from(
    JSON.stringify({ d: doctorId, e: Math.floor(Date.now() / 1000) + MAX_AGE, v: passwordStamp(passwordHash) }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined): { doctorId: number; stamp: string } | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { d: number; e: number; v?: string };
    if (!data.d || !data.v || data.e < Date.now() / 1000) return null;
    return { doctorId: data.d, stamp: data.v };
  } catch {
    return null;
  }
}

export async function startSession(doctorId: number, passwordHash: string) {
  (await cookies()).set(COOKIE, createToken(doctorId, passwordHash), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export type Session = { id: number; name: string; slug: string; role: "admin" | "doctor"; color: string; username: string };

export const getSession = cache(async (): Promise<Session | null> => {
  const token = readToken((await cookies()).get(COOKIE)?.value);
  if (!token) return null;
  const [d] = await db.select().from(doctors).where(eq(doctors.id, token.doctorId));
  if (!d || !d.active) return null;
  // Lozinka je promenjena posle ove prijave: prijava više ne važi
  const a = Buffer.from(token.stamp);
  const b = Buffer.from(passwordStamp(d.passwordHash));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return { id: d.id, name: d.name, slug: d.slug, role: d.role === "admin" ? "admin" : "doctor", color: d.color, username: d.username };
});

export async function requireSession() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}

export async function requireAdmin() {
  const s = await requireSession();
  if (s.role !== "admin") redirect("/admin");
  return s;
}
