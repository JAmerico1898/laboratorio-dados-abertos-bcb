# SPEC-04: Module 5 — Taxas de Juros

## Overview
Most complex module. 4 tabs: Rankings, Banco Individual, Gráficos, Download. Uses TaxaJuros data (daily/monthly interest rates by institution and modality).

## Page: `/modulos/taxas-juros`

### Data Source
- Parquet files: `taxas_d_{slug}.parquet` (daily), `taxas_m_{slug}.parquet` (monthly)
- Columns: InicioPeriodo (or Mes), Modalidade, InstituicaoFinanceira, TaxaJurosAoAno, TaxaJurosAoMes, Segmento, Posicao, cnpj8

### Modalities
**12 Daily** (DAILY_MODALITIES):
- Aquisição de veículos - Prefixado
- Capital de giro com prazo até 365 dias - Prefixado
- Capital de giro com prazo até 365 dias - Pós-fixado referenciado em juros flutuantes
- Capital de giro com prazo superior a 365 dias - Prefixado
- Capital de giro com prazo superior a 365 dias - Pós-fixado referenciado em juros flutuantes
- Cartão de crédito - rotativo total - Prefixado
- Cheque especial - Prefixado
- Conta garantida - Prefixado
- Conta garantida - Pós-fixado referenciado em juros flutuantes
- Crédito pessoal consignado privado - Prefixado
- Crédito pessoal não consignado - Prefixado
- Desconto de duplicatas - Prefixado

**2 Monthly** (MONTHLY_MODALITIES):
- Financiamento imobiliário com taxas de mercado - Prefixado
- Financiamento imobiliário com taxas de mercado - Pós-fixado referenciado em IPCA

**RANKING_EXCLUDED** (6 modalities excluded from Tab 1):
- Both monthly + 4 specific daily modalities (see constants)

### Tab 1: Rankings
- **Multi-select** of modalities (default: RANKING_MODALITIES = ALL minus RANKING_EXCLUDED)
- For each selected modality, fetch latest data (most recent date), filter `TaxaJurosAoAno > 0`
- Show **Top 10 (highest rates)** and **Bottom 10 (lowest rates)** as HTML tables
- Table columns: #, MODALIDADE (short label), INSTITUIÇÃO, TAXA (% a.a.)
- Table styling: same dark theme as Top20Table
- `short_label()`: replace "Pós-fixado referenciado em " → "Pós-", " - Prefixado" → " - Pré"

### Tab 2: Banco Individual
- Text input to search bank name
- Shows all modalities for the matched bank
- HTML table: MODALIDADE, TAXA (% a.a.), POSIÇÃO (#X de Y)
- Position = rank of that bank within the modality's latest data (1 = lowest rate)
- Color coding: rate colored with gradient from green (low) to red (high) relative to min/max of that modality

### Tab 3: Gráficos (Time Series)
- Select single modality from dropdown
- Date range filter (default: last 365 days)
- Plotly scatter chart showing **daily median rate** over time
- X = date, Y = TaxaJurosAoAno median across all institutions
- Line: cyan color, mode "lines+markers" (small markers)
- Layout: dark bg, Space Grotesk font, gridcolor from border-color

### Tab 4: Download
- Multi-select modalities
- Date range picker
- Download as Excel (.xlsx) with openpyxl
- In Next.js: generate CSV or use a server action to create Excel
- Alternative: client-side CSV generation with download link

### API Route: `GET /api/taxas/[slug]?type=daily|monthly`
- `slug`: slugified modality name (same as Parquet filename)
- Returns full dataset for that modality
- Client filters by date range as needed

### Slugify Function (must match prefetch script exactly)
```typescript
function slugify(name: string): string {
  let s = name.toLowerCase();
  const replacements: [string, string][] = [
    ['é','e'],['á','a'],['ã','a'],['â','a'],['í','i'],
    ['ó','o'],['ú','u'],['ç','c'],['ê','e'],['ô','o']
  ];
  for (const [old, nw] of replacements) s = s.replaceAll(old, nw);
  s = s.replace(/[^a-z0-9]+/g, '_');
  return s.replace(/^_|_$/g, '').slice(0, 80);
}
```

### Performance Note
- Each modality Parquet has 100K-200K rows
- For Tab 1 (Rankings), only need the latest date's data → filter server-side in API route with `?latest=true` query param
- For Tab 3 (Gráficos), need date range → pass `?after=YYYY-MM-DD&before=YYYY-MM-DD` and compute median server-side
- For Tab 4 (Download), return raw data for selected range
