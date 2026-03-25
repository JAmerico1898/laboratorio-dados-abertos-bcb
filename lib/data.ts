/**
 * Data layer — Parquet reading, caching, and data processing.
 * Ported from data_utils.py
 *
 * Architecture: reads local Parquet files using hyparquet (pure JS).
 * Module-level LRU cache survives warm serverless function invocations.
 */

import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { LRUCache } from "lru-cache";
import type {
  CadastroRow,
  InstitutionRow,
  Manifest,
} from "./types";
import {
  TCB_OVERRIDE,
  VALID_SR,
  MIN_ATIVO_TOTAL,
  MIN_PL,
  BANK_SHORT_NAMES,
} from "./constants";

// ─────────────────────────────────────────────
// DATA DIRECTORY
// ─────────────────────────────────────────────
const DATA_DIR = join(process.cwd(), "data");

// ─────────────────────────────────────────────
// LRU CACHE — persists across warm function invocations
// ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new LRUCache<string, any>({ max: 50 });

// ─────────────────────────────────────────────
// PARQUET READING
// ─────────────────────────────────────────────

/**
 * Read a Parquet file and return rows as objects.
 * Uses hyparquet (pure JS, zero deps).
 * Results are cached in the module-level LRU cache.
 */
export async function readParquet<T = Record<string, unknown>>(
  filename: string,
  columns?: string[]
): Promise<T[]> {
  const cacheKey = `parquet:${filename}:${columns?.join(",") ?? "all"}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached as T[];

  const filePath = join(DATA_DIR, filename);
  if (!existsSync(filePath)) {
    return [];
  }

  // hyparquet is ESM-only, dynamic import needed
  const { parquetReadObjects } = await import("hyparquet");

  const buffer = readFileSync(filePath);
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );

  const rows = await parquetReadObjects({
    file: { byteLength: arrayBuffer.byteLength, slice: (start: number, end?: number) => arrayBuffer.slice(start, end) },
    columns,
  }) as T[];

  cache.set(cacheKey, rows);
  return rows;
}

// ─────────────────────────────────────────────
// LATEST QUARTER
// ─────────────────────────────────────────────

export function getLatestQuarter(): number {
  const markerPath = join(DATA_DIR, "latest_quarter.txt");
  if (existsSync(markerPath)) {
    const val = parseInt(readFileSync(markerPath, "utf-8").trim(), 10);
    if (val > 200000) return val;
  }
  return 202509; // fallback
}

// ─────────────────────────────────────────────
// MANIFEST
// ─────────────────────────────────────────────

export function getManifest(): Manifest | null {
  const manifestPath = join(DATA_DIR, "manifest.json");
  if (existsSync(manifestPath)) {
    try {
      return JSON.parse(readFileSync(manifestPath, "utf-8"));
    } catch {
      return null;
    }
  }
  return null;
}

// ─────────────────────────────────────────────
// SEGMENT CLASSIFICATION
// Ported from data_utils.py:classify_segment()
// ─────────────────────────────────────────────

export function classifySegment(row: CadastroRow): string {
  const tcb = (row.Tcb ?? "").toString().trim().toUpperCase();
  if (TCB_OVERRIDE.has(tcb)) return tcb;
  const sr = (row.Sr ?? "").toString().trim().toUpperCase();
  if (VALID_SR.has(sr)) return sr;
  return "Outros";
}

// ─────────────────────────────────────────────
// SHORT NAME
// ─────────────────────────────────────────────

export function getShortName(fullName: string): string {
  if (fullName in BANK_SHORT_NAMES) {
    return BANK_SHORT_NAMES[fullName];
  }
  const name = fullName.replace("BCO ", "").replace("S.A.", "").trim();
  return name.length > 20 ? name.slice(0, 20) : name;
}

// ─────────────────────────────────────────────
// BUILD INSTITUTION TABLE
// Ported from data_utils.py:build_institution_table()
// ─────────────────────────────────────────────

export interface InstitutionBase {
  CodInst: number;
  NomeInstituicao: string;
  NomeDisplay: string;
  NomeReduzido: string;
  Segmento: string;
}

export async function buildInstitutionTable(
  anomes: number
): Promise<InstitutionBase[]> {
  const cacheKey = `institutions:${anomes}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached as InstitutionBase[];

  const filename = `cadastro_${anomes}.parquet`;
  const rows = await readParquet<CadastroRow>(filename);
  if (rows.length === 0) return [];

  // Classify segments and filter
  const withSegment = rows
    .map((row) => ({
      ...row,
      Segmento: classifySegment(row),
    }))
    .filter((row) => row.Segmento !== "Outros");

  // Filter to PRUDENCIAL only
  const prudencial = withSegment.filter((row) =>
    row.NomeInstituicao?.toUpperCase().includes("PRUDENCIAL")
  );

  if (prudencial.length === 0) return [];

  // Build display names and deduplicate
  const seen = new Set<number>();
  const result: InstitutionBase[] = [];

  for (const row of prudencial) {
    if (seen.has(row.CodInst)) continue;
    seen.add(row.CodInst);

    const nomeDisplay = row.NomeInstituicao
      .replace(/\s*[-\u2013]\s*PRUDENCIAL/i, "")
      .trim();

    result.push({
      CodInst: row.CodInst,
      NomeInstituicao: row.NomeInstituicao,
      NomeDisplay: nomeDisplay,
      NomeReduzido: getShortName(nomeDisplay),
      Segmento: row.Segmento,
    });
  }

  cache.set(cacheKey, result);
  return result;
}

// ─────────────────────────────────────────────
// EXTRACT VARIABLE
// Ported from data_utils.py:extract_variable()
// ─────────────────────────────────────────────

export async function extractVariable(
  anomes: number,
  tipo: number,
  relatorio: number,
  nomeColuna: string | string[],
  institutions: InstitutionBase[]
): Promise<InstitutionRow[]> {
  if (institutions.length === 0) return [];

  const filename = `valores_${anomes}_t${tipo}_r${relatorio}.parquet`;
  const rows = await readParquet<{
    CodInst: number;
    NomeColuna: string;
    Saldo: number;
  }>(filename);

  if (rows.length === 0) return [];

  const validCodes = new Set(institutions.map((i) => i.CodInst));
  const instMap = new Map(institutions.map((i) => [i.CodInst, i]));

  let balances: Map<number, number>;

  if (Array.isArray(nomeColuna)) {
    // Sum multiple columns (for compound variables)
    balances = new Map();
    for (const row of rows) {
      if (!validCodes.has(row.CodInst)) continue;
      if (!nomeColuna.includes(row.NomeColuna)) continue;
      const val = Number(row.Saldo);
      if (isNaN(val)) continue;
      balances.set(row.CodInst, (balances.get(row.CodInst) ?? 0) + val);
    }
  } else {
    balances = new Map();
    for (const row of rows) {
      if (!validCodes.has(row.CodInst)) continue;
      if (row.NomeColuna !== nomeColuna) continue;
      const val = Number(row.Saldo);
      if (!isNaN(val)) {
        balances.set(row.CodInst, val);
      }
    }
  }

  const result: InstitutionRow[] = [];
  for (const [codInst, saldo] of balances) {
    if (saldo === 0 || !isFinite(saldo)) continue;
    const inst = instMap.get(codInst);
    if (!inst) continue;
    result.push({
      CodInst: codInst,
      NomeInstituicao: inst.NomeInstituicao,
      NomeDisplay: inst.NomeDisplay,
      NomeReduzido: inst.NomeReduzido,
      Segmento: inst.Segmento,
      Saldo: saldo,
    });
  }

  return result;
}

// ─────────────────────────────────────────────
// EXTRACT VARIABLE ANNUALIZED (DRE)
// Ported from data_utils.py:extract_variable_annualized()
// ─────────────────────────────────────────────

export async function extractVariableAnnualized(
  anomesList: number[],
  relatorio: number,
  nomeColuna: string,
  institutions: InstitutionBase[]
): Promise<InstitutionRow[]> {
  if (institutions.length === 0) return [];

  const instMap = new Map(institutions.map((i) => [i.CodInst, i]));
  const sums = new Map<number, number>();

  for (const anomes of anomesList) {
    const extracted = await extractVariable(
      anomes,
      1,
      relatorio,
      nomeColuna,
      institutions
    );
    for (const row of extracted) {
      sums.set(row.CodInst, (sums.get(row.CodInst) ?? 0) + row.Saldo);
    }
  }

  const result: InstitutionRow[] = [];
  for (const [codInst, saldo] of sums) {
    if (saldo === 0 || !isFinite(saldo)) continue;
    const inst = instMap.get(codInst);
    if (!inst) continue;
    result.push({
      CodInst: codInst,
      NomeInstituicao: inst.NomeInstituicao,
      NomeDisplay: inst.NomeDisplay,
      NomeReduzido: inst.NomeReduzido,
      Segmento: inst.Segmento,
      Saldo: saldo,
    });
  }

  return result;
}

// ─────────────────────────────────────────────
// EXTRACT CREDIT VARIABLE
// Ported from data_utils.py:extract_credit_variable()
// ─────────────────────────────────────────────

export async function extractCreditVariable(
  anomes: number,
  tipo: number,
  relatorio: number,
  grupo: string,
  institutions: InstitutionBase[]
): Promise<InstitutionRow[]> {
  if (institutions.length === 0) return [];

  const filename = `valores_${anomes}_t${tipo}_r${relatorio}.parquet`;
  const rows = await readParquet<{
    CodInst: number;
    NomeColuna: string;
    Grupo?: string;
    Saldo: number;
  }>(filename);

  if (rows.length === 0) return [];

  const validCodes = new Set(institutions.map((i) => i.CodInst));
  const instMap = new Map(institutions.map((i) => [i.CodInst, i]));

  const isTotal =
    grupo.includes("Total da Carteira") || grupo.includes("Total Exterior");

  const balances = new Map<number, number>();

  for (const row of rows) {
    if (!validCodes.has(row.CodInst)) continue;

    let match: boolean;
    if (isTotal) {
      match = row.NomeColuna === grupo;
    } else {
      match = row.Grupo === grupo && row.NomeColuna === "Total";
    }

    if (!match) continue;
    const val = Number(row.Saldo);
    if (isNaN(val) || val === 0 || !isFinite(val)) continue;
    balances.set(row.CodInst, val);
  }

  const result: InstitutionRow[] = [];
  for (const [codInst, saldo] of balances) {
    const inst = instMap.get(codInst);
    if (!inst) continue;
    result.push({
      CodInst: codInst,
      NomeInstituicao: inst.NomeInstituicao,
      NomeDisplay: inst.NomeDisplay,
      NomeReduzido: inst.NomeReduzido,
      Segmento: inst.Segmento,
      Saldo: saldo,
    });
  }

  return result;
}

// ─────────────────────────────────────────────
// MATERIALITY FILTER
// Ported from data_utils.py:apply_materiality_filter()
// ─────────────────────────────────────────────

export async function applyMaterialityFilter(
  data: InstitutionRow[],
  anomes: number,
  institutions: InstitutionBase[]
): Promise<InstitutionRow[]> {
  if (data.length === 0) return data;

  // Read resumo data for Ativo Total and PL
  const resumoFile = `valores_${anomes}_t1_r1.parquet`;
  const resumoRows = await readParquet<{
    CodInst: number;
    NomeColuna: string;
    Saldo: number;
  }>(resumoFile);

  const validCodes = new Set(institutions.map((i) => i.CodInst));
  const validByAtivo = new Set<number>();
  const validByPL = new Set<number>();

  for (const row of resumoRows) {
    if (!validCodes.has(row.CodInst)) continue;
    const val = Number(row.Saldo);
    if (isNaN(val)) continue;

    if (row.NomeColuna === "Ativo Total" && val >= MIN_ATIVO_TOTAL) {
      validByAtivo.add(row.CodInst);
    }
    if (row.NomeColuna === "Patrimônio Líquido" && val >= MIN_PL) {
      validByPL.add(row.CodInst);
    }
  }

  if (validByAtivo.size === 0 && validByPL.size === 0) {
    return data.filter((d) => d.Saldo !== 0);
  }

  // Both conditions must be met (intersection)
  return data.filter(
    (d) =>
      validByAtivo.has(d.CodInst) &&
      validByPL.has(d.CodInst) &&
      d.Saldo !== 0
  );
}

// ─────────────────────────────────────────────
// FILTER BY SEGMENTS
// ─────────────────────────────────────────────

export function filterBySegments(
  data: InstitutionRow[],
  segments: string[]
): InstitutionRow[] {
  if (segments.length === 0) return data;
  const segSet = new Set(segments);
  return data.filter((d) => segSet.has(d.Segmento));
}

// ─────────────────────────────────────────────
// SEARCH BANKS
// ─────────────────────────────────────────────

export function searchBanks(
  institutions: InstitutionBase[],
  query: string
): InstitutionBase[] {
  if (!query) return [];
  const q = query.toLowerCase();
  return institutions.filter(
    (i) =>
      i.NomeDisplay.toLowerCase().includes(q) ||
      i.NomeReduzido.toLowerCase().includes(q)
  );
}

// ─────────────────────────────────────────────
// COMPUTE SUMMARY STATS
// ─────────────────────────────────────────────

export function computeSummary(data: InstitutionRow[]) {
  const total = data.reduce((sum, d) => sum + Math.abs(d.Saldo), 0);
  const count = data.length;

  // Top 5 concentration
  const sorted = [...data].sort(
    (a, b) => Math.abs(b.Saldo) - Math.abs(a.Saldo)
  );
  const top5Sum = sorted
    .slice(0, 5)
    .reduce((sum, d) => sum + Math.abs(d.Saldo), 0);
  const top5Share = total > 0 ? (top5Sum / total) * 100 : 0;

  return { total, count, top5Share };
}

// ─────────────────────────────────────────────
// READ TAXAS (interest rates)
// ─────────────────────────────────────────────

export async function readTaxas(
  slug: string,
  type: "daily" | "monthly"
): Promise<Record<string, unknown>[]> {
  const prefix = type === "daily" ? "taxas_d" : "taxas_m";
  const filename = `${prefix}_${slug}.parquet`;
  return readParquet(filename);
}

// ─────────────────────────────────────────────
// DATA FILE COUNT
// ─────────────────────────────────────────────

export function getDataFileCount(): number {
  try {
    const files = readdirSync(DATA_DIR);
    return files.filter((f) => f.endsWith(".parquet")).length;
  } catch {
    return 0;
  }
}
