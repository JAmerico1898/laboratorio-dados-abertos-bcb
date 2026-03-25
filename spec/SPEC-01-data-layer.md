# SPEC-01: Data Layer & API Routes

## Purpose
Server-side data reading from Parquet files + JSON API endpoints consumed by client components.

## Files to Create
- `/lib/data.ts` — Parquet reading utilities
- `/lib/constants.ts` — All configuration constants
- `/lib/formatting.ts` — Number/date formatting
- `/lib/types.ts` — TypeScript interfaces
- `/app/api/quarter/route.ts` — Latest quarter endpoint
- `/app/api/ifdata/[report]/route.ts` — IFDATA endpoint
- `/app/api/taxas/[modality]/route.ts` — TaxaJuros endpoint

## TypeScript Interfaces (`/lib/types.ts`)
```typescript
interface Institution {
  CodInst: string;
  NomeInstituicao: string;
  NomeDisplay: string;
  NomeReduzido: string;
  Segmento_Calculado: string;
}

interface ValoresRow {
  CodInst: string;
  NomeColuna: string;
  Saldo: number;
  Grupo?: string;
}

interface InstitutionData extends Institution {
  Saldo: number;
  Saldo_Fmt?: string;
  Pct?: number;
  Rank?: number;
}

interface TaxaJurosRow {
  InicioPeriodo?: string;  // daily
  Mes?: string;            // monthly
  Modalidade: string;
  InstituicaoFinanceira: string;
  TaxaJurosAoAno: number;
  TaxaJurosAoMes: number;
  Segmento: string;
  Posicao: number;
  cnpj8: string;
}

interface RegionData {
  name: string;
  value: number;
  color: string;
  pct: number;
}
```

## Constants (`/lib/constants.ts`)
Port ALL constants from Python `config.py`:
- `MODULES` — 8 module definitions with title, icon, description, vizType
- `ALL_SEGMENTS`, `DEFAULT_SEGMENTS` — ["N1","N2","N4","S1","S2","S3","S4"]
- `SEGMENT_COLORS` — color map per segment
- `SEGMENT_LABELS` — display names
- `BANK_SHORT_NAMES` — 28-entry map of full names → short names
- `MODULO1_VARS` — 4 variables (ativo_total, carteira_credito, captacoes, patrimonio_liquido)
- `MODULO2_VARS` — 7 DRE variables (resultado_intermediacao, despesas_captacao, etc.)
- `MODULO3_VARS` — 8 credit PF variables (total_pf, consignado, pessoal, etc.)
- `MODULO4_VARS` — 10 credit PJ variables (total_pj, capital_giro, etc.)
- `MODULO6_VARS` — 5 regions (sudeste, centro_oeste, nordeste, norte, sul)
- `INDICES` — 8 financial indices with label, icon, format, description
- `INDICE_CATEGORIAS` — grouped by Ativos/Capital/Resultado
- Materiality thresholds: `MIN_ATIVO_TOTAL = 100_000_000`, `MIN_PL = 20_000_000`
- Report numbers: RESUMO=1, ATIVO=2, PASSIVO=3, DRE=4, CREDITO_GEO=9, CREDITO_PF=11, CREDITO_PJ=13
- `DAILY_MODALITIES` — 12 interest rate modalities
- `MONTHLY_MODALITIES` — 2 mortgage modalities
- `RANKING_EXCLUDED` — 6 modalities excluded from ranking tab

## Formatting (`/lib/formatting.ts`)
```typescript
function formatBRL(value: number): string
  // >= 1e9 → "R$ X,X bi"
  // >= 1e6 → "R$ X,X mi"
  // >= 1e3 → "R$ X,X mil"
  // else → "R$ X"

function formatPct(value: number): string
  // → "X.X%"

function formatAnomes(anomes: number): string
  // 202509 → "Set/2025"
  // Month map: {3:'Mar', 6:'Jun', 9:'Set', 12:'Dez'}

function getShortName(fullName: string): string
  // Lookup in BANK_SHORT_NAMES, fallback: strip "BCO " and "S.A.", truncate at 20

function slugify(name: string): string
  // Lowercase, replace accents, replace non-alphanumeric with _, truncate at 80
```

## Parquet Reading (`/lib/data.ts`)

### Strategy
Use `parquetjs` (npm package `@duckdb/node-parquetjs` or `parquets`) to read Parquet files server-side in API routes.

### Core Functions
```typescript
async function readParquet(filename: string): Promise<any[]>
  // Reads data/filename, returns array of row objects

async function getLatestQuarter(): Promise<number>
  // Reads data/latest_quarter.txt, returns integer (e.g. 202509)

async function getManifest(): Promise<Manifest>
  // Reads data/manifest.json

async function fetchValores(anomes: number, tipo: number, relatorio: number): Promise<ValoresRow[]>
  // Reads valores_{anomes}_t{tipo}_r{relatorio}.parquet

async function fetchCadastro(anomes: number): Promise<any[]>
  // Reads cadastro_{anomes}.parquet

function classifySegment(row: any): string
  // TCB in {N1,N2,N4} → return TCB; SR in {S1-S4} → return SR; else "Outros"

async function buildInstitutionTable(anomes: number): Promise<Institution[]>
  // Read cadastro, classify segments, filter PRUDENCIAL, apply short names

function extractVariable(df: ValoresRow[], conta: string|string[], institutions: Institution[]): InstitutionData[]
  // Filter by NomeColuna, merge with institutions

function extractVariableAnnualized(quarters: number[], relatorio: number, conta: string, institutions: Institution[]): InstitutionData[]
  // Sum Saldo across 4 quarters per institution

function applyMaterialityFilter(data: InstitutionData[], resumoDf: ValoresRow[], institutions: Institution[]): InstitutionData[]
  // Keep only where Ativo Total >= 100M AND PL >= 20M

function extractCreditVariable(df: ValoresRow[], grupo: string, institutions: Institution[]): InstitutionData[]
  // For reports 11/13: filter by Grupo + NomeColuna="Total"

function getLastNQuarters(anomes: number, n: number): number[]
  // Return array of quarter integers going backwards
```

## API Routes

### GET `/api/quarter`
Returns: `{ latest_quarter: 202509, quarters: [202509, 202506, 202503, 202412] }`

### GET `/api/ifdata/[report]?variable=X&segments=S1,S2&annualized=false`
- `report`: "resumo" | "dre" | "credito-pf" | "credito-pj" | "credito-geo"
- `variable`: the `conta` or `grupo` value to filter
- `segments`: comma-separated segment codes
- `annualized`: if true, sum 4 quarters (used by Module 2)
- Returns: `{ data: InstitutionData[], total: number, period: string, n_institutions: number }`

### GET `/api/taxas/[slug]?type=daily|monthly`
- `slug`: slugified modality name
- `type`: "daily" or "monthly"
- Returns: `{ data: TaxaJurosRow[], modality: string }`

### GET `/api/indices?index=basileia&segments=S1,S2`
- Specialized endpoint for Module 7 that computes derived indices
- Returns: `{ data: { institution: string, segment: string, value: number }[] }`
