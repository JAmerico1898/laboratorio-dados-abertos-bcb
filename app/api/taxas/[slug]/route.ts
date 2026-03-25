import { NextRequest, NextResponse } from "next/server";
import { readTaxas } from "@/lib/data";
import { MODALITIES } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  // Find modality definition
  const modality = MODALITIES.find((m) => m.slug === slug);
  if (!modality) {
    return NextResponse.json({ error: `Unknown modality: ${slug}` }, { status: 400 });
  }

  const typeParam = request.nextUrl.searchParams.get("type");
  const type = typeParam === "monthly" ? "monthly" : modality.type;

  const rows = await readTaxas(slug, type);
  if (rows.length === 0) {
    return NextResponse.json(
      { rates: [], latestDate: "", modalityName: modality.name },
      { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } }
    );
  }

  // Find the latest date in the dataset
  const dates = rows
    .map((r) => String(r.data ?? r.Data ?? ""))
    .filter(Boolean)
    .sort();
  const latestDate = dates[dates.length - 1] ?? "";

  return NextResponse.json(
    {
      rates: rows,
      latestDate,
      modalityName: modality.name,
    },
    {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
