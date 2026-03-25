import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

const DATA_DIR = join(process.cwd(), "data");

/**
 * Returns a specific bank's rate and rank across all modalities.
 * Reads from pre-computed taxas_latest.json (~49KB) — instant.
 *
 * GET /api/taxas/bank?name=BCO BANESTES S.A.
 */
export async function GET(request: NextRequest) {
  const bankName = request.nextUrl.searchParams.get("name");
  if (!bankName) {
    return NextResponse.json({ error: "name parameter required" }, { status: 400 });
  }

  const filePath = join(DATA_DIR, "taxas_latest.json");
  if (!existsSync(filePath)) {
    return NextResponse.json({ bank: bankName, modalities: [] });
  }

  const data = JSON.parse(readFileSync(filePath, "utf-8"));

  const results: {
    modName: string;
    rate: number;
    rank: number;
    total: number;
  }[] = [];

  for (const [, mod] of Object.entries(data.modalities) as [string, { name: string; total: number; entries: { bank: string; rateYear: number; rank: number }[] }][]) {
    const entry = mod.entries.find((e) => e.bank === bankName);
    if (!entry) continue;

    results.push({
      modName: mod.name,
      rate: entry.rateYear,
      rank: entry.rank,
      total: mod.total,
    });
  }

  return NextResponse.json(
    { bank: bankName, modalities: results },
    { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } }
  );
}
