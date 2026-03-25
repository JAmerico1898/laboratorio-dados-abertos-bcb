/**
 * Pre-compute taxas data for fast API responses.
 * Reads all taxas Parquet files, extracts latest-date rows,
 * and writes a small JSON file with all banks + rates + ranks.
 *
 * Run: node scripts/precompute_taxas.mjs
 * Output: data/taxas_latest.json
 *
 * Should be run after prefetch_data.py updates the Parquet files.
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");

// Modality definitions (must match lib/constants.ts)
const MODALITIES = [
  { slug: "financiamento_imobiliario_com_taxas_reguladas_prefixado", name: "Financ. Imobiliário Regulado Pré", type: "monthly", excludeFromRanking: true },
  { slug: "financiamento_imobiliario_com_taxas_de_mercado_prefixado", name: "Financ. Imobiliário Mercado Pré", type: "monthly", excludeFromRanking: true },
  { slug: "credito_pessoal_consignado_publico_prefixado", name: "Consignado Público", type: "daily", excludeFromRanking: false },
  { slug: "credito_pessoal_consignado_inss_prefixado", name: "Consignado INSS", type: "daily", excludeFromRanking: false },
  { slug: "credito_pessoal_consignado_privado_prefixado", name: "Consignado Privado", type: "daily", excludeFromRanking: false },
  { slug: "credito_pessoal_nao_consignado_prefixado", name: "Crédito Pessoal Não-Consignado", type: "daily", excludeFromRanking: false },
  { slug: "aquisicao_de_veiculos_prefixado", name: "Aquisição de Veículos", type: "daily", excludeFromRanking: false },
  { slug: "cheque_especial_prefixado", name: "Cheque Especial", type: "daily", excludeFromRanking: false },
  { slug: "cartao_de_credito_rotativo_total_prefixado", name: "Cartão de Crédito Rotativo", type: "daily", excludeFromRanking: true },
  { slug: "cartao_de_credito_parcelado_prefixado", name: "Cartão de Crédito Parcelado", type: "daily", excludeFromRanking: true },
  { slug: "capital_de_giro_com_prazo_ate_365_dias_prefixado", name: "Capital de Giro até 365 dias", type: "daily", excludeFromRanking: false },
  { slug: "capital_de_giro_com_prazo_superior_a_365_dias_prefixado", name: "Capital de Giro acima de 365 dias", type: "daily", excludeFromRanking: false },
  { slug: "conta_garantida_prefixado", name: "Conta Garantida", type: "daily", excludeFromRanking: true },
  { slug: "desconto_de_duplicatas_prefixado", name: "Desconto de Duplicatas", type: "daily", excludeFromRanking: true },
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

async function readParquet(filename) {
  const filePath = join(DATA_DIR, filename);
  try {
    const { parquetReadObjects } = await import("hyparquet");
    const buffer = readFileSync(filePath);
    const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    const file = { byteLength: ab.byteLength, slice: (s, e) => ab.slice(s, e) };
    const rows = await parquetReadObjects({ file });
    // Convert BigInt
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
  console.log("Pre-computing taxas data...");

  const allBanks = new Set();
  const modalities = {};

  for (const mod of MODALITIES) {
    const prefix = mod.type === "daily" ? "taxas_d" : "taxas_m";
    const filename = `${prefix}_${mod.slug}.parquet`;
    const dateCol = mod.type === "monthly" ? "Mes" : "InicioPeriodo";

    console.log(`  Reading ${filename}...`);
    const rows = await readParquet(filename);
    if (rows.length === 0) {
      console.log(`    Empty, skipping.`);
      continue;
    }

    // Find latest date
    const dates = [...new Set(rows.map((r) => toISODate(r[dateCol])).filter(Boolean))].sort();
    const latestDate = dates[dates.length - 1] ?? "";

    // Filter to latest date with positive rates
    const latestRows = rows
      .filter((r) => toISODate(r[dateCol]) === latestDate && r.TaxaJurosAoAno != null && Number(r.TaxaJurosAoAno) > 0)
      .sort((a, b) => Number(a.TaxaJurosAoAno) - Number(b.TaxaJurosAoAno));

    // Build modality data
    const entries = latestRows.map((r, idx) => {
      const name = String(r.InstituicaoFinanceira ?? "");
      allBanks.add(name);
      return {
        bank: name,
        rateYear: Number(r.TaxaJurosAoAno),
        rateMonth: Number(r.TaxaJurosAoMes ?? 0),
        rank: idx + 1,
      };
    });

    modalities[mod.slug] = {
      name: mod.name,
      latestDate,
      total: entries.length,
      excludeFromRanking: mod.excludeFromRanking,
      entries,
    };

    console.log(`    ${entries.length} banks, latest: ${latestDate}`);
  }

  const output = {
    generated_at: new Date().toISOString(),
    banks: [...allBanks].sort(),
    modalities,
  };

  const outPath = join(DATA_DIR, "taxas_latest.json");
  writeFileSync(outPath, JSON.stringify(output), "utf-8");

  const sizeKB = (readFileSync(outPath).byteLength / 1024).toFixed(1);
  console.log(`\nDone! ${output.banks.length} banks, ${Object.keys(modalities).length} modalities.`);
  console.log(`Output: ${outPath} (${sizeKB} KB)`);
}

main().catch(console.error);
