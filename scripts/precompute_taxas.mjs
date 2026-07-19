/**
 * Pre-compute taxas data for fast API responses.
 * Reads all taxas Parquet files, extracts latest-date rows,
 * and writes a small JSON file partitioned by segment (PF / PJ),
 * each with its own banks list + rates + ranks.
 *
 * Run: node scripts/precompute_taxas.mjs
 * Output: data/taxas_latest.json
 *   { generated_at, pf: { banks[], modalities{} }, pj: { banks[], modalities{} } }
 *
 * Should be run after prefetch_data.py updates the Parquet files.
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

// Modality definitions (must match lib/constants.ts MODALITIES).
// Modalities that exist in both segments (Cheque Especial, Desconto de Cheques)
// appear twice, once per segment; the Segmento column splits the rows.
const MODALITIES = [
  // Pessoa Física — diárias
  { slug: "cheque_especial_prefixado", name: "Cheque Especial", type: "daily", segmento: "pf" },
  { slug: "cartao_de_credito_rotativo_total_prefixado", name: "Cartão de Crédito Rotativo", type: "daily", segmento: "pf" },
  { slug: "cartao_de_credito_parcelado_prefixado", name: "Cartão de Crédito Parcelado", type: "daily", segmento: "pf" },
  { slug: "credito_pessoal_nao_consignado_prefixado", name: "Crédito Pessoal Não-Consignado", type: "daily", segmento: "pf" },
  { slug: "credito_pessoal_consignado_publico_prefixado", name: "Consignado Público", type: "daily", segmento: "pf" },
  { slug: "credito_pessoal_consignado_privado_prefixado", name: "Consignado Privado", type: "daily", segmento: "pf" },
  { slug: "credito_pessoal_consignado_inss_prefixado", name: "Consignado INSS", type: "daily", segmento: "pf" },
  { slug: "aquisicao_de_veiculos_prefixado", name: "Aquisição de Veículos", type: "daily", segmento: "pf" },
  { slug: "aquisicao_de_outros_bens_prefixado", name: "Aquisição de Outros Bens", type: "daily", segmento: "pf" },
  { slug: "arrendamento_mercantil_de_veiculos_prefixado", name: "Arrendamento Mercantil de Veículos", type: "daily", segmento: "pf" },
  { slug: "desconto_de_cheques_prefixado", name: "Desconto de Cheques", type: "daily", segmento: "pf" },
  // Pessoa Física — imobiliário (mensal)
  { slug: "financiamento_imobiliario_com_taxas_de_mercado_prefixado", name: "Imobiliário Mercado – Pré", type: "monthly", segmento: "pf" },
  { slug: "financiamento_imobiliario_com_taxas_de_mercado_pos_fixado_referenciado_em_ipca", name: "Imobiliário Mercado – IPCA", type: "monthly", segmento: "pf" },
  { slug: "financiamento_imobiliario_com_taxas_de_mercado_pos_fixado_referenciado_em_tr", name: "Imobiliário Mercado – TR", type: "monthly", segmento: "pf" },
  { slug: "financiamento_imobiliario_com_taxas_reguladas_prefixado", name: "Imobiliário Regulado – Pré", type: "monthly", segmento: "pf" },
  { slug: "financiamento_imobiliario_com_taxas_reguladas_pos_fixado_referenciado_em_ipca", name: "Imobiliário Regulado – IPCA", type: "monthly", segmento: "pf" },
  { slug: "financiamento_imobiliario_com_taxas_reguladas_pos_fixado_referenciado_em_tr", name: "Imobiliário Regulado – TR", type: "monthly", segmento: "pf" },
  // Pessoa Jurídica — diárias
  { slug: "cheque_especial_prefixado", name: "Cheque Especial", type: "daily", segmento: "pj" },
  { slug: "conta_garantida_prefixado", name: "Conta Garantida (Pré)", type: "daily", segmento: "pj" },
  { slug: "conta_garantida_pos_fixado_referenciado_em_juros_flutuantes", name: "Conta Garantida (Pós)", type: "daily", segmento: "pj" },
  { slug: "capital_de_giro_com_prazo_ate_365_dias_prefixado", name: "Cap. Giro ≤365d (Pré)", type: "daily", segmento: "pj" },
  { slug: "capital_de_giro_com_prazo_ate_365_dias_pos_fixado_referenciado_em_juros_flutuant", name: "Cap. Giro ≤365d (Pós)", type: "daily", segmento: "pj" },
  { slug: "capital_de_giro_com_prazo_superior_a_365_dias_prefixado", name: "Cap. Giro >365d (Pré)", type: "daily", segmento: "pj" },
  { slug: "capital_de_giro_com_prazo_superior_a_365_dias_pos_fixado_referenciado_em_juros_f", name: "Cap. Giro >365d (Pós)", type: "daily", segmento: "pj" },
  { slug: "desconto_de_duplicatas_prefixado", name: "Desconto de Duplicatas", type: "daily", segmento: "pj" },
  { slug: "desconto_de_cheques_prefixado", name: "Desconto de Cheques", type: "daily", segmento: "pj" },
  { slug: "antecipacao_de_faturas_de_cartao_de_credito_prefixado", name: "Antecipação de Faturas de Cartão", type: "daily", segmento: "pj" },
  { slug: "vendor_prefixado", name: "Vendor", type: "daily", segmento: "pj" },
  { slug: "adiantamento_sobre_contratos_de_cambio_acc_pos_fixado_referenciado_em_moeda_estr", name: "ACC (moeda estrangeira)", type: "daily", segmento: "pj" },
];

function toISODate(val) {
  if (!val) return "";
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  const s = String(val);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return s;
}

/** Map a Segmento string to our segment key. Only PF/PJ exist. */
function segOf(val) {
  return /JUR/i.test(String(val ?? "")) ? "pj" : "pf";
}

async function readParquet(filename) {
  const filePath = join(DATA_DIR, filename);
  try {
    const { parquetReadObjects } = await import("hyparquet");
    const buffer = readFileSync(filePath);
    const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    const file = { byteLength: ab.byteLength, slice: (s, e) => ab.slice(s, e) };
    const rows = await parquetReadObjects({ file });
    return rows.map((row) => {
      const out = {};
      for (const [k, v] of Object.entries(row)) {
        out[k] = typeof v === "bigint" ? Number(v) : v;
      }
      return out;
    });
  } catch (e) {
    console.warn(`  Skipping ${filename}: ${e.message}`);
    return [];
  }
}

async function main() {
  console.log("Pre-computing taxas data (PF/PJ segmented)...");

  const partitions = {
    pf: { banks: new Set(), modalities: {} },
    pj: { banks: new Set(), modalities: {} },
  };

  for (const mod of MODALITIES) {
    const prefix = mod.type === "daily" ? "taxas_d" : "taxas_m";
    const filename = `${prefix}_${mod.slug}.parquet`;
    const dateCol = mod.type === "monthly" ? "Mes" : "InicioPeriodo";

    console.log(`  Reading ${filename} [${mod.segmento}]...`);
    let rows = await readParquet(filename);
    if (rows.length === 0) {
      console.log(`    Empty, skipping.`);
      continue;
    }

    // Keep only rows for this segment. Monthly (imobiliário) parquets have no
    // Segmento column — they are PF by definition, so no filtering is needed.
    if ("Segmento" in rows[0]) {
      rows = rows.filter((r) => segOf(r.Segmento) === mod.segmento);
      if (rows.length === 0) {
        console.log(`    No ${mod.segmento} rows, skipping.`);
        continue;
      }
    }

    // Find latest date, then filter to it with positive rates.
    const dates = [...new Set(rows.map((r) => toISODate(r[dateCol])).filter(Boolean))].sort();
    const latestDate = dates[dates.length - 1] ?? "";

    const latestRows = rows
      .filter((r) => toISODate(r[dateCol]) === latestDate && r.TaxaJurosAoAno != null && Number(r.TaxaJurosAoAno) > 0)
      .sort((a, b) => Number(a.TaxaJurosAoAno) - Number(b.TaxaJurosAoAno));

    const part = partitions[mod.segmento];
    const entries = latestRows.map((r, idx) => {
      const name = String(r.InstituicaoFinanceira ?? "");
      part.banks.add(name);
      return {
        bank: name,
        rateYear: Number(r.TaxaJurosAoAno),
        rateMonth: Number(r.TaxaJurosAoMes ?? 0),
        rank: idx + 1,
      };
    });

    part.modalities[mod.slug] = {
      name: mod.name,
      latestDate,
      total: entries.length,
      entries,
    };

    console.log(`    ${entries.length} banks, latest: ${latestDate}`);
  }

  const output = {
    generated_at: new Date().toISOString(),
    pf: { banks: [...partitions.pf.banks].sort(), modalities: partitions.pf.modalities },
    pj: { banks: [...partitions.pj.banks].sort(), modalities: partitions.pj.modalities },
  };

  const outPath = join(DATA_DIR, "taxas_latest.json");
  writeFileSync(outPath, JSON.stringify(output), "utf-8");

  const sizeKB = (readFileSync(outPath).byteLength / 1024).toFixed(1);
  console.log(
    `\nDone! PF: ${output.pf.banks.length} banks / ${Object.keys(output.pf.modalities).length} modalities` +
      ` · PJ: ${output.pj.banks.length} banks / ${Object.keys(output.pj.modalities).length} modalities.`
  );
  console.log(`Output: ${outPath} (${sizeKB} KB)`);
}

main().catch(console.error);
