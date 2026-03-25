import { NextResponse } from "next/server";
import { getLatestQuarter, getManifest, getDataFileCount } from "@/lib/data";

export const runtime = "nodejs";

export async function GET() {
  const latestQuarter = getLatestQuarter();
  const manifest = getManifest();
  const dataFileCount = getDataFileCount();

  const status = latestQuarter > 200000 && dataFileCount > 0 ? "ok" : "degraded";

  return NextResponse.json({
    status,
    latestQuarter,
    dataFileCount,
    buildTime: manifest?.generated_at ?? "",
  });
}
