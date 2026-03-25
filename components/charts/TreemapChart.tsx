"use client";

import PlotlyChart from "./PlotlyChart";
import type { InstitutionRow } from "@/lib/types";
import { SEGMENT_COLORS } from "@/lib/constants";
import { formatBRL } from "@/lib/formatting";
import type { Segment } from "@/lib/types";

interface TreemapChartProps {
  data: InstitutionRow[];
  total: number;
  variableLabel: string;
  /** Use absolute values for treemap sizing (for DRE which can be negative) */
  useAbsValues?: boolean;
}

export default function TreemapChart({
  data,
  total,
  variableLabel,
  useAbsValues = false,
}: TreemapChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-[12px] border border-border bg-bg-card lg:h-[650px]">
        <span className="text-text-muted">Nenhum dado encontrado</span>
      </div>
    );
  }

  // Build treemap data: root → segments → institutions
  const labels: string[] = [];
  const parents: string[] = [];
  const values: number[] = [];
  const colors: string[] = [];
  const hovertext: string[] = [];

  const rootLabel = "(?)";
  // Collect unique segments in data
  const segments = [...new Set(data.map((d) => d.Segmento))].sort();

  // Pre-compute segment totals
  const segTotals = new Map<string, number>();
  for (const seg of segments) {
    const segTotal = data
      .filter((d) => d.Segmento === seg)
      .reduce((sum, d) => sum + Math.abs(d.Saldo), 0);
    segTotals.set(seg, segTotal);
  }

  // Add segment parent nodes
  for (const seg of segments) {
    const segTotal = segTotals.get(seg) ?? 0;
    const pctOfTotal = total > 0 ? (segTotal / total) * 100 : 0;
    labels.push(seg);
    parents.push(rootLabel);
    values.push(segTotal);
    colors.push(SEGMENT_COLORS[seg as Segment] ?? "#64748b");
    // Segment hover: name + % do total (issue #3)
    hovertext.push(
      `<b>${seg}</b><br>${pctOfTotal.toFixed(1)}% do total`
    );
  }

  // Add institution leaf nodes (sorted by absolute value)
  const sorted = [...data].sort((a, b) => Math.abs(b.Saldo) - Math.abs(a.Saldo));
  sorted.forEach((inst, i) => {
    const val = useAbsValues ? Math.abs(inst.Saldo) : inst.Saldo;
    const pctOfTotal = total > 0 ? (Math.abs(inst.Saldo) / total) * 100 : 0;
    // % of segment (issue #4)
    const segTotal = segTotals.get(inst.Segmento) ?? 0;
    const pctOfSegment = segTotal > 0 ? (Math.abs(inst.Saldo) / segTotal) * 100 : 0;

    labels.push(inst.NomeReduzido);
    parents.push(inst.Segmento);
    values.push(Math.abs(val));
    colors.push(SEGMENT_COLORS[inst.Segmento as Segment] ?? "#64748b");
    // Bank hover: name, rank, value, % total, % segment (issue #4)
    hovertext.push(
      `<b>${inst.NomeReduzido}</b><br>` +
      `Rank: ${i + 1}º<br>` +
      `${formatBRL(inst.Saldo)}<br>` +
      `${pctOfTotal.toFixed(2)}% do total<br>` +
      `${pctOfSegment.toFixed(1)}% do segmento`
    );
  });

  return (
    <div
      aria-label={`Treemap de ${variableLabel}`}
      className="relative h-[400px] w-full overflow-hidden lg:h-[650px]"
    >
      <PlotlyChart
        data={[
          {
            type: "treemap",
            labels,
            parents,
            values,
            hovertext,
            hovertemplate: "%{hovertext}<extra></extra>",
            marker: {
              colors,
              line: { width: 2, color: "rgba(255,255,255,0.3)" },
            },
            textinfo: "label+percent parent",
            branchvalues: "total" as const,
            pathbar: { visible: false },
            tiling: { pad: 2 },
          } as Record<string, unknown>,
        ]}
        layout={{
          margin: { t: 10, b: 10, l: 10, r: 10 },
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          font: {
            family: "Space Grotesk, Arial, Helvetica, sans-serif",
            color: "#f1f5f9",
            size: 12,
          },
          hoverlabel: {
            bgcolor: "#1a1a2e",
            bordercolor: "rgba(34,211,238,0.3)",
            font: {
              color: "#f1f5f9",
              family: "Space Grotesk, Arial, Helvetica, sans-serif",
              size: 13,
            },
          },
          autosize: true,
        }}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
