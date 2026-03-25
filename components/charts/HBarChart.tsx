"use client";

import PlotlyChart from "./PlotlyChart";
import { SEGMENT_COLORS } from "@/lib/constants";
import { formatBRL } from "@/lib/formatting";
import type { Segment } from "@/lib/types";

interface HBarChartProps {
  data: {
    NomeReduzido: string;
    Segmento: string;
    value: number;
  }[];
  format: "pct" | "currency";
  label: string;
}

export default function HBarChart({ data, format }: HBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[12px] border border-border bg-bg-card">
        <span className="text-text-muted">Nenhum dado encontrado</span>
      </div>
    );
  }

  const top20 = data.slice(0, 20);
  // Plotly renders bottom-to-top, so reverse for rank #1 at top
  const chartData = [...top20].reverse();

  const colors = chartData.map(
    (d) => SEGMENT_COLORS[d.Segmento as Segment] ?? "#64748b"
  );

  const textVals = chartData.map((d) =>
    format === "currency" ? formatBRL(d.value) : `${d.value.toFixed(1)}%`
  );

  const height = Math.max(400, top20.length * 36);

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <PlotlyChart
        data={[
          {
            type: "bar",
            orientation: "h",
            y: chartData.map((d) => d.NomeReduzido.toUpperCase()),
            x: chartData.map((d) => d.value),
            marker: { color: colors, cornerradius: 4 },
            text: textVals,
            textposition: "outside",
            textfont: { size: 11, family: "Space Mono, Consolas, monospace", color: "#94a3b8" },
            cliponaxis: false,
            hovertemplate:
              format === "currency"
                ? "<b>%{y}</b><br>Valor: %{text}<extra></extra>"
                : "<b>%{y}</b><br>Valor: %{x:.2f}%<extra></extra>",
          },
        ]}
        layout={{
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: { family: "Space Grotesk, Arial, Helvetica, sans-serif", color: "#f1f5f9" },
          margin: { l: 200, r: 80, t: 10, b: 10 },
          height,
          autosize: true,
          yaxis: {
            gridcolor: "rgba(148,163,184,0.05)",
            tickfont: { size: 12, family: "Space Grotesk, Arial, Helvetica, sans-serif" },
            automargin: true,
          },
          xaxis: {
            gridcolor: "rgba(148,163,184,0.07)",
            showline: false,
            zeroline: false,
          },
          hoverlabel: {
            bgcolor: "#1a1a2e",
            bordercolor: "rgba(34,211,238,0.3)",
            font: { color: "#f1f5f9", family: "Space Grotesk, Arial, Helvetica, sans-serif", size: 13 },
          },
          showlegend: false,
        }}
        config={{ displayModeBar: false, responsive: true }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
