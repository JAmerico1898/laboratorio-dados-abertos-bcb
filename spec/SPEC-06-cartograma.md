# SPEC-06: Module 8 — Cartograma (Dorling Circles)

## Overview
SVG-based proportional circle map showing total credit volume by Brazilian region. Uses Dorling circles positioned at region centroids over a simplified Brazil outline.

## Page: `/modulos/cartograma`

### Data Source
- Relatório 9 (Crédito por Região Geográfica), tipo=1
- Sum `Saldo` per `NomeColuna` (region name) across ALL institutions (no segment filter)
- Regions: Norte, Nordeste, Centro-oeste, Sudeste, Sul

### Region Config
```typescript
const REGIOES = {
  "Norte":        { color: "#10b981", apiName: "Norte" },
  "Nordeste":     { color: "#f59e0b", apiName: "Nordeste" },
  "Centro-Oeste": { color: "#ef4444", apiName: "Centro-oeste" },  // lowercase 'o' in API
  "Sudeste":      { color: "#22d3ee", apiName: "Sudeste" },
  "Sul":          { color: "#a78bfa", apiName: "Sul" },
};
```

### Centroids (SVG viewBox 0 0 600 600)
```typescript
const centroids = {
  "Norte":        [255, 135],
  "Nordeste":     [430, 195],
  "Centro-Oeste": [290, 315],
  "Sudeste":      [395, 395],
  "Sul":          [310, 490],
};
```

### DorlingCartogram Component (`/components/charts/DorlingCartogram.tsx`)
Props: `{ data: RegionData[], period: string }`

**Visual elements:**
1. **Brazil outline** — simplified SVG path, fill #111827, 40% opacity stroke
2. **Proportional circles** — one per region, area ∝ credit volume
3. **Labels** — region name, percentage, formatted value (3 text layers per circle)
4. **Data table** below map

**Circle sizing:**
- `maxRadius = 110`, `minRadius = 30`
- `radius = minRadius + (maxRadius - minRadius) * sqrt(value / maxValue)`
- Positioned at centroids

**Animations (CSS):**
- Circles grow from r=0 to final size with cubic-bezier easing (0.68, -0.55, 0.265, 1.55)
- Labels appear with staggered delay (0.8s, 1.0s, 1.1s)
- On hover: highlighted circle, others dim to 25% opacity
- Tooltip on hover: region name, formatted value, share %, progress bar

**Font sizing:**
- Scale with circle radius, min/max constraints
- Region name: largest, bold
- Percentage: medium
- Value: smallest, mono font

**Data table below map:**
- Columns: #, REGIÃO, VOLUME, PARTICIPAÇÃO (%), progress bar
- Sorted by value descending
- Same dark table style

### Implementation
This should be a **pure React SVG component** (not Plotly). The Streamlit version uses `st.components.v1.html()` with raw HTML/SVG/CSS. In Next.js, implement as a React component with:
- SVG element with viewBox="0 0 600 600"
- `<path>` for Brazil outline
- `<circle>` elements with CSS transitions
- `<text>` elements for labels
- React state for hover (which region is highlighted)
- CSS animations via Tailwind or keyframes

### Brazil Outline SVG Path
The simplified Brazil outline path from the Streamlit version (a rough polygon approximation):
```
M 310,30 C 350,25 400,40 440,60 C 480,80 500,120 510,150 ...
```
(The full path is in `modulo_8_cartograma.py` function `_build_cartogram_html`. Extract and reuse.)

### API Route
`GET /api/ifdata/credito-geo?aggregate=region`
- Returns: `{ data: [{ name: "Sudeste", value: 1234567890, color: "#22d3ee", pct: 48.3 }, ...], period: "Set/2025" }`
- Server-side: reads Relatório 9, sums Saldo by NomeColuna across all institutions
