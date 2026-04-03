import { NextRequest, NextResponse } from "next/server";
import {
  getLatestQuarter,
  buildInstitutionTable,
  extractVariable,
  extractVariableAnnualized,
  extractCreditVariable,
  applyMaterialityFilter,
  filterBySegments,
  computeSummary,
} from "@/lib/data";
import { getLastNQuarters } from "@/lib/formatting";
import {
  VAR_KEY_MAP,
  MODULO3_VARS,
  MODULO4_VARS,
  MODULO6_VARS,
  RELATORIO_CREDITO_PF,
  RELATORIO_CREDITO_PJ,
  RELATORIO_CREDITO_GEO,
} from "@/lib/constants";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { report: string } }
) {
  const report = parseInt(params.report, 10);
  if (isNaN(report)) {
    return NextResponse.json({ error: "Invalid report" }, { status: 400 });
  }

  const searchParams = request.nextUrl.searchParams;
  const variableKey = searchParams.get("variable") ?? "";
  const segmentsStr = searchParams.get("segments") ?? "S1,S2";
  const annualized = searchParams.get("annualized") === "true";
  const segments = segmentsStr.split(",").filter(Boolean);

  const quarter = getLatestQuarter();
  const institutions = await buildInstitutionTable(quarter);
  if (institutions.length === 0) {
    return NextResponse.json(
      { institutions: [], total: 0, count: 0, top5Share: 0, quarter, variable: variableKey },
      { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } }
    );
  }

  let data;

  // Credit reports use a different extraction pattern
  // Note: prefetched files use tipo=1 (all types bundled)
  if (report === RELATORIO_CREDITO_PF) {
    const varDef = MODULO3_VARS.find((v) => v.key === variableKey);
    if (!varDef) {
      return NextResponse.json({ error: `Unknown variable: ${variableKey}` }, { status: 400 });
    }
    data = await extractCreditVariable(quarter, 1, report, varDef.grupo, institutions);
  } else if (report === RELATORIO_CREDITO_PJ) {
    const varDef = MODULO4_VARS.find((v) => v.key === variableKey);
    if (!varDef) {
      return NextResponse.json({ error: `Unknown variable: ${variableKey}` }, { status: 400 });
    }
    data = await extractCreditVariable(quarter, 1, report, varDef.grupo, institutions);
  } else if (report === RELATORIO_CREDITO_GEO) {
    const varDef = MODULO6_VARS.find((v) => v.key === variableKey);
    if (!varDef) {
      return NextResponse.json({ error: `Unknown variable: ${variableKey}` }, { status: 400 });
    }
    data = await extractVariable(quarter, 1, report, varDef.nomeColuna, institutions);
  } else {
    // Standard reports (1, 2, 3, 4)
    const nomeColuna = VAR_KEY_MAP[variableKey];
    if (!nomeColuna) {
      return NextResponse.json({ error: `Unknown variable: ${variableKey}` }, { status: 400 });
    }

    if (annualized) {
      const quarters = getLastNQuarters(quarter, 4);
      data = await extractVariableAnnualized(quarters, report, nomeColuna, institutions);
    } else {
      data = await extractVariable(quarter, 1, report, nomeColuna, institutions);
    }
  }

  // Apply materiality filter
  data = await applyMaterialityFilter(data, quarter, institutions);

  // Compute system-wide total (all segments) before filtering
  const { total: systemTotal } = computeSummary(data);

  // Now filter by selected segments
  data = filterBySegments(data, segments);

  // Sort by absolute value descending
  data.sort((a, b) => Math.abs(b.Saldo) - Math.abs(a.Saldo));

  const { total, count, top5Share } = computeSummary(data);

  return NextResponse.json(
    {
      institutions: data,
      total,
      systemTotal,
      count,
      top5Share,
      quarter,
      variable: variableKey,
    },
    {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
