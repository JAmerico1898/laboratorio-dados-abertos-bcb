import { NextRequest, NextResponse } from "next/server";
import { readTaxas } from "@/lib/data";
import { MODALITIES } from "@/lib/constants";

export const runtime = "nodejs";

/** Normalize a date value (Date object, string, or number) to ISO date string YYYY-MM-DD */
function toISODate(val: unknown): string {
  if (!val) return "";
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  const s = String(val);
  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // Try parsing as date
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return s;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

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

  // Normalize date columns to YYYY-MM-DD strings
  const dateCol = type === "monthly" ? "Mes" : "InicioPeriodo";
  const normalizedRows = rows.map((r) => ({
    ...r,
    _date: toISODate(r[dateCol]),
  }));

  // Find latest date
  const dates = [...new Set(normalizedRows.map((r) => r._date).filter(Boolean))].sort();
  const latestDate = dates[dates.length - 1] ?? "";

  // Return rows with normalized _date field for client-side filtering
  return NextResponse.json(
    {
      rates: normalizedRows,
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
