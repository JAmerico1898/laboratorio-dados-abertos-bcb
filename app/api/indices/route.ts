import { NextRequest, NextResponse } from "next/server";
import {
  getLatestQuarter,
  buildInstitutionTable,
  extractVariable,
  extractVariableAnnualized,
  filterBySegments,
  applyMaterialityFilter,
} from "@/lib/data";
import { getLastNQuarters } from "@/lib/formatting";
import {
  RELATORIO_RESUMO,
  RELATORIO_ATIVO,
  RELATORIO_RESULTADO,
  INDICES,
} from "@/lib/constants";
import type { InstitutionRow } from "@/lib/types";

export const runtime = "nodejs";

/**
 * Compute financial indices.
 * Reads from multiple reports and computes derived ratios.
 *
 * Ported from pages/modulo_7_indices.py
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const indexKey = searchParams.get("index") ?? "basileia";
  const segmentsStr = searchParams.get("segments") ?? "S1,S2";
  const segments = segmentsStr.split(",").filter(Boolean);

  const indexDef = INDICES.find((i) => i.key === indexKey);
  if (!indexDef) {
    return NextResponse.json({ error: `Unknown index: ${indexKey}` }, { status: 400 });
  }

  const quarter = getLatestQuarter();
  const institutions = await buildInstitutionTable(quarter);
  if (institutions.length === 0) {
    return NextResponse.json(
      { institutions: [], median: 0, mean: 0, count: 0, index: indexKey },
      { headers: { "Cache-Control": "s-maxage=86400, stale-while-revalidate=86400" } }
    );
  }

  const quarters = getLastNQuarters(quarter, 4);

  // Helper to get a variable from a report
  const getVar = async (nomeColuna: string, relatorio: number) =>
    extractVariable(quarter, 1, relatorio, nomeColuna, institutions);

  const getVarAnnualized = async (nomeColuna: string, relatorio: number) =>
    extractVariableAnnualized(quarters, relatorio, nomeColuna, institutions);

  // Convert array of InstitutionRow to Map<CodInst, Saldo>
  const toMap = (rows: InstitutionRow[]) =>
    new Map(rows.map((r) => [r.CodInst, r.Saldo]));

  let result: { CodInst: number; NomeReduzido: string; Segmento: string; value: number }[] = [];

  // Compute the requested index
  switch (indexKey) {
    case "basileia": {
      const data = await getVar("Índice de Basileia", RELATORIO_RESUMO);
      const filtered = filterBySegments(
        await applyMaterialityFilter(data, quarter, institutions),
        segments
      );
      result = filtered.map((d) => ({
        CodInst: d.CodInst,
        NomeReduzido: d.NomeReduzido,
        Segmento: d.Segmento,
        value: d.Saldo,
      }));
      break;
    }

    case "credito_pct_ativos": {
      const credito = toMap(await getVar("Carteira de Crédito", RELATORIO_RESUMO));
      const ativo = toMap(await getVar("Ativo Total", RELATORIO_RESUMO));
      result = computeRatio(credito, ativo, institutions, segments, 100);
      break;
    }

    case "provisoes_pct_carteira": {
      // Provisões = Perda Esperada (e2) + Perda Esperada (g2) from Ativo report
      // Denominator = Operações de Crédito (e) + Outras Op. Crédito (g) from Ativo report
      const perdaE2 = toMap(await getVar("Perda Esperada \n(e2)", RELATORIO_ATIVO));
      const perdaG2 = toMap(await getVar("Perda Esperada \n(g2)", RELATORIO_ATIVO));
      const opCredE = toMap(await getVar("Operações de Crédito \n(e)", RELATORIO_ATIVO));
      const opCredG = toMap(
        await getVar(
          "Outras Operações com Características de Concessão de Crédito \n(g)",
          RELATORIO_ATIVO
        )
      );

      // Sum numerator and denominator per institution
      const instBase = await buildInstitutionTable(quarter);
      const instMap = new Map(instBase.map((i) => [i.CodInst, i]));
      result = [];
      for (const [codInst, inst] of instMap) {
        const num = Math.abs(perdaE2.get(codInst) ?? 0) + Math.abs(perdaG2.get(codInst) ?? 0);
        const den = Math.abs(opCredE.get(codInst) ?? 0) + Math.abs(opCredG.get(codInst) ?? 0);
        if (den === 0) continue;
        const value = (num / den) * 100;
        if (!isFinite(value)) continue;
        if (segments.length > 0 && !segments.includes(inst.Segmento)) continue;
        result.push({
          CodInst: codInst,
          NomeReduzido: inst.NomeReduzido,
          Segmento: inst.Segmento,
          value,
        });
      }
      break;
    }

    case "alavancagem": {
      const pl = toMap(await getVar("Patrimônio Líquido", RELATORIO_RESUMO));
      const ativo = toMap(await getVar("Ativo Total", RELATORIO_RESUMO));
      result = computeRatio(pl, ativo, institutions, segments, 100);
      break;
    }

    case "pl_ajustado": {
      const data = await getVar("Patrimônio Líquido", RELATORIO_RESUMO);
      const filtered = filterBySegments(
        await applyMaterialityFilter(data, quarter, institutions),
        segments
      );
      result = filtered.map((d) => ({
        CodInst: d.CodInst,
        NomeReduzido: d.NomeReduzido,
        Segmento: d.Segmento,
        value: d.Saldo,
      }));
      break;
    }

    case "resultado_intermediacao_pct": {
      const resultIntermed = toMap(
        await getVarAnnualized(
          "Resultado de Intermediação Financeira \n(c) = (a) + (b)",
          RELATORIO_RESULTADO
        )
      );
      const credito = toMap(await getVar("Carteira de Crédito", RELATORIO_RESUMO));
      result = computeRatio(resultIntermed, credito, institutions, segments, 100);
      break;
    }

    case "despesa_captacao_pct": {
      const despCaptacao = toMap(
        await getVarAnnualized("Despesas de Captação \n(b1)", RELATORIO_RESULTADO)
      );
      const captacoes = toMap(await getVar("Captações", RELATORIO_RESUMO));
      result = computeRatio(despCaptacao, captacoes, institutions, segments, 100);
      break;
    }

    case "roa": {
      const lucro = toMap(
        await getVarAnnualized(
          "Lucro Líquido \n(j) = (g) + (h) + (i)",
          RELATORIO_RESULTADO
        )
      );
      const ativo = toMap(await getVar("Ativo Total", RELATORIO_RESUMO));
      result = computeRatio(lucro, ativo, institutions, segments, 100);
      break;
    }

    case "eficiencia": {
      const despPessoal = toMap(
        await getVarAnnualized("Despesas de Pessoal \n(d3)", RELATORIO_RESULTADO)
      );
      const despAdmin = toMap(
        await getVarAnnualized("Despesas Administrativas \n(d4)", RELATORIO_RESULTADO)
      );
      const resultIntermed = toMap(
        await getVarAnnualized(
          "Resultado de Intermediação Financeira \n(c) = (a) + (b)",
          RELATORIO_RESULTADO
        )
      );
      const rendServicos = toMap(
        await getVarAnnualized(
          "Rendas de Prestação de Serviços \n(d1)",
          RELATORIO_RESULTADO
        )
      );
      const rendTarifas = toMap(
        await getVarAnnualized("Rendas de Tarifas Bancárias \n(d2)", RELATORIO_RESULTADO)
      );

      const instBase = await buildInstitutionTable(quarter);
      const instMap = new Map(instBase.map((i) => [i.CodInst, i]));

      result = [];
      for (const [codInst, inst] of instMap) {
        const numerator =
          Math.abs(despPessoal.get(codInst) ?? 0) +
          Math.abs(despAdmin.get(codInst) ?? 0);
        const denominator =
          Math.abs(resultIntermed.get(codInst) ?? 0) +
          Math.abs(rendServicos.get(codInst) ?? 0) +
          Math.abs(rendTarifas.get(codInst) ?? 0);

        if (denominator === 0) continue;
        const value = (numerator / denominator) * 100;
        if (!isFinite(value)) continue;

        if (segments.length > 0 && !segments.includes(inst.Segmento)) continue;

        result.push({
          CodInst: codInst,
          NomeReduzido: inst.NomeReduzido,
          Segmento: inst.Segmento,
          value,
        });
      }
      break;
    }
  }

  // Filter outliers (3σ beyond mean)
  if (result.length > 0) {
    const values = result.map((r) => r.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
    );
    const lower = mean - 3 * stdDev;
    const upper = mean + 3 * stdDev;
    result = result.filter((r) => r.value >= lower && r.value <= upper);
  }

  // Sort by value
  result.sort((a, b) =>
    indexDef.higherIsBetter ? b.value - a.value : a.value - b.value
  );

  // Compute stats
  const values = result.map((r) => r.value);
  const mean = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const sortedValues = [...values].sort((a, b) => a - b);
  const median =
    sortedValues.length > 0
      ? sortedValues.length % 2 === 0
        ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
        : sortedValues[Math.floor(sortedValues.length / 2)]
      : 0;

  return NextResponse.json(
    {
      institutions: result,
      median,
      mean,
      count: result.length,
      index: indexKey,
    },
    {
      headers: {
        "Cache-Control": "s-maxage=86400, stale-while-revalidate=86400",
      },
    }
  );
}

// Helper to compute numerator / denominator ratio
function computeRatio(
  numerator: Map<number, number>,
  denominator: Map<number, number>,
  institutions: { CodInst: number; NomeReduzido: string; Segmento: string }[],
  segments: string[],
  multiplier: number = 1
) {
  const instMap = new Map(institutions.map((i) => [i.CodInst, i]));
  const result: { CodInst: number; NomeReduzido: string; Segmento: string; value: number }[] = [];

  for (const [codInst, num] of numerator) {
    const den = denominator.get(codInst);
    if (!den || den === 0) continue;
    const value = (num / den) * multiplier;
    if (!isFinite(value)) continue;

    const inst = instMap.get(codInst);
    if (!inst) continue;
    if (segments.length > 0 && !segments.includes(inst.Segmento)) continue;

    result.push({
      CodInst: codInst,
      NomeReduzido: inst.NomeReduzido,
      Segmento: inst.Segmento,
      value,
    });
  }

  return result;
}
