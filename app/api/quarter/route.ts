import { NextResponse } from "next/server";
import { getLatestQuarter } from "@/lib/data";
import { formatAnomes, formatDrePeriod } from "@/lib/formatting";

export const runtime = "nodejs";

export async function GET() {
  const quarter = getLatestQuarter();
  return NextResponse.json(
    {
      quarter,
      label: formatAnomes(quarter),
      period: formatDrePeriod(quarter),
    },
    {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
