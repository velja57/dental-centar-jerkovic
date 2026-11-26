import { NextResponse } from "next/server";
import { getNextAvailable } from "@/lib/availability";

export const dynamic = "force-dynamic";

// GET /api/next-slot — prvi slobodan termin za besplatan prvi pregled (kartica na početnoj).
// Početna strana je keširana, pa je kartica posle mirovanja sajta mogla da prikaže stari termin;
// pregledač zato odmah traži svež podatak odavde. CDN ga čuva najviše 30 sekundi.
export async function GET() {
  const next = await getNextAvailable("prvi-pregled");
  return NextResponse.json(next, { headers: { "Cache-Control": "public, max-age=0, s-maxage=30" } });
}
