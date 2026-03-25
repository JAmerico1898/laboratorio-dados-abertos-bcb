"use client";

import { useState } from "react";
import useSWR from "swr";
import PlotlyChart from "@/components/charts/PlotlyChart";
import { MODALITIES } from "@/lib/constants";
import { SkeletonBox } from "@/components/ui/Skeleton";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ChartsTab() {
  const [selectedMod, setSelectedMod] = useState(MODALITIES[2]?.slug ?? "");

  const { data, isLoading } = useSWR(
    selectedMod ? `/api/taxas/${selectedMod}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  // Build median time series from rates
  let chartData: { x: string[]; y: number[] } = { x: [], y: [] };

  if (data?.rates && data.rates.length > 0) {
    // Group by date, compute median
    const byDate = new Map<string, number[]>();
    for (const r of data.rates) {
      const dateStr = String(
        r._date ?? r.InicioPeriodo ?? r.Mes ?? ""
      );
      if (!dateStr) continue;
      const rate = Number(r.TaxaJurosAoAno ?? 0);
      if (rate <= 0) continue;
      if (!byDate.has(dateStr)) byDate.set(dateStr, []);
      byDate.get(dateStr)!.push(rate);
    }

    const sorted = [...byDate.entries()].sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    // Last 10 years only
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 10);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const filtered = sorted.filter(([d]) => d >= cutoffStr);
    const finalData = filtered.length > 0 ? filtered : sorted;

    chartData = {
      x: finalData.map(([d]) => d),
      y: finalData.map(([, rates]) => {
        const s = [...rates].sort((a, b) => a - b);
        const mid = Math.floor(s.length / 2);
        return s.length % 2 === 0
          ? (s[mid - 1] + s[mid]) / 2
          : s[mid];
      }),
    };
  }

  const modName =
    MODALITIES.find((m) => m.slug === selectedMod)?.name ?? selectedMod;

  return (
    <>
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted">
          Modalidade
        </label>
        <select
          value={selectedMod}
          onChange={(e) => setSelectedMod(e.target.value)}
          className="w-full rounded-[10px] border border-border bg-bg-card px-4 py-2.5 text-sm text-text-primary focus:border-accent-cyan focus:outline-none"
        >
          {MODALITIES.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <SkeletonBox className="h-[400px]" />}

      {!isLoading && chartData.x.length > 0 && (
        <>
          <div className="relative h-[400px] w-full overflow-hidden">
            <PlotlyChart
              data={[
                {
                  type: "scatter",
                  mode: "markers",
                  x: chartData.x,
                  y: chartData.y,
                  marker: { color: "#22d3ee", size: 3, opacity: 0.6 },
                  hovertemplate:
                    "%{x}<br>Mediana: %{y:,.2f}% a.a.<extra></extra>",
                },
              ]}
              layout={{
                paper_bgcolor: "transparent",
                plot_bgcolor: "transparent",
                font: {
                  family: "Space Grotesk, Arial, Helvetica, sans-serif",
                  color: "#94a3b8",
                },
                margin: { l: 50, r: 20, t: 40, b: 40 },
                title: {
                  text: `Mediana das Taxas: ${modName}`,
                  font: { size: 15, color: "#f1f5f9", family: "Space Grotesk, Arial, Helvetica, sans-serif" },
                },
                xaxis: {
                  gridcolor: "rgba(148,163,184,0.07)",
                  showline: false,
                  title: "Período",
                },
                yaxis: {
                  gridcolor: "rgba(148,163,184,0.07)",
                  showline: false,
                  title: "Taxa (% a.a.)",
                },
                hoverlabel: {
                  bgcolor: "#1a1a2e",
                  bordercolor: "rgba(34,211,238,0.3)",
                  font: { color: "#f1f5f9", family: "Space Grotesk, Arial, Helvetica, sans-serif" },
                },
                autosize: true,
              }}
              config={{ displayModeBar: false, responsive: true }}
              useResizeHandler
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-text-muted">
            📊 {data?.rates?.length?.toLocaleString() ?? 0} observações
          </p>
        </>
      )}

      {!isLoading && chartData.x.length === 0 && (
        <div className="flex h-64 items-center justify-center text-text-muted">
          Nenhum dado encontrado para esta modalidade.
        </div>
      )}
    </>
  );
}
