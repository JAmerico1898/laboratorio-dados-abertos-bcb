// ─────────────────────────────────────────────
// Core Data Types
// ─────────────────────────────────────────────

/** Raw row from the cadastro Parquet file */
export interface CadastroRow {
  CodInst: number;
  NomeInstituicao: string;
  Tcb: string | null;
  Sr: string | null;
}

/** Raw row from the valores Parquet file */
export interface ValoresRow {
  CodInst: number;
  NomeColuna: string;
  Grupo?: string;
  Saldo: number;
}

/** Processed institution with display names and segment */
export interface InstitutionRow {
  CodInst: number;
  NomeInstituicao: string;
  NomeDisplay: string;
  NomeReduzido: string;
  Segmento: string;
  Saldo: number;
}

/** Interest rate row from taxas Parquet files */
export interface RateRow {
  InstituicaoFinanceira: string;
  Posicao: number;
  TaxaJurosAoMes: number;
  TaxaJurosAoAno: number;
  data: string;
  Segmento?: string;
}

// ─────────────────────────────────────────────
// Configuration Types
// ─────────────────────────────────────────────

export type VizType = "treemap" | "barras" | "cartograma" | "custom";

export type Segment = "S1" | "S2" | "S3" | "S4" | "N1" | "N2" | "N4";

/** Module definition for hub cards */
export interface ModuleDef {
  slug: string;
  title: string;
  icon: string;
  description: string;
  vizType: VizType;
}

/** Variable definition for treemap modules (reports 1, 2) */
export interface VarDef {
  key: string;
  nomeColuna: string;
  label: string;
  icon: string;
  description: string;
  relatorio: number;
  isDre?: boolean;
}

/** Variable definition for credit modules (reports 11, 13) */
export interface CreditVarDef {
  key: string;
  grupo: string;
  label: string;
  icon: string;
  description: string;
}

/** Variable definition for region module (report 9) */
export interface RegionVarDef {
  key: string;
  nomeColuna: string;
  label: string;
  icon: string;
  description: string;
}

/** Index definition for financial indices module */
export interface IndexDef {
  key: string;
  label: string;
  category: "ativos" | "capital" | "resultado";
  unit: "pct" | "ratio" | "currency";
  description: string;
  /** Higher values are better (controls sort direction default) */
  higherIsBetter: boolean;
}

/** Interest rate modality */
export interface ModalityDef {
  slug: string;
  name: string;
  type: "daily" | "monthly";
  excludeFromRanking: boolean;
}

// ─────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────

export interface QuarterResponse {
  quarter: number;
  label: string;
  /** For DRE annualized: "Dez/2024 a Set/2025" */
  period?: string;
}

export interface IFDataResponse {
  institutions: InstitutionRow[];
  total: number;
  count: number;
  top5Share: number;
  quarter: number;
  variable: string;
}

export interface TaxasResponse {
  rates: RateRow[];
  latestDate: string;
  modalityName: string;
}

export interface RankingEntry {
  InstituicaoFinanceira?: string;
  TaxaJurosAoAno?: number;
  TaxaJurosAoMes?: number;
  [key: string]: unknown;
}

export interface RankingsResponse {
  modalities: Record<
    string,
    {
      name: string;
      top10: RankingEntry[];
      bottom10: RankingEntry[];
      latestDate: string;
    }
  >;
}

export interface IndicesResponse {
  institutions: {
    CodInst: number;
    NomeReduzido: string;
    Segmento: string;
    value: number;
  }[];
  median: number;
  mean: number;
  count: number;
  index: string;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  latestQuarter: number;
  dataFileCount: number;
  buildTime: string;
}

export interface FeedbackRequest {
  name?: string;
  email?: string;
  type: string;
  message: string;
}

// ─────────────────────────────────────────────
// Manifest
// ─────────────────────────────────────────────

export interface Manifest {
  generated_at: string;
  latest_quarter: number;
  files: string[];
}
