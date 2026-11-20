import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Lokalno: SQLite fajl. Na Vercelu: Turso (integracija postavlja TURSO_DATABASE_URL i TURSO_AUTH_TOKEN).
const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "file:./data/dental.db";
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined;

if (url.startsWith("file:")) {
  try {
    mkdirSync(dirname(url.slice("file:".length)), { recursive: true });
  } catch {
    // folder već postoji
  }
}

const globalForDb = globalThis as unknown as { __dcjDb?: Client };

const client =
  globalForDb.__dcjDb ??
  createClient({
    url,
    authToken,
  });

if (!globalForDb.__dcjDb) {
  globalForDb.__dcjDb = client;
  if (url.startsWith("file:")) {
    // Bolje ponašanje kad više zahteva istovremeno piše u lokalni SQLite fajl
    client.execute("PRAGMA busy_timeout = 5000").catch(() => {});
  }
}

export const db = drizzle({ client, schema });
export { schema };
