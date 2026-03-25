# Laboratório de Dados Públicos — Streamlit to Next.js Migration Design

## Context

The "Laboratório de Dados Públicos" is a Streamlit (Python) app that visualizes Brazilian Central Bank (BCB) open financial data across 8 analytical modules. The app is being migrated to Next.js 14 for deployment on Vercel, improving performance, SEO, and user experience. The source Streamlit app lives at `github.com/JAmerico1898/lab-dados-abertos-bcb-fast`. Existing specs (SPEC-00 through SPEC-08 in `/spec`) define the migration target in detail. This design document incorporates 12 improvements over those specs.

## Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14, App Router |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + CSS Variables (dark cyan theme) |
| Charts | Plotly.js (custom partial bundle: treemap + bar + scatter only, ~800KB) |
| Data reading | DuckDB WASM (server-side Parquet queries). Supersedes `parquetjs-lite` / `parquet-wasm` references in SPEC-00/01/08. |
| Client data fetching | SWR |
| Fonts | Space Grotesk (display) + Space Mono (mono) |
| Testing | Vitest + React Testing Library |
| Deployment | Vercel (serverless + edge) |
| CI/CD | GitHub Actions (monthly data prefetch) |

### Server Components + Client Islands

Module pages are **Server Components** that fetch default data server-side and pass it as props to **Client Component islands** for interactivity. This eliminates the loading spinner on first paint and reduces client JavaScript.

Pattern:
```
page.tsx (Server Component)
  → reads URL search params (var, seg)
  → fetches default data server-side
  → renders ModuleClient with initialData prop

client.tsx ("use client")
  → manages interactive state (variable, segments, search)
  → uses SWR for subsequent client-side fetches
  → updates URL search params on interaction
```

### Project Structure

```
app/
├── layout.tsx                    # Root layout (Server Component)
├── page.tsx                      # Hub page (Server Component)
├── error.tsx                     # Global error boundary
├── loading.tsx                   # Global loading skeleton
├── globals.css                   # Tailwind + CSS variables
├── modulos/
│   ├── ativos-passivos/          # Each module has:
│   │   ├── page.tsx              #   Server Component (fetches default)
│   │   ├── client.tsx            #   Client island (interactive)
│   │   ├── error.tsx             #   Error boundary (pt-BR)
│   │   └── loading.tsx           #   Skeleton loader
│   ├── resultado/...
│   ├── credito-pf/...
│   ├── credito-pj/...
│   ├── credito-regiao/...
│   ├── taxas-juros/
│   │   ├── page.tsx, client.tsx, error.tsx, loading.tsx
│   │   └── tabs/                 # Tab-specific components
│   │       ├── RankingsTab.tsx
│   │       ├── BankTab.tsx
│   │       ├── ChartsTab.tsx
│   │       └── DownloadTab.tsx
│   ├── indices/...
│   ├── cartograma/...
│   ├── sobre/page.tsx            # Pure Server Component (zero JS)
│   └── feedback/page.tsx, client.tsx
└── api/
    ├── quarter/route.ts          # Edge Runtime
    ├── ifdata/[report]/route.ts  # Node + LRU cache
    ├── taxas/
    │   ├── [slug]/route.ts       # Node + LRU cache
    │   └── rankings/route.ts     # NEW: batch rankings
    ├── indices/route.ts          # Node + aggressive cache
    ├── health/route.ts           # NEW: monitoring
    └── feedback/route.ts         # Pushover integration

components/
├── layout/TopBar.tsx, Footer.tsx, ModuleHeader.tsx  # Server Components
├── hub/ModuleCard.tsx                                # Server Component
├── charts/
│   ├── PlotlyChart.tsx           # Client: dynamic import of partial bundle
│   ├── TreemapChart.tsx          # Client: wraps PlotlyChart
│   ├── HBarChart.tsx             # Client: horizontal bars (indices)
│   ├── TimeSeriesChart.tsx       # Client: scatter (taxas)
│   └── DorlingCartogram.tsx      # Client: React SVG
├── ui/
│   ├── SegmentFilter.tsx         # Client: fieldset + checkboxes (a11y)
│   ├── VariableSelector.tsx      # Client: radiogroup semantics
│   ├── Top20Table.tsx            # Client: sortable table
│   ├── SearchInput.tsx           # Client: debounced search
│   ├── SegmentPill.tsx           # Server Component
│   └── Skeleton.tsx              # Server Component
└── shared/TreemapModule.tsx      # Client: shared layout for 5 modules

hooks/
├── useModuleData.ts              # SWR-based fetching + URL params
└── useDebounce.ts

lib/
├── constants.ts                  # Config, variable defs, mappings
├── data.ts                       # DuckDB Parquet reader + LRU cache
├── formatting.ts                 # formatBRL, formatPct, formatAnomes
├── types.ts                      # All TypeScript interfaces
├── slugify.ts                    # Exact match with Python prefetch
└── plotly-bundle.ts              # Custom partial Plotly bundle

data/                             # Parquet files (committed to repo)
scripts/prefetch_data.py          # BCB data fetcher (existing)
test/
├── fixtures/                     # Small test Parquet files
├── lib/                          # Unit tests for lib/*.ts
└── api/                          # Integration tests for API routes
```

## Data Layer

### API Routes

| Endpoint | Runtime | Cache | Purpose |
|----------|---------|-------|---------|
| `GET /api/quarter` | Edge | 1h | Latest quarter metadata |
| `GET /api/ifdata/[report]` | Node | LRU + 1h HTTP | Filtered financial data |
| `GET /api/taxas/[slug]` | Node | LRU + 1h HTTP | Interest rate data by modality |
| `GET /api/taxas/rankings` | Node | LRU + 1h HTTP | **NEW**: All modalities' top/bottom 10 in one call |
| `GET /api/indices` | Node | LRU + 24h HTTP | Computed financial indices |
| `GET /api/health` | Edge | none | **NEW**: Monitoring / status check |
| `POST /api/feedback` | Node | none | Pushover notification |

### Variable Key Mapping

API uses clean short keys instead of raw NomeColuna values (which contain `\n` characters):

```
?variable=ativo_total        → "Ativo Total"
?variable=lucro_liquido      → "Lucro Líquido \n(j) = (g) + (h) + (i)"
?variable=resultado_intermediacao → "Resultado de Intermediação Financeira \n(c) = (a) + (b)"
```

Server-side lookup table maps keys to exact NomeColuna strings. This avoids URL encoding issues.

### 3-Layer Caching

1. **HTTP Cache** (Vercel CDN): `Cache-Control: s-maxage=3600, stale-while-revalidate=86400`
2. **In-Memory LRU** (warm serverless functions): Module-level `Map` keyed by `anomes:report:variable`
3. **SWR Client**: Deduplication + 5-minute stale time

### DuckDB WASM Pattern

Module-level singleton persists across warm function invocations:

```typescript
let db: AsyncDuckDB | null = null;
const cache = new LRUCache<string, InstitutionRow[]>({ max: 50 });

async function getDB(): Promise<AsyncDuckDB> {
  if (!db) db = await initDuckDB();
  return db;
}

export async function queryParquet(file: string, sql: string) {
  const key = `${file}:${sql}`;
  if (cache.has(key)) return cache.get(key)!;
  const conn = await (await getDB()).connect();
  const result = await conn.query(sql);
  conn.close();
  cache.set(key, result.toArray());
  return result.toArray();
}
```

### TypeScript Interfaces (additions to SPEC-01)

```typescript
interface VarDef {
  key: string;           // "ativo_total"
  nomeColuna: string;    // Full NomeColuna (may contain \n)
  label: string;         // "Ativo Total"
  icon: string;
  description: string;
}

interface ModuleDef {
  slug: string;          // "ativos-passivos"
  title: string;
  icon: string;
  description: string;
  vizType: string;       // "Treemap" | "Ranking" | "Barras" | "Cartograma"
  report: number;
}

interface IFDataResponse {
  institutions: InstitutionRow[];
  total: number;
  count: number;
  top5Share: number;
  quarter: number;
  variable: string;
}

interface RankingsResponse {
  modalities: Record<string, {
    name: string;
    top10: RateRow[];
    bottom10: RateRow[];
    latestDate: string;
  }>;
}

interface HealthResponse {
  status: "ok" | "degraded";
  latestQuarter: number;
  dataFileCount: number;
  buildTime: string;
}
```

## UI Components

### Shared TreemapModule

5 modules (Ativos/Passivos, Resultado, Crédito PF, Crédito PJ, Crédito por Região) share this layout:

1. **ModuleHeader** — icon + title + back-to-hub link
2. **VariableSelector** — radiogroup with arrow-key navigation
3. **SegmentFilter** — fieldset + legend + checkboxes
4. **SummaryMetrics** — total value, institution count, top-5 concentration
5. **TreemapChart** — Plotly treemap with segment colors
6. **Top20Table** — sortable table with medals, segment pills, percentage bars
7. **SearchInput** — debounced (300ms) institution search

### URL State Management

All module state is stored in URL search params for deep-linking:

```
/modulos/ativos-passivos?var=ativo_total&seg=S1,S2
/modulos/taxas-juros?tab=rankings&modalities=consignado,pessoal
/modulos/indices?index=basileia&seg=S1,S2
```

Server Components read params → fetch default data → pass to client. Client updates URL on interaction without full page reload.

### Responsive Breakpoints

| Breakpoint | Hub Grid | Variables | Chart Height | Table |
|-----------|----------|-----------|-------------|-------|
| Mobile (<640px) | 1 col | 2 col | 400px | horizontal scroll |
| Tablet (640-1024px) | 2 col | 3 col | 550px | full width |
| Desktop (≥1024px) | 4 col | 4 col | 650px | full width |

### Accessibility (WCAG AA)

- **VariableSelector**: `role="radiogroup"` + `aria-label`, arrow-key navigation
- **SegmentFilter**: `<fieldset>` + `<legend>` wrapping `<input type="checkbox">`
- **TreemapChart**: `aria-label`, linked to Top20Table via `aria-describedby`
- **Top20Table**: `<table>` with `<thead>`/`<tbody>`, `<caption>` for screen readers
- **SearchInput**: `<label>` via `htmlFor`, `aria-live="polite"` for result count
- **Cartogram SVG**: `role="img"` + `aria-label`, `<title>` on each circle
- **Focus indicators**: `ring-2 ring-cyan-400` on all interactive elements
- **Contrast**: text #f1f5f9 on #0a0f1a = 15.4:1; muted #64748b on #0a0f1a = 4.6:1

## Complex Modules

### Module 5: Taxas de Juros

4-tab architecture using `useReducer` for complex state:

- **Tab 1 (Rankings)**: Uses batch `/api/taxas/rankings` endpoint. Single request returns all non-excluded modalities' top/bottom 10.
- **Tab 2 (Individual Bank)**: Select modality → bank dropdown. Uses `/api/taxas/[slug]`.
- **Tab 3 (Charts)**: Plotly scatter showing rate evolution. Optional multi-bank overlay.
- **Tab 4 (Download)**: Select modalities + date range. Excel via exceljs. Cap at 500K rows.

State: `{ activeTab, selectedModalities, selectedBank, dateRange, searchQuery }` synced to URL params.

### Module 7: Índices Financeiros

3 categories, 9 computed ratios displayed as horizontal bar charts:

- **Ativos**: Crédito % Ativos, Provisões % Carteira
- **Capital**: Basileia, Alavancagem (PL/AT), PL Ajustado
- **Resultado**: Resultado Intermediação %, Despesa Captação %, ROA, Eficiência (9 indices total)

Server computes from 4 reports (R1, R2, R3, R4) with DRE annualization. Outlier filtering: 3σ beyond mean. Aggressively cached (monthly data).

### Module 8: Cartograma

Pure React SVG component (no Plotly). 5 Dorling circles at region centroids.

- Sizing: `radius = minR + (maxR - minR) * √(value / maxValue)`, minR=30, maxR=110
- Responsive: `preserveAspectRatio="xMidYMid meet"` scales to container
- Animations: CSS transitions on radius + opacity, 200ms stagger per region
- Accessibility: `role="img"` + `aria-label`, `<title>` per circle

## Implementation Phases

| Phase | Scope | Key Deliverables |
|-------|-------|-----------------|
| **1. Foundation** | Project scaffold | Next.js + TS + Tailwind + CSS vars + fonts + root layout + types + constants |
| **2. Data Layer** | API routes | DuckDB reader + all API routes + LRU cache + health endpoint |
| **3. Hub + Shared UI** | Layout components | TopBar, Footer, ModuleHeader, ModuleCard, hub page, Skeleton |
| **4. Treemap Modules** | 5 modules | SharedTreemapModule + PlotlyChart + SegmentFilter + VariableSelector + Top20Table |
| **5. Complex Modules** | 3 modules | Taxas (4 tabs), Índices (bars), Cartograma (SVG) |
| **6. Quality** | Polish | Sobre, Feedback, accessibility audit, responsive refinements, tests |
| **7. Deployment** | Production | Vercel config, GitHub Actions, prefetch script, bundle validation |

## Deployment

### Vercel Configuration

- Build: `next build`
- Node.js 18+
- Parquet files committed to repo, included via `outputFileTracingIncludes`
- Edge Runtime for `/api/quarter` and `/api/health`
- `maxDuration: 30` for `/api/indices`
- Preview deployments per PR
- Env vars: `PUSHOVER_API_TOKEN`, `PUSHOVER_USER_KEY` (both optional)

### CI/CD

- **GitHub Actions**: Monthly prefetch (day 1 and 3, 06:00 UTC) runs `python scripts/prefetch_data.py`, commits Parquet files, triggers Vercel auto-deploy
- **Bundle size check**: CI validates total serverless function size < 200MB
- **Lint + format**: ESLint (next/core-web-vitals) + Prettier

### Testing

- **Unit**: Vitest for `lib/formatting.ts`, `lib/data.ts` (pure functions)
- **Fixtures**: Small Parquet files in `test/fixtures/` for API route testing
- **Smoke**: Each page renders without crashing
- **Numeric accuracy**: Compare Next.js output vs Streamlit for each module

## Risk Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Vercel 250MB function limit | HIGH | Validate in Phase 1 with minimal API + full /data dir. Fallback: Vercel Blob Storage |
| Plotly.js mobile performance | MEDIUM | Custom partial bundle (~800KB). Top20Table-only fallback on mobile if needed |
| Module 5 download size | MEDIUM | Cap at 500K rows. Paginate or stream for large exports |
| DuckDB WASM compatibility | LOW-MEDIUM | Test against actual Parquet files early in Phase 2 |
| Numeric accuracy | MEDIUM | Spot-check totals and rankings vs Streamlit per module |

## Source References

- Existing specs: `/spec/SPEC-00-architecture.md` through `SPEC-08-deployment.md`
- Streamlit source: `github.com/JAmerico1898/lab-dados-abertos-bcb-fast`
- Prefetch script: exists in source repo, copy to `scripts/prefetch_data.py`
