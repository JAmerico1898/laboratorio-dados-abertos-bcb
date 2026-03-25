import { NextResponse } from "next/server";
import { readTaxas } from "@/lib/data";
import { MODALITIES } from "@/lib/constants";

export const runtime = "nodejs";

/**
 * Batch rankings endpoint.
 * Returns top 10 and bottom 10 institutions for all non-excluded modalities
 * based on the latest date in each dataset.
 *
 * This avoids N parallel client requests on the Rankings tab.
 */
export async function GET() {
  const rankingModalities = MODALITIES.filter((m) => !m.excludeFromRanking);

  const modalities: Record<
    string,
    {
      name: string;
      top10: Record<string, unknown>[];
      bottom10: Record<string, unknown>[];
      latestDate: string;
    }
  > = {};

  for (const mod of rankingModalities) {
    const rows = await readTaxas(mod.slug, mod.type);
    if (rows.length === 0) {
      modalities[mod.slug] = {
        name: mod.name,
        top10: [],
        bottom10: [],
        latestDate: "",
      };
      continue;
    }

    // Find the latest date
    const dates = rows
      .map((r) => String(r.data ?? r.Data ?? ""))
      .filter(Boolean)
      .sort();
    const latestDate = dates[dates.length - 1] ?? "";

    // Filter to latest date only
    const latestRows = rows.filter(
      (r) => String(r.data ?? r.Data ?? "") === latestDate
    );

    // Sort by annual rate (ascending = lowest rates first)
    const rateKey = "TaxaJurosAoAno";
    const sorted = latestRows
      .filter((r) => r[rateKey] != null && Number(r[rateKey]) > 0)
      .sort((a, b) => Number(a[rateKey]) - Number(b[rateKey]));

    modalities[mod.slug] = {
      name: mod.name,
      top10: sorted.slice(0, 10), // lowest rates (best for consumer)
      bottom10: sorted.slice(-10).reverse(), // highest rates
      latestDate,
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
