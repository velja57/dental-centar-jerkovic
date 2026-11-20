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

function createToken(doctorId: number) {
  const payload = Buffer.from(JSON.stringify({ d: doctorId, e: Math.floor(Date.now() / 1000) + MAX_AGE })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined): number | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { d: number; e: number };
    if (!data.d || data.e < Date.now() / 1000) return null;
    return data.d;
  } catch {
    return null;
  }
}

export async function startSession(doctorId: number) {
  (await cookies()).set(COOKIE, createToken(doctorId), {
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
  const id = readToken((await cookies()).get(COOKIE)?.value);
  if (!id) return null;
  const [d] = await db.select().from(doctors).where(eq(doctors.id, id));
  if (!d || !d.active) return null;
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
