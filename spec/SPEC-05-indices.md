# SPEC-05: Module 7 — Índices Financeiros

## Overview
Horizontal bar charts comparing institutions by computed financial indices. Most data-heavy module: reads from Resumo (R1), Ativo (R2), Passivo (R3), and DRE (R4), then computes derived ratios.

## Page: `/modulos/indices`

### Index Definitions (8 indices in 3 categories)

**Ativos:**
- `op_credito_pct_ativos`: Carteira de Crédito / Ativo Total (format: %)
- `provisoes_pct_carteira`: Provisões / Operações de Crédito (format: %)

**Capital:**
- `basileia`: Índice de Basileia — direct from Resumo, NomeColuna = "Índice de Basileia" (format: % direct, no division needed)
- `alavancagem`: PL / Ativo Total (format: %)
- `pl_ajustado`: PL value (format: BRL)

**Resultado:**
- `result_interm_pct_carteira`: Resultado Intermediação Financeira (annualized) / Carteira de Crédito (format: %)
- `desp_capt_pct_captacoes`: Despesas de Captação (annualized) / Captações (format: %)
- `roi`: Lucro Líquido (annualized) / Ativo Total (format: %, this is actually ROA)
- `eficiencia`: (Despesas Pessoal + Despesas Admin) / (Resultado Intermediação + Rendas Serviços + Rendas Tarifas) — all annualized (format: %)

### Computation Logic
1. Read Resumo (R1) for: Ativo Total, Carteira de Crédito, Captações, PL, Índice de Basileia
2. Read Ativo (R2) for: Provisões (NomeColuna contains "Provisão" or "Perda Esperada")
3. Read DRE (R4) for 4 quarters → annualize: Resultado Intermediação, Despesas Captação, Lucro Líquido, Despesas Pessoal, Despesas Admin, Rendas Serviços, Rendas Tarifas
4. Merge all per institution, compute ratios
5. Apply materiality filter, segment filter
6. Sort by index value, rank

### UI Layout
1. **ModuleHeader**
2. **Index category tabs or selector** — Ativos | Capital | Resultado
3. **Index selector within category** — clickable cards
4. **SegmentFilter** — same as treemap modules
5. **Horizontal Bar Chart** — top N institutions ranked by index value
6. **Data table** below chart
7. **Search** for individual bank

### Horizontal Bar Chart (`/components/charts/HorizontalBarChart.tsx`)
Props: `{ data: { name: string, value: number, segment: string }[], formatType: 'pct' | 'brl' | 'pct_direct', title: string }`
- Plotly `go.Bar` with `orientation: 'h'`
- Y axis: institution names (sorted by value)
- X axis: index value
- Color: by segment
- Show top 30 institutions (configurable)
- Hover: institution name, segment, formatted value
- Layout: dark bg, white text, Space Grotesk
- Bar labels on right side showing formatted value

### API Route: `GET /api/indices?index={indexKey}&segments={segs}`
Server-side computation:
1. Read necessary Parquets
2. Build institution table
3. Compute the specific index
4. Apply materiality + segment filter
5. Return sorted array: `{ name, fullName, segment, value, rank }[]`

### NomeColuna values needed from each Relatório
**Resumo (R1)**: "Ativo Total", "Carteira de Crédito", "Captações", "Patrimônio Líquido", "Índice de Basileia"
**Ativo (R2)**: Any containing "Provisão" or "Perda Esperada" (sum for total provisions)
**DRE (R4)**: "Resultado de Intermediação Financeira \n(c) = (a) + (b)", "Despesas de Captação \n(b1)", "Lucro Líquido \n(j) = (g) + (h) + (i)", "Despesas de Pessoal \n(d3)", "Despesas Administrativas \n(d4)", "Rendas de Prestação de Serviços \n(d1)", "Rendas de Tarifas Bancárias \n(d2)"

### Important: DRE conta names contain literal `\n`
The API data uses NomeColuna values with `\n` (newline characters) embedded. For example: `"Lucro Líquido \n(j) = (g) + (h) + (i)"`. The data matching must use these exact strings.
