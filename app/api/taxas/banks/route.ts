import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

const DATA_DIR = join(process.cwd(), "data");

export async function GET() {
  const filePath = join(DATA_DIR, "taxas_latest.json");
  if (!existsSync(filePath)) {
    return NextResponse.json({ banks: [] }, { status: 200 });
  }

  const data = JSON.parse(readFileSync(filePath, "utf-8"));

  return NextResponse.json(
    { banks: data.banks ?? [] },
    { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } }
  );
}
