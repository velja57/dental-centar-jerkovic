import { NextResponse, type NextRequest } from "next/server";
import { runDailyJobs } from "@/lib/daily-jobs";

export const dynamic = "force-dynamic";

// Vercel Cron šalje "Authorization: Bearer <CRON_SECRET>" (vidi vercel.json)
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await runDailyJobs();
  return NextResponse.json({ ok: true, ...result });
}
