import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

const DATA_DIR = join(process.cwd(), "data");

interface ModEntry {
  bank: string;
  rateYear: number;
  rateMonth: number;
  rank: number;
}

interface ModData {
  name: string;
  latestDate: string;
  total: number;
  excludeFromRanking: boolean;
  entries: ModEntry[];
}

/**
 * Batch rankings endpoint.
 * Reads from pre-computed taxas_latest.json — instant response.
 */
export async function GET() {
  const filePath = join(DATA_DIR, "taxas_latest.json");
  if (!existsSync(filePath)) {
    return NextResponse.json({ modalities: {} });
  }

  const data = JSON.parse(readFileSync(filePath, "utf-8"));

  const modalities: Record<
    string,
    {
      name: string;
      top10: { InstituicaoFinanceira: string; TaxaJurosAoAno: number }[];
      bottom10: { InstituicaoFinanceira: string; TaxaJurosAoAno: number }[];
      latestDate: string;
    }
  > = {};

  for (const [slug, mod] of Object.entries(data.modalities) as [string, ModData][]) {
    if (mod.excludeFromRanking) continue;

    // entries are already sorted ascending by rate (rank 1 = lowest)
    const top10 = mod.entries.slice(0, 10).map((e) => ({
      InstituicaoFinanceira: e.bank,
      TaxaJurosAoAno: e.rateYear,
    }));

    const bottom10 = mod.entries
      .slice(-10)
      .reverse()
      .map((e) => ({
        InstituicaoFinanceira: e.bank,
        TaxaJurosAoAno: e.rateYear,
      }));

    modalities[slug] = {
      name: mod.name,
      top10,
      bottom10,
      latestDate: mod.latestDate,
    };
  }

  return NextResponse.json(
    { modalities },
    {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
