# SPEC-03: Treemap Modules (1, 2, 3, 4, 6)

## Overview
Five modules share the same layout pattern: variable selector → segment filter → summary metrics → treemap → top 20 table → search. They differ in data source, variables, and extraction logic.

## Shared Pattern (all 5 modules)

### Page Structure
1. **ModuleHeader** — icon + title + subtitle
2. **VariableSelector** — horizontal row of clickable cards (one per variable)
3. **SegmentFilter** — checkbox row for N1, N2, N4, S1-S4 (default: S1, S2)
4. **Guard** — if no variable selected, show info message
5. **Loading** — skeleton/spinner while fetching
6. **Summary Metrics** — 4 columns: Total do Sistema, Nº Instituições, Top 5 (%), Período
7. **TreemapChart** — Plotly treemap grouped by segment
8. **Top20Table** — styled HTML table with rank, name, segment pill, value, %, bar
9. **SearchInput** — text search filtering the data table
10. **Footer** — data source attribution

### VariableSelector (`/components/ui/VariableSelector.tsx`)
Props: `{ variables: Record<string, VarDef>, selected: string | null, onSelect: (key: string) => void }`
- Horizontal row of buttons (equal width)
- Selected: primary style (cyan gradient, dark text)
- Unselected: secondary style (dark bg, light border)
- Shows: `{icon} {label}`

### SegmentFilter (`/components/ui/SegmentFilter.tsx`)
Props: `{ segments: string[], selected: string[], onChange: (segments: string[]) => void }`
- Row of 7 checkboxes: N1, N2, N4, S1, S2, S3, S4
- Default checked: S1, S2
- If none selected, use all

### TreemapChart (`/components/charts/TreemapChart.tsx`)
Props: `{ data: InstitutionData[], colorMap: Record<string, string>, title: string }`
- Uses react-plotly.js `<Plot>`
- `type: "treemap"`, path: [Segmento_Calculado, Label_Treemap], values: Saldo_Abs
- Color by segment using `color_discrete_map`
- Custom hover: institution name, rank, formatted value, % total, % segment
- **Parent node hover fix**: segment nodes show only name + % total (no institution data)
- Layout: height 650, transparent bg, Space Grotesk font, white text
- Marker: cornerradius 3, white line width 1.5

### Top20Table (`/components/ui/Top20Table.tsx`)
Props: `{ data: InstitutionData[], variableLabel: string, total: number }`
- Styled table with dark theme
- Columns: # (rank), INSTITUIÇÃO (short + full name), SEGMENTO (colored pill), VALUE (right-aligned, mono), % TOTAL (cyan, mono), progress bar
- Top 3 get medal emojis: 🥇🥈🥉
- Progress bar: horizontal gradient bar proportional to max value, colored by segment
- Segment pill colors: S1=#22d3ee, S2=#34d399, S3=#fbbf24, S4=#a78bfa, N1=#fb7185, N2=#f97316, N4=#38bdf8

### SearchInput (`/components/ui/SearchInput.tsx`)
Props: `{ data: InstitutionData[], variableLabel: string }`
- Text input with search icon
- Filters NomeDisplay case-insensitively
- Shows results in a simple data table with Rank

## Module-Specific Details

### Module 1: Ativos e Passivos (`/modulos/ativos-passivos`)
- **Variables**: ativo_total, carteira_credito, captacoes, patrimonio_liquido (4 vars from Relatório 1 - Resumo)
- **Data**: `fetch_valores(anomes, tipo=1, relatorio=1)` → `extract_variable(df, conta, institutions)`
- **API call**: `GET /api/ifdata/resumo?variable={conta}&segments={segs}`
- **No annualization** — single quarter data

### Module 2: Resultado (`/modulos/resultado`)
- **Variables**: resultado_intermediacao, despesas_captacao, rendas_tarifas, rendas_servicos, despesas_pessoal, despesas_admin, lucro_liquido (7 vars from Relatório 4 - DRE)
- **Data**: `extract_variable_annualized(quarters, relatorio=4, conta, institutions)` — **sums 4 quarters**
- **API call**: `GET /api/ifdata/dre?variable={conta}&segments={segs}&annualized=true`
- **Period label**: "Dez/2024 a Set/2025" (oldest to newest quarter)
- **Note**: uses absolute values for treemap (`Saldo.abs()`) since DRE items can be negative
- **IMPORTANT**: The `conta` values contain `\n` characters (e.g., "Resultado de Intermediação Financeira \n(c) = (a) + (b)"). These must be preserved exactly as-is when querying the data.

### Module 3: Crédito Pessoa Física (`/modulos/credito-pf`)
- **Variables**: total_pf, consignado, pessoal, habitacao, veiculos, cartao, rural_pf, outros_pf (8 vars from Relatório 11)
- **Data**: `fetch_valores(anomes, tipo=1, relatorio=11)` → `extract_credit_variable(df, grupo, institutions)`
- **Credit extraction** uses `Grupo` field + `NomeColuna == "Total"` (not regular `NomeColuna` filter)
- **Exception**: "Total da Carteira de Pessoa Física" is filtered by `NomeColuna == grupo` (not Grupo field)
- **API call**: `GET /api/ifdata/credito-pf?variable={grupo}&segments={segs}`

### Module 4: Crédito Pessoa Jurídica (`/modulos/credito-pj`)
- **Variables**: total_pj, capital_giro, investimento, recebiveis, conta_garantida, habitacional_pj, infraestrutura, comex, rural_pj, outros_pj (10 vars from Relatório 13)
- **Same extraction logic as Module 3** but with Relatório 13
- **API call**: `GET /api/ifdata/credito-pj?variable={grupo}&segments={segs}`

### Module 6: Crédito por Região (`/modulos/credito-regiao`)
- **Variables**: sudeste, centro_oeste, nordeste, norte, sul (5 vars from Relatório 9)
- **Data**: `fetch_valores(anomes, tipo=1, relatorio=9)` → `extract_variable(df, conta, institutions)`
- **Same as Module 1 logic** (NomeColuna filter, not Grupo)
- **Note**: "Centro-oeste" in API (lowercase 'o') maps to "Centro-Oeste" in display
- **API call**: `GET /api/ifdata/credito-geo?variable={conta}&segments={segs}`
