# SPEC-00: Architecture & Project Setup

## Overview
Refactor the "Laboratório de Dados Públicos" from Python/Streamlit to Next.js 14 (App Router) + TypeScript, deployed on Vercel. The app visualizes Brazilian Central Bank (BCB) open data: financial statements, credit portfolios, interest rates, and regional credit distribution.

## Tech Stack
- **Framework**: Next.js 14+ with App Router (`/app` directory)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + CSS Variables (port the existing dark cyan theme)
- **Charts**: react-plotly.js (Plotly.js wrapper) — mirrors current Streamlit/Plotly charts
- **Fonts**: Space Grotesk (display) + Space Mono (mono) via next/font/google
- **Data**: Parquet files in `/data` directory, read server-side via API routes using `parquet-wasm` or `@duckdb/duckdb-wasm`
- **Deployment**: Vercel (serverless functions for API routes, static for pages)

## Project Structure
```
/app
  /layout.tsx              — Root layout (fonts, dark theme, metadata)
  /page.tsx                — Hub/home page (module cards grid)
  /modulos
    /ativos-passivos/page.tsx    — Module 1: Treemap
    /resultado/page.tsx          — Module 2: Treemap (annualized DRE)
    /credito-pf/page.tsx         — Module 3: Treemap
    /credito-pj/page.tsx         — Module 4: Treemap
    /taxas-juros/page.tsx        — Module 5: Rankings + tabs
    /credito-regiao/page.tsx     — Module 6: Treemap
    /indices/page.tsx            — Module 7: Horizontal bars
    /cartograma/page.tsx         — Module 8: Dorling cartogram (SVG)
    /sobre/page.tsx              — About page (static content)
    /feedback/page.tsx           — Feedback form
  /api
    /ifdata/[report]/route.ts    — API route: read Parquet, filter, return JSON
    /taxas/[modality]/route.ts   — API route: read TaxaJuros Parquet
    /quarter/route.ts            — API route: return latest quarter from manifest
/components
  /layout
    /TopBar.tsx                  — LDP logo + back button
    /Footer.tsx                  — Credits footer
    /ModuleHeader.tsx            — Icon + title + subtitle
  /hub
    /ModuleCard.tsx              — Card with icon, title, description, badge
  /charts
    /TreemapChart.tsx            — Plotly treemap wrapper
    /HorizontalBarChart.tsx      — Plotly horizontal bar wrapper
    /DorlingCartogram.tsx        — SVG-based cartogram (React component)
    /TimeSeriesChart.tsx         — Plotly scatter/line for Module 5
  /ui
    /SegmentFilter.tsx           — Checkbox group for S1-S4, N1-N4
    /VariableSelector.tsx        — Clickable card selector
    /Top20Table.tsx              — Styled ranking table
    /SearchInput.tsx             — Bank search input
    /SegmentPill.tsx             — Colored segment badge
/lib
  /constants.ts                  — All config: modules, segments, colors, variables, bank names
  /data.ts                       — Server-side Parquet reading utilities
  /formatting.ts                 — formatBRL, formatPct, formatAnomes
  /types.ts                      — TypeScript interfaces
/data                            — Parquet files (from GitHub Actions, same as Streamlit version)
/public                          — Static assets
```

## Design System (CSS Variables — port from Streamlit)
```css
:root {
  --bg-primary: #0a0f1a;
  --bg-card: #111827;
  --bg-card-hover: #1a2332;
  --bg-surface: #0d1321;
  --border-color: rgba(34,211,238,0.12);
  --border-hover: rgba(34,211,238,0.3);
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --accent-cyan: #22d3ee;
  --accent-cyan-dim: rgba(34,211,238,0.15);
  --accent-emerald: #34d399;
  --accent-rose: #fb7185;
  --accent-amber: #fbbf24;
  --accent-violet: #a78bfa;
}
```

## Data Flow
1. GitHub Actions (monthly) runs `scripts/prefetch_data.py` → generates Parquet files in `/data`
2. Next.js API routes read Parquet server-side → return filtered JSON
3. Client components fetch from API routes → render charts with react-plotly.js
4. Each module page is a client component that manages its own state (selected variable, segments)

## Routing Map (Streamlit → Next.js)
| Streamlit session_state | Next.js route |
|-------------------------|---------------|
| hub | `/` |
| 1_ativos_passivos | `/modulos/ativos-passivos` |
| 2_resultado | `/modulos/resultado` |
| 3_credito_pf | `/modulos/credito-pf` |
| 4_credito_pj | `/modulos/credito-pj` |
| 5_taxas_juros | `/modulos/taxas-juros` |
| 6_credito_regiao | `/modulos/credito-regiao` |
| 7_indices | `/modulos/indices` |
| 8_cartograma | `/modulos/cartograma` |
| sobre | `/modulos/sobre` |
| feedback | `/modulos/feedback` |

## Parquet Reading Strategy
- Use `parquetjs` or `@duckdb/duckdb-wasm` in API routes (server-side only)
- API routes read from `process.cwd() + '/data/'` + filename
- Filename pattern: `valores_{anomes}_t{tipo}_r{relatorio}.parquet`, `cadastro_{anomes}.parquet`, `taxas_d_{slug}.parquet`, `taxas_m_{slug}.parquet`
- `data/manifest.json` contains `latest_quarter`, `quarters`, `files[]`
- `data/latest_quarter.txt` contains the integer (e.g., `202509`)

## Important Notes
- All monetary values are in BRL (raw integers, not divided by thousands)
- Segment classification: TCB (N1/N2/N4) overrides SR (S1-S4)
- Only PRUDENCIAL institutions (consolidated view) are shown
- Materiality filter: Ativo Total ≥ R$100M AND PL ≥ R$20M
- Module 2 (Resultado) annualizes DRE by summing 4 quarters
- The app language is Portuguese (Brazil)
